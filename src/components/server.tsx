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

export function Cards({ cards }: { cards?: CardInfo[] }) {
  return <span className="flex flex-row">
    {cards?.map((info, i) => <Fragment key={i}> <Card {...info} /> </Fragment>)}
  </span>
}
