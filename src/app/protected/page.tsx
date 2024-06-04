import { manageSession } from "@/utils/session"

export default async function Page() {
  await manageSession();

  return <>
    <h1>
      Should be protected
    </h1>
  </>
}
