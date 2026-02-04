"use client";

import { useState } from "react";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import {
  taskUpdateSchema,
  taskDeleteSchema,
} from "~/server/schemas/tasks";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

import { TaskEditDialog, type TaskLike } from "~/components/tasks/task-edit-dialog";

export default function TasksPreview() {
  const utils = api.useUtils();

  const { data: tasks = [], isLoading } = api.tasks.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  type Task = (typeof tasks)[number];

  const updateMutation = api.tasks.update.useMutation({
    onSuccess: async () => {
      await utils.tasks.list.invalidate();
    },
  });

  const deleteMutation = api.tasks.delete.useMutation({
    onSuccess: async () => {
      await utils.tasks.list.invalidate();
      setDeleteOpen(false);
      setDeleting(null);
    },
  });

  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const pending = total - done;

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<TaskLike | null>(null);

  function openEdit(t: Task) {
    setEditing({
      id: t.id,
      title: t.title,
      description: t.description ?? null,
      done: t.done,
    });
    setEditOpen(true);
  }

  function toggleDone(t: Task) {
    const parsed = taskUpdateSchema.safeParse({ id: t.id, done: !t.done });
    if (!parsed.success) return;
    updateMutation.mutate(parsed.data);
  }

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Task | null>(null);

  function confirmDelete(t: Task) {
    setDeleting(t);
    setDeleteOpen(true);
  }

  async function doDelete() {
    if (!deleting) return;
    const parsed = taskDeleteSchema.safeParse({ id: deleting.id });
    if (!parsed.success) return;
    await deleteMutation.mutateAsync(parsed.data);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Stat
          title="Total de tarefas"
          value={String(total)}
          accent="from-fuchsia-500 to-indigo-500"
        />
        <Stat
          title="Concluídas"
          value={String(done)}
          accent="from-emerald-500 to-teal-500"
        />
        <Stat
          title="Pendentes"
          value={String(pending)}
          accent="from-cyan-500 to-indigo-500"
        />
      </div>

      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-50">
            Minhas tasks
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {isLoading && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Carregando...
            </p>
          )}

          {!isLoading && tasks.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Você ainda não criou nenhuma tarefa.
            </p>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      className={[
                        "font-semibold",
                        t.done ? "line-through text-slate-400 dark:text-slate-500" : "",
                      ].join(" ")}
                    >
                      {t.title}
                    </p>

                    {t.description && (
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {t.description}
                      </p>
                    )}
                  </div>

                  <span
                    className={[
                      "shrink-0 rounded-full px-2 py-1 text-xs font-semibold ring-1",
                      t.done
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900"
                        : "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-200 dark:ring-indigo-900",
                    ].join(" ")}
                  >
                    {t.done ? "Concluída" : "Pendente"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="h-9 rounded-xl border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
                    onClick={() => toggleDone(t)}
                    disabled={updateMutation.isPending}
                  >
                    {t.done ? "Desfazer" : "Concluir"}
                  </Button>

                  {/* ✅ agora edita na home com modal */}
                  <Button
                    variant="outline"
                    className="h-9 rounded-xl border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
                    onClick={() => openEdit(t)}
                  >
                    Editar
                  </Button>

                  <Button
                    className="h-9 rounded-xl bg-red-600 text-white hover:bg-red-700"
                    onClick={() => confirmDelete(t)}
                    disabled={deleteMutation.isPending}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ✅ mesmo dialog do /tasks */}
      <TaskEditDialog open={editOpen} onOpenChange={setEditOpen} task={editing} />

      {/* ✅ confirmação de delete */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent
          className={[
            "rounded-2xl",
            "border border-slate-200 bg-white shadow-xl",
            "dark:border-slate-800 dark:bg-slate-900",
          ].join(" ")}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tarefa?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita.
              {deleting?.title ? (
                <>
                  <br />
                  <span className="mt-2 inline-block font-medium text-slate-700 dark:text-slate-200">
                    {deleting.title}
                  </span>
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={doDelete}
              disabled={deleteMutation.isPending}
              className="rounded-xl bg-red-600 text-white hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Stat({
  title,
  value,
  accent,
}: {
  title: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{title}</p>
        <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${accent}`} />
      </div>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
