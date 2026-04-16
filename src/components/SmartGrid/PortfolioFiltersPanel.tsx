import React, { useCallback, useMemo, useState } from "react";
import { Button, MultiSelect, Search, Typography } from "@procore/core-react";
import styled from "styled-components";
import {
  PROJECT_STAGES,
  PROJECT_PROGRAMS,
} from "@/data/projects";

const PanelWrapper = styled.div<{ $open: boolean }>`
  width: ${({ $open }) => ($open ? "400px" : "0px")};
  min-width: ${({ $open }) => ($open ? "400px" : "0px")};
  overflow: hidden;
  transition: width 0.25s ease, min-width 0.25s ease;
  border-right: ${({ $open }) => ($open ? "1px solid #D6DADC" : "none")};
  display: flex;
  flex-direction: column;
  background: #fff;
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
  border-bottom: 1px solid #D6DADC;
  flex-shrink: 0;
`;

const PanelSearchRow = styled.div`
  padding: 16px;
  border-bottom: 1px solid #D6DADC;
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
  border-top: 1px solid #D6DADC;
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
  color: #232729;
`;

const DateRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
`;

const DateField = styled.input`
  flex: 1;
  height: 36px;
  border: 1px solid #D6DADC;
  border-radius: 4px;
  padding: 0 8px;
  font-size: 14px;
  font-family: "Inter", system-ui, sans-serif;
  color: #232729;
  outline: none;
  &:focus {
    border-color: #2066DF;
  }
`;

interface FilterOption {
  id: string;
  label: string;
}

export interface PortfolioFilterValues {
  programs: string[];
  stages: string[];
  locations: string[];
  startDateFrom: string;
  startDateTo: string;
  endDateFrom: string;
  endDateTo: string;
}

const EMPTY_FILTERS: PortfolioFilterValues = {
  programs: [],
  stages: [],
  locations: [],
  startDateFrom: "",
  startDateTo: "",
  endDateFrom: "",
  endDateTo: "",
};

interface PortfolioFiltersPanelProps {
  open: boolean;
  locationOptions: string[];
  onApply: (filters: PortfolioFilterValues) => void;
  onClear: () => void;
}

const getId = (opt: FilterOption) => opt.id;
const getLabel = (opt: FilterOption) => opt.label;

export default function PortfolioFiltersPanel({
  open,
  locationOptions,
  onApply,
  onClear,
}: PortfolioFiltersPanelProps) {
  const [filters, setFilters] = useState<PortfolioFilterValues>(EMPTY_FILTERS);
  const [filterSearch, setFilterSearch] = useState("");

  const programOpts: FilterOption[] = useMemo(
    () => [...PROJECT_PROGRAMS].map((p) => ({ id: p, label: p })),
    []
  );
  const stageOpts: FilterOption[] = useMemo(
    () => [...PROJECT_STAGES].map((s) => ({ id: s, label: s })),
    []
  );
  const locationOpts: FilterOption[] = useMemo(
    () => locationOptions.map((loc) => ({ id: loc, label: loc })),
    [locationOptions]
  );

  const selectedPrograms = useMemo(
    () => programOpts.filter((o) => filters.programs.includes(o.id)),
    [programOpts, filters.programs]
  );
  const selectedStages = useMemo(
    () => stageOpts.filter((o) => filters.stages.includes(o.id)),
    [stageOpts, filters.stages]
  );
  const selectedLocations = useMemo(
    () => locationOpts.filter((o) => filters.locations.includes(o.id)),
    [locationOpts, filters.locations]
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
    { key: "program", label: "Program" },
    { key: "stage", label: "Stage" },
    { key: "location", label: "Location" },
    { key: "startDate", label: "Start Date" },
    { key: "endDate", label: "End Date" },
  ];

  const visibleGroups = filterSearch
    ? allFilterGroups.filter((g) =>
        g.label.toLowerCase().includes(filterSearch.toLowerCase())
      )
    : allFilterGroups;

  const activeFilterCount = [
    filters.programs.length > 0,
    filters.stages.length > 0,
    filters.locations.length > 0,
    filters.startDateFrom || filters.startDateTo,
    filters.endDateFrom || filters.endDateTo,
  ].filter(Boolean).length;

  return (
    <PanelWrapper $open={open}>
      <PanelInner>
        <PanelHeader>
          <Typography
            intent="h3"
            style={{ flex: 1, fontSize: 16, fontWeight: 600, lineHeight: "24px", letterSpacing: "0.15px", color: "#232729" }}
          >
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </Typography>
          <Button variant="tertiary" onClick={handleClearAll}>
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
              case "program":
                return (
                  <FilterGroup key="program">
                    <FilterLabel id="filter-program-label">Program</FilterLabel>
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
                      aria-labelledby="filter-program-label"
                      block
                    />
                  </FilterGroup>
                );

              case "stage":
                return (
                  <FilterGroup key="stage">
                    <FilterLabel id="filter-stage-label">Stage</FilterLabel>
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
                      aria-labelledby="filter-stage-label"
                      block
                    />
                  </FilterGroup>
                );

              case "location":
                return (
                  <FilterGroup key="location">
                    <FilterLabel id="filter-location-label">Location</FilterLabel>
                    <MultiSelect
                      options={locationOpts}
                      value={selectedLocations}
                      onChange={(selected: FilterOption[]) =>
                        setFilters((prev) => ({
                          ...prev,
                          locations: selected.map((s) => s.id),
                        }))
                      }
                      getId={getId}
                      getLabel={getLabel}
                      placeholder="Select locations"
                      aria-labelledby="filter-location-label"
                      block
                    />
                  </FilterGroup>
                );

              case "startDate":
                return (
                  <FilterGroup key="startDate">
                    <FilterLabel>Start Date</FilterLabel>
                    <DateRow>
                      <DateField
                        type="date"
                        value={filters.startDateFrom}
                        onChange={(e) =>
                          setFilters((prev) => ({ ...prev, startDateFrom: e.target.value }))
                        }
                        placeholder="mm/dd/yyyy"
                      />
                      <DateField
                        type="date"
                        value={filters.startDateTo}
                        onChange={(e) =>
                          setFilters((prev) => ({ ...prev, startDateTo: e.target.value }))
                        }
                        placeholder="mm/dd/yyyy"
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
                        onChange={(e) =>
                          setFilters((prev) => ({ ...prev, endDateFrom: e.target.value }))
                        }
                        placeholder="mm/dd/yyyy"
                      />
                      <DateField
                        type="date"
                        value={filters.endDateTo}
                        onChange={(e) =>
                          setFilters((prev) => ({ ...prev, endDateTo: e.target.value }))
                        }
                        placeholder="mm/dd/yyyy"
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
