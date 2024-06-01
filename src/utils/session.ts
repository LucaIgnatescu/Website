import { error, warn } from "console";
import { base64url, jwtVerify } from "jose";
import { JOSEError } from "jose/errors";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function manageSession() {
  const cookieStore = cookies();
  if (!cookieStore.has('access_token')) redirect('/auth');
  const token: string = cookieStore.get('access_token')?.value!;

  const secret = base64url.decode(process.env.TOKEN_SECRET!);
  let payload, protectedHeader;

  let errCode = undefined;
  try {

    const res = await jwtVerify(token, secret);

    payload = res.payload;
    protectedHeader = res.protectedHeader;
  } catch (err) {
    if (err instanceof JOSEError)
      errCode = err.code;
  }
  if (errCode === 'ERR_JWT_INVALID') {
    redirect('/auth');
  } else if (errCode === 'ERR_JWT_EXPIRED') {
    refreshToken();
  }

  console.log(errCode);
}

function refreshToken() { } // TODO: Implement this
