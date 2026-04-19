import React, { useCallback, useMemo, useState } from "react";
import { Button, MultiSelect, Search, Typography } from "@procore/core-react";
import styled from "styled-components";
import { PROJECT_STAGES, PROJECT_PROGRAMS } from "@/data/projects";

const PanelWrapper = styled.div<{ $open: boolean }>`
  width: ${({ $open }) => ($open ? "400px" : "0px")};
  min-width: ${({ $open }) => ($open ? "400px" : "0px")};
  overflow: hidden;
  transition: width 0.25s ease, min-width 0.25s ease;
  border-right: ${({ $open }) => ($open ? "1px solid var(--color-border-separator)" : "none")};
  display: flex;
  flex-direction: column;
  background: var(--color-surface-primary);
  height: 100%;
`;

const PanelInner = styled.div`
  display: flex;
  flex-direction: column;
  width: 400px;
  height: 100%;
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 8px 8px 16px;
  border-bottom: 1px solid var(--color-border-separator);
  flex-shrink: 0;
`;

const PanelSearchRow = styled.div`
  padding: 16px;
  border-bottom: 1px solid var(--color-border-separator);
  flex-shrink: 0;
`;

const PanelBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PanelFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 8px 16px;
  border-top: 1px solid var(--color-border-separator);
  flex-shrink: 0;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FilterLabel = styled.label`
  font-family: "Inter", system-ui, sans-serif;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.15px;
  color: var(--color-text-primary);
`;

const DateRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
`;

const DateField = styled.input`
  flex: 1;
  height: 36px;
  border: 1px solid var(--color-border-separator);
  border-radius: 4px;
  padding: 0 8px;
  font-size: 14px;
  font-family: "Inter", system-ui, sans-serif;
  color: var(--color-text-primary);
  outline: none;
  &:focus {
    border-color: var(--color-border-focus);
  }
