import { dbConnect } from "@/utils/postgres";
import { decodeJwt } from "jose";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { manageSignIn } from "../users";
import { GoogleIdentity } from "@/utils/identity";

type GoogleTokens = {
  access_token: string,
  expires_in: number,
  id_token: string,
  scope: string,
  token_type: string,
  refresh_token: string
}

type IDToken = {
  "iss": string,
  "azp": string,
  "aud": string,
  "sub": string,
  "at_hash": string,
  "hd": string,
  "email": string,
  "email_verified": boolean,
  "iat": number,
  "exp": number,
  "nonce": string
}

export async function GET(req: NextRequest) {
  // const sql = dbConnect();
  // const reqParams = req.nextUrl.searchParams;
  // if (!reqParams.has('state') || !reqParams.has('code')) redirect('/auth');
  // const token = reqParams.get('state') as string;
  // const code = reqParams.get('code') as string;
  // const tokenSearchResult = await sql`
  //   select * from GoogleState
  //   WHERE token=${token}`;
  // if (tokenSearchResult.length == 0) redirect('/auth');
  // const csrf = tokenSearchResult[0].token;
  // if (csrf != token) redirect('/auth');
  //
  // await sql`DELETE from GoogleState
  //           WHERE token=${token}`;
  //
  // const fetchParams = new URLSearchParams({
  //   code,
  //   client_id: process.env.GOOGLE_CLIENT!,
  //   client_secret: process.env.GOOGLE_SECRET!,
  //   redirect_uri: "http://localhost:3000/auth/callbacks/google",
  //   grant_type: "authorization_code"
  // });
  //
  // const tokens: GoogleTokens = await fetch("https://oauth2.googleapis.com/token?" + fetchParams.toString(), { method: 'POST', cache: 'no-store' })// TODO: refactor with discovery
  //   .then(res => res.json())
  //
  // const { email } = decodeJwt(tokens.id_token) as IDToken;
  // const { access_token, refresh_token } = tokens;
  //
  // const username = email.substring(0, email.indexOf('@'));
  const info = await GoogleIdentity.performExchange(req);
  console.log(info)
  await manageSignIn(info, 'Google');

  redirect('/auth');
}
