import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  console.log("Updating admin user...");
  // Attempt with lowercase "user" table (Better-Auth default)
  try {
    await pool.query(`UPDATE "user" SET "emailVerified" = true, "role" = 'admin', "userStatus" = 'ACTIVE' WHERE "email" = 'admin@domain.com'`);
    console.log("Updated in 'user' table.");
  } catch (e) {
    console.log("No 'user' table, trying 'users'...");
  }
  
  // Attempt with "Users" table (NextCRM custom mapping)
  try {
    await pool.query(`UPDATE "Users" SET "emailVerified" = true, "role" = 'admin', "userStatus" = 'ACTIVE' WHERE "email" = 'admin@domain.com'`);
    console.log("Updated in 'Users' table.");
  } catch (e) {
    console.log("Error updating 'Users':", e.message);
  }
  
  // Attempt with "users" table
  try {
    await pool.query(`UPDATE "users" SET "emailVerified" = true, "role" = 'admin', "userStatus" = 'ACTIVE' WHERE "email" = 'admin@domain.com'`);
    console.log("Updated in 'users' table.");
  } catch (e) {
    // Ignore
  }

  console.log("Update process finished.");
}

main().finally(() => pool.end());
