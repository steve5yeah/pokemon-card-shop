import type { NextConfig } from "next";

/**
 * 환경 변수 이름 정리
 *
 * Vercel에는 접두사 없이 SUPABASE_URL / SUPABASE_ANON_KEY / SITE_URL /
 * TOSS_CLIENT_KEY 로 넣어 둡니다.
 * 그런데 브라우저에서 돌아가는 코드(결제 위젯, 사진 올리기 등)는
 * NEXT_PUBLIC_ 이 붙은 이름만 읽을 수 있습니다. 그래서 여기서 옮겨 담아 줍니다.
 *
 * ⚠️ TOSS_SECRET_KEY 는 절대로 아래 env 항목에 넣지 마세요.
 *    env 에 적으면 Next.js가 빌드할 때 그 값을 브라우저 코드 안에 그대로
 *    박아 넣기 때문에, 누구나 개발자도구로 시크릿 키를 볼 수 있게 됩니다.
 *    시크릿 키는 서버에서만 process.env.TOSS_SECRET_KEY 로 읽습니다.
 */
const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const siteUrl = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
const tossClientKey =
  process.env.TOSS_CLIENT_KEY ?? process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? "";

const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
    NEXT_PUBLIC_SITE_URL: siteUrl,
    NEXT_PUBLIC_TOSS_CLIENT_KEY: tossClientKey,
    // TOSS_SECRET_KEY 는 여기에 넣지 않습니다. (위 설명 참고)
  },
  images: {
    // 카드 그림은 두 곳에서 옵니다.
    //  1) PokeAPI 의 포켓몬 공식 일러스트 (GitHub 에 올려둔 그림 파일)
    //  2) 관리자가 직접 올린 사진 (Supabase Storage)
    // 외부 주소를 next/image 로 쓰려면 이렇게 허용 목록에 넣어야 합니다.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/PokeAPI/sprites/**",
      },
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
