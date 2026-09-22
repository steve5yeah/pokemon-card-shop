import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Product, ProductSet } from "@/lib/products";
import ProductForm from "../../../ProductForm";

export const metadata = { title: "카드 수정 — 포켓몬 카드샵" };

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const supabase = await createClient();
  const [productResult, setsResult] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("sets").select("id, code, name").order("sort_order"),
  ]);

  if (!productResult.data) notFound();
  const product = productResult.data as Product;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/products"
        className="text-sm text-ink-500 hover:text-poke-600 hover:underline"
      >
        ← 카드 관리
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-ink-900">카드 수정</h1>
      <p className="mt-1.5 text-sm text-ink-500">{product.name}</p>

      <div className="card mt-5 p-5">
        <ProductForm
          product={product}
          sets={(setsResult.data ?? []) as ProductSet[]}
        />
      </div>

      <p className="mt-4 text-center text-sm">
        <Link
          href={`/products/${product.id}`}
          className="text-ink-500 hover:text-poke-600 hover:underline"
        >
          손님에게 보이는 화면 보기 ↗
        </Link>
      </p>
    </div>
  );
}
