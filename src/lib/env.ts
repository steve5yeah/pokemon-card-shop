/**
 * 환경 변수 확인
 *
 * next.config.ts 는 SUPABASE_URL 같은 값을 **빌드할 때** 코드에 박아 넣습니다.
 * 그래서 Vercel 에 환경 변수를 넣지 않은 상태로 배포하면 값이 빈 문자열이 되고,
 * 그 상태로 Supabase 에 접속하려 하면 "middleware 가 실패했다"는 500 오류만 뜹니다.
 * 무엇이 빠졌는지 알 수가 없어 답답합니다.
 *
 * 그래서 여기서 먼저 확인하고, 빠진 이름을 그대로 알려 줍니다.
 * 이 메시지는 Vercel 의 함수 로그(Logs 탭)에 찍힙니다.
 */

export type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

/**
 * 브라우저와 서버 양쪽에서 쓰는 Supabase 접속 정보.
 * 빠져 있으면 무엇이 빠졌는지 적어서 오류를 냅니다.
 */
export function supabasePublicEnv(): SupabasePublicEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const missing: string[] = [];
  if (!url) missing.push("SUPABASE_URL");
  if (!anonKey) missing.push("SUPABASE_ANON_KEY");

  if (missing.length > 0) {
    throw new Error(
      [
        `환경 변수가 비어 있습니다: ${missing.join(", ")}`,
        "",
        "Vercel 에 배포한 경우:",
        "  1) Settings > Environment Variables 에 위 이름을 그대로 넣었는지 확인하세요.",
        "     (NEXT_PUBLIC_ 접두사를 붙이지 않습니다 — next.config.ts 가 대신 옮겨 담습니다)",
        "  2) 값을 넣은 뒤 반드시 **다시 배포**하세요.",
        "     이 값들은 빌드할 때 코드에 박히므로, 배포를 다시 하지 않으면 반영되지 않습니다.",
        "",
        "내 컴퓨터에서 돌리는 경우: 프로젝트 폴더의 .env.local 을 확인하세요.",
      ].join("\n"),
    );
  }

  // 위에서 빠진 값이 있으면 오류를 던졌으므로, 여기까지 왔으면 둘 다 값이 있습니다.
  // TypeScript 는 그것을 알지 못하므로 한 번 더 확인해 줍니다.
  return { url: url as string, anonKey: anonKey as string };
}
