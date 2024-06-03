import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { manageSignIn } from "../users";
import { GitHubIdentity } from "@/utils/identity";



export async function GET(req: NextRequest) {
  const info = await GitHubIdentity.performExchange(req);
  await manageSignIn(info, 'GitHub');

  redirect('/auth?status=YAY!'); // TODO: implement status messages
}
