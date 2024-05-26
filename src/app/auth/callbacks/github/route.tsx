import { User, dbConnect } from "@/utils/postgres";
import { EncryptJWT, base64url } from "jose";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

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

async function createUser(username: string, email: string, github_access_token: string, github_refresh_token: string) {
  const sql = dbConnect();
  const secret = base64url.decode(process.env.TOKEN_SECRET!);
  try {
    // TODO: Remove the Delete Statements
    await sql`delete from Users`;
    await sql`delete from IdentityProviders`
    const access_token = await new EncryptJWT({ username: username })
      .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
      .setIssuedAt()
      .setExpirationTime('5m')
      .encrypt(secret)

    const refresh_token = await new EncryptJWT({ username: username })
      .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
      .setIssuedAt()
      .setExpirationTime('5m')
      .encrypt(secret)

    const records = await sql`insert into users values 
          (default, ${username}, ${email}, ${access_token}, ${refresh_token})
          returning *`as any;
    const { id } = records[0];

    await sql`insert into IdentityProviders values 
          (default, ${id}, 'GitHub', ${username}, ${email}, ${github_access_token}, ${github_refresh_token})
          returning * `;

  } catch (err) {
    console.error(err);
    redirect('/auth?warning=ERROR');
  }
}


export async function GET(req: NextRequest) {
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

  await createUser(login, email, access_token, refresh_token);

  redirect('/');
}
