import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  datasource: {
    url: env("DATABASE_URL"),
    // directUrl dùng khi triển khai với Supabase pgBouncer (pooler):
    // - DATABASE_URL: kết nối pooled qua pgBouncer (runtime queries)
    // - DIRECT_URL: kết nối trực tiếp (prisma migrate deploy)
    // Nếu DIRECT_URL không set, sẽ dùng DATABASE_URL làm fallback
    ...(process.env.DIRECT_URL ? { directUrl: env("DIRECT_URL") } : {}),
  },
  migrations: {
    seed: "npx tsx prisma/seeds/seed.ts",
  },
});
