import type { Metadata } from "next";
import { Montserrat_Alternates } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

import { Providers } from "./providers";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import Progress from "@/components/Progress";
import { Toaster } from "@/components/ui/toaster";

import "./globals.css";

const montserrat = Montserrat_Alternates({
  weight: ["500"],
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "WayPoint - Your Smart Travel Planner",
    template: "%s | WayPoint - Your Smart Travel Planner",
  },
  metadataBase: new URL("https://waypoint.vercel.app"),
  description:
    "WayPoint provides intelligent travel suggestions, personalized itineraries, and seamless trip planning.",
  icons: {
    icon: [
      {
        url: "/Waypointlogo.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/Waypointlogo.png",
        sizes: "16x16",
        type: "image/png",
      }
    ],
    apple: [
      {
        url: "/Waypointlogo.png",
        sizes: "180x180",
        type: "image/png",
      }
    ],
    shortcut: ["/Waypointlogo.png"],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={montserrat.className}>
        {/* Auth -> Convex -> Cache */}
        <Providers>
          {/* UI-only providers */}
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Progress />
            <Analytics />
            <Toaster />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
