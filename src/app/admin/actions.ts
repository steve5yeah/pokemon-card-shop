"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { isCardType, isRarity } from "@/lib/products";
import { isOrderStatus } from "@/lib/orders";

export type ProductFormState = {
  error?: string;
  notice?: string;
};

/**
 * 상품 등록 · 수정
 *
 * 관리자 확인은 두 겹입니다:
 *   1) 여기서 isAdmin() 으로 확인 (친절한 오류 메시지를 주려고)
 *   2) 데이터베이스 접근 제한(RLS) 이 다시 확인 (이게 진짜 자물쇠)
 * 화면을 뚫어도 2번 때문에 상품을 고칠 수 없습니다.
 */
export async function saveProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  if (!(await isAdmin())) return { error: "관리자만 할 수 있습니다." };

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const rarity = String(formData.get("rarity") ?? "");
  const cardType = String(formData.get("card_type") ?? "");
  const setId = String(formData.get("set_id") ?? "").trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const pokedexRaw = String(formData.get("pokedex_no") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const imagePath = String(formData.get("imagePath") ?? "").trim();
  const isActive = formData.get("is_active") === "on";

  if (!name || name.length > 60) {
    return { error: "카드 이름을 1~60자로 적어 주세요." };
  }
  if (!isRarity(rarity)) return { error: "희귀도를 골라 주세요." };
  if (!isCardType(cardType)) return { error: "타입을 골라 주세요." };
  if (!Number.isInteger(price) || price < 0) {
    return { error: "가격은 0원 이상 정수로 적어 주세요." };
  }
  if (!Number.isInteger(stock) || stock < 0) {
    return { error: "재고는 0장 이상 정수로 적어 주세요." };
  }

  let pokedexNo: number | null = null;
  if (pokedexRaw) {
    const parsed = Number(pokedexRaw);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 1025) {
      return { error: "도감번호는 1~1025 사이 숫자로 적어 주세요." };
    }
    pokedexNo = parsed;
  }

  if (!imageUrl && !pokedexNo) {
    return {
      error: "사진을 올리거나 도감번호를 적어 주세요. (둘 중 하나는 있어야 그림이 나옵니다)",
    };
  }

  const row = {
    name,
    description,
    rarity,
    card_type: cardType,
    set_id: setId || null,
    price,
    stock,
    pokedex_no: pokedexNo,
    image_url: imageUrl || null,
    image_path: imagePath || null,
    is_active: isActive,
  };

  const supabase = await createClient();

  if (id) {
    const { error } = await supabase.from("products").update(row).eq("id", id);
    if (error) return { error: `저장하지 못했습니다: ${error.message}` };
  } else {
    const { error } = await supabase.from("products").insert(row);
    if (error) return { error: `등록하지 못했습니다: ${error.message}` };
  }

  revalidatePath("/products");
  revalidatePath("/admin/products");
  redirect("/admin/products?saved=1");
}

/** 재고만 빠르게 고칩니다 (카드 관리 목록에서) */
export async function updateStock(
  productId: string,
  stock: number,
): Promise<{ error?: string }> {
  if (!(await isAdmin())) return { error: "관리자만 할 수 있습니다." };
  if (!Number.isInteger(stock) || stock < 0) {
    return { error: "재고는 0장 이상이어야 합니다." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ stock })
    .eq("id", productId);

  if (error) return { error: `바꾸지 못했습니다: ${error.message}` };

  revalidatePath("/products");
  revalidatePath("/admin/products");
  return {};
}

/** 판매중 / 숨김 전환 (지우지 않고 숨깁니다 — 주문 이력이 이 카드를 가리키므로) */
export async function toggleActive(
  productId: string,
  isActive: boolean,
): Promise<{ error?: string }> {
  if (!(await isAdmin())) return { error: "관리자만 할 수 있습니다." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", productId);

  if (error) return { error: `바꾸지 못했습니다: ${error.message}` };

  revalidatePath("/products");
  revalidatePath("/admin/products");
  return {};
}

/** 배송 상태 바꾸기 (결제완료 → 배송중 → 배송완료) */
export async function updateOrderStatus(
  orderNo: string,
  status: string,
): Promise<{ error?: string }> {
  if (!(await isAdmin())) return { error: "관리자만 할 수 있습니다." };
  if (!isOrderStatus(status) || !["paid", "shipped", "done"].includes(status)) {
    return { error: "바꿀 수 없는 상태입니다." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("order_no", orderNo);

  if (error) return { error: `바꾸지 못했습니다: ${error.message}` };

  revalidatePath("/admin/orders");
  revalidatePath(`/orders/${orderNo}`);
  return {};
}

/**
 * 주문 취소 — 재고를 되돌려 놓습니다.
 *
 * cancel_order 함수는 service_role(서버 전용 키)만 부를 수 있게 잠겨 있습니다.
 * 그래서 여기서만 admin 클라이언트를 씁니다.
 * ⚠️ 실제 운영이라면 여기서 토스 결제취소 API도 같이 불러 환불해야 합니다.
 *    지금은 테스트 결제라 재고 되돌리기까지만 합니다.
 */
export async function cancelOrder(
  orderNo: string,
): Promise<{ error?: string }> {
  if (!(await isAdmin())) return { error: "관리자만 할 수 있습니다." };

  const admin = createAdminClient();
  const { error } = await admin.rpc("cancel_order", { p_order_no: orderNo });

  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath("/products");
  revalidatePath(`/orders/${orderNo}`);
  return {};
}
