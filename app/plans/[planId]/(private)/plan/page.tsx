import Plan from "@/components/plan/Plan";

export default async function PlanPage({
  params: paramsP,
  searchParams: searchP,
}: {
  params: Promise<{ planId: string }>;
  searchParams: Promise<{ isNewPlan?: string }>;
}) {
  // Unwrap the promises
  const { planId } = await paramsP;
  const { isNewPlan } = await searchP;

  const isNew = Boolean(isNewPlan);

  return <Plan planId={planId} isNewPlan={isNew} isPublic={false} />;
}
