import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = { title: "로그인 — 포켓몬 카드샵" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm">
      <span className="ribbon cut-sm">LOGIN</span>
      <h1 className="mt-2.5 text-[1.7rem] font-black tracking-tight text-ink-900">다시 오셨네요</h1>
      <p className="mt-2 text-sm text-ink-600">
        포켓몬 카드샵 계정으로 로그인하세요.
      </p>

      <div className="card mt-7 p-6">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>

      <p className="mt-5 text-center text-sm text-ink-600">
        아직 계정이 없나요?{" "}
        <Link href="/signup" className="font-semibold text-poke-600 hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  );
}
