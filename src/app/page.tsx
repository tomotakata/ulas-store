"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CreditCard,
  Truck,
  HeadphonesIcon,
  Droplets,
  Hand,
  BatteryCharging,
  Leaf,
  Package,
  UtensilsCrossed,
  SprayCan,
  Monitor,
  ShoppingCart,
  Car,
  Baby,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs, FreeMode, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { PRODUCT, RESERVATION_START, RESERVATION_DEADLINE, BANK_TRANSFER } from "@/lib/constants";
import ReservationForm from "@/components/ui/ReservationForm";

/* ─────────────────────────────────────
   Countdown hook
───────────────────────────────────── */
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
      <div
        className="w-12 h-12 md:w-14 md:h-14 bg-black text-white rounded-xl flex items-center justify-center text-xl md:text-2xl font-bold tabular-nums"
        style={{ fontFamily: "var(--font-en)" }}
      >
        {String(v).padStart(2, "0")}
      </div>
      <span className="text-[10px] text-gray-400 tracking-widest">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────
   Reveal hook
───────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold: 0.1 });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ─────────────────────────────────────
   Section title
───────────────────────────────────── */
function SecTitle({ en, ja, center }: { en: string; ja: string; center?: boolean }) {
  return (
    <div className={`mb-8 md:mb-12 ${center ? "text-center" : ""}`}>
      <p className="text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase mb-2" style={{ fontFamily: "var(--font-en)" }}>
        {en}
      </p>
      <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">
        {ja}
      </h2>
    </div>
  );
}

/* ─────────────────────────────────────
   Product data
───────────────────────────────────── */
const SLIDES = [
  { src: "/images/product-1.png", alt: "ULAS O3 finger — フロントビュー" },
  { src: "/images/product-2.png", alt: "ULAS O3 finger — サイドビュー" },
  { src: "/images/product-3.png", alt: "ULAS O3 finger — 使用イメージ" },
  { src: "/images/product-4.png", alt: "ULAS O3 finger — 詳細" },
  { src: "/images/product-5.png", alt: "ULAS O3 finger — パッケージ" },
];

