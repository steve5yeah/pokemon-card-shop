"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { addToCart, type CartActionState } from "./actions";

const initialState: CartActionState = {};

/** 담기 버튼 — 누르는 동안 문구가 바뀌고 잠깁니다 */
function SubmitPart({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="btn btn-primary w-full py-3"
    >
      {pending ? "담는 중…" : "🛒 장바구니 담기"}
    </button>
  );
}

export default function AddToCartButton({
  productId,
  stock,
}: {
  productId: string;
  stock: number;
}) {
  const [state, formAction] = useActionState(addToCart, initialState);
  const [quantity, setQuantity] = useState(1);

  const max = Math.min(stock, 99);
  const soldOut = stock <= 0;

  return (
    <div>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="quantity" value={quantity} />

        {/* 수량 고르기 */}
        <div className="flex items-center justify-between rounded-xl border border-ink-200 bg-white px-3 py-2">
          <span className="text-sm text-ink-600">수량</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={soldOut || quantity <= 1}
              aria-label="수량 줄이기"
              className="btn btn-outline btn-sm h-8 w-8 p-0 text-base"
            >
              −
            </button>
            <span className="w-10 text-center font-bold tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(max, q + 1))}
              disabled={soldOut || quantity >= max}
              aria-label="수량 늘리기"
              className="btn btn-outline btn-sm h-8 w-8 p-0 text-base"
            >
              +
            </button>
          </div>
        </div>

        <SubmitPart disabled={soldOut} />
      </form>

      {state.error && (
        <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      {state.notice && (
        <div className="mt-2 rounded-xl bg-poke-50 px-3 py-2.5 text-sm text-poke-800">
          <p className="font-semibold">✅ {state.notice}</p>
          <Link
            href="/cart"
            className="mt-1 inline-block font-semibold underline"
          >
            장바구니 보기 →
          </Link>
        </div>
      )}
    </div>
  );
}
