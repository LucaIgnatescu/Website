import postgres, { Sql } from 'postgres';

let instance:null | Sql = null;

export default function dbConnect() {
  if (instance === null) {
    instance = postgres({
      host: process.env.DB_ENDPOINT,
      database: process.env.DB_DATABASE,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD
    })
  }
  return instance;
}
