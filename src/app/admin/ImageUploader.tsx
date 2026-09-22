"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PRODUCT_IMAGE_BUCKET } from "@/lib/products";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * 카드 사진 올리기.
 *
 * 사진은 서버 액션을 거치지 않고 브라우저에서 Storage 로 곧장 올립니다.
 * (서버 액션 본문은 기본 1MB 제한이 있어서 사진을 통째로 보내기엔 좁습니다.)
 * 올리고 나면 주소를 숨은 칸(hidden)에 담아 두고, 폼을 보낼 때 함께 전송됩니다.
 *
 * 올리는 권한은 Storage 접근 제한에서 **관리자만** 으로 잠가 두었습니다.
 * 일반 사용자가 이 코드를 흉내 내도 서버가 거부합니다.
 */
export default function ImageUploader({
  initialUrl,
  initialPath,
}: {
  initialUrl?: string | null;
  initialPath?: string | null;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [path, setPath] = useState(initialPath ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!ALLOWED.includes(file.type)) {
      setError("JPG · PNG · WEBP · GIF 파일만 올릴 수 있습니다.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("사진은 5MB까지 올릴 수 있습니다.");
      return;
    }

    setBusy(true);
    const supabase = createClient();

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const nextPath = "products/" + crypto.randomUUID() + "." + ext;

    const { error: uploadError } = await supabase.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .upload(nextPath, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      setError("사진 올리기에 실패했습니다: " + uploadError.message);
      setBusy(false);
      return;
    }

    // 직전에 올려 둔 사진이 있으면 쓰레기로 남지 않게 지웁니다.
    if (path && path !== initialPath) {
      await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([path]);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(nextPath);

    setUrl(publicUrl);
    setPath(nextPath);
    setBusy(false);
  }

  async function handleRemove() {
    // 이번에 새로 올린 파일만 지웁니다.
    if (path && path !== initialPath) {
      const supabase = createClient();
      await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([path]);
    }
    setUrl("");
    setPath("");
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-ink-800">
        카드 사진{" "}
        <span className="font-normal text-ink-400">
          (선택 — 없으면 도감번호로 자동 표시)
        </span>
      </span>

      <input type="hidden" name="imageUrl" value={url} />
      <input type="hidden" name="imagePath" value={path} />

      {url ? (
        <div className="relative w-36 overflow-hidden rounded-lg border-2 border-ink-900">
          <Image
            src={url}
            alt="올린 사진 미리보기"
            width={144}
            height={192}
            className="h-48 w-36 object-contain bg-ink-50"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-1.5 top-1.5 rounded-lg bg-black/60 px-2 py-1 text-xs font-medium text-white transition hover:bg-black/75"
          >
            지우기
          </button>
        </div>
      ) : (
        <label
          className={`flex h-48 w-36 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-ink-200 bg-white text-center transition hover:border-poke-300 hover:bg-poke-50 ${
            busy ? "pointer-events-none opacity-60" : ""
          }`}
        >
          <span className="text-2xl">{busy ? "⏳" : "📷"}</span>
          <span className="text-xs text-ink-600">
            {busy ? "올리는 중…" : "사진 고르기"}
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleChange}
            className="hidden"
          />
        </label>
      )}

      {error && <p className="mt-2 text-sm font-semibold text-poke-800">{error}</p>}
    </div>
  );
}
