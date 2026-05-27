"use client";
import { useEffect, useState } from "react";

type AdminUser = { id: string; email: string; name: string | null; createdAt: string };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => fetch("/api/admin/users").then(r => r.json()).then(d => { setUsers(d.users || []); setLoading(false); });
  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setSaving(false); return; }
    setForm({ email: "", name: "", password: "" });
    setShowForm(false);
    load();
    setSaving(false);
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`${email} を削除しますか？`)) return;
    await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id }),
    });
    load();
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">管理ユーザー</h1>
          <p className="text-sm text-gray-500 mt-1">管理画面にログインできるユーザーの管理</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gray-900 text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-gray-700 transition-colors"
        >
          + ユーザー追加
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 space-y-4">
          <h2 className="font-bold text-gray-900">新しい管理ユーザーを追加</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">メールアドレス *</label>
              <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">名前</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">パスワード *</label>
              <input type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-gray-700 disabled:opacity-50">
              {saving ? "追加中..." : "追加する"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="bg-gray-100 text-gray-700 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-gray-200">
              キャンセル
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3 text-left font-semibold text-gray-600">名前</th>
              <th className="px-5 py-3 text-left font-semibold text-gray-600">メールアドレス</th>
              <th className="px-5 py-3 text-left font-semibold text-gray-600">追加日</th>
              <th className="px-5 py-3 text-left font-semibold text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">読み込み中...</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{u.name || "—"}</td>
                <td className="px-5 py-3 text-gray-600">{u.email}</td>
                <td className="px-5 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString("ja-JP")}</td>
                <td className="px-5 py-3">
                  <button onClick={() => handleDelete(u.id, u.email)}
                    className="text-red-500 hover:text-red-700 text-xs font-semibold">
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
