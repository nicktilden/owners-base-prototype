import React, { useCallback, useMemo, useState } from "react";
import { Button, MultiSelect, Search, Typography } from "@procore/core-react";
import styled from "styled-components";

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

interface FilterOption {
  id: string;
  label: string;
}

export interface CostFilterValues {
  stages: string[];
  programs: string[];
  states: string[];
}

const EMPTY_FILTERS: CostFilterValues = {
  stages: [],
  programs: [],
  states: [],
};

interface CostFiltersPanelProps {
  open: boolean;
  stageOptions: string[];
  programOptions: string[];
  stateOptions: string[];
  onApply: (filters: CostFilterValues) => void;
  onClear: () => void;
}

const getId = (opt: FilterOption) => opt.id;
const getLabel = (opt: FilterOption) => opt.label;

export default function CostFiltersPanel({
  open,
  stageOptions,
  programOptions,
  stateOptions,
  onApply,
  onClear,
}: CostFiltersPanelProps) {
  const [filters, setFilters] = useState<CostFilterValues>(EMPTY_FILTERS);
  const [filterSearch, setFilterSearch] = useState("");

  const stageOpts: FilterOption[] = useMemo(
    () => stageOptions.map((s) => ({ id: s, label: s })),
    [stageOptions]
  );
  const programOpts: FilterOption[] = useMemo(
    () => programOptions.map((p) => ({ id: p, label: p })),
    [programOptions]
  );
  const stateOpts: FilterOption[] = useMemo(
    () => stateOptions.map((s) => ({ id: s, label: s })),
    [stateOptions]
  );

  const selectedStages = useMemo(
    () => stageOpts.filter((o) => filters.stages.includes(o.id)),
    [stageOpts, filters.stages]
  );
  const selectedPrograms = useMemo(
    () => programOpts.filter((o) => filters.programs.includes(o.id)),
    [programOpts, filters.programs]
  );
  const selectedStates = useMemo(
    () => stateOpts.filter((o) => filters.states.includes(o.id)),
    [stateOpts, filters.states]
  );

  const handleClearAll = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setFilterSearch("");
    onClear();
  }, [onClear]);

  const handleApply = useCallback(() => {
    onApply(filters);
  }, [filters, onApply]);

  const allFilterGroups = [
    { key: "stage", label: "Stage" },
    { key: "program", label: "Program" },
    { key: "state", label: "State" },
  ];

  const visibleGroups = filterSearch
    ? allFilterGroups.filter((g) =>
        g.label.toLowerCase().includes(filterSearch.toLowerCase())
      )
    : allFilterGroups;

  const activeFilterCount = [
    filters.stages.length > 0,
    filters.programs.length > 0,
    filters.states.length > 0,
  ].filter(Boolean).length;

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
            Clear All Filters
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
              case "stage":
                return (
                  <FilterGroup key="stage">
                    <FilterLabel id="cost-filter-stage-label">Stage</FilterLabel>
                    <MultiSelect
                      options={stageOpts}
                      value={selectedStages}
                      onChange={(selected: FilterOption[]) =>
                        setFilters((prev) => ({
                          ...prev,
                          stages: selected.map((s) => s.id),
                        }))
                      }
                      getId={getId}
                      getLabel={getLabel}
                      placeholder="Select stages"
                      aria-labelledby="cost-filter-stage-label"
                      block
                    />
                  </FilterGroup>
                );

              case "program":
                return (
                  <FilterGroup key="program">
                    <FilterLabel id="cost-filter-program-label">Program</FilterLabel>
                    <MultiSelect
                      options={programOpts}
                      value={selectedPrograms}
                      onChange={(selected: FilterOption[]) =>
                        setFilters((prev) => ({
                          ...prev,
                          programs: selected.map((s) => s.id),
                        }))
                      }
                      getId={getId}
                      getLabel={getLabel}
                      placeholder="Select programs"
                      aria-labelledby="cost-filter-program-label"
                      block
                    />
                  </FilterGroup>
                );

              case "state":
                return (
                  <FilterGroup key="state">
                    <FilterLabel id="cost-filter-state-label">State</FilterLabel>
                    <MultiSelect
                      options={stateOpts}
                      value={selectedStates}
                      onChange={(selected: FilterOption[]) =>
                        setFilters((prev) => ({
                          ...prev,
                          states: selected.map((s) => s.id),
                        }))
                      }
                      getId={getId}
                      getLabel={getLabel}
                      placeholder="Select states"
                      aria-labelledby="cost-filter-state-label"
                      block
                    />
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
