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
      <Link
        href="/products"
        className="text-sm text-ink-500 hover:text-poke-600 hover:underline"
      >
        ← 카드 둘러보기
      </Link>

      <div className="mt-5 grid gap-8 sm:grid-cols-2 sm:gap-10">
        {/* ─────────── 왼쪽: 카드 그림 ─────────── */}
        <div className="poke-card card mx-auto w-full max-w-xs p-2.5 sm:mx-0">
          <div
            className={`poke-art ${rarity.holo ? "poke-holo" : ""} aspect-[3/4] bg-gradient-to-br ${type.frame}`}
          >
            {image ? (
              <Image
                src={image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 80vw, 320px"
                priority
                className={`object-contain p-5 ${soldOut ? "opacity-40 grayscale" : ""}`}
              />
            ) : (
              <div className="flex h-full items-center justify-center opacity-20">
                <PokeballLogo size={96} />
              </div>
            )}
            {soldOut && (
              <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-ink-900/75 py-1.5 text-center text-sm font-bold text-white">
                품절
              </span>
            )}
          </div>
        </div>

        {/* ─────────── 오른쪽: 카드 정보 ─────────── */}
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded-md px-2 py-0.5 text-[0.7rem] font-bold ${type.badge}`}
            >
              {type.label}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-[0.7rem] font-bold ${rarity.badge}`}
            >
              {rarity.label}
            </span>
            {product.sets && (
              <span className="chip py-0.5 text-[0.7rem]">
                {product.sets.name}
              </span>
            )}
          </div>

          <h1 className="mt-3 text-2xl font-bold leading-snug text-ink-900">
            {product.name}
          </h1>

          <p className="mt-4 text-3xl font-bold text-poke-600">
            {formatPrice(product.price)}
          </p>
          <p
            className={`mt-1 text-sm ${
              soldOut
                ? "text-ink-400"
                : product.stock <= 3
                  ? "font-semibold text-poke-500"
                  : "text-ink-500"
            }`}
          >
            {stockLabel(product.stock)}
          </p>

          {product.description && (
            <p className="mt-5 text-[0.95rem] leading-relaxed text-ink-700">
              {product.description}
            </p>
          )}

          {/* 장바구니 담기 */}
          <div className="mt-7">
            {soldOut ? (
              <button type="button" disabled className="btn btn-primary w-full py-3">
                품절된 카드입니다
              </button>
            ) : user ? (
              <AddToCartButton productId={product.id} stock={product.stock} />
            ) : (
              <div>
                <Link
                  href={`/login?next=/products/${product.id}`}
                  className="btn btn-primary w-full py-3"
                >
                  로그인하고 담기
                </Link>
                <p className="mt-2 text-center text-xs text-ink-400">
                  장바구니는 로그인해야 쓸 수 있습니다. 로그인하면 이 카드로
                  돌아옵니다.
                </p>
              </div>
            )}
          </div>

          {/* 카드 제원 */}
          <dl className="mt-8 divide-y divide-ink-100 border-t border-ink-100 text-sm">
            {[
              ["희귀도", rarity.label],
              ["타입", type.label],
              ["확장팩", product.sets?.name ?? "—"],
              ["도감번호", product.pokedex_no ? `No. ${product.pokedex_no}` : "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-2.5">
                <dt className="text-ink-500">{label}</dt>
                <dd className="font-medium text-ink-800">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
