"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import PokeballLogo from "@/components/PokeballLogo";
import { cardImage } from "@/lib/pokemon";
import { CARD_TYPES, RARITIES, formatPrice } from "@/lib/products";
import type { CartLine } from "@/lib/cart";
import { removeFromCart, updateQuantity } from "./actions";

/**
 * 장바구니 목록.
 *
 * 수량을 바꾸거나 빼는 일은 모두 서버 액션(actions.ts)이 합니다.
 * useTransition 으로 "지금 서버가 처리 중"인 상태를 알 수 있어서,
 * 그동안 버튼을 잠그고 줄을 흐리게 만들어 두 번 눌리는 것을 막습니다.
 */
export default function CartTable({ lines }: { lines: CartLine[] }) {
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(productId: string, job: () => Promise<{ error?: string }>) {
    setBusyId(productId);
    setError(null);
    startTransition(async () => {
      const result = await job();
      setBusyId(null);
      setError(result.error ?? null);
    });
  }

  return (
    <div>
      {error && (
        <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <ul className="divide-y divide-ink-100">
        {lines.map((line) => {
          const type = CARD_TYPES[line.product.card_type];
          const rarity = RARITIES[line.product.rarity];
          const image = cardImage(line.product);
          const busy = pending && busyId === line.productId;
          const max = Math.min(line.product.stock, 99);

          return (
            <li
              key={line.productId}
              className={`flex gap-3 py-4 transition-opacity ${busy ? "opacity-40" : ""}`}
            >
              {/* 카드 그림 */}
              <Link
                href={`/products/${line.productId}`}
                className={`poke-art h-24 w-[4.5rem] shrink-0 bg-gradient-to-br ${type.frame}`}
              >
                {image ? (
                  <Image
                    src={image}
                    alt={line.product.name}
                    fill
                    sizes="72px"
                    className="object-contain p-1.5"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center opacity-20">
                    <PokeballLogo size={28} />
                  </div>
                )}
              </Link>

              {/* 이름 · 가격 · 수량 */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
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
                    </div>
                    <Link
                      href={`/products/${line.productId}`}
                      className="mt-1 block truncate font-bold text-ink-900 hover:underline"
                    >
                      {line.product.name}
                    </Link>
                    <p className="text-sm text-ink-500">
                      {formatPrice(line.product.price)} · 남은 수량{" "}
                      {line.product.stock}장
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      run(line.productId, () => removeFromCart(line.productId))
                    }
                    disabled={busy}
                    aria-label={`${line.product.name} 빼기`}
                    className="btn btn-ghost btn-sm shrink-0 text-ink-400"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-2.5 flex items-center justify-between gap-3">
                  {/* 수량 */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        run(line.productId, () =>
                          updateQuantity(line.productId, line.quantity - 1),
                        )
                      }
                      disabled={busy}
                      aria-label="수량 줄이기"
                      className="btn btn-outline btn-sm h-8 w-8 p-0 text-base"
                    >
                      −
                    </button>
                    <span className="w-9 text-center font-bold tabular-nums">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        run(line.productId, () =>
                          updateQuantity(line.productId, line.quantity + 1),
                        )
                      }
                      disabled={busy || line.quantity >= max}
                      aria-label="수량 늘리기"
                      className="btn btn-outline btn-sm h-8 w-8 p-0 text-base"
                    >
                      +
                    </button>
                  </div>

                  <p className="font-bold text-ink-900 tabular-nums">
                    {formatPrice(line.lineTotal)}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
