import { createClient } from "@supabase/supabase-js";
import { Fragment } from "react";
import { type CardInfo } from "./components";
import { Card } from "./client";

export async function Cards({ cards }: { cards?: CardInfo[] }) {
  // const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");
  // console.log(await supabase.from("test").select());
  return <span className="flex flex-row m-5 grow overflow-x-scroll no-scrollbar wrap">
    {cards?.map((info, i) => <Fragment key={i}> <Card {...info} /> </Fragment>)}
  </span>
}
