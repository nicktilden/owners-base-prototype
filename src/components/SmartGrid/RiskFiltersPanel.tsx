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

export interface RiskFilterValues {
  statuses: string[];
  categories: string[];
  itemTypes: string[];
  origins: string[];
}

const EMPTY_FILTERS: RiskFilterValues = {
  statuses: [],
  categories: [],
  itemTypes: [],
  origins: [],
};

interface RiskFiltersPanelProps {
  open: boolean;
  statusOptions: string[];
  categoryOptions: string[];
  itemTypeOptions: string[];
  originOptions: string[];
  onApply: (filters: RiskFilterValues) => void;
  onClear: () => void;
}

const getId = (opt: FilterOption) => opt.id;
const getLabel = (opt: FilterOption) => opt.label;

export default function RiskFiltersPanel({
  open,
  statusOptions,
  categoryOptions,
  itemTypeOptions,
  originOptions,
  onApply,
  onClear,
}: RiskFiltersPanelProps) {
  const [filters, setFilters] = useState<RiskFilterValues>(EMPTY_FILTERS);
  const [filterSearch, setFilterSearch] = useState("");

  const statusOpts: FilterOption[] = useMemo(
    () => statusOptions.map((s) => ({ id: s, label: s })),
    [statusOptions]
  );
  const categoryOpts: FilterOption[] = useMemo(
    () => categoryOptions.map((s) => ({ id: s, label: s })),
    [categoryOptions]
  );
  const itemTypeOpts: FilterOption[] = useMemo(
    () => itemTypeOptions.map((s) => ({ id: s, label: s })),
    [itemTypeOptions]
  );
  const originOpts: FilterOption[] = useMemo(
    () => originOptions.map((s) => ({ id: s, label: s })),
    [originOptions]
  );

  const selectedStatuses = useMemo(
    () => statusOpts.filter((o) => filters.statuses.includes(o.id)),
    [statusOpts, filters.statuses]
  );
  const selectedCategories = useMemo(
    () => categoryOpts.filter((o) => filters.categories.includes(o.id)),
    [categoryOpts, filters.categories]
  );
  const selectedItemTypes = useMemo(
    () => itemTypeOpts.filter((o) => filters.itemTypes.includes(o.id)),
    [itemTypeOpts, filters.itemTypes]
  );
  const selectedOrigins = useMemo(
    () => originOpts.filter((o) => filters.origins.includes(o.id)),
    [originOpts, filters.origins]
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
    { key: "status", label: "Status" },
    { key: "category", label: "Risk Category" },
    { key: "itemType", label: "Item Type" },
    { key: "origin", label: "Origin" },
  ];

  const visibleGroups = filterSearch
    ? allFilterGroups.filter((g) =>
        g.label.toLowerCase().includes(filterSearch.toLowerCase())
      )
    : allFilterGroups;

  const activeFilterCount = [
    filters.statuses.length > 0,
    filters.categories.length > 0,
    filters.itemTypes.length > 0,
    filters.origins.length > 0,
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
              case "status":
                return (
                  <FilterGroup key="status">
                    <FilterLabel id="risk-filter-status-label">Status</FilterLabel>
                    <MultiSelect
                      options={statusOpts}
                      value={selectedStatuses}
                      onChange={(selected: FilterOption[]) =>
                        setFilters((prev) => ({ ...prev, statuses: selected.map((s) => s.id) }))
                      }
                      getId={getId}
                      getLabel={getLabel}
                      placeholder="Select statuses"
                      aria-labelledby="risk-filter-status-label"
                      block
                    />
                  </FilterGroup>
                );
              case "category":
                return (
                  <FilterGroup key="category">
                    <FilterLabel id="risk-filter-category-label">Risk Category</FilterLabel>
                    <MultiSelect
                      options={categoryOpts}
                      value={selectedCategories}
                      onChange={(selected: FilterOption[]) =>
                        setFilters((prev) => ({ ...prev, categories: selected.map((s) => s.id) }))
                      }
                      getId={getId}
                      getLabel={getLabel}
                      placeholder="Select categories"
                      aria-labelledby="risk-filter-category-label"
                      block
                    />
                  </FilterGroup>
                );
              case "itemType":
                return (
                  <FilterGroup key="itemType">
                    <FilterLabel id="risk-filter-itemtype-label">Item Type</FilterLabel>
                    <MultiSelect
                      options={itemTypeOpts}
                      value={selectedItemTypes}
                      onChange={(selected: FilterOption[]) =>
                        setFilters((prev) => ({ ...prev, itemTypes: selected.map((s) => s.id) }))
                      }
                      getId={getId}
                      getLabel={getLabel}
                      placeholder="Select item types"
                      aria-labelledby="risk-filter-itemtype-label"
                      block
                    />
                  </FilterGroup>
                );
              case "origin":
                return (
                  <FilterGroup key="origin">
                    <FilterLabel id="risk-filter-origin-label">Origin</FilterLabel>
                    <MultiSelect
                      options={originOpts}
                      value={selectedOrigins}
                      onChange={(selected: FilterOption[]) =>
                        setFilters((prev) => ({ ...prev, origins: selected.map((s) => s.id) }))
                      }
                      getId={getId}
                      getLabel={getLabel}
                      placeholder="Select origins"
                      aria-labelledby="risk-filter-origin-label"
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
