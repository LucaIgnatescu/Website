import { base64url, jwtVerify } from "jose";
import { JOSEError } from "jose/errors";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { dbConnect } from "./postgres";

export async function manageSession() {
  const cookieStore = cookies();
  if (!cookieStore.has('access_token')) redirect('/auth');
  const token: string = cookieStore.get('access_token')?.value!;
  console.log(token);
  const secret = base64url.decode(process.env.TOKEN_SECRET!);
  let payload, protectedHeader;

  let errCode;
  try {
    const res = await jwtVerify(token, secret);
    payload = res.payload;
    protectedHeader = res.protectedHeader;
  } catch (err) {
    if (err instanceof JOSEError)
      errCode = err.code;
    else
      errCode = 'ERR_OTHER'
  }
  console.log(errCode);
  if (errCode === 'ERR_JWT_EXPIRED') {
    refreshToken();
  } else if (errCode === 'ERR_JWT_INVALID' || errCode === 'ERR_OTHER') {
    redirect('/auth')
  }
}

function refreshToken() {
  const sql = dbConnect();

}
