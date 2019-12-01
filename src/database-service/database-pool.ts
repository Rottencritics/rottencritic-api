import { Pool } from 'pg'

export class DatabasePool {

  public pool: Pool = new Pool()
  public query = this.pool.query

  public connect = () => {
    this.pool = new Pool({
      database: process.env.POSTGRES_DB,
      host: 'postgres',
      password: process.env.POSTGRES_PASS,
      port: 5432,
      user: process.env.POSTGRES_USER,
    })
  }
}
