"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FormData {
  shippingName: string;
  shippingZip: string;
  shippingAddress: string;
  shippingPhone: string;
  email: string;
  paymentMethod: "CARD" | "BANK_TRANSFER";
}

export default function ReservationForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    shippingName: "",
    shippingZip: "",
    shippingAddress: "",
    shippingPhone: "",
    email: "",
    paymentMethod: "CARD",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    let formatted = value;

    if (name === "shippingZip") {
      formatted = value.replace(/[^0-9]/g, "").slice(0, 7);
      if (formatted.length > 3) {
        formatted = formatted.slice(0, 3) + "-" + formatted.slice(3);
      }
    }

    setForm((prev) => ({ ...prev, [name]: formatted }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "エラーが発生しました");
        return;
      }

      if (data.bankTransfer) {
        router.push(`/checkout?reservationId=${data.reservationId}&method=bank`);
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      if (data.sessionId) {
        router.push(`/checkout?sessionId=${data.sessionId}`);
      }
    } catch {
      setError("通信エラーが発生しました。再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="shippingName" className="block text-sm font-medium text-gray-700 mb-1">
          お名前 <span className="text-red-500">*</span>
        </label>
        <input
          id="shippingName"
          name="shippingName"
          type="text"
          required
          value={form.shippingName}
          onChange={handleChange}
          placeholder="山田 太郎"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          メールアドレス <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          placeholder="example@email.com"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">ご予約確認メールと、マイページのログイン情報をお送りします。</p>
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="shippingPhone" className="block text-sm font-medium text-gray-700 mb-1">
          電話番号 <span className="text-red-500">*</span>
        </label>
        <input
          id="shippingPhone"
          name="shippingPhone"
          type="tel"
          required
          value={form.shippingPhone}
          onChange={handleChange}
          placeholder="090-1234-5678"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      {/* Zip */}
      <div>
        <label htmlFor="shippingZip" className="block text-sm font-medium text-gray-700 mb-1">
          郵便番号 <span className="text-red-500">*</span>
        </label>
        <input
          id="shippingZip"
          name="shippingZip"
          type="text"
          required
          value={form.shippingZip}
          onChange={handleChange}
          placeholder="123-4567"
          maxLength={8}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      {/* Address */}
      <div>
        <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700 mb-1">
          住所 <span className="text-red-500">*</span>
        </label>
        <input
          id="shippingAddress"
          name="shippingAddress"
          type="text"
          required
          value={form.shippingAddress}
          onChange={handleChange}
          placeholder="東京都渋谷区〇〇1-2-3"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      {/* Payment Method */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-3">
          お支払方法 <span className="text-red-500">*</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          <label
            className={`flex items-center justify-center gap-2 px-4 py-4 border-2 rounded-lg cursor-pointer transition-all ${
              form.paymentMethod === "CARD"
                ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="CARD"
              checked={form.paymentMethod === "CARD"}
              onChange={() => setForm((prev) => ({ ...prev, paymentMethod: "CARD" }))}
              className="sr-only"
            />
            <span className="text-xl">💳</span>
            <span className="font-medium text-sm">クレジットカード</span>
          </label>
          <label
            className={`flex items-center justify-center gap-2 px-4 py-4 border-2 rounded-lg cursor-pointer transition-all ${
              form.paymentMethod === "BANK_TRANSFER"
                ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="BANK_TRANSFER"
              checked={form.paymentMethod === "BANK_TRANSFER"}
              onChange={() => setForm((prev) => ({ ...prev, paymentMethod: "BANK_TRANSFER" }))}
              className="sr-only"
            />
            <span className="text-xl">🏦</span>
            <span className="font-medium text-sm">銀行振込</span>
          </label>
        </div>
        {form.paymentMethod === "BANK_TRANSFER" && (
          <p className="text-xs text-amber-600 mt-2 bg-amber-50 px-3 py-2 rounded-lg">
            ご注文後7日以内にお振込ください。入金確認後に予約確定となります。
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl text-lg transition-all shadow-lg shadow-cyan-500/25"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            処理中...
          </span>
        ) : (
          "予約を確定する →"
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        ご予約いただくことで、
        <a href="/tokushoho" className="underline hover:text-gray-700">特定商取引法に基づく表示</a>
        に同意したものとみなします。
      </p>
    </form>
  );
}
