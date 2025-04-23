import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default ({
  out: './drizzle',
  schema: './src/server/db/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})satisfies Config;