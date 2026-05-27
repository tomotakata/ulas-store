import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function requireAdmin() {
  const session = await getSession();
  if (!session || !session.isAdmin) return null;
  return session;
}

// GET: 管理ユーザー一覧
export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    where: { isAdmin: true },
    select: { id: true, email: true, name: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ users });
}

// POST: 管理ユーザー追加
export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email, name, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: "メールとパスワードは必須です" }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "このメールは既に使用されています" }, { status: 400 });

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, name: name || email, password: hash, isAdmin: true },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  return NextResponse.json({ user });
}

// DELETE: 管理ユーザー削除
export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await req.json();
  if (userId === session.userId) return NextResponse.json({ error: "自分自身は削除できません" }, { status: 400 });

  await prisma.user.delete({ where: { id: userId as string } });
  return NextResponse.json({ ok: true });
}
