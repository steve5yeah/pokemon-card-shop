"use client";

import { useActionState } from "react";
import SubmitButton from "@/components/SubmitButton";
import {
  CARD_TYPES,
  CARD_TYPE_KEYS,
  RARITIES,
  RARITY_KEYS,
  type Product,
  type ProductSet,
} from "@/lib/products";
import { saveProduct, type ProductFormState } from "./actions";
import ImageUploader from "./ImageUploader";

const initialState: ProductFormState = {};

/** product 가 있으면 수정, 없으면 새로 등록 */
export default function ProductForm({
  product,
  sets,
}: {
  product?: Product;
  sets: ProductSet[];
}) {
  const [state, formAction] = useActionState(saveProduct, initialState);
  const editing = Boolean(product);

  return (
    <form action={formAction} className="space-y-5">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-sm font-medium text-ink-800"
        >
          카드 이름
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={60}
          defaultValue={product?.name ?? ""}
          placeholder="리자몽 ex"
          className="field"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="rarity"
            className="mb-1.5 block text-sm font-medium text-ink-800"
          >
            희귀도
          </label>
          <select
            id="rarity"
            name="rarity"
            required
            defaultValue={product?.rarity ?? "common"}
            className="field"
          >
            {RARITY_KEYS.map((key) => (
              <option key={key} value={key}>
                {RARITIES[key].label} ({RARITIES[key].short})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="card_type"
            className="mb-1.5 block text-sm font-medium text-ink-800"
          >
            타입
          </label>
          <select
            id="card_type"
            name="card_type"
            required
            defaultValue={product?.card_type ?? "colorless"}
            className="field"
          >
            {CARD_TYPE_KEYS.map((key) => (
              <option key={key} value={key}>
                {CARD_TYPES[key].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="set_id"
          className="mb-1.5 block text-sm font-medium text-ink-800"
        >
          확장팩
        </label>
        <select
          id="set_id"
          name="set_id"
          defaultValue={product?.set_id ?? ""}
          className="field"
        >
          <option value="">(없음)</option>
          {sets.map((set) => (
            <option key={set.id} value={set.id}>
              {set.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="price"
            className="mb-1.5 block text-sm font-medium text-ink-800"
          >
            가격 (원)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step={100}
            required
            defaultValue={product?.price ?? 1000}
            className="field"
          />
        </div>
        <div>
          <label
            htmlFor="stock"
            className="mb-1.5 block text-sm font-medium text-ink-800"
          >
            재고 (장)
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min={0}
            required
            defaultValue={product?.stock ?? 1}
            className="field"
          />
        </div>
        <div>
          <label
            htmlFor="pokedex_no"
            className="mb-1.5 block text-sm font-medium text-ink-800"
          >
            도감번호
          </label>
          <input
            id="pokedex_no"
            name="pokedex_no"
            type="number"
            min={1}
            max={1025}
            defaultValue={product?.pokedex_no ?? ""}
            placeholder="6"
            className="field"
          />
        </div>
      </div>

      <p className="rounded-lg border-2 border-volt-500 bg-volt-50 px-3 py-2 text-xs leading-relaxed font-semibold text-volt-900">
        도감번호만 적으면 PokeAPI 의 공식 일러스트가 자동으로 나옵니다. (리자몽
        6, 피카츄 25, 뮤츠 150) 직접 올린 사진이 있으면 그 사진을 씁니다.
      </p>

      <ImageUploader
        initialUrl={product?.image_url}
        initialPath={product?.image_path}
      />

      <div>
        <label
          htmlFor="description"
          className="mb-1.5 block text-sm font-medium text-ink-800"
        >
          설명
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={2000}
          defaultValue={product?.description ?? ""}
          placeholder="카드 상태나 특징을 적어 주세요."
          className="field"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-800">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={product?.is_active ?? true}
          className="h-4 w-4"
        />
        판매중으로 보이기 (끄면 손님에게 안 보입니다)
      </label>

      {state.error && (
        <p className="rounded-lg border-2 border-poke-500 bg-poke-50 px-3 py-2 text-sm font-semibold text-poke-800">
          {state.error}
        </p>
      )}

      <SubmitButton pendingText="저장 중…">
        {editing ? "수정 저장" : "카드 등록"}
      </SubmitButton>
    </form>
  );
}
