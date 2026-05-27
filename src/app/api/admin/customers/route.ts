import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getSession();
  if (!session || !session.isAdmin) return null;
  return session;
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    select: {
      id: true, email: true, name: true, phone: true, isAdmin: false,
      createdAt: true,
      reservations: {
        select: { id: true, paymentStatus: true, totalAmount: true },
      },
    },
    where: { isAdmin: false },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}
