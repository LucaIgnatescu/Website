import { createClient } from "@supabase/supabase-js";
import { Fragment } from "react";
import Image from "next/image";

type CardInfo = {
  name: String | null,
  description: String | null
};

export function Card({ name, description }: CardInfo = { name: null, description: null }) {
  return <span className="flex flex-col border border-white/20 bg-white/5 hover:border-white/80 rounded-xl mx-10 text-center h-80 w-2/5 text-lg text-gray-300">
    <span className="flex-1 border-b border-white/20 basis-1/4 text-center hover:border-white">
      <span className="flex flex-row justify-between h-full">
        <span className="text-center self-center my-3 mx-5 p-3 rounded-xl border-white/20 border">
          Name
        </span>
        <span className="text-center self-center my-3 mx-5 p-3 rounded-xl bg-white/100 text-black">
          Description
        </span>
      </span>
    </span>
    <span className="flex-1 basis-3/4 flex flex-row self-center w-full border-t border-white/20 hover:border-white">
      <span className="flex flex-row flex-1 self-center justify-between px-10">
        <span className="m-3 border border-white/20 rounded-xl flex flex-col justify-between flex-wrap p-2 bg-black">
          <span className="text-center flex flex-row justify-center m-3">
            <Image src="/github-mark.svg" width={30} height={2} alt="github-logo" className="h-fit text-center" />
          </span>
          <span>Source Code</span>
        </span>
        <span className="m-3 border border-white/20 rounded-xl flex flex-col justify-between flex-wrap p-2 bg-black">
          <span className="text-center flex flex-row justify-center m-3">
            <Image src="/book-open.svg" width={30} height={30} alt="book-logo" className="h-fit text-center" />
          </span>
          <span>Deployment</span>
        </span>
      </span>
    </span>
  </span>
}

export async function Cards({ cards }: { cards?: CardInfo[] }) {
  // const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");
  // console.log(await supabase.from("test").select());
  return <span className="flex flex-row m-5">
    {cards?.map((info, i) => <Fragment key={i}> <Card {...info} /> </Fragment>)}
  </span>
}
