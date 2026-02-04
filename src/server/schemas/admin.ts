import { z } from "zod";
import { roleSchema } from "./role";

export const adminUserSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  role: roleSchema,
  createdAt: z.date(),
});
export type AdminUser = z.infer<typeof adminUserSchema>;

export const tasksByUserInputSchema = z.object({
    userId: z.string().min(1),
  });