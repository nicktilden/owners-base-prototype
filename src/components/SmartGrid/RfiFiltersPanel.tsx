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

export interface RfiFilterValues {
  projects: string[];
  statuses: string[];
  rfiManagers: string[];
  contractors: string[];
  ballInCourt: string[];
}

const EMPTY_FILTERS: RfiFilterValues = {
  projects: [],
  statuses: [],
  rfiManagers: [],
  contractors: [],
  ballInCourt: [],
};

interface RfiFiltersPanelProps {
  open: boolean;
  isPortfolio: boolean;
  projectOptions: string[];
  statusOptions: string[];
  rfiManagerOptions: string[];
  contractorOptions: string[];
  ballInCourtOptions: string[];
  onApply: (filters: RfiFilterValues) => void;
  onClear: () => void;
}

const getId = (opt: FilterOption) => opt.id;
const getLabel = (opt: FilterOption) => opt.label;

export default function RfiFiltersPanel({
  open,
  isPortfolio,
  projectOptions,
  statusOptions,
  rfiManagerOptions,
  contractorOptions,
  ballInCourtOptions,
  onApply,
  onClear,
}: RfiFiltersPanelProps) {
  const [filters, setFilters] = useState<RfiFilterValues>(EMPTY_FILTERS);
  const [filterSearch, setFilterSearch] = useState("");

  const projectOpts: FilterOption[] = useMemo(
    () => projectOptions.map((s) => ({ id: s, label: s })),
    [projectOptions]
  );
  const statusOpts: FilterOption[] = useMemo(
    () => statusOptions.map((s) => ({ id: s, label: s })),
    [statusOptions]
  );
  const managerOpts: FilterOption[] = useMemo(
    () => rfiManagerOptions.map((s) => ({ id: s, label: s })),
    [rfiManagerOptions]
  );
  const contractorOpts: FilterOption[] = useMemo(
    () => contractorOptions.map((s) => ({ id: s, label: s })),
    [contractorOptions]
  );
  const bicOpts: FilterOption[] = useMemo(
    () => ballInCourtOptions.map((s) => ({ id: s, label: s })),
    [ballInCourtOptions]
  );

  const selectedProjects = useMemo(
    () => projectOpts.filter((o) => filters.projects.includes(o.id)),
    [projectOpts, filters.projects]
  );
  const selectedStatuses = useMemo(
    () => statusOpts.filter((o) => filters.statuses.includes(o.id)),
    [statusOpts, filters.statuses]
  );
  const selectedManagers = useMemo(
    () => managerOpts.filter((o) => filters.rfiManagers.includes(o.id)),
    [managerOpts, filters.rfiManagers]
  );
  const selectedContractors = useMemo(
    () => contractorOpts.filter((o) => filters.contractors.includes(o.id)),
    [contractorOpts, filters.contractors]
  );
  const selectedBic = useMemo(
    () => bicOpts.filter((o) => filters.ballInCourt.includes(o.id)),
    [bicOpts, filters.ballInCourt]
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
    { key: "status", label: "Status" },
    { key: "rfiManager", label: "RFI Manager" },
    { key: "contractor", label: "Responsible Contractor" },
    { key: "ballInCourt", label: "Ball In Court" },
  ];

  const visibleGroups = filterSearch
    ? allFilterGroups.filter((g) =>
        g.label.toLowerCase().includes(filterSearch.toLowerCase())
      )
    : allFilterGroups;

  const activeFilterCount = [
    filters.projects.length > 0,
    filters.statuses.length > 0,
    filters.rfiManagers.length > 0,
    filters.contractors.length > 0,
    filters.ballInCourt.length > 0,
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
                    <FilterLabel id="rfi-filter-project-label">Project</FilterLabel>
                    <MultiSelect
                      options={projectOpts}
                      value={selectedProjects}
                      onChange={(selected: FilterOption[]) =>
                        setFilters((prev) => ({ ...prev, projects: selected.map((s) => s.id) }))
                      }
                      getId={getId}
                      getLabel={getLabel}
                      placeholder="Select projects"
                      aria-labelledby="rfi-filter-project-label"
                      block
                    />
                  </FilterGroup>
                );
              case "status":
                return (
                  <FilterGroup key="status">
                    <FilterLabel id="rfi-filter-status-label">Status</FilterLabel>
                    <MultiSelect
                      options={statusOpts}
                      value={selectedStatuses}
                      onChange={(selected: FilterOption[]) =>
                        setFilters((prev) => ({ ...prev, statuses: selected.map((s) => s.id) }))
                      }
                      getId={getId}
                      getLabel={getLabel}
                      placeholder="Select statuses"
                      aria-labelledby="rfi-filter-status-label"
                      block
                    />
                  </FilterGroup>
                );
              case "rfiManager":
                return (
                  <FilterGroup key="rfiManager">
                    <FilterLabel id="rfi-filter-manager-label">RFI Manager</FilterLabel>
                    <MultiSelect
                      options={managerOpts}
                      value={selectedManagers}
                      onChange={(selected: FilterOption[]) =>
                        setFilters((prev) => ({ ...prev, rfiManagers: selected.map((s) => s.id) }))
                      }
                      getId={getId}
                      getLabel={getLabel}
                      placeholder="Select managers"
                      aria-labelledby="rfi-filter-manager-label"
                      block
                    />
                  </FilterGroup>
                );
              case "contractor":
                return (
                  <FilterGroup key="contractor">
                    <FilterLabel id="rfi-filter-contractor-label">Responsible Contractor</FilterLabel>
                    <MultiSelect
                      options={contractorOpts}
                      value={selectedContractors}
                      onChange={(selected: FilterOption[]) =>
                        setFilters((prev) => ({ ...prev, contractors: selected.map((s) => s.id) }))
                      }
                      getId={getId}
                      getLabel={getLabel}
                      placeholder="Select contractors"
                      aria-labelledby="rfi-filter-contractor-label"
                      block
                    />
                  </FilterGroup>
                );
              case "ballInCourt":
                return (
                  <FilterGroup key="ballInCourt">
                    <FilterLabel id="rfi-filter-bic-label">Ball In Court</FilterLabel>
                    <MultiSelect
                      options={bicOpts}
                      value={selectedBic}
                      onChange={(selected: FilterOption[]) =>
                        setFilters((prev) => ({ ...prev, ballInCourt: selected.map((s) => s.id) }))
                      }
                      getId={getId}
                      getLabel={getLabel}
                      placeholder="Select people"
                      aria-labelledby="rfi-filter-bic-label"
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
