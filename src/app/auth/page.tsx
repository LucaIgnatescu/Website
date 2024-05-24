import { redirect } from "next/navigation";

async function LoginBtn() {
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

export default async function Page() {
  return <LoginBtn />
}
