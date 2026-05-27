import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PRODUCT } from "@/lib/constants";

export async function GET() {
  try {
    const existing = await prisma.product.findFirst({ where: { name: PRODUCT.name } });
    if (existing) {
      return NextResponse.json({ message: "Product already exists", product: existing });
    }

    const product = await prisma.product.create({
      data: {
        id: PRODUCT.id,
        name: PRODUCT.name,
        description: PRODUCT.description,
        price: PRODUCT.price,
        originalPrice: PRODUCT.originalPrice,
        acceptingOrders: true,
        stock: 0,
      },
    });

    return NextResponse.json({ message: "Product created", product });
  } catch (err) {
    console.error("[seed]", err);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
