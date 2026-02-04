"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { api } from "~/trpc/react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

import {
  userCreateInput,
  userUpdateInput,
  userDeleteInput,
} from "~/server/schemas/user";

type Mode = "create" | "edit";

export default function UsersPage() {
  const utils = api.useUtils();

  const me = api.users.me.useQuery();
  const isAdmin = me.data?.role === "admin";
  const myId = me.data?.id ?? null;

  const users = api.users.list.useQuery(undefined, {
    enabled: me.isSuccess,
    retry: false,
  });

  const createMutation = api.users.create.useMutation({
    onSuccess: async () => {
      await utils.users.list.invalidate();
      closeModal();
    },
    onError: (err) => setError(err.message),
  });

  const updateMutation = api.users.update.useMutation({
    onSuccess: async () => {
      await utils.users.list.invalidate();
      closeModal();
    },
    onError: (err) => setError(err.message),
  });

  const deleteMutation = api.users.delete.useMutation({
    onSuccess: async () => {
      await utils.users.list.invalidate();
    },
    onError: (err) => setError(err.message),
  });

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  function openCreate() {
    setMode("create");
    setEditingId(null);
    setForm({ name: "", email: "", password: "" });
    setError(null);
    setShowPassword(false);
    setOpen(true);
  }

  function openEdit(u: { id: string; name: string | null; email: string | null }) {
    setMode("edit");
    setEditingId(u.id);
    setForm({ name: u.name ?? "", email: u.email ?? "", password: "" });
    setError(null);
    setShowPassword(false);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setMode("create");
    setEditingId(null);
    setForm({ name: "", email: "", password: "" });
    setError(null);
    setShowPassword(false);
  }

  const modalTitle = useMemo(
    () => (mode === "create" ? "Novo usuário" : "Editar usuário"),
    [mode],
  );

  async function submit() {
    setError(null);

    if (!isAdmin) {
      setError("Ação não permitida.");
      return;
    }

    if (mode === "create") {
      const parsed = userCreateInput.safeParse({
        name: form.name,
        email: form.email,
        password: form.password,
        role: "user",
      });

      if (!parsed.success) {
        const fe = parsed.error.flatten().fieldErrors;
        setError(
          fe.name?.[0] ??
            fe.email?.[0] ??
            fe.password?.[0] ??
            "Dados inválidos",
        );
        return;
      }

      await createMutation.mutateAsync(parsed.data);
      return;
    }

    if (!editingId) {
      setError("ID inválido para edição.");
      return;
    }

    const payload = {
      id: editingId,
      name: form.name,
      email: form.email,
      ...(form.password ? { password: form.password } : {}),
    };

    const parsed = userUpdateInput.safeParse(payload);

    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setError(
        fe.name?.[0] ??
          fe.email?.[0] ??
          fe.password?.[0] ??
          "Dados inválidos",
      );
      return;
    }

    await updateMutation.mutateAsync(parsed.data);
  }

  function deleteUser(id: string) {
    if (!isAdmin) return;

    const parsed = userDeleteInput.safeParse({ id });
    if (!parsed.success) return;

    deleteMutation.mutate(parsed.data);
  }

  if (me.isLoading) {
    return (
      <div className="space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-2 h-4 w-80" />
        </header>

        <Card className="rounded-2xl border border-slate-200 p-6 shadow-none dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-3">
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
        </Card>
      </div>
    );
  }

  if (me.isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
        Falha ao carregar sua sessão.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Usuários</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {isAdmin
                ? "Admin: você pode ver, criar, editar e excluir usuários."
                : "Visualização: você pode ver todos os usuários (somente leitura)."}
            </p>
          </div>

          {isAdmin && (
            <Button
              onClick={openCreate}
              className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white hover:opacity-95"
            >
              + Novo usuário
            </Button>
          )}
        </div>
      </header>

      <Card className="rounded-2xl border border-slate-200 p-6 shadow-none dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Todos os usuários</p>

          <span
            className={[
              "rounded-full px-2 py-1 text-xs font-semibold ring-1",
              isAdmin
                ? "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900"
                : "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-200 dark:ring-indigo-900",
            ].join(" ")}
          >
            {isAdmin ? "Admin" : "Somente leitura"}
          </span>
        </div>

        <div className="mt-4">
          {users.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-80" />
            </div>
          ) : users.isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
              {users.error.message}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  {isAdmin && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>

              <TableBody>
                {(users.data ?? []).map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name ?? "-"}</TableCell>
                    <TableCell>{u.email ?? "-"}</TableCell>
                    <TableCell>{u.role}</TableCell>

                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            className="rounded-xl"
                            onClick={() =>
                              openEdit({ id: u.id, name: u.name, email: u.email })
                            }
                          >
                            Editar
                          </Button>

                          <Button
                            variant="outline"
                            className="rounded-xl"
                            disabled={
                              deleteMutation.isPending ||
                              (myId ? u.id === myId : false)
                            }
                            onClick={() => deleteUser(u.id)}
                          >
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {isAdmin && (
        <Dialog
          open={open}
          onOpenChange={(v) => (v ? setOpen(true) : closeModal())}
        >
          <DialogContent
            className={[
              "sm:max-w-lg rounded-2xl",
              "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
            ].join(" ")}
          >
            <DialogHeader>
              <DialogTitle>{modalTitle}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, name: e.target.value }))
                  }
                  className="h-11 rounded-xl"
                  placeholder="Ex: João Silva"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={form.email}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, email: e.target.value }))
                  }
                  className="h-11 rounded-xl"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Senha{" "}
                  {mode === "edit" && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      (deixe vazio para não alterar)
                    </span>
                  )}
                </Label>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, password: e.target.value }))
                    }
                    className="h-11 rounded-xl pr-10"
                    placeholder="••••••••"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                  {error}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" className="rounded-xl" onClick={closeModal}>
                Cancelar
              </Button>

              <Button
                className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white hover:opacity-95"
                onClick={submit}
                disabled={isSaving}
              >
                {isSaving ? "Salvando..." : mode === "create" ? "Criar" : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
