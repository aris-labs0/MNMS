import { pgTable, text, integer, timestamp, boolean ,uuid} from "drizzle-orm/pg-core";
            
export const keys = pgTable("keys", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text('name').notNull(),
    device_unlimited: boolean('device_unlimited').notNull(),
    max_devices: integer("max_devices"),
    expire: boolean('expire').notNull(),
    expiration_time: timestamp('expiration_time'),
});