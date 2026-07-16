import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const BETTER_AUTH_URL = "http://localhost:3000";
const ADMIN_EMAIL = "admin@domain.com";
const NEW_PASSWORD = "Admin@2024!";

async function main() {
  console.log("1. Wiping old admin accounts from DB...");
  await pool.query(`DELETE FROM "account" WHERE "userId" IN (SELECT id FROM "Users" WHERE email=$1) OR "accountId"=$1`, [ADMIN_EMAIL]).catch(e => console.log(e.message));
  await pool.query(`DELETE FROM "Users" WHERE email=$1`, [ADMIN_EMAIL]).catch(e => console.log(e.message));

  console.log("2. Registering via Better Auth API...");
  const res = await fetch(`${BETTER_AUTH_URL}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": BETTER_AUTH_URL },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: NEW_PASSWORD, name: "Admin" }),
  });
  const data = await res.json();
  console.log("Sign-up response:", res.status, data);

  if (res.status === 200 || res.status === 201) {
    console.log("3. Activating admin in DB...");
    await pool.query(`UPDATE "Users" SET "emailVerified" = true, "role" = 'admin', "userStatus" = 'ACTIVE' WHERE email=$1`, [ADMIN_EMAIL]);
    console.log("All done! Seed account re-created successfully.");
  } else {
    console.log("Failed to register via API.");
  }
}

main().finally(() => pool.end());
