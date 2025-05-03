import { Hono ,type Context} from 'hono'
import {parserRate} from "../../utils/common"
import {parseTelemetryToJson} from "../../utils/parser"
import {writeApi,Point} from "@mnms/influx"
import {updateDevice,updateDeviceInterfaces} from "@mnms/db/mutations"
import {db} from "@mnms/db"

const app = new Hono()
  .post('/', (ctx) => services.readTasks(ctx))

export default app

const services = {
    readTasks :async (ctx:Context)=>{
      const jwtPayload = ctx.get('jwtPayload') 
      const payload = await ctx.req.text()
      
      const telemetry = parseTelemetryToJson(payload)

      let influx: Point[] = [];    

      
      telemetry.interfaces.map(async (interfaceData:any) => {

          const point = new Point('interfaces_telemetry')
            .tag('device_id', jwtPayload.device_id)
            .tag('id', interfaceData.id)
            .floatField('rx_bits_per_second', interfaceData['rx-bits-per-second'])
            .floatField('tx_bits_per_second', interfaceData['tx-bits-per-second'])
            .floatField('rx_packets_per_second', interfaceData['rx-packets-per-second'])
            .floatField('tx_packets_per_second', interfaceData['tx-packets-per-second'])
            .booleanField('status', interfaceData.status === "no-link" ? false : true)
            .intField('rate', interfaceData?.rate ? parserRate(interfaceData.rate) : 0);

          if (interfaceData['default-name'] && interfaceData['default-name'].includes('sfp')){
            point.booleanField('sfp_rx_loss', interfaceData['sfp-rx-loss'])
            point.booleanField('sfp-module-present', interfaceData['sfp-module-present']);
            point.floatField('sfp_rx_power', interfaceData['sfp-rx-power'] ?? 0);
            point.floatField('sfp-supply-voltage', interfaceData['sfp-supply-voltage'] ?? 0);
            point.floatField('sfp-temperature', interfaceData['sfp-temperature'] ?? 0);
            point.floatField('sfp-tx-power', interfaceData['sfp-tx-power'] ?? 0);
          }
          influx.push(point)
      })
//
      const point = new Point('device_telemetry')
        .tag('device_id', jwtPayload.device_id)
        .floatField('voltage', telemetry.device.voltage)
        .floatField('temperature', telemetry.device.temperature)
        .floatField('cpu_load', telemetry.device.cpuLoad);

      influx.push(point)

    await updateDevice(db,{
      id:jwtPayload.device_id,
      ...telemetry.device 
    })
    await updateDeviceInterfaces(db,{
      deviceId:jwtPayload.device_id,
      interfaces:telemetry.interfaces
    })
     writeApi.writePoints(influx)
     writeApi.flush()

     return ctx.text("200")
    },
}
