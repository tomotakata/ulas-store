"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BANK_TRANSFER, PRODUCT } from "@/lib/constants";

function CheckoutContent() {
  const params = useSearchParams();
  const sessionId = params.get("sessionId");
  const reservationId = params.get("reservationId");
  const method = params.get("method");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionId) {
      setLoading(true);
      // sessionId in URL means direct redirect (fallback) - show a message
      setError("決済ページへのリダイレクトに失敗しました。トップページからやり直してください。");
      setLoading(false);
    }
  }, [sessionId]);

  // Bank transfer page
  if (reservationId && method === "bank") {
    return (
      <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-xl w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🏦</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">銀行振込のご案内</h1>
              <p className="text-gray-500 text-sm">
                ご予約番号: <span className="font-mono text-gray-700 font-bold">{reservationId}</span>
              </p>
            </div>

            <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-6 mb-6">
              <h2 className="text-sm font-bold text-cyan-800 mb-4">振込先口座情報</h2>
              <table className="w-full text-sm">
                <tbody className="space-y-2">
                  <tr>
                    <td className="text-gray-500 py-1.5 w-32">銀行名</td>
                    <td className="font-medium text-gray-900">{BANK_TRANSFER.bankName}</td>
                  </tr>
                  <tr>
                    <td className="text-gray-500 py-1.5">支店名</td>
                    <td className="font-medium text-gray-900">{BANK_TRANSFER.branchName}</td>
                  </tr>
                  <tr>
                    <td className="text-gray-500 py-1.5">口座種別</td>
                    <td className="font-medium text-gray-900">{BANK_TRANSFER.accountType}</td>
                  </tr>
                  <tr>
                    <td className="text-gray-500 py-1.5">口座番号</td>
                    <td className="font-mono font-bold text-gray-900 text-base">{BANK_TRANSFER.accountNumber}</td>
                  </tr>
                  <tr>
                    <td className="text-gray-500 py-1.5">口座名義</td>
                    <td className="font-medium text-gray-900">{BANK_TRANSFER.accountName}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-amber-800 text-sm font-semibold mb-2">振込金額</p>
              <p className="text-2xl font-black text-amber-900">
                ¥{PRODUCT.price.toLocaleString()}
                <span className="text-sm font-normal text-amber-700 ml-2">（税込・送料込）</span>
              </p>
            </div>

            <ul className="text-xs text-gray-500 space-y-2 mb-8">
              <li className="flex gap-1.5"><span className="text-amber-500 shrink-0">※</span>振込期限は{BANK_TRANSFER.deadline}です。</li>
              <li className="flex gap-1.5"><span className="text-amber-500 shrink-0">※</span>振込人名義はご注文者様のお名前でお振込ください。</li>
              <li className="flex gap-1.5"><span className="text-amber-500 shrink-0">※</span>入金確認後にご予約が確定し、確認メールをお送りします。</li>
              <li className="flex gap-1.5"><span className="text-amber-500 shrink-0">※</span>振込手数料はお客様のご負担となります。</li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/mypage" className="flex-1 text-center bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-6 rounded-xl transition-colors">
                マイページで確認する
              </Link>
              <Link href="/" className="flex-1 text-center border border-gray-200 hover:border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors">
                トップに戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Stripe redirect loading state
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {loading && (
          <>
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">決済ページに移動しています...</p>
          </>
        )}
        {error && (
          <div className="max-w-md">
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">エラーが発生しました</h1>
            <p className="text-red-500 text-sm mb-6">{error}</p>
            <Link href="/" className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-6 rounded-xl transition-colors">
              トップに戻る
            </Link>
          </div>
        )}
        {!loading && !error && (
          <div>
            <p className="text-gray-500">読み込み中...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
