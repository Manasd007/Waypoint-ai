import GeneratePlanButton from "@/components/GeneratePlanButton";
import {Lightbulb} from "lucide-react";
import TravelHero from "@/components/home/TravelHero";

const Banner = () => {
  return (
    <section className="lg:px-20 px-5 py-2 bg-background w-full h-full flex lg:flex-row flex-col lg:justify-between justify-center items-center gap-5 min-h-[calc(100svh-4rem)]">
      <article className="flex flex-col h-full justify-center items-start lg:flex-1 w-full max-w-2xl mx-auto">
        <h1 className="font-bold lg:text-7xl md:text-5xl text-4xl font-sans text-left w-full leading-tight mb-6">
          From <span className="text-blue-500">Idea</span> to <span className="text-blue-500">Itinerary</span>.<br /> Instantly.
        </h1>

        <div className="mt-2 mb-8 w-full space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="text-yellow-500 h-6 w-6" />
            <span className="font-semibold text-lg">Tell us the vibe</span>
          </div>
          <div>
            <span className="text-blue-400 font-semibold text-lg">weekend, lively streets, wallet-friendly</span>
          </div>
          <p className="text-muted-foreground font-medium text-base md:max-w-xl leading-relaxed">
            We map the markets, book the bites, and plot the moments. You just show up.
          </p>
        </div>

        <div className="w-full flex justify-start mb-8">
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
