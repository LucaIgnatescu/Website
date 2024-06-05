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
  const info = await GoogleIdentity.performExchange(req);

  await manageSignIn(info, 'Google');

  redirect('/auth');
}
