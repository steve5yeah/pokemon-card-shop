import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/products";
import {
  ORDER_SELECT,
  ORDER_STATUSES,
  formatDateTime,
  paymentMethodLabel,
  type OrderWithDetail,
} from "@/lib/orders";
import OrderStatusControls from "../OrderStatusControls";

export const metadata = { title: "주문 상세 (관리자) — 포켓몬 카드샵" };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNo: string }>;
}) {
  const { orderNo } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("order_no", orderNo)
    .maybeSingle();

  if (!data) notFound();
  const order = data as unknown as OrderWithDetail;

  const payment = Array.isArray(order.payments)
    ? (order.payments[0] ?? null)
    : order.payments;
  const badge = ORDER_STATUSES[order.status];

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/orders"
        className="text-sm text-ink-500 hover:text-poke-600 hover:underline"
      >
        ← 주문 관리
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-bold text-ink-900">주문 상세</h1>
        <span
          className={`rounded-md px-2 py-0.5 text-[0.7rem] font-bold ${badge.badge}`}
        >
          {badge.label}
        </span>
      </div>
      <p className="mt-1 font-mono text-sm text-ink-500">{order.order_no}</p>

      <div className="card mt-5 p-4">
        <OrderStatusControls orderNo={order.order_no} status={order.status} />
      </div>

      {/* 주문한 카드 */}
      <div className="card mt-4 px-4">
        <ul className="divide-y divide-ink-100">
          {order.order_items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-ink-900">
                  {item.product_name}
                </p>
                <p className="text-sm text-ink-500">
                  {formatPrice(item.unit_price)} × {item.quantity}장
                </p>
              </div>
              <p className="shrink-0 font-bold tabular-nums">
                {formatPrice(item.line_total)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <dl className="card mt-4 space-y-2 p-5 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-600">카드값</dt>
          <dd className="font-medium tabular-nums">
            {formatPrice(order.items_amount)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-600">배송비</dt>
          <dd className="font-medium tabular-nums">
            {formatPrice(order.shipping_fee)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-ink-100 pt-2.5">
          <dt className="font-bold text-ink-900">결제 금액</dt>
          <dd className="text-lg font-bold text-poke-600 tabular-nums">
            {formatPrice(order.total_amount)}
          </dd>
        </div>
      </dl>

      {payment && (
        <dl className="card mt-4 space-y-2 p-5 text-sm">
          <h2 className="mb-1 font-bold text-ink-900">결제 정보</h2>
          <div className="flex justify-between gap-3">
            <dt className="text-ink-500">결제수단</dt>
            <dd className="font-medium text-ink-800">
              {paymentMethodLabel(payment.method)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-ink-500">토스 상태</dt>
            <dd className="font-medium text-ink-800">{payment.status}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-ink-500">승인 시각</dt>
            <dd className="font-medium text-ink-800">
              {formatDateTime(payment.approved_at)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="shrink-0 text-ink-500">결제키</dt>
            <dd className="truncate font-mono text-xs text-ink-700">
              {payment.payment_key}
            </dd>
          </div>
          {payment.receipt_url && (
            <div className="flex justify-between gap-3">
              <dt className="text-ink-500">영수증</dt>
              <dd>
                <a
                  href={payment.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-poke-600 hover:underline"
                >
                  토스 영수증 열기 ↗
                </a>
              </dd>
            </div>
          )}
        </dl>
      )}

      {order.status === "failed" && (
        <dl className="card mt-4 space-y-2 p-5 text-sm">
          <h2 className="mb-1 font-bold text-ink-900">실패 사유</h2>
          <div className="flex justify-between gap-3">
            <dt className="text-ink-500">코드</dt>
            <dd className="font-mono text-ink-800">{order.fail_code ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="shrink-0 text-ink-500">원문</dt>
            <dd className="text-right text-ink-700">
              {order.fail_message || "—"}
            </dd>
          </div>
        </dl>
      )}

      <dl className="card mt-4 space-y-2 p-5 text-sm">
        <h2 className="mb-1 font-bold text-ink-900">배송지</h2>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-500">받는 분</dt>
          <dd className="font-medium text-ink-800">{order.receiver_name}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-500">연락처</dt>
          <dd className="font-medium text-ink-800">{order.receiver_phone}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="shrink-0 text-ink-500">주소</dt>
          <dd className="text-right font-medium text-ink-800">
            ({order.postcode}) {order.address1} {order.address2}
          </dd>
        </div>
        {order.memo && (
          <div className="flex justify-between gap-3">
            <dt className="shrink-0 text-ink-500">요청사항</dt>
            <dd className="text-right text-ink-800">{order.memo}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
