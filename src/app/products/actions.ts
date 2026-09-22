"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CartActionState = {
  error?: string;
  notice?: string;
};

/**
 * 장바구니에 카드를 담습니다.
 *
 * 담는 것은 **상품 id 와 수량뿐**입니다. 가격은 담지 않습니다.
 * 가격을 장바구니에 저장해 두면, 브라우저에서 보낸 값이 섞여 들어올 틈이 생깁니다.
 * 가격은 항상 products 표에서 다시 읽습니다.
 */
export async function addToCart(
  _prev: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const productId = String(formData.get("productId") ?? "");
  const wanted = Number(formData.get("quantity") ?? 1);

  if (!productId) return { error: "어떤 카드인지 알 수 없습니다." };
  if (!Number.isInteger(wanted) || wanted < 1) {
    return { error: "수량을 1장 이상으로 정해 주세요." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  // 재고를 확인합니다. (판매중이 아닌 카드는 접근 제한 때문에 아예 조회되지 않습니다)
  const { data: product } = await supabase
    .from("products")
    .select("id, name, stock")
    .eq("id", productId)
    .maybeSingle();

  if (!product) return { error: "판매중인 카드가 아닙니다." };
  if (product.stock <= 0) return { error: "품절된 카드입니다." };

  // 이미 담아 둔 수량이 있으면 더합니다.
  const { data: existing } = await supabase
    .from("cart_items")
    .select("quantity")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  const already = existing?.quantity ?? 0;
  const capped = Math.min(already + wanted, product.stock, 99);

  if (capped === already) {
    return {
      error: `이미 남은 수량(${product.stock}장)을 모두 담았습니다.`,
    };
  }

  const { error } = await supabase
    .from("cart_items")
    .upsert(
      { user_id: user.id, product_id: productId, quantity: capped },
      { onConflict: "user_id,product_id" },
    );

  if (error) return { error: `담지 못했습니다: ${error.message}` };

  // 헤더의 장바구니 숫자와 장바구니 화면을 새로 그리게 합니다.
  revalidatePath("/", "layout");
  revalidatePath("/cart");

  const added = capped - already;
  const hitLimit = capped < already + wanted;

  return {
    notice: hitLimit
      ? `남은 수량만큼 ${added}장 담았습니다. (재고 ${product.stock}장)`
      : `${added}장 담았습니다.`,
  };
}
