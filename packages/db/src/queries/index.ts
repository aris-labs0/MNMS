import {keys,devices,deviceInterfaces} from "../db-schemas";
import { z } from "zod"
import {eq,count,sql,isNull} from 'drizzle-orm';
import type { 
    dbClient,
    selectDevices,
    selectKeys,
    selectDeviceInterfaces
} from "../types" 



export async function getKeyById(db: dbClient, id: string):Promise<selectKeys> {
    const [key] = await db.select().from(keys).where(eq(keys.id, id))
    return key
}
  
export async function getAllKeys(db: dbClient):Promise<selectKeys[]> {
    return await db.query.keys.findMany()
}
  


// devices queries 

export async function getAllDevices(db: dbClient):Promise<selectDevices[]> {
    return await db.select().from(devices)
}
  

export async function getDeviceBySerial(db: dbClient, serial: string):Promise<selectDevices> {
    const [result] = await db.select().from(devices).where(eq(devices.serial, serial))
    return result
}
  
type DeviceWithInterfaces = {
    devices: selectDevices
    device_interfaces: selectDeviceInterfaces | null;
}
export async function getDeviceById(db: dbClient, device_id: string):Promise<DeviceWithInterfaces>{
    const [result] = await db.select()
        .from(devices)
        .leftJoin(deviceInterfaces, eq(devices.id, deviceInterfaces.deviceId))
        .where(eq(devices.id, device_id))
    return result
}


export async function countDevicesByStatus(db: dbClient): Promise<{
    total: number;
    online: number;
    offline: number;
}> {
    const [result] = await db
        .select({
            total: count(),
            online: count(sql`CASE WHEN ${devices.status} = true THEN 1 END`),
            offline: count(sql`CASE WHEN ${devices.status} = false THEN 1 END`),
        })
        .from(devices);
    return result;
}


export async function countPendingAdoptionDevices(db: dbClient): Promise<{ pendingAdoption: number }> {
    const [result] = await db.select({ pendingAdoption: count() })
        .from(devices)
        .where(isNull(devices.site_id));
    return result;
}


export async function getPendingAdoptionDevices(db: dbClient):Promise<selectDevices[]> {
    return await db.select()
        .from(devices)
        .where(isNull(devices.site_id));
}

