import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  const { auth } = await import("../lib/auth");
  console.log("auth.api methods:", Object.keys(auth.api));
}

main();
