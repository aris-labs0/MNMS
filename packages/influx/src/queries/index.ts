import {queryApi} from "../index"

export async function getDeviceTelemetry(device_id: string) {
    const fluxQuery = `
      from(bucket: "${process.env.INFLUX_BUCKET!}")
        |> range(start: -1h)
        |> filter(fn: (r) => r._measurement == "device_telemetry")
        |> filter(fn: (r) => r.device_id == "${device_id}")
    `;
  
    const voltage: { time: string; value: number }[] = [];
    const temperature: { time: string; value: number }[] = [];
    const cpu_load: { time: string; value: number }[] = [];
  
    return new Promise((resolve, reject) => {
      queryApi.queryRows(fluxQuery, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          switch (o._field) {
            case "voltage":
                voltage.push({time:o._time,value:o._value});
                break;
            case "temperature":
                temperature.push({time:o._time,value:o._value});
                break;
            case "cpu_load":
              cpu_load.push({time:o._time,value:o._value});
                break;
          }
        },
        error(error) {
          console.error("Query error", error);
          reject(error); 
        },
        complete() {
          resolve({
            temperature,
            voltage,
            cpu_load
          });
        }
      });
    });
  }
  


export async function getInterfaceTelemetry(device_id: string,interface_id:string) {
    const fluxQuery = `
      from(bucket: "${process.env.INFLUX_BUCKET!}")
        |> range(start: -1h)
        |> filter(fn: (r) => r._measurement == "interfaces_telemetry")
        |> filter(fn: (r) => r.device_id == "${device_id}" and r.id == "${interface_id}")
    `;
  
    const rx_bits_per_second: { time: string; value: number }[] = [];
    const tx_bits_per_second: { time: string; value: number }[] = [];
    const rx_packets_per_second: { time: string; value: number }[] = [];
    const tx_packets_per_second: { time: string; value: number }[] = [];
    const status: { time: string; value: boolean }[] = [];
    const rate: { time: string; value: number }[] = [];
    const sfp_rx_loss: { time: string; value: boolean }[] = [];
    const sfp_module_present: { time: string; value: boolean }[] = [];
    const sfp_rx_power: { time: string; value: number }[] = [];
    const sfp_supply_voltage: { time: string; value: number }[] = [];
    const sfp_temperature: { time: string; value: number }[] = [];
    const sfp_tx_power: { time: string; value: number }[] = [];
    
    return new Promise((resolve, reject) => {
      queryApi.queryRows(fluxQuery, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          switch (o._field) {
            case "rx_bits_per_second":
              rx_bits_per_second.push({ time: o._time, value: o._value });
              break;
            case "tx_bits_per_second":
              tx_bits_per_second.push({ time: o._time, value: o._value });
              break;
            case "rx_packets_per_second":
              rx_packets_per_second.push({ time: o._time, value: o._value });
              break;
            case "tx_packets_per_second":
              tx_packets_per_second.push({ time: o._time, value: o._value });
              break;
            case "status":
              status.push({ time: o._time, value: o._value });
              break;
            case "rate":
              rate.push({ time: o._time, value: o._value });
              break;
            case "sfp_rx_loss":
              sfp_rx_loss.push({ time: o._time, value: o._value });
              break;
            case "sfp-module-present":
              sfp_module_present.push({ time: o._time, value: o._value });
              break;
            case "sfp_rx_power":
              sfp_rx_power.push({ time: o._time, value: o._value });
              break;
            case "sfp-supply-voltage":
              sfp_supply_voltage.push({ time: o._time, value: o._value });
              break;
            case "sfp-temperature":
              sfp_temperature.push({ time: o._time, value: o._value });
              break;
            case "sfp-tx-power":
              sfp_tx_power.push({ time: o._time, value: o._value });
              break;
          }
        },
        error(error) {
          console.error("Query error", error);
          reject(error);
        },
        complete() {
          resolve({
            rx_bits_per_second,
            tx_bits_per_second,
            rx_packets_per_second,
            tx_packets_per_second,
            status,
            rate,
            sfp_rx_loss,
            sfp_module_present,
            sfp_rx_power,
            sfp_supply_voltage,
            sfp_temperature,
            sfp_tx_power,
          });
        }
      });
    });
}