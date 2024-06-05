import { dbConnect } from "@/utils/postgres";
import { EncryptJWT, SignJWT, base64url } from "jose";
import { cookies } from "next/headers";
import { SessionInfo, type Provider } from "@/utils/identity";

import { createUser, updateUser, createIdentity, updateIdentity, findUser, findIdentity } from "@/utils/postgres";

const sql = dbConnect();

export type TokenPayload = { username: string, email: string }
export type IDTokenPayload = { username: string }

export async function generateTokens(payload: TokenPayload, idPayload: IDTokenPayload) {
  const secret = base64url.decode(process.env.TOKEN_SECRET!);
  const access_token = await new EncryptJWT(payload)
    .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
    .setIssuedAt()
    .setIssuer(`LucasAwesomeApp`)
    .encrypt(secret)

  const id_token = await new SignJWT(idPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(`LucasAwesomeApp`)
    .setIssuedAt()
    .sign(secret)
  return { access_token, id_token };
}


export async function manageSignIn(sessionInfo: SessionInfo, provider: Provider) {
  const { username, email, provider_access_token, provider_refresh_token } = sessionInfo;
  const { access_token, id_token } = await generateTokens({ username, email }, { username });

  const userQuery = await findUser(email);
  let userId;
  if (userQuery.length == 0) {
    userId = await createUser(username, email, access_token, id_token);
  } else {
    userId = await updateUser(access_token, id_token, email);
  }
  const identityQuery = await findIdentity(email, provider);
  if (identityQuery.length == 0) {
    await createIdentity(userId, username, email, provider_access_token, provider_refresh_token, provider);
  } else {
    await updateIdentity(provider_access_token, provider_refresh_token, email, provider);
  }

  const cookieStore = cookies();
  cookieStore.set('access_token', access_token);
  cookieStore.set('id_token', id_token);
}
