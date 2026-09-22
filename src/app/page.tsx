import Image from "next/image";
import Link from "next/link";
import PokeballLogo from "@/components/PokeballLogo";
import { IconBolt, IconCards, IconShield, IconTruck } from "@/components/Icons";
import { createClient } from "@/lib/supabase/server";
import { cardImage } from "@/lib/pokemon";
import {
  CARD_TYPES,
  CARD_TYPE_KEYS,
  PRODUCT_SELECT,
  RARITIES,
  formatPrice,
  type ProductWithSet,
} from "@/lib/products";
import ProductCard from "./products/ProductCard";

/** 첫 화면 칩으로 내보낼 희귀도 (귀한 것부터) */
const SHOWCASE_RARITIES = ["ur", "special_art_rare", "art_rare"] as const;

export default async function HomePage() {
  const supabase = await createClient();

  const [userResult, topResult, newResult] = await Promise.all([
    supabase.auth.getUser(),
    // 값이 높은 귀한 카드 — 앞 3장은 첫 화면에 크게 띄웁니다
    supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_active", true)
      .gt("stock", 0)
      .order("price", { ascending: false })
      .limit(7),
    // 부담 없는 값의 카드
    supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_active", true)
      .gt("stock", 0)
      .order("price", { ascending: true })
      .limit(4),
  ]);

  const user = userResult.data.user;
  const pricey = (topResult.data ?? []) as unknown as ProductWithSet[];
  const cheap = (newResult.data ?? []) as unknown as ProductWithSet[];

  const heroCards = pricey.slice(0, 3);
  const topCards = pricey.slice(3, 7);
  // 첫 화면 카드 더미 위에 띄울 대표 카드 (가운데 것, 없으면 첫 장)
  const featured = heroCards[1] ?? heroCards[0] ?? null;

  return (
    <div className="space-y-14 sm:space-y-20">
      {/* ══════════════ 어두운 쇼케이스 ══════════════ */}
      <section className="night night-stars cut-both -mt-4 rounded-[1.4rem] border-2 border-ink-900 px-5 py-9 shadow-[5px_5px_0_var(--color-ink-900)] sm:-mt-6 sm:px-10 sm:py-12">
        <div className="relative grid items-center gap-10 sm:grid-cols-[1.05fr_1fr]">
          {/* ── 글 ── */}
          <div className="text-center sm:text-left">
            <span className="ribbon cut-sm">
              <IconBolt className="h-3 w-3" />
              POKÉMON TRADING CARD
            </span>

            {/* 강조할 말 뒤에 노란 블록을 깔아 시선을 한 곳에 모읍니다
                (형광펜으로 그은 것처럼 보이게 하는 방법입니다) */}
            <h1 className="mt-4 text-[2rem] font-black leading-[1.15] tracking-tight sm:text-[3.05rem]">
              {/* 좁은 화면에서는 한 줄이 넘쳐 "오늘 뽑은 그 / 카드," 처럼
                  어색하게 끊기므로, 끊길 자리를 직접 정해 둡니다 */}
              오늘 뽑은
              <br className="sm:hidden" /> 그 카드,
              <br />
              <span className="mt-2 inline-block rounded-xl bg-volt-400 px-3.5 pb-1.5 pt-1 text-ink-950 shadow-[0_8px_24px_rgba(255,203,5,0.35)]">
                여기 다 있다
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-sm text-[0.95rem] leading-relaxed text-white/65 sm:mx-0">
              리자몽부터 뮤츠까지. 희귀도·타입·확장팩으로 골라 담고
              한 번에 주문하세요.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
              <Link href="/products" className="btn btn-primary px-6 py-3">
                카드 둘러보기
              </Link>
              {user ? (
                <Link href="/cart" className="btn btn-volt px-6 py-3">
                  장바구니 보기
                </Link>
              ) : (
                <Link href="/signup" className="btn btn-volt px-6 py-3">
                  회원가입하고 시작
                </Link>
              )}
            </div>

            {/* 짧은 신뢰 문구 세 개 */}
            <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[0.78rem] font-semibold text-white/60 sm:justify-start">
              <li className="flex items-center gap-1.5">
                <IconTruck className="h-4 w-4 text-volt-300" />
                5만원 이상 무료배송
              </li>
              <li className="flex items-center gap-1.5">
                <IconShield className="h-4 w-4 text-volt-300" />
                토스 안전결제
              </li>
              <li className="flex items-center gap-1.5">
                <IconCards className="h-4 w-4 text-volt-300" />
                희귀도 7등급
              </li>
            </ul>
          </div>

          {/**
           * ── 기울여 펼쳐 놓은 카드 3장 ──
           *
           * 가운데 카드만 **흐름 안에** 두고 양옆 두 장은 띄웁니다(absolute).
           * 그래야 이 칸의 높이가 가운데 카드 높이를 따라가서, 화면 폭이
           * 달라져도 아래 정보표가 카드에 딱 붙습니다.
           * (높이를 숫자로 고정하면 좁은 화면에서 카드와 정보표가 멀어집니다)
           */}
          {heroCards.length > 0 && (
            <div className="relative pt-5">
              {/* 왼쪽 · 오른쪽 카드 */}
              {heroCards[0] && (
                <div className="absolute left-0 top-11 z-10 w-[40%] -rotate-[15deg] sm:w-[42%]">
                  <HeroCard product={heroCards[0]} />
                </div>
              )}
              {heroCards[2] && (
                <div className="absolute right-0 top-11 z-10 w-[40%] rotate-[15deg] sm:w-[42%]">
                  <HeroCard product={heroCards[2]} />
                </div>
              )}

              {/* 가운데 카드 — 이 카드가 칸의 높이를 정합니다 */}
              <div className="relative z-20 mx-auto w-[46%] rotate-[2deg] sm:w-[48%]">
                <HeroCard product={heroCards[1] ?? heroCards[0]} priority />
              </div>

              {/* 카드 아래에 살짝 걸쳐 떠 있는 작은 정보표 */}
              {/* 배경 흐리기(backdrop-blur)는 쓰지 않습니다.
                  기기·브라우저에 따라 아예 안 그려지는 경우가 있어서,
                  불투명한 남색으로 채워 어디서나 똑같이 보이게 합니다. */}
              {featured && (
                <div className="absolute -bottom-4 left-0 z-30 flex max-w-[72%] items-center gap-2.5 rounded-2xl border-2 border-white/20 bg-ink-950 px-3 py-2 shadow-[0_12px_30px_rgba(0,0,0,0.7)]">
                  <span
                    className={`rounded-md border border-ink-900/40 px-1.5 py-1 text-[0.6rem] font-extrabold leading-none ${
                      RARITIES[featured.rarity].badge
                    }`}
                  >
                    {RARITIES[featured.rarity].short}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[0.74rem] font-extrabold leading-tight text-white">
                      {featured.name}
                    </p>
                    <p className="text-[0.72rem] font-bold leading-tight text-volt-300">
                      {formatPrice(featured.price)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════ 타입으로 골라보기 ══════════════ */}
      <section>
        <SectionHead
          ribbon="TYPE"
          title="타입으로 골라보기"
          desc="누르면 그 타입 카드만 모아서 보여줍니다."
        />

        <ul className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1.5 sm:flex-wrap">
          {CARD_TYPE_KEYS.map((key) => (
            <li key={key}>
              <Link href={`/products?type=${key}`} className="chip gap-1.5">
                <span
                  className={`h-2.5 w-2.5 rounded-full border border-ink-900/40 ${CARD_TYPES[key].dot}`}
                />
                {CARD_TYPES[key].label}
              </Link>
            </li>
          ))}
        </ul>

        <ul className="no-scrollbar mt-2.5 flex gap-2 overflow-x-auto pb-1.5 sm:flex-wrap">
          {SHOWCASE_RARITIES.map((key) => (
            <li key={key}>
              <Link href={`/products?rarity=${key}`} className="chip">
                {RARITIES[key].label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/products?price=~10000" className="chip">
              1만원 미만
            </Link>
          </li>
          <li>
            <Link href="/products?sort=popular" className="chip">
              인기순
            </Link>
          </li>
        </ul>
      </section>

      {/* ══════════════ 귀한 카드 ══════════════ */}
      {topCards.length > 0 && (
        <section>
          <SectionHead
            ribbon="RARE"
            title="눈여겨볼 귀한 카드"
            desc="아트 레어 이상 등급이 섞여 있습니다."
            moreHref="/products?sort=pricey"
          />
          <ul className="mt-5 grid grid-cols-2 gap-3.5 sm:grid-cols-4 sm:gap-4">
            {topCards.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ══════════════ 가볍게 시작하기 ══════════════ */}
      {cheap.length > 0 && (
        <section>
          <SectionHead
            ribbon="START"
            title="가볍게 시작하기"
            desc="부담 없는 값으로 모아볼 수 있는 카드입니다."
            moreHref="/products?sort=cheap"
          />
          <ul className="mt-5 grid grid-cols-2 gap-3.5 sm:grid-cols-4 sm:gap-4">
            {cheap.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ══════════════ 안내 세 칸 ══════════════ */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            Icon: IconCards,
            title: "희귀도별로 정리",
            desc: "커먼부터 울트라 레어까지 한눈에 보고 고릅니다.",
          },
          {
            Icon: IconTruck,
            title: "담아서 한 번에",
            desc: "여러 장을 장바구니에 담아 한 번에 주문합니다.",
          },
          {
            Icon: IconShield,
            title: "토스로 간편결제",
            desc: "카드·계좌이체·간편결제를 모두 지원합니다.",
          },
        ].map(({ Icon, title, desc }) => (
          <div key={title} className="card p-5">
            <span className="cut-sm inline-flex h-10 w-10 items-center justify-center bg-ink-900 text-volt-300">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-3 font-extrabold text-ink-900">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

/* ───────────────────────── 화면 조각들 ───────────────────────── */

/** 섹션 제목 — 검정 라벨 + 굵은 제목 + 설명 + (선택) 더보기 */
function SectionHead({
  ribbon,
  title,
  desc,
  moreHref,
}: {
  ribbon: string;
  title: string;
  desc: string;
  moreHref?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <span className="ribbon cut-sm">{ribbon}</span>
        <h2 className="mt-2.5 text-[1.35rem] font-extrabold tracking-tight text-ink-900">
          {title}
        </h2>
        <p className="mt-1 text-sm text-ink-500">{desc}</p>
      </div>
      {moreHref && (
        <Link href={moreHref} className="btn btn-outline btn-sm shrink-0">
          더 보기
        </Link>
      )}
    </div>
  );
}

/**
 * 첫 화면에 겹쳐 놓는 카드 한 장.
 *
 * 자리와 기울기는 이 함수가 정하지 않고 **바깥에서** 정합니다.
 * (그래야 가운데 카드만 흐름 안에 두는 배치를 만들 수 있습니다)
 */
function HeroCard({
  product,
  priority = false,
}: {
  product: ProductWithSet;
  priority?: boolean;
}) {
  const type = CARD_TYPES[product.card_type];
  const rarity = RARITIES[product.rarity];
  const image = cardImage(product);

  return (
    <Link
      href={`/products/${product.id}`}
      className="poke-card block rounded-[0.65rem] drop-shadow-[0_14px_28px_rgba(0,0,0,0.55)]"
      title={product.name}
    >
      <div className="tcg">
        <div
          className={`tcg-in flex aspect-[5/7] flex-col bg-gradient-to-br ${type.frame}`}
        >
          <div className="flex items-center gap-1 px-1.5 pt-1.5">
            <span className="min-w-0 flex-1 truncate text-[0.7rem] font-extrabold leading-tight text-ink-900">
              {product.name}
            </span>
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full border border-ink-900/50 ${type.dot}`}
            />
          </div>

          <div
            className={`relative mx-1.5 my-1 flex-1 overflow-hidden rounded-[0.2rem] border border-ink-900/35 bg-white/40 ${
              rarity.holo ? "holo" : ""
            }`}
          >
            {image ? (
              <Image
                src={image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 45vw, 22vw"
                className="object-contain p-1.5"
                priority={priority}
              />
            ) : (
              <div className="flex h-full items-center justify-center opacity-25">
                <PokeballLogo size={40} />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end px-1.5 pb-1.5">
            <span
              className={`rounded border border-ink-900/40 px-1 py-px text-[0.55rem] font-extrabold leading-none ${rarity.badge}`}
            >
              {rarity.short}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
