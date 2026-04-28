import React, { useCallback, useMemo, useState } from "react";
import { Button, Card, Checkbox, Form, H2, MultiSelect, Pill, Search, Select, Tearsheet, TextInput, ToggleButton, Tooltip, Typography } from "@procore/core-react";
import { Filter, Fire, Gantt, Info, List, Pencil, Sliders } from "@procore/core-icons";
import styled, { createGlobalStyle } from "styled-components";
import {
  sampleProjectMilestones,
  sampleProjectRows,
  PROJECT_MILESTONES,
  PROJECT_STAGES,
  PROJECT_PRIORITIES_DISTINCT,
  PROJECT_MANAGER_NAMES,
  PROJECT_REGION_NAMES,
  VARIANCE_AXIS_MIN,
  VARIANCE_AXIS_MAX,
  getStageOrder,
  type ProjectMilestoneName,
  type ProjectRow,
} from "@/data/projects";
import { formatDateMMDDYYYY, formatDateMMDDYY } from "@/utils/date";
import { useHubFilters } from "@/context/HubFilterContext";
import HubCardFrame from "@/components/hubs/HubCardFrame";
import SegmentedControl from "@/components/SegmentedControl";

type ViewMode = "heatmap" | "gantt" | "dates";

// ─── Heatmap color logic ───────────────────────────────────────────────────────

const HEATMAP_PCT_LO = 5;
const HEATMAP_PCT_HI = 30;
const HEATMAP_HEADER_BG = "hsl(200, 8%, 96%)";
const HEATMAP_NEUTRAL_BG = "#eceff1";
const HEATMAP_CELL_FG_DARK = "#1a1a1a";
const HEATMAP_CELL_FG_LIGHT = "#ffffff";

function varianceToHeatmapPct(v: number): number {
  const lo = VARIANCE_AXIS_MIN;
  const hi = VARIANCE_AXIS_MAX;
  const c = Math.max(lo, Math.min(hi, v));
  const ratio = (hi - c) / (hi - lo);
  return Math.round(HEATMAP_PCT_LO + ratio * (HEATMAP_PCT_HI - HEATMAP_PCT_LO));
}

function heatmapBgForPct(pct: number): string {
  if (pct <= 7) return "#b71c1c";
  if (pct <= 9) return "#d32f2f";
  if (pct <= 11) return "#e53935";
  if (pct <= 13) return "#ff7043";
  if (pct <= 15) return "#ffab91";
  if (pct <= 17) return "#ffcc80";
  if (pct <= 19) return "#fff9c4";
  if (pct <= 21) return "#e6ee9c";
  if (pct <= 23) return "#c5e1a5";
  if (pct <= 25) return "#8bc34a";
  if (pct <= 27) return "#43a047";
  if (pct <= 28) return "#2e7d32";
  return "#1b5e20";
}

function heatmapFgForPct(pct: number): string {
  return pct <= 13 || pct >= 27 ? HEATMAP_CELL_FG_LIGHT : HEATMAP_CELL_FG_DARK;
}

// ─── Milestone stage membership ───────────────────────────────────────────────

const MILESTONE_STAGE_MAP: Record<ProjectMilestoneName, number> = {
  "Project Charter": 1,
  "Feasibility Study": 2,
  "Design Kickoff": 3,
  "Project Scope": 1,
  "Decision Support Package": 2,
  "Readiness Review": 3,
  "Construction Documents": 3,
  "Designs Approved": 3,
  "Storm Water Pollution Prevention Plan": 4,
  "Environmental Survey": 4,
  "Municipal Approvals": 4,
  "Building Permits": 4,
  "Bidding": 5,
  "Notice to Proceed": 6,
  "Site Mobilization": 6,
  "Phase 1 - Construction": 7,
  "MEP Rough-In": 7,
  "Phase 2 - Construction": 7,
  "Interior Finishes": 7,
  "Phase 3 - Final Build": 7,
  "Retrofit Start": 7,
  "Substantial Completion": 8,
  "Client Handoff": 9,
};

// ─── Abbreviated column labels ─────────────────────────────────────────────────

const MILESTONE_ABBR: Record<ProjectMilestoneName, string> = {
  "Project Charter":                       "Charter",
  "Feasibility Study":                     "Feasib.",
  "Design Kickoff":                        "Des. KO",
  "Project Scope":                         "Scope",
  "Decision Support Package":              "DSP",
  "Readiness Review":                      "Rdy Rev",
  "Construction Documents":                "Con Docs",
  "Designs Approved":                      "Des. App",
  "Storm Water Pollution Prevention Plan": "SWPPP",
  "Environmental Survey":                  "Env Sur",
  "Municipal Approvals":                   "Muni App",
  "Building Permits":                      "Permits",
  "Bidding":                               "Bidding",
  "Notice to Proceed":                     "NTP",
  "Site Mobilization":                     "Site Mob",
  "Phase 1 - Construction":                "Ph. 1",
  "MEP Rough-In":                          "MEP",
  "Phase 2 - Construction":                "Ph. 2",
  "Interior Finishes":                     "Int. Fin",
  "Phase 3 - Final Build":                 "Ph. 3",
  "Retrofit Start":                        "Retrofit",
  "Substantial Completion":                "Sub Comp",
  "Client Handoff":                        "Handoff",
};

// ─── Stage pill colors ─────────────────────────────────────────────────────────

const STAGE_COLORS: Record<string, "blue" | "green" | "yellow" | "gray" | "magenta" | "cyan"> = {
  "Conceptual":             "magenta",
  "Feasibility":            "magenta",
  "Final design":           "cyan",
  "Permitting":             "yellow",
  "Bidding":                "yellow",
  "Pre-Construction":       "blue",
  "Course of Construction": "green",
  "Post-Construction":      "green",
  "Handover":               "blue",
  "Closeout":               "gray",
  "Maintenance":            "gray",
};

// ─── Panel styled components (shared between filters + configure) ──────────────

