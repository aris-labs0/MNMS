
import { createTRPCRouter, protectProcedure } from "@/trpc/api/trpc"
import { TRPCError } from "@trpc/server"
import { getPendingAdoptionDevices,getAllDevices,getDeviceById} from "@mnms/db/queries"
import { idSchema } from "@mnms/db/zod-schemas"
import {getDeviceTelemetry} from "@mnms/influx/queries"
export const devicesRouter = createTRPCRouter({
    getAllDevices:protectProcedure.query(async ({ctx}) => {
        try {
          return await getAllDevices(ctx.db)
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch devices",
            cause: error,
          })
        }
    }),
    getDeviceById:protectProcedure.input(idSchema).query(async ({ctx,input}) => {
      try {
        return getDeviceById(ctx.db,input.id)
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch device by id",
          cause: error,
        })
      }
    }),
    getPendingAdoptionDevices: protectProcedure.query(async ({ctx}) => {
    try {
      return await getPendingAdoptionDevices(ctx.db)
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch pending devices",
        cause: error,
      })
    }
  }),
  getDeviceTelemetry: protectProcedure.input(idSchema).query(async ({ctx,input}) => {
    try {
      return await getDeviceTelemetry(input.id)
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch device telemetry",
        cause: error,
      })
    }
  })
})
