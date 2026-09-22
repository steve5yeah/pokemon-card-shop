"use client";

import { useActionState } from "react";
import { signUp, type AuthState } from "@/app/auth/actions";
import SubmitButton from "@/components/SubmitButton";

const initialState: AuthState = {};

export default function SignupForm() {
  const [state, formAction] = useActionState(signUp, initialState);

  if (state.notice) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-4xl">📮</p>
        <p className="font-semibold text-ink-900">메일을 확인해 주세요</p>
        <p className="text-sm leading-relaxed text-ink-600">{state.notice}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-800">
          이메일
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email ?? ""}
          placeholder="trainer@example.com"
          className="field"
        />
      </div>

      <div>
        <label htmlFor="nickname" className="mb-1.5 block text-sm font-medium text-ink-800">
          닉네임
        </label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          required
          minLength={2}
          maxLength={12}
          defaultValue={state.values?.nickname ?? ""}
          placeholder="화면에 보일 이름 (2~12자)"
          className="field"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink-800">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="8자 이상"
          className="field"
        />
      </div>

      <div>
        <label htmlFor="passwordConfirm" className="mb-1.5 block text-sm font-medium text-ink-800">
          비밀번호 확인
        </label>
        <input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          required
          placeholder="한 번 더 입력"
          className="field"
        />
      </div>

      {state.error && (
        <p className="rounded-lg border-2 border-poke-500 bg-poke-50 px-3 py-2 text-sm font-semibold text-poke-800">
          {state.error}
        </p>
      )}

      <SubmitButton pendingText="등록 중…">트레이너 등록</SubmitButton>
    </form>
  );
}
