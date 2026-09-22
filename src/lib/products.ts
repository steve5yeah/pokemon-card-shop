/**
 * 카드(상품)에 관한 타입 · 상수 · 자주 쓰는 계산을 모아 둔 파일입니다.
 *
 * ⚠️ Tailwind v4 주의사항
 * Tailwind 는 소스 코드를 글자 그대로 훑어서 쓰인 클래스 이름을 찾습니다.
 * 그래서 `bg-${type}-500` 처럼 조립한 이름은 찾지 못하고 색이 안 나옵니다.
 * 아래처럼 **완성된 클래스 문자열**을 적어 두어야 합니다.
 */

/** Supabase Storage 에서 카드 사진을 보관하는 통(버킷) 이름 */
export const PRODUCT_IMAGE_BUCKET = "product-images";

/* ------------------------------ 카드 타입 ------------------------------ */

export const CARD_TYPES = {
  grass:     { label: "풀",     badge: "bg-lime-600 text-white",       dot: "bg-lime-600",    frame: "from-lime-200 to-lime-50" },
  fire:      { label: "불꽃",   badge: "bg-orange-500 text-white",     dot: "bg-orange-500",  frame: "from-orange-200 to-orange-50" },
  water:     { label: "물",     badge: "bg-sky-500 text-white",        dot: "bg-sky-500",     frame: "from-sky-200 to-sky-50" },
  lightning: { label: "전기",   badge: "bg-amber-400 text-amber-950",  dot: "bg-amber-400",   frame: "from-amber-200 to-amber-50" },
  psychic:   { label: "에스퍼", badge: "bg-fuchsia-500 text-white",    dot: "bg-fuchsia-500", frame: "from-fuchsia-200 to-fuchsia-50" },
  fighting:  { label: "격투",   badge: "bg-red-700 text-white",        dot: "bg-red-700",     frame: "from-red-200 to-red-50" },
  darkness:  { label: "악",     badge: "bg-slate-700 text-white",      dot: "bg-slate-700",   frame: "from-slate-300 to-slate-50" },
  metal:     { label: "강철",   badge: "bg-slate-400 text-slate-950",  dot: "bg-slate-400",   frame: "from-slate-200 to-slate-50" },
  dragon:    { label: "드래곤", badge: "bg-indigo-600 text-white",     dot: "bg-indigo-600",  frame: "from-indigo-200 to-indigo-50" },
  colorless: { label: "무색",   badge: "bg-stone-400 text-stone-950",  dot: "bg-stone-400",   frame: "from-stone-200 to-stone-50" },
} as const;

export type CardType = keyof typeof CARD_TYPES;
export const CARD_TYPE_KEYS = Object.keys(CARD_TYPES) as CardType[];

export function isCardType(value: unknown): value is CardType {
  return typeof value === "string" && value in CARD_TYPES;
}

/* ------------------------------- 희귀도 ------------------------------- */

/** holo = true 면 카드에 반짝이는 홀로그램 효과를 넣습니다 */
export const RARITIES = {
  common:           { label: "커먼",           short: "C",   badge: "bg-ink-100 text-ink-600",                 holo: false },
  uncommon:         { label: "언커먼",         short: "U",   badge: "bg-emerald-100 text-emerald-800",         holo: false },
  rare:             { label: "레어",           short: "R",   badge: "bg-sky-100 text-sky-800",                 holo: false },
  double_rare:      { label: "더블레어",       short: "RR",  badge: "bg-violet-100 text-violet-800",           holo: false },
  art_rare:         { label: "아트레어",       short: "AR",  badge: "bg-amber-100 text-amber-900",             holo: true  },
  special_art_rare: { label: "스페셜아트레어", short: "SAR", badge: "bg-amber-200 text-amber-900",             holo: true  },
  ur:               { label: "울트라레어",     short: "UR",  badge: "bg-ink-900 text-volt-300",                holo: true  },
} as const;

export type Rarity = keyof typeof RARITIES;
/** 흔한 것 → 귀한 것 순서 (화면에 이 순서로 보여줍니다) */
export const RARITY_KEYS = Object.keys(RARITIES) as Rarity[];

export function isRarity(value: unknown): value is Rarity {
  return typeof value === "string" && value in RARITIES;
}

/* -------------------------------- 타입 -------------------------------- */

export type ProductSet = {
  id: string;
  code: string;
  name: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  rarity: Rarity;
  card_type: CardType;
  set_id: string | null;
  pokedex_no: number | null;
  image_url: string | null;
  image_path: string | null;
  is_active: boolean;
  sold_count: number;
  created_at: string;
};

