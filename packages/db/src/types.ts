import * as schema from "./db-schemas";
import type{ NeonHttpDatabase ,} from "drizzle-orm/neon-http";
import type { NeonQueryFunction } from '@neondatabase/serverless';
import { z } from "zod"
import {
    zDevicesSchema,
    zkeysSchema,
    
} from "./zod-schemas"

export type dbClient = NeonHttpDatabase<typeof schema> & {
    $client: NeonQueryFunction<false, false>;
};

export type createKey = z.infer<typeof zkeysSchema.createKeySchema>
export type updateKey = z.infer<typeof zkeysSchema.updateKeySchema>
export type selectKeys = z.infer<typeof zkeysSchema.selectKeySchema>

export type createDevice = z.infer<typeof zDevicesSchema.createDeviceSchema>
export type updateDevice = z.infer<typeof zDevicesSchema.updateDeviceSchema>
export type selectDevices = z.infer<typeof zDevicesSchema.selectDevicesSchema>

export type createDeviceInterface = z.infer<typeof zDevicesSchema.createDeviceInterfaceSchema>
export type updateDeviceInterface = z.infer<typeof zDevicesSchema.updateDeviceInterfaceSchema>
export type selectDeviceInterface = z.infer<typeof zDevicesSchema.selectDeviceInterfacesSchema>
