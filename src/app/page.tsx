"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { PRODUCT, RESERVATION_START, RESERVATION_DEADLINE } from "@/lib/constants";
import ReservationForm from "@/components/ui/ReservationForm";

/* ─── Hooks ─── */
function useCountdown(target: Date) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    past: false,
  });

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

/* ─── Sub-components ─── */
function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="backdrop-blur rounded-lg px-3 py-2 min-w-[56px] text-center border border-white/20"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        <span
          className="text-3xl font-bold text-white tabular-nums"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs text-white/60 mt-1">{label}</span>
    </div>
  );
}

/* ─── Data ─── */
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

/* ─── Page ─── */
export default function HomePage() {
  const toStart = useCountdown(RESERVATION_START);
  const toDeadline = useCountdown(RESERVATION_DEADLINE);
  const reservationOpen = toStart.past;

  // Floating CTA: hide when reservation section is visible
  const reservationRef = useRef<HTMLElement>(null);
  const [showFloatingCta, setShowFloatingCta] = useState(true);

  useEffect(() => {
    const el = reservationRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowFloatingCta(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="overflow-x-hidden" style={{ fontFamily: "var(--font-body)" }}>

      {/* ═══════════════════════════════════════════
          SECTION 1 — HERO
      ═══════════════════════════════════════════ */}
      <section
        className="w-full min-h-screen flex items-center relative overflow-hidden"
        style={{ background: "#050a14" }}
      >
        {/* Background glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
            style={{ background: "radial-gradient(circle, #22d3ee 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10"
            style={{ background: "#2563eb" }} />
        </div>

        <div className="relative w-full lp-content py-20">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <span
              className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full border"
              style={{
                background: "rgba(34,211,238,0.15)",
                borderColor: "rgba(34,211,238,0.4)",
                color: "#22d3ee",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              先行予約受付中
            </span>
          </div>

          {/* Logo headline */}
          <div className="text-center mb-6">
            <div
              className="text-7xl leading-none font-black tracking-widest"
              style={{
                fontFamily: "var(--font-display)",
                color: "#22d3ee",
                textShadow: "0 0 40px rgba(34,211,238,0.5)",
              }}
            >
              ULAS
            </div>
            <div
              className="text-4xl font-black tracking-wider text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              O3 finger
            </div>
          </div>

          {/* Subheadline */}
          <p className="text-center text-white/70 text-base leading-relaxed mb-8 px-2">
            水からオゾン水を生成する<br />
            <span className="text-white font-semibold">次世代デバイス</span>
          </p>

          {/* Divider */}
          <div className="border-t border-white/10 mb-8" />

          {/* Price block */}
          <div
            className="rounded-2xl p-6 mb-6 text-center"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-white/40 line-through text-lg">
                ¥{PRODUCT.originalPrice.toLocaleString()}
              </span>
              <span
                className="text-xs font-bold px-2 py-1 rounded"
                style={{ background: "#ef4444", color: "#fff" }}
              >
                先行特価
              </span>
            </div>
            <div
              className="text-6xl font-black text-white leading-none"
              style={{ fontFamily: "var(--font-display)" }}
            >
              ¥{PRODUCT.price.toLocaleString()}
            </div>
            <div className="text-white/50 text-xs mt-2">税込・送料込</div>
            <div className="mt-3 text-white/60 text-sm">
              お届け <span className="text-white font-semibold">{PRODUCT.deliveryDate}</span>
            </div>
          </div>

          {/* CTA Button */}
          <Link
            href="#reservation"
            className="block w-full text-center font-bold text-white text-xl py-5 rounded-xl transition-all mb-4"
            style={{
              background: "linear-gradient(135deg, #22d3ee 0%, #2563eb 100%)",
              boxShadow: "0 8px 32px rgba(34,211,238,0.35)",
              fontFamily: "var(--font-body)",
            }}
          >
            今すぐ先行予約する →
          </Link>

          {/* Countdown */}
          <div className="mt-6 text-center">
            {!reservationOpen ? (
              <>
                <p className="text-white/50 text-xs mb-4">予約開始まで</p>
                <div className="flex items-end justify-center gap-2">
                  <CountdownUnit value={toStart.days} label="日" />
                  <span className="text-white/30 text-xl mb-5">:</span>
                  <CountdownUnit value={toStart.hours} label="時間" />
                  <span className="text-white/30 text-xl mb-5">:</span>
                  <CountdownUnit value={toStart.minutes} label="分" />
                  <span className="text-white/30 text-xl mb-5">:</span>
                  <CountdownUnit value={toStart.seconds} label="秒" />
                </div>
                <p className="text-white/30 text-xs mt-3">{PRODUCT.reservationStart}より予約開始予定</p>
              </>
            ) : !toDeadline.past ? (
              <>
                <p className="text-cyan-400 text-xs font-semibold mb-4">予約受付中！締切まで</p>
                <div className="flex items-end justify-center gap-2">
                  <CountdownUnit value={toDeadline.days} label="日" />
                  <span className="text-white/30 text-xl mb-5">:</span>
                  <CountdownUnit value={toDeadline.hours} label="時間" />
                  <span className="text-white/30 text-xl mb-5">:</span>
                  <CountdownUnit value={toDeadline.minutes} label="分" />
                  <span className="text-white/30 text-xl mb-5">:</span>
                  <CountdownUnit value={toDeadline.seconds} label="秒" />
                </div>
                <p className="text-white/30 text-xs mt-3">予約締切: {PRODUCT.reservationEnd}</p>
              </>
            ) : (
              <p className="text-red-400 text-sm font-semibold">先行予約受付終了</p>
            )}
          </div>

          {/* Scroll hint */}
          <div className="flex flex-col items-center gap-1 mt-12 opacity-30">
            <span className="text-white text-xs">scroll</span>
            <div className="w-px h-8 bg-white/40" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2 — PRODUCT IMAGES
      ═══════════════════════════════════════════ */}
      <section className="w-full py-16" style={{ background: "#0a1628" }}>
        <div className="lp-content">
          <h2
            className="text-white text-center text-2xl font-bold mb-8 tracking-widest"
            style={{ fontFamily: "var(--font-display)" }}
          >
            ULAS O3 finger
          </h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-full aspect-video rounded-xl flex flex-col items-center justify-center"
                style={{ background: "#1a2540", border: "2px dashed rgba(255,255,255,0.1)" }}
              >
                <span className="text-5xl opacity-20">📷</span>
                <p className="text-white/30 text-sm mt-3 font-medium">商品画像準備中</p>
                <p className="text-white/20 text-xs mt-1">Image {i}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 3 — CATCH COPY
      ═══════════════════════════════════════════ */}
      <section
        className="w-full py-20"
        style={{ background: "linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)" }}
      >
        <div className="lp-content text-center">
          <p
            className="text-white font-black leading-tight text-4xl"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
          >
            30秒でオゾン水を生成。
          </p>
          <p
            className="text-white font-black leading-tight text-3xl mt-3"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
          >
            指先から、清潔をスプレー。
          </p>
          <div
            className="w-16 h-1 mx-auto mt-8 rounded-full"
            style={{ background: "rgba(255,255,255,0.5)" }}
          />
          <p className="text-white/80 text-sm mt-6 leading-relaxed">
            新感覚の除菌・消臭体験を、あなたの日常の手元に。
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 4 — PRODUCT DESCRIPTION
      ═══════════════════════════════════════════ */}
      <section className="w-full py-16" style={{ background: "#ffffff" }}>
        <div className="lp-content">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 rounded-full" style={{ background: "#22d3ee" }} />
            <h2 className="text-gray-900 text-2xl font-black" style={{ fontFamily: "var(--font-display)" }}>
              ULAS O3 fingerとは
            </h2>
          </div>
          <div className="space-y-4 text-gray-700 text-[15px] leading-8">
            <p>
              <strong className="text-gray-900">ULAS O3 finger</strong> は、水道水から直接オゾン水を生成し、
              そのままスプレーできる全く新しいコンパクト型デバイスです。
            </p>
            <p>
              オゾン水は一般的な除菌・消臭に高い効果を発揮しながら、
              使用後は水に戻るため環境への負荷がほぼゼロ。
              洗剤や薬品を使わないクリーンな生活をサポートします。
            </p>
            <p>
              指にはめるだけのコンパクト設計で、
              キッチン・洗面所・外出先など、あらゆるシーンで手軽に除菌できます。
              USB充電式で繰り返し使えるため、プラスチックゴミの削減にも貢献します。
            </p>
          </div>
          <div
            className="mt-8 p-4 rounded-lg text-xs text-gray-400 leading-relaxed"
            style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}
          >
            ※本製品は医療機器ではありません。除菌・消臭効果の程度は使用環境や使用方法により異なります。
            飲料水への使用は想定しておりません。記載の仕様・デザインは予告なく変更となる場合があります。
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 5 — FEATURES
      ═══════════════════════════════════════════ */}
      <section className="w-full py-16" style={{ background: "#f8f9fa" }}>
        <div className="lp-content">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 rounded-full" style={{ background: "#22d3ee" }} />
            <h2 className="text-gray-900 text-2xl font-black" style={{ fontFamily: "var(--font-display)" }}>
              ULAS O3 fingerの特徴
            </h2>
          </div>
          <div className="space-y-0">
            {FEATURES.map((f, i) => (
              <div key={f.title}>
                <div className="flex gap-5 py-7">
                  <div
                    className="text-4xl flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-2xl"
                    style={{ background: "rgba(34,211,238,0.1)" }}
                  >
                    {f.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900 font-bold text-base mb-2">{f.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>
                {i < FEATURES.length - 1 && (
                  <hr style={{ borderColor: "#dee2e6" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 6 — HOW TO USE
      ═══════════════════════════════════════════ */}
      <section className="w-full py-16" style={{ background: "#050a14" }}>
        <div className="lp-content">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-1 h-8 rounded-full" style={{ background: "#22d3ee" }} />
            <h2 className="text-white text-2xl font-black" style={{ fontFamily: "var(--font-display)" }}>
              使い方はシンプル3ステップ
            </h2>
          </div>
          <div className="space-y-6">
            {[
              { step: "01", title: "水を入れる", desc: "水道水または市販の水を本体のタンクに入れます。" },
              { step: "02", title: "スイッチを押す", desc: "ボタンひとつで電気分解が始まり、約30秒でオゾン水が生成されます。" },
              { step: "03", title: "スプレーする", desc: "生成されたオゾン水をそのまま手やキッチン、トイレなどにスプレー。除菌・消臭完了。" },
            ].map((s, i) => (
              <div key={s.step} className="flex gap-5 items-start">
                <div
                  className="font-black leading-none flex-shrink-0 pt-1"
                  style={{ fontFamily: "var(--font-display)", fontSize: "3.5rem", color: "#22d3ee", lineHeight: 1 }}
                >
                  {s.step}
                </div>
                <div
                  className="flex-1 pt-2 pb-6"
                  style={{
                    borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none",
                  }}
                >
                  <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 7 — SPEC TABLE
      ═══════════════════════════════════════════ */}
      <section className="w-full py-16" style={{ background: "#ffffff" }}>
        <div className="lp-content">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 rounded-full" style={{ background: "#22d3ee" }} />
            <h2 className="text-gray-900 text-2xl font-black" style={{ fontFamily: "var(--font-display)" }}>
              製品仕様
            </h2>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #e9ecef" }}>
            {SPECS.map((spec, i) => (
              <div
                key={spec.label}
                className="flex gap-4 px-5 py-4"
                style={{ background: i % 2 === 0 ? "#f8f9fa" : "#ffffff", borderBottom: i < SPECS.length - 1 ? "1px solid #e9ecef" : "none" }}
              >
                <span className="text-gray-400 text-xs min-w-[110px] pt-0.5 font-medium">{spec.label}</span>
                <span className="text-gray-900 text-sm font-semibold">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 8 — RESERVATION REASONS
      ═══════════════════════════════════════════ */}
      <section className="w-full py-16" style={{ background: "#0a1628" }}>
        <div className="lp-content">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-1 h-8 rounded-full" style={{ background: "#22d3ee" }} />
            <h2 className="text-white text-2xl font-black" style={{ fontFamily: "var(--font-display)" }}>
              今すぐ予約する3つの理由
            </h2>
          </div>
          <div className="space-y-5">
            {[
              {
                num: "1",
                title: "先行予約特別価格",
                body: (
                  <>
                    <span className="text-cyan-400 font-black text-xl" style={{ fontFamily: "var(--font-display)" }}>
                      ¥18,700
                    </span>
                    <span className="text-white/50 text-sm ml-2">
                      （定価 <span className="line-through">¥19,800</span> より割引）
                    </span>
                    <p className="text-white/60 text-sm mt-1 leading-relaxed">
                      先行予約期間限定の特別価格。一般販売開始後は定価に戻ります。
                    </p>
                  </>
                ),
              },
              {
                num: "2",
                title: "先着順発送",
                body: (
                  <p className="text-white/60 text-sm leading-relaxed">
                    予約順に発送します。早くご予約いただくほど、お手元に早く届きます。
                  </p>
                ),
              },
              {
                num: "3",
                title: "予約期間限定",
                body: (
                  <p className="text-white/60 text-sm leading-relaxed">
                    先行予約は <span className="text-white font-semibold">〜7/31まで</span> です。
                    期間終了後は予約受付を終了し、一般販売（定価）に切り替わります。
                  </p>
                ),
              },
            ].map((r, i) => (
              <div
                key={r.num}
                className="rounded-xl p-5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-black text-xl"
                    style={{
                      fontFamily: "var(--font-display)",
                      background: "linear-gradient(135deg, #22d3ee, #2563eb)",
                      color: "#fff",
                    }}
                  >
                    {r.num}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base mb-2">{r.title}</h3>
                    <div>{r.body}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 9 — RESERVATION FORM
      ═══════════════════════════════════════════ */}
      <section
        id="reservation"
        ref={reservationRef}
        className="w-full py-16"
        style={{ background: "#050a14" }}
      >
        <div className="lp-content">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 rounded-full" style={{ background: "#22d3ee" }} />
            <h2 className="text-white text-2xl font-black" style={{ fontFamily: "var(--font-display)" }}>
              先行予約フォーム
            </h2>
          </div>

          {/* Price reminder */}
          <div
            className="rounded-xl p-5 mb-8 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(34,211,238,0.12) 0%, rgba(37,99,235,0.12) 100%)",
              border: "1px solid rgba(34,211,238,0.3)",
            }}
          >
            <p className="text-white/60 text-sm mb-1">先行予約特別価格</p>
            <p
              className="text-5xl font-black text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              ¥{PRODUCT.price.toLocaleString()}
            </p>
            <p className="text-white/50 text-xs mt-1">税込・送料込 / お届け {PRODUCT.deliveryDate}</p>
          </div>

          {/* Form card */}
          <div
            className="rounded-2xl p-6"
            style={{ background: "#ffffff" }}
          >
            <ReservationForm />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 10 — CAUTIONS
      ═══════════════════════════════════════════ */}
      <section className="w-full py-14" style={{ background: "#f8f9fa" }}>
        <div className="lp-content">
          <h2 className="text-gray-900 text-xl font-black mb-6" style={{ fontFamily: "var(--font-display)" }}>
            ご注意事項
          </h2>
          <ul className="space-y-4">
            {[
              `本商品は先行予約商品です。お届けは${PRODUCT.deliveryDate}を予定しています（変更の場合はメールにてご連絡します）。`,
              "銀行振込をお選びの場合、ご注文後7日以内にお振込ください。期限内にご入金が確認できない場合はキャンセルとなる場合があります。",
              "お客様都合による返品・交換はお受けできません。商品に瑕疵がある場合のみ対応いたします。",
              "ご予約内容の変更・キャンセルはsupport@ulas.jpまでご連絡ください。",
              "初めてご予約のお客様には、マイページのログイン情報（パスワード）をメールにてお送りします。",
            ].map((text, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-600 leading-relaxed">
                <span className="flex-shrink-0 mt-0.5 text-cyan-500 font-bold">•</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 11 — TOKUSHOHO LINK
      ═══════════════════════════════════════════ */}
      <section className="w-full py-10" style={{ background: "#ffffff" }}>
        <div className="lp-content text-center">
          <Link
            href="/tokushoho"
            className="inline-flex items-center gap-2 text-sm font-medium underline-offset-2 hover:opacity-70 transition-opacity"
            style={{ color: "#22d3ee" }}
          >
            特定商取引法に基づく表示を確認する →
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FLOATING CTA BAR (mobile)
      ═══════════════════════════════════════════ */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300"
        style={{
          transform: showFloatingCta ? "translateY(0)" : "translateY(100%)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div
          className="w-full px-4 py-3"
          style={{ background: "rgba(5,10,20,0.95)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(34,211,238,0.2)" }}
        >
          <Link
            href="#reservation"
            className="block w-full text-center font-bold text-white text-base py-4 rounded-xl"
            style={{
              background: "linear-gradient(135deg, #22d3ee 0%, #2563eb 100%)",
              boxShadow: "0 4px 20px rgba(34,211,238,0.3)",
              fontFamily: "var(--font-body)",
            }}
          >
            今すぐ予約する →
          </Link>
        </div>
      </div>

    </div>
  );
}
