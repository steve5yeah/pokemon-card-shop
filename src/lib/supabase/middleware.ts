import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    },
  );

  // 이 호출이 세션을 갱신합니다. createServerClient와 이 줄 사이에 다른 코드를 넣지 마세요.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const needsLogin = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (!user && needsLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
