import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const users = await prisma.user.findMany({
    where: { email: "otomo.palco.me@gmail.com" },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  const reservations = await prisma.reservation.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      paymentMethod: true,
      paymentStatus: true,
      reservationStatus: true,
      totalAmount: true,
      stripeSessionId: true,
      shippingName: true,
      createdAt: true,
    },
  });
  console.log("=== USERS ===");
  console.log(JSON.stringify(users, null, 2));
  console.log("=== RESERVATIONS ===");
  console.log(JSON.stringify(reservations, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
