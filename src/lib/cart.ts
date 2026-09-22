import type { ProductWithSet } from "./products";

/**
 * 배송비 규칙
 *
 * ⚠️ 5단계에서 주문을 만드는 데이터베이스 함수(create_order)도 같은 숫자를 씁니다.
 *    한쪽만 고치면 화면에 보이는 금액과 실제 결제 금액이 달라집니다.
 *    바꿀 때는 반드시 둘 다 고쳐 주세요.
 */
export const SHIPPING_FEE = 3000;
export const FREE_SHIPPING_OVER = 50000;

/** Supabase 에서 장바구니를 불러올 때 돌아오는 한 줄의 모양 */
export type CartRow = {
  product_id: string;
  quantity: number;
  created_at: string;
  products: ProductWithSet | null;
};

/** 화면에서 쓰기 좋게 정리한 장바구니 한 줄 */
export type CartLine = {
  productId: string;
  quantity: number;
  product: ProductWithSet;
  /** 이 줄의 합계 = 카드값 × 수량 */
  lineTotal: number;
};

export type CartTotals = {
  /** 카드값 합계 (배송비 제외) */
  itemsAmount: number;
  shippingFee: number;
  /** 실제로 결제할 금액 */
  totalAmount: number;
  /** 담은 카드 종류 수 */
  kinds: number;
  /** 담은 총 장수 */
  pieces: number;
  /** 무료배송까지 남은 금액 (이미 무료면 0) */
  freeShippingLeft: number;
};

/**
 * 장바구니 줄 목록을 금액으로 계산합니다.
 *
 * ⚠️ 이 계산은 **화면에 보여주기 위한 것**입니다.
 *    실제 결제 금액은 5단계에서 데이터베이스가 다시 계산합니다.
 *    브라우저가 보낸 금액은 절대 믿지 않기 때문입니다.
 */
export function calcTotals(lines: CartLine[]): CartTotals {
  const itemsAmount = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const pieces = lines.reduce((sum, line) => sum + line.quantity, 0);

  // 빈 장바구니에는 배송비를 붙이지 않습니다.
  const shippingFee =
    itemsAmount === 0 || itemsAmount >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;

  return {
    itemsAmount,
    shippingFee,
    totalAmount: itemsAmount + shippingFee,
    kinds: lines.length,
    pieces,
    freeShippingLeft: Math.max(0, FREE_SHIPPING_OVER - itemsAmount),
  };
}

/** Supabase 에서 받은 줄들을 화면용으로 정리합니다 (상품이 사라진 줄은 버립니다) */
export function toCartLines(rows: CartRow[]): CartLine[] {
  return rows
    .filter((row): row is CartRow & { products: ProductWithSet } =>
      Boolean(row.products),
    )
    .map((row) => ({
      productId: row.product_id,
      quantity: row.quantity,
      product: row.products,
      lineTotal: row.products.price * row.quantity,
    }));
}

/** 장바구니를 불러올 때 쓸 컬럼 목록 */
export const CART_SELECT =
  "product_id, quantity, created_at, products ( id, name, description, price, stock, rarity, card_type, set_id, pokedex_no, image_url, image_path, is_active, sold_count, created_at, sets ( id, code, name ) )";
