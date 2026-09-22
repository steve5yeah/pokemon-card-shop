/**
 * 환경 변수 읽기 · 확인
 *
 * 이름이 두 가지인 이유:
 *   - Vercel 과 .env.local 에는 접두사 없이 `SUPABASE_URL` 로 넣습니다.
 *   - 그런데 **브라우저**에서 도는 코드는 `NEXT_PUBLIC_` 이 붙은 이름만 읽을 수 있습니다.
 *     그래서 next.config.ts 가 빌드할 때 `NEXT_PUBLIC_SUPABASE_URL` 로 옮겨 담습니다.
 *
 * 아래에서 두 이름을 모두 확인하는 이유:
 *   `NEXT_PUBLIC_` 승격은 **빌드할 때** 일어납니다. 그래서 Vercel 에서 환경 변수를
 *   나중에 추가하면, 다시 배포하기 전까지 승격된 이름이 비어 있습니다.
 *   하지만 **서버**에서는 접두사 없는 원래 이름을 그대로 읽을 수 있습니다.
 *   둘 다 확인하면 다시 배포하지 않아도 서버 쪽은 바로 동작합니다.
 */

export type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

/**
 * 승격된 이름 → 원래 이름 순서로 고릅니다.
 *
 * ⚠️ 반드시 `process.env.NEXT_PUBLIC_XXX` 처럼 **점으로** 읽어서 넘겨야 합니다.
 *    `process.env[이름]` 처럼 대괄호로 읽으면 빌드할 때 값이 치환되지 않아
 *    브라우저에서는 항상 비어 있게 됩니다.
 */
function pick(
  fromPublic: string | undefined,
  fromPlain: string | undefined,
): string | undefined {
  return fromPublic || fromPlain;
}

export function supabasePublicEnv(): SupabasePublicEnv {
  const url = pick(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_URL,
  );
  const anonKey = pick(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.SUPABASE_ANON_KEY,
  );

  const missing: string[] = [];
  if (!url) missing.push("SUPABASE_URL");
  if (!anonKey) missing.push("SUPABASE_ANON_KEY");

  if (missing.length > 0) {
    throw new Error(
      [
        `환경 변수가 비어 있습니다: ${missing.join(", ")}`,
        "",
        "Vercel 에 배포한 경우:",
        "  1) Settings > Environment Variables 에 위 이름을 **정확히 그대로** 넣으세요.",
        "     (NEXT_PUBLIC_ 접두사를 붙이지 않습니다)",
        "  2) Environments 칸에 Production 이 체크돼 있어야 실서비스 주소에서 읽힙니다.",
        "  3) 넣은 뒤 다시 배포하세요.",
        "",
        "내 컴퓨터에서 돌리는 경우: 프로젝트 폴더의 .env.local 을 확인하세요.",
      ].join("\n"),
    );
  }

  return { url: url as string, anonKey: anonKey as string };
}

/**
 * 지금 서버가 받은 환경 변수를 **이름만** 정리해서 돌려줍니다.
 *
 * ⚠️ 값은 절대 내보내지 않습니다. 글자 수만 셉니다.
 *    (SUPABASE_URL 만 어느 프로젝트인지 알 수 있게 호스트 앞부분을 보여줍니다)
 *
 * 배포가 안 될 때 "이름을 잘못 적었나 / 아예 안 넣었나"를 바로 구분하려고 만들었습니다.
 */
export function envReport(): string {
  const rows = [
    [
      "SUPABASE_URL",
      pick(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_URL),
      true,
    ],
    [
      "SUPABASE_ANON_KEY",
      pick(
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        process.env.SUPABASE_ANON_KEY,
      ),
      false,
    ],
    [
      "TOSS_CLIENT_KEY",
      pick(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY, process.env.TOSS_CLIENT_KEY),
      false,
    ],
    ["TOSS_SECRET_KEY", process.env.TOSS_SECRET_KEY, false],
    ["SUPABASE_SECRET_KEY", process.env.SUPABASE_SECRET_KEY, false],
    [
      "SITE_URL",
      pick(process.env.NEXT_PUBLIC_SITE_URL, process.env.SITE_URL),
      false,
    ],
  ] as const;

  const lines = rows.map(([name, value, showHost]) => {
    if (!value) return `  없음  ${name}`;
    const detail = showHost
      ? `→ ${value.replace(/^https?:\/\//, "").slice(0, 26)}…`
      : `(${value.length}자)`;
    return `  있음  ${name} ${detail}`;
  });

  // 이름을 잘못 적었을 때 바로 눈에 보이도록, 실제로 들어온 이름 목록을 보여줍니다.
  let actual = "(확인할 수 없음)";
  try {
    const names = Object.keys(process.env)
      .filter((key) => /SUPABASE|TOSS|SITE_URL/i.test(key))
      .sort();
    actual = names.length > 0 ? names.join(", ") : "(하나도 없음)";
  } catch {
    // Edge 런타임에서는 목록을 훑을 수 없는 경우가 있습니다.
  }

  return [
    ...lines,
    "",
    "Vercel 에 실제로 들어온 이름들:",
    `  ${actual}`,
    "",
    `배포된 코드: ${process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "(로컬)"}`,
  ].join("\n");
}
