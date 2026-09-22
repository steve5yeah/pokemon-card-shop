// 안전핀 — 브라우저 코드가 이 파일을 불러오면 빌드가 실패합니다.
// 이 파일은 시크릿 키를 쓰는 유일한 곳입니다.
import "server-only";

const TOSS_API = "https://api.tosspayments.com/v1/payments";

/** 토스 승인 응답에서 우리가 쓰는 부분만 */
export type TossPayment = {
  paymentKey: string;
  orderId: string;
  status: string;
  method?: string | null;
  totalAmount: number;
  approvedAt?: string | null;
  receipt?: { url?: string | null } | null;
  [key: string]: unknown;
};

export type TossError = { code: string; message: string };

/**
 * 시크릿 키로 Basic 인증 헤더를 만듭니다.
 * 규칙: "시크릿키:" 를 base64 로 인코딩 (비밀번호 자리는 비워 둡니다)
 */
function authHeader(): string {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    throw new Error("TOSS_SECRET_KEY 가 설정되지 않았습니다.");
  }
  return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}

/** 토스 응답이 성공인지 실패인지 구분해서 돌려줍니다 */
type TossResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: TossError };

async function callToss<T>(
  url: string,
  body: unknown,
  idempotencyKey: string,
): Promise<TossResult<T>> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json",
        // 같은 요청이 두 번 가도 토스가 한 번만 처리하게 하는 열쇠입니다.
        // (두 요청이 동시에 출발해도 이중 결제가 되지 않습니다)
        "Idempotency-Key": idempotencyKey.slice(0, 300),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const json = (await response.json()) as T & Partial<TossError>;

    if (!response.ok) {
      return {
        ok: false,
        error: {
          code: json.code ?? "SERVER_ERROR",
          message: json.message ?? `토스 응답 오류 (HTTP ${response.status})`,
        },
      };
    }

    return { ok: true, data: json as T };
  } catch (cause) {
    // 네트워크가 끊긴 경우 등. 키가 로그에 새지 않도록 메시지만 남깁니다.
    return {
      ok: false,
      error: {
        code: "SERVER_ERROR",
        message: cause instanceof Error ? cause.message : "알 수 없는 오류",
      },
    };
  }
}

/**
 * 결제 승인 — 이 호출이 성공해야 실제로 돈이 빠져나갑니다.
 *
 * ⚠️ amount 에는 주소창에서 온 값이 아니라 **우리 데이터베이스의 금액**을 넣으세요.
 */
export function confirmPayment(params: {
  paymentKey: string;
  orderId: string;
  amount: number;
}): Promise<TossResult<TossPayment>> {
  return callToss<TossPayment>(
    `${TOSS_API}/confirm`,
    params,
    `confirm-${params.orderId}`,
  );
}

/**
 * 결제 취소 — 승인은 됐는데 재고가 모자란 경우처럼,
 * 이미 빠져나간 돈을 되돌려야 할 때 씁니다.
 */
export function cancelPayment(params: {
  paymentKey: string;
  cancelReason: string;
}): Promise<TossResult<TossPayment>> {
  return callToss<TossPayment>(
    `${TOSS_API}/${encodeURIComponent(params.paymentKey)}/cancel`,
    { cancelReason: params.cancelReason },
    `cancel-${params.paymentKey}`,
  );
}
