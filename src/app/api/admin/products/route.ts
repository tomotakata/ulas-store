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

  const products = await prisma.product.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ products });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  }

  const { productId, acceptingOrders, stock } = await req.json();
  if (!productId) {
    return NextResponse.json({ error: "商品IDが必要です" }, { status: 400 });
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data: {
      ...(acceptingOrders !== undefined && { acceptingOrders }),
      ...(stock !== undefined && { stock }),
    },
  });

  return NextResponse.json({ product: updated });
}
