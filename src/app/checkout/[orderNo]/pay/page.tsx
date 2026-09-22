import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/products";
import PaymentWidget from "./PaymentWidget";

export const metadata = { title: "결제 — 포켓몬 카드샵" };

export default async function PayPage({
  params,
}: {
  params: Promise<{ orderNo: string }>;
}) {
  const { orderNo } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/checkout/${orderNo}/pay`);

  /**
   * 접근 제한(RLS) 덕분에 **내 주문만** 조회됩니다.
   * 남의 주문번호를 주소창에 넣어도 0줄이 돌아와 404가 됩니다.
   */
  const { data: order } = await supabase
    .from("orders")
    .select("order_no, status, order_name, total_amount, receiver_name")
    .eq("order_no", orderNo)
    .maybeSingle();

  if (!order) notFound();

  // 이미 결제된 주문이면 결제 화면을 다시 보여주지 않습니다.
  if (order.status === "paid") redirect(`/orders/${order.order_no}`);

  if (order.status !== "pending") {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="text-4xl">🚫</p>
        <h1 className="mt-4 text-xl font-bold text-ink-900">
          결제할 수 없는 주문입니다
        </h1>
        <p className="mt-2 text-sm text-ink-600">
          이 주문은 이미 처리되었거나 취소되었습니다.
        </p>
        <Link href="/orders" className="btn btn-outline mt-6">
          주문 내역 보기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-ink-900">결제하기</h1>

      <dl className="card mt-5 space-y-2 p-4 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-500">주문번호</dt>
          <dd className="font-mono font-medium text-ink-800">{order.order_no}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-500">주문 내용</dt>
          <dd className="min-w-0 truncate font-medium text-ink-800">
            {order.order_name}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-500">받는 분</dt>
          <dd className="font-medium text-ink-800">{order.receiver_name}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t border-ink-100 pt-2">
          <dt className="font-bold text-ink-900">결제 금액</dt>
          <dd className="text-lg font-bold text-poke-600 tabular-nums">
            {formatPrice(order.total_amount)}
          </dd>
        </div>
      </dl>

      <div className="mt-6">
        <PaymentWidget
          orderNo={order.order_no}
          orderName={order.order_name}
          amount={order.total_amount}
          /* customerKey 는 사람마다 다른 고정 값이어야 합니다 (간편결제 기억용) */
          customerKey={user.id}
          customerEmail={user.email ?? null}
          customerName={order.receiver_name}
        />
      </div>
    </div>
  );
}
