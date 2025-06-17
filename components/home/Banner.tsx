import GeneratePlanButton from "@/components/GeneratePlanButton";
import {Lightbulb} from "lucide-react";
import TravelHero from "@/components/home/TravelHero";

const Banner = () => {
  return (
    <section
      className="lg:px-20 px-5 py-2 
                bg-background
                w-full h-full
                flex lg:flex-row flex-col lg:justify-between justify-center items-center
                gap-5
                min-h-[calc(100svh-4rem)]"
    >
      <article className="flex flex-col h-full justify-center items-center lg:flex-1 ">
        <h1
          className="font-bold lg:text-7xl md:text-5xl text-4xl font-sans
      text-left w-full"
        >
          From <br /> <span className="text-blue-500">Idea</span> to <br /> <span className="text-blue-500">Itinerary</span> Instantly.{" "}
          
        </h1>

        <div className="mt-5 lg:mt-10 rounded-md w-full text-left lg:text-lg md:text-md text-base">
          <div className="flex justify-start  items-center">
            <Lightbulb className="mr-1 text-yellow-600" />
            <span className="text-center ">Tell us the vibe</span>
          </div>
          <div className="p-2">
            <p className="text-blue-500 font-bold tracking-wide lg:text-md md:text-base text-sm">
            'weekend, lively streets, wallet-friendly' <br className="lg:hidden" />
              
            </p>
            <p
              className="mt-5 mb-5 
                        lg:text-md md:text-base text-sm
                      text-muted-foreground
                        font-medium
                        tracking-wide
                        md:max-w-xl 
                        text-left"
            >
             We'll map the markets, book the bites and plot the picture-postcard moments."
            </p>
          </div>
        </div>
        <div className="w-full ml-2 flex justify-start">
          <GeneratePlanButton />
        </div>
      </article>
      <figure className="h-full lg:flex-1 flex-1 overflow-hidden">
        <TravelHero />
      </figure>
    </section>
  );
};

export default Banner;
