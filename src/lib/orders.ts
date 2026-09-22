/** 주문 상태 라벨과 배지 색 */
export const ORDER_STATUSES = {
  pending:   { label: "결제 대기",   badge: "bg-ink-100 text-ink-600" },
  paid:      { label: "결제 완료",   badge: "bg-emerald-100 text-emerald-800" },
  shipped:   { label: "배송 중",     badge: "bg-sky-100 text-sky-800" },
  done:      { label: "배송 완료",   badge: "bg-ink-900 text-white" },
  cancelled: { label: "주문 취소",   badge: "bg-ink-100 text-ink-500" },
  failed:    { label: "결제 실패",   badge: "bg-red-100 text-red-700" },
} as const;

export type OrderStatus = keyof typeof ORDER_STATUSES;

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && value in ORDER_STATUSES;
}

export type OrderItem = {
  id: string;
  product_id: string | null;
  product_name: string;
  product_image_url: string | null;
  pokedex_no: number | null;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type Payment = {
  payment_key: string;
  status: string;
  method: string | null;
  amount: number;
  approved_at: string | null;
  receipt_url: string | null;
};

export type Order = {
  id: string;
  order_no: string;
  status: OrderStatus;
  order_name: string;
  items_amount: number;
  shipping_fee: number;
  total_amount: number;
  receiver_name: string;
  receiver_phone: string;
  postcode: string;
  address1: string;
  address2: string;
  memo: string;
  fail_code: string | null;
  fail_message: string | null;
  paid_at: string | null;
  created_at: string;
};

export type OrderWithDetail = Order & {
  order_items: OrderItem[];
  payments: Payment | null;
};

/** 주문을 불러올 때 쓸 컬럼 목록 (항목과 결제까지 함께) */
export const ORDER_SELECT = `
  id, order_no, status, order_name, items_amount, shipping_fee, total_amount,
  receiver_name, receiver_phone, postcode, address1, address2, memo,
  fail_code, fail_message, paid_at, created_at,
  order_items ( id, product_id, product_name, product_image_url, pokedex_no, unit_price, quantity, line_total ),
  payments ( payment_key, status, method, amount, approved_at, receipt_url )
`;

/** 2026-09-22T01:21:51Z -> "2026년 9월 22일 오전 10:21" */
export function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** 토스가 돌려주는 결제수단 이름은 이미 한국어입니다 ("카드", "간편결제" 등) */
export function paymentMethodLabel(method: string | null): string {
  return method?.trim() || "—";
}

/**
 * 한국어 조사 "으로 / 로" 를 올바르게 붙입니다.
 *
 * 규칙: 받침이 없거나 받침이 ㄹ 이면 "로", 그 밖에는 "으로".
 *   배송 완료 → 배송 완료로   (ㅛ 로 끝나 받침 없음)
 *   배송 중   → 배송 중으로   (ㅇ 받침)
 *
 * 한글 음절은 유니코드 0xAC00 부터 한 덩어리로 늘어서 있고,
 * (코드 - 0xAC00) % 28 이 받침 번호입니다. 0 이면 받침이 없고, 8 이면 ㄹ 입니다.
 */
export function withRo(word: string): string {
  const code = word.charCodeAt(word.length - 1);
  const isHangul = code >= 0xac00 && code <= 0xd7a3;
  if (!isHangul) return `${word}로`;

  const jongseong = (code - 0xac00) % 28;
  const needsEu = jongseong !== 0 && jongseong !== 8;
  return word + (needsEu ? "으로" : "로");
}
