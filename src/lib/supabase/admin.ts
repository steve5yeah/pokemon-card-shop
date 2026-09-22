// 이 한 줄이 안전핀입니다.
// 브라우저에서 돌아가는 코드가 실수로 이 파일을 불러오면 빌드가 실패합니다.
import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * 서버 전용 Supabase 클라이언트 (관리자 권한)
 *
 * 왜 필요한가:
 *   결제 확정 함수 complete_order() 는 service_role(서버 전용 키)만 부를 수 있게
 *   잠가 두었습니다. 그러지 않으면 로그인한 사람이 브라우저에서 이 함수를 직접 불러
 *   "결제 안 하고 결제완료로 바꾸기"가 가능해집니다.
 *
 * 어디서 쓰나:
 *   src/lib/payments/confirm.ts (결제 승인 처리) 에서만 씁니다.
 *   화면을 그리거나 목록을 불러올 때는 절대 쓰지 마세요.
 *   이 키는 접근 제한(RLS)을 전부 무시하기 때문입니다.
 */
export function createAdminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url) throw new Error("SUPABASE_URL 이 설정되지 않았습니다.");
  if (!secretKey) {
    throw new Error(
      "SUPABASE_SECRET_KEY 가 설정되지 않았습니다. .env.local 을 확인해 주세요.",
    );
  }

  return createSupabaseClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
