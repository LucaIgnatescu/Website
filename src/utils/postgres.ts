import postgres, { Sql } from 'postgres';

let sql: null | Sql = null;

export function dbConnect() {
  if (sql === null) {
    sql = postgres({
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD
    })
  }
  return sql;
}
