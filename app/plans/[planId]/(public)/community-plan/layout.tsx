import {getAuthToken} from "@/app/auth";
import Header from "@/components/plan/Header";
import PlanLayoutContent from "@/components/plan/PlanLayoutContent";
import {api} from "@/convex/_generated/api";
import {Id} from "@/convex/_generated/dataModel";
import {fetchQuery} from "convex/nextjs";
import {Metadata} from "next";

export async function generateMetadata(
  {
    params,
  }: {
    params: Promise<{ planId: string }>;
  }
): Promise<Metadata> {
  const { planId } = await params;
  
  if (!planId || typeof planId !== 'string') {
    return {
      title: "Plan Not Found!",
    };
  }
  
  const token = await getAuthToken();

  try {
    const plan = await fetchQuery(
      api.plan.getSinglePlan,
      {id: planId as Id<"plan">, isPublic: true},
      {token: token ?? undefined}
    );
    return {
      title: plan ? plan.nameoftheplace : "Community Plan",
    };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return {
      title: "Plan Not Found!",
    };
  }
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{planId: string}>;
}) {
  const { planId } = await params;
  
  return (
    <>
      <Header isPublic={true} />
      <main className="flex min-h-[calc(100svh-4rem)] flex-col items-center bg-blue-50/40 dark:bg-background">
        <PlanLayoutContent planId={planId} isPublic={true}>
          {children}
        </PlanLayoutContent>
      </main>
    </>
  );
}
