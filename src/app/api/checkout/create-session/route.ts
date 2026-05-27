import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generatePassword } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { PRODUCT } from "@/lib/constants";
import { sendBankTransferInstructions } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { shippingName, shippingZip, shippingAddress, shippingPhone, paymentMethod, email } =
      await req.json();

    if (!shippingName || !shippingZip || !shippingAddress || !shippingPhone || !email || !paymentMethod) {
      return NextResponse.json({ error: "必須項目を入力してください" }, { status: 400 });
    }

    if (!["CARD", "BANK_TRANSFER"].includes(paymentMethod)) {
      return NextResponse.json({ error: "支払方法が無効です" }, { status: 400 });
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    let plainPassword: string | null = null;
    let isNewUser = false;

    if (!user) {
      plainPassword = generatePassword();
      const hashed = await hashPassword(plainPassword);
      user = await prisma.user.create({
        data: {
          email,
          password: hashed,
          name: shippingName,
          phone: shippingPhone,
        },
      });
      isNewUser = true;
    }

    // Find the product
    let product = await prisma.product.findFirst({
      where: { name: PRODUCT.name, acceptingOrders: true },
    });

    if (!product) {
      // Create product if it doesn't exist
      product = await prisma.product.create({
        data: {
          id: PRODUCT.id,
          name: PRODUCT.name,
          description: PRODUCT.description,
          price: PRODUCT.price,
          originalPrice: PRODUCT.originalPrice,
          acceptingOrders: true,
        },
      });
    }

    if (paymentMethod === "BANK_TRANSFER") {
      const reservation = await prisma.reservation.create({
        data: {
          userId: user.id,
          productId: product.id,
          totalAmount: PRODUCT.price,
          paymentMethod: "BANK_TRANSFER",
          paymentStatus: "PENDING",
          reservationStatus: "WAITING",
          shippingName,
          shippingZip,
          shippingAddress,
          shippingPhone,
        },
      });

      // Send bank transfer instructions
      await sendBankTransferInstructions(email, shippingName, reservation.id, PRODUCT.price);

      return NextResponse.json({ reservationId: reservation.id, bankTransfer: true });
    }

    // CARD payment - create Stripe session
    const reservation = await prisma.reservation.create({
      data: {
        userId: user.id,
        productId: product.id,
        totalAmount: PRODUCT.price,
        paymentMethod: "CARD",
        paymentStatus: "PENDING",
        reservationStatus: "WAITING",
        shippingName,
        shippingZip,
        shippingAddress,
        shippingPhone,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "jpy",
            product_data: {
              name: "ULAS O3 finger",
              description: "水からオゾン水を生成するコンパクトタイプのオゾン水生成器",
            },
            unit_amount: PRODUCT.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        reservationId: reservation.id,
        userId: user.id,
        isNewUser: isNewUser ? "true" : "false",
        plainPassword: plainPassword || "",
      },
      success_url: `${baseUrl}/thanks?reservationId=${reservation.id}`,
      cancel_url: `${baseUrl}/?cancelled=true`,
    });

    await prisma.reservation.update({
      where: { id: reservation.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ sessionId: session.id, checkoutUrl: session.url });
  } catch (err) {
    console.error("[checkout/create-session]", err);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
