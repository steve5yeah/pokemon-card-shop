import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import PokeballLogo from "@/components/PokeballLogo";

// 한글이 또렷하게 나오도록 본문 글꼴을 지정합니다.
// next/font가 빌드할 때 글꼴 파일을 받아 우리 서버에서 함께 내보내므로,
// 외부 사이트를 거치지 않아 화면이 늦게 뜨거나 글자가 깜빡이지 않습니다.
//
// 800·900 을 함께 받아 오는 이유: 제목을 아주 굵게(font-extrabold / font-black)
// 쓰는데, 그 굵기를 안 받아 오면 브라우저가 700을 억지로 늘려 뭉개집니다.
const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
  display: "swap",
  variable: "--font-noto-kr",
});

export const metadata: Metadata = {
  title: "포켓몬 카드샵 — 포켓몬 트레이딩 카드 전문",
  description:
    "리자몽부터 뮤츠까지. 희귀도별로 골라 담는 포켓몬 트레이딩 카드 쇼핑몰",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={notoSansKr.variable}>
      <body className="flex min-h-dvh flex-col antialiased">
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:py-12">
          {children}
        </main>

        {/* 아래쪽 여백(pb-24)은 휴대폰 탭 막대에 가려지지 않도록 둡니다 */}
        <footer className="night night-stars mt-12 border-t-[3px] border-ink-900 py-10 pb-28 sm:pb-10">
          <div className="relative mx-auto max-w-5xl px-4 text-center">
            <p className="flex items-center justify-center gap-2 text-base font-black text-white">
              <PokeballLogo size={20} />
              포켓몬 카드샵
            </p>

            <p className="mx-auto mt-3 max-w-lg text-xs leading-relaxed text-white/55">
              Next.js · Supabase · 토스페이먼츠로 만든{" "}
              <b className="text-white/80">학습용 연습 프로젝트</b>입니다.
              실제로 카드를 판매하지 않습니다.
              <br />
              포켓몬 및 포켓몬 캐릭터는 Nintendo / Creatures / GAME FREAK 의
              상표이며, 카드 그림은{" "}
              <a
                href="https://pokeapi.co"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-volt-300 underline underline-offset-2"
              >
                PokeAPI
              </a>
              를 이용했습니다.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
