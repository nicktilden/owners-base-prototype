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

export interface AssetFilterValues {
  projects: string[];
  types: string[];
  trades: string[];
  statuses: string[];
  conditions: string[];
}

const EMPTY_FILTERS: AssetFilterValues = {
  projects: [],
  types: [],
  trades: [],
  statuses: [],
  conditions: [],
};

interface AssetFiltersPanelProps {
  open: boolean;
  isPortfolio: boolean;
  projectOptions: string[];
  typeOptions: string[];
  tradeOptions: string[];
  statusOptions: string[];
  conditionOptions: string[];
  onApply: (filters: AssetFilterValues) => void;
  onClear: () => void;
}

const getId = (opt: FilterOption) => opt.id;
const getLabel = (opt: FilterOption) => opt.label;

export default function AssetFiltersPanel({
  open,
  isPortfolio,
  projectOptions,
  typeOptions,
  tradeOptions,
  statusOptions,
  conditionOptions,
  onApply,
  onClear,
}: AssetFiltersPanelProps) {
  const [filters, setFilters] = useState<AssetFilterValues>(EMPTY_FILTERS);
  const [filterSearch, setFilterSearch] = useState("");

  const projectOpts: FilterOption[] = useMemo(
    () => projectOptions.map((s) => ({ id: s, label: s })),
    [projectOptions]
  );
  const typeOpts: FilterOption[] = useMemo(
    () => typeOptions.map((s) => ({ id: s, label: s })),
    [typeOptions]
  );
  const tradeOpts: FilterOption[] = useMemo(
    () => tradeOptions.map((s) => ({ id: s, label: s })),
    [tradeOptions]
  );
  const statusOpts: FilterOption[] = useMemo(
    () => statusOptions.map((s) => ({ id: s, label: s })),
    [statusOptions]
  );
  const conditionOpts: FilterOption[] = useMemo(
    () => conditionOptions.map((s) => ({ id: s, label: s })),
    [conditionOptions]
  );

  const selectedProjects = useMemo(
    () => projectOpts.filter((o) => filters.projects.includes(o.id)),
    [projectOpts, filters.projects]
  );
  const selectedTypes = useMemo(
    () => typeOpts.filter((o) => filters.types.includes(o.id)),
    [typeOpts, filters.types]
  );
  const selectedTrades = useMemo(
    () => tradeOpts.filter((o) => filters.trades.includes(o.id)),
    [tradeOpts, filters.trades]
  );
  const selectedStatuses = useMemo(
    () => statusOpts.filter((o) => filters.statuses.includes(o.id)),
    [statusOpts, filters.statuses]
  );
  const selectedConditions = useMemo(
    () => conditionOpts.filter((o) => filters.conditions.includes(o.id)),
    [conditionOpts, filters.conditions]
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
    ...(isPortfolio ? [{ key: "project", label: "Project" }] : []),
    { key: "type", label: "Type" },
    { key: "trade", label: "Trade" },
    { key: "status", label: "Status" },
    { key: "condition", label: "Condition" },
  ];

  const visibleGroups = filterSearch
    ? allFilterGroups.filter((g) =>
        g.label.toLowerCase().includes(filterSearch.toLowerCase())
      )
    : allFilterGroups;

  const activeFilterCount = [
    filters.projects.length > 0,
    filters.types.length > 0,
    filters.trades.length > 0,
    filters.statuses.length > 0,
    filters.conditions.length > 0,
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
              case "project":
                return (
                  <FilterGroup key="project">
                    <FilterLabel id="asset-filter-project-label">Project</FilterLabel>
                    <MultiSelect
                      options={projectOpts}
                      value={selectedProjects}
                      onChange={(selected: FilterOption[]) =>
                        setFilters((prev) => ({
                          ...prev,
                          projects: selected.map((s) => s.id),
                        }))
                      }
                      getId={getId}
                      getLabel={getLabel}
                      placeholder="Select projects"
                      aria-labelledby="asset-filter-project-label"
                      block
                    />
                  </FilterGroup>
                );

              case "type":
                return (
                  <FilterGroup key="type">
                    <FilterLabel id="asset-filter-type-label">Type</FilterLabel>
                    <MultiSelect
                      options={typeOpts}
                      value={selectedTypes}
                      onChange={(selected: FilterOption[]) =>
                        setFilters((prev) => ({
                          ...prev,
                          types: selected.map((s) => s.id),
                        }))
                      }
                      getId={getId}
                      getLabel={getLabel}
                      placeholder="Select types"
                      aria-labelledby="asset-filter-type-label"
                      block
                    />
                  </FilterGroup>
                );

              case "trade":
                return (
                  <FilterGroup key="trade">
                    <FilterLabel id="asset-filter-trade-label">Trade</FilterLabel>
                    <MultiSelect
                      options={tradeOpts}
                      value={selectedTrades}
                      onChange={(selected: FilterOption[]) =>
                        setFilters((prev) => ({
                          ...prev,
                          trades: selected.map((s) => s.id),
                        }))
                      }
                      getId={getId}
                      getLabel={getLabel}
                      placeholder="Select trades"
                      aria-labelledby="asset-filter-trade-label"
                      block
                    />
                  </FilterGroup>
                );

              case "status":
                return (
                  <FilterGroup key="status">
                    <FilterLabel id="asset-filter-status-label">Status</FilterLabel>
                    <MultiSelect
                      options={statusOpts}
                      value={selectedStatuses}
                      onChange={(selected: FilterOption[]) =>
                        setFilters((prev) => ({
                          ...prev,
                          statuses: selected.map((s) => s.id),
                        }))
                      }
                      getId={getId}
                      getLabel={getLabel}
                      placeholder="Select statuses"
                      aria-labelledby="asset-filter-status-label"
                      block
                    />
                  </FilterGroup>
                );

              case "condition":
                return (
                  <FilterGroup key="condition">
                    <FilterLabel id="asset-filter-condition-label">Condition</FilterLabel>
                    <MultiSelect
                      options={conditionOpts}
                      value={selectedConditions}
                      onChange={(selected: FilterOption[]) =>
                        setFilters((prev) => ({
                          ...prev,
                          conditions: selected.map((s) => s.id),
                        }))
                      }
                      getId={getId}
                      getLabel={getLabel}
                      placeholder="Select conditions"
                      aria-labelledby="asset-filter-condition-label"
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
