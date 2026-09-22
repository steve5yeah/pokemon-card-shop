import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/products";
import {
  ORDER_STATUSES,
  formatDateTime,
  isOrderStatus,
  type OrderStatus,
} from "@/lib/orders";
import OrderStatusControls from "./OrderStatusControls";

export const metadata = { title: "주문 관리 — 포켓몬 카드샵" };

type Row = {
  order_no: string;
  status: OrderStatus;
  order_name: string;
  total_amount: number;
  receiver_name: string;
  created_at: string;
  paid_at: string | null;
};

/** 목록 위에 두는 상태 필터 칩 */
const FILTERS: { key: string; label: string }[] = [
  { key: "", label: "전체" },
  { key: "paid", label: "결제 완료" },
  { key: "shipped", label: "배송 중" },
  { key: "done", label: "배송 완료" },
  { key: "cancelled", label: "주문 취소" },
  { key: "failed", label: "결제 실패" },
  { key: "pending", label: "결제 대기" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const raw = await searchParams;
  const status = isOrderStatus(raw.status) ? raw.status : "";

  const supabase = await createClient();

  // 관리자는 모든 사람의 주문을 봅니다 (orders 표에 관리자용 SELECT 정책이 있습니다).
  let query = supabase
    .from("orders")
    .select(
      "order_no, status, order_name, total_amount, receiver_name, created_at, paid_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  const orders = (data ?? []) as Row[];

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900">주문 관리</h1>
      <p className="mt-1.5 text-sm text-ink-600">{orders.length}건</p>

      <div className="no-scrollbar mt-4 -my-1 overflow-x-auto py-1">
        <div className="flex w-max gap-1.5">
          {FILTERS.map((filter) => (
            <Link
              key={filter.key}
              href={
                filter.key ? `/admin/orders?status=${filter.key}` : "/admin/orders"
              }
              className={`chip ${status === filter.key ? "chip-on" : ""}`}
            >
              {filter.label}
            </Link>
          ))}
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          주문을 불러오지 못했습니다: {error.message}
        </p>
      )}

      {orders.length === 0 ? (
        <p className="mt-10 text-center text-sm text-ink-500">
          해당하는 주문이 없습니다.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {orders.map((order) => {
            const badge = ORDER_STATUSES[order.status];
            return (
              <li key={order.order_no} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[0.7rem] font-bold ${badge.badge}`}
                      >
                        {badge.label}
                      </span>
                      <Link
                        href={`/admin/orders/${order.order_no}`}
                        className="font-mono text-xs text-ink-500 hover:underline"
                      >
                        {order.order_no}
                      </Link>
                    </div>
                    <p className="mt-1.5 truncate font-bold text-ink-900">
                      {order.order_name}
                    </p>
                    <p className="text-sm text-ink-500">
                      {order.receiver_name} · 주문 {formatDateTime(order.created_at)}
                      {order.paid_at ? " · 결제 " + formatDateTime(order.paid_at) : ""}
                    </p>
                  </div>
                  <p className="shrink-0 text-lg font-bold text-ink-900 tabular-nums">
                    {formatPrice(order.total_amount)}
                  </p>
                </div>

                <div className="mt-3 border-t border-ink-100 pt-3">
                  <OrderStatusControls
                    orderNo={order.order_no}
                    status={order.status}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
