import { neon } from '@neondatabase/serverless';

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_CJ5LGO3kacRm@ep-rapid-poetry-bemr5ofu-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require";

export const sql = neon(databaseUrl);
