"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error?: string;
  notice?: string;
  /**
   * React 19는 액션이 끝나면 폼을 자동으로 비웁니다.
   * 오류가 났을 때 적어 둔 값이 날아가지 않도록 돌려줍니다. (비밀번호는 제외)
   */
  values?: { email?: string; nickname?: string };
};

/** Supabase가 돌려주는 영어 메시지를 한국어로 바꿔 줍니다. */
function toKorean(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "이메일 또는 비밀번호가 맞지 않습니다.";
  if (m.includes("email not confirmed"))
    return "메일함에서 가입 확인 링크를 먼저 눌러 주세요.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "이미 가입된 이메일입니다. 로그인해 주세요.";
  if (m.includes("password should be at least"))
    return "비밀번호가 너무 짧습니다.";
  if (m.includes("unable to validate email") || m.includes("invalid email"))
    return "이메일 형식이 올바르지 않습니다.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.";
  return `문제가 생겼습니다: ${message}`;
}

/** 메일 인증 링크가 돌아올 주소 */
async function siteOrigin(): Promise<string> {
  // 서버에서는 접두사 없는 이름을 그대로 읽을 수 있습니다.
  const configured = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured;
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") ? "http" : "https";
  return `${proto}://${host}`;
}

/** 열린 리다이렉트를 막기 위해 같은 사이트 내부 경로만 허용 */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

/* ------------------------------ 회원가입 ------------------------------ */

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const nickname = String(formData.get("nickname") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  const values = { email, nickname };

  if (!email || !nickname || !password) {
    return { error: "모든 항목을 입력해 주세요.", values };
  }
  if (nickname.length < 2 || nickname.length > 12) {
    return { error: "닉네임은 2~12자로 지어 주세요.", values };
  }
  if (password.length < 8) {
    return { error: "비밀번호는 8자 이상이어야 합니다.", values };
  }
  if (password !== passwordConfirm) {
    return { error: "비밀번호 확인이 일치하지 않습니다.", values };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // 이 닉네임은 데이터베이스의 handle_new_user() 트리거가 읽어
      // profiles 표에 한 줄을 자동으로 만들 때 씁니다.
      data: { nickname },
      emailRedirectTo: `${await siteOrigin()}/auth/callback`,
    },
  });

  if (error) return { error: toKorean(error.message), values };

  // 메일 인증이 켜져 있으면 세션 없이 user만 돌아옵니다.
  if (!data.session) {
    return {
      notice: `${email} 으로 확인 메일을 보냈어요. 메일의 링크를 누르면 가입이 끝납니다.`,
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

/* -------------------------------- 로그인 ------------------------------- */

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해 주세요.", values: { email } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: toKorean(error.message), values: { email } };

  revalidatePath("/", "layout");
  redirect(next);
}

/* ------------------------------- 로그아웃 ------------------------------ */

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
