"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PRODUCT, RESERVATION_START, RESERVATION_DEADLINE } from "@/lib/constants";
import ReservationForm from "@/components/ui/ReservationForm";

function useCountdown(target: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, past: false });

  useEffect(() => {
    function calc() {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, past: true });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds, past: false });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [target]);

  return timeLeft;
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/10 backdrop-blur rounded-xl px-2 py-2 sm:px-4 sm:py-3 min-w-[52px] sm:min-w-[70px] text-center border border-white/20">
        <span className="text-2xl sm:text-4xl font-bold text-white tabular-nums">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs text-white/60 mt-1">{label}</span>
    </div>
  );
}

const FEATURES = [
  {
    icon: "💧",
    title: "水からオゾン水を生成",
    desc: "蛇口や水道水から直接オゾン水を生成。薬品・洗剤不要のクリーンな除菌・消臭を実現します。",
  },
  {
    icon: "✋",
    title: "コンパクトなフィンガータイプ",
    desc: "手の指に装着するだけのコンパクト設計。キッチン・洗面所・どこでも手軽に使用できます。",
  },
  {
    icon: "⚡",
    title: "充電式で長時間使用",
    desc: "USB充電対応。一度の充電で長時間使用可能。アウトドアや旅行先でも活躍します。",
  },
  {
    icon: "🌿",
    title: "環境にやさしい",
    desc: "化学物質を使わないため環境負荷ゼロ。オゾンは水に戻るため安全で持続可能な除菌方法です。",
  },
];

const SPECS = [
  { label: "製品名", value: "ULAS O3 finger" },
  { label: "タイプ", value: "フィンガータイプ オゾン水生成器" },
  { label: "電源", value: "USB充電式" },
  { label: "重量", value: "約50g（予定）" },
  { label: "カラー", value: "ホワイト" },
  { label: "販売価格", value: "¥18,700（税込・送料込）" },
  { label: "お届け予定", value: "2026年10月上旬（9月中目標）" },
  { label: "保証", value: "初期不良対応" },
];

export default function HomePage() {
  const toStart = useCountdown(RESERVATION_START);
  const toDeadline = useCountdown(RESERVATION_DEADLINE);
  const reservationOpen = toStart.past;

  return (
    <div className="overflow-x-hidden">
      <section className="relative bg-[#0a0f1e] min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
          <div className="inline-flex items-center gap-2 bg-cyan-500/20 text-cyan-400 text-xs font-semibold px-4 py-1.5 rounded-full border border-cyan-500/30 mb-6">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            先行予約受付中
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-4 tracking-tight leading-none">
            ULAS <span className="text-cyan-400">O3 finger</span>
          </h1>
          <p className="text-xl sm:text-2xl text-white/70 mb-3 font-light">
            水からオゾン水を生成する、新感覚の除菌・消臭デバイス
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-10">
            <span className="text-4xl sm:text-5xl font-black text-white">
              ¥{PRODUCT.price.toLocaleString()}
            </span>
            <div className="flex items-center sm:flex-col sm:items-start gap-3 sm:gap-0">
              <span className="text-base text-white/40 line-through">
                ¥{PRODUCT.originalPrice.toLocaleString()}
              </span>
              <span className="text-xs text-white/50">税込・送料込</span>
            </div>
            <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">先行特価</div>
          </div>
          <div className="mb-10">
            {!reservationOpen ? (
              <>
                <p className="text-white/60 text-sm mb-4">予約開始まで</p>
                <div className="flex items-end justify-center gap-3">
                  <CountdownUnit value={toStart.days} label="日" />
                  <span className="text-white/40 text-2xl mb-4">:</span>
                  <CountdownUnit value={toStart.hours} label="時間" />
                  <span className="text-white/40 text-2xl mb-4">:</span>
                  <CountdownUnit value={toStart.minutes} label="分" />
                  <span className="text-white/40 text-2xl mb-4">:</span>
                  <CountdownUnit value={toStart.seconds} label="秒" />
                </div>
                <p className="text-white/40 text-xs mt-3">{PRODUCT.reservationStart}より予約開始予定</p>
              </>
            ) : !toDeadline.past ? (
              <>
                <p className="text-cyan-400 text-sm mb-4 font-semibold">予約受付中！締切まで</p>
                <div className="flex items-end justify-center gap-3">
                  <CountdownUnit value={toDeadline.days} label="日" />
                  <span className="text-white/40 text-2xl mb-4">:</span>
                  <CountdownUnit value={toDeadline.hours} label="時間" />
                  <span className="text-white/40 text-2xl mb-4">:</span>
                  <CountdownUnit value={toDeadline.minutes} label="分" />
                  <span className="text-white/40 text-2xl mb-4">:</span>
                  <CountdownUnit value={toDeadline.seconds} label="秒" />
                </div>
              </>
            ) : (
              <p className="text-red-400 text-sm font-semibold">先行予約受付終了</p>
            )}
          </div>
          <Link
            href="#reservation"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-lg px-10 py-4 rounded-full transition-all shadow-lg shadow-cyan-500/30"
          >
            今すぐ予約する <span>→</span>
          </Link>
          <p className="text-white/30 text-xs mt-4">お届け予定: {PRODUCT.deliveryDate}</p>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">商品ギャラリー</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 rounded-2xl aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-5xl text-gray-300 mb-3">📷</div>
                <p className="text-gray-400 text-sm font-medium">商品画像準備中</p>
                <p className="text-gray-300 text-xs mt-1">Image {i}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">ULAS O3 fingerの特徴</h2>
            <p className="text-gray-500 text-lg">新しい除菌・消臭の体験を、日常の手元に</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0a0f1e] py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">製品仕様</h2>
          <div className="rounded-2xl overflow-hidden border border-white/10">
            {SPECS.map((spec, i) => (
              <div key={spec.label} className={`flex flex-col sm:flex-row sm:gap-4 px-6 py-3 ${i % 2 === 0 ? "bg-white/5" : "bg-transparent"}`}>
                <span className="text-white/50 text-xs sm:text-sm sm:min-w-[130px] mb-0.5 sm:mb-0">{spec.label}</span>
                <span className="text-white text-sm font-medium">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="reservation" className="bg-white py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">先行予約フォーム</h2>
            <p className="text-gray-500">
              先行予約特別価格{" "}
              <span className="text-2xl font-bold text-cyan-600">¥{PRODUCT.price.toLocaleString()}</span>
              <span className="text-gray-400 text-sm ml-1">（税込・送料込）</span>
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <ReservationForm />
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">ご注意事項</h2>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="text-cyan-500 mt-0.5 shrink-0">•</span>
              本商品は先行予約商品です。お届けは{PRODUCT.deliveryDate}を予定しています（変更の場合はメールにてご連絡します）。
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-500 mt-0.5 shrink-0">•</span>
              銀行振込をお選びの場合、ご注文後7日以内にお振込ください。期限内にご入金が確認できない場合はキャンセルとなる場合があります。
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-500 mt-0.5 shrink-0">•</span>
              お客様都合による返品・交換はお受けできません。商品に瑕疵がある場合のみ対応いたします。
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-500 mt-0.5 shrink-0">•</span>
              ご予約内容の変更・キャンセルはsupport@ulas.jpまでご連絡ください。
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-500 mt-0.5 shrink-0">•</span>
              初めてご予約のお客様には、マイページのログイン情報（パスワード）をメールにてお送りします。
            </li>
          </ul>
          <div className="mt-8 text-center">
            <Link href="/tokushoho" className="text-cyan-600 hover:text-cyan-500 text-sm underline">
              特定商取引法に基づく表示を確認する →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
