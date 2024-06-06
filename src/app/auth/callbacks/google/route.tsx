import { NextRequest } from "next/server";
import { manageSignIn } from "../users";
import { GoogleIdentity } from "@/utils/identity";
import { redirect } from "next/navigation";

export async function GET(req: NextRequest) {
  const info = await GoogleIdentity.performExchange(req);

  await manageSignIn(info, 'Google');

  redirect('/');
}
