"use client";
import { type CardInfo } from "./components";
import Image from "next/image";
import { useState } from "react";

export function Card({ name, description }: CardInfo = { name: null, description: null }) {
  let [clicked, setClicked] = useState<boolean>(true);

  function clickHandler() {
    setClicked(!clicked);
  }
  //TODO: change text size based on number of words
  //TODO: css wizardry to blur left and right sides of project container
  return (
    <span className="flex flex-col border border-white/20 bg-white/5 rounded-xl mx-10 text-center h-96 basis-128 flex-shrink-0 grow-0 text-lg text-gray-300 shadow-lg">
      <span className="flex-1 border-b border-white/20 basis-1/4 text-center">
        <span className="flex flex-row justify-between h-full">
          <span className="text-center self-center my-3 mx-5 p-3 rounded-xl border-white/20 border grow bg-white/[0.05]">
            {name}
          </span>
          <span className={`text-center self-center my-3 mx-5 p-3 rounded-xl ${!clicked ? "bg-white/100 text-black" : ""} hover:cursor-pointer hover:border-white rounded-xl border-white/20 border`} onClick={clickHandler}>
            Description
          </span>
        </span>
      </span>
      <span className="flex-1 basis-3/4 flex flex-row self-center w-full">
        {clicked ? <>
          <span className="flex flex-row flex-1 self-center justify-between px-10">
            <span className="w-32 m-3 border border-white/20 rounded-xl flex flex-col justify-between flex-wrap p-2 bg-black hover:border-white hover:cursor-pointer">
              <span className="text-center flex flex-row justify-center m-3">
                <Image src="/github-mark.svg" width={30} height={30} alt="github-logo" className="h-fit text-center" />
              </span>
              <span>Source</span>
            </span>
            <span className="w-32 m-3 border border-white/20 rounded-xl flex flex-col justify-between flex-wrap p-2 bg-black hover:border-white hover:cursor-pointer">
              <span className="text-center flex flex-row justify-center m-3">
                <Image src="/book-open.svg" width={30} height={30} alt="book-logo" className="h-fit text-center" />
              </span>
              <span>Deployment</span>
            </span>
          </span>
        </>
          :
          <span className="text-gray-300 text-justify text-base p-5">
            {description}
          </span>
        }
      </span>
    </span>
  )
}
