"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconBox,
  IconCards,
  IconCart,
  IconHome,
  IconUser,
} from "./Icons";

/** guest: true 면 로그인하지 않은 사람에게도 보여 줍니다 */
const ITEMS = [
  { href: "/", label: "홈", Icon: IconHome, guest: true },
  { href: "/products", label: "카드", Icon: IconCards, guest: true },
  { href: "/cart", label: "장바구니", Icon: IconCart, guest: false },
  { href: "/orders", label: "주문내역", Icon: IconBox, guest: false },
  { href: "/mypage", label: "내 정보", Icon: IconUser, guest: false },
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
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t-[3px] border-ink-900 bg-white sm:hidden">
      <ul className="mx-auto flex max-w-5xl">
        {items.map(({ href, label, Icon }) => {
          // 홈("/")은 주소가 정확히 같을 때만 활성 표시합니다.
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[0.68rem] font-bold ${
                  active ? "text-poke-600" : "text-ink-500"
                }`}
              >
                <span className="relative">
                  <Icon className="h-[1.35rem] w-[1.35rem]" />
                  {href === "/cart" && cartCount > 0 && (
                    <span className="absolute -right-2.5 -top-1.5 rounded-full border border-ink-900 bg-poke-500 px-1 text-[0.58rem] font-extrabold leading-tight text-white">
                      {cartCount}
                    </span>
                  )}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
