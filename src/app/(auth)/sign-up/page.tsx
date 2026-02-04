"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Eye, EyeOff } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import { authClient } from "~/lib/auth-client";
import {
  authClientResponseSchema,
  signUpSchema,
  type SignUpForm,
} from "~/server/schemas/auth";

export default function SignUpPage() {
  const router = useRouter();

  const [form, setForm] = useState<SignUpForm>({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function onNameChange(e: ChangeEvent<HTMLInputElement>) {
    setForm((s) => ({ ...s, name: e.target.value }));
  }

  function onEmailChange(e: ChangeEvent<HTMLInputElement>) {
    setForm((s) => ({ ...s, email: e.target.value }));
  }

  function onPasswordChange(e: ChangeEvent<HTMLInputElement>) {
    setForm((s) => ({ ...s, password: e.target.value }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const parsed = signUpSchema.safeParse(form);
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

    setLoading(true);

    const res = await authClient.signUp.email({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
    });

    setLoading(false);

    const parsedRes = authClientResponseSchema.safeParse(res);
    if (parsedRes.success && parsedRes.data.error?.message) {
      setError(parsedRes.data.error.message);
      return;
    }

    if (!parsedRes.success) {
      console.error(parsedRes.error);
    }

    router.push("/dashboard");
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

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-white/20">
                  <span className="h-2 w-2 rounded-full bg-white" />
                  Comece agora
                </div>

                <h1 className="mt-6 text-4xl font-semibold leading-tight">
                  Crie sua conta
                  <span className="block text-white/90">
                    em menos de 1 minuto
                  </span>
                </h1>

                <p className="mt-4 max-w-md text-sm/6 text-white/90">
                  Organize suas tarefas, acompanhe prioridades e mantenha o foco
                  no que realmente importa.
                </p>

                <div className="mt-8 grid max-w-md gap-3">
                  <Feature
                    title="Sem complicação"
                    desc="Cadastro simples, sem formulários enormes."
                  />
                  <Feature
                    title="Visual limpo"
                    desc="Tudo pensado pra você agir, não procurar."
                  />
                  <Feature
                    title="Produtividade real"
                    desc="Menos bagunça, mais tarefas concluídas."
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-10">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pb-6">
                  <CardTitle className="bg-gradient-to-r from-fuchsia-600 to-indigo-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                    Criar conta
                  </CardTitle>
                  <p className="text-sm text-slate-500">
                    Preencha seus dados para começar.
                  </p>
                </CardHeader>

                <CardContent className="px-0">
                  <form className="space-y-4" onSubmit={onSubmit}>
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-xs font-normal text-slate-500"
                      >
                        Nome
                      </Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={onNameChange}
                        placeholder="Seu nome"
                        className="h-11 rounded-xl border-slate-200 text-xs font-normal text-slate-500 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

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
                          placeholder="mínimo 8 caracteres"
                          autoComplete="new-password"
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
                      {loading ? "Criando..." : "Criar conta"}
                    </Button>

                    <div className="pt-3 text-center text-sm text-slate-500">
                      Já tem conta?{" "}
                      <button
                        type="button"
                        className="font-medium text-indigo-600 hover:underline"
                        onClick={() => router.push("/sign-in")}
                      >
                        Entrar
                      </button>
                    </div>
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
