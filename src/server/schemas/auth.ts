import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2, "Nome muito curto").max(60, "Nome muito longo"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});
export type SignUpForm = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});
export type SignInForm = z.infer<typeof signInSchema>;

export const authClientResponseSchema = z.object({
  error: z
    .object({
      message: z.string().optional(),
    })
    .nullable()
    .optional(),
});
export type AuthClientResponse = z.infer<typeof authClientResponseSchema>;
