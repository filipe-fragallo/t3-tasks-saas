import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { user } from "~/server/db/schema";
import { auth } from "~/server/better-auth";

async function main() {
  const email = "admin@admin.com";
  const password = "12345678++";

  const [existing] = await db.select().from(user).where(eq(user.email, email));

  if (!existing) {
    console.log("Criando usuário admin...");

    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: "Admin",
      },
    });
  }

  await db.update(user).set({ role: "admin" }).where(eq(user.email, email));

  console.log("✅ Admin pronto:", email);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
