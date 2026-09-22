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

export default function ProductCard({ product }: { product: ProductWithSet }) {
  const type = CARD_TYPES[product.card_type];
  const rarity = RARITIES[product.rarity];
  const image = cardImage(product);
  const soldOut = product.stock <= 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="poke-card card block overflow-hidden"
    >
      {/* ── 카드 그림 (타입 색 액자 + 홀로그램) ── */}
      <div
        className={`poke-art ${rarity.holo ? "poke-holo" : ""} m-2 aspect-[3/4] bg-gradient-to-br ${type.frame}`}
      >
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
            className={`object-contain p-3 ${soldOut ? "opacity-40 grayscale" : ""}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center opacity-20">
            <PokeballLogo size={56} />
          </div>
        )}

        {/* 희귀도 도장 — 왼쪽 위 */}
        <span
          className={`absolute left-1.5 top-1.5 rounded-md px-1.5 py-0.5 text-[0.6rem] font-bold leading-none shadow-sm ${rarity.badge}`}
        >
          {rarity.short}
        </span>

        {soldOut && (
          <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-ink-900/75 py-1 text-center text-xs font-bold text-white">
            품절
          </span>
        )}
      </div>

      {/* ── 카드 정보 ── */}
      <div className="px-3 pb-3.5">
        <div className="flex items-center gap-1.5">
          <span
            className={`rounded px-1.5 py-0.5 text-[0.6rem] font-bold leading-none ${type.badge}`}
          >
            {type.label}
          </span>
          {product.sets && (
            <span className="truncate text-[0.68rem] text-ink-400">
              {product.sets.name}
            </span>
          )}
        </div>

        <h3 className="mt-1.5 truncate text-[0.95rem] font-bold text-ink-900">
          {product.name}
        </h3>

        <p className="mt-1 font-bold text-poke-600">
          {formatPrice(product.price)}
        </p>
        <p
          className={`text-[0.7rem] ${
            soldOut
              ? "text-ink-400"
              : product.stock <= 3
                ? "font-semibold text-poke-500"
                : "text-ink-400"
          }`}
        >
          {stockLabel(product.stock)}
        </p>
      </div>
    </Link>
  );
}
