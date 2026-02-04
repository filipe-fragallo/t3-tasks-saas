import { redirect } from "next/navigation";

import { getSession } from "~/server/better-auth/server";
import TasksPreview from "../../../components/dashboard/tasks-preview";
import { sessionUserSchema } from "~/server/schemas/user";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user) redirect("/sign-in");

  const user = sessionUserSchema.parse(session.user);

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-slate-500 dark:text-slate-400">Seja bem-vindo,</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {user.name ?? "Usuário"}
          </h1>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Info label="Email" value={user.email ?? "-"} />
          <Info label="Name" value={user.name ?? "-"} />
          <Info label="Status" value="Autenticado" />
        </div>
      </header>

      <TasksPreview />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 break-all text-sm">{value}</p>
    </div>
  );
}
