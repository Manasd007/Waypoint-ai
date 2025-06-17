import {useConvexAuth} from "convex/react";
import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  const {isAuthenticated} = useConvexAuth();

  return (
    <div className="hidden md:flex gap-10 items-center justify-start flex-1">
      <Link href={isAuthenticated ? "/dashboard" : "/"}>
        <div className="flex gap-3 justify-center items-center min-w-[180px]">
          <Image
            src="/Waypointlogo.png"
            alt="WayPoint Logo"
            width={48}
            height={48}
            className="h-12 w-auto"
            priority
          />
          <div className="flex flex-col leading-[1.4] font-bold text-2xl whitespace-nowrap py-0.5">
            <span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
              WayPoint
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
