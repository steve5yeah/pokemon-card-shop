import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PokeballLogo from "@/components/PokeballLogo";
import { createClient } from "@/lib/supabase/server";
import { cardImage } from "@/lib/pokemon";
import {
  CARD_TYPES,
  PRODUCT_SELECT,
  RARITIES,
  formatPrice,
  stockLabel,
  type ProductWithSet,
} from "@/lib/products";
import AddToCartButton from "../AddToCartButton";

/** 주소창에 아무 글자나 넣어도 데이터베이스에 이상한 값이 가지 않도록 먼저 걸러냅니다 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getProduct(id: string): Promise<ProductWithSet | null> {
  if (!UUID.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();
  return (data as unknown as ProductWithSet) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  return {
    title: product
      ? `${product.name} — 포켓몬 카드샵`
      : "카드를 찾을 수 없습니다 — 포켓몬 카드샵",
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  // 담기 버튼은 로그인한 사람에게만 보여주고, 아니면 로그인 안내를 보여줍니다.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const type = CARD_TYPES[product.card_type];
  const rarity = RARITIES[product.rarity];
  const image = cardImage(product);
  const soldOut = product.stock <= 0;

  return (
    <div>
      <Link href="/products" className="btn btn-ghost btn-sm -ml-2">
        ← 카드 둘러보기
      </Link>

      <div className="mt-4 grid gap-9 sm:grid-cols-2 sm:gap-10">
        {/* ═══════════ 왼쪽: 카드 ═══════════ */}
        <div className="relative mx-auto w-full max-w-[19rem] sm:mx-0">
          {/* 카드 뒤에 타입 색 빛을 퍼뜨려 진열된 것처럼 보이게 합니다 */}
          <div
            className={`pointer-events-none absolute inset-6 -z-10 rounded-full opacity-45 blur-3xl ${type.glow}`}
            aria-hidden
          />

          <div className="tcg shadow-[6px_6px_0_var(--color-ink-900)]">
            <div
              className={`tcg-in flex aspect-[5/7] flex-col bg-gradient-to-br ${type.frame}`}
            >
              {/* 카드 이름 줄 */}
              <div className="flex items-center gap-2 px-3 pt-3">
                <h2 className="min-w-0 flex-1 truncate text-[1.05rem] font-black leading-tight text-ink-900">
                  {product.name}
                </h2>
                <span
                  className={`h-5 w-5 shrink-0 rounded-full border-2 border-ink-900/60 ${type.dot}`}
                  aria-hidden
                />
              </div>

              {/* 그림칸 */}
              <div
                className={`relative mx-3 my-2 flex-1 overflow-hidden rounded-[0.3rem] border-2 border-ink-900/35 bg-white/40 ${
                  rarity.holo ? "holo" : ""
                }`}
              >
                {image ? (
                  <Image
                    src={image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 80vw, 320px"
                    priority
                    className={`object-contain p-4 ${
                      soldOut ? "opacity-40 grayscale" : ""
                    }`}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center opacity-20">
                    <PokeballLogo size={90} />
                  </div>
                )}

                {soldOut && (
                  <span className="absolute inset-x-0 top-1/2 z-[3] -translate-y-1/2 border-y-2 border-ink-900 bg-ink-900/85 py-1.5 text-center text-sm font-black tracking-[0.3em] text-white">
                    품절
                  </span>
                )}
              </div>

              {/* 확장팩 · 등급 줄 */}
              <div className="flex items-center justify-between gap-2 px-3 pb-3">
                <span className="min-w-0 truncate text-[0.72rem] font-bold text-ink-900/60">
                  {product.sets?.name ?? " "}
                </span>
                <span
                  className={`shrink-0 rounded border border-ink-900/40 px-1.5 py-0.5 text-[0.68rem] font-extrabold leading-none ${rarity.badge}`}
                >
                  {rarity.short}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ 오른쪽: 카드 정보 ═══════════ */}
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded border border-ink-900 px-2 py-0.5 text-[0.7rem] font-extrabold ${type.badge}`}
            >
              {type.label}
            </span>
            <span
              className={`rounded border border-ink-900 px-2 py-0.5 text-[0.7rem] font-extrabold ${rarity.badge}`}
            >
              {rarity.label}
            </span>
            {product.sets && (
              <span className="chip px-2 py-0.5 text-[0.7rem]">
                {product.sets.name}
              </span>
            )}
          </div>

          <h1 className="mt-3 text-[1.75rem] font-black leading-snug tracking-tight text-ink-900">
            {product.name}
          </h1>

          {/* 값 — 검정 상자에 담아 가장 먼저 눈에 들어오게 합니다 */}
          <div className="card-dark mt-4 flex items-end justify-between gap-3 px-4 py-3.5">
            <p className="text-[1.9rem] font-black leading-none text-volt-300">
              {formatPrice(product.price)}
            </p>
            <p
              className={`text-[0.8rem] font-bold ${
                soldOut
                  ? "text-white/45"
                  : product.stock <= 3
                    ? "text-poke-400"
                    : "text-white/65"
              }`}
            >
              {stockLabel(product.stock)}
            </p>
          </div>

          {product.description && (
            <p className="mt-5 text-[0.95rem] leading-relaxed text-ink-700">
              {product.description}
            </p>
          )}

          {/* 장바구니 담기 */}
          <div className="mt-6">
            {soldOut ? (
              <button
                type="button"
                disabled
                className="btn btn-primary w-full py-3.5"
              >
                품절된 카드입니다
              </button>
            ) : user ? (
              <AddToCartButton productId={product.id} stock={product.stock} />
            ) : (
              <div>
                <Link
                  href={`/login?next=/products/${product.id}`}
                  className="btn btn-primary w-full py-3.5"
                >
                  로그인하고 담기
                </Link>
                <p className="mt-2 text-center text-xs text-ink-500">
                  장바구니는 로그인해야 쓸 수 있습니다. 로그인하면 이 카드로
                  돌아옵니다.
                </p>
              </div>
            )}
          </div>

          {/* 카드 제원 */}
          <dl className="card mt-7 divide-y-2 divide-ink-100 px-4 text-sm">
            {[
              ["희귀도", rarity.label],
              ["타입", type.label],
              ["확장팩", product.sets?.name ?? "—"],
              ["도감번호", product.pokedex_no ? `No. ${product.pokedex_no}` : "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-2.5">
                <dt className="font-semibold text-ink-500">{label}</dt>
                <dd className="font-extrabold text-ink-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
