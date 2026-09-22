import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PokeballLogo from "@/components/PokeballLogo";
import { createClient } from "@/lib/supabase/server";
import { cardImage } from "@/lib/pokemon";
import { formatPrice } from "@/lib/products";
import {
  ORDER_SELECT,
  ORDER_STATUSES,
  formatDateTime,
  paymentMethodLabel,
  type OrderWithDetail,
} from "@/lib/orders";

export const metadata = { title: "주문 상세 — 포켓몬 카드샵" };

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNo: string }>;
  searchParams: Promise<{ paid?: string }>;
}) {
  const { orderNo } = await params;
  const { paid } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/orders/${orderNo}`);

  /**
   * 접근 제한(RLS)이 "내 주문만"을 보장합니다.
   * 다른 사람의 주문번호를 주소창에 넣으면 데이터베이스가 0줄을 돌려주고 404가 됩니다.
   * 화면에 버튼이 없어서가 아니라, 데이터 자체가 안 오는 것이 핵심입니다.
   */
  const { data } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("order_no", orderNo)
    .maybeSingle();

  if (!data) notFound();
  const order = data as unknown as OrderWithDetail;

  // payments 는 1:1 관계지만 Supabase 가 배열로 줄 수도 있어 둘 다 받습니다.
  const payment = Array.isArray(order.payments)
    ? (order.payments[0] ?? null)
    : order.payments;
  const status = ORDER_STATUSES[order.status];
  const justPaid = paid === "1" && order.status === "paid";

  return (
    <div className="mx-auto max-w-2xl">
      {justPaid && (
        <div className="rounded-2xl bg-poke-50 px-5 py-6 text-center">
          <p className="text-4xl">🎉</p>
          <h1 className="mt-2.5 text-xl font-bold text-poke-800">
            결제가 완료되었습니다
          </h1>
          <p className="mt-1.5 text-sm text-poke-700">
            주문해 주셔서 고맙습니다. 곧 배송 준비를 시작합니다.
          </p>
        </div>
      )}

      <div
        className={`flex flex-wrap items-center justify-between gap-3 ${justPaid ? "mt-7" : ""}`}
      >
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-ink-900">주문 상세</h2>
            <span
              className={`rounded-md px-2 py-0.5 text-[0.7rem] font-bold ${status.badge}`}
            >
              {status.label}
            </span>
          </div>
          <p className="mt-1 font-mono text-sm text-ink-500">{order.order_no}</p>
        </div>
        <Link href="/orders" className="btn btn-outline btn-sm">
          주문 내역
        </Link>
      </div>

      {order.status === "failed" && order.fail_code && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          결제가 완료되지 않은 주문입니다. (코드: {order.fail_code})
        </div>
      )}

      {/* ── 주문한 카드 ── */}
      <div className="card mt-5 px-4">
        <ul className="divide-y divide-ink-100">
          {order.order_items.map((item) => {
            const image = cardImage({
              image_url: item.product_image_url,
              pokedex_no: item.pokedex_no,
            });
            return (
              <li key={item.id} className="flex items-center gap-3 py-3.5">
                <div className="poke-art h-20 w-[3.75rem] shrink-0 bg-ink-50">
                  {image ? (
                    <Image
                      src={image}
                      alt={item.product_name}
                      fill
                      sizes="60px"
                      className="object-contain p-1"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center opacity-20">
                      <PokeballLogo size={24} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {item.product_id ? (
                    <Link
                      href={`/products/${item.product_id}`}
                      className="block truncate font-bold text-ink-900 hover:underline"
                    >
                      {item.product_name}
                    </Link>
                  ) : (
                    <p className="truncate font-bold text-ink-900">
                      {item.product_name}
                    </p>
                  )}
                  <p className="text-sm text-ink-500">
                    {formatPrice(item.unit_price)} × {item.quantity}장
                  </p>
                </div>
                <p className="shrink-0 font-bold tabular-nums">
                  {formatPrice(item.line_total)}
                </p>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── 금액 ── */}
      <dl className="card mt-4 space-y-2 p-5 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-600">카드값</dt>
          <dd className="font-medium tabular-nums">
            {formatPrice(order.items_amount)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-600">배송비</dt>
          <dd className="font-medium tabular-nums">
            {order.shipping_fee === 0 ? (
              <span className="text-poke-600">무료</span>
            ) : (
              formatPrice(order.shipping_fee)
            )}
          </dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-ink-100 pt-2.5">
          <dt className="font-bold text-ink-900">결제 금액</dt>
          <dd className="text-lg font-bold text-poke-600 tabular-nums">
            {formatPrice(order.total_amount)}
          </dd>
        </div>
      </dl>

      {/* ── 결제 정보 ── */}
      {payment && (
        <dl className="card mt-4 space-y-2 p-5 text-sm">
          <h3 className="mb-1 font-bold text-ink-900">결제 정보</h3>
          <div className="flex justify-between gap-3">
            <dt className="text-ink-500">결제수단</dt>
            <dd className="font-medium text-ink-800">
              {paymentMethodLabel(payment.method)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-ink-500">승인 시각</dt>
            <dd className="font-medium text-ink-800">
              {formatDateTime(payment.approved_at)}
            </dd>
          </div>
          {payment.receipt_url && (
            <div className="flex justify-between gap-3">
              <dt className="text-ink-500">영수증</dt>
              <dd>
                <a
                  href={payment.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-poke-600 hover:underline"
                >
                  토스 영수증 열기 ↗
                </a>
              </dd>
            </div>
          )}
        </dl>
      )}

      {/* ── 배송지 ── */}
      <dl className="card mt-4 space-y-2 p-5 text-sm">
        <h3 className="mb-1 font-bold text-ink-900">배송지</h3>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-500">받는 분</dt>
          <dd className="font-medium text-ink-800">{order.receiver_name}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-500">연락처</dt>
          <dd className="font-medium text-ink-800">{order.receiver_phone}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="shrink-0 text-ink-500">주소</dt>
          <dd className="text-right font-medium text-ink-800">
            ({order.postcode}) {order.address1} {order.address2}
          </dd>
        </div>
        {order.memo && (
          <div className="flex justify-between gap-3">
            <dt className="shrink-0 text-ink-500">요청사항</dt>
            <dd className="text-right font-medium text-ink-800">{order.memo}</dd>
          </div>
        )}
        <div className="flex justify-between gap-3 border-t border-ink-100 pt-2.5">
          <dt className="text-ink-500">주문 시각</dt>
          <dd className="font-medium text-ink-800">
            {formatDateTime(order.created_at)}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/products" className="btn btn-primary">
          카드 더 둘러보기
        </Link>
      </div>
    </div>
  );
}
