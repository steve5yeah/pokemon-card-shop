import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { ProductSet } from "@/lib/products";
import ProductForm from "../../ProductForm";

export const metadata = { title: "카드 등록 — 포켓몬 카드샵" };

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sets")
    .select("id, code, name")
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/products"
        className="text-sm text-ink-500 hover:text-poke-600 hover:underline"
      >
        ← 카드 관리
      </Link>
      <h1 className="mt-4 text-[1.7rem] font-black tracking-tight text-ink-900">카드 등록</h1>

      <div className="card mt-5 p-5">
        <ProductForm sets={(data ?? []) as ProductSet[]} />
      </div>
    </div>
  );
}
