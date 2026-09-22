import Link from "next/link";
import SignupForm from "./SignupForm";

export const metadata = { title: "회원가입 — 포켓몬 카드샵" };

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold text-ink-900">트레이너 등록하기</h1>
      <p className="mt-2 text-sm text-ink-600">
        이메일만 있으면 1분이면 됩니다.
      </p>

      <div className="card mt-7 p-6">
        <SignupForm />
      </div>

      <p className="mt-5 text-center text-sm text-ink-600">
        이미 계정이 있나요?{" "}
        <Link href="/login" className="font-semibold text-poke-600 hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
