import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendReservationConfirmation } from "@/lib/email";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const reservationId = session.metadata?.reservationId;
    const isNewUser = session.metadata?.isNewUser === "true";
    const plainPassword = session.metadata?.plainPassword || "";

    if (!reservationId) {
      console.error("[webhook] No reservationId in metadata");
      return NextResponse.json({ error: "No reservationId" }, { status: 400 });
    }

    const reservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        paymentStatus: "PAID",
        reservationStatus: "CONFIRMED",
        stripePaymentIntentId: session.payment_intent as string,
      },
      include: { user: true },
    });

    const passwordToSend = isNewUser ? plainPassword : "(既存アカウント)";

    await sendReservationConfirmation(
      reservation.user.email,
      reservation.shippingName,
      passwordToSend,
      reservation.id,
      "CARD",
      reservation.totalAmount
    );
  }

  return NextResponse.json({ received: true });
}
