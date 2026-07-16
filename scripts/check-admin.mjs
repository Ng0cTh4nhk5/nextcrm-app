import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const users = await pool.query(`SELECT id, email, "emailVerified", "userStatus", role, password FROM "Users" WHERE email='admin@domain.com'`);
  console.log('Users:', users.rows);
  
  if (users.rows.length > 0) {
    const userId = users.rows[0].id;
    try {
      const accounts = await pool.query(`SELECT id, "accountId", "providerId", password FROM "account" WHERE "userId" = $1`, [userId]);
      console.log('Accounts (account table):', accounts.rows);
    } catch (e) {
      console.log('No "account" table');
    }
  }
}

main().finally(() => pool.end());
