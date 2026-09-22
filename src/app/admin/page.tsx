import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/products";
import { ORDER_STATUSES, formatDateTime, type OrderStatus } from "@/lib/orders";

export const metadata = { title: "관리자 — 포켓몬 카드샵" };

type RecentOrder = {
  order_no: string;
  status: OrderStatus;
  order_name: string;
  total_amount: number;
  created_at: string;
};

type LowStock = {
  id: string;
  name: string;
  stock: number;
  sold_count: number;
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [paidResult, pendingResult, recentResult, lowStockResult, productResult] =
    await Promise.all([
      // 결제까지 끝난 주문 (금액 합계를 내려고 total_amount 까지 받습니다)
      supabase
        .from("orders")
        .select("total_amount")
        .in("status", ["paid", "shipped", "done"]),
      // 아직 배송 안 나간 주문 개수
      supabase
        .from("orders")
        .select("order_no", { count: "exact", head: true })
        .eq("status", "paid"),
      supabase
        .from("orders")
        .select("order_no, status, order_name, total_amount, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      // 재고 3장 이하인 판매중 카드
      supabase
        .from("products")
        .select("id, name, stock, sold_count")
        .eq("is_active", true)
        .lte("stock", 3)
        .order("stock", { ascending: true })
        .limit(10),
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
    ]);

  const paidOrders = paidResult.data ?? [];
  const revenue = paidOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const toShip = pendingResult.count ?? 0;
  const recent = (recentResult.data ?? []) as RecentOrder[];
  const lowStock = (lowStockResult.data ?? []) as LowStock[];
  const activeProducts = productResult.count ?? 0;

  return (
    <div>
      <h1 className="text-[1.7rem] font-black tracking-tight text-ink-900">대시보드</h1>

      {/* ── 숫자 4칸 ── */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="card p-4">
          <p className="text-xs text-ink-500">결제된 주문</p>
          <p className="mt-1 text-xl font-bold text-ink-900">
            {paidOrders.length}건
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-ink-500">매출 합계</p>
          <p className="mt-1 text-xl font-bold text-poke-600">
            {formatPrice(revenue)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-ink-500">배송 준비</p>
          <p className="mt-1 text-xl font-bold text-ink-900">{toShip}건</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-ink-500">판매중 카드</p>
          <p className="mt-1 text-xl font-bold text-ink-900">
            {activeProducts}장
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2 lg:items-start">
        {/* ── 최근 주문 ── */}
        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold text-ink-900">최근 주문</h2>
            <Link href="/admin/orders" className="btn btn-ghost btn-sm">
              전체 보기
            </Link>
          </div>

          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-ink-500">아직 주문이 없습니다.</p>
          ) : (
            <ul className="mt-3 divide-y-2 divide-ink-100">
              {recent.map((order) => (
                <li key={order.order_no} className="py-2.5">
                  <Link
                    href={`/admin/orders/${order.order_no}`}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[0.6rem] font-bold leading-none ${ORDER_STATUSES[order.status].badge}`}
                        >
                          {ORDER_STATUSES[order.status].label}
                        </span>
                        <span className="truncate text-sm font-medium text-ink-900">
                          {order.order_name}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-ink-400">
                        {formatDateTime(order.created_at)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold tabular-nums">
                      {formatPrice(order.total_amount)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── 품절 임박 ── */}
        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold text-ink-900">품절 임박 (재고 3장 이하)</h2>
            <Link href="/admin/products" className="btn btn-ghost btn-sm">
              카드 관리
            </Link>
          </div>

          {lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-ink-500">
              재고가 넉넉합니다. 👍
            </p>
          ) : (
            <ul className="mt-3 divide-y-2 divide-ink-100">
              {lowStock.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="min-w-0 truncate text-sm font-medium text-ink-900 hover:underline"
                  >
                    {product.name}
                  </Link>
                  <span
                    className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${
                      product.stock === 0
                        ? "bg-red-100 text-red-700"
                        : "bg-volt-100 font-semibold text-volt-900"
                    }`}
                  >
                    {product.stock === 0 ? "품절" : product.stock + "장 남음"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
