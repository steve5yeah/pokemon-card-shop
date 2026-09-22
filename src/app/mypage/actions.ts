"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = {
  error?: string;
  notice?: string;
};

/** 닉네임과 기본 배송지를 고칩니다 */
export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const nickname = String(formData.get("nickname") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const postcode = String(formData.get("postcode") ?? "").trim();
  const address1 = String(formData.get("address1") ?? "").trim();
  const address2 = String(formData.get("address2") ?? "").trim();

  if (nickname.length < 2 || nickname.length > 12) {
    return { error: "닉네임은 2~12자로 지어 주세요." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase
    .from("profiles")
    .update({ nickname, phone, postcode, address1, address2 })
    .eq("id", user.id);

  if (error) return { error: `저장하지 못했습니다: ${error.message}` };

  revalidatePath("/", "layout");
  revalidatePath("/mypage");
  return { notice: "저장했습니다." };
}
