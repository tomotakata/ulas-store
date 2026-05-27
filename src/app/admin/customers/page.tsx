"use client";
import { useEffect, useState } from "react";

type User = {
  id: string; email: string; name: string | null; phone: string | null;
  createdAt: string;
  reservations: { id: string; paymentStatus: string; totalAmount: number }[];
};

export default function CustomersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/customers").then(r => r.json()).then(d => {
      setUsers(d.users || []);
      setLoading(false);
    });
  }, []);

  const filtered = users.filter(u =>
    (u.name || "").includes(search) || u.email.includes(search)
  );

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">顧客管理</h1>
        <p className="text-sm text-gray-500 mt-1">購入・予約した顧客一覧</p>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          placeholder="名前・メールで検索..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-500">{filtered.length}件</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3 text-left font-semibold text-gray-600">氏名</th>
              <th className="px-5 py-3 text-left font-semibold text-gray-600">メール</th>
              <th className="px-5 py-3 text-left font-semibold text-gray-600">電話番号</th>
              <th className="px-5 py-3 text-left font-semibold text-gray-600">予約数</th>
              <th className="px-5 py-3 text-left font-semibold text-gray-600">累計金額</th>
              <th className="px-5 py-3 text-left font-semibold text-gray-600">登録日</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">読み込み中...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">顧客データがありません</td></tr>
            ) : filtered.map(u => {
              const paid = u.reservations.filter(r => r.paymentStatus === "PAID");
              const total = paid.reduce((s, r) => s + r.totalAmount, 0);
              return (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{u.name || "—"}</td>
                  <td className="px-5 py-3 text-gray-600">{u.email}</td>
                  <td className="px-5 py-3 text-gray-600">{u.phone || "—"}</td>
                  <td className="px-5 py-3">
                    <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                      {u.reservations.length}件
                    </span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-gray-900">¥{total.toLocaleString()}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {new Date(u.createdAt).toLocaleDateString("ja-JP")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