const PanelWrapper = styled.div<{ $open: boolean; $side: "left" | "right" }>`
  width: ${({ $open }) => ($open ? "320px" : "0px")};
  min-width: ${({ $open }) => ($open ? "320px" : "0px")};
  overflow: hidden;
  transition: width 0.25s ease, min-width 0.25s ease;
  border-${({ $side }) => ($side === "left" ? "right" : "left")}: ${({ $open }) =>
    $open ? "1px solid var(--color-border-separator)" : "none"};
  display: flex;
  flex-direction: column;
  background: var(--color-surface-primary);
  flex-shrink: 0;
`;

const PanelInner = styled.div`
  display: flex;
  flex-direction: column;
  width: 320px;
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
  gap: 8px;
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

const ColumnRow = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 16px;
  gap: 4px;
`;

const ColumnPill = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  background: var(--color-surface-hover);
  border-radius: 4px;
  padding: 4px;
  min-width: 0;
`;

const EnabledCount = styled.span`
  font-size: 12px;
  line-height: 16px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  margin-left: auto;
  padding-right: 4px;
`;

// ─── Filter types ──────────────────────────────────────────────────────────────

interface FilterOption {
  id: string;
  label: string;
}

interface HeatmapFilterValues {
  stages: string[];
  priorities: string[];
  regions: string[];
  projectManagers: string[];
  startDateFrom: string;
  startDateTo: string;
  endDateFrom: string;
  endDateTo: string;
}

const EMPTY_HEATMAP_FILTERS: HeatmapFilterValues = {
  stages: [],
  priorities: [],
  regions: [],
  projectManagers: [],
  startDateFrom: "",
  startDateTo: "",
  endDateFrom: "",
  endDateTo: "",
};

const getId = (opt: FilterOption) => opt.id;
const getLabel = (opt: FilterOption) => opt.label;

const PRIORITY_OPTIONS: FilterOption[] = [
  { id: "high",   label: "High"   },
  { id: "medium", label: "Medium" },
  { id: "low",    label: "Low"    },
];

const ALL_FILTER_GROUPS = [
  { key: "stage",          label: "Stage"           },
  { key: "priority",       label: "Priority"        },
  { key: "region",         label: "Region"          },
  { key: "projectManager", label: "Project Manager" },
  { key: "startDate",      label: "Start Date"      },
  { key: "endDate",        label: "End Date"        },
];

// ─── HeatmapFiltersPanel ───────────────────────────────────────────────────────

interface HeatmapFiltersPanelProps {
  open: boolean;
  onApply: (filters: HeatmapFilterValues) => void;
  onClear: () => void;
}

function HeatmapFiltersPanel({ open, onApply, onClear }: HeatmapFiltersPanelProps) {
  const [filters, setFilters] = useState<HeatmapFilterValues>(EMPTY_HEATMAP_FILTERS);
  const [filterSearch, setFilterSearch] = useState("");

  const stageOpts = useMemo(
    () => [...PROJECT_STAGES].map((s) => ({ id: s, label: s })),
    []
  );
  const regionOpts = useMemo(
    () => [...PROJECT_REGION_NAMES].sort().map((r) => ({ id: r, label: r })),
    []
  );
  const pmOpts = useMemo(
    () => [...PROJECT_MANAGER_NAMES].sort().map((p) => ({ id: p, label: p })),
    []
  );
  const priorityOpts = useMemo(
    () => [...PROJECT_PRIORITIES_DISTINCT].map((p) => ({ id: p.toLowerCase(), label: p })),
    []
  );

  const selectedStages     = useMemo(() => stageOpts.filter((o) => filters.stages.includes(o.id)),               [stageOpts, filters.stages]);
  const selectedPriorities = useMemo(() => priorityOpts.filter((o) => filters.priorities.includes(o.id)),        [priorityOpts, filters.priorities]);
  const selectedRegions    = useMemo(() => regionOpts.filter((o) => filters.regions.includes(o.id)),             [regionOpts, filters.regions]);
  const selectedPMs        = useMemo(() => pmOpts.filter((o) => filters.projectManagers.includes(o.id)),         [pmOpts, filters.projectManagers]);

  const activeFilterCount = [
    filters.stages.length > 0,
    filters.priorities.length > 0,
    filters.regions.length > 0,
    filters.projectManagers.length > 0,
    !!(filters.startDateFrom || filters.startDateTo),
    !!(filters.endDateFrom || filters.endDateTo),
  ].filter(Boolean).length;

  const handleClearAll = useCallback(() => {
    setFilters(EMPTY_HEATMAP_FILTERS);
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

  const makeMulti = (
    key: string,
    label: string,
    labelId: string,
    opts: FilterOption[],
    selected: FilterOption[],
    field: keyof Pick<HeatmapFilterValues, "stages" | "priorities" | "regions" | "projectManagers">,
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
    <PanelWrapper $open={open} $side="left">
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
              case "stage":
                return makeMulti("stage", "Stage", "hf-stage-label", stageOpts, selectedStages, "stages", "Select stages");
              case "priority":
                return makeMulti("priority", "Priority", "hf-priority-label", priorityOpts, selectedPriorities, "priorities", "Select priorities");
              case "region":
                return makeMulti("region", "Region", "hf-region-label", regionOpts, selectedRegions, "regions", "Select regions");
              case "projectManager":
                return makeMulti("projectManager", "Project Manager", "hf-pm-label", pmOpts, selectedPMs, "projectManagers", "Select project managers");
              case "startDate":
                return (
                  <FilterGroup key="startDate">
                    <FilterLabel>Start Date</FilterLabel>
                    <DateRow>
                      <DateField
                        type="date"
                        value={filters.startDateFrom}
                        onChange={(e) => setFilters((prev) => ({ ...prev, startDateFrom: e.target.value }))}
                      />
                      <DateField
                        type="date"
                        value={filters.startDateTo}
                        onChange={(e) => setFilters((prev) => ({ ...prev, startDateTo: e.target.value }))}
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
                      />
                      <DateField
                        type="date"
                        value={filters.endDateTo}
                        onChange={(e) => setFilters((prev) => ({ ...prev, endDateTo: e.target.value }))}
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
          <Button variant="primary" className="b_primary" onClick={handleApply}>
            Apply
          </Button>
        </PanelFooter>
      </PanelInner>
    </PanelWrapper>
  );
}

// ─── HeatmapConfigurePanel ─────────────────────────────────────────────────────

interface ConfigureMilestoneEntry {
  name: ProjectMilestoneName;
  abbr: string;
  visible: boolean;
}

interface HeatmapConfigurePanelProps {
  open: boolean;
  milestones: ConfigureMilestoneEntry[];
  onApply: (visibleMilestones: Set<ProjectMilestoneName>) => void;
  onClose: () => void;
}

function HeatmapConfigurePanel({ open, milestones, onApply, onClose }: HeatmapConfigurePanelProps) {
  const [searchText, setSearchText] = useState("");
  const [pendingChanges, setPendingChanges] = useState<Map<ProjectMilestoneName, boolean>>(new Map());

  const getEffectiveVisibility = useCallback(
    (entry: ConfigureMilestoneEntry) =>
      pendingChanges.has(entry.name) ? pendingChanges.get(entry.name)! : entry.visible,
    [pendingChanges]
  );

  const toggleMilestone = useCallback((name: ProjectMilestoneName) => {
    setPendingChanges((prev) => {
      const next = new Map(prev);
      const current = milestones.find((m) => m.name === name);
      if (!current) return prev;
      const currentVisible = next.has(name) ? next.get(name)! : current.visible;
      next.set(name, !currentVisible);
      return next;
    });
  }, [milestones]);

  const visibleEntries = useMemo(() => {
    if (!searchText) return milestones;
    const q = searchText.toLowerCase();
    return milestones.filter((m) => m.name.toLowerCase().includes(q) || m.abbr.toLowerCase().includes(q));
  }, [milestones, searchText]);

  const enabledCount = useMemo(
    () => milestones.filter((m) => getEffectiveVisibility(m)).length,
    [milestones, getEffectiveVisibility]
  );

  const handleReset = useCallback(() => {
    setPendingChanges(new Map());
  }, []);

  const handleApply = useCallback(() => {
    const visible = new Set<ProjectMilestoneName>(
      milestones
        .filter((m) => getEffectiveVisibility(m))
        .map((m) => m.name)
    );
    onApply(visible);
    onClose();
  }, [milestones, getEffectiveVisibility, onApply, onClose]);

  return (
    <PanelWrapper $open={open} $side="right">
      <PanelInner>
        <PanelHeader>
          <Typography
            intent="h3"
            style={{ flex: 1, fontSize: 16, fontWeight: 600, lineHeight: "24px", letterSpacing: "0.15px", color: "var(--color-text-primary)" }}
          >
            Configure Columns
          </Typography>
          <Button variant="tertiary" className="b_tertiary" onClick={handleReset}>
            Reset
          </Button>
        </PanelHeader>

        <PanelSearchRow>
          <Search
            placeholder="Search milestones"
            value={searchText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
            onClear={() => setSearchText("")}
          />
        </PanelSearchRow>

        <PanelBody style={{ padding: "8px 0", gap: 0 }}>
          {visibleEntries.map((entry) => {
            const checked = getEffectiveVisibility(entry);
            return (
              <ColumnRow key={entry.name}>
                <ColumnPill>
                  <Checkbox
                    checked={checked}
                    onChange={() => toggleMilestone(entry.name)}
                  >
                    <span style={{ fontSize: 13 }}>{entry.name}</span>
                  </Checkbox>
                  <EnabledCount>{checked ? "show" : "hide"}</EnabledCount>
                </ColumnPill>
              </ColumnRow>
            );
          })}
        </PanelBody>

        <PanelFooter>
          <span style={{ flex: 1, fontSize: 12, color: "var(--color-text-secondary)" }}>
            {enabledCount}/{milestones.length} columns enabled
          </span>
          <Button variant="primary" className="b_primary" onClick={handleApply}>
            Apply
          </Button>
        </PanelFooter>
      </PanelInner>
    </PanelWrapper>
  );
}

// ─── Main card styled components ───────────────────────────────────────────────

const TableArea = styled.div`
  display: flex;
  border: 1px solid hsl(200, 8%, 85%);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 4px;
