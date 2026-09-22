import { NextResponse, type NextRequest } from "next/server";
import { recordFailure } from "@/lib/payments/confirm";

/**
 * 카드사 · 은행 단계에서 결제가 실패하면 토스가 여기로 보냅니다.
 *   /api/payments/fail?code=...&message=...&orderId=...
 *
 * 주문을 '결제 실패'로 적어 둔 뒤 안내 화면으로 보냅니다.
 * message 원문은 데이터베이스에만 남기고, 화면에는 우리 문구만 보여줍니다.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;

  const code = searchParams.get("code");
  const orderNo = await recordFailure({
    orderId: searchParams.get("orderId"),
    code,
    message: searchParams.get("message"),
  });

  const params = new URLSearchParams({ code: code ?? "UNKNOWN" });
  if (orderNo) params.set("orderNo", orderNo);
  return NextResponse.redirect(`${origin}/orders/fail?${params.toString()}`);
}
