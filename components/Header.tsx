"use client";

import Link from "next/link";
import { AuthLoading, Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";

import { Loading } from "@/components/shared/Loading";
import MobileMenu from "@/components/MobileMenu";
import PlanComboBox from "@/components/plan/PlanComboBox";
import { navlinks } from "@/lib/constants";
import { cn } from "@/lib/utils";
import useAuth from "@/hooks/useAuth";
import { ThemeDropdown } from "@/components/ThemeDropdown";
import FeedbackSheet from "@/components/common/FeedbackSheet";
import { CreditsDrawerWithDialog } from "@/components/shared/DrawerWithDialogGeneric";

const Header = () => {
  const { isCurrentPathDashboard, isCurrentPathHome, isAuthenticated } =
    useAuth();

  return (
    <header
      className={cn(
        "w-full border-b bottom-2 border-border/40 z-50 sticky top-0",
        "bg-background backdrop-blur supports-[backdrop-filter]:bg-background/60",
        isCurrentPathHome && "sticky top-0"
      )}
    >
      <nav className="lg:px-20 px-5 py-3 mx-auto">
        <div className="flex justify-evenly w-full">
          <div className="hidden md:flex gap-10 items-center justify-start flex-1">
            <Link href={isAuthenticated ? "/dashboard" : "/"}>
              <div className="flex gap-1 justify-center items-center">
                <Image
                  src="/waypointlogo.png"
                  alt="Waypoint Logo"
                  width={40}
                  height={40}
                  className="h-10 w-10"
                />
                <span className="font-bold text-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-transparent bg-clip-text">
                  WayPoint
                </span>
              </div>
            </Link>
          </div>
          <div className="hidden md:flex items-center flex-1 justify-center">
            <ul className="flex gap-8 items-center text-sm">
              {isCurrentPathHome && (
                <>
                  {navlinks.map((link) => (
                    <li
                      key={link.id}
                      className="hover:underline cursor-pointer"
                    >
                      <Link href={`/#${link.id}`}>{link.text}</Link>
                    </li>
                  ))}
                  <li className="hover:underline cursor-pointer">
                    <Link href="dashboard" scroll>
                      Dashboard
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
          <div className="md:hidden flex gap-6 flex-1">
            <MobileMenu
              isCurrentPathHome={isCurrentPathHome}
              isCurrentPathDashboard={isCurrentPathDashboard}
              isAuthenticated={isAuthenticated}
            />
          </div>
          <div className="flex gap-4 justify-end items-center flex-1">
            <AuthLoading>
              <Loading />
            </AuthLoading>
            <Unauthenticated>
              <ThemeDropdown />
              <SignInButton mode="modal" />
            </Unauthenticated>
            <Authenticated>
              <div className="flex justify-center items-center gap-2">
                {!isCurrentPathDashboard && !isCurrentPathHome && (
                  <PlanComboBox />
                )}
                <CreditsDrawerWithDialog />
                <FeedbackSheet />
                <ThemeDropdown />
                <UserButton afterSignOutUrl="/" />
              </div>
            </Authenticated>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
