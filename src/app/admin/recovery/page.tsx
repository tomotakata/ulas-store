"use client";
import { useEffect, useState } from "react";

interface AbandonedReservation {
  id: string;
  createdAt: string;
  totalAmount: number;
  shippingName: string;
  user: { id: string; email: string; name: string | null };
}

interface RecoveryResult {
  id: string;
  email: string;
  status: "sent" | "error";
  error?: string;
}

export default function RecoveryPage() {
  const [rows, setRows] = useState<AbandonedReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState<Set<string>>(new Set());
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [bulkSending, setBulkSending] = useState(false);

  useEffect(() => {
    fetch("/api/admin/reservations/recover-payment")
      .then(r => r.json())
      .then(d => { setRows(d.reservations || []); setLoading(false); });
  }, []);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === rows.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rows.map(r => r.id)));
    }
  };

  async function sendRecovery(ids: string[]): Promise<RecoveryResult[]> {
    const res = await fetch("/api/admin/reservations/recover-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reservationIds: ids }),
    });
    const data = await res.json();
    return data.results as { id: string; email: string; status: "sent" | "error" }[];
  }

  async function handleSendOne(id: string) {
    setSending(prev => new Set(prev).add(id));
    const results = await sendRecovery([id]);
    setSending(prev => { const n = new Set(prev); n.delete(id); return n; });
    const result = results[0] as RecoveryResult | undefined;
    if (result?.status === "sent") {
      setSent(prev => new Set(prev).add(id));
    } else {
      alert("送信に失敗しました: " + (result?.error ?? "不明なエラー"));
    }
  }

  async function handleBulkSend() {
    if (selected.size === 0) return;
    if (!confirm(`選択した ${selected.size} 件にフォローアップメールを送信しますか？`)) return;
    setBulkSending(true);
    const ids = Array.from(selected);
    const results = await sendRecovery(ids);
    setBulkSending(false);
    const succeeded = results.filter(r => r.status === "sent").map(r => r.id);
    setSent(prev => new Set([...prev, ...succeeded]));
    const failed = results.filter(r => r.status === "error");
    if (failed.length > 0) {
      alert(`${succeeded.length}件送信完了。${failed.length}件失敗。`);
    } else {
      alert(`${succeeded.length}件すべて送信完了しました。`);
    }
    setSelected(new Set());
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">未決済フォローアップ</h1>
        <p className="text-sm text-gray-500 mt-1">
          お客様情報を入力してカード決済を完了していない方への案内メール送信
        </p>
      </div>

      {/* 説明カード */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
        <svg className="shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <div className="text-sm text-amber-800">
          <p className="font-semibold mb-1">フォローアップメールについて</p>
          <ul className="text-xs space-y-1 text-amber-700">
            <li>• 既存のStripeセッションが有効（24時間以内）な場合は、そのURLを再送します</li>
            <li>• 期限切れの場合は、新しい決済URLを自動生成してお客様情報を引き継いで送信します</li>
            <li>• 送信後、お客様はボタン1クリックでカード情報入力画面に移動できます</li>
          </ul>
        </div>
      </div>

      {/* 件数 & 一括送信 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">
            未決済: <span className="text-orange-600">{rows.length}件</span>
          </span>
          {selected.size > 0 && (
            <span className="text-xs text-gray-500">{selected.size}件選択中</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleAll}
            className="text-xs border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 font-medium"
          >
            {selected.size === rows.length ? "選択解除" : "全て選択"}
          </button>
          <button
            onClick={handleBulkSend}
            disabled={selected.size === 0 || bulkSending}
            className="flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold rounded-lg px-4 py-2 disabled:opacity-40 hover:bg-gray-700 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            {bulkSending ? "送信中..." : `選択した${selected.size}件にメール送信`}
          </button>
        </div>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={rows.length > 0 && selected.size === rows.length} onChange={toggleAll}
                  className="rounded border-gray-300" />
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">氏名 / メール</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">金額</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">申込日時</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">ステータス</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">アクション</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">読み込み中...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                <div className="flex flex-col items-center gap-2">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <p>未決済のカード申込はありません</p>
                </div>
              </td></tr>
            ) : rows.map(r => {
              const isSent = sent.has(r.id);
              const isSending = sending.has(r.id);
              return (
                <tr key={r.id} className={`border-b border-gray-50 hover:bg-gray-50 ${isSent ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)}
                      disabled={isSent} className="rounded border-gray-300" />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{r.shippingName}</p>
                    <p className="text-xs text-gray-400">{r.user.email}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">¥{r.totalAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(r.createdAt).toLocaleString("ja-JP")}
                  </td>
                  <td className="px-4 py-3">
                    {isSent ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        送信済
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                        未決済
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!isSent && (
                      <button
                        onClick={() => handleSendOne(r.id)}
                        disabled={isSending}
                        className="flex items-center gap-1.5 text-xs bg-gray-900 text-white rounded-lg px-3 py-1.5 font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                        {isSending ? "送信中..." : "メール送信"}
                      </button>
                    )}
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
