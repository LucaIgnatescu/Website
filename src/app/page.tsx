import { Fragment } from "react";
import { type CardInfo, Card, ScrollableContainer } from "@/components/client";


export async function Cards({ cards }: { cards?: CardInfo[] }) {
  return <>
    {cards?.map((info, i) => <Fragment key={i}> <Card {...info} /> </Fragment>)}
  </>
}

export default async function Page() {

  return <div>
    <div className="py-20 flex flex-row justify-between " >
      <span></span>
      <div className="px-20 text-gray-300 text-xl inline-block ">
        <span className="px-5 hover:text-white hover:cursor-pointer">
          Resume
        </span>
        <span className="px-5 hover:text-white hover:cursor-pointer">
          Github
        </span>
        <span className="px-5 hover:text-white hover:cursor-pointer">
          LinkdIn
        </span>
        <span className="line-through px-5">
          Blog
        </span>
      </div>
    </div>
    <div className="w-auto px-20 text-3xl">
      <div className="py-28 text-gray-300">
        I am a programmer that likes webdev and low level!
        <br />
        Hire me!!!!
      </div>
      <h2 className="font-bold text-4xl mb-10 after:bg-white after:block after:w-5 after:h-1 after:my-2">Projects</h2>
      <ScrollableContainer className="flex flex-row m-5 grow overflow-x-scroll no-scrollbar wrap select-none">
        <Cards cards={[
          { name: "Project 1", description: "Description" },
          { name: "Project 2", description: "BLA BLA BLA" },
          { name: "Project 3", description: "BLA BLA BLA" }
        ]} />
      </ScrollableContainer>
    </div>
  </div>
}
