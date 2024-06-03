import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { dbConnect } from "./postgres";
import { decodeJwt } from "jose";

export type Provider = 'GitHub' | 'Google';

export type SessionInfo = {
  username: string,
  email: string,
  provider_access_token: string,
  provider_refresh_token: string
}

type Identity = {
  readonly provider: Provider;
  redirectUser(): void,
  performExchange(req: NextRequest): Promise<SessionInfo>,
  refreshTokens(): void
}

type GitHubToken = {
  access_token: string,
  expires_in: number,
  refresh_token: string,
  refresh_token_expires_in: number,
  token_type: string,
  scope: string
}

type GitHubUser = {
  login: string
  name: string | null,
  email: string | null,
  [key: string]: unknown
}

type GitHubEmail = {
  "email": string
  "verified": boolean,
  "primary": boolean,
  "visibility": string | null
}


export const GitHubIdentity: Identity = {
  provider: 'GitHub',

  redirectUser() {
    const redirectURL = `https://github.com/login/oauth/authorize?` +
      `client_id=${process.env.GITHUB_CLIENT}`;
    redirect(redirectURL);
  },

  async performExchange(req: NextRequest) {
    const GITHUBAPI = "https://api.github.com";
    const code = req.nextUrl.searchParams.get("code");

    if (!code) { // TODO: Clearly signal an error has occured
      redirect('/auth');
    }

    const res = await fetch(
      "https://github.com/login/oauth/access_token?" + new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT!,
        client_secret: process.env.GITHUB_SECRET!,
        code: code,
      }), {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json"
      },
      cache: "no-store",
    }).then(res => res.json()).catch(err => redirect('/auth')) as GitHubToken;
    const { access_token, refresh_token } = res;

    const user = await fetch(`${GITHUBAPI}/user`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${access_token}`,
        "X-GitHub-Api-Version": "2022-11-28"
      }
    }).then(res => res.json())
      .catch(err => {
        console.log(err);
        redirect('/auth');
      }) as GitHubUser;

    let { login, email } = user;

    if (!email) {
      const emails = await fetch(`${GITHUBAPI}/user/emails`, {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${access_token}`,
          "X-GitHub-Api-Version": "2022-11-28"
        }
      }).then(res => res.json())
        .catch(err => {
          console.log(err);
          redirect('/auth?status=noemail');
        }) as GitHubEmail[];
      email = emails.find(elem => elem.primary)!.email;//there has to be a primary email
    }
    return {
      username: login,
      email: email,
      provider_access_token: access_token,
      provider_refresh_token: refresh_token
    };
  },

  refreshTokens() {

  }
}

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

export const GoogleIdentity: Identity = {
  provider: 'Google',

  async redirectUser() {
    const sql = dbConnect();
    const csrf = Array.from({ length: 30 }, () =>
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        .charAt(Math.floor(Math.random() * 62))
    ).join('');
    await sql`
      INSERT INTO GoogleSTATE values (${csrf})
    `;

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT!,
      response_type: "code",
      scope: "openid email profile",
      redirect_uri: "http://localhost:3000/auth/callbacks/google",
      state: csrf,
      access_type: "offline"
    });

    const baseURI = 'https://accounts.google.com/o/oauth2/v2/auth'  // TODO: Refactor to use discovery document
    const redirectURL = baseURI + '?' + params.toString();
    redirect(redirectURL);
  },

  async performExchange(req: NextRequest) {
    const sql = dbConnect();
    const reqParams = req.nextUrl.searchParams;
    if (!reqParams.has('state') || !reqParams.has('code')) redirect('/auth');
    const token = reqParams.get('state') as string;
    const code = reqParams.get('code') as string;
    const tokenSearchResult = await sql`
    select * from GoogleState
    WHERE token=${token}`;
    if (tokenSearchResult.length == 0) redirect('/auth');
    const csrf = tokenSearchResult[0].token;
    if (csrf != token) redirect('/auth');

    await sql`DELETE from GoogleState
            WHERE token=${token}`;

    const fetchParams = new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT!,
      client_secret: process.env.GOOGLE_SECRET!,
      redirect_uri: "http://localhost:3000/auth/callbacks/google",
      grant_type: "authorization_code"
    });

    const tokens: GoogleTokens = await fetch("https://oauth2.googleapis.com/token?" + fetchParams.toString(), { method: 'POST', cache: 'no-store' })// TODO: refactor with discovery
      .then(res => res.json())

    const { email } = decodeJwt(tokens.id_token) as IDToken;
    const { access_token, refresh_token } = tokens;

    const username = email.substring(0, email.indexOf('@'));

    return { username, email, provider_access_token: access_token, provider_refresh_token: refresh_token }
  },

  refreshTokens() {

  }

}






