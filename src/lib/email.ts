import { COMPANY, BANK_TRANSFER } from "./constants";

async function getResend() {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY is not set. Skipping email send.");
    return null;
  }
  const { Resend } = await import("resend");
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendReservationConfirmation(
  email: string,
  name: string,
  password: string,
  reservationId: string,
  paymentMethod: string,
  amount: number
) {
  const resend = await getResend();
  if (!resend) return;

  const paymentLabel = paymentMethod === "CARD" ? "クレジットカード" : "銀行振込";

  try {
    await resend.emails.send({
      from: `ULAS <${COMPANY.email}>`,
      to: email,
      subject: "【ULAS O3 finger】ご予約を承りました",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #0a0f1e; border-bottom: 2px solid #06b6d4; padding-bottom: 8px;">ご予約確認</h1>
          <p>${name} 様</p>
          <p>ULAS O3 finger のご予約を承りました。</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; background: #f5f5f5; font-weight: bold;">予約番号</td><td style="padding: 8px;">${reservationId}</td></tr>
            <tr><td style="padding: 8px; background: #f5f5f5; font-weight: bold;">お支払金額</td><td style="padding: 8px;">¥${amount.toLocaleString()}（税込・送料込）</td></tr>
            <tr><td style="padding: 8px; background: #f5f5f5; font-weight: bold;">お支払方法</td><td style="padding: 8px;">${paymentLabel}</td></tr>
          </table>
          <div style="background: #f0f9ff; border: 1px solid #06b6d4; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 8px; color: #0a0f1e;">マイページのログイン情報</h3>
            <p style="margin: 4px 0;">メールアドレス: <strong>${email}</strong></p>
            <p style="margin: 4px 0;">パスワード: <strong>${password}</strong></p>
            <p style="margin: 8px 0 0; font-size: 12px; color: #666;">ログイン後にパスワードを変更することをお勧めします。</p>
          </div>
          <p>商品のお届けは <strong>2026年10月上旬（9月中目標）</strong> を予定しています。</p>
          <p>ご不明な点は <a href="mailto:${COMPANY.email}">${COMPANY.email}</a> までお問い合わせください。</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="font-size: 12px; color: #999;">${COMPANY.name} | ${COMPANY.url}</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("[email] sendReservationConfirmation error:", err);
  }
}

export async function sendBankTransferInstructions(
  email: string,
  name: string,
  reservationId: string,
  amount: number
) {
  const resend = await getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: `ULAS <${COMPANY.email}>`,
      to: email,
      subject: "【ULAS O3 finger】銀行振込のご案内",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #0a0f1e; border-bottom: 2px solid #06b6d4; padding-bottom: 8px;">銀行振込のご案内</h1>
          <p>${name} 様</p>
          <p>ULAS O3 finger のご予約ありがとうございます。<br />下記口座へのお振込をお願いいたします。</p>
          <div style="background: #f0f9ff; border: 1px solid #06b6d4; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 12px; color: #0a0f1e;">振込先口座情報</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; font-weight: bold; width: 40%;">銀行名</td><td style="padding: 6px 0;">${BANK_TRANSFER.bankName}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">支店名</td><td style="padding: 6px 0;">${BANK_TRANSFER.branchName}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">口座種別</td><td style="padding: 6px 0;">${BANK_TRANSFER.accountType}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">口座番号</td><td style="padding: 6px 0;">${BANK_TRANSFER.accountNumber}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">口座名義</td><td style="padding: 6px 0;">${BANK_TRANSFER.accountName}</td></tr>
            </table>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; background: #f5f5f5; font-weight: bold;">予約番号</td><td style="padding: 8px;">${reservationId}</td></tr>
            <tr><td style="padding: 8px; background: #f5f5f5; font-weight: bold;">振込金額</td><td style="padding: 8px;">¥${amount.toLocaleString()}（税込・送料込）</td></tr>
            <tr><td style="padding: 8px; background: #f5f5f5; font-weight: bold;">振込期限</td><td style="padding: 8px;">ご注文後7日以内</td></tr>
          </table>
          <p style="color: #e53e3e; font-size: 14px;">※ 振込人名義は「お名前」でお振込ください。</p>
          <p>ご不明な点は <a href="mailto:${COMPANY.email}">${COMPANY.email}</a> までお問い合わせください。</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="font-size: 12px; color: #999;">${COMPANY.name} | ${COMPANY.url}</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("[email] sendBankTransferInstructions error:", err);
  }
}
