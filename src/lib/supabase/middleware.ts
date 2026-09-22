import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabasePublicEnv } from "@/lib/env";

/**
 * 로그인이 필요한 경로 (앞부분만 맞으면 보호)
 *
 * /api/payments 는 일부러 넣지 않습니다.
 * 결제가 끝나고 토스가 우리 주소로 돌아올 때 세션 쿠키가 끊겨 있을 수도 있는데,
 * 그때 로그인 페이지로 튕겨 버리면 이미 인증된 결제가 통째로 실패합니다.
 */
const PROTECTED_PATHS = ["/cart", "/checkout", "/orders", "/mypage", "/admin"];

/**
 * 모든 요청에서 세션 쿠키를 새로 고치고, 보호 경로는 로그인 페이지로 돌려보냅니다.
 * (토큰은 1시간마다 만료되므로 이 과정이 없으면 갑자기 로그아웃된 것처럼 보입니다.)
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  /**
   * 환경 변수가 비어 있으면 무엇이 빠졌는지 로그에 적고 멈춥니다.
   * 그러지 않으면 "middleware 가 실패했다"는 500 오류만 떠서 원인을 알 수 없습니다.
   * (Vercel 의 Logs 탭에서 이 메시지를 볼 수 있습니다)
   */
  let supabaseUrl: string;
  let supabaseAnonKey: string;
  try {
    const env = supabasePublicEnv();
    supabaseUrl = env.url;
    supabaseAnonKey = env.anonKey;
  } catch (cause) {
    console.error(
      `[설정 오류] ${cause instanceof Error ? cause.message : String(cause)}`,
    );
    throw cause;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // 이 호출이 세션을 갱신합니다. createServerClient와 이 줄 사이에 다른 코드를 넣지 마세요.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const needsLogin = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!user && needsLogin) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
