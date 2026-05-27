"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

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
  shippingPhone: string;
  user: { email: string; name: string | null; phone: string | null };
  product: { name: string; price: number };
}

const RESERVATION_STATUS_OPTIONS = ["WAITING", "CONFIRMED", "SHIPPING", "DELIVERED", "CANCELLED"];
const PAYMENT_STATUS_OPTIONS = ["PENDING", "PAID", "FAILED", "REFUNDED"];

const statusLabel: Record<string, string> = {
  WAITING: "待機中",
  CONFIRMED: "確認済",
  SHIPPING: "発送中",
  DELIVERED: "配達完了",
  CANCELLED: "キャンセル",
  PENDING: "未払い",
  PAID: "支払済",
  FAILED: "失敗",
  REFUNDED: "返金済",
};

const statusColor: Record<string, string> = {
  WAITING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-green-100 text-green-700",
  SHIPPING: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-gray-100 text-gray-700",
  CANCELLED: "bg-red-100 text-red-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  PAID: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-purple-100 text-purple-700",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor[status] || "bg-gray-100 text-gray-700"}`}>
      {statusLabel[status] || status}
    </span>
  );
}

function StatCard({ title, value, sub, color }: { title: string; value: number | string; sub?: string; color: string }) {
  return (
    <div className={`rounded-2xl p-6 ${color}`}>
      <p className="text-sm font-medium opacity-70">{title}</p>
      <p className="text-3xl font-black mt-1">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadReservations();
  }, []);

  async function loadReservations() {
    setLoading(true);
    const res = await fetch("/api/admin/reservations");
    const data = await res.json();
    if (data.reservations) setReservations(data.reservations);
    setLoading(false);
  }

  async function updateReservation(
    reservationId: string,
    field: "reservationStatus" | "paymentStatus",
    value: string
  ) {
    setUpdating(reservationId);
    const res = await fetch("/api/admin/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reservationId, [field]: value }),
    });
    if (res.ok) {
      await loadReservations();
    }
    setUpdating(null);
  }

  const filtered = reservations.filter((r) => {
    if (filterStatus && r.reservationStatus !== filterStatus) return false;
    if (filterPayment && r.paymentStatus !== filterPayment) return false;
    return true;
  });

  const stats = {
    total: reservations.length,
    paid: reservations.filter((r) => r.paymentStatus === "PAID").length,
    bankPending: reservations.filter(
      (r) => r.paymentMethod === "BANK_TRANSFER" && r.paymentStatus === "PENDING"
    ).length,
    totalRevenue: reservations
      .filter((r) => r.paymentStatus === "PAID")
      .reduce((sum, r) => sum + r.totalAmount, 0),
  };

  // Build daily chart data (last 14 days)
  const chartData = (() => {
    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days[d.toISOString().split("T")[0]] = 0;
    }
    reservations.forEach((r) => {
      const day = r.createdAt.split("T")[0];
      if (day in days) days[day]++;
    });
    return Object.entries(days).map(([date, count]) => ({
      date: format(new Date(date), "M/d", { locale: ja }),
      予約数: count,
    }));
  })();

  return (
    <div className="bg-gray-50 min-h-[80vh]">
      <div className="bg-[#0a0f1e] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">管理ダッシュボード</h1>
            <p className="text-white/50 text-sm mt-1">ULAS O3 finger 予約管理</p>
          </div>
          <a
            href="/api/admin/reservations/csv"
            className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors border border-white/20 flex items-center gap-2"
          >
            <span>📥</span> CSVダウンロード
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="総予約数" value={stats.total} color="bg-white border border-gray-200 text-gray-900" />
          <StatCard title="支払済" value={stats.paid} color="bg-green-50 border border-green-200 text-green-900" />
          <StatCard
            title="銀行振込 未払い"
            value={stats.bankPending}
            color="bg-yellow-50 border border-yellow-200 text-yellow-900"
          />
          <StatCard
            title="総売上"
            value={`¥${stats.totalRevenue.toLocaleString()}`}
            sub="支払済のみ"
            color="bg-blue-50 border border-blue-200 text-blue-900"
          />
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">直近14日間の予約数</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
                <Bar dataKey="予約数" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">予約状況: すべて</option>
            {RESERVATION_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{statusLabel[s]}</option>
            ))}
          </select>
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">支払状況: すべて</option>
            {PAYMENT_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{statusLabel[s]}</option>
            ))}
          </select>
          <span className="text-sm text-gray-400 self-center ml-auto">
            {filtered.length}件表示
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">予約がありません</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">日時</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">氏名 / メール</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">金額</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">支払</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">予約状況</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">支払状況</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="text-xs text-gray-400">
                          {format(new Date(r.createdAt), "M/d HH:mm")}
                        </div>
                        <div className="font-mono text-xs text-gray-300 mt-0.5 truncate max-w-[100px]">{r.id.slice(0, 8)}...</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{r.shippingName}</div>
                        <div className="text-xs text-gray-400">{r.user.email}</div>
                      </td>
                      <td className="px-4 py-4 font-bold text-gray-900">
                        ¥{r.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-500">
                        {r.paymentMethod === "CARD" ? "カード" : "振込"}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={r.reservationStatus} />
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={r.paymentStatus} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <select
                            disabled={updating === r.id}
                            value={r.reservationStatus}
                            onChange={(e) => updateReservation(r.id, "reservationStatus", e.target.value)}
                            className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
                          >
                            {RESERVATION_STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{statusLabel[s]}</option>
                            ))}
                          </select>
                          <select
                            disabled={updating === r.id}
                            value={r.paymentStatus}
                            onChange={(e) => updateReservation(r.id, "paymentStatus", e.target.value)}
                            className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
                          >
                            {PAYMENT_STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{statusLabel[s]}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
