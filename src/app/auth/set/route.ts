import { access } from "fs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { redirect } from "next/navigation";

type URLParams = {
  access_token?: string,
  target?: string
}

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  const params = req.nextUrl.searchParams;

  if (!params.has('access_token')) redirect('/auth');
  const access_token = params.get('access_token') as string;
  const target: string = (params.has('target') ? params.get('target') : '/')!;
  cookieStore.set('access_token', access_token);
  redirect(target);
}
