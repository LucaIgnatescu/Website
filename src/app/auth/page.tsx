import { dbConnect } from "@/utils/postgres";
import { GitHubIdentity, GoogleIdentity } from "@/utils/identity";

export enum AuthErrorStates {
  PROVIDER_ERROR,
  NO_EMAIL,
  INVALUD_SESSION,
  GENERIC,
}


// NOTE: These functions cannot be made into a component, because they behave
// weirdly with server actions and props passing
async function GitHubLoginBtn({ className }: { className?: string }) {
  return <form action={async () => {
    "use server";
    await GitHubIdentity.redirectUser();
  }
  } className={className}>
    <input type="submit" value={"Log In with " + GitHubIdentity.provider} />
  </form>
}


async function GoogleLoginBtn({ className }: { className?: string }) {
  const action = async () => {
    "use server";
    await GoogleIdentity.redirectUser(); // WARN: cannot remove this await or redirect behaves weirdly
  }

  return <form action={action} className={className}>
    <input type='submit' value='Log In with Google' />
  </form>
}

async function LoginMenu() {
  return (
    <div className="">
      <GitHubLoginBtn />
      <GoogleLoginBtn />
    </div>
  );
}

export default async function Page() {
  return <>
    <LoginMenu />
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
