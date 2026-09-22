"use client";

import { useActionState } from "react";
import SubmitButton from "@/components/SubmitButton";
import { createOrder, type CheckoutState } from "./actions";

const initialState: CheckoutState = {};

export default function ShippingForm({
  defaults,
}: {
  defaults: {
    receiver_name: string;
    receiver_phone: string;
    postcode: string;
    address1: string;
    address2: string;
    memo: string;
  };
}) {
  const [state, formAction] = useActionState(createOrder, initialState);
  const v = state.values ?? defaults;

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="receiver_name" className="mb-1.5 block text-sm font-medium text-ink-800">
            받는 분
          </label>
          <input
            id="receiver_name"
            name="receiver_name"
            required
            minLength={2}
            maxLength={20}
            defaultValue={v.receiver_name ?? ""}
            placeholder="홍길동"
            className="field"
          />
        </div>
        <div>
          <label htmlFor="receiver_phone" className="mb-1.5 block text-sm font-medium text-ink-800">
            연락처
          </label>
          <input
            id="receiver_phone"
            name="receiver_phone"
            type="tel"
            required
            maxLength={20}
            defaultValue={v.receiver_phone ?? ""}
            placeholder="010-1234-5678"
            className="field"
          />
        </div>
      </div>

      <div>
        <label htmlFor="postcode" className="mb-1.5 block text-sm font-medium text-ink-800">
          우편번호
        </label>
        <input
          id="postcode"
          name="postcode"
          required
          maxLength={10}
          defaultValue={v.postcode ?? ""}
          placeholder="06236"
          className="field sm:max-w-[10rem]"
        />
      </div>

      <div>
        <label htmlFor="address1" className="mb-1.5 block text-sm font-medium text-ink-800">
          주소
        </label>
        <input
          id="address1"
          name="address1"
          required
          defaultValue={v.address1 ?? ""}
          placeholder="서울특별시 강남구 테헤란로 1"
          className="field"
        />
      </div>

      <div>
        <label htmlFor="address2" className="mb-1.5 block text-sm font-medium text-ink-800">
          상세 주소 <span className="text-ink-400">(선택)</span>
        </label>
        <input
          id="address2"
          name="address2"
          defaultValue={v.address2 ?? ""}
          placeholder="101동 1001호"
          className="field"
        />
      </div>

      <div>
        <label htmlFor="memo" className="mb-1.5 block text-sm font-medium text-ink-800">
          배송 요청사항 <span className="text-ink-400">(선택)</span>
        </label>
        <input
          id="memo"
          name="memo"
          maxLength={100}
          defaultValue={v.memo ?? ""}
          placeholder="부재 시 경비실에 맡겨 주세요"
          className="field"
        />
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <SubmitButton pendingText="주문서 만드는 중…">결제 화면으로</SubmitButton>
    </form>
  );
}
