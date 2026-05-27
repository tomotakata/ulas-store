"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { PRODUCT, RESERVATION_START, RESERVATION_DEADLINE } from "@/lib/constants";
import ReservationForm from "@/components/ui/ReservationForm";

/* ─── Countdown ─── */
function useCountdown(target: Date) {
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, past: false });
  useEffect(() => {
    const calc = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setT({ days: 0, hours: 0, minutes: 0, seconds: 0, past: true }); return; }
      setT({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        past: false,
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
}

function Digit({ v, label }: { v: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-14 h-14 bg-black text-white rounded-xl flex items-center justify-center text-2xl font-bold tabular-nums" style={{ fontFamily: "var(--font-en)" }}>
        {String(v).padStart(2, "0")}
      </div>
      <span className="text-[10px] text-gray-400 tracking-widest uppercase">{label}</span>
    </div>
  );
}

/* ─── Slider ─── */
const SLIDES = [
  { id: 1, label: "商品画像 1 — フロントビュー" },
  { id: 2, label: "商品画像 2 — サイドビュー" },
  { id: 3, label: "商品画像 3 — 使用イメージ" },
  { id: 4, label: "商品画像 4 — 詳細" },
];

function HeroSlider() {
  const [cur, setCur] = useState(0);
  const [drag, setDrag] = useState<number | null>(null);
  const startX = useRef(0);

  const next = useCallback(() => setCur(c => (c + 1) % SLIDES.length), []);
  const prev = useCallback(() => setCur(c => (c - 1 + SLIDES.length) % SLIDES.length), []);

  // Auto-play
  useEffect(() => {
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [next]);

  // Touch/mouse drag
  const onPointerDown = (e: React.PointerEvent) => { startX.current = e.clientX; };
  const onPointerUp = (e: React.PointerEvent) => {
    const dx = e.clientX - startX.current;
    if (dx < -40) next();
    else if (dx > 40) prev();
  };

  return (
    <div className="relative w-full overflow-hidden bg-gray-50 select-none" style={{ aspectRatio: "4/3" }}
      onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      {/* Track */}
      <div className="flex h-full" style={{ transform: `translateX(-${cur * 100}%)`, transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1)" }}>
        {SLIDES.map((s) => (
          <div key={s.id} className="w-full h-full flex-shrink-0 flex flex-col items-center justify-center gap-3 bg-gray-50">
            <div className="text-7xl opacity-20">📷</div>
            <p className="text-gray-300 text-xs font-medium tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur rounded-full shadow flex items-center justify-center hover:bg-white transition-colors z-10">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur rounded-full shadow flex items-center justify-center hover:bg-white transition-colors z-10">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => setCur(i)}
            className="rounded-full transition-all duration-300"
            style={{ width: i === cur ? 20 : 6, height: 6, background: i === cur ? "#111" : "#ccc" }}
          />
        ))}
      </div>

      {/* Thumbnail strip */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {SLIDES.map((s, i) => (
          <button key={s.id} onClick={() => setCur(i)}
            className="w-12 h-9 rounded overflow-hidden border-2 transition-all duration-200 bg-gray-200"
            style={{ borderColor: i === cur ? "#111" : "transparent" }}
          >
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-base opacity-40">📷</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Data ─── */
const FEATURES = [
  { icon: "💧", title: "水からオゾン水を生成", desc: "水道水から直接オゾン水を生成。薬品・洗剤不要のクリーンな除菌・消臭を実現します。" },
  { icon: "✋", title: "コンパクトなフィンガータイプ", desc: "手の指に装着するだけのコンパクト設計。キッチン・洗面所・どこでも手軽に使用できます。" },
  { icon: "⚡", title: "USB充電式で繰り返し使える", desc: "USB充電対応。繰り返し使えてゴミが出ない、エコでコスパの高い設計です。" },
  { icon: "🌿", title: "環境にやさしい", desc: "化学物質を使わないため環境負荷ゼロ。オゾンは水に戻るため安全で持続可能です。" },
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
  const toStart    = useCountdown(RESERVATION_START);
  const toDeadline = useCountdown(RESERVATION_DEADLINE);
  const open       = toStart.past;

  // Hide floating bar when reservation section is visible
  const formRef  = useRef<HTMLElement>(null);
  const [showBar, setShowBar] = useState(true);
  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting), { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="overflow-x-hidden bg-white" style={{ fontFamily: "var(--font-body)" }}>

      {/* ══════════════════════════════════════════
          HERO — image slider + buy box
      ══════════════════════════════════════════ */}
      <section className="w-full bg-white">
        <div className="lp">

          {/* Product label */}
          <div className="pt-6 pb-3">
            <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">ULAS / O3 finger</span>
          </div>

          {/* Headline */}
          <h1 className="text-[2rem] font-black leading-tight tracking-tight text-gray-900 mb-1" style={{ fontFamily: "var(--font-en)" }}>
            ULAS <span className="text-black">O3 finger</span>
          </h1>
          <p className="text-gray-500 text-sm mb-5 leading-relaxed">
            水からオゾン水を生成し、そのままスプレーできる<br className="hidden sm:block" />
            コンパクト型オゾン水生成器
          </p>

          {/* Slider */}
          <div className="rounded-2xl overflow-hidden mb-5 shadow-sm border border-gray-100">
            <HeroSlider />
          </div>

          {/* Badge + price block */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-black text-white text-[11px] font-bold px-3 py-1 rounded-full mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                先行予約受付中
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-black" style={{ fontFamily: "var(--font-en)", letterSpacing: "-0.04em" }}>
                  ¥18,700
                </span>
                <span className="text-gray-400 line-through text-sm">¥19,800</span>
              </div>
              <p className="text-gray-400 text-xs mt-0.5">税込・送料込</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-xs bg-red-500 text-white font-bold px-2 py-0.5 rounded">先行特価</span>
              <span className="text-xs text-gray-400">お届け {PRODUCT.deliveryDate}</span>
            </div>
          </div>

          {/* Countdown */}
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 mb-4">
            {!open ? (
              <>
                <p className="text-xs text-gray-400 text-center mb-3 tracking-wide">予約開始まで</p>
                <div className="flex items-center justify-center gap-3">
                  <Digit v={toStart.days} label="日" />
                  <span className="text-gray-300 text-xl font-light mb-5">:</span>
                  <Digit v={toStart.hours} label="時間" />
                  <span className="text-gray-300 text-xl font-light mb-5">:</span>
                  <Digit v={toStart.minutes} label="分" />
                  <span className="text-gray-300 text-xl font-light mb-5">:</span>
                  <Digit v={toStart.seconds} label="秒" />
                </div>
                <p className="text-center text-xs text-gray-400 mt-3">{PRODUCT.reservationStart}より開始予定</p>
              </>
            ) : !toDeadline.past ? (
              <>
                <p className="text-xs text-center font-semibold text-black mb-3 tracking-wide">予約受付中 — 締切まで</p>
                <div className="flex items-center justify-center gap-3">
                  <Digit v={toDeadline.days} label="日" />
                  <span className="text-gray-300 text-xl font-light mb-5">:</span>
                  <Digit v={toDeadline.hours} label="時間" />
                  <span className="text-gray-300 text-xl font-light mb-5">:</span>
                  <Digit v={toDeadline.minutes} label="分" />
                  <span className="text-gray-300 text-xl font-light mb-5">:</span>
                  <Digit v={toDeadline.seconds} label="秒" />
                </div>
              </>
            ) : (
              <p className="text-center text-red-500 text-sm font-bold">先行予約受付終了</p>
            )}
          </div>

          {/* CTA */}
          <Link href="#reservation"
            className="block w-full text-center bg-black hover:bg-gray-900 active:bg-gray-800 text-white font-bold text-base py-4 rounded-xl transition-colors mb-2">
            今すぐ先行予約する →
          </Link>
          <p className="text-center text-xs text-gray-400 mb-8">先着順発送 · 予約締切 7/31</p>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          CATCH COPY — full-bleed black band
      ══════════════════════════════════════════ */}
      <section className="w-full bg-black py-16">
        <div className="lp text-center">
          <p className="text-white font-black leading-tight text-3xl tracking-tight">
            30秒でオゾン水を生成。
          </p>
          <p className="text-white font-black leading-tight text-3xl tracking-tight mt-2">
            指先から、清潔をスプレー。
          </p>
          <div className="w-10 h-0.5 bg-white/30 mx-auto mt-8 mb-6" />
          <p className="text-white/60 text-sm leading-relaxed">
            新感覚の除菌・消臭体験を、あなたの日常の手元に。
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ABOUT — white
      ══════════════════════════════════════════ */}
      <section className="w-full bg-white py-16">
        <div className="lp">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-5 h-0.5 bg-black" />
            <h2 className="sec-title">ULAS O3 fingerとは</h2>
          </div>
          <div className="space-y-4 text-gray-600 text-[15px] leading-8">
            <p>
              <strong className="text-black">ULAS O3 finger</strong> は、水道水から直接オゾン水を生成し、そのままスプレーできる全く新しいコンパクト型デバイスです。
            </p>
            <p>
              オゾン水は除菌・消臭に高い効果を発揮しながら、使用後は水に戻るため環境への負荷がほぼゼロ。洗剤や薬品を使わないクリーンな生活をサポートします。
            </p>
            <p>
              指にはめるだけのコンパクト設計で、キッチン・洗面所・外出先など、あらゆるシーンで手軽に除菌できます。USB充電式で繰り返し使えます。
            </p>
          </div>
          <div className="mt-8 p-4 rounded-lg bg-gray-50 border border-gray-100 text-xs text-gray-400 leading-relaxed">
            ※本製品は医療機器ではありません。効果の程度は使用環境・方法により異なります。飲料水への使用は想定しておりません。
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES — light gray
      ══════════════════════════════════════════ */}
      <section className="w-full bg-gray-50 py-16">
        <div className="lp">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-5 h-0.5 bg-black" />
            <h2 className="sec-title">製品の特徴</h2>
          </div>
          <div>
            {FEATURES.map((f, i) => (
              <div key={f.title} className="feat-row flex gap-5 py-7">
                <div className="flex-shrink-0 w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-2xl">
                  {f.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-sm mb-1.5 tracking-tight">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW TO USE — white
      ══════════════════════════════════════════ */}
      <section className="w-full bg-white py-16">
        <div className="lp">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-5 h-0.5 bg-black" />
            <h2 className="sec-title">使い方</h2>
          </div>
          {[
            { n: "01", title: "水を入れる", desc: "水道水または市販の水を本体タンクに入れます。" },
            { n: "02", title: "スイッチを押す", desc: "ボタンひとつで電気分解が始まり、約30秒でオゾン水が生成されます。" },
            { n: "03", title: "スプレーする", desc: "生成されたオゾン水をそのまま手やキッチン、洗面所などにスプレー。" },
          ].map((s, i) => (
            <div key={s.n} className="flex gap-6 items-start pb-10 last:pb-0" style={{ borderBottom: i < 2 ? "1px solid #e5e5e5" : "none", marginBottom: i < 2 ? "1.5rem" : 0 }}>
              <div className="flex-shrink-0 text-5xl font-black text-gray-100 leading-none select-none" style={{ fontFamily: "var(--font-en)" }}>
                {s.n}
              </div>
              <div className="pt-1">
                <h3 className="font-bold text-gray-900 text-base mb-1.5">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SPEC TABLE — gray
      ══════════════════════════════════════════ */}
      <section className="w-full bg-gray-50 py-16">
        <div className="lp">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-5 h-0.5 bg-black" />
            <h2 className="sec-title">製品仕様</h2>
          </div>
          <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">
            {SPECS.map((s, i) => (
              <div key={s.label} className="flex items-baseline gap-4 px-5 py-4"
                style={{ borderBottom: i < SPECS.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                <span className="text-gray-400 text-xs w-24 shrink-0 pt-0.5">{s.label}</span>
                <span className="text-gray-900 text-sm font-semibold leading-relaxed">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3 REASONS — black
      ══════════════════════════════════════════ */}
      <section className="w-full bg-black py-16">
        <div className="lp">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-5 h-0.5 bg-white" />
            <h2 className="text-white text-2xl font-black tracking-tight">今すぐ予約する理由</h2>
          </div>
          <div className="space-y-4">
            {[
              { n: "01", title: "先行予約特別価格", body: "定価¥19,800のところ、先行予約価格¥18,700でご購入いただけます。一般販売開始後は定価に戻ります。" },
              { n: "02", title: "先着順発送", body: "予約順に発送します。早くご予約いただくほど、お手元に早く届きます。" },
              { n: "03", title: "予約期間限定〜7/31", body: "先行予約は7月31日まで。期間終了後は予約受付を終了し、一般販売（定価）に切り替わります。" },
            ].map((r) => (
              <div key={r.n} className="flex gap-5 p-5 rounded-xl border border-white/10 bg-white/5">
                <span className="text-white/20 font-black text-3xl shrink-0 leading-none" style={{ fontFamily: "var(--font-en)" }}>{r.n}</span>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1.5">{r.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{r.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          RESERVATION FORM — white
      ══════════════════════════════════════════ */}
      <section id="reservation" ref={formRef} className="w-full bg-white py-16">
        <div className="lp">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-0.5 bg-black" />
            <h2 className="sec-title">先行予約フォーム</h2>
          </div>
          <p className="text-gray-400 text-sm mb-8">必要事項をご入力のうえ、予約を確定してください。</p>

          {/* Price summary */}
          <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 mb-6">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">先行予約価格</p>
              <p className="text-2xl font-black text-black" style={{ fontFamily: "var(--font-en)", letterSpacing: "-0.04em" }}>¥18,700</p>
              <p className="text-xs text-gray-400">税込・送料込</p>
            </div>
            <div className="text-right text-xs text-gray-400">
              <p>お届け予定</p>
              <p className="font-semibold text-gray-700 mt-0.5">{PRODUCT.deliveryDate}</p>
            </div>
          </div>

          <ReservationForm />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CAUTIONS — gray
      ══════════════════════════════════════════ */}
      <section className="w-full bg-gray-50 py-14">
        <div className="lp">
          <h2 className="font-bold text-gray-900 text-base mb-5 tracking-tight">ご注意事項</h2>
          <ul className="space-y-4">
            {[
              `本商品は先行予約商品です。お届けは${PRODUCT.deliveryDate}を予定しています（変更の場合はメールにてご連絡します）。`,
              "銀行振込をお選びの場合、ご注文日より3営業日以内にお振込ください。期限内にご入金が確認できない場合はキャンセルとなる場合があります。",
              "お客様都合による返品・交換はお受けできません。商品に瑕疵がある場合のみ対応いたします。",
              "ご予約内容の変更・キャンセルはsupport@ulas.jpまでご連絡ください。",
              "初めてご予約のお客様には、マイページのログイン情報（パスワード）をメールにてお送りします。",
            ].map((text, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-500 leading-relaxed">
                <span className="shrink-0 w-1 h-1 rounded-full bg-gray-400 mt-2.5" />
                {text}
              </li>
            ))}
          </ul>
          <div className="mt-10 pt-8 border-t border-gray-200 text-center">
            <Link href="/tokushoho" className="text-sm text-gray-400 hover:text-gray-700 underline underline-offset-2 transition-colors">
              特定商取引法に基づく表示 →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FLOATING BUY BAR
      ══════════════════════════════════════════ */}
      <div className={`buy-bar${showBar ? "" : " hidden-bar"}`}>
        <div className="lp py-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 truncate">ULAS O3 finger — 先行予約</p>
              <p className="font-black text-base text-black leading-tight" style={{ fontFamily: "var(--font-en)" }}>¥18,700 <span className="text-gray-400 text-xs font-normal">税込</span></p>
            </div>
            <Link href="#reservation"
              className="shrink-0 bg-black hover:bg-gray-900 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors whitespace-nowrap">
              今すぐ予約する
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
