import { eq } from "drizzle-orm";
import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import { user, tasks } from "~/server/db/schema";
import {
  adminUserSchema,
  tasksByUserInputSchema,
} from "~/server/schemas/admin";
import {
  adminTaskSchema
} from "~/server/schemas/tasks";

export const adminRouter = createTRPCRouter({
  usersList: adminProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.select().from(user);

    return rows.map((r) => adminUserSchema.parse(r));
  }),

  tasksListAll: adminProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.select().from(tasks);

    return rows.map((r) => adminTaskSchema.parse(r));
  }),

  tasksByUser: adminProcedure
    .input(tasksByUserInputSchema)
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(tasks)
        .where(eq(tasks.userId, input.userId));

      return rows.map((r) => adminTaskSchema.parse(r));
    }),
});
