import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COMPANY } from "@/lib/constants";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "メールアドレスを入力してください" }, { status: 400 });

    const normalizedEmail = email.toLowerCase().trim();

    // ユーザーが存在するか確認（購入済みのみログイン可能）
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      // セキュリティのため存在しない場合も成功レスポンスを返す
      return NextResponse.json({ ok: true });
    }

    // 古いトークンを削除
    await prisma.magicLink.deleteMany({
      where: { email: normalizedEmail, usedAt: null },
    });

    // 新しいトークン生成（15分有効）
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.magicLink.create({
      data: { email: normalizedEmail, token, expiresAt },
    });

    const loginUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/mypage?token=${token}`;

    // メール送信
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: `ULAS <${COMPANY.email}>`,
      to: normalizedEmail,
      subject: "【ULAS】マイページへのログインリンク",
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
          <div style="padding: 40px 32px; background: #fff; border: 1px solid #e5e5e5; border-radius: 12px;">
            <p style="font-size: 13px; font-weight: 600; letter-spacing: 0.1em; color: #666; margin: 0 0 24px;">ULAS</p>
            <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 8px;">マイページにログイン</h1>
            <p style="font-size: 14px; color: #555; margin: 0 0 32px;">以下のボタンをクリックしてマイページにアクセスしてください。</p>
            <a href="${loginUrl}" style="display: inline-block; background: #111; color: #fff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; margin-bottom: 24px;">
              マイページを開く
            </a>
            <p style="font-size: 12px; color: #999; margin: 0 0 4px;">このリンクは15分間有効です。</p>
            <p style="font-size: 12px; color: #999; margin: 0;">ログインを申請していない場合は、このメールを無視してください。</p>
          </div>
          <p style="font-size: 11px; color: #bbb; text-align: center; margin-top: 20px;">${COMPANY.name}</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[magic-link]", err);
    return NextResponse.json({ error: "送信に失敗しました" }, { status: 500 });
  }
}
