"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, type AuthState } from "@/app/auth/actions";
import SubmitButton from "@/components/SubmitButton";

const initialState: AuthState = {};

export default function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const confirmFailed = searchParams.get("error") === "confirm";

  const [state, formAction] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      {confirmFailed && (
        <p className="rounded-xl bg-volt-50 px-3 py-2 text-sm text-volt-800">
          메일 확인 링크가 만료되었거나 잘못되었습니다. 다시 로그인해 보세요.
        </p>
      )}

      {next !== "/" && (
        <p className="rounded-xl bg-poke-50 px-3 py-2 text-sm text-poke-700">
          로그인이 필요한 화면입니다. 로그인하면 바로 돌아갑니다.
        </p>
      )}

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
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink-800">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="field"
        />
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <SubmitButton pendingText="로그인 중…">로그인</SubmitButton>
    </form>
  );
}
