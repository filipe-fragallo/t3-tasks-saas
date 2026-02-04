"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, ListChecks, LogOut } from "lucide-react";

import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";
import type { Role } from "~/server/schemas/role";

type Props = {
  user: { id: string; name?: string | null; email?: string | null; role: Role };
};

function NavItem({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
        "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
        active
          ? "bg-gradient-to-r from-fuchsia-50 to-indigo-50 text-slate-900 ring-1 ring-indigo-100 dark:from-fuchsia-950/40 dark:to-indigo-950/40 dark:text-white dark:ring-slate-700"
          : "",
      ].join(" ")}
    >
      <Icon
        size={18}
        className={
          active
            ? "text-indigo-600 dark:text-indigo-300"
            : "text-slate-500 dark:text-slate-400"
        }
      />
      <span className={active ? "font-semibold" : "font-medium"}>{label}</span>
    </Link>
  );
}

export default function Sidebar({ user }: Props) {
  const router = useRouter();
  const isAdmin = user.role === "admin";

  async function logout() {
    await authClient.signOut();
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <aside className="w-72 shrink-0">
      <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold">
                {user.name ? `Olá, ${user.name}` : "Olá!"}
              </p>
              <p className="mt-1 break-all text-xs text-slate-500 dark:text-slate-400">
                {user.email ?? "-"}
              </p>
            </div>

            <span
              className={[
                "shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ring-1",
                isAdmin
                  ? "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900"
                  : "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-200 dark:ring-indigo-900",
              ].join(" ")}
            >
              {isAdmin ? "ADMIN" : "USER"}
            </span>
          </div>
        </div>

        <nav className="mt-4 space-y-2">
          <NavItem href="/dashboard" label="Home" icon={Home} />
          <NavItem href="/users" label="Usuários" icon={Users} />
          <NavItem href="/tasks" label="Tarefas" icon={ListChecks} />
        </nav>

        <div className="flex-1" />

        <Button
          onClick={logout}
          variant="outline"
          className="mt-4 w-full justify-start gap-2 rounded-xl border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
        >
          <LogOut size={18} />
          Logout
        </Button>
      </div>
    </aside>
  );
}
