# 포켓몬 카드샵 🔴⚪

포켓몬 트레이딩 카드를 파는 쇼핑몰입니다. **개발을 배우면서 한 단계씩 만든 연습용 프로젝트**입니다.

> ⚠️ 실제로 카드를 판매하지 않습니다. 결제는 토스페이먼츠 **테스트 모드**라서 돈이 빠져나가지 않습니다.
> 포켓몬 및 포켓몬 캐릭터는 Nintendo / Creatures / GAME FREAK 의 상표입니다.
> 카드 그림은 무료 공개 API인 [PokeAPI](https://pokeapi.co)의 공식 일러스트를 씁니다.

---

## 무엇으로 만들었나

| 역할 | 도구 |
| --- | --- |
| 화면 | [Next.js 15](https://nextjs.org) (App Router) + React 19 + TypeScript |
| 디자인 | [Tailwind CSS v4](https://tailwindcss.com) — 설정 파일 없이 `globals.css`의 `@theme`에 색을 정의 |
| 회원 · 데이터 · 사진 | [Supabase](https://supabase.com) (Postgres + Auth + Storage) |
| 결제 | [토스페이먼츠 결제위젯 v2](https://docs.tosspayments.com) |
| 배포 | [Vercel](https://vercel.com) |

## 할 수 있는 것

- 카드 목록 · 상세 (희귀도 7등급 · 타입 10종 · 확장팩 6개)
- 검색 / 필터(희귀도 · 타입 · 확장팩 · 가격대) / 정렬 — **조건이 주소창에 남아 링크로 공유 가능**
- 회원가입 · 로그인 · 로그아웃
- 장바구니 (수량 변경 · 배송비 계산 · 5만원 이상 무료배송)
- 주문 · 토스페이먼츠 결제 · 주문 내역 · 영수증
- 마이페이지 (닉네임 · 기본 배송지)
- 관리자 — 대시보드, 카드 등록/수정/재고, 주문 상태 변경, 주문 취소(재고 되돌림)

---

## 돈을 다루는 규칙 💰

이 프로젝트에서 가장 신경 쓴 부분입니다. **금액은 브라우저가 절대 정하지 못합니다.**

1. **장바구니에 가격을 저장하지 않습니다.** 상품 id 와 수량만 담고, 가격은 항상 `products` 표에서 다시 읽습니다.
2. **주문 생성은 데이터베이스 함수(`create_order`)가 합니다.** 폼에서는 배송지만 받고, 금액은 함수가 장바구니와 상품 가격을 읽어 직접 계산합니다.
3. **`orders` 표에 사용자용 INSERT · UPDATE 정책이 없습니다.** 브라우저에서 주문을 위조하거나 상태를 `paid`로 바꿀 길이 아예 없습니다.
4. **결제 확정 함수(`complete_order`)는 서버 전용 키만 부를 수 있습니다.** 로그인한 사용자도 부를 수 없습니다.
5. **주소창 금액과 데이터베이스 금액이 다르면 토스 승인 API를 호출조차 하지 않습니다.** 승인을 안 하면 돈은 빠지지 않습니다.
6. **결제 확정은 한 트랜잭션입니다.** 재고 차감 · 결제 기록 · 상태 변경 · 장바구니 비우기가 전부 성공하거나 전부 취소됩니다.
7. **같은 요청이 두 번 와도 안전합니다.** 이미 `paid`인 주문은 승인을 다시 부르지 않아 재고가 두 번 깎이지 않습니다.
8. **`TOSS_SECRET_KEY`와 `SUPABASE_SECRET_KEY`는 브라우저로 나가지 않습니다.** 쓰는 파일 맨 윗줄에 `import "server-only"`를 넣어, 실수로 클라이언트에서 불러오면 빌드가 실패합니다.

---

## 폴더 구조

```
src/
├─ middleware.ts          로그인 상태 유지 + 보호 경로(/cart /checkout /orders /mypage /admin)
├─ lib/
│  ├─ supabase/
│  │  ├─ client.ts        브라우저용
│  │  ├─ server.ts        서버 컴포넌트 · 서버 액션용 (쿠키 기반)
│  │  ├─ middleware.ts    세션 갱신 + 보호 경로 판단
│  │  └─ admin.ts         ★서버 전용 키 (결제 확정에서만 씀)
│  ├─ products.ts         희귀도 · 타입 · 정렬 · 가격대 상수, 주소 만들기
│  ├─ pokemon.ts          PokeAPI 그림 주소 만들기
│  ├─ cart.ts             배송비 규칙, 금액 계산
│  ├─ orders.ts           주문 상태 라벨, 날짜 포맷, 한글 조사 처리
│  ├─ admin.ts            관리자 여부 확인
│  └─ payments/
│     ├─ toss.ts          ★승인 · 취소 API 호출 (시크릿 키를 쓰는 유일한 곳)
│     ├─ confirm.ts       ★돈을 지키는 곳 — 금액 대조 · 중복 방어
│     └─ errors.ts        토스 에러 코드 → 한국어 문구
├─ components/            헤더 · 모바일 탭 · 몬스터볼 로고 · 제출 버튼
└─ app/
   ├─ page.tsx            홈
   ├─ products/           카드 목록 · 상세 · 필터 · 담기
   ├─ cart/               장바구니
   ├─ checkout/           주문서 → [주문번호]/pay 결제위젯
   ├─ api/payments/       토스가 결제 후 돌아오는 자리 (confirm · fail)
   ├─ orders/             주문 내역 · 상세 · 실패 안내
   ├─ mypage/             내 정보
   └─ admin/              관리자 (대시보드 · 카드 · 주문)
```

## 데이터베이스

| 표 | 내용 |
| --- | --- |
| `profiles` | 회원 프로필 (가입하면 트리거가 자동 생성) |
| `sets` | 확장팩 |
| `products` | 판매 카드 (지우지 않고 `is_active = false`로 숨김) |
| `cart_items` | 장바구니 — `(user_id, product_id)` 복합 기본키 |
| `orders` | 주문 — `total_amount`가 결제 금액의 유일한 기준 |
| `order_items` | 주문 항목 — 이름 · 가격 · 그림을 주문 당시 값으로 복사(스냅샷) |
| `payments` | 결제 — `order_id`와 `payment_key`가 UNIQUE (중복 승인 차단) |
| `admins` | 관리자 이메일 명단 (Supabase 대시보드에서만 추가) |

함수: `create_order` · `complete_order` · `fail_order` · `cancel_order` · `is_admin` · `make_order_no`

모든 표에 RLS(Row Level Security, 줄 단위 접근 제한)가 켜져 있습니다. 남의 주문 · 장바구니는 주문번호를 알아도 조회되지 않습니다.

---

## 개발 환경에서 돌리기

```bash
npm install
```

`.env.example`을 복사해 `.env.local`을 만들고 값을 채웁니다.

```
SUPABASE_URL=https://<프로젝트>.supabase.co
SUPABASE_ANON_KEY=<anon 키>
SITE_URL=                      # 비우면 접속한 주소를 씁니다
TOSS_CLIENT_KEY=test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm
TOSS_SECRET_KEY=test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6
SUPABASE_SECRET_KEY=<service_role 키>   # 결제 확정에만 씀. 절대 공개 금지
```

> `next.config.ts`가 `SUPABASE_URL` → `NEXT_PUBLIC_SUPABASE_URL`, `TOSS_CLIENT_KEY` → `NEXT_PUBLIC_TOSS_CLIENT_KEY`로 옮겨 담습니다.
> **시크릿 키 두 개는 절대 `env` 블록에 넣지 마세요.** 넣으면 브라우저 코드에 그대로 박힙니다.

```bash
npm run dev     # http://localhost:3000
npm run build   # 배포 전 확인
```

### 시크릿 키가 새지 않았는지 확인하는 방법

```bash
npm run build
grep -rE "test_gsk_[A-Za-z0-9]|sb_secret_[A-Za-z0-9]" .next/static   # 아무것도 안 나와야 정상
```

> 뒤에 `[A-Za-z0-9]` 를 붙인 이유: Supabase 라이브러리 안에 키 종류를 판별하는
> `startsWith("sb_secret_")` 코드가 들어 있어, 접두사만 찾으면 **키가 새지 않았는데도**
> 걸립니다. 진짜 키는 접두사 뒤에 글자가 이어지므로 이렇게 찾아야 정확합니다.

## 배포 (Vercel)

1. GitHub 저장소에 올립니다.
2. Vercel에서 저장소를 연결합니다 (설정은 기본값 그대로).
3. Settings → Environment Variables 에 위 5개를 **접두사 없이** 그대로 넣습니다.
   `TOSS_SECRET_KEY`와 `SUPABASE_SECRET_KEY`는 **Sensitive**로 표시합니다.
   `SITE_URL`은 배포 주소(`https://….vercel.app`)로 넣습니다.
4. Supabase → Authentication → URL Configuration 에 배포 주소를 추가합니다.
5. 환경변수를 바꾼 뒤에는 **다시 배포**해야 반영됩니다.

관리자 화면을 쓰려면 Supabase → Table Editor → `admins` 표에 본인 이메일을 넣고, 그 이메일로 가입하세요.
