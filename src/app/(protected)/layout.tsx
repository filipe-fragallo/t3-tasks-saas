import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import Sidebar from "../../components/sidebar/sidebar";
import { getSession } from "~/server/better-auth/server";
import { db } from "~/server/db";
import { user as userTable } from "~/server/db/schema";

import { roleSchema, type Role } from "~/server/schemas/role";

import "~/styles/globals.css";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user) redirect("/sign-in");

  const [u] = await db
    .select({ role: userTable.role })
    .from(userTable)
    .where(eq(userTable.id, session.user.id))
    .limit(1);

  const role: Role = roleSchema.catch("user").parse(u?.role);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-6 py-8">
        <Sidebar
          user={{
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            role,
          }}
        />
        <main className="flex-1">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
