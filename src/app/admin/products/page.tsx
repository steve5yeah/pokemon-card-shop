import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PRODUCT_SELECT, type ProductWithSet } from "@/lib/products";
import AdminProductRow from "./AdminProductRow";

export const metadata = { title: "카드 관리 — 포켓몬 카드샵" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const supabase = await createClient();

  /**
   * 관리자는 숨긴 카드까지 전부 봅니다.
   * (products 표에 관리자용 SELECT 정책을 따로 두었기 때문입니다 —
   *  손님에게는 is_active = true 인 카드만 보입니다)
   */
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("is_active", { ascending: false })
    .order("created_at", { ascending: false })
    .order("price", { ascending: false });

  const products = (data ?? []) as unknown as ProductWithSet[];
  const hidden = products.filter((p) => !p.is_active).length;
  const lowStock = products.filter((p) => p.is_active && p.stock <= 3).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[1.7rem] font-black tracking-tight text-ink-900">카드 관리</h1>
          <p className="mt-1.5 text-sm text-ink-600">
            전체 {products.length}장 · 숨김 {hidden}장 · 품절임박 {lowStock}장
          </p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary">
          + 카드 등록
        </Link>
      </div>

      {saved === "1" && (
        <p className="mt-4 rounded-lg border-2 border-poke-300 bg-poke-50 px-4 py-2.5 text-sm text-poke-800">
          ✅ 저장했습니다.
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-lg border-2 border-poke-500 bg-poke-50 px-4 py-3 text-sm font-semibold text-poke-800">
          카드를 불러오지 못했습니다: {error.message}
        </p>
      )}

      <div className="card mt-5 px-4">
        <ul className="divide-y-2 divide-ink-100">
          {products.map((product) => (
            <AdminProductRow key={product.id} product={product} />
          ))}
        </ul>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-ink-400">
        카드는 지우지 않고 <b>숨김</b>으로 둡니다. 과거 주문 내역이 이 카드를
        가리키고 있어서, 지우면 영수증에서 이름이 사라집니다.
      </p>
    </div>
  );
}
