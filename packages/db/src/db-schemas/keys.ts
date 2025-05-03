import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";
            
export const keys = pgTable("keys", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text('name').notNull(),
    max_devices: integer("max_devices"),
    expiration_time: timestamp('expiration_time')
});