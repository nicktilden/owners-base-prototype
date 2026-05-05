import React from "react";
import { CapitalPlanningPrioritizationProjectList } from "@/components/tools/capitalPlanning/CapitalPlanningPrioritizationProjectList";
import type { CriteriaBuilderRow } from "@/components/tools/capitalPlanning/CriteriaBuilderDataTable";
import type { CapitalPlanningProgramPageVariant } from "@/components/tools/capitalPlanning/capitalPlanningColumnGroups";

export interface CapitalPlanningPrioritizationTabProps {
  criteriaRows: CriteriaBuilderRow[];
  criteriaValuesByProjectId: Record<string, Record<string, string>>;
  onCriteriaValueChange: (projectId: string, criterionId: string, value: string) => void;
  programPageVariant: CapitalPlanningProgramPageVariant;
}

export function CapitalPlanningPrioritizationTab({
  criteriaRows,
  criteriaValuesByProjectId,
  onCriteriaValueChange,
  programPageVariant,
}: CapitalPlanningPrioritizationTabProps) {
  return (
    <section aria-label="Program projects" style={{ minWidth: 0, width: "100%" }}>
      <CapitalPlanningPrioritizationProjectList
        criteriaRows={criteriaRows}
        criteriaValuesByProjectId={criteriaValuesByProjectId}
        onCriteriaValueChange={onCriteriaValueChange}
        programPageVariant={programPageVariant}
      />
    </section>
  );
}