/** 목록/상세에서 확장팩 이름까지 함께 불러올 때의 모양 */
export type ProductWithSet = Product & { sets: ProductSet | null };

/** Supabase 에서 카드를 불러올 때 쓸 컬럼 목록 (확장팩 이름 포함) */
export const PRODUCT_SELECT =
  "id, name, description, price, stock, rarity, card_type, set_id, pokedex_no, image_url, image_path, is_active, sold_count, created_at, sets ( id, code, name )";

/* ------------------------------ 자주 쓰는 계산 ------------------------------ */

/** 12000 -> "12,000원" */
export function formatPrice(won: number): string {
  return `${won.toLocaleString("ko-KR")}원`;
}

/** 재고 상황을 한국어 한 마디로 */
export function stockLabel(stock: number): string {
  if (stock <= 0) return "품절";
  if (stock <= 3) return `품절임박 ${stock}장`;
  return `재고 ${stock}장`;
}

/* ------------------------------ 정렬 ------------------------------ */

export const SORTS = {
  new:     { label: "최신순",      column: "created_at", ascending: false },
  cheap:   { label: "낮은 가격순", column: "price",      ascending: true  },
  pricey:  { label: "높은 가격순", column: "price",      ascending: false },
  popular: { label: "인기순",      column: "sold_count", ascending: false },
} as const;

export type SortKey = keyof typeof SORTS;
export const SORT_KEYS = Object.keys(SORTS) as SortKey[];
export const DEFAULT_SORT: SortKey = "new";

export function isSortKey(value: unknown): value is SortKey {
  return typeof value === "string" && value in SORTS;
}

/* ----------------------------- 가격대 ----------------------------- */

/** max 가 null 이면 "그 이상" 이라는 뜻입니다 */
export const PRICE_RANGES = {
  "~10000":       { label: "1만원 미만",  min: null,   max: 10000  },
  "10000~30000":  { label: "1~3만원",    min: 10000,  max: 30000  },
  "30000~70000":  { label: "3~7만원",    min: 30000,  max: 70000  },
  "70000~150000": { label: "7~15만원",   min: 70000,  max: 150000 },
  "150000~":      { label: "15만원 이상", min: 150000, max: null   },
} as const;

export type PriceRangeKey = keyof typeof PRICE_RANGES;
export const PRICE_RANGE_KEYS = Object.keys(PRICE_RANGES) as PriceRangeKey[];

export function isPriceRangeKey(value: unknown): value is PriceRangeKey {
  return typeof value === "string" && value in PRICE_RANGES;
}

/* -------------------------- 검색 조건 주소 만들기 -------------------------- */

/**
 * 지금 화면의 검색 조건.
 * 이 값들은 전부 주소창(?rarity=rare&type=fire ...)에 들어갑니다.
 * 그래서 새로고침해도 유지되고, 링크를 복사해 보내면 상대도 같은 화면을 봅니다.
 */
export type ProductFilters = {
  q: string;
  /** "" 는 "조건 없음"입니다 */
  rarity: Rarity | "";
  type: CardType | "";
  set: string;
  price: PriceRangeKey | "";
  sort: SortKey;
  soldout: boolean;
};

/**
 * 지금 조건에서 일부만 바꾼 새 주소를 만듭니다.
 * 예) productsHref(filters, { type: "fire" })  ->  /products?rarity=rare&type=fire
 * 값을 "" 으로 주면 그 조건을 지웁니다.
 */
export function productsHref(
  current: ProductFilters,
  next: Partial<Record<keyof ProductFilters, string>> = {},
): string {
  const merged: Record<string, string> = {
    q: current.q,
    rarity: current.rarity,
    type: current.type,
    set: current.set,
    price: current.price,
    // 기본값(최신순)은 주소에 적지 않아 주소를 짧게 유지합니다
    sort: current.sort === DEFAULT_SORT ? "" : current.sort,
    soldout: current.soldout ? "1" : "",
    ...next,
  };

  // 합친 뒤에도 기본 정렬은 주소에서 빼 줍니다 (?sort=new 가 붙지 않게)
  if (merged.sort === DEFAULT_SORT) merged.sort = "";

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/products?${qs}` : "/products";
}

/** 조건이 하나라도 걸려 있나? ("조건 모두 지우기" 버튼을 보여줄지 판단) */
export function hasAnyFilter(f: ProductFilters): boolean {
  return Boolean(
    f.q || f.rarity || f.type || f.set || f.price || f.soldout ||
      f.sort !== DEFAULT_SORT,
  );
}
