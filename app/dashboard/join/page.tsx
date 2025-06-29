import { Suspense } from "react";
import JoinClient from "./JoinClient";

export default function JoinPage() {
  return (
    <Suspense fallback={<JoinLoadingFallback />}>
      <JoinClient />
    </Suspense>
  );
}

function JoinLoadingFallback() {
  return (
    <div className="w-full h-full flex flex-1 justify-center items-center">
      <div className="flex flex-col justify-center items-center gap-5 bg-muted rounded-full p-10 shadow-">
        <div className="w-[300px] h-[300px] bg-gray-200 rounded-lg animate-pulse" />
        <h2 className="text-foreground animate-pulse font-bold text-lg">
          Loading...
        </h2>
      </div>
    </div>
  );
}
