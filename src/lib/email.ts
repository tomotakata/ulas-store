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
  _password: string,
  reservationId: string,
  paymentMethod: string,
  amount: number
) {
  const resend = await getResend();
  if (!resend) return;

  const paymentLabel = paymentMethod === "CARD" ? "クレジットカード" : "銀行振込";
  const mypageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://store.ulas.jp"}/mypage`;

  try {
    await resend.emails.send({
      from: `ULAS <${COMPANY.email}>`,
      to: email,
      subject: "【ULAS O3 finger】ご予約を承りました",
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
          <div style="padding: 40px 32px; background: #fff; border: 1px solid #e5e5e5; border-radius: 12px;">
            <p style="font-size: 13px; font-weight: 600; letter-spacing: 0.1em; color: #666; margin: 0 0 24px;">ULAS</p>
            <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 8px;">ご予約ありがとうございます</h1>
            <p style="font-size: 14px; color: #555; margin: 0 0 24px;">${name} 様のご予約を承りました。</p>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
              <tr style="border-bottom: 1px solid #eee;"><td style="padding: 10px 0; color: #888; width: 40%;">予約番号</td><td style="padding: 10px 0; font-family: monospace; font-weight: 600;">${reservationId}</td></tr>
              <tr style="border-bottom: 1px solid #eee;"><td style="padding: 10px 0; color: #888;">お支払金額</td><td style="padding: 10px 0; font-weight: 700;">¥${amount.toLocaleString()}（税込・送料込）</td></tr>
              <tr><td style="padding: 10px 0; color: #888;">お支払方法</td><td style="padding: 10px 0;">${paymentLabel}</td></tr>
            </table>
            <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="font-size: 13px; color: #555; margin: 0 0 12px;">ご予約の確認・状況はマイページからご確認いただけます。</p>
              <a href="${mypageUrl}" style="display: inline-block; background: #111; color: #fff; font-size: 13px; font-weight: 600; text-decoration: none; padding: 10px 24px; border-radius: 6px;">マイページを確認する</a>
            </div>
            <p style="font-size: 13px; color: #555; margin: 0 0 8px;">商品のお届けは <strong>2026年10月上旬（9月中目標）</strong> を予定しています。</p>
            <p style="font-size: 13px; color: #555; margin: 0;">ご不明な点は <a href="mailto:${COMPANY.email}" style="color: #111;">${COMPANY.email}</a> までお問い合わせください。</p>
          </div>
          <p style="font-size: 11px; color: #bbb; text-align: center; margin-top: 20px;">${COMPANY.name}</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("[email] sendReservationConfirmation error:", err);
  }
}

export async function sendPaymentRecoveryEmail(
  email: string,
  name: string,
  reservationId: string,
  amount: number,
  checkoutUrl: string
) {
  const resend = await getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: `ULAS <${COMPANY.email}>`,
      to: email,
      subject: "【ULAS O3 finger】お手続きが完了していません",
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
          <div style="padding: 40px 32px; background: #fff; border: 1px solid #e5e5e5; border-radius: 12px;">
            <p style="font-size: 13px; font-weight: 600; letter-spacing: 0.1em; color: #666; margin: 0 0 24px;">ULAS</p>
            <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 8px;">お手続きが完了していません</h1>
            <p style="font-size: 14px; color: #555; margin: 0 0 24px;">${name} 様</p>
            <p style="font-size: 14px; color: #555; margin: 0 0 20px;">
              <strong>ULAS O3 finger</strong> のご予約ありがとうございます。<br /><br />
              ご予約情報を確認させていただき、お客様用の予約商品の枠を確保させていただきました。<br />
              決済情報の入力が完了していないため、下記のボタンより決済情報を入力いただき、<br />
              決済完了をお手数ですが、よろしくお願い致します。
            </p>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
              <tr style="border-bottom: 1px solid #eee;"><td style="padding: 10px 0; color: #888; width: 40%;">予約番号</td><td style="padding: 10px 0; font-family: monospace; font-weight: 600;">${reservationId}</td></tr>
              <tr><td style="padding: 10px 0; color: #888;">お支払金額</td><td style="padding: 10px 0; font-weight: 700;">¥${amount.toLocaleString()}（税込・送料込）</td></tr>
            </table>
            <div style="background: #fafafa; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center;">
              <p style="font-size: 13px; color: #555; margin: 0 0 16px;">以下のボタンから決済を完了してください。<br />お客様の情報はそのまま引き継がれています。</p>
              <a href="${checkoutUrl}" style="display: inline-block; background: #111; color: #fff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px; letter-spacing: 0.05em;">決済を完了する</a>
            </div>
            <p style="font-size: 12px; color: #999; margin: 0 0 8px;">※ このリンクの有効期限は24時間です。期限切れの場合は再度お問い合わせください。</p>
            <p style="font-size: 13px; color: #555; margin: 0;">ご不明な点は <a href="mailto:${COMPANY.email}" style="color: #111;">${COMPANY.email}</a> までお問い合わせください。</p>
          </div>
          <p style="font-size: 11px; color: #bbb; text-align: center; margin-top: 20px;">${COMPANY.name}</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("[email] sendPaymentRecoveryEmail error:", err);
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
