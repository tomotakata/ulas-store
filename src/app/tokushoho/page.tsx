import Link from "next/link";
import { COMPANY, PRODUCT, BANK_TRANSFER } from "@/lib/constants";

export default function TokushohoPage() {
  const items = [
    { label: "販売業者", value: COMPANY.name },
    { label: "運営責任者", value: "森行秀和" },
    { label: "所在地", value: "〒107-0061 東京都港区北青山1-2-18" },
    { label: "電話番号", value: "お問い合わせはメールにて承ります" },
    { label: "メールアドレス", value: COMPANY.email, isEmail: true },
    { label: "販売URL", value: COMPANY.url, isLink: true },
    {
      label: "販売価格",
      value: `¥${PRODUCT.price.toLocaleString()}（税込・送料込）`,
    },
    {
      label: "支払方法",
      value: "クレジットカード、銀行振込",
    },
    {
      label: "支払時期",
      value:
        "クレジットカード：注文時即時決済。銀行振込：ご注文後7日以内にお振込ください。",
    },
    {
      label: "振込先",
      value: `${BANK_TRANSFER.bankName} ${BANK_TRANSFER.branchName} ${BANK_TRANSFER.accountType} ${BANK_TRANSFER.accountNumber} ${BANK_TRANSFER.accountName}`,
    },
    {
      label: "商品引渡し時期",
      value: "2026年10月上旬（9月中目標）",
    },
    {
      label: "返品・交換について",
      value:
        "商品に瑕疵がある場合のみ対応いたします。お客様都合による返品・交換はお受けできません。",
    },
    {
      label: "特記事項",
      value:
        "本商品は先行予約商品です。製品の仕様・デザイン・発売日等は予告なく変更される場合があります。",
    },
  ];

  return (
    <div className="bg-white min-h-[80vh]">
      <div className="bg-[#0a0f1e] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            特定商取引法に基づく表示
          </h1>
          <p className="text-white/50 text-sm mt-2">
            特定商取引法（特商法）の規定に基づき、以下の事項を表示します。
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-2xl border border-gray-200 overflow-hidden">
          {items.map((item, i) => (
            <div
              key={item.label}
              className={`flex flex-col sm:flex-row sm:gap-8 px-6 py-5 border-b border-gray-100 last:border-b-0 ${
                i % 2 === 0 ? "bg-gray-50" : "bg-white"
              }`}
            >
              <dt className="text-sm font-semibold text-gray-700 sm:w-48 shrink-0 mb-1 sm:mb-0">
                {item.label}
              </dt>
              <dd className="text-sm text-gray-600 leading-relaxed">
                {item.isEmail ? (
                  <a
                    href={`mailto:${item.value}`}
                    className="text-cyan-600 hover:text-cyan-500 underline"
                  >
                    {item.value}
                  </a>
                ) : item.isLink ? (
                  <a
                    href={item.value}
                    className="text-cyan-600 hover:text-cyan-500 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.value}
                  </a>
                ) : (
                  item.value
                )}
              </dd>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/" className="text-cyan-600 hover:text-cyan-500 text-sm underline">
            ← トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
