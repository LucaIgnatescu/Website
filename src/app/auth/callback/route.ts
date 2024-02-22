import { redirect } from "next/navigation";
import { NextRequest, NextResponse} from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')!;
  const url = new URL(process.env.GITHUB_ENDPOINT!);
  url.searchParams.append("client_id", process.env.GITHUB_CLIENT!);
  url.searchParams.append("client_secret", process.env.GITHUB_SECRET!);
  url.searchParams.append("code", code);
  console.log("hit");

  const data = await fetch(url.toString(), { cache: 'no-store' }).then(res => res.formData())
  const access_token = data.get('access_token')?? "";
  const refresh_token = data.get('refresh_token')?? "";

  const userData = await fetch('https://api.github.com/users/LucaIgnatescu/repos', {
    headers:{
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Authorization': 'Bearer ' + access_token
    }
  });
  console.log(await userData.json())
  redirect('/auth');
}
