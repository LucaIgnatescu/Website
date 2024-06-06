import { AuthErrorStates } from "@/app/auth/page";
import { redirect } from "next/navigation";

export function redirectWithError(error: AuthErrorStates, destination: string = '/auth') {
  const info = new URLSearchParams({ error: error.toString() })
  redirect(destination + '?' + info.toString())
}
