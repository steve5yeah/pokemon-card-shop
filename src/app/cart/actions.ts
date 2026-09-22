"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CartEditState = { error?: string };

/** 로그인한 사용자와 Supabase 클라이언트를 한 번에 얻습니다 */
async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function refresh() {
  // 헤더의 장바구니 숫자와 장바구니 화면을 새로 그리게 합니다.
  revalidatePath("/", "layout");
  revalidatePath("/cart");
}

/**
 * 수량을 바꿉니다.
 * 0 이하로 내리면 줄을 지웁니다. 재고보다 많이 올리면 재고까지만 올립니다.
 *
 * 접근 제한(RLS)이 "내 줄만 고칠 수 있다"를 보장하므로,
 * 남의 user_id 를 넣어 봐도 아무 줄도 바뀌지 않습니다.
 */
export async function updateQuantity(
  productId: string,
  quantity: number,
): Promise<CartEditState> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "로그인이 필요합니다." };
  if (!productId) return { error: "어떤 카드인지 알 수 없습니다." };

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return removeFromCart(productId);
  }

  const { data: product } = await supabase
    .from("products")
    .select("stock")
    .eq("id", productId)
    .maybeSingle();

  if (!product) return { error: "판매중인 카드가 아닙니다." };
  if (product.stock <= 0) return { error: "품절된 카드입니다." };

  const capped = Math.min(quantity, product.stock, 99);

  const { error } = await supabase
    .from("cart_items")
    .update({ quantity: capped })
    .eq("user_id", user.id)
    .eq("product_id", productId);

  if (error) return { error: `바꾸지 못했습니다: ${error.message}` };

  refresh();
  return capped < quantity
    ? { error: `남은 수량은 ${product.stock}장입니다.` }
    : {};
}

/** 장바구니에서 한 줄을 뺍니다 */
export async function removeFromCart(
  productId: string,
): Promise<CartEditState> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user.id)
    .eq("product_id", productId);

  if (error) return { error: `빼지 못했습니다: ${error.message}` };

  refresh();
  return {};
}

/**
 * `<form action={...}>` 에 바로 붙일 수 있는 형태.
 *
 * 폼에 붙이는 액션은 **아무것도 돌려주지 않아야** 합니다(void).
 * clearCart 는 오류 메시지를 돌려주므로 그대로 붙일 수 없어서 한 겹 감쌌습니다.
 */
export async function clearCartForm(): Promise<void> {
  await clearCart();
}

/** 장바구니를 전부 비웁니다 */
export async function clearCart(): Promise<CartEditState> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user.id);

  if (error) return { error: `비우지 못했습니다: ${error.message}` };

  refresh();
  return {};
}
