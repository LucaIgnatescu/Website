"use client";

import { useSearchParams } from "next/navigation";

export function ErrorMessage() {
  const params = useSearchParams();

  if (!params.has('error')) {
    return <> </>
  }

  let text;
  // @ts-ignore already checked
  switch (+params.get('error') as AuthErrorStates) {
    case (AuthErrorStates.GENERIC):
      text = "Please Log In First.";
      break;
    case (AuthErrorStates.NO_EMAIL):
      text = "Could not retreieve email address. Please try again.";
      break;
    case (AuthErrorStates.INVALID_SESSION):
      text = "Please Log In First.";
      break;
    case (AuthErrorStates.PROVIDER_ERROR):
      text = "Could not retrieve account. Please sign in again.";
      break;
  }

  return (
    <div className="text-red-600 py-3">
      {text}
    </div>
  );
}

export enum AuthErrorStates {
  PROVIDER_ERROR,
  NO_EMAIL,
  INVALID_SESSION,
  GENERIC,
}
