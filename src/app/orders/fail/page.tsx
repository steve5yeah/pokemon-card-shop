import Link from "next/link";
import { tossErrorMessage } from "@/lib/payments/errors";

export const metadata = { title: "결제 실패 — 포켓몬 카드샵" };

/**
 * 결제가 실패했을 때 안내하는 화면.
 *
 * 토스가 URL 로 보내 준 message 는 쓰지 않습니다. 주소창 값이라 누구나 고칠 수
 * 있기 때문입니다. code 만 받아서 우리 문구 표(lib/payments/errors.ts)를 거칩니다.
 */
export default async function OrderFailPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; orderNo?: string }>;
}) {
  const { code, orderNo } = await searchParams;

  return (
    <div className="mx-auto max-w-md text-center">
      <p className="text-5xl">😢</p>
      <h1 className="mt-4 text-xl font-bold text-ink-900">
        결제가 완료되지 않았습니다
      </h1>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-700">
        {tossErrorMessage(code)}
      </p>

      {orderNo && (
        <p className="mt-4 text-sm text-ink-500">
          주문번호 <span className="font-mono text-ink-700">{orderNo}</span>
        </p>
      )}

      <div className="mt-7 flex flex-wrap justify-center gap-2">
        <Link href="/cart" className="btn btn-primary">
          장바구니로 돌아가기
        </Link>
        <Link href="/orders" className="btn btn-outline">
          주문 내역 보기
        </Link>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-ink-400">
        결제가 승인되지 않았으므로 돈은 빠져나가지 않았습니다.
        <br />
        장바구니는 그대로 있으니 다시 주문하실 수 있습니다.
      </p>
    </div>
  );
}
