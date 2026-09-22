"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import PokeballLogo from "@/components/PokeballLogo";
import { cardImage } from "@/lib/pokemon";
import {
  CARD_TYPES,
  RARITIES,
  formatPrice,
  type ProductWithSet,
} from "@/lib/products";
import { toggleActive, updateStock } from "../actions";

/**
 * 카드 관리 목록의 한 줄.
 *
 * 재고는 여기서 바로 고칠 수 있게 했습니다 (목록에서 자주 하는 일이라서).
 * 저장은 서버 액션이 하고, 처리 중에는 줄을 흐리게 만들어 두 번 눌리는 것을 막습니다.
 */
export default function AdminProductRow({
  product,
}: {
  product: ProductWithSet;
}) {
  const [pending, startTransition] = useTransition();
  const [stock, setStock] = useState(product.stock);
  const [error, setError] = useState<string | null>(null);

  const type = CARD_TYPES[product.card_type];
  const rarity = RARITIES[product.rarity];
  const image = cardImage(product);
  const dirty = stock !== product.stock;

  function saveStock() {
    setError(null);
    startTransition(async () => {
      const result = await updateStock(product.id, stock);
      if (result.error) {
        setError(result.error);
        setStock(product.stock);
      }
    });
  }

  function flipActive() {
    setError(null);
    startTransition(async () => {
      const result = await toggleActive(product.id, !product.is_active);
      if (result.error) setError(result.error);
    });
  }

  return (
    <li
      className={`flex flex-wrap items-center gap-3 py-3.5 transition-opacity ${pending ? "opacity-40" : ""}`}
    >
      {/* 그림 */}
      <div className="poke-art h-16 w-12 shrink-0 bg-ink-50">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="48px"
            className={`object-contain p-0.5 ${product.is_active ? "" : "opacity-40 grayscale"}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center opacity-20">
            <PokeballLogo size={20} />
          </div>
        )}
      </div>

      {/* 이름 · 배지 */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded px-1.5 py-0.5 text-[0.6rem] font-bold leading-none ${type.badge}`}
          >
            {type.label}
          </span>
          <span
            className={`rounded px-1.5 py-0.5 text-[0.6rem] font-bold leading-none ${rarity.badge}`}
          >
            {rarity.short}
          </span>
          {!product.is_active && (
            <span className="rounded bg-ink-200 px-1.5 py-0.5 text-[0.6rem] font-bold leading-none text-ink-700">
              숨김
            </span>
          )}
        </div>
        <Link
          href={`/admin/products/${product.id}/edit`}
          className="mt-1 block truncate font-bold text-ink-900 hover:underline"
        >
          {product.name}
        </Link>
        <p className="text-xs text-ink-500">
          {formatPrice(product.price)}
          {product.sets ? " · " + product.sets.name : ""} · 판매 {product.sold_count}장
        </p>
      </div>

      {/* 재고 바로 고치기 */}
      <div className="flex items-center gap-1.5">
        <label className="text-xs text-ink-500" htmlFor={`stock-${product.id}`}>
          재고
        </label>
        <input
          id={`stock-${product.id}`}
          type="number"
          min={0}
          value={stock}
          onChange={(event) => setStock(Number(event.target.value))}
          disabled={pending}
          className="field w-20 py-1.5 text-center text-sm"
        />
        {dirty && (
          <button
            type="button"
            onClick={saveStock}
            disabled={pending}
            className="btn btn-primary btn-sm"
          >
            저장
          </button>
        )}
      </div>

      {/* 숨기기 / 보이기 */}
      <button
        type="button"
        onClick={flipActive}
        disabled={pending}
        className="btn btn-outline btn-sm"
      >
        {product.is_active ? "숨기기" : "보이기"}
      </button>

      {error && (
        <p className="w-full text-xs text-red-700">{error}</p>
      )}
    </li>
  );
}
