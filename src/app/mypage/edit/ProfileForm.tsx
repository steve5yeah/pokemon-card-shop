"use client";

import { useActionState } from "react";
import SubmitButton from "@/components/SubmitButton";
import { updateProfile, type ProfileState } from "@/app/mypage/actions";

const initialState: ProfileState = {};

export default function ProfileForm({
  defaults,
}: {
  defaults: {
    nickname: string;
    phone: string;
    postcode: string;
    address1: string;
    address2: string;
  };
}) {
  const [state, formAction] = useActionState(updateProfile, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="nickname"
          className="mb-1.5 block text-sm font-medium text-ink-800"
        >
          닉네임
        </label>
        <input
          id="nickname"
          name="nickname"
          required
          minLength={2}
          maxLength={12}
          defaultValue={defaults.nickname}
          className="field"
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="mb-1.5 block text-sm font-medium text-ink-800"
        >
          연락처
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          maxLength={20}
          defaultValue={defaults.phone}
          placeholder="010-1234-5678"
          className="field"
        />
      </div>

      <div>
        <label
          htmlFor="postcode"
          className="mb-1.5 block text-sm font-medium text-ink-800"
        >
          우편번호
        </label>
        <input
          id="postcode"
          name="postcode"
          maxLength={10}
          defaultValue={defaults.postcode}
          placeholder="06236"
          className="field sm:max-w-[10rem]"
        />
      </div>

      <div>
        <label
          htmlFor="address1"
          className="mb-1.5 block text-sm font-medium text-ink-800"
        >
          주소
        </label>
        <input
          id="address1"
          name="address1"
          defaultValue={defaults.address1}
          placeholder="서울특별시 강남구 테헤란로 1"
          className="field"
        />
      </div>

      <div>
        <label
          htmlFor="address2"
          className="mb-1.5 block text-sm font-medium text-ink-800"
        >
          상세 주소
        </label>
        <input
          id="address2"
          name="address2"
          defaultValue={defaults.address2}
          placeholder="101동 1001호"
          className="field"
        />
      </div>

      <p className="text-xs text-ink-400">
        여기 적어 둔 배송지는 주문할 때 자동으로 채워집니다.
      </p>

      {state.error && (
        <p className="rounded-lg border-2 border-poke-500 bg-poke-50 px-3 py-2 text-sm font-semibold text-poke-800">
          {state.error}
        </p>
      )}
      {state.notice && (
        <p className="rounded-lg border-2 border-poke-300 bg-poke-50 px-3 py-2 text-sm text-poke-800">
          ✅ {state.notice}
        </p>
      )}

      <SubmitButton pendingText="저장 중…">저장하기</SubmitButton>
    </form>
  );
}
