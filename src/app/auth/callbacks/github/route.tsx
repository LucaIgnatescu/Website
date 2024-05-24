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

export async function GET(req: NextRequest) {

  const params = req.nextUrl.searchParams;
  const code = params.get("code");

  if (!code) { // TODO: Clearly signal an error has occured
    redirect('/auth');
  }

  console.log(code);
  const res = await fetch(
    "https://github.com/login/oauth/access_token?" + new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT!,
      client_secret: process.env.GITHUB_SECRET!,
      code: code,
      // redirect_uri: "localhost:3000"
    }), {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json"
    },
    cache: "no-store",
  }).then(res => res.json()).catch(err => redirect('/auth')) as GitHubToken;

  const { access_token, refresh_token } = res;

  console.log(access_token, refresh_token);
  redirect('/auth');
}
