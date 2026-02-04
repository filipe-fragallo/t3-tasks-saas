import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { user } from "~/server/db/schema";

async function main() {
  const email = "admin@admin.com";

  await db.update(user).set({ role: "admin" }).where(eq(user.email, email));

  console.log("✅ admin setado:", email);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
