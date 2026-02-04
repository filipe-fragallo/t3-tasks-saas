import { z } from "zod";

export const taskCreateSchema = z.object({
  title: z.string().min(1, "Título obrigatório").max(120, "Título muito longo"),
  description: z.string().max(2000, "Descrição muito longa").optional(),
});
export type TaskCreateInput = z.infer<typeof taskCreateSchema>;

export const taskUpdateSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).optional().nullable(),
  done: z.boolean().optional(),
});
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;

export const taskDeleteSchema = z.object({
  id: z.number().int().positive(),
});
export type TaskDeleteInput = z.infer<typeof taskDeleteSchema>;

export const adminTaskSchema = z.object({
    id: z.number(),
    userId: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    done: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
  });
  export type AdminTask = z.infer<typeof adminTaskSchema>;