`;

const ScrollWrapper = styled.div`
  overflow-x: auto;
  overflow-y: auto;
  max-height: 800px;
  flex: 1;
  min-width: 0;
`;

const HeatmapTable = styled.table`
  border-collapse: collapse;
  width: max-content;
  min-width: 100%;
`;

const THead = styled.thead`
  background: ${HEATMAP_HEADER_BG};
`;

const Th = styled.th<{ $sticky?: boolean }>`
  padding: 0 16px;
  height: 48px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: 0.25px;
  white-space: nowrap;
  text-align: left;
  border-bottom: 1px solid var(--color-border-separator);
  border-right: 1px solid #e8eaeb;
  background: ${HEATMAP_HEADER_BG};
  ${({ $sticky }) =>
    $sticky &&
    `
    position: sticky;
    left: 0;
    z-index: 3;
  `}
`;

const ThMilestone = styled.th`
  padding: 0 4px;
  height: 48px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: 0.2px;
  white-space: nowrap;
  text-align: center;
  border-bottom: 1px solid var(--color-border-separator);
  border-right: 1px solid #e8eaeb;
  background: ${HEATMAP_HEADER_BG};
  min-width: 80px;
`;

const Tr = styled.tr`
  &:last-child td {
    border-bottom: none;
  }
  &:hover td {
    filter: brightness(0.96);
  }
