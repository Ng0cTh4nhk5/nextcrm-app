import { PrismaClient } from "@prisma/client";
import { seedCurrencies } from "./prisma/seeds/currencies.js"; // Needs to be compiled or run with tsx

const prisma = new PrismaClient();

async function main() {
  await seedCurrencies(prisma);
  console.log("Finished seeding currencies.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
