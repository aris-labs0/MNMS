export * as zkeysSchema from './keys';
export * as zDevicesSchema from './devices';
export * as zSitesSchema from './sites';

import { z } from "zod";

export const idSchema = z.object({ id: z.string().uuid() });
