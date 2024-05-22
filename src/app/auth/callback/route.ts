import { dbConnect } from "@/utils/postgres";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { SignJWT } from "jose";

async function getUsername(token: string) {
  const data = await fetch("https://api.github.com/user", {
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": "Bearer " + token,
      "X-GitHub-Api-Version":
        "2022-11-28"
    },
    cache: 'no-store'
  }).then(res => res.json());

  return data.login;
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')!;
  const url = new URL(process.env.GITHUB_ENDPOINT!);
  url.searchParams.append("client_id", process.env.GITHUB_CLIENT!);
  url.searchParams.append("client_secret", process.env.GITHUB_SECRET!);
  url.searchParams.append("code", code);

  const data = await fetch(url.toString(), { cache: 'no-store' }).then(res => res.formData())
  const access_token = data.get('access_token') as string;
  const refresh_token = data.get('refresh_token') as string;
  const username = await getUsername(access_token);
  const sql = dbConnect();
  const secret = new TextEncoder().encode(process.env.TOKEN_SECRET);
  const alg = 'HS256';

  const access = await new SignJWT({ sub: username })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("5minutes")
    .sign(secret);

  const refresh = await new SignJWT({ sub: username })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("2weeks")
    .sign(secret);

  try {//TODO: OPTIMIZE QUERY and check for unique!!!!
    await sql`
      INSERT INTO TOKENS (token) VALUES (${refresh}) returning token;
      `;
    const user = await sql`
      INSERT INTO USERS (username,refresh_token,github_access_token, github_refresh_token) VALUES
      (${username},(SELECT token from tokens where token=${refresh}), ${access_token}, ${refresh_token});
      `;
    console.log(user);
  }
  catch (err) {
    console.log(err);
  }
  redirect(`/auth?access_token=${access}&refresh_token=${refresh}`); //TODO: refactor to use cookies
}
