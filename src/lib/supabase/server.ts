import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * 서버(서버 컴포넌트 · 서버 액션 · 라우트 핸들러)에서 쓰는 Supabase 클라이언트.
 * 로그인 세션은 쿠키에 담기므로, 요청마다 새로 만들어야 합니다.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // 서버 컴포넌트에서는 쿠키를 쓸 수 없습니다.
            // 세션 갱신은 middleware가 대신 해주므로 무시해도 됩니다.
          }
        },
      },
    },
  );
}
