"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ChangeEvent } from "react";

import { Eye, EyeOff } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import { authClient } from "~/lib/auth-client";
import {
  authClientResponseSchema,
  signInSchema,
  type SignInForm,
} from "~/server/schemas/auth";

export default function SignInPage() {
  const router = useRouter();

  const [form, setForm] = useState<SignInForm>({
    email: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const parsed = signInSchema.safeParse(form);
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setError(fe.email?.[0] ?? fe.password?.[0] ?? "Dados inválidos");
      return;
    }

    setLoading(true);

    const res = await authClient.signIn.email({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    setLoading(false);

    const parsedRes = authClientResponseSchema.safeParse(res);
    if (parsedRes.success && parsedRes.data.error?.message) {
      setError(parsedRes.data.error.message);
      return;
    }

    router.push("/dashboard");
  }

  function onEmailChange(e: ChangeEvent<HTMLInputElement>) {
    setForm((s) => ({ ...s, email: e.target.value }));
  }

  function onPasswordChange(e: ChangeEvent<HTMLInputElement>) {
    setForm((s) => ({ ...s, password: e.target.value }));
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-fuchsia-600 via-indigo-600 to-cyan-500">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-black/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10">
        <div className="w-full overflow-hidden rounded-3xl bg-white/10 shadow-2xl ring-1 ring-white/20 backdrop-blur">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative overflow-hidden p-10 text-white">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/0" />
              <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-black/20 blur-3xl" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-white/20">
                  <span className="h-2 w-2 rounded-full bg-white" />
                  Melhor app de tarefas
                </div>

                <h1 className="mt-6 text-4xl font-semibold leading-tight">
                  Seu dia,
                  <span className="block">em ordem.</span>
                </h1>

                <p className="mt-4 max-w-md text-sm/6 text-white/90">
                  Crie tarefas, priorize e execute. Tudo organizado do jeito
                  certo.
                </p>

                <div className="mt-8 grid max-w-md gap-3">
                  <Feature
                    title="Rápido"
                    desc="Sem menus infinitos. Você abre e já faz."
                  />
                  <Feature
                    title="Clareza"
                    desc="Prioridades e status visíveis, sem bagunça."
                  />
                  <Feature
                    title="Progresso"
                    desc="Acompanhe o que está em andamento e o que foi concluído."
                  />
                </div>

                <div className="mt-8 rounded-2xl bg-white/10 p-5 ring-1 ring-white/15">
                  <div className="text-xs font-semibold tracking-wide text-white/80">
                    DICA RÁPIDA
                  </div>
                  <div className="mt-1 text-sm text-white/90">
                    Use etiquetas para separar “Trabalho”, “Casa” e “Estudos”.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-10">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pb-6">
                  <CardTitle className="bg-gradient-to-r from-fuchsia-600 to-indigo-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                    Entrar
                  </CardTitle>
                  <p className="text-sm text-slate-500">
                    Acesse sua conta para continuar.
                  </p>
                </CardHeader>

                <CardContent className="px-0">
                  <form className="space-y-4" onSubmit={onSubmit}>
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-xs font-normal text-slate-500"
                      >
                        Email
                      </Label>
                      <Input
                        id="email"
                        value={form.email}
                        onChange={onEmailChange}
                        placeholder="seu@email.com"
                        autoComplete="email"
                        inputMode="email"
                        className="h-11 rounded-xl border-slate-200 text-xs font-normal text-slate-500 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="password"
                        className="text-xs font-normal text-slate-500"
                      >
                        Senha
                      </Label>

                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={form.password}
                          onChange={onPasswordChange}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          className="h-11 rounded-xl border-slate-200 text-xs font-normal text-slate-500 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500"
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-indigo-600"
                          aria-label={
                            showPassword ? "Ocultar senha" : "Mostrar senha"
                          }
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="text-xs text-slate-500 hover:text-indigo-600 hover:underline"
                          onClick={() => router.push("/forgot-password")}
                        >
                          Esqueci minha senha
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                      </div>
                    )}

                    <Button
                      className="h-11 w-full rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white hover:opacity-95"
                      disabled={loading}
                      type="submit"
                    >
                      {loading ? "Entrando..." : "Entrar"}
                    </Button>

                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-3 text-xs text-slate-400">
                          ou
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/sign-up")}
                      className="h-11 w-full rounded-xl border border-indigo-200 bg-white hover:bg-gray-50"
                    >
                      <span className="bg-gradient-to-r from-fuchsia-600 to-indigo-600 bg-clip-text font-semibold text-transparent">
                        Criar conta
                      </span>
                    </Button>

                    <p className="pt-2 text-center text-xs text-slate-400">
                      Ao continuar, você concorda com nossos{" "}
                      <button
                        type="button"
                        className="text-indigo-600 hover:underline"
                        onClick={() => router.push("/terms")}
                      >
                        Termos
                      </button>{" "}
                      e{" "}
                      <button
                        type="button"
                        className="text-indigo-600 hover:underline"
                        onClick={() => router.push("/privacy")}
                      >
                        Privacidade
                      </button>
                      .
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
      <div className="flex items-start gap-3">
        <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-white" />
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-white/85">{desc}</div>
        </div>
      </div>
    </div>
  );
}
