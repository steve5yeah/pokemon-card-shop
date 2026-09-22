import Link from "next/link";
import { IconSearch } from "@/components/Icons";
import {
  CARD_TYPES,
  CARD_TYPE_KEYS,
  PRICE_RANGES,
  PRICE_RANGE_KEYS,
  RARITIES,
  RARITY_KEYS,
  productsHref,
  type ProductFilters,
  type ProductSet,
} from "@/lib/products";

/** 칩 한 줄 — 제목 + 가로로 넘치면 스크롤되는 칩 목록 */
function ChipRow({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-14 shrink-0 pt-2 text-[0.75rem] font-extrabold tracking-tight text-ink-900">
        {title}
      </span>
      <div className="no-scrollbar -my-1 flex-1 overflow-x-auto py-1">
        <div className="flex w-max gap-1.5">{children}</div>
      </div>
    </div>
  );
}

export default function FilterBar({
  filters,
  sets,
}: {
  filters: ProductFilters;
  sets: ProductSet[];
}) {
  return (
    <div className="space-y-2.5">
      {/* ── 이름 검색 ── */}
      <form action="/products" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={filters.q}
          placeholder="카드 이름으로 찾기 (예: 리자몽)"
          className="field flex-1"
        />
        {/* 검색할 때 지금 걸린 다른 조건도 함께 넘깁니다 */}
        {filters.rarity && <input type="hidden" name="rarity" value={filters.rarity} />}
        {filters.type && <input type="hidden" name="type" value={filters.type} />}
        {filters.set && <input type="hidden" name="set" value={filters.set} />}
        {filters.price && <input type="hidden" name="price" value={filters.price} />}
        {filters.sort !== "new" && <input type="hidden" name="sort" value={filters.sort} />}
        {filters.soldout && <input type="hidden" name="soldout" value="1" />}
        <button type="submit" className="btn btn-primary shrink-0">
          <IconSearch className="h-4 w-4" />
          검색
        </button>
      </form>

      {/* ── 희귀도 ── */}
      <ChipRow title="희귀도">
        <Link
          href={productsHref(filters, { rarity: "" })}
          className={`chip ${filters.rarity === "" ? "chip-on" : ""}`}
        >
          전체
        </Link>
        {RARITY_KEYS.map((key) => (
          <Link
            key={key}
            href={productsHref(filters, { rarity: key })}
            className={`chip ${filters.rarity === key ? "chip-on" : ""}`}
          >
            {RARITIES[key].label}
          </Link>
        ))}
      </ChipRow>

      {/* ── 타입 ── */}
      <ChipRow title="타입">
        <Link
          href={productsHref(filters, { type: "" })}
          className={`chip ${filters.type === "" ? "chip-on" : ""}`}
        >
          전체
        </Link>
        {CARD_TYPE_KEYS.map((key) => (
          <Link
            key={key}
            href={productsHref(filters, { type: key })}
            className={`chip gap-1.5 ${filters.type === key ? "chip-on" : ""}`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full border border-ink-900/40 ${CARD_TYPES[key].dot}`}
            />
            {CARD_TYPES[key].label}
          </Link>
        ))}
      </ChipRow>

      {/* ── 확장팩 ── */}
      {sets.length > 0 && (
        <ChipRow title="확장팩">
          <Link
            href={productsHref(filters, { set: "" })}
            className={`chip ${filters.set === "" ? "chip-on" : ""}`}
          >
            전체
          </Link>
          {sets.map((set) => (
            <Link
              key={set.id}
              href={productsHref(filters, { set: set.code })}
              className={`chip ${filters.set === set.code ? "chip-on" : ""}`}
            >
              {set.name}
            </Link>
          ))}
        </ChipRow>
      )}

      {/* ── 가격대 ── */}
      <ChipRow title="가격">
        <Link
          href={productsHref(filters, { price: "" })}
          className={`chip ${filters.price === "" ? "chip-on" : ""}`}
        >
          전체
        </Link>
        {PRICE_RANGE_KEYS.map((key) => (
          <Link
            key={key}
            href={productsHref(filters, { price: key })}
            className={`chip ${filters.price === key ? "chip-on" : ""}`}
          >
            {PRICE_RANGES[key].label}
          </Link>
        ))}
      </ChipRow>
    </div>
  );
}