`;

const Td = styled.td<{ $sticky?: boolean }>`
  padding: 6px 8px;
  border-bottom: 1px solid #e8eaeb;
  border-right: 1px solid #e8eaeb;
  background: var(--color-surface-primary);
  vertical-align: middle;
  white-space: nowrap;
  ${({ $sticky }) =>
    $sticky &&
    `
    position: sticky;
    left: 0;
    z-index: 1;
    background: var(--color-surface-primary);
  `}
`;

// Full-fill cell: background color applied directly to the <td>
const TdMilestoneHeat = styled.td<{ $bg: string; $isCurrent: boolean }>`
  padding: 3px 6px;
  border-bottom: 1px solid #e8eaeb;
  border-right: 1px solid #e8eaeb;
  background: ${({ $bg }) => $bg};
  text-align: center;
  vertical-align: middle;
  min-width: 80px;
  ${({ $isCurrent }) =>
    $isCurrent &&
    `
    outline: 2px solid var(--color-text-primary);
    outline-offset: -2px;
  `}
`;

const TdMilestonePlain = styled.td`
  padding: 3px 6px;
  border-bottom: 1px solid #e8eaeb;
  border-right: 1px solid #e8eaeb;
  background: var(--color-surface-primary);
  text-align: center;
  vertical-align: middle;
  min-width: 80px;
`;

const TdMilestoneDates = styled.td`
  padding: 4px 8px;
  border-bottom: 1px solid #e8eaeb;
  border-right: 1px solid #e8eaeb;
  background: var(--color-surface-primary);
  text-align: center;
  vertical-align: middle;
  min-width: 80px;
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
`;

const ProjectMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const ProjectNumber = styled.span`
  font-size: 11px;
  font-weight: 400;
  color: var(--color-text-secondary);
  line-height: 1.2;
`;

const ProjectName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-link);
  text-decoration: underline;
  cursor: pointer;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  line-height: 1.3;
`;

const FutureDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${HEATMAP_NEUTRAL_BG};
  margin: 0 auto;
`;

const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0 0 10px;
  flex-wrap: wrap;
`;

const LegendGradient = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LegendLabel = styled.span`
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
`;

const LegendStrip = styled.div`
  display: flex;
  border-radius: 3px;
  overflow: hidden;
  height: 14px;
`;

const LegendBand = styled.div<{ $color: string }>`
  width: 14px;
  height: 14px;
  background: ${({ $color }) => $color};
`;

const LegendSeparator = styled.div`
  width: 1px;
  background: var(--color-border-separator);
  margin: 0 12px;
  height: 16px;
  align-self: center;
`;

const LegendDotItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--color-text-secondary);
`;

const LegendDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${HEATMAP_NEUTRAL_BG};
  border: 1px solid var(--color-border-separator);
`;

const LegendCurrentBox = styled.div`
  width: 14px;
  height: 14px;
  border-radius: 2px;
  background: #8bc34a;
  outline: 2px solid var(--color-text-primary);
  outline-offset: 1px;
`;

// Sticky-right edit column header
const ThEdit = styled.th`
  padding: 0 10px;
  height: 48px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: 0.25px;
  white-space: nowrap;
  text-align: center;
  border-bottom: 1px solid var(--color-border-separator);
  background: ${HEATMAP_HEADER_BG};
  position: sticky;
  right: 0;
  z-index: 3;
  min-width: 44px;
  width: 44px;
  border-left: 1px solid var(--color-border-separator);
`;

// Sticky-right edit column body cell
const TdEdit = styled.td`
  padding: 3px 6px;
  border-bottom: 1px solid #e8eaeb;
  background: var(--color-surface-primary);
  text-align: center;
  vertical-align: middle;
  position: sticky;
  right: 0;
  z-index: 1;
  min-width: 44px;
  width: 44px;
  border-left: 1px solid var(--color-border-separator);
`;

// Widen the tearsheet for the milestones editor
const TearsheetMilestoneEdit = createGlobalStyle`
  [class*="StyledTearsheetBody"]:has(> .milestone-edit-tearsheet-root) {
    flex: 0 0 60vw !important;
  }
`;

const ToolbarRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 8px;
  gap: 8px;
  background: var(--color-surface-primary);
`;

const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const GanttPlaceholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  color: var(--color-text-secondary);
  font-size: 14px;
  border: 1px dashed var(--color-border-separator);
  border-radius: 4px;
  margin-top: 4px;
`;

// ─── Milestone Edit Tearsheet ──────────────────────────────────────────────────

interface MilestoneEditTearsheetProps {
  projectId: number | null;
  onClose: () => void;
}

function varianceBadgeTearsheet(v: number) {
  const color = v > 7 ? "#b71c1c" : v > 3 ? "#e65100" : v > 0 ? "#ef6c00" : v < -7 ? "#1b5e20" : v < 0 ? "#2e7d32" : "#546e7a";
  const bg = v > 7 ? "#ffebee" : v > 3 ? "#fff3e0" : v > 0 ? "#fff8e1" : v < -7 ? "#e8f5e9" : v < 0 ? "#f1f8e9" : "#eceff1";
  const label = v > 0 ? `+${v}d` : v < 0 ? `${v}d` : "0d";
  return (
    <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: 4, background: bg, color, fontWeight: 600, fontSize: 12 }}>
      {label}
    </span>
  );
}

