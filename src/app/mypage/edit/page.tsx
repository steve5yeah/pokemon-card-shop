import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";

export const metadata = { title: "내 정보 고치기 — 포켓몬 카드샵" };

export default async function MyPageEditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/mypage/edit");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, phone, postcode, address1, address2")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-md">
      <Link
        href="/mypage"
        className="text-sm text-ink-500 hover:text-poke-600 hover:underline"
      >
        ← 내 정보
      </Link>
      <h1 className="mt-4 text-[1.7rem] font-black tracking-tight text-ink-900">내 정보 고치기</h1>

      <div className="card mt-5 p-5">
        <ProfileForm
          defaults={{
            nickname: profile?.nickname ?? "",
            phone: profile?.phone ?? "",
            postcode: profile?.postcode ?? "",
            address1: profile?.address1 ?? "",
            address2: profile?.address2 ?? "",
          }}
        />
      </div>
    </div>
  );
}
