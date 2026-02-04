import { z } from "zod";

export const roleSchema = z.enum(["user", "admin"]);
export type Role = z.infer<typeof roleSchema>;

export const sessionUserSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  role: roleSchema.optional(),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

export const userPublicSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  role: roleSchema,
});
export type UserPublic = z.infer<typeof userPublicSchema>;

export const usersListItemSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  role: roleSchema,
  createdAt: z.date(),
});
export type UsersListItem = z.infer<typeof usersListItemSchema>;

export const userCreateInput = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  role: roleSchema.default("user"),
});

export const userUpdateInput = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8).optional(),
  role: roleSchema.optional(),
});

export const userDeleteInput = z.object({
  id: z.string().min(1),
});
