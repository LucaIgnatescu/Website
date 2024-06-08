"use server";
import { base64url, jwtDecrypt } from "jose";
import { JOSEError } from "jose/errors";
import { cookies } from "next/headers";
import { IdentityProvider, dbConnect, updateUser } from "./postgres";
import { TokenPayload, generateTokens } from "@/app/auth/callbacks/users";
import { identityFactory } from "./identity";
import { redirectWithError } from "./general";
import { AuthErrorStates } from "@/app/auth/page";

const TOKEN_EXPIRATION_TIME = '5s';

export async function manageSession() {
  const cookieStore = cookies();
  if (!cookieStore.has('access_token') || !cookieStore.has('id_token')) redirectWithError(AuthErrorStates.INVALID_SESSION);
  const token: string = cookieStore.get('access_token')?.value!;
  const secret = base64url.decode(process.env.TOKEN_SECRET!);
  let payload: TokenPayload;

  let errCode;
  try {
    const res = await jwtDecrypt(token, secret, { maxTokenAge: TOKEN_EXPIRATION_TIME });
    payload = res.payload as TokenPayload;
  } catch (err) {
    if (err instanceof JOSEError)
      errCode = err.code;
    else
      errCode = 'ERR_OTHER'
  }
  if (errCode === 'ERR_JWT_INVALID' || errCode === 'ERR_OTHER' || errCode === 'ERR_JWE_DECRYPTION_FAILED') {
    redirectWithError(AuthErrorStates.INVALID_SESSION) // WARN: Triple check that no error codes were missed
  } else if (errCode === 'ERR_JWT_EXPIRED') {
    payload = (await jwtDecrypt(token, secret)).payload as TokenPayload;
    await refreshSession(payload)
  }
}

// TODO: Remove refresh tokens
async function refreshSession(payload: TokenPayload) {
  const sql = dbConnect();
  const { email, username } = payload;

  const queryResult = await sql`SELECT * FROM IdentityProviders where email=${email}` as IdentityProvider[];
  if (queryResult.length === 0) redirectWithError(AuthErrorStates.INVALID_SESSION);

  const checkActive = await Promise.all(
    queryResult.map(({ access_token, provider }) => identityFactory(provider).checkAccessToken(access_token))
  )

  const isActive = checkActive.reduce((acc, res) => acc || res, false);
  if (isActive) {

    const { access_token, id_token } = await generateTokens(payload, { username });
    updateUser(access_token, id_token, email);

    cookies().set('access_token', access_token);
    cookies().set('id_token', id_token)
    console.log("OAuth session still valid. Refreshing ...");
    return;
  }
  const couldRefresh = (await Promise.all(
    queryResult.map(({ refresh_token, provider }) => identityFactory(provider).refreshToken(refresh_token, email))
  )).reduce((acc, res) => acc || res, false);

  if (!couldRefresh) redirectWithError(AuthErrorStates.PROVIDER_ERROR);

  const { access_token, id_token } = await generateTokens(payload, { username });
  updateUser(access_token, id_token, email);
  cookies().set('access_token', access_token);
  cookies().set('id_token', id_token)
}
