export const CONFIG = process.env.ENV === 'test' ?
  {} : {
    database: process.env.POSTGRES_DB,
    host: 'postgres',
    password: process.env.POSTGRES_PASS,
    port: 5432,
    user: process.env.POSTGRES_USER,
  }
