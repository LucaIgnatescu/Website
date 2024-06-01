import { manageSession } from "@/utils/session"

export default function Page() {
  manageSession();

  return <>
    <h1>
      Should be protected
    </h1>
  </>
}