function MilestoneEditTearsheet({ projectId, onClose }: MilestoneEditTearsheetProps) {
  const project = useMemo(
    () => (projectId !== null ? sampleProjectRows.find((p) => p.id === projectId) ?? null : null),
    [projectId]
  );
  const milestones = useMemo(
    () => (projectId !== null ? sampleProjectMilestones.get(projectId) ?? [] : []),
    [projectId]
  );

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [milestoneEdits, setMilestoneEdits] = useState<Map<string, { baseline: string; actual: string }>>(new Map());

  // Reset local state when project changes
  React.useEffect(() => {
    if (project) {
      setStartDate(project.startDate);
      setEndDate(project.endDate);
    }
    setMilestoneEdits(new Map());
  }, [project]);

  const getMilestoneValue = useCallback((name: string, field: "baseline" | "actual"): string => {
    const edit = milestoneEdits.get(name);
    if (edit) return edit[field];
    const m = milestones.find((ms) => ms.name === name);
    if (!m) return "";
    return field === "baseline" ? m.baselineDate : (m.actualDate ?? "");
  }, [milestoneEdits, milestones]);

  const setMilestoneField = useCallback((name: string, field: "baseline" | "actual", value: string) => {
    setMilestoneEdits((prev) => {
      const next = new Map(prev);
      const current = next.get(name) ?? {
        baseline: milestones.find((m) => m.name === name)?.baselineDate ?? "",
        actual: milestones.find((m) => m.name === name)?.actualDate ?? "",
      };
      next.set(name, { ...current, [field]: value });
      return next;
    });
  }, [milestones]);

  const pastMilestones = useMemo(
    () => milestones.filter((m) => m.actualDate !== null || m.varianceDays !== 0),
    [milestones]
  );
  const upcomingMilestones = useMemo(
    () => milestones.filter((m) => m.actualDate === null && m.varianceDays === 0),
    [milestones]
  );

  return (
    <>
      <TearsheetMilestoneEdit />
      <Tearsheet open={projectId !== null} onClose={onClose} aria-label="Edit project milestones" placement="right">
        <div className="milestone-edit-tearsheet-root" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Header */}
          <div style={{ padding: "16px 20px 14px", borderBottom: "1px solid var(--color-border-separator)", flexShrink: 0 }}>
            {project ? (
              <>
                <Typography intent="small" style={{ color: "var(--color-text-secondary)", fontWeight: 500, display: "block", marginBottom: 2 }}>
                  {project.number}
                </Typography>
                <Typography intent="h2" style={{ fontWeight: 700, color: "var(--color-text-primary)", display: "block" }}>
                  {project.name}
                </Typography>
                <Typography intent="small" style={{ color: "var(--color-text-secondary)", display: "block", marginTop: 4 }}>
                  Edit schedule dates and project milestones
                </Typography>
              </>
            ) : (
              <Typography intent="h2" style={{ fontWeight: 700 }}>Edit Milestones</Typography>
            )}
          </div>

          {/* Scrollable body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
            {project && (
              <>
                {/* ── Section 1: Start & Completion Dates ── */}
                <Card style={{ marginBottom: 16, padding: "16px 20px" }}>
                  <H2 style={{ marginBottom: 12 }}>Start &amp; Completion Dates</H2>
                  <Form>
                    <Form.Form id="milestone-edit-dates-form">
                      <Form.Row>
                        <Form.Text
                          label="Project Start Date"
                          name="startDate"
                          type="date"
                          colStart={1}
                          colWidth={6}
                          value={startDate}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                        />
                        <Form.Text
                          label="Project End Date (Baseline)"
                          name="endDate"
                          type="date"
                          colStart={7}
                          colWidth={6}
                          value={endDate}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                        />
                      </Form.Row>
                    </Form.Form>
                  </Form>
                </Card>

                {/* ── Section 2: Project Milestones ── */}
                <Card style={{ padding: "16px 20px" }}>
                  <H2 style={{ marginBottom: 12 }}>Project Milestones</H2>
                  <div style={{ border: "1px solid var(--color-border-separator)", borderRadius: 6, overflow: "hidden" }}>
                    {/* Table header */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 140px 140px 72px",
                      padding: "0 12px",
                      height: 36,
                      alignItems: "center",
                      background: "var(--color-surface-secondary)",
                      borderBottom: "1px solid var(--color-border-separator)",
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", letterSpacing: "0.25px" }}>Milestone</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", letterSpacing: "0.25px" }}>Baseline Date</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", letterSpacing: "0.25px" }}>Actual Date</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", letterSpacing: "0.25px", textAlign: "right" }}>Variance</span>
                    </div>
                    {/* Past / completed milestones */}
                    {pastMilestones.length > 0 && (
                      <div>
                        <div style={{ padding: "6px 12px", background: "var(--color-surface-secondary)", borderBottom: "1px solid var(--color-border-separator)" }}>
                          <Typography intent="small" weight="bold" style={{ color: "var(--color-text-secondary)" }}>
                            Completed Milestones ({pastMilestones.length})
                          </Typography>
                        </div>
                        {pastMilestones.map((m, i) => {
                          const baselineVal = getMilestoneValue(m.name, "baseline");
                          const actualVal = getMilestoneValue(m.name, "actual");
                          return (
                            <div
                              key={m.name}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 140px 140px 72px",
                                padding: "6px 12px",
                                alignItems: "center",
                                minHeight: 44,
                                background: i % 2 === 0 ? "var(--color-surface-primary)" : "var(--color-surface-secondary)",
                                borderBottom: "1px solid var(--color-border-separator)",
                              }}
                            >
                              <Typography intent="small" style={{ fontWeight: 500, color: "var(--color-text-primary)", paddingRight: 8 }}>
                                {m.name}
                              </Typography>
                              <div>
                                <TextInput
                                  type="date"
                                  value={baselineVal}
                                  onChange={(e) => setMilestoneField(m.name, "baseline", e.target.value)}
                                  style={{ fontSize: 12, width: 128 }}
                                />
                              </div>
                              <div>
                                <TextInput
                                  type="date"
                                  value={actualVal}
                                  onChange={(e) => setMilestoneField(m.name, "actual", e.target.value)}
                                  style={{ fontSize: 12, width: 128 }}
                                />
                              </div>
                              <div style={{ textAlign: "right" }}>
                                {varianceBadgeTearsheet(m.varianceDays)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {/* Upcoming milestones */}
                    {upcomingMilestones.length > 0 && (
                      <div>
                        <div style={{ padding: "6px 12px", background: "var(--color-surface-secondary)", borderBottom: "1px solid var(--color-border-separator)" }}>
                          <Typography intent="small" weight="bold" style={{ color: "var(--color-text-secondary)" }}>
                            Upcoming Milestones ({upcomingMilestones.length})
                          </Typography>
                        </div>
                        {upcomingMilestones.map((m, i) => {
                          const baselineVal = getMilestoneValue(m.name, "baseline");
                          const actualVal = getMilestoneValue(m.name, "actual");
                          return (
                            <div
                              key={m.name}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 140px 140px 72px",
                                padding: "6px 12px",
                                alignItems: "center",
                                minHeight: 44,
                                background: i % 2 === 0 ? "var(--color-surface-primary)" : "var(--color-surface-secondary)",
                                borderBottom: "1px solid var(--color-border-separator)",
                              }}
                            >
                              <Typography intent="small" style={{ fontWeight: 500, color: "var(--color-text-secondary)", paddingRight: 8 }}>
                                {m.name}
                              </Typography>
                              <div>
                                <TextInput
                                  type="date"
                                  value={baselineVal}
                                  onChange={(e) => setMilestoneField(m.name, "baseline", e.target.value)}
                                  style={{ fontSize: 12, width: 128 }}
                                />
                              </div>
                              <div>
                                <TextInput
                                  type="date"
                                  value={actualVal}
                                  placeholder="Not yet recorded"
                                  onChange={(e) => setMilestoneField(m.name, "actual", e.target.value)}
                                  style={{ fontSize: 12, width: 128 }}
                                />
                              </div>
                              <div style={{ textAlign: "right", color: "var(--color-text-secondary)", fontSize: 12 }}>
                                —
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </Card>
              </>
            )}
          </div>

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, padding: "12px 20px", borderTop: "1px solid var(--color-border-separator)", flexShrink: 0 }}>
            <Button variant="tertiary" className="b_tertiary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" className="b_primary" onClick={onClose}>Save Changes</Button>
          </div>
        </div>
      </Tearsheet>
    </>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

const GROUP_BY_OPTIONS = [
  { id: "stage",          label: "Stage"           },
  { id: "region",         label: "Region"          },
  { id: "projectManager", label: "Project Manager" },
] as const;

type GroupById = typeof GROUP_BY_OPTIONS[number]["id"];

const LEGEND_COLORS = [
  "#b71c1c", "#d32f2f", "#e53935", "#ff7043", "#ffab91",
  "#ffcc80", "#fff9c4", "#e6ee9c", "#c5e1a5", "#8bc34a", "#43a047", "#2e7d32", "#1b5e20",
];

export default function ScheduleHeatmapCard() {
  const { filteredProjectRows } = useHubFilters();
  const [viewMode, setViewMode] = useState<ViewMode>("heatmap");
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupById | null>(null);
  const [activeFilters, setActiveFilters] = useState<HeatmapFilterValues>(EMPTY_HEATMAP_FILTERS);
  // Milestone columns to show (null = all visible)
  const [visibleMilestones, setVisibleMilestones] = useState<Set<ProjectMilestoneName> | null>(null);
  const [editProjectId, setEditProjectId] = useState<number | null>(null);

  const handleFiltersToggle = useCallback(() => {
    setFiltersOpen((prev) => {
      if (!prev) setConfigOpen(false);
      return !prev;
    });
  }, []);

  const handleConfigToggle = useCallback(() => {
    setConfigOpen((prev) => {
      if (!prev) setFiltersOpen(false);
      return !prev;
    });
  }, []);

  const handleFilterApply = useCallback((filters: HeatmapFilterValues) => {
    setActiveFilters(filters);
  }, []);

  const handleFilterClear = useCallback(() => {
    setActiveFilters(EMPTY_HEATMAP_FILTERS);
  }, []);

  const displayedRows = useMemo(() => {
    let rows = filteredProjectRows;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(p => p.name.toLowerCase().includes(q) || p.number.toLowerCase().includes(q));
    }

    // Stage filter
    if (activeFilters.stages.length > 0) {
      rows = rows.filter(p => activeFilters.stages.includes(p.stage));
    }

    // Priority filter
    if (activeFilters.priorities.length > 0) {
      rows = rows.filter(p => activeFilters.priorities.includes((p.priority ?? "").toLowerCase()));
    }

    // Region filter
    if (activeFilters.regions.length > 0) {
      rows = rows.filter(p => activeFilters.regions.includes(p.region ?? ""));
    }

    // Project manager filter
    if (activeFilters.projectManagers.length > 0) {
      rows = rows.filter(p => activeFilters.projectManagers.includes(p.projectManager ?? ""));
    }

    // Start date range
    if (activeFilters.startDateFrom) {
      rows = rows.filter(p => p.startDate >= activeFilters.startDateFrom);
    }
    if (activeFilters.startDateTo) {
      rows = rows.filter(p => p.startDate <= activeFilters.startDateTo);
    }

    // End date range
    if (activeFilters.endDateFrom) {
      rows = rows.filter(p => p.endDate >= activeFilters.endDateFrom);
    }
    if (activeFilters.endDateTo) {
      rows = rows.filter(p => p.endDate <= activeFilters.endDateTo);
    }

    return rows;
  }, [filteredProjectRows, searchQuery, activeFilters]);

  // Active filter count for toolbar badge
  const activeFilterCount = useMemo(() => [
    activeFilters.stages.length > 0,
    activeFilters.priorities.length > 0,
    activeFilters.regions.length > 0,
    activeFilters.projectManagers.length > 0,
    !!(activeFilters.startDateFrom || activeFilters.startDateTo),
    !!(activeFilters.endDateFrom || activeFilters.endDateTo),
  ].filter(Boolean).length, [activeFilters]);

  // Milestone column entries for configure panel
  const milestoneEntries = useMemo<ConfigureMilestoneEntry[]>(
    () => PROJECT_MILESTONES.map((name) => ({
      name,
      abbr: MILESTONE_ABBR[name],
      visible: visibleMilestones === null || visibleMilestones.has(name),
    })),
    [visibleMilestones]
  );

  // Filtered milestone list for rendering
  const activeMilestones = useMemo(
    () => PROJECT_MILESTONES.filter(
      (name) => visibleMilestones === null || visibleMilestones.has(name)
    ),
    [visibleMilestones]
  );

  const sharedTableHeader = (
    <THead>
      <tr>
        <Th $sticky>Project</Th>
        <Th>Stage</Th>
        {activeMilestones.map((m) => (
          <ThMilestone key={m} title={m}>
            {MILESTONE_ABBR[m]}
          </ThMilestone>
        ))}
        <ThEdit />
      </tr>
    </THead>
  );

  return (
    <HubCardFrame
      title="Schedule Heatmap"
      infoTooltip="Per-project milestone schedule variance across the portfolio."
    >
      {/* ── Toolbar ── */}
      <ToolbarRow>
        <ToolbarLeft>
          <div style={{ maxWidth: 260 }}>
            <Search
              placeholder="Search"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
            />
          </div>
          <ToggleButton
            selected={filtersOpen}
            className="b_toggle"
            icon={<Filter />}
            onClick={handleFiltersToggle}
          >
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </ToggleButton>
        </ToolbarLeft>
        <ToolbarRight>
          <div style={{ width: 160 }}>
            <Select
              placeholder="Group by"
              label={groupBy ? `Group by: ${GROUP_BY_OPTIONS.find(o => o.id === groupBy)?.label}` : undefined}
              onSelect={(s: { item: unknown }) => setGroupBy((s.item as typeof GROUP_BY_OPTIONS[number]).id)}
              onClear={groupBy ? () => setGroupBy(null) : undefined}
              block
            >
              {GROUP_BY_OPTIONS.map((opt) => (
                <Select.Option key={opt.id} value={opt} selected={groupBy === opt.id}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </div>
          <SegmentedControl>
            <SegmentedControl.Segment
              selected={viewMode === "heatmap"}
              onClick={() => setViewMode("heatmap")}
              icon={<Fire />}
              tooltip="Heat Map"
            />
            <SegmentedControl.Segment
              selected={viewMode === "gantt"}
              onClick={() => setViewMode("gantt")}
              icon={<Gantt />}
              tooltip="Gantt"
            />
            <SegmentedControl.Segment
              selected={viewMode === "dates"}
              onClick={() => setViewMode("dates")}
              icon={<List />}
              tooltip="Dates Table"
            />
          </SegmentedControl>
          <ToggleButton
            selected={configOpen}
            className="b_toggle"
            icon={<Sliders />}
            onClick={handleConfigToggle}
          >
            Configure
          </ToggleButton>
        </ToolbarRight>
      </ToolbarRow>

      {viewMode === "heatmap" && (
        <>
          <Legend>
            <LegendGradient>
              <LegendLabel>Behind</LegendLabel>
              <LegendStrip>
                {LEGEND_COLORS.map((c) => (
                  <LegendBand key={c} $color={c} />
                ))}
              </LegendStrip>
              <LegendLabel>Ahead</LegendLabel>
            </LegendGradient>
            <LegendSeparator />
            <LegendDotItem>
              <LegendDot />
              Not yet reached
            </LegendDotItem>
            <LegendSeparator />
            <LegendDotItem>
              <LegendCurrentBox />
              Current milestone
            </LegendDotItem>
          </Legend>

          <TableArea>
            <HeatmapFiltersPanel
              open={filtersOpen}
              onApply={handleFilterApply}
              onClear={handleFilterClear}
            />
            <ScrollWrapper className="table_container">
              <HeatmapTable>
                {sharedTableHeader}
                <tbody>
                  {displayedRows.map((project) => {
                    const stageOrder = getStageOrder(project.stage);
                    const milestones = sampleProjectMilestones.get(project.id) ?? [];
                    const milestoneMap = new Map(milestones.map((m) => [m.name, m]));

                    let currentIdx = -1;
                    PROJECT_MILESTONES.forEach((name, i) => {
                      if (MILESTONE_STAGE_MAP[name] <= stageOrder) currentIdx = i;
                    });

                    return (
                      <Tr key={project.id}>
                        <Td $sticky>
                          <ProjectMeta>
                            <ProjectNumber>{project.number}</ProjectNumber>
                            <ProjectName title={project.name}>{project.name}</ProjectName>
                          </ProjectMeta>
                        </Td>
                        <Td style={{ minWidth: 160 }}>
                          <Pill style={{ whiteSpace: "nowrap" }} color={STAGE_COLORS[project.stage] ?? "gray"}>
                            {project.stage}
                          </Pill>
                        </Td>
                        {activeMilestones.map((name, i) => {
                          const globalIdx = PROJECT_MILESTONES.indexOf(name);
                          const m = milestoneMap.get(name);
                          const isPast = globalIdx <= currentIdx;
                          const isCurrent = globalIdx === currentIdx;
                          const varianceLabel = m
                            ? m.varianceDays === 0
                              ? "0 days"
                              : `${m.varianceDays > 0 ? "+" : ""}${m.varianceDays} days`
                            : "Not reached";

                          const tooltipContent = (
                            <Tooltip.Content>
                              <div style={{ minWidth: 220, maxWidth: 280, lineHeight: 1.45, whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "break-word" }}>
                                <div style={{ fontWeight: 700 }}>{name}</div>
                                <div style={{ marginTop: 2, color: "#c9d1d4" }}>{project.name}</div>
                                <div style={{ marginTop: 8 }}>Baseline: {m ? formatDateMMDDYYYY(m.baselineDate) : "N/A"}</div>
                                <div>Actual: {m?.actualDate ? formatDateMMDDYYYY(m.actualDate) : "—"}</div>
                                <div>Variance: {varianceLabel}</div>
                              </div>
                            </Tooltip.Content>
                          );

                          if (!isPast || !m) {
                            // Future milestone with a baseline date: show the date
                            if (m?.baselineDate) {
                              return (
                                <TdMilestonePlain key={name}>
                                  <Tooltip trigger="hover" placement="top" overlay={tooltipContent}>
                                    <span style={{ display: "inline-block", fontSize: 10, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
                                      {formatDateMMDDYY(m.baselineDate)}
                                    </span>
                                  </Tooltip>
                                </TdMilestonePlain>
                              );
                            }
                            // Future milestone with no baseline date: show dot
                            return (
                              <TdMilestonePlain key={name}>
                                <Tooltip trigger="hover" placement="top" overlay={tooltipContent}>
                                  <span style={{ display: "inline-flex" }}>
                                    <FutureDot />
                                  </span>
                                </Tooltip>
                              </TdMilestonePlain>
                            );
                          }

                          const pct = varianceToHeatmapPct(m.varianceDays);
                          const bg = heatmapBgForPct(pct);
                          const fg = heatmapFgForPct(pct);
                          const label = m.varianceDays === 0
                            ? "0d"
                            : `${m.varianceDays > 0 ? "+" : ""}${m.varianceDays}d`;

                          return (
                            <TdMilestoneHeat key={name} $bg={bg} $isCurrent={isCurrent}>
                              <Tooltip trigger="hover" placement="top" overlay={tooltipContent}>
                                <span style={{ display: "block", color: fg, fontSize: 10, fontWeight: 700, letterSpacing: 0.1, textAlign: "center" }}>
                                  {label}
                                </span>
                              </Tooltip>
                            </TdMilestoneHeat>
                          );
                        })}
                        <TdEdit>
                          <Button
                            variant="tertiary"
                            className="b_tertiary"
                            size="sm"
                            icon={<Pencil size="sm" />}
                            aria-label={`Edit milestones for ${project.name}`}
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              setEditProjectId(project.id);
                            }}
                          />
                        </TdEdit>
                      </Tr>
                    );
                  })}
                </tbody>
              </HeatmapTable>
            </ScrollWrapper>
            <HeatmapConfigurePanel
              open={configOpen}
              milestones={milestoneEntries}
              onApply={(visible) => setVisibleMilestones(visible)}
              onClose={() => setConfigOpen(false)}
            />
          </TableArea>
        </>
      )}

      {viewMode === "gantt" && (
        <GanttPlaceholder>
          <Typography intent="body" style={{ color: "var(--color-text-secondary)" }}>
            Gantt view — design reference from Jacob coming soon.
          </Typography>
        </GanttPlaceholder>
      )}

      {viewMode === "dates" && (
        <TableArea>
          <HeatmapFiltersPanel
            open={filtersOpen}
            onApply={handleFilterApply}
            onClear={handleFilterClear}
          />
          <ScrollWrapper className="table_container">
            <HeatmapTable>
              {sharedTableHeader}
              <tbody>
                {displayedRows.map((project) => {
                  const stageOrder = getStageOrder(project.stage);
                  const milestones = sampleProjectMilestones.get(project.id) ?? [];
                  const milestoneMap = new Map(milestones.map((m) => [m.name, m]));

                  let currentIdx = -1;
                  PROJECT_MILESTONES.forEach((name, i) => {
                    if (MILESTONE_STAGE_MAP[name] <= stageOrder) currentIdx = i;
                  });

                  return (
                    <Tr key={project.id}>
                      <Td $sticky>
                        <ProjectMeta>
                          <ProjectNumber>{project.number}</ProjectNumber>
                          <ProjectName title={project.name}>{project.name}</ProjectName>
                        </ProjectMeta>
                      </Td>
                      <Td style={{ minWidth: 160 }}>
                        <Pill style={{ whiteSpace: "nowrap" }} color={STAGE_COLORS[project.stage] ?? "gray"}>
                          {project.stage}
                        </Pill>
                      </Td>
                      {activeMilestones.map((name) => {
                        const m = milestoneMap.get(name);

                        const displayDate = m?.actualDate ?? m?.baselineDate ?? null;
                        const hasActual = !!m?.actualDate;

                        if (!displayDate) {
                          return (
                            <TdMilestoneDates key={name}>—</TdMilestoneDates>
                          );
                        }

                        const tooltipContent = hasActual && m?.baselineDate ? (
                          <Tooltip.Content>
                            <div style={{ lineHeight: 1.45 }}>
                              <div>Baseline: {formatDateMMDDYYYY(m.baselineDate)}</div>
                              <div>Actual: {formatDateMMDDYYYY(m.actualDate!)}</div>
                            </div>
                          </Tooltip.Content>
                        ) : null;

                        return (
                          <TdMilestoneDates key={name}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, justifyContent: "center" }}>
                              {formatDateMMDDYYYY(displayDate)}
                              {hasActual && tooltipContent && (
                                <Tooltip trigger="hover" placement="top" overlay={tooltipContent}>
                                  <span style={{ display: "inline-flex", cursor: "default" }}>
                                    <Info size="sm" style={{ width: 10, height: 10, color: "var(--color-text-secondary)" }} />
                                  </span>
                                </Tooltip>
                              )}
                            </span>
                          </TdMilestoneDates>
                        );
                      })}
                      <TdEdit>
                        <Button
                          variant="tertiary"
                          className="b_tertiary"
                          size="sm"
                          icon={<Pencil size="sm" />}
                          aria-label={`Edit milestones for ${project.name}`}
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            setEditProjectId(project.id);
                          }}
                        />
                      </TdEdit>
                    </Tr>
                  );
                })}
              </tbody>
            </HeatmapTable>
          </ScrollWrapper>
          <HeatmapConfigurePanel
            open={configOpen}
            milestones={milestoneEntries}
            onApply={(visible) => setVisibleMilestones(visible)}
            onClose={() => setConfigOpen(false)}
          />
        </TableArea>
      )}
      <MilestoneEditTearsheet
        projectId={editProjectId}
        onClose={() => setEditProjectId(null)}
      />
    </HubCardFrame>
  );
}
