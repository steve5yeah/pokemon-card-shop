import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { isAdmin } from "@/lib/admin";
import PokeballLogo from "./PokeballLogo";
import MobileNav from "./MobileNav";

export default async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let nickname: string | null = null;
  let cartCount = 0;
  let admin = false;

  if (user) {
    // 프로필 · 장바구니 · 관리자 여부를 동시에 확인합니다 (하나씩 기다리지 않게).
    const [profileResult, cartResult, adminResult] = await Promise.all([
      supabase.from("profiles").select("nickname").eq("id", user.id).maybeSingle(),
      // 담은 카드 "종류" 수만 셉니다. head: true 는 데이터는 받지 않고 개수만 받는다는 뜻입니다.
      supabase
        .from("cart_items")
        .select("product_id", { count: "exact", head: true })
        .eq("user_id", user.id),
      isAdmin(),
    ]);

    nickname = profileResult.data?.nickname ?? null;
    cartCount = cartResult.count ?? 0;
    admin = adminResult;
  }

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-ink-200/60 bg-[#fbfbfd]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <PokeballLogo size={27} />
              <span className="text-[1.05rem] font-bold tracking-tight text-ink-900">
                포켓몬 카드샵
              </span>
            </Link>

            <nav className="hidden items-center gap-1 sm:flex">
              <Link href="/products" className="btn btn-ghost btn-sm">
                카드 둘러보기
              </Link>
              {user && (
                <Link href="/orders" className="btn btn-ghost btn-sm">
                  주문내역
                </Link>
              )}
              {admin && (
                <Link
                  href="/admin"
                  className="btn btn-sm bg-ink-900 text-volt-300 hover:bg-ink-800"
                >
                  관리자
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  href="/cart"
                  className="btn btn-outline btn-sm hidden sm:inline-flex"
                >
                  🛒 장바구니
                  {cartCount > 0 && (
                    <span className="rounded-full bg-poke-500 px-1.5 py-0.5 text-[0.65rem] font-bold leading-none text-white">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/mypage"
                  className="btn btn-ghost btn-sm max-w-[9rem] truncate"
                >
                  <span className="truncate font-semibold text-poke-700">
                    {nickname ?? "트레이너"}
                  </span>
                  <span className="text-ink-500">님</span>
                </Link>
                <form action={signOut} className="hidden sm:block">
                  <button type="submit" className="btn btn-outline btn-sm">
                    로그아웃
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost btn-sm">
                  로그인
                </Link>
                <Link href="/signup" className="btn btn-primary btn-sm">
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 좁은 화면에서는 아래쪽 탭으로 이동합니다 */}
      <MobileNav loggedIn={Boolean(user)} cartCount={cartCount} />
    </>
  );
}
