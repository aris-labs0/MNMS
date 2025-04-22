import { 
  createKeySchema, 
  idKeySchema, 
  updateKeySchema,
  idsKeySchema
} from "../../schema"
import { createTRPCRouter, protectProcedure } from "@/trpc/api/trpc"
import { keys } from "@/db/schema"
import { eq ,inArray} from "drizzle-orm"
import { TRPCError } from "@trpc/server"

export const keysRouter = createTRPCRouter({
  create: protectProcedure.input(createKeySchema).mutation(async ({ input, ctx }) => {
    try {
      const [createdKey] = await ctx.db
        .insert(keys)
        .values({
          name: input.name,
          expire: input.expire,
          expiration_time: input.expiration_time,
          device_unlimited: input.device_unlimited,
          max_devices: input.max_devices,
        })
        .returning()

      if (!createdKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create key",
        })
      }

      return createdKey
    } catch (error) {
      if (error instanceof TRPCError) throw error

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while creating the key",
        cause: error,
      })
    }
  }),

  update: protectProcedure.input(updateKeySchema).mutation(async ({ input, ctx }) => {
    try {
      const [updatedKey] = await ctx.db
        .update(keys)
        .set({
          name: input.name,
          expire: input.expire,
          expiration_time: input.expiration_time,
          device_unlimited: input.device_unlimited,
          max_devices: input.max_devices,
        })
        .where(eq(keys.id, input.id))
        .returning()

      if (!updatedKey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Key with ID ${input.id} not found`,
        })
      }

      return updatedKey
    } catch (error) {
      if (error instanceof TRPCError) throw error

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while updating the key",
        cause: error,
      })
    }
  }),

  delete: protectProcedure.input(idKeySchema).mutation(async ({ input, ctx }) => {
    try {
      const [deletedKey] = await ctx.db.delete(keys).where(eq(keys.id, input.id)).returning()

      if (!deletedKey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Key with ID ${input.id} not found`,
        })
      }

      return deletedKey
    } catch (error) {
      if (error instanceof TRPCError) throw error

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while deleting the key",
        cause: error,
      })
    }
  }),
  deleteMany: protectProcedure.input(idsKeySchema).mutation(async ({ input, ctx }) => {
    try {
      const [deletedKey] = await ctx.db.delete(keys).where(inArray(keys.id, input.ids)).returning()

      if (!deletedKey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Key not found`,
        })
      }

      return deletedKey
    } catch (error) {
      if (error instanceof TRPCError) throw error

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while deleting the key",
        cause: error,
      })
    }
  }),

  getById: protectProcedure.input(idKeySchema).query(async ({ input, ctx }) => {
    try {
      const [key] = await ctx.db.select().from(keys).where(eq(keys.id, input.id))

      if (!key) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Key with ID ${input.id} not found`,
        })
      }

      return key
    } catch (error) {
      if (error instanceof TRPCError) throw error

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while fetching the key",
        cause: error,
      })
    }
  }),

  getKeys: protectProcedure.query(async ({ ctx }) => {
    try {
      const allKeys = await ctx.db.query.keys.findMany()
      return allKeys
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch keys",
        cause: error,
      })
    }
  }),
})
