import { z } from "zod";
import { createInsertSchema, createSelectSchema,createUpdateSchema} from "drizzle-zod";
import { sites } from "../db-schemas";

export const createSiteSchema = createInsertSchema(sites);
export const selectSitesSchema = createSelectSchema(sites);
export const updateSiteSchema = createUpdateSchema(sites).extend({
    id: z.string().uuid(),
});
