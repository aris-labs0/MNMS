import { z } from "zod";

export const keysSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    device_unlimited: z.boolean(),
    max_devices: z.number().int().optional(),
    expire: z.boolean(),
    expiration_time: z.date().optional()
});

export const createKeySchema = keysSchema.omit({ id: true });

export const updateKeySchema = keysSchema.partial().extend({
    id: z.string().uuid(),
});

export const idKeySchema = z.object({ id: z.string().uuid() });

export const idsKeySchema = z.object({ids: z.array(z.string().uuid())});
