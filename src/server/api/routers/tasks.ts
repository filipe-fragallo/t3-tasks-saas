import { and, eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { tasks } from "~/server/db/schema";
import {
  taskCreateSchema,
  taskUpdateSchema,
  taskDeleteSchema,
} from "~/server/schemas/tasks";

export const tasksRouter = createTRPCRouter({
  list: protectedProcedure.query(({ ctx }) => {
    const isAdmin = ctx.session.user.email === "admin@admin.com";

    if (isAdmin) {
      return ctx.db.select().from(tasks);
    }

    return ctx.db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, ctx.session.user.id));
  }),

  create: protectedProcedure.input(taskCreateSchema).mutation(async ({ ctx, input }) => {
    const [row] = await ctx.db
      .insert(tasks)
      .values({
        userId: ctx.session.user.id,
        title: input.title,
        description: input.description,
      })
      .returning();

    return row;
  }),

  update: protectedProcedure.input(taskUpdateSchema).mutation(async ({ ctx, input }) => {
    const isAdmin = ctx.session.user.email === "admin@admin.com";

    const where = isAdmin
      ? eq(tasks.id, input.id)
      : and(eq(tasks.id, input.id), eq(tasks.userId, ctx.session.user.id));

    const [row] = await ctx.db
      .update(tasks)
      .set({
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.done !== undefined ? { done: input.done } : {}),
        updatedAt: new Date(),
      })
      .where(where)
      .returning();

    if (!row) throw new Error("Task não encontrada (ou não é sua).");
    return row;
  }),

  delete: protectedProcedure
    .input(taskDeleteSchema)
    .mutation(async ({ ctx, input }) => {
      const isAdmin = ctx.session.user.email === "admin@admin.com";

      const where = isAdmin
        ? eq(tasks.id, input.id)
        : and(eq(tasks.id, input.id), eq(tasks.userId, ctx.session.user.id));

      const [row] = await ctx.db.delete(tasks).where(where).returning();

      if (!row) throw new Error("Task não encontrada (ou não é sua).");
      return row;
    }),
});
