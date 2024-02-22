import { Fragment } from "react";
import { type CardInfo } from "./components";
import { Card } from "./client";

export async function Cards({ cards }: { cards?: CardInfo[] }) {
  return <span className="flex flex-row m-5 grow overflow-x-scroll no-scrollbar wrap">
    {cards?.map((info, i) => <Fragment key={i}> <Card {...info} /> </Fragment>)}
  </span>
}
