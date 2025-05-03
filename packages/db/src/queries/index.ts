import {keys,devices} from "../db-schemas";
import { z } from "zod"
import {eq} from 'drizzle-orm';
import type { 
    dbClient,
    selectDevices,
    selectKeys 
} from "../types" 



export async function getKeyById(db: dbClient, id: string):Promise<selectKeys> {
    const [key] = await db.select().from(keys).where(eq(keys.id, id))
    return key
}
  
export async function getAllKeys(db: dbClient):Promise<selectKeys[]> {
    const allKeys = await db.query.keys.findMany()
    return allKeys
}
  


// devices queries 

export async function getDeviceBySerial(db: dbClient, serial: string):Promise<selectDevices> {
    const [device] = await db.select().from(devices).where(eq(devices.serial, serial))
    return device
}
  



