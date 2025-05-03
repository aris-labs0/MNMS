import { Hono ,type Context} from 'hono'
import { sign } from 'hono/jwt'
import { db } from "@mnms/db"
import {createDevice,createDeviceInterface} from "@mnms/db/mutations"
import { getDeviceBySerial } from "@mnms/db/queries"
import {parseTelemetryToJson} from "../../utils/parser"

const app = new Hono()
  .post('/',(ctx) => services.onboarding(ctx))

export default app


const services = {
  
    onboarding:async (ctx:Context)=>{
      const payload = await ctx.req.text()

      const telemetry = parseTelemetryToJson(payload)

      let device = await getDeviceBySerial(db,telemetry.device.serial );

      if (!device){
        device = await createDevice(db, {...telemetry.device})
        await createDeviceInterface(db,{
          deviceId: device.id,
          interfaces: telemetry.interfaces
        })
      }

      const token = await sign(
         {
          id:device.id,
          serial:telemetry.device.serial,
          exp: Math.floor(Date.now() / 1000) + 5
        },
        process.env.JWT_SECRET!
      )

      return ctx.text(`
      /system/scheduler/add name=mnms interval=00:00:05 on-event="
      :do {:local tasks ([/tool/fetch url=${process.env.URL}/api/tasks http-header-field=\\"Authorization: Bearer ${token}\\" as-value output=user]->\\"data\\");
      :foreach task in=[:toarray \\$tasks] do={:local runTask [:parse \\$task]; \\$runTask;}} on-error {}
      " start-time=startup 
      `)
    }
}
