"use client";

import { useState } from "react";

import { api } from "~/trpc/react";
import {
  taskCreateSchema,
  taskUpdateSchema,
  taskDeleteSchema,
  type TaskCreateInput,
} from "~/server/schemas/tasks";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

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

export default function TasksPage() {
  const utils = api.useUtils();

  const { data: tasks = [], isLoading } = api.tasks.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  type Task = (typeof tasks)[number];

  const createMutation = api.tasks.create.useMutation({
    onSuccess: async () => {
      setNewTask({ title: "", description: "" });
      await utils.tasks.list.invalidate();
    },
  });

  // ✅ mantém aqui só o toggleDone
  const updateQuickMutation = api.tasks.update.useMutation({
    onSuccess: async () => {
      await utils.tasks.list.invalidate();
    },
  });

  const deleteMutation = api.tasks.delete.useMutation({
    onSuccess: async () => {
      await utils.tasks.list.invalidate();
      setDeleteOpen(false);
    },
  });

  const [newTask, setNewTask] = useState<TaskCreateInput>({
    title: "",
    description: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<TaskLike | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function createTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const parsed = taskCreateSchema.safeParse({
      title: newTask.title,
      description: newTask.description?.trim() ? newTask.description : undefined,
    });

    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setFormError(fe.title?.[0] ?? fe.description?.[0] ?? "Dados inválidos");
      return;
    }

    await createMutation.mutateAsync(parsed.data);
  }

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
    updateQuickMutation.mutate(parsed.data);
  }

  function confirmDelete(id: number) {
    setDeletingId(id);
    setDeleteOpen(true);
  }

  async function doDelete() {
    if (!deletingId) return;

    const parsed = taskDeleteSchema.safeParse({ id: deletingId });
    if (!parsed.success) return;

    await deleteMutation.mutateAsync(parsed.data);
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Tarefas</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Crie, edite e acompanhe suas tarefas.
            </p>
          </div>

          <span className="rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-3 py-1 text-xs font-semibold text-white">
            Produtividade
          </span>
        </div>
      </header>

      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle>Criar tarefa</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={createTask}>
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={newTask.title}
                onChange={(e) =>
                  setNewTask((s) => ({ ...s, title: e.target.value }))
                }
                placeholder="Ex: Ligar para cliente"
                className="h-11 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-800"
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea
                value={newTask.description ?? ""}
                onChange={(e) =>
                  setNewTask((s) => ({ ...s, description: e.target.value }))
                }
                placeholder="Detalhes..."
                className="min-h-[100px] rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-800"
              />
            </div>

            {formError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                {formError}
              </div>
            )}

            <Button
              disabled={createMutation.isPending}
              type="submit"
              className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white hover:opacity-95"
            >
              {createMutation.isPending ? "Salvando..." : "Criar"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle>Minhas tasks</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {isLoading && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Carregando...
            </p>
          )}

          {!isLoading && tasks.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Nenhuma tarefa ainda.
            </p>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      className={[
                        "font-semibold",
                        t.done
                          ? "line-through text-slate-400 dark:text-slate-500"
                          : "",
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
                    disabled={updateQuickMutation.isPending}
                  >
                    {t.done ? "Desfazer" : "Concluir"}
                  </Button>

                  <Button
                    variant="outline"
                    className="h-9 rounded-xl border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
                    onClick={() => openEdit(t)}
                  >
                    Editar
                  </Button>

                  <Button
                    className="h-9 rounded-xl bg-red-600 text-white hover:bg-red-700"
                    onClick={() => confirmDelete(t.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ✅ modal reutilizável */}
      <TaskEditDialog open={editOpen} onOpenChange={setEditOpen} task={editing} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tarefa?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={doDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
