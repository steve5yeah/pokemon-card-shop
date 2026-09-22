import Link from "next/link";
import { redirect } from "next/navigation";
import PokeballLogo from "@/components/PokeballLogo";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/products";
import { ORDER_STATUSES, formatDateTime, type OrderStatus } from "@/lib/orders";

export const metadata = { title: "주문 내역 — 포켓몬 카드샵" };

type OrderRow = {
  order_no: string;
  status: OrderStatus;
  order_name: string;
  total_amount: number;
  created_at: string;
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ all?: string }>;
}) {
  const { all } = await searchParams;
  const showAll = all === "1";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/orders");

  // 접근 제한(RLS)이 내 주문만 돌려줍니다.
  let query = supabase
    .from("orders")
    .select("order_no, status, order_name, total_amount, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  // 기본은 결제까지 끝난 주문만 보여줍니다.
  // 결제 대기 · 실패 주문은 "전부 보기"를 눌렀을 때만 나옵니다.
  if (!showAll) {
    query = query.in("status", ["paid", "shipped", "done", "cancelled"]);
  }

  const { data, error } = await query;
  const orders = (data ?? []) as OrderRow[];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink-900">주문 내역</h1>
        <Link
          href={showAll ? "/orders" : "/orders?all=1"}
          className={`chip btn-sm ${showAll ? "chip-on" : ""}`}
        >
          결제 대기 · 실패도 보기
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          주문 내역을 불러오지 못했습니다: {error.message}
        </p>
      )}

      {!error && orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-ink-200 px-4 py-16 text-center">
          <div className="mx-auto w-fit opacity-20">
            <PokeballLogo size={64} />
          </div>
          <p className="mt-4 text-ink-600">
            {showAll ? "주문이 없습니다." : "결제한 주문이 없습니다."}
          </p>
          <Link href="/products" className="btn btn-primary mt-5">
            카드 둘러보기
          </Link>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {orders.map((order) => {
            const status = ORDER_STATUSES[order.status];
            return (
              <li key={order.order_no}>
                <Link
                  href={`/orders/${order.order_no}`}
                  className="card poke-card flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[0.7rem] font-bold ${status.badge}`}
                      >
                        {status.label}
                      </span>
                      <span className="font-mono text-xs text-ink-400">
                        {order.order_no}
                      </span>
                    </div>
                    <p className="mt-1.5 truncate font-bold text-ink-900">
                      {order.order_name}
                    </p>
                    <p className="text-sm text-ink-500">
                      {formatDateTime(order.created_at)}
                    </p>
                  </div>
                  <p className="shrink-0 text-lg font-bold text-ink-900 tabular-nums">
                    {formatPrice(order.total_amount)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
