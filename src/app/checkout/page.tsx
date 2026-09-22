import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  CART_SELECT,
  FREE_SHIPPING_OVER,
  calcTotals,
  toCartLines,
  type CartRow,
} from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import ShippingForm from "./ShippingForm";

export const metadata = { title: "주문서 — 포켓몬 카드샵" };

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/checkout");

  const [cartResult, profileResult] = await Promise.all([
    supabase
      .from("cart_items")
      .select(CART_SELECT)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("profiles")
      .select("nickname, phone, postcode, address1, address2")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  const lines = toCartLines((cartResult.data ?? []) as unknown as CartRow[]);

  // 장바구니가 비어 있으면 주문할 게 없습니다.
  if (lines.length === 0) redirect("/cart");

  const totals = calcTotals(lines);
  const profile = profileResult.data;

  // 재고가 모자란 카드가 있으면 미리 알려 줍니다.
  // (실제 판단은 주문을 만들 때 데이터베이스가 다시 합니다)
  const shortages = lines.filter((line) => line.product.stock < line.quantity);

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900">주문서</h1>
      <p className="mt-1.5 text-sm text-ink-600">
        배송지를 확인하고 결제 화면으로 넘어갑니다.
      </p>

      {shortages.length > 0 && (
        <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-semibold">재고가 모자란 카드가 있습니다</p>
          <ul className="mt-1 list-inside list-disc">
            {shortages.map((line) => (
              <li key={line.productId}>
                {line.product.name} — 담은 수량 {line.quantity}장 / 남은 수량{" "}
                {line.product.stock}장
              </li>
            ))}
          </ul>
          <Link href="/cart" className="mt-2 inline-block font-semibold underline">
            장바구니에서 수량 고치기 →
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        {/* ── 배송지 입력 ── */}
        <div className="card p-5">
          <h2 className="mb-4 font-bold text-ink-900">배송지</h2>
          <ShippingForm
            defaults={{
              receiver_name: profile?.nickname ?? "",
              receiver_phone: profile?.phone ?? "",
              postcode: profile?.postcode ?? "",
              address1: profile?.address1 ?? "",
              address2: profile?.address2 ?? "",
              memo: "",
            }}
          />
        </div>

        {/* ── 주문 내용 · 금액 ── */}
        <div className="card space-y-3 p-5 lg:sticky lg:top-20">
          <h2 className="font-bold text-ink-900">주문 내용</h2>

          <ul className="space-y-2 text-sm">
            {lines.map((line) => (
              <li key={line.productId} className="flex justify-between gap-3">
                <span className="min-w-0 truncate text-ink-700">
                  {line.product.name}{" "}
                  <span className="text-ink-400">× {line.quantity}</span>
                </span>
                <span className="shrink-0 font-medium tabular-nums">
                  {formatPrice(line.lineTotal)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="space-y-2 border-t border-ink-100 pt-3 text-sm">
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
              무료입니다. ({formatPrice(FREE_SHIPPING_OVER)} 이상)
            </p>
          )}

          <div className="flex items-baseline justify-between border-t border-ink-100 pt-3">
            <span className="font-bold text-ink-900">결제 금액</span>
            <span className="text-xl font-bold text-poke-600 tabular-nums">
              {formatPrice(totals.totalAmount)}
            </span>
          </div>

          <p className="text-[0.75rem] leading-relaxed text-ink-400">
            이 금액은 화면에 보여주기 위한 것입니다. 실제 결제 금액은 주문을
            만들 때 서버가 다시 계산합니다.
          </p>

          <Link href="/cart" className="btn btn-outline w-full">
            장바구니로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
