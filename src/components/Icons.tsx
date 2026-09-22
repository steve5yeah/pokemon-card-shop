/**
 * 화면에서 쓰는 작은 그림들 — 이모지(🃏🛒) 대신 직접 그린 SVG 입니다.
 *
 * 이모지는 기기마다 모양이 달라 보이고(윈도우·아이폰·안드로이드가 전부 다름)
 * 글자 취급이라 색·굵기를 맞출 수 없습니다. SVG 는 `currentColor` 를 쓰므로
 * 글자 색을 따라오고, 선 굵기도 우리가 정합니다.
 *
 * 쓰는 법:  <IconCart className="h-5 w-5" />
 */

type IconProps = { className?: string };

/** 공통 뼈대 — 선으로 그리는 그림들이 같은 굵기·마감을 갖게 합니다 */
function Stroke({
  className,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** 집 — 홈 */
export function IconHome({ className }: IconProps) {
  return (
    <Stroke className={className}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M9.75 20v-5.5h4.5V20" />
    </Stroke>
  );
}

/** 겹쳐 놓은 카드 두 장 — 카드 목록 */
export function IconCards({ className }: IconProps) {
  return (
    <Stroke className={className}>
      <rect x="9" y="3.5" width="11" height="15" rx="2" />
      <path d="M15.5 20.5H6a2 2 0 0 1-2-2V7" />
    </Stroke>
  );
}

/** 장바구니 */
export function IconCart({ className }: IconProps) {
  return (
    <Stroke className={className}>
      <path d="M3 4h2.2l2.2 10.5h9.8l2.1-7.5H6.2" />
      <circle cx="9.5" cy="19" r="1.6" />
      <circle cx="17" cy="19" r="1.6" />
    </Stroke>
  );
}

/** 택배 상자 — 주문내역 */
export function IconBox({ className }: IconProps) {
  return (
    <Stroke className={className}>
      <path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4v-9Z" />
      <path d="M3.5 7.5 12 11.5l8.5-4" />
      <path d="M12 11.5v9" />
    </Stroke>
  );
}

/** 사람 — 내 정보 */
export function IconUser({ className }: IconProps) {
  return (
    <Stroke className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </Stroke>
  );
}

/** 번개 — 포인트·강조 (채워 그립니다) */
export function IconBolt({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M13.6 2 5 13.4h5.2L9.4 22 19 10.2h-5.6L13.6 2Z" />
    </svg>
  );
}

/** 반짝임 — 희귀 카드 표시 (채워 그립니다) */
export function IconSparkle({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 1.5c.6 3.9 2.1 5.4 6 6-3.9.6-5.4 2.1-6 6-.6-3.9-2.1-5.4-6-6 3.9-.6 5.4-2.1 6-6Z" />
      <path d="M19 14c.35 2.1 1.15 2.9 3.25 3.25-2.1.35-2.9 1.15-3.25 3.25-.35-2.1-1.15-2.9-3.25-3.25 2.1-.35 2.9-1.15 3.25-3.25Z" />
    </svg>
  );
}

/** 신용카드 — 결제 */
export function IconPay({ className }: IconProps) {
  return (
    <Stroke className={className}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 9.5h19" />
      <path d="M6.5 14.5h3" />
    </Stroke>
  );
}

/** 트럭 — 배송 */
export function IconTruck({ className }: IconProps) {
  return (
    <Stroke className={className}>
      <path d="M2.5 6.5h11v9h-11z" />
      <path d="M13.5 10h3.8l2.7 3v2.5h-6.5" />
      <circle cx="7" cy="18" r="1.7" />
      <circle cx="17" cy="18" r="1.7" />
    </Stroke>
  );
}

/** 방패 — 안전한 결제 */
export function IconShield({ className }: IconProps) {
  return (
    <Stroke className={className}>
      <path d="M12 2.5 4.5 5.5v6c0 4.5 3 8.2 7.5 10 4.5-1.8 7.5-5.5 7.5-10v-6L12 2.5Z" />
      <path d="m8.8 11.8 2.3 2.3 4.1-4.4" />
    </Stroke>
  );
}

/** 돋보기 — 검색 */
export function IconSearch({ className }: IconProps) {
  return (
    <Stroke className={className}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.4 15.4 4.1 4.1" />
    </Stroke>
  );
}
