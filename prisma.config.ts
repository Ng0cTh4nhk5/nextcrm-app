import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  datasource: {
    url: env("DATABASE_URL"),
    // directUrl dùng cho `prisma migrate` (không qua pgbouncer)
    directUrl: env("DIRECT_URL"),
  },
  migrations: {
    seed: "npx tsx prisma/seeds/seed.ts",
  },
});
