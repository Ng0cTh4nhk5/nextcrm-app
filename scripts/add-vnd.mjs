import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";
import crypto from "crypto";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  console.log("Adding VND currency...");
  await pool.query(`
    INSERT INTO "Currency" (code, name, symbol, "isEnabled", "isDefault", "updatedAt")
    VALUES ('VND', 'Vietnamese Dong', '₫', true, false, NOW())
    ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, symbol = EXCLUDED.symbol, "updatedAt" = EXCLUDED."updatedAt"
  `);

  console.log("Adding exchange rates for VND...");
  const rates = [
    { from: 'EUR', to: 'VND', rate: 27500.0 },
    { from: 'USD', to: 'VND', rate: 25400.0 },
    { from: 'CZK', to: 'VND', rate: 1090.0 },
    { from: 'VND', to: 'EUR', rate: 0.000036 },
    { from: 'VND', to: 'USD', rate: 0.000039 },
    { from: 'VND', to: 'CZK', rate: 0.000917 },
  ];

  for (const r of rates) {
    const randomId = crypto.randomUUID();
    await pool.query(`
      INSERT INTO "ExchangeRate" (id, "fromCurrency", "toCurrency", rate, source, "updatedAt")
      VALUES ($4, $1, $2, $3, 'MANUAL', NOW())
      ON CONFLICT ("fromCurrency", "toCurrency") DO UPDATE SET rate = EXCLUDED.rate, source = EXCLUDED.source, "updatedAt" = EXCLUDED."updatedAt"
    `, [r.from, r.to, r.rate, randomId]);
  }

  console.log("VND added successfully!");
}

main().finally(() => pool.end());
