import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getSession();
  if (!session || !session.isAdmin) return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  }

  const reservations = await prisma.reservation.findMany({
    include: {
      user: { select: { id: true, email: true, name: true, phone: true } },
      product: { select: { id: true, name: true, price: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ reservations });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  }

  const { reservationId, reservationStatus, paymentStatus } = await req.json();
  if (!reservationId) {
    return NextResponse.json({ error: "予約IDが必要です" }, { status: 400 });
  }

  const updated = await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      ...(reservationStatus && { reservationStatus }),
      ...(paymentStatus && { paymentStatus }),
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
      product: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ reservation: updated });
}
