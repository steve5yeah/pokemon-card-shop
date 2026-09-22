import Image from "next/image";
import Link from "next/link";
import PokeballLogo from "@/components/PokeballLogo";
import { cardImage } from "@/lib/pokemon";
import {
  CARD_TYPES,
  RARITIES,
  formatPrice,
  stockLabel,
  type ProductWithSet,
} from "@/lib/products";

/**
 * 카드 한 장.
 *
 * 진짜 포켓몬 카드의 구조를 그대로 흉내 냈습니다.
 *   ┌─ 금색 테두리 (.tcg) ─────────┐
 *   │ 카드 이름            ● 타입   │
 *   │ ┌─ 그림칸 ─────────────────┐ │
 *   │ │      (포켓몬 일러스트)     │ │
 *   │ └─────────────────────────┘ │
 *   │ 확장팩 이름              등급 │
 *   └─────────────────────────────┘
 *        가격 / 재고   ← 테두리 바깥
 */
export default function ProductCard({ product }: { product: ProductWithSet }) {
  const type = CARD_TYPES[product.card_type];
  const rarity = RARITIES[product.rarity];
  const image = cardImage(product);
  const soldOut = product.stock <= 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="poke-card block rounded-[0.65rem]"
      title={product.name}
    >
      {/* ─────────── 금색 테두리 ─────────── */}
      <div className="tcg">
        <div
          className={`tcg-in flex aspect-[5/7] flex-col bg-gradient-to-br ${type.frame}`}
        >
          {/* 카드 이름 줄 */}
          <div className="flex items-center gap-1 px-1.5 pt-1.5">
            <h3 className="min-w-0 flex-1 truncate text-[0.74rem] font-extrabold leading-tight text-ink-900">
              {product.name}
            </h3>
            <span
              className={`h-3 w-3 shrink-0 rounded-full border border-ink-900/50 ${type.dot}`}
              aria-hidden
            />
          </div>

          {/* 그림칸 — 실제 카드도 그림 둘레에 얇은 선이 한 겹 더 있습니다 */}
          <div
            className={`relative mx-1.5 my-1 flex-1 overflow-hidden rounded-[0.2rem] border border-ink-900/35 bg-white/40 ${
              rarity.holo ? "holo" : ""
            }`}
          >
            {image ? (
              <Image
                src={image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
                className={`object-contain p-1.5 ${
                  soldOut ? "opacity-40 grayscale" : ""
                }`}
              />
            ) : (
              <div className="flex h-full items-center justify-center opacity-25">
                <PokeballLogo size={44} />
              </div>
            )}

            {soldOut && (
              <span className="absolute inset-x-0 top-1/2 z-[3] -translate-y-1/2 border-y-2 border-ink-900 bg-ink-900/85 py-1 text-center text-[0.7rem] font-extrabold tracking-widest text-white">
                품절
              </span>
            )}
          </div>

          {/* 확장팩 · 등급 줄 */}
          <div className="flex items-center justify-between gap-1 px-1.5 pb-1.5">
            <span className="min-w-0 truncate text-[0.58rem] font-bold text-ink-900/60">
              {product.sets?.name ?? " "}
            </span>
            <span
              className={`shrink-0 rounded border border-ink-900/40 px-1 py-px text-[0.56rem] font-extrabold leading-none ${rarity.badge}`}
            >
              {rarity.short}
            </span>
          </div>
        </div>
      </div>

      {/* ─────────── 테두리 바깥: 값 ─────────── */}
      <div className="mt-2 px-0.5">
        <p className="text-[1.05rem] font-extrabold leading-none text-ink-900">
          {formatPrice(product.price)}
        </p>
        <p
          className={`mt-1 text-[0.7rem] font-bold ${
            soldOut
              ? "text-ink-400"
              : product.stock <= 3
                ? "text-poke-600"
                : "text-ink-500"
          }`}
        >
          {stockLabel(product.stock)}
        </p>
      </div>
    </Link>
  );
}
