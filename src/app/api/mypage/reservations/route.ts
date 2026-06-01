import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const reservations = await prisma.reservation.findMany({
    where: { userId: session.userId },
    include: {
      product: { select: { id: true, name: true, price: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ reservations });
}

// 住所変更（決済情報には一切触れない）
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { reservationId, shippingName, shippingZip, shippingAddress, shippingPhone } = await req.json();

  // 本人の予約かチェック
  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId, userId: session.userId },
  });
  if (!reservation) {
    return NextResponse.json({ error: "予約が見つかりません" }, { status: 404 });
  }

  // キャンセル・発送済みは変更不可
  if (["SHIPPING", "DELIVERED", "CANCELLED"].includes(reservation.reservationStatus)) {
    return NextResponse.json({ error: "この予約は住所変更できません" }, { status: 400 });
  }

  const updated = await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      shippingName: shippingName ?? reservation.shippingName,
      shippingZip: shippingZip ?? reservation.shippingZip,
      shippingAddress: shippingAddress ?? reservation.shippingAddress,
      shippingPhone: shippingPhone ?? reservation.shippingPhone,
      addressUpdatedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, reservation: updated });
}
