import {Cron} from "croner";
import { countDevicesByStatus } from "@mnms/db/queries";
import { db } from "@mnms/db";
import {writeApi,Point} from "@mnms/influx"

new Cron('*/5 * * * * *', async () => {
  const {
    total:totalDevices,
    online:devicesOnline,
    offline:devicesOffline
  } = await countDevicesByStatus(db)
  
  if (totalDevices === 0 ){
    const point = new Point("global_status")
    .floatField("status", 0 )
    writeApi.writePoint(point)
  } else {
    const onlineDevicesPercentage = (devicesOnline / totalDevices * 100);
    const roundedOnlinePercentage = Math.round(onlineDevicesPercentage * 10) / 10;
  
    const point = new Point("global_status")
    .floatField("status",roundedOnlinePercentage)
    writeApi.writePoint(point)
  }
  writeApi.flush()
  console.log("ok")
  
});