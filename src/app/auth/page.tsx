"use server";

import { dbConnect } from "@/utils/postgres";
import { GitHubIdentity, GoogleIdentity } from "@/utils/identity";
import Image from "next/image";
import { ErrorMessage } from "./client";

// NOTE: These functions cannot be made into a component, because they behave
// weirdly with server actions and props passing
async function GitHubLoginBtn({ className }: { className?: string }) {
  return <form action={async () => {
    "use server";
    await GitHubIdentity.redirectUser();
  }
  } className={className}>
    <span>
      <Image src="/github-logo-white.svg" width={30} height={30} alt="github-logo" className="h-fit text-center inline pr-2" />
      <input type="submit" value={"Log In with " + GitHubIdentity.provider} />
    </span>
  </form>
}


async function GoogleLoginBtn({ className }: { className?: string }) {
  const action = async () => {
    "use server";
    await GoogleIdentity.redirectUser(); // WARN: cannot remove this await or redirect behaves weirdly
  }

  return <form action={action} className={className}>
    <span>
      <Image src="/google-logo.svg" width={40} height={30} alt="google-logo" className="h-fit text-center inline pr-2" />
      <input type='submit' value='Log In with Google' />
    </span>
  </form>
}

async function LoginMenu() {
  return (<div className="flex flex-col h-1/5 justify-around *:my-2 border-y border-solid border-white/20 py-3
    *:rounded *:py-3 *:px-12 *:font-semibold *:text-m">
    <GitHubLoginBtn className="bg-gray-600 text-white hover:bg-gray-500" />
    <GoogleLoginBtn className="bg-gray-200 text-black hover:bg-white" />
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
  </div>
  );
}

export default async function Page() {
  return <div className="h-screen">
    <div className="flex w-full justify-center items-center h-3/4">
      <div className="text-center flex flex-col justify-around my">
        <h1 className="text-5xl font-bold py-10">Log In</h1>
        <LoginMenu />
        <ErrorMessage />
      </div>
    </div>
  </div>
}
