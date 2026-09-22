"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CheckoutState = {
  error?: string;
  values?: {
    receiver_name?: string;
    receiver_phone?: string;
    postcode?: string;
    address1?: string;
    address2?: string;
    memo?: string;
  };
};

/**
 * 주문(결제 대기)을 만듭니다.
 *
 * 폼에서 받는 것은 **배송지뿐**입니다. 금액은 받지 않습니다.
 * 금액 계산은 데이터베이스 함수 create_order() 가 장바구니와 products 표를 읽어
 * 직접 합니다. 그래서 브라우저에서 금액을 조작할 방법이 없습니다.
 */
export async function createOrder(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const values = {
    receiver_name: String(formData.get("receiver_name") ?? "").trim(),
    receiver_phone: String(formData.get("receiver_phone") ?? "").trim(),
    postcode: String(formData.get("postcode") ?? "").trim(),
    address1: String(formData.get("address1") ?? "").trim(),
    address2: String(formData.get("address2") ?? "").trim(),
    memo: String(formData.get("memo") ?? "").trim(),
  };

  if (!values.receiver_name || !values.receiver_phone || !values.postcode || !values.address1) {
    return { error: "받는 분 · 연락처 · 우편번호 · 주소를 모두 입력해 주세요.", values };
  }
  if (values.receiver_name.length < 2) {
    return { error: "받는 분 이름을 2자 이상 적어 주세요.", values };
  }
  if (values.receiver_phone.replace(/[^0-9]/g, "").length < 9) {
    return { error: "연락처를 다시 확인해 주세요.", values };
  }

  const supabase = await createClient();
  const { data: orderNo, error } = await supabase.rpc("create_order", {
    p_receiver_name: values.receiver_name,
    p_receiver_phone: values.receiver_phone,
    p_postcode: values.postcode,
    p_address1: values.address1,
    p_address2: values.address2,
    p_memo: values.memo,
  });

  if (error) {
    // 데이터베이스 함수가 raise exception 으로 던진 한국어 문구가 그대로 옵니다.
    return { error: error.message, values };
  }
  if (!orderNo) {
    return { error: "주문을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.", values };
  }

  // 배송지를 다음에도 쓸 수 있게 프로필에 저장해 둡니다 (실패해도 주문은 그대로 진행)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await supabase
      .from("profiles")
      .update({
        phone: values.receiver_phone,
        postcode: values.postcode,
        address1: values.address1,
        address2: values.address2,
      })
      .eq("id", user.id);
  }

  revalidatePath("/", "layout");
  redirect(`/checkout/${orderNo}/pay`);
}
