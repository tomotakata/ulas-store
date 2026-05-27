import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, COOKIE_NAME } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: "トークンが無効です" }, { status: 400 });

    const magicLink = await prisma.magicLink.findUnique({ where: { token } });

    if (!magicLink) return NextResponse.json({ error: "リンクが無効です" }, { status: 400 });
    if (magicLink.usedAt) return NextResponse.json({ error: "このリンクはすでに使用済みです" }, { status: 400 });
    if (magicLink.expiresAt < new Date()) return NextResponse.json({ error: "リンクの有効期限が切れています。再度お試しください。" }, { status: 400 });

    // トークンを使用済みに
    await prisma.magicLink.update({ where: { token }, data: { usedAt: new Date() } });

    const user = await prisma.user.findUnique({ where: { email: magicLink.email } });
    if (!user) return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });

    const sessionToken = await createSessionToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    const res = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin },
    });

    res.cookies.set(COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("[magic-verify]", err);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
