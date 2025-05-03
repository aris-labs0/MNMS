import { z } from "zod";
import { createInsertSchema, createSelectSchema,createUpdateSchema} from "drizzle-zod";
import { devices, deviceInterfaces } from "../db-schemas";

export const createDeviceSchema = createInsertSchema(devices);
export const selectDevicesSchema = createSelectSchema(devices);
export const updateDeviceSchema = createUpdateSchema(devices).extend({
    id: z.string().uuid(),
});


export const createDeviceInterfaceSchema = createInsertSchema(deviceInterfaces);
export const selectDeviceInterfacesSchema = createSelectSchema(deviceInterfaces);
export const updateDeviceInterfaceSchema = createUpdateSchema(deviceInterfaces).extend({
    deviceId: z.string().uuid(),
});