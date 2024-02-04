import { createClient } from "@supabase/supabase-js";
import { Fragment } from "react";

type CardInfo = {
  name: String | null,
  description: String | null
};

export function Card({ name, description }: CardInfo = { name: null, description: null }) {
  return <span className="flex flex-col border border-gray-500 rounded-lg text-m p-10 mx-10 text-center">
    <span> {name || "Name"} </span>
    <span>{description || "Description"}</span>
  </span>
}

export async function Cards({ cards }: { cards?: CardInfo[] }) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");
  console.log(await supabase.from("project").select());
  return <span className="flex flex-row">
    {cards?.map((info, i) => <Fragment key={i}> <Card {...info} /> </Fragment>)}
  </span>
}
