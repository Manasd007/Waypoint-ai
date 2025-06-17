import type { Metadata } from "next";
import Header from "@/components/home/Header";
export const metadata: Metadata = {
  metadataBase: new URL("https://www.travelplannerai.site"),
  title: {
    default: "WayPoint - Your Smart Travel Planner",
    template: "%s | WayPoint - Your Smart Travel Planner",
  },
  description:
    "WayPoint provides intelligent travel suggestions, personalized itineraries, and seamless trip planning. Plan your perfect trip with ease.",
  keywords: [
    "travel planner",
    "AI travel planner",
    "travel itinerary",
    "trip planner",
    "travel app",
    "AI trip planner",
    "travel AI",
  ],
  openGraph: {
    title: "WayPoint - Your Smart Travel Planner",
    description:
      "WayPoint provides intelligent travel suggestions, personalized itineraries, and seamless trip planning. Plan your perfect trip with ease.",
    url: "https://www.travelplannerai.site",
    type: "website",
    siteName: "TravelPlannerAI",
    images: [
      {
        url: "https://www.travelplannerai.site/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "WayPoint",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100svh-4rem)] flex-col items-center bg-blue-50/40">
        {children}
      </main>
    </>
  );
}
