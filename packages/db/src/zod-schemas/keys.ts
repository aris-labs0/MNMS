import { z } from "zod";
import { createInsertSchema, createSelectSchema,createUpdateSchema} from "drizzle-zod";
import { keys } from "../db-schemas";

export const createKeySchema = createInsertSchema(keys).extend({
    name: z.string().nonempty(),
    max_devices: z.number().nullable(),
    expiration_time: z.date().nullable(),
});
  
export const updateKeySchema = createUpdateSchema(keys).extend({
    id: z.string().uuid(),
});


export const selectKeySchema = createSelectSchema(keys)
export const idKeySchema = z.object({ id: z.string().uuid() });
export const idsKeySchema = z.object({ ids: z.array(z.string().uuid()) });