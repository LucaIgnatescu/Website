import postgres, { Sql } from 'postgres';
import { type Provider } from './identity';

let sql: null | Sql = null;


export type User = {
  id: number,
  username: string,
  email: string,
  access_token: string,
  id_token: string
};

export type IdentityProvider = {
  id: number,
  user_id: number,
  provider: Provider,
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


export const createIdentity = async (id: number, username: string, email: string, access_token: string, refresh_token: string, provider: Provider) =>
  await dbConnect()`insert into IdentityProviders values 
        (default, ${id}, ${provider}, ${username}, ${email}, ${access_token}, ${refresh_token})
        returning * `;

export const updateIdentity = async (access_token: string, refresh_token: string, email: string, provider: Provider) =>
  await dbConnect()`UPDATE IdentityProviders SET access_token=${access_token}, refresh_token=${refresh_token} WHERE email=${email} AND provider=${provider}`;

export const createUser = (username: string, email: string, access_token: string, id_token: string) =>
  dbConnect()`insert into users values 
        (default, ${username}, ${email}, ${access_token}, ${id_token})
        returning id`.then(res => res[0].id);

export const updateUser = (access_token: string, id_token: string, email: string) =>
  dbConnect()`UPDATE Users SET access_token=${access_token}, id_token=${id_token} WHERE email=${email}
            RETURNING id`.then(res => res[0].id);

export const findIdentity = async (email: string, provider: Provider) =>
  await dbConnect()`select * from IdentityProviders where email=${email} AND provider=${provider}`;

export const findUser = async (email: string) => await dbConnect()`select * from Users where email=${email}`;
