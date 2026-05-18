import React, { useCallback } from "react";
import { useRouter } from "next/router";
import { Button } from "@procore/core-react";
import { ExternalLink } from "@procore/core-icons";
import HubCardFrame from "@/components/hubs/HubCardFrame";
import { CapitalPlanningProgramSummaryCards } from "@/components/tools/capitalPlanning/CapitalPlanningProgramSummaryCards";
import type { CapitalPlanningProgramSummaryMetrics } from "@/components/tools/capitalPlanning/capitalPlanningProgramSummaryMetrics";

const CAPITAL_PLAN_TOOLTIP =
  "Roll-up for visible capital plan rows: Planned Amount; Original and Revised budgets (sums where those values exist); Job to Date Costs; Forecast to Complete (budget envelope less job-to-date per row); Estimated Cost at Completion (sum of envelopes — revised, else original, else planned); Remaining to Forecast (planned dollars above the row envelope). Filter changes in the plan grid below update these totals.";

export interface CapitalPlanSummaryHubCardProps {
  metrics: CapitalPlanningProgramSummaryMetrics;
}

export default function CapitalPlanSummaryHubCard({
  metrics,
}: CapitalPlanSummaryHubCardProps): React.ReactElement {
  const router = useRouter();

  const openStandalonePlan = useCallback(() => {
    void router.push("/portfolio/capital-planning");
  }, [router]);

  return (
    <HubCardFrame
      title="Capital Plan Summary"
      infoTooltip={CAPITAL_PLAN_TOOLTIP}
      actions={
        <Button
          type="button"
          variant="tertiary"
          size="sm"
          className="b_tertiary"
          aria-label="Open capital plan in full page"
          onClick={openStandalonePlan}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Open Plan
            <ExternalLink size="sm" aria-hidden />
          </span>
        </Button>
      }
      style={{ minHeight: "unset", maxHeight: "none" }}
      contentStyle={{ paddingTop: 16, paddingBottom: 16 }}
    >
      <CapitalPlanningProgramSummaryCards metrics={metrics} omitHeader compact />
    </HubCardFrame>
  );
}
