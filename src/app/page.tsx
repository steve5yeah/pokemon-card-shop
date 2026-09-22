import Link from "next/link";
import PokeballLogo from "@/components/PokeballLogo";
import { createClient } from "@/lib/supabase/server";
import {
  CARD_TYPES,
  CARD_TYPE_KEYS,
  PRODUCT_SELECT,
  RARITIES,
  type ProductWithSet,
} from "@/lib/products";
import ProductCard from "./products/ProductCard";

/** 첫 화면에 크게 보여줄 희귀도 (귀한 것부터) */
const SHOWCASE_RARITIES = ["ur", "special_art_rare", "art_rare"] as const;

export default async function HomePage() {
  const supabase = await createClient();

  const [userResult, topResult, newResult] = await Promise.all([
    supabase.auth.getUser(),
    // 값이 높은 귀한 카드 4장
    supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_active", true)
      .gt("stock", 0)
      .order("price", { ascending: false })
      .limit(4),
    // 최근에 들어온 카드 4장
    supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_active", true)
      .gt("stock", 0)
      .order("created_at", { ascending: false })
      .order("price", { ascending: true })
      .limit(4),
  ]);

  const user = userResult.data.user;
  const topCards = (topResult.data ?? []) as unknown as ProductWithSet[];
  const newCards = (newResult.data ?? []) as unknown as ProductWithSet[];

  return (
    <div className="space-y-16">
      {/* ────────────────── 첫 화면 ────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-ink-200 bg-white px-6 py-12 text-center shadow-soft sm:px-10 sm:py-16">
        {/* 배경 장식 — 흐릿한 몬스터볼 두 개 */}
        <div className="pointer-events-none absolute -left-16 -top-16 opacity-[0.07]">
          <PokeballLogo size={220} />
        </div>
        <div className="pointer-events-none absolute -bottom-20 -right-14 opacity-[0.07]">
          <PokeballLogo size={180} />
        </div>

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-volt-100 px-3 py-1 text-xs font-bold text-volt-800">
            ⚡ 정품 트레이딩 카드
          </span>

          <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-ink-900 sm:text-[2.6rem]">
            포켓몬 카드,
            <br className="sm:hidden" />{" "}
            <span className="text-poke-600">한 장씩</span> 골라 담기
          </h1>

          <p className="mx-auto mt-4 max-w-md text-[0.95rem] leading-relaxed text-ink-600">
            리자몽부터 뮤츠까지. 희귀도와 타입으로 골라 보고
            <br className="hidden sm:block" /> 장바구니에 담아 한 번에
            주문하세요.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            <Link href="/products" className="btn btn-primary px-6 py-3">
              카드 둘러보기
            </Link>
            {user ? (
              <Link href="/cart" className="btn btn-outline px-6 py-3">
                🛒 장바구니 보기
              </Link>
            ) : (
              <Link href="/signup" className="btn btn-outline px-6 py-3">
                회원가입하고 시작하기
              </Link>
            )}
          </div>

          <p className="mt-6 text-xs text-ink-400">
            5만원 이상 주문하면 배송비가 무료입니다
          </p>
        </div>
      </section>

      {/* ────────────────── 귀한 카드 ────────────────── */}
      {topCards.length > 0 && (
        <section>
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-ink-900">
                눈여겨볼 귀한 카드
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                아트 레어 이상 등급이 섞여 있습니다.
              </p>
            </div>
            <Link href="/products?sort=pricey" className="btn btn-ghost btn-sm">
              더 보기 →
            </Link>
          </div>

          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {topCards.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ────────────────── 타입으로 골라보기 ────────────────── */}
      <section>
        <h2 className="text-center text-xl font-bold text-ink-900">
          타입으로 골라보기
        </h2>
        <p className="mt-1 text-center text-sm text-ink-500">
          누르면 그 타입 카드만 모아서 보여줍니다.
        </p>

        <ul className="no-scrollbar mt-5 flex justify-start gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center">
          {CARD_TYPE_KEYS.map((key) => (
            <li key={key}>
              <Link href={`/products?type=${key}`} className="chip gap-1.5">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${CARD_TYPES[key].dot}`}
                />
                {CARD_TYPES[key].label}
              </Link>
            </li>
          ))}
        </ul>

        <ul className="no-scrollbar mt-2.5 flex justify-start gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center">
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
        </ul>
      </section>

      {/* ────────────────── 가볍게 시작하기 ────────────────── */}
      {newCards.length > 0 && (
        <section>
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-ink-900">
                가볍게 시작하기
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                부담 없는 값으로 모아볼 수 있는 카드입니다.
              </p>
            </div>
            <Link href="/products?sort=cheap" className="btn btn-ghost btn-sm">
              더 보기 →
            </Link>
          </div>

          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {newCards.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ────────────────── 안내 세 칸 ────────────────── */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: "🃏",
            title: "희귀도별로 정리",
            desc: "커먼부터 울트라 레어까지 한눈에 보고 고릅니다.",
          },
          {
            icon: "🛒",
            title: "담아서 한 번에",
            desc: "여러 장을 장바구니에 담아 한 번에 주문합니다.",
          },
          {
            icon: "💳",
            title: "토스로 간편결제",
            desc: "카드·계좌이체·간편결제로 결제합니다.",
          },
        ].map((feature) => (
          <div key={feature.title} className="card p-5">
            <p className="text-2xl">{feature.icon}</p>
            <h3 className="mt-2.5 font-bold text-ink-900">{feature.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
              {feature.desc}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
