import { NextResponse } from "next/server";
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