`;

interface FilterOption {
  id: string;
  label: string;
}

export interface PortfolioFilterValues {
  programs: string[];
  stages: string[];
  priorities: string[];
  regions: string[];
  projectManagers: string[];
  cities: string[];
  states: string[];
  startDateFrom: string;
  startDateTo: string;
  endDateFrom: string;
  endDateTo: string;
}

export const EMPTY_PORTFOLIO_FILTERS: PortfolioFilterValues = {
  programs: [],
  stages: [],
  priorities: [],
  regions: [],
  projectManagers: [],
  cities: [],
  states: [],
  startDateFrom: "",
  startDateTo: "",
  endDateFrom: "",
  endDateTo: "",
};

interface PortfolioFiltersPanelProps {
  open: boolean;
  /** Distinct city values derived from current row data */
  cityOptions: string[];
  /** Distinct state values derived from current row data */
  stateOptions: string[];
  /** Distinct region values derived from current row data */
  regionOptions: string[];
  /** Distinct project manager names derived from current row data */
  projectManagerOptions: string[];
  onApply: (filters: PortfolioFilterValues) => void;
  onClear: () => void;
}

const PRIORITY_OPTIONS: FilterOption[] = [
  { id: "high",   label: "High"   },
  { id: "medium", label: "Medium" },
  { id: "low",    label: "Low"    },
];

const getId = (opt: FilterOption) => opt.id;
const getLabel = (opt: FilterOption) => opt.label;

const ALL_FILTER_GROUPS = [
  { key: "program",        label: "Program"         },
  { key: "stage",          label: "Stage"           },
  { key: "priority",       label: "Priority"        },
  { key: "region",         label: "Region"          },
  { key: "projectManager", label: "Project Manager" },
  { key: "city",           label: "City"            },
  { key: "state",          label: "State"           },
  { key: "startDate",      label: "Start Date"      },
  { key: "endDate",        label: "End Date"        },
];

export default function PortfolioFiltersPanel({
  open,
  cityOptions,
  stateOptions,
  regionOptions,
  projectManagerOptions,
  onApply,
  onClear,
}: PortfolioFiltersPanelProps) {
  const [filters, setFilters] = useState<PortfolioFilterValues>(EMPTY_PORTFOLIO_FILTERS);
  const [filterSearch, setFilterSearch] = useState("");

  const programOpts = useMemo(
    () => [...PROJECT_PROGRAMS].map((p) => ({ id: p, label: p })),
    []
  );
  const stageOpts = useMemo(
    () => [...PROJECT_STAGES].map((s) => ({ id: s, label: s })),
    []
  );
  const cityOpts = useMemo(
    () => cityOptions.map((c) => ({ id: c, label: c })),
    [cityOptions]
  );
  const stateOpts = useMemo(
    () => stateOptions.map((s) => ({ id: s, label: s })),
    [stateOptions]
  );
  const regionOpts = useMemo(
    () => regionOptions.map((r) => ({ id: r, label: r })),
    [regionOptions]
  );
  const pmOpts = useMemo(
    () => projectManagerOptions.map((p) => ({ id: p, label: p })),
    [projectManagerOptions]
  );

  // Derived selected sets
  const selectedPrograms       = useMemo(() => programOpts.filter((o) => filters.programs.includes(o.id)),         [programOpts, filters.programs]);
  const selectedStages         = useMemo(() => stageOpts.filter((o) => filters.stages.includes(o.id)),             [stageOpts, filters.stages]);
  const selectedPriorities     = useMemo(() => PRIORITY_OPTIONS.filter((o) => filters.priorities.includes(o.id)),  [filters.priorities]);
  const selectedRegions        = useMemo(() => regionOpts.filter((o) => filters.regions.includes(o.id)),           [regionOpts, filters.regions]);
  const selectedProjectManagers= useMemo(() => pmOpts.filter((o) => filters.projectManagers.includes(o.id)),       [pmOpts, filters.projectManagers]);
  const selectedCities         = useMemo(() => cityOpts.filter((o) => filters.cities.includes(o.id)),              [cityOpts, filters.cities]);
  const selectedStates         = useMemo(() => stateOpts.filter((o) => filters.states.includes(o.id)),             [stateOpts, filters.states]);

  const handleClearAll = useCallback(() => {
    setFilters(EMPTY_PORTFOLIO_FILTERS);
    setFilterSearch("");
    onClear();
  }, [onClear]);

  const handleApply = useCallback(() => {
    onApply(filters);
  }, [filters, onApply]);

  const visibleGroups = filterSearch
    ? ALL_FILTER_GROUPS.filter((g) =>
        g.label.toLowerCase().includes(filterSearch.toLowerCase())
      )
    : ALL_FILTER_GROUPS;

  const activeFilterCount = [
    filters.programs.length > 0,
    filters.stages.length > 0,
    filters.priorities.length > 0,
    filters.regions.length > 0,
    filters.projectManagers.length > 0,
    filters.cities.length > 0,
    filters.states.length > 0,
    !!(filters.startDateFrom || filters.startDateTo),
    !!(filters.endDateFrom || filters.endDateTo),
  ].filter(Boolean).length;

  const makeMulti = (
    key: string,
    label: string,
    labelId: string,
    opts: FilterOption[],
    selected: FilterOption[],
    field: keyof Pick<PortfolioFilterValues, "programs" | "stages" | "priorities" | "regions" | "projectManagers" | "cities" | "states">,
    placeholder: string
  ) => (
    <FilterGroup key={key}>
      <FilterLabel id={labelId}>{label}</FilterLabel>
      <MultiSelect
        options={opts}
        value={selected}
        onChange={(sel: FilterOption[]) =>
          setFilters((prev) => ({ ...prev, [field]: sel.map((s) => s.id) }))
        }
        getId={getId}
        getLabel={getLabel}
        placeholder={placeholder}
        aria-labelledby={labelId}
        block
      />
    </FilterGroup>
  );

  return (
    <PanelWrapper $open={open}>
      <PanelInner>
        <PanelHeader>
          <Typography
            intent="h3"
            style={{ flex: 1, fontSize: 16, fontWeight: 600, lineHeight: "24px", letterSpacing: "0.15px", color: "var(--color-text-primary)" }}
          >
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </Typography>
          <Button variant="tertiary" className="b_tertiary" onClick={handleClearAll}>
            Clear All
          </Button>
        </PanelHeader>

        <PanelSearchRow>
          <Search
            placeholder="Search filters"
            value={filterSearch}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterSearch(e.target.value)}
            onClear={() => setFilterSearch("")}
          />
        </PanelSearchRow>

        <PanelBody>
          {visibleGroups.map((group) => {
            switch (group.key) {
              case "program":
                return makeMulti("program", "Program", "filter-program-label", programOpts, selectedPrograms, "programs", "Select programs");
              case "stage":
                return makeMulti("stage", "Stage", "filter-stage-label", stageOpts, selectedStages, "stages", "Select stages");
              case "priority":
                return makeMulti("priority", "Priority", "filter-priority-label", PRIORITY_OPTIONS, selectedPriorities, "priorities", "Select priorities");
              case "region":
                return makeMulti("region", "Region", "filter-region-label", regionOpts, selectedRegions, "regions", "Select regions");
              case "projectManager":
                return makeMulti("projectManager", "Project Manager", "filter-pm-label", pmOpts, selectedProjectManagers, "projectManagers", "Select project managers");
              case "city":
                return makeMulti("city", "City", "filter-city-label", cityOpts, selectedCities, "cities", "Select cities");
              case "state":
                return makeMulti("state", "State", "filter-state-label", stateOpts, selectedStates, "states", "Select states");

              case "startDate":
                return (
                  <FilterGroup key="startDate">
                    <FilterLabel>Start Date</FilterLabel>
                    <DateRow>
                      <DateField
                        type="date"
                        value={filters.startDateFrom}
                        onChange={(e) => setFilters((prev) => ({ ...prev, startDateFrom: e.target.value }))}
                        placeholder="From"
                      />
                      <DateField
                        type="date"
                        value={filters.startDateTo}
                        onChange={(e) => setFilters((prev) => ({ ...prev, startDateTo: e.target.value }))}
                        placeholder="To"
                      />
                    </DateRow>
                  </FilterGroup>
                );

              case "endDate":
                return (
                  <FilterGroup key="endDate">
                    <FilterLabel>End Date</FilterLabel>
                    <DateRow>
                      <DateField
                        type="date"
                        value={filters.endDateFrom}
                        onChange={(e) => setFilters((prev) => ({ ...prev, endDateFrom: e.target.value }))}
                        placeholder="From"
                      />
                      <DateField
                        type="date"
                        value={filters.endDateTo}
                        onChange={(e) => setFilters((prev) => ({ ...prev, endDateTo: e.target.value }))}
                        placeholder="To"
                      />
                    </DateRow>
                  </FilterGroup>
                );

              default:
                return null;
            }
          })}
        </PanelBody>

        <PanelFooter>
          <Button variant="primary" onClick={handleApply}>
            Apply
          </Button>
        </PanelFooter>
      </PanelInner>
    </PanelWrapper>
  );
}
