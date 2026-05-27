"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ThanksContent() {
  const params = useSearchParams();
  const reservationId = params.get("reservationId");

  return (
    <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ご予約ありがとうございます！
          </h1>
          <p className="text-gray-500 mb-6">
            ULAS O3 fingerのご予約が完了しました。
          </p>

          {reservationId && (
            <div className="bg-gray-50 rounded-xl px-6 py-4 mb-6">
              <p className="text-xs text-gray-400 mb-1">予約番号</p>
              <p className="font-mono font-bold text-gray-800 text-sm break-all">{reservationId}</p>
            </div>
          )}

          <div className="text-left space-y-3 mb-8">
            <div className="flex items-start gap-3 bg-cyan-50 rounded-xl p-4">
              <span className="text-cyan-500 mt-0.5 shrink-0">✉️</span>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-0.5">確認メールを送信しました</p>
                <p className="text-xs text-gray-500">
                  ご登録のメールアドレスに予約確認メールをお送りしました。マイページへのログイン情報も記載されています。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
              <span className="text-blue-500 mt-0.5 shrink-0">📦</span>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-0.5">お届け予定</p>
                <p className="text-xs text-gray-500">
                  2026年10月上旬（9月中目標）のお届けを予定しています。
                  発送が近づいたらメールでご連絡します。
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/mypage"
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all text-center"
            >
              マイページを見る
            </Link>
            <Link
              href="/"
              className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors text-center"
            >
              トップに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ThanksPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    }>
      <ThanksContent />
    </Suspense>
  );
}
