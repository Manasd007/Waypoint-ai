import HowItWorks from "@/components/home/HowItWorks";
import Pricing from "@/components/home/Pricing";
import Banner from "@/components/home/Banner";
import PublicPlans from "@/components/home/PublicPlans";

export default function Home() {
  return (
    <div className="scroll-m-5 w-full">
      <Banner />
      <div className="w-full flex justify-center my-10 px-4">
        <div
          className="
            max-w-xl w-full rounded-3xl
            bg-white/10 dark:bg-[#1a2233]/60
            backdrop-blur-md
            border border-blue-300/30 dark:border-blue-900/60
            shadow-2xl shadow-blue-200/40 dark:shadow-blue-900/40
            px-8 py-7
            text-center
            relative
            overflow-hidden
            animate-fade-in-up
          "
          style={{
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.25)",
          }}
        >
          {/* Animated gradient shimmer */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="w-full h-full bg-gradient-to-tr from-blue-400/10 via-cyan-300/10 to-purple-400/10 animate-gradient-move" />
          </div>
          <div className="relative z-10">
            <p className="text-2xl font-bold text-blue-100 drop-shadow-lg mb-2 animate-fade-in">
              Let AI handle the details.<br />
              <span className="text-blue-300">You focus on the adventure!</span>
            </p>
            <p className="italic text-blue-200 text-lg animate-fade-in delay-200">
              The best journeys are the ones that surprise you.
            </p>
          </div>
        </div>
      </div>
      <HowItWorks />
      <PublicPlans />
      <Pricing />
    </div>
  );
}
