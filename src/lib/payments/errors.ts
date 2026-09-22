/**
 * 토스가 돌려주는 에러 코드를 한국어 안내로 바꿉니다.
 *
 * 토스가 URL 로 보내 준 message 는 그대로 화면에 찍지 않습니다.
 * 주소창에 있는 값이라 누구나 고칠 수 있기 때문입니다.
 * 항상 이 표를 거친 우리 문구만 보여주고, 원문은 데이터베이스에만 남깁니다.
 *
 * 모르는 코드는 맨 아래 기본 문구로 떨어집니다.
 * 실제로 겪는 코드를 만날 때마다 한 줄씩 추가하면 됩니다.
 */
const MESSAGES: Record<string, string> = {
  // 사용자가 스스로 그만둔 경우
  PAY_PROCESS_CANCELED: "결제를 취소하셨어요.",
  PAY_PROCESS_ABORTED: "결제가 진행되지 않았어요. 잠시 후 다시 시도해 주세요.",
  USER_CANCEL: "결제를 취소하셨어요.",

  // 카드 문제
  REJECT_CARD_COMPANY:
    "카드사에서 결제를 거절했어요. 다른 카드로 시도하거나 카드사에 문의해 주세요.",
  INVALID_REJECT_CARD:
    "카드사에서 결제를 거절했어요. 다른 카드로 시도해 주세요.",
  INVALID_CARD_NUMBER: "카드번호를 다시 확인해 주세요.",
  INVALID_CARD_EXPIRATION: "카드 유효기간을 다시 확인해 주세요.",
  INVALID_STOPPED_CARD: "정지된 카드예요. 다른 카드를 사용해 주세요.",
  EXCEED_MAX_CARD_INSTALLMENT_PLAN: "선택한 할부 개월 수는 쓸 수 없어요.",
  NOT_SUPPORTED_INSTALLMENT_PLAN_CARD_OR_MERCHANT:
    "이 카드는 할부를 지원하지 않아요. 일시불로 시도해 주세요.",
  EXCEED_MAX_ONE_DAY_AMOUNT:
    "하루 결제 한도를 넘었어요. 내일 다시 시도하거나 다른 카드를 써 주세요.",

  // 기관 문제
  NOT_AVAILABLE_BANK: "지금은 은행 점검 시간이에요. 잠시 후 다시 시도해 주세요.",
  PROVIDER_ERROR: "일시적인 오류가 생겼어요. 잠시 후 다시 시도해 주세요.",
  PROVIDER_STATUS_UNHEALTHY:
    "결제 기관에 문제가 있어요. 잠시 후 다시 시도해 주세요.",

  // 시간 · 중복
  NOT_FOUND_PAYMENT_SESSION: "결제 시간이 만료됐어요. 처음부터 다시 진행해 주세요.",
  IDEMPOTENT_REQUEST_PROCESSING:
    "결제를 처리하는 중이에요. 잠시 후 주문 내역에서 확인해 주세요.",
  DUPLICATED_ORDER_ID: "이미 사용된 주문번호예요. 새로 주문해 주세요.",
  NOT_FOUND_PAYMENT: "결제 정보를 찾을 수 없어요. 고객센터로 문의해 주세요.",

  // 위젯이 화면 안에서 던지는 오류
  NEED_AGREEMENT_WITH_REQUIRED_TERMS: "필수 약관에 모두 동의해 주세요.",
  NOT_SELECTED_PAYMENT_METHOD: "결제수단을 먼저 골라 주세요.",
  NEED_CARD_PAYMENT_DETAIL: "카드사와 할부 기간을 골라 주세요.",
  UNSUPPORTED_TEST_PHASE_PAYMENT_METHOD:
    "테스트 환경에서는 쓸 수 없는 결제수단이에요. 카드로 시도해 주세요.",

  // 설정 문제 (개발자용)
  UNAUTHORIZED_KEY: "결제 설정에 문제가 있어요. 관리자에게 알려 주세요.",

  // 우리가 직접 만든 코드
  AMOUNT_MISMATCH: "결제 금액이 주문 금액과 달라 결제를 중단했어요.",
  ORDER_NOT_FOUND: "주문 정보를 찾을 수 없어요.",
  MISSING_PARAMS: "결제 정보가 올바르지 않아 결제를 중단했어요.",
  NOT_PAYABLE: "이미 처리된 주문이거나 결제할 수 없는 주문이에요.",
  STOCK_SHORTAGE:
    "죄송합니다. 재고가 모자라 결제를 취소했어요. 결제하신 금액은 자동으로 환불됩니다.",
  SERVER_ERROR: "결제를 처리하다가 문제가 생겼어요. 주문 내역을 확인해 주세요.",
};

export function tossErrorMessage(code: string | null | undefined): string {
  if (!code) return "결제에 실패했어요. 잠시 후 다시 시도해 주세요.";
  return (
    MESSAGES[code] ??
    `결제에 실패했어요. 잠시 후 다시 시도해 주세요. (코드: ${code})`
  );
}
