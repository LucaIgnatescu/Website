import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { dbConnect, updateIdentity } from "./postgres";
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
  checkAccessToken(access_token: string): Promise<boolean>,
  refreshToken(refresh_token: string, email: string): Promise<boolean>
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

  async checkAccessToken(access_token: string) {
    const GITHUBAPI = "https://api.github.com";
    return await fetch(`${GITHUBAPI}/user`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${access_token}`,
        "X-GitHub-Api-Version": "2022-11-28"
      }
    }).then(res => res.ok).catch(err => false);
  },

  async refreshToken(refresh_token: string, email: string) {
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT!,
      client_secret: process.env.GITHUB_SECRET!,
      grant_type: 'refresh_token',
      refresh_token
    });
    const tokens = await fetch(process.env.GITHUB_ENDPOINT! + "?" + params.toString(), {
      method: 'POST',
      headers: {
        Accept: "application/vnd.github+json",
      },
      cache: 'no-store'
    }).then(res => res.json())
    if ('error' in tokens) {
      return false;
    }
    refresh_token = tokens.refresh_token as string;
    const access_token = tokens.access_token as string;
    try {
      await updateIdentity(access_token, refresh_token, email, this.provider);
    } catch (err) {
      return false;
    }
    console.log('GitHub Identity Refreshed');
    return true
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

type DiscoveryDocument = { // NOTE: There are additional properties in this object I did not include in the type
  "issuer": string,
  "authorization_endpoint": string,
  "token_endpoint": string,
  "userinfo_endpoint": string,
  "revocation_endpoint": string
}

async function getGoogleDiscovery(): Promise<DiscoveryDocument> {
  const url = 'https://accounts.google.com/.well-known/openid-configuration';
  return await fetch(url, { cache: 'default' }).then(res => res.json()).catch(console.log)
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

    const baseURI = (await getGoogleDiscovery()).authorization_endpoint;  // TODO: Refactor to use discovery document
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

    const endpoint = (await getGoogleDiscovery()).token_endpoint + '?'

    const tokens: GoogleTokens = await fetch(endpoint + fetchParams.toString(), { method: 'POST', cache: 'no-store' })// TODO: refactor with discovery
      .then(res => res.json())

    const { email } = decodeJwt(tokens.id_token) as IDToken;
    const { access_token, refresh_token } = tokens;

    const username = email.substring(0, email.indexOf('@'));

    return { username, email, provider_access_token: access_token, provider_refresh_token: refresh_token }
  },

  async checkAccessToken(access_token: string) {
    // https://developers.google.com/identity/openid-connect/openid-connect#obtaininguserprofileinformation
    // Use this to check and refresh tokens
    // TODO: Implement discovery document
    //
    const url = (await getGoogleDiscovery()).userinfo_endpoint + '?';
    return await fetch(url, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Acccept': 'application/json'
      }
    }).then(res => res.ok).catch(err => false)
  },

  async refreshToken(refresh_token: string, email: string) {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT!,
      client_secret: process.env.GOOGLE_SECRET!,
      grant_type: 'refresh_token',
      refresh_token
    });

    const discovery = await getGoogleDiscovery();
    try {
      const tokens = await fetch(discovery.token_endpoint + '?' + params.toString(), {
        cache: 'no-store',
        method: 'POST',
      }).then(res => res.json())
      const access_token = tokens.access_token as string;
      await updateIdentity(access_token, refresh_token, email, this.provider)
    } catch (err) {
      console.log(err)
      return false
    }
    console.log("Google identity refreshed");
    return true
  },
}

export function identityFactory(provider: Provider): Identity {
  if (provider == 'GitHub') {
    return GitHubIdentity;
  }
  if (provider == 'Google') {
    return GoogleIdentity;
  }
  return GitHubIdentity;
}

