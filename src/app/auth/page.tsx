import { dbConnect } from "@/utils/postgres";
import { redirect } from "next/navigation";

async function GitHubLoginBtn() {
  return <div className="bg-green-50 text-center text-black">
    <form action={async () => {
      "use server";
      const redirectURL = `https://github.com/login/oauth/authorize?` +
        `client_id=${process.env.GITHUB_CLIENT}`;
      redirect(redirectURL);
    }}>
      <input type="submit" value={"Log In with GitHub"} />
    </form>
  </div>
}

async function GoogleLoginBtn() {
  const action = async () => {
    "use server";
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

    const baseURI = 'https://accounts.google.com/o/oauth2/v2/auth'  // TODO: Refactor to use discovery document
    const redirectURL = baseURI + '?' + params.toString();
    redirect(redirectURL);
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
