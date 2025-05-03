import { zkeysSchema } from "@mnms/db/zod-schemas"
import { createTRPCRouter, protectProcedure } from "@/trpc/api/trpc"
import { TRPCError } from "@trpc/server"
import { 
  createKey, 
  updateKey, 
  deleteKey, 
  deleteManyKeys } from "@mnms/db/mutations"
  import { getKeyById, getAllKeys} from "@mnms/db/queries"

export const keysRouter = createTRPCRouter({
  create: protectProcedure.input(zkeysSchema.createKeySchema).mutation(async ({ input, ctx }) => {
    try {
      const createdKey = await createKey(ctx.db, {
        ...input
      })

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

  update: protectProcedure.input(zkeysSchema.updateKeySchema).mutation(async ({ input, ctx }) => {
    try {
      const updatedKey = await updateKey(ctx.db,  {
        ...input
      })

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

  delete: protectProcedure.input(zkeysSchema.idKeySchema).mutation(async ({ input, ctx }) => {
    try {
      const deletedKey = await deleteKey(ctx.db, input.id)
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

  deleteMany: protectProcedure.input(zkeysSchema.idsKeySchema).mutation(async ({ input, ctx }) => {
    try {
      const deletedKeys = await deleteManyKeys(ctx.db, input.ids)
      if (!deletedKeys.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Keys not found`,
        })
      }

      return deletedKeys[0] 
    } catch (error) {
      if (error instanceof TRPCError) throw error

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while deleting the keys",
        cause: error,
      })
    }
  }),

  getById: protectProcedure.input(zkeysSchema.idKeySchema).query(async ({ input, ctx }) => {
    try {
      const key = await getKeyById(ctx.db,input.id)

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
      const allKeys = await getAllKeys(ctx.db)
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
