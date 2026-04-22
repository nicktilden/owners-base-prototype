import React, { useCallback, useMemo, useState, type ChangeEvent } from "react";
import { Button, Pill, Search, Select, ToggleButton } from "@procore/core-react";
import { Clear, Filter } from "@procore/core-icons";
import styled from "styled-components";
import { CapitalPlanningSmartGrid } from "@/components/tools/capitalPlanning/CapitalPlanningSmartGrid";
import type { CapitalPlanningColumnVisibility } from "@/components/tools/capitalPlanning/capitalPlanningColumnGroups";
import type {
  CapitalPlanningRegion,
  CapitalPlanningSampleRow,
  ProjectCurve,
  ProjectPriority,
  ProjectStatus,
} from "@/components/tools/capitalPlanning/capitalPlanningData";
import {
  assignedCapitalPlanningRegion,
  CAPITAL_PLANNING_REGIONS,
  PRIORITY_OPTIONS,
  PROJECT_STATUS_OPTIONS,
  prototypeProjectDescriptionFromName,
  SAMPLE_PROJECT_ROWS,
  STATUS_PILL_COLOR,
  withConceptBudgetColumnsCleared,
  withZeroPlannedAmountDatesCleared,
} from "@/components/tools/capitalPlanning/capitalPlanningData";
import type { CriteriaBuilderRow } from "@/components/tools/capitalPlanning/CriteriaBuilderDataTable";
import { criteriaBuilderRowsToGridColumns } from "@/components/tools/capitalPlanning/capitalPlanningCriteriaGridColumns";

/** Prioritization: project, description, estimated budget, prioritization status, criteria columns (no stage or baseline prioritization score). */
const PRIORITIZATION_COLUMN_VISIBILITY: CapitalPlanningColumnVisibility = {
  projectDescription: true,
  estimatedBudget: true,
  prioritizationStatus: true,
  plannedAmount: false,
  status: false,
  projectPriority: false,
  prioritizationScore: false,
  originalBudget: false,
  revisedBudget: false,
  jobToDate: false,
  startDate: false,
  endDate: false,
  curve: false,
  remaining: false,
  forecast: false,
};

const noopPlannedAmountSave = (_rowId: string, _plannedAmount: number) => {};

function toggleIncluded<T extends string>(current: readonly T[], value: T): T[] {
  return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
}

/** Same panel chrome as {@link CapitalPlanningContent} filters (Procore Data Table side panel). */
const PrioritizationFilterSidePanel = styled.aside`
  width: 340px;
  flex: 0 0 340px;
  flex-shrink: 0;
  border: 1px solid var(--color-border-separator);
  background: var(--color-surface-primary);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
`;

const FilterPanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-separator);
`;

const FilterPanelTitle = styled.span`
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const FilterPanelHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FilterPanelBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
`;

const FilterFieldSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FilterFieldLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

export interface CapitalPlanningPrioritizationProjectListProps {
  criteriaRows: CriteriaBuilderRow[];
  criteriaValuesByProjectId: Record<string, Record<string, string>>;
  onCriteriaValueChange: (projectId: string, criterionId: string, value: string) => void;
}

/**
 * Portfolio project grid for Prioritization — same interaction patterns as Capital Planning where columns exist;
 * forecast / budget / planned amount columns are hidden. Criteria Builder rows become extra columns.
 */
export function CapitalPlanningPrioritizationProjectList({
  criteriaRows,
  criteriaValuesByProjectId,
  onCriteriaValueChange,
}: CapitalPlanningPrioritizationProjectListProps) {
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ProjectStatus[]>([]);
  const [filterPriority, setFilterPriority] = useState<ProjectPriority[]>([]);
  const [filterRegions, setFilterRegions] = useState<CapitalPlanningRegion[]>([]);

  const [columnVisibility] = useState<CapitalPlanningColumnVisibility>(() => ({ ...PRIORITIZATION_COLUMN_VISIBILITY }));
  const [tableRowHeight] = useState<"sm" | "md" | "lg">("sm");
  const [, setRowDatesById] = useState<Record<string, { startDate: string; endDate: string }>>({});
  const [, setCurvesByRowId] = useState<Record<string, ProjectCurve>>({});
  const [plannedAmountSourceByRowId, setPlannedAmountSourceByRowId] = useState<Record<string, string>>({});
  const [plannedAmountManualByRowId, setPlannedAmountManualByRowId] = useState<Record<string, number>>({});
  const [estimatedBudgetByRowId, setEstimatedBudgetByRowId] = useState<Record<string, number>>({});
  const [prioritizationStatusByRowId, setPrioritizationStatusByRowId] = useState<Record<string, string>>({});

  const criteriaColumns = useMemo(() => criteriaBuilderRowsToGridColumns(criteriaRows), [criteriaRows]);

  const projectRows = useMemo(
    (): CapitalPlanningSampleRow[] =>
      SAMPLE_PROJECT_ROWS.map((r) => withZeroPlannedAmountDatesCleared(withConceptBudgetColumnsCleared({ ...r }))),
    []
  );

  const filterPanelHasActiveSelections =
    filterStatus.length > 0 || filterPriority.length > 0 || filterRegions.length > 0;

  const clearFilterPanel = useCallback(() => {
    setFilterStatus([]);
    setFilterPriority([]);
    setFilterRegions([]);
  }, []);

  const filteredProjectRows = useMemo((): CapitalPlanningSampleRow[] => {
    const q = search.trim().toLowerCase();
    let rows = projectRows;
    if (q) {
      rows = rows.filter(
        (r) =>
          r.project.toLowerCase().includes(q) ||
          prototypeProjectDescriptionFromName(r.project).toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q) ||
          r.priority.toLowerCase().includes(q)
      );
    }
    if (filterStatus.length > 0) {
      rows = rows.filter((r) => filterStatus.includes(r.status));
    }
    if (filterPriority.length > 0) {
      rows = rows.filter((r) => filterPriority.includes(r.priority));
    }
    if (filterRegions.length > 0) {
      rows = rows.filter((r) => filterRegions.includes(assignedCapitalPlanningRegion(r.id)));
    }
    return rows;
  }, [projectRows, search, filterStatus, filterPriority, filterRegions]);

  return (
    <div
      className="capital-planning-tool-section"
      style={{
        minWidth: 0,
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      <div className="capital-planning-toolbar-stack" style={{ marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              minWidth: 0,
              width: "100%",
            }}
          >
            <div style={{ width: 280, maxWidth: "100%", minWidth: 0 }}>
              <Search
                placeholder="Search projects"
                value={search}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              />
            </div>
            <ToggleButton
              selected={filterOpen}
              icon={<Filter />}
              onClick={() => setFilterOpen((v) => !v)}
            >
              Filter
            </ToggleButton>
            {filterStatus.includes("Concept") ? (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 2,
                  flexShrink: 0,
                }}
              >
                <Pill color={STATUS_PILL_COLOR.Concept} style={{ flexShrink: 0 }}>
                  Concept projects
                </Pill>
                <Button
                  type="button"
                  variant="tertiary"
                  className="b_tertiary"
                  size="sm"
                  icon={<Clear />}
                  aria-label="Remove Concept from status filter"
                  onClick={() => setFilterStatus((prev) => prev.filter((s) => s !== "Concept"))}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div
        className="capital-planning-main-with-filter"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          gap: 16,
          minWidth: 0,
          width: "100%",
        }}
      >
        {filterOpen ? (
          <PrioritizationFilterSidePanel className="capital-planning-filter-panel">
            <FilterPanelHeader>
              <FilterPanelTitle>Filters</FilterPanelTitle>
              <FilterPanelHeaderActions>
                {filterPanelHasActiveSelections ? (
                  <Button variant="tertiary" className="b_tertiary" size="md" onClick={clearFilterPanel}>
                    Clear All
                  </Button>
                ) : null}
                <Button
                  variant="tertiary"
                  className="b_tertiary"
                  icon={<Clear />}
                  onClick={() => setFilterOpen(false)}
                  aria-label="Close filters"
                />
              </FilterPanelHeaderActions>
            </FilterPanelHeader>
            <FilterPanelBody>
              <FilterFieldSection>
                <FilterFieldLabel htmlFor="prioritization-filter-status">Status</FilterFieldLabel>
                <Select
                  id="prioritization-filter-status"
                  placeholder="Select values"
                  label={filterStatus.length ? `${filterStatus.length} selected` : undefined}
                  onSelect={(s) => {
                    if (s.action !== "selected") return;
                    setFilterStatus((prev) => toggleIncluded(prev, s.item as ProjectStatus));
                  }}
                  onClear={() => setFilterStatus([])}
                  block
                >
                  {PROJECT_STATUS_OPTIONS.map((v) => (
                    <Select.Option key={v} value={v} selected={filterStatus.includes(v)}>
                      {v}
                    </Select.Option>
                  ))}
                </Select>
              </FilterFieldSection>
              <FilterFieldSection>
                <FilterFieldLabel htmlFor="prioritization-filter-priority">Priority</FilterFieldLabel>
                <Select
                  id="prioritization-filter-priority"
                  placeholder="Select values"
                  label={filterPriority.length ? `${filterPriority.length} selected` : undefined}
                  onSelect={(s) => {
                    if (s.action !== "selected") return;
                    setFilterPriority((prev) => toggleIncluded(prev, s.item as ProjectPriority));
                  }}
                  onClear={() => setFilterPriority([])}
                  block
                >
                  {PRIORITY_OPTIONS.map((v) => (
                    <Select.Option key={v} value={v} selected={filterPriority.includes(v)}>
                      {v}
                    </Select.Option>
                  ))}
                </Select>
              </FilterFieldSection>
              <FilterFieldSection>
                <FilterFieldLabel htmlFor="prioritization-filter-region">Region</FilterFieldLabel>
                <Select
                  id="prioritization-filter-region"
                  placeholder="Select values"
                  label={filterRegions.length ? `${filterRegions.length} selected` : undefined}
                  onSelect={(s) => {
                    if (s.action !== "selected") return;
                    setFilterRegions((prev) => toggleIncluded(prev, s.item as CapitalPlanningRegion));
                  }}
                  onClear={() => setFilterRegions([])}
                  block
                >
                  {CAPITAL_PLANNING_REGIONS.map((v) => (
                    <Select.Option key={v} value={v} selected={filterRegions.includes(v)}>
                      {v}
                    </Select.Option>
                  ))}
                </Select>
              </FilterFieldSection>
            </FilterPanelBody>
          </PrioritizationFilterSidePanel>
        ) : null}
        <div
          data-tab-scroll-root
          className="capital-planning-table-scroll-region"
          style={{
            minWidth: 0,
            width: "100%",
            maxWidth: "100%",
            flex: "1 1 auto",
          }}
        >
          <CapitalPlanningSmartGrid
            columnVisibility={columnVisibility}
            rowHeight={tableRowHeight}
            configShowEmpty={true}
            search={search}
            filteredProjectRows={filteredProjectRows}
            plannedAmountSourceByRowId={plannedAmountSourceByRowId}
            setPlannedAmountSourceByRowId={setPlannedAmountSourceByRowId}
            plannedAmountManualByRowId={plannedAmountManualByRowId}
            setPlannedAmountManualByRowId={setPlannedAmountManualByRowId}
            setRowDatesById={setRowDatesById}
            setCurvesByRowId={setCurvesByRowId}
            forecastGranularity="quarter"
            planView="grid"
            onSaveHighLevelBudgetPlannedAmount={noopPlannedAmountSave}
            groupBy={null}
            criteriaColumns={criteriaColumns}
            criteriaValuesByProjectId={criteriaValuesByProjectId}
            onCriteriaValueChange={onCriteriaValueChange}
            showPrioritizationScoreColumn
            titleCaseHeaders
            estimatedBudgetByRowId={estimatedBudgetByRowId}
            setEstimatedBudgetByRowId={setEstimatedBudgetByRowId}
            prioritizationStatusByRowId={prioritizationStatusByRowId}
            setPrioritizationStatusByRowId={setPrioritizationStatusByRowId}
          />
        </div>
      </div>
    </div>
  );
}
