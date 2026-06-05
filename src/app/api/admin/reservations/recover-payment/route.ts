import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendPaymentRecoveryEmail } from "@/lib/email";
import { PRODUCT } from "@/lib/constants";

async function requireAdmin() {
  const session = await getSession();
  if (!session || !session.isAdmin) return null;
  return session;
}

// 既存セッションが有効か確認し、無効なら新規作成して決済URLを返す
async function getOrCreateCheckoutUrl(reservationId: string, stripeSessionId: string | null, customerEmail: string): Promise<string> {
  // 既存セッションの確認
  if (stripeSessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
      if (session.status === "open" && session.url) {
        return session.url;
      }
    } catch {
      // セッション取得失敗 → 新規作成へ
    }
  }

  // 新規Stripeセッション作成（既存の reservationId を metadata に引き継ぐ）
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://store.ulas.jp";
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: "jpy",
          product_data: {
            name: "ULAS O3 finger",
            description: "水からオゾン水を生成するコンパクトタイプのオゾン水生成器",
          },
          unit_amount: PRODUCT.price,
        },
        quantity: 1,
      },
    ],
    metadata: {
      reservationId,
      isNewUser: "false",
      plainPassword: "",
    },
    success_url: `${baseUrl}/thanks?reservationId=${reservationId}`,
    cancel_url: `${baseUrl}/?cancelled=true`,
  });

  // 予約のstripeSessionIdを更新
  await prisma.reservation.update({
    where: { id: reservationId },
    data: { stripeSessionId: session.id },
  });

  return session.url!;
}

// 単件または複数件の回復メール送信
export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { reservationIds } = await req.json() as { reservationIds: string[] };
  if (!Array.isArray(reservationIds) || reservationIds.length === 0) {
    return NextResponse.json({ error: "reservationIds is required" }, { status: 400 });
  }

  const reservations = await prisma.reservation.findMany({
    where: {
      id: { in: reservationIds },
      paymentMethod: "CARD",
      paymentStatus: "PENDING",
    },
    include: { user: true },
  });

  const results: { id: string; email: string; status: "sent" | "error"; error?: string }[] = [];

  for (const r of reservations) {
    try {
      const checkoutUrl = await getOrCreateCheckoutUrl(r.id, r.stripeSessionId, r.user.email);
      await sendPaymentRecoveryEmail(r.user.email, r.shippingName, r.id, r.totalAmount, checkoutUrl);
      results.push({ id: r.id, email: r.user.email, status: "sent" });
    } catch (err) {
      results.push({ id: r.id, email: r.user.email, status: "error", error: String(err) });
    }
  }

  return NextResponse.json({ results });
}

// 未決済カード一覧を取得
export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const reservations = await prisma.reservation.findMany({
    where: {
      paymentMethod: "CARD",
      paymentStatus: "PENDING",
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ reservations });
}
