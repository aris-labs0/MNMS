import 'dotenv/config';
import {InfluxDB} from "@influxdata/influxdb-client"
export {Point} from "@influxdata/influxdb-client"

export const client = new InfluxDB({
    token: process.env.INFLUX_TOKEN! ,
    url: process.env.INFLUX_URL!
})

export const writeApi = client.getWriteApi(
    process.env.INFLUX_ORG!, 
    process.env.INFLUX_BUCKET!,
    's'
);
export const queryApi = client.getQueryApi(process.env.INFLUX_ORG!);

