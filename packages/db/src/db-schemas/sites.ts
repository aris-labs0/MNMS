import { pgTable, text, doublePrecision, uuid,integer,boolean,timestamp,AnyPgColumn} from "drizzle-orm/pg-core";
            
export const sites = pgTable("sites", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text('name').notNull(),
    longitude: doublePrecision("longitude"),
    latitude: doublePrecision('latitude'),
    devicesCount:integer("devices_count"),
    status:boolean('status'),
    parentSiteId: uuid('parent_site_id').references(():AnyPgColumn => sites.id),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
});