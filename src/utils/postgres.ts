import { log } from 'console';
import postgres, { Sql } from 'postgres';

let sql: null | Sql = null;


export type User = {
  id: number,
  username: string,
  email: string,
  access_token: string,
  refresh_token: string
};

export type IdentityProvider = {
  id: number,
  user_id: number,
  provider: string,
  username: string,
  email: string,
  access_token: string,
  refresh_token: string
};

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
