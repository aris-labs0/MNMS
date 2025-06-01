import { 
    pgTable, 
    text, uuid,
    numeric,
    timestamp,
    integer,
    bigint,
    boolean,
    jsonb
} from "drizzle-orm/pg-core";
import {sites} from "./sites";       

export const devices = pgTable("devices", {
    id: uuid("id").primaryKey().defaultRandom(),
    serial: text('serial').unique().notNull(),
    name: text('name').notNull(),
    voltage: numeric('voltage'),
    temperature: numeric('temperature'),
    architectureName: text('architecture_name'), 
    boardName: text('board_name'),
    buildTime: text('build_time'),
    cpu: text('cpu'),
    cpuCount: integer('cpu_count'),
    cpuFrequency: integer('cpu_frequency'),
    cpuLoad: integer('cpu_load'),
    freeHddSpace: bigint('free_hdd_space', { mode: 'number' }),
    freeMemory: bigint('free_memory', { mode: 'number' }),
    platform: text('platform'),
    totalHddSpace: bigint('total_hdd_space', { mode: 'number' }),
    totalMemory: bigint('total_memory', { mode: 'number' }),
    uptime: text('uptime'),
    version: text('version'),
    writeSectSinceReboot: bigint('write_sect_since_reboot', { mode: 'number' }),
    writeSectTotal: bigint('write_sect_total', { mode: 'number' }),
    currentFirmware: text('current_firmware'),
    factoryFirmware: text('factory_firmware'),
    firmwareType: text('firmware_type'),
    model: text('model'),
    routerboard: boolean('routerboard'),
    site_id: uuid('site_id').references(() => sites.id),
    status: boolean('status'),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
});


export const deviceInterfaces = pgTable('device_interfaces', {
    deviceId: uuid('device_id').primaryKey().notNull().references(() => devices.id),
    interfaces: jsonb('interfaces').notNull().$type<any[]>(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
});