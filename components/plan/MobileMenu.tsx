"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/plan/Sidebar";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const MobileMenu = ({ isPublic }: { isPublic: boolean }) => {
  const [open, setOpen] = useState(false);
  const asideRef = useRef<HTMLDivElement>(null);
  const { planId } = useParams<{ planId: string }>();

  const handleClickOutside = (event: MouseEvent) => {
    if (asideRef.current && !asideRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <Button
        aria-label="open side menu"
        onClick={() => setOpen(!open)}
        variant="link"
        className="text-xl"
      >
        <AiOutlineMenu />
      </Button>
      <aside
        ref={asideRef}
        className={cn(
          "fixed top-0 left-0 z-[100] bg-background w-[50%] border-r-2 border-neutral-200 h-full ease-in-out duration-700",
          open ? "left-0" : "left-[-100%]",
          "flex flex-col gap-2 min-h-[100svh]"
        )}
      >
        <div className="flex justify-between p-2">
          <Link href="/">
            <div
              className="flex flex-col leading-5
                             font-bold text-md p-1"
            >
              <span>Travel</span>
              <span>
                Planner
                <span className="text-blue-500 ml-0.5">AI</span>
              </span>
            </div>
          </Link>
          <Button
            aria-label="close menu"
            onClick={() => setOpen(false)}
            variant="link"
            className="text-xl"
          >
            <AiOutlineClose />
          </Button>
        </div>

        <div
          className="px-5"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
          }}
        >
          <Sidebar planId={planId} isMobile isPublic={isPublic} />
        </div>
        <div className="p-5">
          <h2 className="mb-2 md:text-lg text-base font-semibold tracking-tight">
            Navigation
          </h2>
          <ul
            className="w-full flex flex-col gap-4 justify-center items-start
                      text-sm font-medium pt-1"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          >
            <li className="cursor-pointer hover:underline px-2">
              <Link
                href="/dashboard"
                className="flex gap-4 justify-end items-center"
              >
                <ArrowLeft className="w-4 h-4 group-hover:scale-125 transition-all duration-100 ease-linear" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li className="cursor-pointer hover:underline px-2">
              <Link
                href="/community-plans"
                className="flex gap-4 justify-end items-center"
              >
                <ArrowLeft className="w-4 h-4 group-hover:scale-125 transition-all duration-100 ease-linear" />
                <span>Community Plans</span>
              </Link>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
};

export default MobileMenu;
