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
        I am a genius level programmer that makes great websites with an IQ of 200+.
        <br />
        Hire me!!!!
      </div>
      <h2 className="font-bold text-4xl mb-10 after:bg-white after:block after:w-5 after:h-1 after:my-2">Projects</h2>
      <div>
        {
          // This is where project list goes 
        }
      </div>
    </div>
  </div>
}
