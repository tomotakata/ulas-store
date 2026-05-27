"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    WAITING: { label: "待機中", cls: "bg-yellow-100 text-yellow-700" },
    CONFIRMED: { label: "確認済", cls: "bg-green-100 text-green-700" },
    SHIPPING: { label: "発送中", cls: "bg-blue-100 text-blue-700" },
    DELIVERED: { label: "配達完了", cls: "bg-gray-100 text-gray-700" },
    CANCELLED: { label: "キャンセル", cls: "bg-red-100 text-red-700" },
    PENDING: { label: "未払い", cls: "bg-yellow-100 text-yellow-700" },
    PAID: { label: "支払済", cls: "bg-green-100 text-green-700" },
    FAILED: { label: "失敗", cls: "bg-red-100 text-red-700" },
  };
  const { label, cls } = map[status] || { label: status, cls: "bg-gray-100 text-gray-700" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

function LoginForm({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "ログインに失敗しました");
        return;
      }
      onLogin(data.user);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">マイページにログイン</h2>
          <p className="text-gray-500 text-sm text-center mb-8">
            ご予約時に発行したメールアドレスとパスワードでログインしてください。
          </p>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="example@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="パスワードを入力"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-60 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            まだご予約されていませんか？{" "}
            <Link href="/#reservation" className="text-cyan-600 underline">
              先行予約はこちら
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MyPage() {
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
      .then((r) => {
        if (!r) return null;
        return r.json();
      })
      .then((data) => {
        if (data?.reservations) {
          setReservations(data.reservations);
        }
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={(u) => { setUser(u); setLoading(true); window.location.reload(); }} />;
  }

  return (
    <div className="bg-gray-50 min-h-[80vh]">
      <div className="bg-[#0a0f1e] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">マイページ</h1>
            <p className="text-white/50 text-sm mt-1">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-white/60 hover:text-white text-sm transition-colors border border-white/20 px-4 py-2 rounded-lg"
          >
            ログアウト
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* User info card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">アカウント情報</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">名前</span>
              <p className="font-medium text-gray-900 mt-0.5">{user.name || "（未設定）"}</p>
            </div>
            <div>
              <span className="text-gray-400">メールアドレス</span>
              <p className="font-medium text-gray-900 mt-0.5">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Reservations */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">ご予約一覧</h2>
        {reservations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-gray-500 mb-4">ご予約はまだありません</p>
            <Link href="/#reservation" className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-6 rounded-xl transition-colors text-sm">
              先行予約する
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-1">予約番号</p>
                    <p className="font-mono text-sm text-gray-700 font-bold">{r.id}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(r.createdAt).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={r.reservationStatus} />
                    <StatusBadge status={r.paymentStatus} />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">商品</span>
                    <p className="text-gray-900 font-medium mt-0.5">{r.product.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">金額</span>
                    <p className="text-gray-900 font-bold mt-0.5">¥{r.totalAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">支払方法</span>
                    <p className="text-gray-900 font-medium mt-0.5">
                      {r.paymentMethod === "CARD" ? "クレジットカード" : "銀行振込"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-400">
                  お届け先: {r.shippingZip} {r.shippingAddress}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
