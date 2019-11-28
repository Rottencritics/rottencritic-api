import { Pool } from 'pg'
export const pool = new Pool({
  database: process.env.POSTGRES_DB,
  host: 'postgres',
  password: process.env.POSTGRES_PASS,
  port: 5432,
  user: process.env.POSTGRES_USER,
})
