"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BANK_TRANSFER } from "@/lib/constants";
import { Suspense } from "react";

interface User {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
}

interface Reservation {
  id: string;
  createdAt: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  reservationStatus: string;
  shippingName: string;
  shippingZip: string;
  shippingAddress: string;
  product: { name: string };
}

const RESERVATION_STATUS: Record<string, { label: string; color: string; dot: string }> = {
  WAITING:   { label: "予約受付中", color: "text-amber-700 bg-amber-50 border-amber-200",   dot: "bg-amber-400" },
  CONFIRMED: { label: "予約確定",   color: "text-green-700 bg-green-50 border-green-200",   dot: "bg-green-400" },
  SHIPPING:  { label: "発送中",     color: "text-blue-700 bg-blue-50 border-blue-200",     dot: "bg-blue-400" },
  DELIVERED: { label: "お届け完了", color: "text-gray-600 bg-gray-50 border-gray-200",     dot: "bg-gray-400" },
  CANCELLED: { label: "キャンセル", color: "text-red-700 bg-red-50 border-red-200",       dot: "bg-red-400" },
};

const PAYMENT_STATUS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "支払待ち", color: "text-amber-600" },
  PAID:    { label: "支払済",   color: "text-green-600" },
  FAILED:  { label: "支払失敗", color: "text-red-600" },
};

