import {
    parseStringToJson,
    parseArrayToJson,
} from "./common.js"
import _ from 'lodash';
export function interfaceParser(interfaceMonitorinTrafic: any,
                                interfacePrint: any,
                                interfaceEthernetMonitoring: any,
                                interfaceEthernetPrint: any
                              ){
    // this function parses the result of /interface/monitor
    // sent by the MikroTik into a JSON.
    // params:
    //       interfaceMonitoring : raw text result of [/interface/monitor/print as-value detail]
    //       interfaceMonitorinTrafic : raw text result of [/interface/monitor-trafic as-value detail]
    //       interfaceEthernetPrint : raw text result of [interface/ethernet/print from=[find] proplist=default-name as-value]
    // the string is converted into a list using CUTHERE as a reference

    const temp = `TEMP_CUTHERE_${Date.now()}`
    let newInterfaceMonitorinTrafic = interfaceMonitorinTrafic.replace(/\.id/g, `${temp} id`).split(temp).slice(1)
    let newInterfacePrint = interfacePrint.replace(/\.id/g, `${temp} id`).split(temp).slice(1)
    let newInterfaceEthernetMonitoring = interfaceEthernetMonitoring.replace(/\.id/g, `${temp} id`).split(temp).slice(1)
    let newInterfaceEthernetPrint = interfaceEthernetPrint.replace(/\.id/g, `${temp} id`).split(temp).slice(1)

    return _.merge(
        parseArrayToJson(newInterfaceMonitorinTrafic), 
        parseArrayToJson(newInterfacePrint),
        parseArrayToJson(newInterfaceEthernetMonitoring),
        parseArrayToJson(newInterfaceEthernetPrint)
    )
}

export function healthParse(script: any) {
    // this function parses the result of /system/health
    // sent by the MikroTik into a JSON.
    // params:
    //       script : raw text result of [/system/health/print as-value detail]
    // step 1: the received text is converted into a list
    const health = script.replace(/\.id/g, 'CUTHERE id').split("CUTHERE").slice(1)
    
    const json = parseArrayToJson(health)
    // json contains a list similar to:
    //
    // [
    //   { id: '*d', name: 'voltage', type: 'V', value: '27.3' },
    //   { id: '*e', name: 'temperature', type: 'C', value: '55' }
    // ]
    //
    // the next step is to reduce the list into a JSON 
    // with only the relevant data, final result example:
    //      { voltage: '27.3', temperature: '55' }
    
    return json.reduce((acc, item) => {
        acc[item.name] = item.value;
        return acc;
    }, {}) 
}




export function parseDeviceInfoToJson(
  healthText:any,
  resourcesText:any,
  routerboardText:any,
  identityText:any
){
  const  health= healthParse(healthText)
  const  resources = parseStringToJson(resourcesText)
  const  routerboard = parseStringToJson(routerboardText)
  const  identity =  parseStringToJson(identityText)
  return {
    name: identity['name'],
    serial:routerboard['serial-number'] ,
    voltage: health.voltage,
    temperature:health.temperature ,
    architectureName: resources['architecture-name'], 
    boardName:resources['board-name'],
    buildTime: resources['build-time'],
    cpu: resources.cpu,
    cpuCount:  resources['cpu-count'],
    cpuFrequency: resources['cpu-frequency'],
    cpuLoad: resources['cpu-load'],
    freeHddSpace: resources['free-hdd-space'],
    freeMemory: resources['free-memory'],
    platform: resources.platform,
    totalHddSpace: resources['total-hdd-space'] ,
    totalMemory: resources['total-memory'] ,
    uptime: resources.uptime,
    version: resources.version,
    writeSectSinceReboot:resources['write-sect-since-reboot'] ,
    writeSectTotal:resources['write-sect-total'] ,
    currentFirmware:routerboard['current-firmware'] ,
    factoryFirmware:routerboard['factory-firmware'] ,
    firmwareType: routerboard['firmware-type'],
    model: routerboard.model,
    routerboard: routerboard.routerboard
  }
}





export function parseTelemetryToJson(payload: any) {
    // this function parses the received payload and transforms it into a JSON
    // that can be sent to the telemetry API
    // params:  
    //      payload : raw text sent from the MikroTik 
    //                contains information about: 
    //                 - interfaces: interface/monitor-traffic [find] as-value once
    //                               interface/print from=[find] as-value
    //                               interface/ethernet/monitor [find] as-value once 
    //                               interface/ethernet/print from=[find] proplist=default-name as-value
    //                 - resources : [/system/resource/print once as-value]
    //                 - health :    [/system/health/print as-value detail]

    const [
      interfaceMonitorinTrafic,
      interfacePrint,
      interfaceEthernetMonitoring,
      interfaceEthernetPrint,
      health,
      resources,
      routerboard,
      identity
    ] = payload.split(/\|\~\*\%\|/)
    return {
      interfaces: interfaceParser(
        interfaceMonitorinTrafic,
        interfacePrint,
        interfaceEthernetMonitoring,
        interfaceEthernetPrint
      ),
      device: parseDeviceInfoToJson(
        health,
        resources,
        routerboard,
        identity
      )
    }
}

