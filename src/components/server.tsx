import { Fragment } from "react";
import { type CardInfo } from "./components";
import { Card } from "./client";
import { redirect } from "next/navigation";

export async function Cards({ cards }: { cards?: CardInfo[] }) {
  return <span className="flex flex-row m-5 grow overflow-x-scroll no-scrollbar wrap">
    {cards?.map((info, i) => <Fragment key={i}> <Card {...info} /> </Fragment>)}
  </span>
}

export async function LoginBtn() {
  const redirectURL = `https://github.com/login/oauth/authorize?` +
    `client_id=${process.env.GITHUB_CLIENT}`;

  return <div className="bg-green-50 text-center text-black">
    <form action={async () => {
      "use server";
      console.log('redirecting');
      redirect(redirectURL);
    }}>
      <input type="submit" value={"Log In with GitHub"} />
    </form>
  </div>
}
