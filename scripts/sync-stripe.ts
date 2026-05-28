import Stripe from "stripe";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any) as any;

async function main() {
  // 全セッション取得
  let allSessions: Stripe.Checkout.Session[] = [];
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const res = await stripe.checkout.sessions.list({
      limit: 100,
      expand: ["data.customer_details"],
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    allSessions = [...allSessions, ...res.data];
    hasMore = res.has_more;
    if (res.data.length > 0) startingAfter = res.data[res.data.length - 1].id;
  }

  console.log(`Total Stripe sessions: ${allSessions.length}`);

  // 既存のstripeSessionIdをまとめて取得
  const existingIds = await prisma.reservation.findMany({
    select: { stripeSessionId: true },
  });
  const existingSet = new Set(existingIds.map((r: any) => r.stripeSessionId));
  console.log(`Already in DB: ${existingSet.size}`);

  const product = await prisma.product.findFirst();
  if (!product) { console.log("No product found!"); return; }

  let created = 0, skipped = 0;

  for (const session of allSessions) {
    if (existingSet.has(session.id)) { skipped++; continue; }

    const email = session.customer_details?.email;
    const name = session.customer_details?.name || "（氏名不明）";
    const phone = session.customer_details?.phone || null;
    const addr = session.customer_details?.address;
    const zip = addr?.postal_code?.replace("-", "") || "";
    const address = [addr?.state, addr?.city, addr?.line1, addr?.line2].filter(Boolean).join(" ");

    if (!email) { console.log(`SKIP no email: ${session.id}`); skipped++; continue; }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const hash = await bcrypt.hash(Math.random().toString(36).slice(-10), 10);
      user = await prisma.user.create({
        data: { email, name, phone, password: hash },
      });
    }

    const paymentStatus = session.payment_status === "paid" ? "PAID" : "PENDING";
    const reservationStatus = session.payment_status === "paid" ? "CONFIRMED" : "WAITING";

    await prisma.reservation.create({
      data: {
        userId: user.id,
        productId: product.id,
        quantity: 1,
        totalAmount: session.amount_total || 18700,
        paymentMethod: "CARD",
        paymentStatus,
        reservationStatus,
        stripeSessionId: session.id,
        shippingName: name,
        shippingZip: zip,
        shippingAddress: address,
        shippingPhone: phone || "",
      },
    });

    console.log(`✓ ${paymentStatus} | ${name} <${email}>`);
    created++;
  }

  const total = await prisma.reservation.count();
  console.log(`\nDone: ${created} created, ${skipped} skipped`);
  console.log(`DB total reservations: ${total}`);
  await prisma.$disconnect();
}

main().catch(console.error);
