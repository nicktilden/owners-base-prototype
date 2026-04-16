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

export interface TaskFilterValues {
  projects: string[];
  statuses: string[];
  categories: string[];
}

const EMPTY_FILTERS: TaskFilterValues = {
  projects: [],
  statuses: [],
  categories: [],
};

interface TaskFiltersPanelProps {
  open: boolean;
  isPortfolio: boolean;
  projectOptions: FilterOption[];
  statusOptions: FilterOption[];
  categoryOptions: FilterOption[];
  onApply: (filters: TaskFilterValues) => void;
  onClear: () => void;
}

const getId = (opt: FilterOption) => opt.id;
const getLabel = (opt: FilterOption) => opt.label;

export default function TaskFiltersPanel({
  open,
  isPortfolio,
  projectOptions,
  statusOptions,
  categoryOptions,
  onApply,
  onClear,
}: TaskFiltersPanelProps) {
  const [filters, setFilters] = useState<TaskFilterValues>(EMPTY_FILTERS);
  const [filterSearch, setFilterSearch] = useState("");

  const selectedProjects = useMemo(
    () => projectOptions.filter((o) => filters.projects.includes(o.id)),
    [projectOptions, filters.projects]
  );
  const selectedStatuses = useMemo(
    () => statusOptions.filter((o) => filters.statuses.includes(o.id)),
    [statusOptions, filters.statuses]
  );
  const selectedCategories = useMemo(
    () => categoryOptions.filter((o) => filters.categories.includes(o.id)),
    [categoryOptions, filters.categories]
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
    { key: "category", label: "Category" },
  ];

  const visibleGroups = filterSearch
    ? allFilterGroups.filter((g) =>
        g.label.toLowerCase().includes(filterSearch.toLowerCase())
      )
    : allFilterGroups;

  const activeFilterCount = [
    filters.projects.length > 0,
    filters.statuses.length > 0,
    filters.categories.length > 0,
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
                    <FilterLabel id="task-filter-project-label">Project</FilterLabel>
                    <MultiSelect
                      options={projectOptions}
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
                      aria-labelledby="task-filter-project-label"
                      block
                    />
                  </FilterGroup>
                );

              case "status":
                return (
                  <FilterGroup key="status">
                    <FilterLabel id="task-filter-status-label">Status</FilterLabel>
                    <MultiSelect
                      options={statusOptions}
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
                      aria-labelledby="task-filter-status-label"
                      block
                    />
                  </FilterGroup>
                );

              case "category":
                return (
                  <FilterGroup key="category">
                    <FilterLabel id="task-filter-category-label">Category</FilterLabel>
                    <MultiSelect
                      options={categoryOptions}
                      value={selectedCategories}
                      onChange={(selected: FilterOption[]) =>
                        setFilters((prev) => ({
                          ...prev,
                          categories: selected.map((s) => s.id),
                        }))
                      }
                      getId={getId}
                      getLabel={getLabel}
                      placeholder="Select categories"
                      aria-labelledby="task-filter-category-label"
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
