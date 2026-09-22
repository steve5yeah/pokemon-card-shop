/**
 * 몬스터볼 로고 — 그림 파일이 아니라 코드로 직접 그린 그림(SVG)입니다.
 * 색을 globals.css 의 @theme 변수로 받아오므로, 팔레트를 바꾸면 로고도 같이 바뀝니다.
 *
 * 그리는 순서가 중요합니다. 뒤에 그린 것이 앞에 오도록 겹쳐 쌓습니다.
 *   1) 흰 공  2) 위쪽 빨간 반원  3) 가운데 검은 띠
 *   4) 검은 테두리 (3번이 공 밖으로 살짝 삐져나온 부분을 덮어 줍니다)
 *   5) 가운데 버튼
 */
export default function PokeballLogo({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="몬스터볼"
    >
      <circle cx="32" cy="32" r="30" fill="#ffffff" />
      <path d="M2 32 A30 30 0 0 1 62 32 Z" fill="var(--color-poke-500)" />
      <rect x="2" y="27" width="60" height="10" fill="var(--color-ink-900)" />
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="none"
        stroke="var(--color-ink-900)"
        strokeWidth="4"
      />
      <circle cx="32" cy="32" r="10.5" fill="var(--color-ink-900)" />
      <circle cx="32" cy="32" r="6.5" fill="#ffffff" />
      {/* 왼쪽 위 반짝임 */}
      <path
        d="M14 16 A22 22 0 0 1 30 9"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.55"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
