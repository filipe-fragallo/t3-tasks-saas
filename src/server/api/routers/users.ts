import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import { user as userTable, account as accountTable } from "~/server/db/schema";
import {
  sessionUserSchema,
  roleSchema,
  userCreateInput,
  userUpdateInput,
  userDeleteInput,
  userPublicSchema,
  usersListItemSchema,
} from "~/server/schemas/user";

export const usersRouter = createTRPCRouter({
  me: protectedProcedure.query(({ ctx }) => {
    const sessionUser = sessionUserSchema.parse(ctx.session.user);

    const role = roleSchema.catch("user").parse(sessionUser.role);

    return userPublicSchema.parse({
      id: sessionUser.id,
      name: sessionUser.name,
      email: sessionUser.email,
      role,
    });
  }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        role: userTable.role,
        createdAt: userTable.createdAt,
      })
      .from(userTable)
      .orderBy(userTable.createdAt);

    return rows.map((r) =>
      usersListItemSchema.parse({
        ...r,
        role: roleSchema.catch("user").parse(r.role),
      }),
    );
  }),

  create: adminProcedure
    .input(userCreateInput)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db
        .select({ id: userTable.id })
        .from(userTable)
        .where(eq(userTable.email, input.email))
        .limit(1);

      if (existing.length) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Já existe um usuário com este email.",
        });
      }

      const userId = crypto.randomUUID();

      const [u] = await ctx.db
        .insert(userTable)
        .values({
          id: userId,
          name: input.name,
          email: input.email,
          role: input.role,
        })
        .returning({
          id: userTable.id,
          name: userTable.name,
          email: userTable.email,
          role: userTable.role,
        });

      await ctx.db.insert(accountTable).values({
        id: crypto.randomUUID(),
        userId,
        providerId: "credentials",
        accountId: input.email,
        password: input.password,
      });

      if (!u) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha ao criar usuário.",
        });
      }

      return userPublicSchema.parse({
        ...u,
        role: roleSchema.catch("user").parse(u.role),
      });
    }),

  update: adminProcedure
    .input(userUpdateInput)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db
        .select({ id: userTable.id })
        .from(userTable)
        .where(eq(userTable.email, input.email))
        .limit(1);

      if (existing.length && existing[0]!.id !== input.id) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Este email já está sendo usado por outro usuário.",
        });
      }

      const [u] = await ctx.db
        .update(userTable)
        .set({
          name: input.name,
          email: input.email,
          ...(input.role ? { role: input.role } : {}),
          updatedAt: new Date(),
        })
        .where(eq(userTable.id, input.id))
        .returning({
          id: userTable.id,
          name: userTable.name,
          email: userTable.email,
          role: userTable.role,
        });

      if (!u) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado." });
      }

      if (input.password) {
        await ctx.db
          .update(accountTable)
          .set({ password: input.password, updatedAt: new Date() })
          .where(eq(accountTable.userId, input.id));
      }

      return userPublicSchema.parse({
        ...u,
        role: roleSchema.catch("user").parse(u.role),
      });
    }),

  delete: adminProcedure
    .input(userDeleteInput)
    .mutation(async ({ ctx, input }) => {
      if (input.id === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você não pode deletar seu próprio usuário admin.",
        });
      }

      const [row] = await ctx.db
        .delete(userTable)
        .where(eq(userTable.id, input.id))
        .returning({ id: userTable.id });

      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado." });
      }

      return row;
    }),
});
