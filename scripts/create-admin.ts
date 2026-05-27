import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const hash = await bcrypt.hash("UlasAdmin2026!", 10);
  const user = await (prisma as any).user.upsert({
    where: { email: "admin@ulas.jp" },
    update: { password: hash, isAdmin: true },
    create: { email: "admin@ulas.jp", name: "ULAS管理者", password: hash, isAdmin: true },
  });
  console.log("Admin created:", user.email, "/ isAdmin:", user.isAdmin);
  await (prisma as any).$disconnect();
}
main().catch(console.error);
