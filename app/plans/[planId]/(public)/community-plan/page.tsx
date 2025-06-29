import CommunityPlan from "@/components/plan/CommunityPlan";

export default async function CommunityPlanPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;

  return <CommunityPlan planId={planId} />;
}
