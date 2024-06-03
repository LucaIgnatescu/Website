import { dbConnect } from "@/utils/postgres";
import { redirect } from "next/navigation";
import { GitHubIdentity, GoogleIdentity } from "@/utils/identity";

async function GitHubLoginBtn() {
  return <div className="bg-green-50 text-center text-black">
    <form action={async () => {
      "use server";
      GitHubIdentity.redirectUser();
    }
    }>
      <input type="submit" value={"Log In with GitHub"} />
    </form>
  </div>
}

async function GoogleLoginBtn() {
  const action = async () => {
    "use server";
    await GoogleIdentity.redirectUser(); // WARN: cannot remove this await or redirect behaves weirdly
  }

  return <div className="bg-green text-center text-blue">
    <form action={action}>
      <input type='submit' value='Log In with Google' />
    </form>
  </div>
}

export default async function Page() {
  return <>
    <GitHubLoginBtn />
    <GoogleLoginBtn />
    <form action={
      async () => { // FIX: NEEDS TO BE REMOVED EVENTUALLY
        "use server";
        const sql = dbConnect();
        await sql`delete from users`;
        await sql`delete from googlestate`;
      }
    } className="bg-red text-center">
      <input type='submit' value='Nuke DB' />
    </form>
  </>
}
