import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { cancelPayment, confirmPayment } from "./toss";

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  돈을 지키는 곳                                                ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * 토스 결제창에서 인증이 끝나면 브라우저가 우리 주소로 돌아옵니다.
 *   /api/payments/confirm?paymentKey=...&orderId=...&amount=...
 *
 * 이때 amount 는 **주소창에 그대로 보이는 값**입니다. 누구나 고칠 수 있습니다.
 * 그래서 이 값을 승인 요청에 절대 쓰지 않고, 우리 데이터베이스의 금액과 대조만 합니다.
 *
 * 순서:
 *   1) 빠진 값이 있으면 중단
 *   2) 주문을 찾는다 (없으면 중단)
 *   3) 이미 결제된 주문이면 승인을 부르지 않고 성공 처리 (새로고침 대비)
 *   4) 주소창 금액 ≠ 데이터베이스 금액 → 승인을 부르지 않고 실패 처리
 *   5) 토스 승인 호출 (금액은 데이터베이스 값을 보낸다)
 *   6) 응답 금액도 한 번 더 대조
 *   7) complete_order() 로 결제완료 + 재고 차감 + 장바구니 비우기 (한 트랜잭션)
 *   8) 재고가 모자라 실패하면 → 토스 결제취소로 자동 환불
 */

export type ConfirmOutcome =
  | { ok: true; orderNo: string }
  | { ok: false; code: string; orderNo: string | null };

export async function confirmAndComplete(input: {
  paymentKey: string | null;
  orderId: string | null;
  amount: string | null;
}): Promise<ConfirmOutcome> {
  const { paymentKey, orderId } = input;
  const urlAmount = Number(input.amount);

  // ── 1) 빠진 값 확인 ──
  if (!paymentKey || !orderId || !Number.isFinite(urlAmount)) {
    return { ok: false, code: "MISSING_PARAMS", orderNo: orderId ?? null };
  }

  // 서버 전용 키로 만든 클라이언트입니다.
  // 결제 확정 함수는 이 권한으로만 부를 수 있습니다.
  const admin = createAdminClient();

  // ── 2) 주문 찾기 ──
  const { data: order, error: findError } = await admin
    .from("orders")
    .select("order_no, status, total_amount")
    .eq("order_no", orderId)
    .maybeSingle();

  if (findError || !order) {
    return { ok: false, code: "ORDER_NOT_FOUND", orderNo: orderId };
  }

  // ── 3) 이미 결제된 주문 → 승인을 부르지 않는다 ──
  // 성공 화면을 새로고침하거나 뒤로 갔다 와도 결제가 두 번 되지 않습니다.
  if (order.status === "paid") {
    return { ok: true, orderNo: order.order_no };
  }

  if (order.status !== "pending") {
    return { ok: false, code: "NOT_PAYABLE", orderNo: order.order_no };
  }

  // ── 4) 금액 대조 — 다르면 승인 호출 자체를 하지 않는다 ──
  // 승인을 부르지 않으면 돈은 빠져나가지 않습니다. 가장 강한 방어입니다.
  if (urlAmount !== order.total_amount) {
    console.error(
      `[결제 중단] 금액 불일치 order_no=${order.order_no} 주문=${order.total_amount} 요청=${urlAmount}`,
    );
    await admin.rpc("fail_order", {
      p_order_no: order.order_no,
      p_code: "AMOUNT_MISMATCH",
      p_message: `주문 ${order.total_amount}원 / 요청 ${urlAmount}원`,
    });
    return { ok: false, code: "AMOUNT_MISMATCH", orderNo: order.order_no };
  }

  // ── 5) 토스 승인 (금액은 데이터베이스 값을 보낸다) ──
  const result = await confirmPayment({
    paymentKey,
    orderId: order.order_no,
    amount: order.total_amount,
  });

  if (!result.ok) {
    // 토스가 "이미 처리된 결제"라고 하면 에러가 아니라 성공으로 봅니다.
    if (result.error.code === "ALREADY_PROCESSED_PAYMENT") {
      return { ok: true, orderNo: order.order_no };
    }
    await admin.rpc("fail_order", {
      p_order_no: order.order_no,
      p_code: result.error.code,
      p_message: result.error.message,
    });
    return { ok: false, code: result.error.code, orderNo: order.order_no };
  }

  const payment = result.data;

  // ── 6) 응답 금액도 한 번 더 대조 ──
  if (payment.totalAmount !== order.total_amount) {
    console.error(
      `[결제 취소] 승인 응답 금액 불일치 order_no=${order.order_no} 주문=${order.total_amount} 승인=${payment.totalAmount}`,
    );
    await cancelPayment({
      paymentKey,
      cancelReason: "승인 금액이 주문 금액과 다름",
    });
    await admin.rpc("fail_order", {
      p_order_no: order.order_no,
      p_code: "AMOUNT_MISMATCH",
      p_message: `주문 ${order.total_amount}원 / 승인 ${payment.totalAmount}원`,
    });
    return { ok: false, code: "AMOUNT_MISMATCH", orderNo: order.order_no };
  }

  // ── 7) 결제완료 + 재고 차감 + 장바구니 비우기 (데이터베이스가 한 번에 처리) ──
  const { error: completeError } = await admin.rpc("complete_order", {
    p_order_no: order.order_no,
    p_payment_key: payment.paymentKey,
    p_amount: order.total_amount,
    p_method: payment.method ?? null,
    p_status: payment.status,
    p_approved_at: payment.approvedAt ?? null,
    p_receipt_url: payment.receipt?.url ?? null,
    p_raw: payment as unknown as Record<string, unknown>,
  });

  if (completeError) {
    // ── 8) 돈은 빠졌는데 재고가 모자란 경우 → 자동 환불 ──
    console.error(
      `[결제 확정 실패] order_no=${order.order_no} ${completeError.message}`,
    );
    const isStock = completeError.message.includes("재고");

    await cancelPayment({
      paymentKey,
      cancelReason: isStock ? "재고 부족" : "주문 처리 실패",
    });
    await admin.rpc("fail_order", {
      p_order_no: order.order_no,
      p_code: isStock ? "STOCK_SHORTAGE" : "SERVER_ERROR",
      p_message: completeError.message,
    });

    return {
      ok: false,
      code: isStock ? "STOCK_SHORTAGE" : "SERVER_ERROR",
      orderNo: order.order_no,
    };
  }

  return { ok: true, orderNo: order.order_no };
}

/** 토스가 failUrl 로 보내 준 실패를 주문에 기록합니다 */
export async function recordFailure(input: {
  orderId: string | null;
  code: string | null;
  message: string | null;
}): Promise<string | null> {
  if (!input.orderId) return null;

  const admin = createAdminClient();
  // 원문 메시지는 데이터베이스에만 남깁니다. 화면에는 우리 문구만 보여줍니다.
  await admin.rpc("fail_order", {
    p_order_no: input.orderId,
    p_code: input.code ?? "UNKNOWN",
    p_message: input.message ?? "",
  });
  return input.orderId;
}
