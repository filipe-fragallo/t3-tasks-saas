"use client";

import { useEffect, useMemo, useState } from "react";

import { api } from "~/trpc/react";
import { taskUpdateSchema, type TaskUpdateInput } from "~/server/schemas/tasks";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export type TaskLike = {
  id: number;
  title: string;
  description: string | null;
  done: boolean;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  task: TaskLike | null;
};

export function TaskEditDialog({ open, onOpenChange, task }: Props) {
  const utils = api.useUtils();

  const updateMutation = api.tasks.update.useMutation({
    onSuccess: async () => {
      await utils.tasks.list.invalidate();
      onOpenChange(false);
    },
  });

  const [form, setForm] = useState({ title: "", description: "" });
  const [error, setError] = useState<string | null>(null);

  const canSave = useMemo(
    () => !!task && form.title.trim().length > 0,
    [task, form.title],
  );

  useEffect(() => {
    if (!open || !task) return;
    setForm({
      title: task.title ?? "",
      description: task.description ?? "",
    });
    setError(null);
  }, [open, task]);

  async function save() {
    if (!task) return;

    setError(null);

    const payload: TaskUpdateInput = {
      id: task.id,
      title: form.title,
      description: form.description.trim() ? form.description : null,
      done: task.done,
    };

    const parsed = taskUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setError(fe.title?.[0] ?? fe.description?.[0] ?? "Dados inválidos");
      return;
    }

    await updateMutation.mutateAsync(parsed.data);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setError(null);
        onOpenChange(v);
      }}
    >
      <DialogContent
        className={[
          "sm:max-w-lg rounded-2xl",
          "border border-slate-200 bg-white p-6 shadow-xl",
          "dark:border-slate-800 dark:bg-slate-900",
        ].join(" ")}
      >
        <DialogHeader>
          <DialogTitle>Editar tarefa</DialogTitle>
        </DialogHeader>

        {!task ? (
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Nenhuma tarefa selecionada.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((s) => ({ ...s, description: e.target.value }))
                }
                className="rounded-xl"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                {error}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            Cancelar
          </Button>

          <Button
            disabled={!canSave || updateMutation.isPending}
            onClick={save}
            className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white hover:opacity-95"
          >
            {updateMutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
