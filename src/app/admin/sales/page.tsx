"use client";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, subDays } from "date-fns";

interface Reservation {
  id: string; createdAt: string; totalAmount: number;
  paymentMethod: string; paymentStatus: string; reservationStatus: string;
  shippingName: string; shippingZip: string; shippingAddress: string; shippingPhone: string;
  addressUpdatedAt: string | null;
  user: { email: string; name: string | null };
  product: { name: string; price: number };
}

const STATUS_LABEL: Record<string, string> = {
  WAITING:"待機中", CONFIRMED:"確認済", SHIPPING:"発送中", DELIVERED:"配達完了", CANCELLED:"キャンセル",
  PENDING:"未払い", PAID:"支払済", FAILED:"失敗", REFUNDED:"返金済",
};
const STATUS_COLOR: Record<string, string> = {
  WAITING:"bg-yellow-100 text-yellow-700", CONFIRMED:"bg-green-100 text-green-700",
  SHIPPING:"bg-blue-100 text-blue-700", DELIVERED:"bg-gray-100 text-gray-700",
  CANCELLED:"bg-red-100 text-red-700", PENDING:"bg-yellow-100 text-yellow-700",
  PAID:"bg-green-100 text-green-700", FAILED:"bg-red-100 text-red-700", REFUNDED:"bg-purple-100 text-purple-700",
};

function Badge({ s }: { s: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[s] || "bg-gray-100 text-gray-700"}`}>{STATUS_LABEL[s] || s}</span>;
}

export default function SalesPage() {
  const [rows, setRows] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterR, setFilterR] = useState("all");
  const [filterP, setFilterP] = useState("all");

  const load = () => fetch("/api/admin/reservations").then(r => r.json()).then(d => { setRows(d.reservations || []); setLoading(false); });
  useEffect(() => { load(); }, []);

  const filtered = rows.filter(r =>
    (filterR === "all" || r.reservationStatus === filterR) &&
    (filterP === "all" || r.paymentStatus === filterP)
  );

  const paid = rows.filter(r => r.paymentStatus === "PAID");
  const bankPending = rows.filter(r => r.paymentMethod === "BANK_TRANSFER" && r.paymentStatus === "PENDING");
  const totalSales = paid.reduce((s, r) => s + r.totalAmount, 0);

  // 14日間グラフ
  const today = new Date();
  const chartData = Array.from({ length: 14 }, (_, i) => {
    const d = subDays(today, 13 - i);
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    const count = rows.filter(r => format(new Date(r.createdAt), "yyyy-MM-dd") === format(d, "yyyy-MM-dd")).length;
    return { label, count };
  });

  async function updateStatus(id: string, field: string, val: string) {
    await fetch("/api/admin/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reservationId: id, [field]: val }),
    });
    load();
  }

  async function downloadCSV() {
    const res = await fetch("/api/admin/reservations/csv");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "reservations.csv"; a.click();
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">売上管理</h1>
          <p className="text-sm text-gray-500 mt-1">予約・決済状況の確認と管理</p>
        </div>
        <button onClick={downloadCSV} className="flex items-center gap-2 bg-gray-900 text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-gray-700 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          CSVダウンロード
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "総予約数", val: rows.length, color: "bg-white border border-gray-100" },
          { label: "支払済", val: paid.length, color: "bg-green-50 border border-green-100" },
          { label: "銀行振込 未払い", val: bankPending.length, color: "bg-yellow-50 border border-yellow-100" },
          { label: "総売上", val: `¥${totalSales.toLocaleString()}`, color: "bg-blue-50 border border-blue-100" },
        ].map(c => (
          <div key={c.label} className={`rounded-2xl p-5 ${c.color}`}>
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className="text-3xl font-black text-gray-900">{c.val}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-4">直近14日間の予約数</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select value={filterR} onChange={e => setFilterR(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="all">予約状況: すべて</option>
          {["WAITING","CONFIRMED","SHIPPING","DELIVERED","CANCELLED"].map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <select value={filterP} onChange={e => setFilterP(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="all">支払状況: すべて</option>
          {["PENDING","PAID","FAILED","REFUNDED"].map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <span className="text-sm text-gray-500 self-center">{filtered.length}件表示</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">日時</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">氏名 / メール</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">金額</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">支払</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">予約状況</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">支払状況</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">読み込み中...</td></tr>
            ) : filtered.map(r => (
              <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 text-xs text-gray-500">{new Date(r.createdAt).toLocaleString("ja-JP")}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-medium text-gray-900">{r.shippingName}</p>
                    {r.addressUpdatedAt && (
                      <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-semibold px-1.5 py-0.5 rounded-full border border-orange-200 whitespace-nowrap">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        住所変更
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{r.user.email}</p>
                </td>
                <td className="px-4 py-3 font-semibold">¥{r.totalAmount.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{r.paymentMethod === "CARD" ? "カード" : "銀行振込"}</td>
                <td className="px-4 py-3">
                  <select value={r.reservationStatus} onChange={e => updateStatus(r.id, "reservationStatus", e.target.value)}
                    className="text-xs border border-gray-200 rounded px-1.5 py-1">
                    {["WAITING","CONFIRMED","SHIPPING","DELIVERED","CANCELLED"].map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select value={r.paymentStatus} onChange={e => updateStatus(r.id, "paymentStatus", e.target.value)}
                    className="text-xs border border-gray-200 rounded px-1.5 py-1">
                    {["PENDING","PAID","FAILED","REFUNDED"].map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
