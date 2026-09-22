import Link from "next/link";
import PokeballLogo from "@/components/PokeballLogo";
import { createClient } from "@/lib/supabase/server";
import { explainSupabaseError } from "@/lib/env";
import {
  DEFAULT_SORT,
  PRICE_RANGES,
  PRODUCT_SELECT,
  SORTS,
  SORT_KEYS,
  hasAnyFilter,
  isCardType,
  isPriceRangeKey,
  isRarity,
  isSortKey,
  productsHref,
  type ProductFilters,
  type ProductSet,
  type ProductWithSet,
} from "@/lib/products";
import FilterBar from "./FilterBar";
import ProductCard from "./ProductCard";
import SortSelect from "./SortSelect";

export const metadata = { title: "카드 둘러보기 — 포켓몬 카드샵" };

type SearchParams = Promise<{
  q?: string;
  rarity?: string;
  type?: string;
  set?: string;
  price?: string;
  sort?: string;
  soldout?: string;
}>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const raw = await searchParams;
  const supabase = await createClient();

  // 확장팩 목록 — 칩으로 보여주고, 주소로 들어온 확장팩 코드가 진짜인지 확인하는 데도 씁니다.
  const { data: setRows } = await supabase
    .from("sets")
    .select("id, code, name")
    .order("sort_order", { ascending: true });
  const sets = (setRows ?? []) as ProductSet[];

  /**
   * 주소창 값은 사용자가 마음대로 바꿀 수 있으므로 그대로 믿지 않습니다.
   * 아는 값이면 쓰고, 모르는 값이면 "조건 없음"으로 취급합니다.
   */
  const matchedSet = sets.find((s) => s.code === raw.set);
  const filters: ProductFilters = {
    q: (raw.q ?? "").trim().slice(0, 40),
    rarity: isRarity(raw.rarity) ? raw.rarity : "",
    type: isCardType(raw.type) ? raw.type : "",
    set: matchedSet ? matchedSet.code : "",
    price: isPriceRangeKey(raw.price) ? raw.price : "",
    sort: isSortKey(raw.sort) ? raw.sort : DEFAULT_SORT,
    soldout: raw.soldout === "1",
  };

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true);

  if (filters.q) {
    // ilike 는 대소문자를 가리지 않는 "포함" 검색입니다.
    // %, 쉼표, 괄호는 검색 문법에서 특별한 뜻이 있어 공백으로 바꿔 둡니다.
    const safe = filters.q.replace(/[%,()]/g, " ");
    query = query.ilike("name", `%${safe}%`);
  }
  if (filters.rarity) query = query.eq("rarity", filters.rarity);
  if (filters.type) query = query.eq("card_type", filters.type);
  if (matchedSet) query = query.eq("set_id", matchedSet.id);
  if (filters.price) {
    // 구간이 겹치지 않도록 아래쪽은 포함(gte), 위쪽은 미포함(lt) 으로 잡습니다.
    const range = PRICE_RANGES[filters.price];
    if (range.min !== null) query = query.gte("price", range.min);
    if (range.max !== null) query = query.lt("price", range.max);
  }
  if (!filters.soldout) query = query.gt("stock", 0);

  const sort = SORTS[filters.sort];
  const { data, error } = await query
    .order(sort.column, { ascending: sort.ascending })
    // 같은 값이 여러 개일 때 순서가 매번 달라지지 않게 두 번째 기준을 둡니다
    .order("price", { ascending: false })
    .limit(60);

  const products = (data ?? []) as unknown as ProductWithSet[];
  const filtered = hasAnyFilter(filters);

  const sortOptions = SORT_KEYS.map((key) => ({
    value: key,
    label: SORTS[key].label,
    href: productsHref(filters, { sort: key }),
  }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-ink-900">카드 둘러보기</h1>
        <p className="mt-1.5 text-sm text-ink-600">
          희귀도 · 타입 · 확장팩 · 가격으로 좁혀 보세요.
        </p>
      </header>

      <FilterBar filters={filters} sets={sets} />

      {/* ── 결과 개수 · 품절 포함 · 정렬 ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-y border-ink-100 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-ink-700">
            {products.length}장
          </span>
          {filtered && (
            <Link href="/products" className="chip btn-sm">
              조건 모두 지우기 ✕
            </Link>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={productsHref(filters, { soldout: filters.soldout ? "" : "1" })}
            className={`chip btn-sm ${filters.soldout ? "chip-on" : ""}`}
          >
            품절 포함
          </Link>
          <SortSelect value={filters.sort} options={sortOptions} />
        </div>
      </div>

      {error ? (
        <p className="card px-4 py-6 text-center text-sm text-red-700">
          카드를 불러오지 못했습니다: {explainSupabaseError(error.message)}
        </p>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 px-4 py-16 text-center">
          <div className="mx-auto w-fit opacity-20">
            <PokeballLogo size={64} />
          </div>
          <p className="mt-4 text-ink-600">
            {filtered
              ? "조건에 맞는 카드가 없습니다."
              : "아직 등록된 카드가 없습니다."}
          </p>
          {filtered && (
            <Link href="/products" className="btn btn-outline mt-5">
              조건 모두 지우기
            </Link>
          )}
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
