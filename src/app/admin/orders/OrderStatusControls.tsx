"use client";

import { useState, useTransition } from "react";
import { ORDER_STATUSES, withRo, type OrderStatus } from "@/lib/orders";
import { cancelOrder, updateOrderStatus } from "../actions";

/** 배송 상태를 어느 단계로 보낼 수 있는지 */
const NEXT_STEPS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  paid: ["shipped"],
  shipped: ["done", "paid"],
  done: ["shipped"],
};

export default function OrderStatusControls({
  orderNo,
  status,
}: {
  orderNo: string;
  status: OrderStatus;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const steps = NEXT_STEPS[status] ?? [];
  const canCancel = status === "paid" || status === "shipped";

  function go(next: OrderStatus) {
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatus(orderNo, next);
      if (result.error) setError(result.error);
    });
  }

  function doCancel() {
    setError(null);
    setConfirming(false);
    startTransition(async () => {
      const result = await cancelOrder(orderNo);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((next) => (
        <button
          key={next}
          type="button"
          onClick={() => go(next)}
          disabled={pending}
          className="btn btn-outline btn-sm"
        >
          {withRo(ORDER_STATUSES[next].label)}
        </button>
      ))}

      {canCancel &&
        (confirming ? (
          <>
            <button
              type="button"
              onClick={doCancel}
              disabled={pending}
              className="btn btn-primary btn-sm"
            >
              정말 취소 (재고 되돌림)
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={pending}
              className="btn btn-ghost btn-sm"
            >
              그만
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={pending}
            className="btn btn-ghost btn-sm text-ink-400"
          >
            주문 취소
          </button>
        ))}

      {pending && <span className="text-xs text-ink-400">처리 중…</span>}
      {error && <p className="w-full text-xs text-red-700">{error}</p>}
    </div>
  );
}
