"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { api } from "~/trpc/react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import {
  adminUserSchema,
  tasksByUserInputSchema,
} from "~/server/schemas/admin";
import {
  adminTaskSchema,
} from "~/server/schemas/tasks";


export default function AdminPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: usersRaw = [], isLoading } = api.admin.usersList.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const { data: userTasksRaw = [], isLoading: tasksLoading } = api.admin.tasksByUser.useQuery(
    { userId: selectedUserId ?? "" },
    { enabled: !!selectedUserId, refetchOnWindowFocus: false },
  );

  const users = useMemo(() => z.array(adminUserSchema).safeParse(usersRaw).data ?? [], [usersRaw]);
  const userTasks = useMemo(
    () => z.array(adminTaskSchema).safeParse(userTasksRaw).data ?? [],
    [userTasksRaw],
  );

  const selectedUserIdSafe = useMemo(() => {
    const parsed = tasksByUserInputSchema.safeParse({ userId: selectedUserId ?? "" });
    return parsed.success ? parsed.data.userId : null;
  }, [selectedUserId]);

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Visualizar usuários e tarefas.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl border border-slate-200 p-6 shadow-none dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Usuários</p>
          </div>

          <div className="mt-4">
            {isLoading ? (
              <p className="text-sm text-slate-500">Carregando...</p>
            ) : (
              <Table>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="text-sm">
                        <div className="font-semibold">{u.name ?? "-"}</div>
                        <div className="text-xs text-slate-500">{u.email ?? "-"}</div>
                      </TableCell>

                      <TableCell className="text-xs">{u.role}</TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => setSelectedUserId(u.id)}
                        >
                          Ver tasks
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>

        <Card className="rounded-2xl border border-slate-200 p-6 shadow-none dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Tasks do usuário</p>
            {selectedUserIdSafe && (
              <span className="text-xs text-slate-500">id: {selectedUserIdSafe}</span>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {!selectedUserIdSafe && (
              <p className="text-sm text-slate-500">
                Selecione um usuário para ver as tasks.
              </p>
            )}

            {tasksLoading && <p className="text-sm text-slate-500">Carregando...</p>}

            {selectedUserIdSafe && !tasksLoading && userTasks.length === 0 && (
              <p className="text-sm text-slate-500">Nenhuma task.</p>
            )}

            {userTasks.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
              >
                <p className="font-semibold">{t.title}</p>
                {t.description && <p className="text-sm text-slate-500">{t.description}</p>}
                <p className="mt-2 text-xs text-slate-500">
                  {t.done ? "Concluída" : "Pendente"}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
