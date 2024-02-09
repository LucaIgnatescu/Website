import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Page() {
  async function signinAction() {
    "use server";
    const supabase = createClient(cookies());
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github", options: {
        redirectTo: 'http://localhost:3000/auth/callback'
      }
    });
    redirect(data.url!);
  }

  return <div>
    <form action={signinAction}>
      <input type="submit" value="Submit!" />
    </form>
  </div>
}
