"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  loadTossPayments,
  type TossPaymentsWidgets,
} from "@tosspayments/tosspayments-sdk";
import { tossErrorMessage } from "@/lib/payments/errors";
import { formatPrice } from "@/lib/products";

/**
 * 토스 결제위젯.
 *
 * 금액(amount)과 주문명(orderName)은 서버가 데이터베이스에서 읽어 내려준 값입니다.
 * 이 화면이 스스로 계산하지 않습니다.
 *
 * 결제 흐름:
 *   loadTossPayments(공개키) → widgets({ customerKey })
 *   → setAmount() → renderPaymentMethods() + renderAgreement()
 *   → (결제하기 누르면) requestPayment()
 *
 * requestPayment 에 successUrl / failUrl 을 주면 "이동 방식"이 됩니다.
 * 결제창에서 인증이 끝나면 브라우저가 그 주소로 이동합니다.
 */
export default function PaymentWidget({
  orderNo,
  orderName,
  amount,
  customerKey,
  customerEmail,
  customerName,
}: {
  orderNo: string;
  orderName: string;
  amount: number;
  customerKey: string;
  customerEmail: string | null;
  customerName: string | null;
}) {
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);
  const startedRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 개발 모드에서는 이 효과가 두 번 실행됩니다.
    // 위젯을 두 번 그리면 토스가 오류를 내므로 한 번만 그리게 막습니다.
    if (startedRef.current) return;
    startedRef.current = true;

    // 브라우저에서는 NEXT_PUBLIC_ 이 붙은 이름만 읽을 수 있습니다.
    // (next.config.ts 가 TOSS_CLIENT_KEY 를 이 이름으로 옮겨 담아 줍니다)
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
    if (!clientKey) {
      setError(
        "결제 설정(TOSS_CLIENT_KEY)이 비어 있습니다. 환경 변수를 넣고 다시 배포해야 합니다.",
      );
      return;
    }

    (async () => {
      const tossPayments = await loadTossPayments(clientKey);
      const widgets = tossPayments.widgets({ customerKey });

      // 금액을 먼저 정해야 결제수단을 그릴 수 있습니다.
      await widgets.setAmount({ currency: "KRW", value: amount });

      await Promise.all([
        widgets.renderPaymentMethods({ selector: "#payment-method" }),
        widgets.renderAgreement({ selector: "#agreement" }),
      ]);

      widgetsRef.current = widgets;
      setReady(true);
    })().catch((cause: unknown) => {
      const code =
        typeof cause === "object" && cause && "code" in cause
          ? String((cause as { code: unknown }).code)
          : null;
      setError(tossErrorMessage(code));
    });
  }, [amount, customerKey]);

  async function handlePay() {
    const widgets = widgetsRef.current;
    if (!widgets) return;

    setPaying(true);
    setError(null);

    try {
      await widgets.requestPayment({
        orderId: orderNo,
        orderName,
        successUrl: `${window.location.origin}/api/payments/confirm`,
        failUrl: `${window.location.origin}/api/payments/fail`,
        customerEmail: customerEmail ?? undefined,
        customerName: customerName ?? undefined,
      });
      // 여기까지 오면 곧 결제창 또는 successUrl 로 이동합니다.
    } catch (cause: unknown) {
      /**
       * 결제창을 닫거나 약관에 동의하지 않은 경우처럼
       * **브라우저 안에서** 실패한 경우입니다. failUrl 로 가지 않습니다.
       * 화면에 그대로 머물러서 안내만 보여줍니다.
       * (여기서 페이지를 옮기면 장바구니부터 다시 해야 해서 최악입니다)
       */
      const code =
        typeof cause === "object" && cause && "code" in cause
          ? String((cause as { code: unknown }).code)
          : null;
      setError(tossErrorMessage(code));
      setPaying(false);
    }
  }

  return (
    <div>
      {/* 토스가 이 안에 결제수단 목록과 약관을 그려 넣습니다 */}
      <div id="payment-method" />
      <div id="agreement" />

      {!ready && !error && (
        <p className="py-10 text-center text-sm text-ink-500">
          결제 화면을 준비하는 중입니다…
        </p>
      )}

      {error && (
        <div className="mt-4 rounded-lg border-2 border-poke-500 bg-poke-50 px-4 py-3 text-sm font-semibold text-poke-800">
          <p>{error}</p>
          <Link href="/cart" className="mt-1.5 inline-block font-semibold underline">
            장바구니로 돌아가기 →
          </Link>
        </div>
      )}

      <button
        type="button"
        onClick={handlePay}
        disabled={!ready || paying}
        className="btn btn-primary mt-5 w-full py-3.5 text-base"
      >
        {paying ? "결제창을 여는 중…" : `${formatPrice(amount)} 결제하기`}
      </button>

      <p className="mt-3 text-center text-xs leading-relaxed text-ink-400">
        지금은 <b>테스트 모드</b>입니다. 결제창이 진짜로 뜨지만 실제로 돈은
        빠져나가지 않습니다.
      </p>
    </div>
  );
}