function ReservationStatusBadge({ status }: { status: string }) {
  const s = RESERVATION_STATUS[status] ?? { label: status, color: "text-gray-600 bg-gray-50 border-gray-200", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// マジックリンク送信フォーム
function LoginForm({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  // URLにtokenがあれば自動的に検証
  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) return;

    fetch("/api/auth/magic-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          onLogin(data.user);
        } else {
          setError(data.error || "リンクが無効です。再度お試しください。");
        }
      })
      .catch(() => setError("通信エラーが発生しました"));
  }, [searchParams, onLogin]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "送信に失敗しました"); return; }
      setSent(true);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  // tokenが存在する場合はローディング表示
  if (searchParams.get("token") && !error) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">ログイン中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center">
          <Link href="/" className="text-sm font-semibold tracking-widest text-gray-900 uppercase">ULAS</Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          {sent ? (
            // 送信完了画面
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 mx-auto mb-5 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">メールを送信しました</h1>
              <p className="text-sm text-gray-500 mb-1">
                <span className="font-semibold text-gray-700">{email}</span> に
              </p>
              <p className="text-sm text-gray-500 mb-6">ログインリンクを送信しました。<br />メールに記載のリンクをクリックしてください。</p>
              <p className="text-xs text-gray-400">リンクの有効期限は15分です。<br />届かない場合は迷惑メールフォルダをご確認ください。</p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="mt-6 text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600 transition-colors"
              >
                別のアドレスで試す
              </button>
            </div>
          ) : (
            // メール入力フォーム
            <>
              <div className="text-center mb-8">
                <div className="w-10 h-10 rounded-full bg-gray-900 mx-auto mb-4 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900">マイページ</h1>
                <p className="text-sm text-gray-500 mt-1">メールアドレスを入力するとログインリンクを送信します</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">メールアドレス</label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                    placeholder="ご購入時のメールアドレス"
                  />
                </div>
                <button
                  type="submit" disabled={loading}
                  className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-sm"
                >
                  {loading ? "送信中..." : "ログインリンクを送信"}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-6">
                まだご予約されていませんか?{" "}
                <Link href="/#reservation" className="text-gray-900 underline underline-offset-2">先行予約はこちら</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MyPageContent() {
  const [user, setUser] = useState<User | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          return fetch("/api/mypage/reservations");
        }
        setLoading(false);
        return null;
      })
      .then((r) => (r ? r.json() : null))
      .then((data) => {
        if (data?.reservations) setReservations(data.reservations);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setReservations([]);
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={(u) => { setUser(u); setLoading(true); window.location.replace("/mypage"); }} />;
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold tracking-widest text-gray-900 uppercase">ULAS</Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            ログアウト
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">マイページ</h1>
          <p className="text-sm text-gray-500 mt-1">{user.email}</p>
        </div>

        <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">アカウント情報</h2>
          </div>
          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">お名前</p>
              <p className="text-sm font-medium text-gray-900">{user.name || "（未設定）"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">メールアドレス</p>
              <p className="text-sm font-medium text-gray-900">{user.email}</p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ご予約一覧</h2>
            <span className="text-xs text-gray-400">{reservations.length}件</span>
          </div>

          {reservations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <p className="text-sm text-gray-500 mb-5">ご予約はまだありません</p>
              <Link href="/#reservation" className="inline-block bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold py-2.5 px-6 rounded-xl transition-colors">
                先行予約する
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((r) => {
                const ps = PAYMENT_STATUS[r.paymentStatus] ?? { label: r.paymentStatus, color: "text-gray-600" };
                return (
                  <div key={r.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">予約番号</p>
                        <p className="font-mono text-sm text-gray-800 font-semibold">{r.id}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <ReservationStatusBadge status={r.reservationStatus} />
                        <span className={`text-xs font-semibold ${ps.color}`}>{ps.label}</span>
                      </div>
                    </div>

                    <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-5 text-sm">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">商品</p>
                        <p className="font-medium text-gray-900">{r.product.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">金額</p>
                        <p className="font-bold text-gray-900">¥{r.totalAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">支払方法</p>
                        <p className="font-medium text-gray-900">
                          {r.paymentMethod === "CARD" ? "クレジットカード" : "銀行振込"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">予約日</p>
                        <p className="font-medium text-gray-900">
                          {new Date(r.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>

                    {r.shippingAddress && (
                      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-start gap-2 text-xs text-gray-500">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span>お届け先: 〒{r.shippingZip} {r.shippingAddress}</span>
                      </div>
                    )}

                    {r.paymentMethod === "BANK_TRANSFER" && r.paymentStatus === "PENDING" && (
                      <div className="px-6 py-5 bg-amber-50 border-t border-amber-100">
                        <p className="text-xs font-bold text-amber-700 mb-3">お振込みをお待ちしております</p>
                        <div className="bg-white border border-amber-200 rounded-xl p-4 mb-3">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">振込先口座</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-sm">
                            <div><p className="text-xs text-gray-400 mb-0.5">銀行名</p><p className="font-semibold text-gray-900">{BANK_TRANSFER.bankName}</p></div>
                            <div><p className="text-xs text-gray-400 mb-0.5">支店名</p><p className="font-semibold text-gray-900">{BANK_TRANSFER.branchName}</p></div>
                            <div><p className="text-xs text-gray-400 mb-0.5">口座種別</p><p className="font-semibold text-gray-900">{BANK_TRANSFER.accountType}</p></div>
                            <div><p className="text-xs text-gray-400 mb-0.5">口座番号</p><p className="font-bold text-gray-900 text-base tracking-wider">{BANK_TRANSFER.accountNumber}</p></div>
                            <div><p className="text-xs text-gray-400 mb-0.5">口座名義</p><p className="font-semibold text-gray-900">{BANK_TRANSFER.accountName}</p></div>
                            <div><p className="text-xs text-gray-400 mb-0.5">振込金額</p><p className="font-bold text-gray-900">¥{r.totalAmount.toLocaleString()}</p></div>
                          </div>
                        </div>
                        <p className="text-xs text-amber-700">振込期限: <span className="font-semibold">{BANK_TRANSFER.deadline}</span>。確認後、予約確定のご連絡をいたします。</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="text-center pb-8">
          <p className="text-xs text-gray-400">
            ご不明な点は{" "}
            <a href="mailto:support@ulas.jp" className="underline underline-offset-2 hover:text-gray-700 transition-colors">support@ulas.jp</a>
            {" "}までお問い合わせください
          </p>
        </div>
      </main>
    </div>
  );
}

export default function MyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    }>
      <MyPageContent />
    </Suspense>
  );
}
