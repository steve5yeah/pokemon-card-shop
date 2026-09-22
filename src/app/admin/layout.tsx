import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";

/**
 * 관리자 화면의 문지기.
 *
 * layout 은 그 아래 모든 화면보다 먼저 실행됩니다.
 * 그래서 이 파일 한 곳만 막으면 /admin 아래 전부가 막힙니다.
 *
 * 자물쇠는 3중입니다:
 *   1) middleware — 로그인 안 했으면 /admin 근처도 못 옴
 *   2) 이 layout — 로그인했지만 관리자가 아니면 홈으로
 *   3) 데이터베이스 접근 제한(RLS) — 화면을 뚫어도 상품을 고칠 수 없음
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdmin())) redirect("/");

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b-[3px] border-ink-900 pb-4">
        <span className="rounded-md bg-ink-900 px-2 py-1 text-[0.7rem] font-bold text-volt-300">
          관리자
        </span>
        <nav className="flex flex-wrap gap-1">
          <Link href="/admin" className="btn btn-ghost btn-sm">
            대시보드
          </Link>
          <Link href="/admin/products" className="btn btn-ghost btn-sm">
            카드 관리
          </Link>
          <Link href="/admin/orders" className="btn btn-ghost btn-sm">
            주문 관리
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
