"use client";

import { useRouter } from "next/navigation";

/**
 * 정렬 선택 상자.
 *
 * 고르면 주소를 바꿔서 화면을 다시 불러옵니다.
 * 주소가 바뀌므로 새로고침해도 정렬이 유지됩니다.
 *
 * 주소를 직접 만들지 않고 미리 만들어 둔 것(options[].href)을 받아 씁니다.
 * 주소 만드는 규칙이 lib/products.ts 한 곳에만 있으면 나중에 고치기 쉽습니다.
 */
export default function SortSelect({
  value,
  options,
}: {
  value: string;
  options: { value: string; label: string; href: string }[];
}) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-1.5 text-sm text-ink-500">
      <span className="sr-only">정렬</span>
      <select
        value={value}
        onChange={(event) => {
          const picked = options.find((o) => o.value === event.target.value);
          if (picked) router.push(picked.href);
        }}
        className="field w-auto py-1.5 pr-8 text-[0.825rem]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
