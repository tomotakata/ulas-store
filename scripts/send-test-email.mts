import Stripe from "stripe";
import { Resend } from "resend";

const stripeKey = process.env.STRIPE_SECRET_KEY!;
const resendKey = process.env.RESEND_API_KEY!;

const stripe = new Stripe(stripeKey, { apiVersion: "2026-04-22.dahlia" });
const resend = new Resend(resendKey);

const reservationId = "cmq0bqw1i000004jvswpzxbq8";
const stripeSessionId = "cs_live_a1rVNa7kkDAcaQXkICEZRdnBcYRyK8ogHkQAl6ZeDsG72rBVvwkGcnqkBP";
const email = "otomo.palco.me@gmail.com";
const name = "テスト大友";
const amount = 18700;

// 既存セッションの確認
let checkoutUrl: string;
try {
  const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
  if (session.status === "open" && session.url) {
    checkoutUrl = session.url;
    console.log("既存セッション有効:", checkoutUrl.substring(0, 60) + "...");
  } else {
    throw new Error("Session not open: " + session.status);
  }
} catch (e) {
  console.log("既存セッション無効、新規作成...", String(e).substring(0, 80));
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: email,
    line_items: [{
      price_data: {
        currency: "jpy",
        product_data: { name: "ULAS O3 finger" },
        unit_amount: 18700,
      },
      quantity: 1,
    }],
    metadata: { reservationId, isNewUser: "false", plainPassword: "" },
    success_url: `https://store.ulas.jp/thanks?reservationId=${reservationId}`,
    cancel_url: `https://store.ulas.jp/?cancelled=true`,
  });
  checkoutUrl = session.url!;
  console.log("新規セッション作成:", checkoutUrl.substring(0, 60) + "...");
}

// メール送信
const result = await resend.emails.send({
  from: "ULAS <support@ulas.jp>",
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
          <a href="${checkoutUrl}" style="display: inline-block; background: #111; color: #fff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px;">決済を完了する</a>
        </div>
        <p style="font-size: 12px; color: #999; margin: 0 0 8px;">※ このリンクの有効期限は24時間です。</p>
        <p style="font-size: 13px; color: #555; margin: 0;">ご不明な点は <a href="mailto:support@ulas.jp" style="color: #111;">support@ulas.jp</a> までお問い合わせください。</p>
      </div>
      <p style="font-size: 11px; color: #bbb; text-align: center; margin-top: 20px;">株式会社ULAS</p>
    </div>
  `,
});

console.log("送信結果:", JSON.stringify(result, null, 2));
