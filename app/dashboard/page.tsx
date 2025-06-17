import Dashboard from "@/components/dashboard/Dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "WayPoint provides intelligent travel suggestions, personalized itineraries, and seamless trip planning. Plan your perfect trip with ease.",
  keywords:
    "travel planner, AI travel planner, smart travel, travel suggestions, destination insights, personalized itineraries, trip planning, travel tips, vacation planning",

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

export default function DashboardPage() {
  return <Dashboard />;
}