const FEATURES = [
  {
    Icon: Droplets,
    title: "30秒でオゾン水を生成",
    desc: "スイッチひとつで約30秒後に使用可能。水道水・市販水どちらにも対応。",
  },
  {
    Icon: Hand,
    title: "フィンガータイプで使いやすい",
    desc: "指に装着するだけのコンパクト設計。片手でスプレーできる直感的な操作感。",
  },
  {
    Icon: BatteryCharging,
    title: "USB充電式・繰り返し使える",
    desc: "充電式だからランニングコストほぼゼロ。旅行・アウトドアにも携帯可能。",
  },
  {
    Icon: Leaf,
    title: "洗剤・薬品不要",
    desc: "化学物質を一切使わないため環境負荷ゼロ。オゾンは使用後に水へ戻ります。",
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

const SCENE_ICONS = [UtensilsCrossed, SprayCan, Monitor, ShoppingCart, Car, Baby];
const SCENES = [
  { label: "キッチン", desc: "食材・まな板・シンクの除菌に" },
  { label: "洗面所", desc: "洗面台・歯ブラシホルダーの清潔ケアに" },
  { label: "オフィス", desc: "デスク・キーボード周りの除菌に" },
  { label: "外出先", desc: "ショッピングカート・ドアノブ対策に" },
  { label: "車内", desc: "ハンドル・シフトノブの除菌消臭に" },
  { label: "育児", desc: "おもちゃ・哺乳瓶まわりのケアに" },
];
const SCENE_BG = ["#f0f4ff", "#f0fff4", "#fff7f0", "#fdf0ff", "#f0faff", "#fffbf0"];
const SCENE_COLOR = ["#3b82f6", "#10b981", "#f97316", "#a855f7", "#06b6d4", "#eab308"];

/* ─────────────────────────────────────
   Trust badge strip (3-col)
───────────────────────────────────── */
const TRUST_BADGES = [
  {
    Icon: CreditCard,
    title: "クレジットカード決済・銀行振込",
    sub: "Stripe セキュア決済対応",
  },
  {
    Icon: Truck,
    title: "送料無料",
    sub: "全国一律送料込み価格",
  },
  {
    Icon: HeadphonesIcon,
    title: "アフターフォロー対応",
    sub: "初期不良・購入後サポート",
  },
];

/* ─────────────────────────────────────
   Main page
───────────────────────────────────── */
export default function HomePage() {
  const toStart    = useCountdown(RESERVATION_START);
  const toDeadline = useCountdown(RESERVATION_DEADLINE);
  const open       = toStart.past;

  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const formRef  = useRef<HTMLElement>(null);
  const [showBar, setShowBar] = useState(true);

  useReveal();

  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting), { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="overflow-x-hidden" style={{ fontFamily: "var(--font-jp)", background: "#fff" }}>

      {/* ══════════════════════════════════════════════════════
          § HERO — slider left / buy box right
      ══════════════════════════════════════════════════════ */}
      <section className="sec bg-white pt-6 pb-12 md:pt-10 md:pb-16">
        <div className="sec-inner">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">

            {/* — Slider — */}
            <div className="w-full lg:w-[55%] lg:sticky lg:top-20">
              <Swiper
                modules={[Navigation, Pagination, Thumbs, Autoplay]}
                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 4500, disableOnInteraction: true }}
                loop
                className="rounded-2xl overflow-hidden border border-gray-100 hero-slider"
                style={{ height: "min(45vw, 480px)" }}
              >
                {SLIDES.map((s) => (
                  <SwiperSlide key={s.src}>
                    <div className="relative w-full h-full bg-gray-50">
                      <Image src={s.src} alt={s.alt} fill style={{ objectFit: "cover" }}
                        sizes="(max-width: 1024px) 100vw, 55vw" priority={s.src === SLIDES[0].src} />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <Swiper
                modules={[FreeMode, Thumbs]}
                onSwiper={setThumbsSwiper}
                watchSlidesProgress freeMode spaceBetween={8} slidesPerView={5}
                className="thumb-swiper mt-3"
              >
                {SLIDES.map((s) => (
                  <SwiperSlide key={`t-${s.src}`}>
                    <div className="relative bg-gray-50 rounded-lg overflow-hidden" style={{ aspectRatio: "1/1" }}>
                      <Image src={s.src} alt={s.alt} fill style={{ objectFit: "contain" }} sizes="80px" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* — Buy box — */}
            <div className="w-full lg:w-[45%]">
              <div className="inline-flex items-center gap-2 bg-black text-white text-[11px] font-bold px-3 py-1.5 rounded-full mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                先行予約受付中
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight mb-1" style={{ fontFamily: "var(--font-en)" }}>
                ULAS O3 finger
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                水からオゾン水を生成し、そのままスプレーできる<br />コンパクト型オゾン水生成器
              </p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-0.5">
                  <span className="text-4xl font-black text-gray-900 tracking-tight" style={{ fontFamily: "var(--font-en)" }}>¥18,700</span>
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">先行特価</span>
                </div>
                <p className="text-gray-400 text-sm">
                  <span className="line-through mr-2">定価 ¥19,800</span>税込・送料込
                </p>
              </div>

              {/* Delivery */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 mb-6 border border-gray-100">
                <Package size={18} className="text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">お届け予定</p>
                  <p className="text-sm font-semibold text-gray-900">{PRODUCT.deliveryDate}（先着順）</p>
                </div>
              </div>

              {/* Countdown */}
              <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100">
                {!open ? (
                  <>
                    <p className="text-xs text-gray-400 text-center mb-4 tracking-wide">予約開始まで</p>
                    <div className="flex items-center justify-center gap-3">
                      <Digit v={toStart.days} label="日" />
                      <span className="text-gray-300 text-lg font-light pb-5">:</span>
                      <Digit v={toStart.hours} label="時間" />
                      <span className="text-gray-300 text-lg font-light pb-5">:</span>
                      <Digit v={toStart.minutes} label="分" />
                      <span className="text-gray-300 text-lg font-light pb-5">:</span>
                      <Digit v={toStart.seconds} label="秒" />
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-4">{PRODUCT.reservationStart}より開始</p>
                  </>
                ) : !toDeadline.past ? (
                  <>
                    <p className="text-xs font-semibold text-center text-black mb-4 tracking-wide">受付中 — 締切まで</p>
                    <div className="flex items-center justify-center gap-3">
                      <Digit v={toDeadline.days} label="日" />
                      <span className="text-gray-300 text-lg font-light pb-5">:</span>
                      <Digit v={toDeadline.hours} label="時間" />
                      <span className="text-gray-300 text-lg font-light pb-5">:</span>
                      <Digit v={toDeadline.minutes} label="分" />
                      <span className="text-gray-300 text-lg font-light pb-5">:</span>
                      <Digit v={toDeadline.seconds} label="秒" />
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-4">予約締切: {PRODUCT.reservationEnd}</p>
                  </>
                ) : (
                  <p className="text-center text-red-500 font-bold text-sm">先行予約受付終了</p>
                )}
              </div>

              {/* CTA */}
              <Link href="#reservation"
                className="block w-full text-center bg-black hover:bg-gray-900 active:scale-[0.99] text-white font-bold text-base py-4 rounded-xl transition-all mb-3">
                今すぐ先行予約する →
              </Link>
              <p className="text-center text-xs text-gray-400">先着順発送 · 予約締切 7/31 · クレカ / 銀行振込</p>

              {/* Mini trust badges (in buy box) */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                {[
                  { Icon: CreditCard, label: "Stripe決済" },
                  { Icon: Truck, label: "送料込" },
                  { Icon: HeadphonesIcon, label: "初期不良対応" },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 bg-gray-50 rounded-xl py-3 border border-gray-100">
                    <Icon size={18} className="text-gray-500" strokeWidth={1.5} />
                    <span className="text-[10px] text-gray-500 font-medium text-center leading-tight">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          § TRUST BADGE STRIP — 3カラム
      ══════════════════════════════════════════════════════ */}
      <section className="sec bg-white pb-12 md:pb-16">
        <div className="sec-inner">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 reveal">
            {TRUST_BADGES.map(({ Icon, title, sub }) => (
              <div key={title}
                className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 px-5 py-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="shrink-0 w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <Icon size={22} className="text-gray-700" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-gray-900 text-sm font-bold leading-snug">{title}</p>
                  <p className="text-gray-400 text-xs mt-0.5 leading-snug">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          § CATCH — full-bleed black
      ══════════════════════════════════════════════════════ */}
      <section className="sec bg-black py-20 md:py-28">
        <div className="sec-inner-sm text-center reveal">
          <p className="text-white/40 text-xs tracking-[0.25em] uppercase mb-6" style={{ fontFamily: "var(--font-en)" }}>
            The New Standard of Clean
          </p>
          <h2 className="text-white font-black text-3xl md:text-5xl leading-tight tracking-tight mb-6">
            30秒でオゾン水を生成。<br />指先から、清潔をスプレー。
          </h2>
          <p className="text-white/50 text-sm md:text-base leading-relaxed max-w-md mx-auto">
            洗剤・薬品不要。水から生まれたオゾン水で、あらゆる場所をクリーンに。
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          § FEATURES — white
      ══════════════════════════════════════════════════════ */}
      <section className="sec bg-white py-20 md:py-28">
        <div className="sec-inner">
          <div className="reveal"><SecTitle en="Features" ja="ULAS O3 fingerの特徴" center /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 reveal">
            {FEATURES.map(({ Icon, title, desc }) => (
              <div key={title} className="feat-card rounded-2xl border border-gray-100 p-6 bg-white">
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-gray-700" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-2 leading-snug">{title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          § HOW TO USE — gray
      ══════════════════════════════════════════════════════ */}
      <section className="sec py-20 md:py-28" style={{ background: "#f7f7f7" }}>
        <div className="sec-inner-sm">
          <div className="reveal"><SecTitle en="How to Use" ja="使い方はシンプル3ステップ" center /></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 reveal">
            {[
              { n: "01", title: "水を入れる", desc: "水道水または市販の水を本体タンクに入れます。" },
              { n: "02", title: "スイッチを押す", desc: "ボタンを押すと電気分解が始まり、約30秒でオゾン水が生成されます。" },
              { n: "03", title: "スプレーする", desc: "生成されたオゾン水を手・キッチン・洗面所などに直接スプレー。" },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <div className="text-6xl font-black text-gray-100 mb-3 leading-none" style={{ fontFamily: "var(--font-en)" }}>{s.n}</div>
                <h3 className="font-bold text-gray-900 text-base mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          § SCENES — white
      ══════════════════════════════════════════════════════ */}
      <section className="sec bg-white py-20 md:py-28">
        <div className="sec-inner">
          <div className="reveal"><SecTitle en="Use Cases" ja="あらゆる場面で活躍" center /></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 reveal">
            {SCENES.map((sc, i) => {
              const Icon = SCENE_ICONS[i];
              return (
                <div key={sc.label}
                  className="feat-card rounded-2xl p-5 flex flex-col gap-3 border border-gray-100"
                  style={{ background: SCENE_BG[i] }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${SCENE_COLOR[i]}18` }}>
                    <Icon size={18} strokeWidth={1.5} style={{ color: SCENE_COLOR[i] }} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{sc.label}</p>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">{sc.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          § SPEC TABLE — gray
      ══════════════════════════════════════════════════════ */}
      <section className="sec py-20 md:py-28" style={{ background: "#f7f7f7" }}>
        <div className="sec-inner-sm">
          <div className="reveal"><SecTitle en="Specifications" ja="製品仕様" /></div>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden reveal">
            {SPECS.map((s) => (
              <div key={s.label} className="spec-row flex items-start gap-4 px-6 py-4">
                <span className="text-gray-400 text-xs w-28 shrink-0 pt-0.5 font-medium">{s.label}</span>
                <span className="text-gray-900 text-sm font-semibold leading-relaxed">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          § REASONS — black
      ══════════════════════════════════════════════════════ */}
      <section className="sec bg-black py-20 md:py-28">
        <div className="sec-inner-sm">
          <div className="reveal"><SecTitle en="Why Pre-order" ja="今すぐ予約する3つの理由" /></div>
          <div className="space-y-4 reveal">
            {[
              { n: "01", title: "先行予約特別価格", body: "定価¥19,800のところ、先行予約価格¥18,700（税込・送料込）でご購入いただけます。一般販売開始後は定価に戻ります。" },
              { n: "02", title: "先着順発送", body: "予約順に発送します。早くご予約いただくほど、お手元に早く届きます。" },
              { n: "03", title: "予約期間限定〜7/31", body: "先行予約は2026年7月31日まで。期間終了後は予約受付を終了し、一般販売（定価）に切り替わります。" },
            ].map((r) => (
              <div key={r.n} className="flex gap-5 p-6 rounded-2xl border border-white/10 bg-white/5">
                <span className="text-white/15 font-black text-4xl shrink-0 leading-none" style={{ fontFamily: "var(--font-en)" }}>{r.n}</span>
                <div>
                  <h3 className="text-white font-bold text-sm mb-2">{r.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{r.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          § RESERVATION FORM — white
      ══════════════════════════════════════════════════════ */}
      <section id="reservation" ref={formRef} className="sec bg-white py-20 md:py-28">
        <div className="sec-inner-sm">
          <div className="reveal"><SecTitle en="Pre-order" ja="先行予約フォーム" /></div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 mb-8 reveal">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">先行予約特別価格</p>
              <p className="text-3xl font-black text-black tracking-tight" style={{ fontFamily: "var(--font-en)" }}>¥18,700</p>
              <p className="text-xs text-gray-400 mt-0.5">税込・送料込</p>
            </div>
            <div className="h-10 w-px bg-gray-200 hidden sm:block" />
            <div className="text-center sm:text-right">
              <p className="text-xs text-gray-400 mb-0.5">お届け予定</p>
              <p className="font-semibold text-gray-900 text-sm">{PRODUCT.deliveryDate}</p>
              <p className="text-xs text-gray-400 mt-0.5">先着順に発送</p>
            </div>
            <div className="h-10 w-px bg-gray-200 hidden sm:block" />
            <div className="text-center sm:text-right">
              <p className="text-xs text-gray-400 mb-0.5">お支払い方法</p>
              <p className="font-semibold text-gray-900 text-sm">クレカ / 銀行振込</p>
              <p className="text-xs text-gray-400 mt-0.5">Stripe 決済対応</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm reveal">
            <ReservationForm />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          § CAUTIONS — gray
      ══════════════════════════════════════════════════════ */}
      <section className="sec py-16 md:py-20" style={{ background: "#f7f7f7" }}>
        <div className="sec-inner-sm">
          <h3 className="font-bold text-gray-900 text-base mb-5">ご注意事項</h3>
          <ul className="space-y-4 mb-10">
            {[
              `本商品は先行予約商品です。お届けは${PRODUCT.deliveryDate}を予定しています（変更の場合はメールにてご連絡します）。`,
              `銀行振込をお選びの場合、${BANK_TRANSFER.deadline}にお振込ください。期限内にご入金が確認できない場合はキャンセルとなる場合があります。`,
              "お客様都合による返品・交換はお受けできません。商品に瑕疵がある場合のみ対応いたします。",
              "ご予約内容の変更・キャンセルはsupport@ulas.jpまでご連絡ください。",
              "初めてご予約のお客様には、マイページのログイン情報（パスワード）をメールにてお送りします。",
            ].map((text, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-500 leading-relaxed">
                <span className="shrink-0 mt-2 w-1 h-1 rounded-full bg-gray-400" />
                {text}
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-200 pt-8 text-center">
            <Link href="/tokushoho" className="text-sm text-gray-400 hover:text-gray-700 underline underline-offset-4 transition-colors">
              特定商取引法に基づく表示を確認する →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          § FLOATING BUY BAR
      ══════════════════════════════════════════════════════ */}
      <div className={`buy-bar${showBar ? "" : " hidden"}`}>
        <div className="sec-inner py-3">
          <div className="flex items-center gap-4 max-w-xl mx-auto lg:max-w-none">
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                <Image src="/images/product-1.png" alt="ULAS O3 finger" fill style={{ objectFit: "contain" }} sizes="40px" />
              </div>
              <div>
                <p className="text-xs text-gray-400 leading-none">ULAS O3 finger</p>
                <p className="font-black text-sm text-black leading-tight" style={{ fontFamily: "var(--font-en)" }}>¥18,700</p>
              </div>
            </div>
            <div className="flex-1 block sm:hidden">
              <p className="font-black text-base text-black" style={{ fontFamily: "var(--font-en)" }}>¥18,700 <span className="text-gray-400 text-xs font-normal">税込</span></p>
            </div>
            <Link href="#reservation"
              className="ml-auto shrink-0 bg-black hover:bg-gray-900 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition-colors whitespace-nowrap">
              今すぐ先行予約する →
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
