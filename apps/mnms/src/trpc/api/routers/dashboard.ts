
import { createTRPCRouter, protectProcedure } from "@/trpc/api/trpc"
import { TRPCError } from "@trpc/server"
import {getStatusHistory} from "@mnms/influx/queries"
import { countDevicesByStatus,countPendingAdoptionDevices} from "@mnms/db/queries"

export const dashboardRouter = createTRPCRouter({
  getDevicesStats: protectProcedure.query(async ({ctx}) => {
    try {
      return await countDevicesByStatus(ctx.db)
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch Stats",
        cause: error,
      })
    }
  }),
  getPendingAdoptionDevices: protectProcedure.query(async ({ctx}) => {
    try {
      return await countPendingAdoptionDevices(ctx.db)
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch pending adoption devices",
        cause: error,
      })
    }
  }),
  getStatusHistory: protectProcedure.query(async () => {
    try {
      return await getStatusHistory()
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch status history",
        cause: error,
      })
    }
  }),
})
