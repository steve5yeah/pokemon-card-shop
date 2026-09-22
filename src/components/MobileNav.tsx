"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** guest: true 면 로그인하지 않은 사람에게도 보여 줍니다 */
const ITEMS = [
  { href: "/", label: "홈", icon: "🏠", guest: true },
  { href: "/products", label: "카드", icon: "🃏", guest: true },
  { href: "/cart", label: "장바구니", icon: "🛒", guest: false },
  { href: "/orders", label: "주문내역", icon: "📦", guest: false },
  { href: "/mypage", label: "내 정보", icon: "⚡", guest: false },
];

/** 좁은 화면(휴대폰)에서 화면 아래에 붙는 이동 막대 */
export default function MobileNav({
  loggedIn,
  cartCount,
}: {
  loggedIn: boolean;
  cartCount: number;
}) {
  const pathname = usePathname();

  // 로그인 전에는 홈 · 카드만, 로그인하면 전부 보여 줍니다.
  const items = loggedIn ? ITEMS : ITEMS.filter((item) => item.guest);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-ink-200/70 bg-[#fbfbfd]/95 backdrop-blur-md sm:hidden">
      <ul className="mx-auto flex max-w-5xl">
        {items.map((item) => {
          // 홈("/")은 주소가 정확히 같을 때만 활성 표시합니다.
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[0.7rem] ${
                  active ? "font-bold text-poke-700" : "text-ink-500"
                }`}
              >
                <span className="relative text-base leading-none">
                  {item.icon}
                  {item.href === "/cart" && cartCount > 0 && (
                    <span className="absolute -right-2.5 -top-1 rounded-full bg-poke-500 px-1 text-[0.6rem] font-bold leading-tight text-white">
                      {cartCount}
                    </span>
                  )}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
