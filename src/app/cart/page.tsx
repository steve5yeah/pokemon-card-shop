import Link from "next/link";
import { redirect } from "next/navigation";
import PokeballLogo from "@/components/PokeballLogo";
import { createClient } from "@/lib/supabase/server";
import {
  CART_SELECT,
  FREE_SHIPPING_OVER,
  calcTotals,
  toCartLines,
  type CartRow,
} from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import CartTable from "./CartTable";
import { clearCartForm } from "./actions";

export const metadata = { title: "장바구니 — 포켓몬 카드샵" };

export default async function CartPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // middleware 가 이미 막아 주지만, 서버에서도 한 번 더 확인합니다 (이중 자물쇠).
  if (!user) redirect("/login?next=/cart");

  const { data, error } = await supabase
    .from("cart_items")
    .select(CART_SELECT)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const lines = toCartLines((data ?? []) as unknown as CartRow[]);
  const totals = calcTotals(lines);

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink-900">장바구니</h1>
        {lines.length > 0 && (
          <form action={clearCartForm}>
            <button type="submit" className="btn btn-ghost btn-sm text-ink-400">
              전부 비우기
            </button>
          </form>
        )}
      </div>

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          장바구니를 불러오지 못했습니다: {error.message}
        </p>
      )}

      {lines.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-ink-200 px-4 py-16 text-center">
          <div className="mx-auto w-fit opacity-20">
            <PokeballLogo size={64} />
          </div>
          <p className="mt-4 text-ink-600">장바구니가 비어 있습니다.</p>
          <Link href="/products" className="btn btn-primary mt-5">
            카드 둘러보기
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
          {/* ── 담은 카드 목록 ── */}
          <div className="card px-4">
            <CartTable lines={lines} />
          </div>

          {/* ── 금액 요약 ── */}
          <div className="card space-y-3 p-5 lg:sticky lg:top-20">
            <h2 className="font-bold text-ink-900">결제 금액</h2>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-600">
                  카드값 ({totals.kinds}종 {totals.pieces}장)
                </dt>
                <dd className="font-medium tabular-nums">
                  {formatPrice(totals.itemsAmount)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-600">배송비</dt>
                <dd className="font-medium tabular-nums">
                  {totals.shippingFee === 0 ? (
                    <span className="text-poke-600">무료</span>
                  ) : (
                    formatPrice(totals.shippingFee)
                  )}
                </dd>
              </div>
            </dl>

            {totals.freeShippingLeft > 0 && (
              <p className="rounded-xl bg-volt-50 px-3 py-2 text-[0.8rem] leading-relaxed text-volt-800">
                {formatPrice(totals.freeShippingLeft)} 더 담으면 배송비가
                무료입니다. (
                {formatPrice(FREE_SHIPPING_OVER)} 이상)
              </p>
            )}

            <div className="flex items-baseline justify-between border-t border-ink-100 pt-3">
              <span className="font-bold text-ink-900">합계</span>
              <span className="text-xl font-bold text-poke-600 tabular-nums">
                {formatPrice(totals.totalAmount)}
              </span>
            </div>

            <Link href="/checkout" className="btn btn-primary w-full py-3">
              주문하기
            </Link>

            <Link
              href="/products"
              className="btn btn-outline w-full"
            >
              카드 더 둘러보기
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
