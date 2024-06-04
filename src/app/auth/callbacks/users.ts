import { dbConnect } from "@/utils/postgres";
import { EncryptJWT, base64url } from "jose";
import { cookies } from "next/headers";
import { SessionInfo, type Provider } from "@/utils/identity";

import { createUser, updateUser, createIdentity, updateIdentity, findUser, findIdentity } from "@/utils/postgres";

const sql = dbConnect();

export type TokenPayload = { username: string, email: string }

export async function generateTokens(payload: TokenPayload) {
  const secret = base64url.decode(process.env.TOKEN_SECRET!);
  const alg = 'dir';
  const enc = 'A128CBC-HS256';
  const access_token = await new EncryptJWT(payload)
    .setProtectedHeader({ alg, enc })
    .setIssuedAt()
    .setIssuer(`LucasAwesomeApp`)
    .encrypt(secret)
  const refresh_token = await new EncryptJWT(payload)
    .setProtectedHeader({ alg, enc })
    .setIssuer(`LucasAwesomeApp`)
    .setIssuedAt()
    .setExpirationTime('48h')
    .encrypt(secret)
  return { access_token, refresh_token };
}


export async function manageSignIn(sessionInfo: SessionInfo, provider: Provider) {
  const { username, email, provider_access_token, provider_refresh_token } = sessionInfo;
  const { access_token, refresh_token } = await generateTokens({ username, email });

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
