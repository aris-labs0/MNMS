import { devices, keys,deviceInterfaces } from "../db-schemas"
import { eq, inArray ,sql} from "drizzle-orm"
import type { 
  dbClient,
  createKey,
  createDevice,
  updateDevice,
  updateKey,
  createDeviceInterface,
  updateDeviceInterface
} from "../types" 


export async function createKey(
    db: dbClient,
    data: createKey
  ) {
    const [createdKey] = await db
      .insert(keys)
      .values({...data})
      .returning()
  
    return createdKey
  }
  
  export async function updateKey(
    db: dbClient,
    data: updateKey,
  ) {

    const [updatedKey] = await db
      .update(keys)
      .set({
          ...data
      })
      .where(eq(keys.id, data.id))
      .returning()
  
    return updatedKey
  }
  
  export async function deleteKey(db: dbClient, id: string) {
    const [deletedKey] = await db.delete(keys).where(eq(keys.id, id)).returning()
    return deletedKey
  }
  
  export async function deleteManyKeys(db: dbClient, ids: string[]) {
    const deletedKeys = await db.delete(keys).where(inArray(keys.id, ids)).returning()
    return deletedKeys
  }
  
  export async function decrementMaxDevices(db: dbClient,id:string){
    return await db
      .update(keys)
      .set({ 
        max_devices: sql`${keys.max_devices} - 1` 
      })
      .where(eq(keys.id, id))
  }

// devices mutations

export async function createDevice(
  db: dbClient,
  data: createDevice,
  ) {
  const [createdKey] = await db
    .insert(devices)
    .values({
      ...data,
    })
    .returning()
  return createdKey
}


export async function updateDevice(
  db: dbClient,
  data: updateDevice
) {

  const [updatedDevice] = await db
    .update(devices)
    .set({
        ...data,
        updatedAt:new Date()
        
    })
    .where(eq(devices.id, data.id))
    .returning()

  return updatedDevice
}


export async function createDeviceInterface(
  db: dbClient,
  data: createDeviceInterface,
  ) {
  const [createdDeviceInterface] = await db
    .insert(deviceInterfaces)
    .values({...data})
    .returning()
  return createdDeviceInterface
}

export async function updateDeviceInterfaces(
  db: dbClient,
  data: updateDeviceInterface
) {

  const [updatedDeviceInterface] = await db
    .update(deviceInterfaces)
    .set({
      updatedAt:new Date(),
      ...data
    })
    .where(eq(deviceInterfaces.deviceId, data.deviceId))
    .returning()

  return updatedDeviceInterface
}