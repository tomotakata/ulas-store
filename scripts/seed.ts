import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeon({ connectionString });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const product = await prisma.product.upsert({
    where: { id: "ulas-o3-finger" },
    update: { acceptingOrders: true },
    create: {
      id: "ulas-o3-finger",
      name: "ULAS O3 finger",
      description: "水からオゾン水を生成し、そのままスプレーできるコンパクトタイプのオゾン水生成器。",
      price: 18700,
      originalPrice: 19800,
      acceptingOrders: true,
      stock: 0,
    },
  });
  console.log("Seeded:", JSON.stringify(product, null, 2));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
