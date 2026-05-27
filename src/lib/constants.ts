export const PRODUCT = {
  id: "ulas-o3-finger",
  name: "ULAS O3 finger",
  price: 18700,
  originalPrice: 19800,
  description: "水からオゾン水を生成し、そのままスプレーできるコンパクトタイプのオゾン水生成器。",
  deliveryDate: "2026年10月上旬",
  reservationStart: "2026年5月28日（木）9:00",
  reservationEnd: "2026年7月31日",
};

export const COMPANY = {
  name: "株式会社ULAS",
  email: "support@ulas.jp",
  url: "https://store.ulas.jp",
};

export const BANK_TRANSFER = {
  bankName: "三井住友銀行",
  branchName: "渋谷支店",
  accountType: "普通",
  accountNumber: "9680437",
  accountName: "カ）ユーラス",
  deadline: "ご注文日より3営業日以内",
};

export const RESERVATION_DEADLINE = new Date("2026-07-31T23:59:59+09:00");
// TEST MODE: set to past date so reservation button is always enabled
export const RESERVATION_START = new Date("2026-05-28T09:00:00+09:00");
