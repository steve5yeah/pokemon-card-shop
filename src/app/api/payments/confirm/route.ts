import { NextResponse, type NextRequest } from "next/server";
import { confirmAndComplete } from "@/lib/payments/confirm";

/**
 * 토스 결제창에서 인증이 끝나면 브라우저가 여기로 옵니다 (GET 이동).
 *
 * 왜 페이지(page.tsx)가 아니라 라우트 핸들러인가:
 *   - 토스가 브라우저를 GET 으로 보내는 것이라 폼 제출이 아닙니다.
 *     서버 액션은 폼 제출로만 부를 수 있어서 착지점이 될 수 없습니다.
 *   - 처리한 뒤 다른 주소로 보내(redirect) 버리면, 사용자의 주소창에
 *     paymentKey 가 남지 않습니다. 새로고침해도 승인이 다시 일어나지 않습니다.
 *   - 고구마마켓의 src/app/auth/callback/route.ts 와 똑같은 구조입니다.
 *
 * 판단은 여기서 하지 않습니다. 전부 lib/payments/confirm.ts 안에 모여 있습니다.
 *
 * 로그인 검사를 하지 않는 이유:
 *   결제는 이미 인증이 끝난 상태입니다. 여기서 세션이 끊겼다고 돌려보내면
 *   돈은 묶이고 주문은 미완성으로 남습니다. 로그인 검사는 완료 화면에서 합니다.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;

  const outcome = await confirmAndComplete({
    paymentKey: searchParams.get("paymentKey"),
    orderId: searchParams.get("orderId"),
    amount: searchParams.get("amount"),
  });

  if (outcome.ok) {
    return NextResponse.redirect(
      `${origin}/orders/${encodeURIComponent(outcome.orderNo)}?paid=1`,
    );
  }

  const params = new URLSearchParams({ code: outcome.code });
  if (outcome.orderNo) params.set("orderNo", outcome.orderNo);
  return NextResponse.redirect(`${origin}/orders/fail?${params.toString()}`);
}
