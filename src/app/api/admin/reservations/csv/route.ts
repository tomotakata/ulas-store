import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  }

  const reservations = await prisma.reservation.findMany({
    include: {
      user: { select: { email: true, name: true, phone: true } },
      product: { select: { name: true, price: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const header = [
    "予約ID",
    "予約日時",
    "お名前",
    "メールアドレス",
    "電話番号",
    "郵便番号",
    "住所",
    "商品",
    "金額",
    "支払方法",
    "支払状況",
    "予約状況",
  ].join(",");

  const rows = reservations.map((r) => {
    const paymentMethodLabel = r.paymentMethod === "CARD" ? "クレジットカード" : "銀行振込";
    const paymentStatusLabel =
      r.paymentStatus === "PAID" ? "支払済"
      : r.paymentStatus === "PENDING" ? "未払い"
      : r.paymentStatus === "FAILED" ? "失敗"
      : "返金済";
    const reservationStatusLabel =
      r.reservationStatus === "WAITING" ? "待機中"
      : r.reservationStatus === "CONFIRMED" ? "確認済"
      : r.reservationStatus === "SHIPPING" ? "発送中"
      : r.reservationStatus === "DELIVERED" ? "配達完了"
      : "キャンセル";

    return [
      r.id,
      r.createdAt.toISOString(),
      `"${r.shippingName}"`,
      r.user.email,
      r.user.phone || "",
      r.shippingZip,
      `"${r.shippingAddress}"`,
      r.product.name,
      r.totalAmount,
      paymentMethodLabel,
      paymentStatusLabel,
      reservationStatusLabel,
    ].join(",");
  });

  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="reservations_${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
