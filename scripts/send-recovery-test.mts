import Stripe from "stripe";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-04-22.dahlia" });
const resend = new Resend(process.env.RESEND_API_KEY!);

const reservationId = "cmq0bqw1i000004jvswpzxbq8";
const stripeSessionId = "cs_live_a1rVNa7kkDAcaQXkICEZRdnBcYRyK8ogHkQAl6ZeDsG72rBVvwkGcnqkBP";
const email = "otomo.palco.me@gmail.com";
const name = "テスト大友";
const amount = 18700;

async function run() {
  let checkoutUrl: string;
  try {
    const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
    if (session.status === "open" && session.url) {
      checkoutUrl = session.url;
      console.log("既存セッション有効");
    } else {
      throw new Error("not open: " + session.status);
    }
  } catch (e) {
    console.log("新規セッション作成:", String(e).substring(0, 60));
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [{ price_data: { currency: "jpy", product_data: { name: "ULAS O3 finger" }, unit_amount: 18700 }, quantity: 1 }],
      metadata: { reservationId, isNewUser: "false", plainPassword: "" },
      success_url: `https://store.ulas.jp/thanks?reservationId=${reservationId}`,
      cancel_url: "https://store.ulas.jp/?cancelled=true",
    });
    checkoutUrl = session.url!;
  }

  const result = await resend.emails.send({
    from: "ULAS <support@ulas.jp>",
    to: email,
    subject: "決済手続き完了のお願い",
    html: `
      <div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;color:#111;">
        <div style="padding:40px 32px;background:#fff;border:1px solid #e5e5e5;border-radius:12px;">
          <p style="font-size:13px;font-weight:600;letter-spacing:0.1em;color:#666;margin:0 0 24px;">ULAS</p>
          <h1 style="font-size:20px;font-weight:700;margin:0 0 20px;">決済手続き完了のお願い</h1>
          <p style="font-size:14px;color:#555;margin:0 0 20px;">${name} 様</p>
          <p style="font-size:14px;color:#333;line-height:1.8;margin:0 0 20px;">
            このたびは、ULAS O3 finger をご予約いただき、誠にありがとうございます。
          </p>
          <p style="font-size:14px;color:#333;line-height:1.8;margin:0 0 24px;">
            ご予約情報を確認させていただきましたところ、現在、決済情報のご入力が完了していない状態でございます。<br />
            お客様のご予約商品の枠は確保しておりますので、下記内容をご確認のうえ、決済手続きをお願いいたします。
          </p>
          <div style="border-top:1px solid #ccc;border-bottom:1px solid #ccc;padding:20px 0;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:8px 0;color:#888;width:40%;">予約番号</td><td style="padding:8px 0;font-family:monospace;font-weight:600;">${reservationId}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">お支払金額</td><td style="padding:8px 0;font-weight:700;">¥${amount.toLocaleString()}（税込・送料込）</td></tr>
            </table>
          </div>
          <div style="text-align:center;margin-bottom:24px;">
            <p style="font-size:14px;color:#333;line-height:1.8;margin:0 0 16px;">
              以下のボタンより、決済手続きを完了してください。<br />
              ご予約時にご入力いただいたお客様情報は、そのまま引き継がれます。
            </p>
            <a href="${checkoutUrl}" style="display:inline-block;background:#111;color:#fff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:8px;">決済を完了する</a>
          </div>
          <p style="font-size:12px;color:#999;margin:0 0 16px;">※ このリンクの有効期限は24時間です。</p>
          <p style="font-size:14px;color:#555;margin:0;">ご不明な点がございましたら、<a href="mailto:support@ulas.jp" style="color:#111;">support@ulas.jp</a> までお問い合わせください。</p>
        </div>
        <p style="font-size:11px;color:#bbb;text-align:center;margin-top:20px;">株式会社ULAS</p>
      </div>
    `,
  });

  console.log("送信結果:", JSON.stringify(result.data));
}

run().catch(console.error);
