import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { formatPrice } from "@/lib/products";

export const metadata = { title: "내 정보 — 포켓몬 카드샵" };

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/mypage");

  const [profileResult, orderResult, admin] = await Promise.all([
    supabase
      .from("profiles")
      .select("nickname, phone, postcode, address1, address2")
      .eq("id", user.id)
      .maybeSingle(),
    // 접근 제한(RLS)이 내 주문만 돌려줍니다.
    supabase
      .from("orders")
      .select("order_no, total_amount, status")
      .in("status", ["paid", "shipped", "done"]),
    isAdmin(),
  ]);

  const profile = profileResult.data;
  const orders = orderResult.data ?? [];
  const spent = orders.reduce((sum, order) => sum + order.total_amount, 0);

  const address = profile?.address1
    ? "(" + (profile.postcode ?? "") + ") " + profile.address1 + " " + (profile.address2 ?? "")
    : null;

  return (
    <div className="mx-auto max-w-2xl">
      <span className="ribbon cut-sm">PROFILE</span>
      <h1 className="mt-2.5 text-[1.7rem] font-black tracking-tight text-ink-900">내 정보</h1>

      {admin && (
        <Link
          href="/admin"
          className="card poke-card mt-5 flex items-center justify-between gap-3 p-4"
        >
          <span className="flex items-center gap-2">
            <span className="rounded-md bg-ink-900 px-2 py-1 text-[0.7rem] font-bold text-volt-300">
              관리자
            </span>
            <span className="font-bold text-ink-900">관리자 화면 열기</span>
          </span>
          <span className="text-ink-400">→</span>
        </Link>
      )}

      {/* ── 요약 ── */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="card p-4">
          <p className="text-xs text-ink-500">주문한 횟수</p>
          <p className="mt-1 text-xl font-bold text-ink-900">
            {orders.length}건
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-ink-500">지금까지 쓴 금액</p>
          <p className="mt-1 text-xl font-bold text-poke-600">
            {formatPrice(spent)}
          </p>
        </div>
      </div>

      {/* ── 기본 정보 ── */}
      <dl className="card mt-4 space-y-2.5 p-5 text-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold text-ink-900">기본 정보</h2>
          <Link href="/mypage/edit" className="btn btn-outline btn-sm">
            고치기
          </Link>
        </div>
        <div className="flex justify-between gap-3 border-t-2 border-ink-100 pt-2.5">
          <dt className="text-ink-500">닉네임</dt>
          <dd className="font-medium text-ink-800">
            {profile?.nickname ?? "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-500">이메일</dt>
          <dd className="font-medium text-ink-800">{user.email}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-500">연락처</dt>
          <dd className="font-medium text-ink-800">{profile?.phone || "—"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="shrink-0 text-ink-500">기본 배송지</dt>
          <dd className="text-right font-medium text-ink-800">
            {address ?? "—"}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link href="/orders" className="btn btn-primary">
          주문 내역 보기
        </Link>
        <Link href="/cart" className="btn btn-outline">
          장바구니
        </Link>
      </div>
    </div>
  );
}
