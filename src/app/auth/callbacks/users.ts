import { dbConnect } from "@/utils/postgres";
import { warn } from "console";
import { access } from "fs";
import { EncryptJWT, base64url } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SessionInfo, type Provider } from "@/utils/identity";

const sql = dbConnect();

async function generateTokens(username: string, email: string) {
  const secret = base64url.decode(process.env.TOKEN_SECRET!);
  const alg = 'dir';
  const enc = 'A128CBC-HS256';
  const access_token = await new EncryptJWT({ username, email })
    .setProtectedHeader({ alg, enc })
    .setIssuedAt()
    .setIssuer(`LucasAwesomeApp`)
    .setExpirationTime('30s')
    .encrypt(secret)
  const refresh_token = await new EncryptJWT({ username, email })
    .setProtectedHeader({ alg, enc })
    .setIssuer(`LucasAwesomeApp`)
    .setIssuedAt()
    .setExpirationTime('48h')
    .encrypt(secret)
  return { access_token, refresh_token };
}

const createIdentity = async (id: number, username: string, email: string, access_token: string, refresh_token: string, provider: Provider) =>
  await sql`insert into IdentityProviders values 
        (default, ${id}, ${provider}, ${username}, ${email}, ${access_token}, ${refresh_token})
        returning * `;

const updateIdentity = async (access_token: string, refresh_token: string, email: string, provider: Provider) =>
  await sql`UPDATE IdentityProviders SET access_token=${access_token}, refresh_token=${refresh_token} WHERE email=${email} AND provider=${provider}`;

const createUser = (username: string, email: string, access_token: string, refresh_token: string) =>
  sql`insert into users values 
        (default, ${username}, ${email}, ${access_token}, ${refresh_token})
        returning id`.then(res => res[0].id);

const updateUser = (access_token: string, refresh_token: string, email: string) =>
  sql`UPDATE Users SET access_token=${access_token}, refresh_token=${refresh_token} WHERE email=${email}
            RETURNING id`.then(res => res[0].id);

const findIdentity = async (email: string, provider: Provider) =>
  await sql`select * from IdentityProviders where email=${email} AND provider=${provider}`;

const findUser = async (email: string) => await sql`select * from Users where email=${email}`;

export async function manageSignIn(sessionInfo: SessionInfo, provider: Provider) {
  const { username, email, provider_access_token, provider_refresh_token } = sessionInfo;
  const { access_token, refresh_token } = await generateTokens(username, email);

  const userQuery = await findUser(email);
  let userId;
  if (userQuery.length == 0) {
    userId = await createUser(username, email, access_token, refresh_token);
  } else {
    userId = await updateUser(access_token, refresh_token, email);
  }
  const identityQuery = await findIdentity(email, provider);
  if (identityQuery.length == 0) {
    await createIdentity(userId, username, email, provider_access_token, provider_refresh_token, provider);
  } else {
    await updateIdentity(provider_access_token, provider_refresh_token, email, provider);
  }

  const cookieStore = cookies();
  cookieStore.set('access_token', access_token);

}
