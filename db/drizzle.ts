import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from "./schema";
import postgres from 'postgres'

// This connection is only used on the server side
const sql = postgres(process.env.DATABASE_URL!)

export const db = drizzle(sql);
