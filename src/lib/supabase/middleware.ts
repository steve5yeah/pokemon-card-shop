import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { envReport, supabasePublicEnv } from "@/lib/env";

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
   * 환경 변수가 비어 있으면 무엇이 빠졌는지 **화면에 그대로 보여 줍니다.**
   *
   * 여기서 그냥 오류를 던지면 Vercel 이 "MIDDLEWARE_INVOCATION_FAILED" 라는
   * 정체불명의 500 화면만 띄웁니다. 로그를 열어 봐야 원인을 알 수 있어 답답합니다.
   * 그래서 읽을 수 있는 안내문을 직접 돌려주도록 했습니다.
   *
   * ⚠️ 이름과 글자 수만 보여 줍니다. 값은 절대 내보내지 않습니다.
   */
  let supabaseUrl: string;
  let supabaseAnonKey: string;
  try {
    const env = supabasePublicEnv();
    supabaseUrl = env.url;
    supabaseAnonKey = env.anonKey;
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    console.error(`[설정 오류] ${message}`);
    return new NextResponse(
      [
        "설정이 끝나지 않아 화면을 띄울 수 없습니다.",
        "",
        message,
        "",
        "지금 서버가 받은 환경 변수:",
        envReport(),
      ].join("\n"),
      {
        status: 500,
        headers: { "content-type": "text/plain; charset=utf-8" },
      },
    );
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
