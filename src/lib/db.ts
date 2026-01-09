import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// 只有在非构建环境或强制需要时才检查。如果缺失，导出 null 以便编译通过
const connectionString = process.env.DATABASE_URL;

const client = postgres(connectionString || 'postgres://localhost:5432/dummy');
export const db = drizzle(client, { schema });
