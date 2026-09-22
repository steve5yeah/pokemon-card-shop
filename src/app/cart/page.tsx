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
        <div>
          <span className="ribbon cut-sm">CART</span>
          <h1 className="mt-2.5 text-[1.7rem] font-black tracking-tight text-ink-900">
            장바구니
          </h1>
        </div>
        {lines.length > 0 && (
          <form action={clearCartForm}>
            <button type="submit" className="btn btn-ghost btn-sm text-ink-500">
              전부 비우기
            </button>
          </form>
        )}
      </div>

      {error && (
        <p className="mt-6 rounded-lg border-2 border-poke-500 bg-poke-50 px-4 py-3 text-sm font-semibold text-poke-800">
          장바구니를 불러오지 못했습니다: {error.message}
        </p>
      )}

      {lines.length === 0 ? (
        <div className="mt-8 card border-dashed px-4 py-16 text-center">
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
          <div className="card px-3 sm:px-4">
            <CartTable lines={lines} />
          </div>

          {/* ── 금액 요약 ── */}
          <div className="card space-y-3 p-5 lg:sticky lg:top-24">
            <h2 className="text-[1.05rem] font-extrabold text-ink-900">
              결제 금액
            </h2>

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
              <p className="rounded-lg border-2 border-volt-500 bg-volt-50 px-3 py-2 text-[0.8rem] leading-relaxed font-semibold text-volt-900">
                {formatPrice(totals.freeShippingLeft)} 더 담으면 배송비가
                무료입니다. (
                {formatPrice(FREE_SHIPPING_OVER)} 이상)
              </p>
            )}

            <div className="card-dark flex items-baseline justify-between gap-2 px-4 py-3">
              <span className="text-sm font-extrabold text-white/70">합계</span>
              <span className="text-[1.4rem] font-black text-volt-300 tabular-nums">
                {formatPrice(totals.totalAmount)}
              </span>
            </div>

            <Link href="/checkout" className="btn btn-primary w-full py-3.5">
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
