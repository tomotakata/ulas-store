"use client";
import { useEffect, useState } from "react";

type Product = {
  id: string; name: string; price: number; stock: number | null;
  acceptingOrders: boolean; stripeProductId: string | null; stripePriceId: string | null;
  createdAt: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const load = () => fetch("/api/admin/products").then(r => r.json()).then(d => { setProducts(d.products || []); setLoading(false); });
  useEffect(() => { load(); }, []);

  async function toggle(p: Product) {
    setSaving(p.id);
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: p.id, acceptingOrders: !p.acceptingOrders }),
    });
    await load();
    setSaving(null);
  }

  async function updateStock(p: Product, val: string) {
    const stock = parseInt(val);
    if (isNaN(stock)) return;
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: p.id, stock }),
    });
    load();
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">商品管理</h1>
        <p className="text-sm text-gray-500 mt-1">Stripe連携・在庫・受付ON/OFF管理</p>
      </div>

      {loading ? (
        <p className="text-gray-400">読み込み中...</p>
      ) : products.map(p => (
        <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-black text-gray-900">{p.name}</h2>
              <p className="text-sm text-gray-500 mt-0.5">ID: {p.id}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">販売価格</p>
                  <p className="font-black text-xl text-gray-900">¥{p.price.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">在庫数</p>
                  <input
                    type="number"
                    defaultValue={p.stock ?? ""}
                    placeholder="無制限"
                    onBlur={e => updateStock(p, e.target.value)}
                    className="font-black text-xl text-gray-900 bg-transparent border-b border-gray-300 w-full focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Stripe商品ID</p>
                  <p className="font-mono text-xs text-gray-700 break-all">{p.stripeProductId || "未設定"}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Stripe価格ID</p>
                  <p className="font-mono text-xs text-gray-700 break-all">{p.stripePriceId || "未設定"}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${p.acceptingOrders ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {p.acceptingOrders ? "受付中" : "受付停止"}
              </div>
              <button
                onClick={() => toggle(p)}
                disabled={saving === p.id}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                  p.acceptingOrders
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-green-50 text-green-600 hover:bg-green-100"
                }`}
              >
                {saving === p.id ? "更新中..." : p.acceptingOrders ? "受付を停止する" : "受付を開始する"}
              </button>
              {p.stripeProductId && (
                <a
                  href={`https://dashboard.stripe.com/products/${p.stripeProductId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Stripeで開く
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
