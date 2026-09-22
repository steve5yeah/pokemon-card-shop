import { createClient } from "@/lib/supabase/server";

/**
 * 지금 로그인한 사람이 관리자인지 확인합니다.
 *
 * 데이터베이스의 admins 표(관리자 이메일 명단)를 봅니다.
 * 표 자체도 접근 제한이 걸려 있어서, 관리자가 아니면 아무 줄도 보이지 않습니다.
 * 그래서 "한 줄이라도 보이면 관리자"가 성립합니다.
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return false;

  const { data } = await supabase
    .from("admins")
    .select("email")
    .eq("email", user.email)
    .maybeSingle();

  return Boolean(data);
}
