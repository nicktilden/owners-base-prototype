import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, DateInput, Dropdown, Select, Tabs, Tooltip, Typography } from "@procore/core-react";
import { EllipsisVertical, Fullscreen } from "@procore/core-icons";
import styled from "styled-components";
import HubCardFrame from "@/components/hubs/HubCardFrame";
import { useHubFilters } from "@/context/HubFilterContext";
import { SAMPLE_PROJECT_ROWS } from "@/components/tools/capitalPlanning/capitalPlanningData";
import {
  buildCapitalPlanningHubChartSeries,
  filterCapitalPlanningRowsByProjectIds,
  type HubPlannedCostViewRange,
  type HubPlannedCostPeriodView,
} from "@/components/tools/capitalPlanning/capitalPlanningHubChartData";
import {
  CAPITAL_PLANNING_FISCAL_SETTINGS_CHANGED_EVENT,
  readCapitalPlanningFiscalYearStartMonth,
} from "@/utils/capitalPlanningFiscalSettings";
import {
  CAPITAL_PLANNING_TARGET_BUDGET_OVERRIDES_CHANGED_EVENT,
  readPersistedTargetBudgetForecastOverrides,
} from "@/utils/capitalPlanningTargetBudgetPersistence";
import {
  CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS,
  getProgramGridHorizon,
} from "@/components/tools/capitalPlanning/capitalPlanningForecast";

const FIGMA_CAPITAL_PLANNING_EXPLORATIONS =
  "https://www.figma.com/design/HHkPLbAONFYxhCrcfsrpEs/Capital-Planning-Explorations?node-id=5257-327707";

const PLANNED_BAR = "#2563eb";
const ACTUALS_BAR = "#0f766e";
const TARGET_BUDGET_BAR = "#7c3aed";

const ActionsWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const ControlsRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  width: 100%;
  min-width: 0;
  flex-wrap: wrap;
`;

const ControlsTabsSlot = styled.div`
  flex: 1 1 auto;
  min-width: 0;
`;

const ControlsSelectsSlot = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  min-width: 0;
`;

const ControlSelectWrap = styled.div`
  width: 170px;
  max-width: 100%;
`;

const DateRangeWrap = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

const LegendRow = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 8px;
  flex-wrap: wrap;
`;

const LegendItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  line-height: 16px;
  color: var(--color-text-primary);
`;

const LegendSwatch = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

/** X-axis row + title height; bar-chart grid stops above this so dashed lines do not cross FY labels. */
const CHART_X_AXIS_BLOCK_PX = 52;

const ChartFrame = styled.div`
  display: flex;
  width: 100%;
  min-height: 200px;
  gap: 8px;
  margin-top: 4px;
`;

const YAxisLabels = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 4px ${CHART_X_AXIS_BLOCK_PX}px 0;
  min-width: 108px;
  flex-shrink: 0;
`;

const YTick = styled.span`
  font-size: 11px;
  line-height: 1;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  text-align: right;
`;

const AmountAxisTitle = styled.span`
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  letter-spacing: 0.06em;
  margin-right: 4px;
  align-self: center;
`;

const PlotArea = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const GridBackground = styled.div`
  position: absolute;
  inset: 0 0 ${CHART_X_AXIS_BLOCK_PX}px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
`;

const GridLine = styled.div`
  border-top: 1px dashed var(--color-border-separator);
  width: 100%;
`;

const BarsLayer = styled.div`
  position: relative;
  flex: 1;
  min-height: 168px;
  display: flex;
  align-items: flex-end;
  justify-content: stretch;
  gap: 4px;
  padding-bottom: 2px;
`;

const BarGroup = styled.div`
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  height: 100%;
`;

const BarPair = styled.div`
  flex: 0 0 16px;
  max-width: 16px;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

const BarFill = styled.div<{ $color: string; $pct: number }>`
  width: 100%;
  max-width: 16px;
  height: ${({ $pct }) => `${Math.min(100, Math.max(0, $pct))}%`};
  min-height: ${({ $pct }) => ($pct > 0 ? 2 : 0)}px;
  background: ${({ $color }) => $color};
  border-radius: 3px 3px 1px 1px;
`;

/** Button reset: Tooltip/OverlayTrigger expects a focusable trigger for hover + keyboard + a11y. */
const BarTooltipTrigger = styled.button.attrs({ type: "button" })`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 0;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  font: inherit;
  color: inherit;
  cursor: default;
  text-align: inherit;

  &:focus-visible {
    outline: 2px solid var(--color-border-focus, #2563eb);
    outline-offset: 2px;
  }
`;

const BarPopoverBody = styled.div`
  max-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
  color: inherit;
`;

const XAxisRow = styled.div`
  display: flex;
  justify-content: stretch;
  gap: 4px;
  padding-top: 6px;
  border-top: 1px solid var(--color-border-separator);
  min-height: 22px;
`;

const XLabel = styled.span`
  flex: 1 1 0;
  min-width: 0;
  text-align: center;
  font-size: 11px;
  color: var(--color-text-secondary);
`;

const XAxisTitle = styled.div`
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-top: 4px;
`;

const LineSvg = styled.svg`
  width: 100%;
  height: 168px;
  display: block;
`;

const LINE_MARKER_RADIUS = 1.2;
const PLANNED_MARKER_X_OFFSET = 0;
const TARGET_MARKER_X_OFFSET = 0;
const ACTUAL_MARKER_X_OFFSET = 0;

/** Y positions in viewBox 0–100 (top = max dollars). */
function yForAmount(value: number, cap: number): number {
  const t = Math.min(1, Math.max(0, value / cap));
  return 100 - t * 100;
}

function seriesToPoints(
  series: readonly { planned: number; actual: number }[],
  cap: number,
  mode: "planned" | "actual"
): { x: number; y: number }[] {
  const n = series.length;
  if (n === 0) return [];
  return series.map((d, i) => ({
    x: n <= 1 ? 50 : (i / (n - 1)) * 100,
    y: yForAmount(mode === "planned" ? d.planned : d.actual, cap),
  }));
}

/** Straight line path through points (no curve smoothing). */
function smoothPathFromPoints(pts: readonly { x: number; y: number }[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i];
    d += ` L ${p.x} ${p.y}`;
  }
  return d;
}

function maxPlannedOnly(
  series: readonly { planned: number; actual: number; targetBudget?: number }[]
): number {
  let m = 0;
  for (const d of series) {
    m = Math.max(m, d.planned, d.actual, d.targetBudget ?? 0);
  }
  return m;
}

function targetBudgetByFiscalYearFromOverrides(
  overrides: Record<string, number>,
  fiscalYearCount: number,
  plannedByFy: readonly number[]
): number[] {
  const perHierarchy = new Map<string, number[]>();
  for (const [key, value] of Object.entries(overrides)) {
    if (!Number.isFinite(value) || value <= 0) continue;
    const m = /^tb-tier-(.+?)::fb:[^:]+::tb:m-(\d+)$/.exec(key);
    if (!m) continue;
    const hierarchyKey = m[1] ?? "";
    const monthIndex = Number(m[2] ?? -1);
    if (!Number.isFinite(monthIndex) || monthIndex < 0) continue;
    const fyIndex = Math.floor(monthIndex / 12);
    if (fyIndex < 0 || fyIndex >= fiscalYearCount) continue;
    if (!perHierarchy.has(hierarchyKey)) {
      perHierarchy.set(hierarchyKey, Array.from({ length: fiscalYearCount }, () => 0));
    }
    perHierarchy.get(hierarchyKey)![fyIndex] += value;
  }

  if (perHierarchy.size === 0) {
    const fallbackMultipliers = [1.18, 1.12, 1.08, 1.05, 1.03, 1.02];
    return Array.from({ length: fiscalYearCount }, (_, i) =>
      Math.round((plannedByFy[i] ?? 0) * (fallbackMultipliers[i] ?? 1.02))
    );
  }
  const keys = Array.from(perHierarchy.keys());
  const preferredRegionKeys = keys.filter((k) => k.startsWith("r:"));
  const keysToUse = preferredRegionKeys.length > 0 ? preferredRegionKeys : keys;
  const out = Array.from({ length: fiscalYearCount }, () => 0);
  for (const hierarchyKey of keysToUse) {
    const values = perHierarchy.get(hierarchyKey);
    if (!values) continue;
    for (let i = 0; i < fiscalYearCount; i++) out[i] += values[i] ?? 0;
  }
  return out;
}

/** Rounds up to a readable axis maximum with a little headroom above the data. */
function niceAxisCap(dataMax: number): number {
  if (!Number.isFinite(dataMax) || dataMax <= 0) return 1_000_000;
  const padded = dataMax * 1.12;
  const exp = Math.floor(Math.log10(padded));
  const frac = padded / 10 ** exp;
  let niceFrac: number;
  if (frac <= 1) niceFrac = 1;
  else if (frac <= 2) niceFrac = 2;
  else if (frac <= 2.5) niceFrac = 2.5;
  else if (frac <= 5) niceFrac = 5;
  else niceFrac = 10;
  return niceFrac * 10 ** exp;
}

/** Five evenly spaced tick amounts from cap/5 through cap (matches grid `space-between` layout). */
function linearYAxisTicks(axisCap: number): number[] {
  return [1, 2, 3, 4, 5].map((i) => (axisCap * i) / 5);
}

function formatAxisUsd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

const VIEW_BY_OPTIONS = [
  { id: "Years" as HubPlannedCostPeriodView, label: "Year" },
  { id: "Quarter" as HubPlannedCostPeriodView, label: "Quarter" },
  { id: "Month" as HubPlannedCostPeriodView, label: "Month" },
] as const;

function targetBudgetByPeriodFromOverrides(
  overrides: Record<string, number>,
  periodView: HubPlannedCostPeriodView,
  periodCount: number,
  plannedByPeriod: readonly number[]
): number[] {
  const fyValues = targetBudgetByFiscalYearFromOverrides(
    overrides,
    CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.length,
    plannedByPeriod
  );
  if (periodView === "Years") {
    return fyValues.slice(0, periodCount);
  }
  if (periodView === "Quarter") {
    const out: number[] = [];
    for (const fy of fyValues) {
      const perQuarter = fy / 4;
      out.push(perQuarter, perQuarter, perQuarter, perQuarter);
    }
    return out.slice(0, periodCount);
  }
  const out: number[] = [];
  for (const fy of fyValues) {
    const perMonth = fy / 12;
    for (let i = 0; i < 12; i++) out.push(perMonth);
  }
  return out.slice(0, periodCount);
}

function HubBarChartPopover(props: {
  periodLabel: string;
  planned: number;
  actual: number;
  targetBudget: number;
  showTargetBudget: boolean;
}) {
  const { periodLabel, planned, actual, targetBudget, showTargetBudget } = props;

  return (
    <BarPopoverBody>
      <Typography intent="body" weight="semibold" style={{ color: "inherit" }} as="div">
        {periodLabel}
      </Typography>
      <Typography intent="small" weight="semibold" style={{ color: "inherit" }} as="div">
        Forecasted: {formatAxisUsd(planned)}
      </Typography>
      <Typography intent="small" weight="semibold" style={{ color: "inherit" }} as="div">
        Actuals: {formatAxisUsd(actual)}
      </Typography>
      {showTargetBudget ? (
        <Typography intent="small" weight="semibold" style={{ color: "inherit" }} as="div">
          Target Budget: {formatAxisUsd(targetBudget)}
        </Typography>
      ) : null}
    </BarPopoverBody>
  );
}

/**
 * Hub “Planned Cost” card — Planned amount only (same program-horizon month model as the Capital Planning grid),
 * aggregated for hub-filtered seed projects.
 */
export default function CapitalPlanningExplorationHubCard() {
  const { filteredSeedProjects } = useHubFilters();
  const [chartTab, setChartTab] = useState<"bar" | "line">("bar");
  const [periodView, setPeriodView] = useState<HubPlannedCostPeriodView>("Years");
  const [fiscalYearStartMonth, setFiscalYearStartMonth] = useState(readCapitalPlanningFiscalYearStartMonth);
  const [targetBudgetOverrides, setTargetBudgetOverrides] = useState<Record<string, number>>(
    () => readPersistedTargetBudgetForecastOverrides()
  );
  const lineSvgRef = useRef<SVGSVGElement | null>(null);
  const [lineSvgAspectRatio, setLineSvgAspectRatio] = useState(1);
  const programHorizon = useMemo(() => getProgramGridHorizon(), []);
  const [rangeStartDate, setRangeStartDate] = useState<Date | null>(programHorizon.start);
  const [rangeEndDate, setRangeEndDate] = useState<Date | null>(programHorizon.end);
  const startDateClearRef = useRef<HTMLButtonElement>(null);
  const endDateClearRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const sync = () => setFiscalYearStartMonth(readCapitalPlanningFiscalYearStartMonth());
    window.addEventListener(CAPITAL_PLANNING_FISCAL_SETTINGS_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CAPITAL_PLANNING_FISCAL_SETTINGS_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const svgEl = lineSvgRef.current;
    if (!svgEl) return;
    const updateAspect = () => {
      const w = svgEl.clientWidth || 1;
      const h = svgEl.clientHeight || 1;
      setLineSvgAspectRatio(w / h);
    };
    updateAspect();
    const observer = new ResizeObserver(updateAspect);
    observer.observe(svgEl);
    return () => observer.disconnect();
  }, [chartTab]);

  useEffect(() => {
    const sync = () => setTargetBudgetOverrides(readPersistedTargetBudgetForecastOverrides());
    window.addEventListener(CAPITAL_PLANNING_TARGET_BUDGET_OVERRIDES_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CAPITAL_PLANNING_TARGET_BUDGET_OVERRIDES_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const filteredCpRows = useMemo(
    () =>
      filterCapitalPlanningRowsByProjectIds(
        SAMPLE_PROJECT_ROWS,
        new Set(filteredSeedProjects.map((p) => p.id))
      ),
    [filteredSeedProjects]
  );

  const chartSeries = useMemo(
    () =>
      buildCapitalPlanningHubChartSeries(
        filteredCpRows,
        periodView,
        new Date(),
        {
          start: rangeStartDate ?? programHorizon.start,
          end: rangeEndDate ?? programHorizon.end,
        } satisfies HubPlannedCostViewRange,
        fiscalYearStartMonth
      ),
    [filteredCpRows, periodView, rangeStartDate, rangeEndDate, fiscalYearStartMonth]
  );

  const chartSeriesWithTargetBudget = useMemo(() => {
    const targetByPeriod = targetBudgetByPeriodFromOverrides(
      targetBudgetOverrides,
      periodView,
      chartSeries.length,
      chartSeries.map((point) => point.planned)
    );
    return chartSeries.map((point, index) => ({
      ...point,
      targetBudget: targetByPeriod[index] ?? 0,
    }));
  }, [chartSeries, periodView, targetBudgetOverrides]);
  const showTargetBudget = periodView === "Years";
  const chartSeriesForRender = useMemo(
    () =>
      chartSeriesWithTargetBudget.map((point) => ({
        ...point,
        targetBudget: showTargetBudget ? point.targetBudget : 0,
      })),
    [chartSeriesWithTargetBudget, showTargetBudget]
  );

  const yAxisLayout = useMemo(() => {
    const cap = niceAxisCap(maxPlannedOnly(chartSeriesForRender));
    const ticksAsc = linearYAxisTicks(cap);
    const labelsAsc = ticksAsc.map((v) => formatAxisUsd(v));
    return { cap, ticksAsc, labelsAsc };
  }, [chartSeriesForRender]);

  const xAxisTitle =
    periodView === "Years" ? "Fiscal Years" : periodView === "Quarter" ? "Quarters" : "Months";

  const filteredSummary = useMemo(() => {
    const totalPlanned = filteredCpRows.reduce(
      (s, r) => s + (Number.isFinite(r.plannedAmount) ? r.plannedAmount : 0),
      0
    );
    return { projectCount: filteredCpRows.length, totalPlanned };
  }, [filteredCpRows]);

  const figmaTooltip = (
    <>
      Planned amount by period uses the same program-grid month model as the Capital Planning table: full Planned
      Amount spread by curve and schedule over the program horizon. Design reference:{" "}
      <a href={FIGMA_CAPITAL_PLANNING_EXPLORATIONS} target="_blank" rel="noopener noreferrer">
        Figma — Capital Planning Explorations
      </a>
      . Hub filters apply to {filteredSummary.projectCount} project
      {filteredSummary.projectCount === 1 ? "" : "s"} ({formatAxisUsd(filteredSummary.totalPlanned)} total planned
      amount on those seed rows).
    </>
  );

  const lineGeom = useMemo(() => {
    const cap = yAxisLayout.cap;
    const plannedPts = seriesToPoints(chartSeriesForRender, cap, "planned");
    const actualPts = seriesToPoints(chartSeriesForRender, cap, "actual");
    const targetPts = chartSeriesForRender.map((d, i) => ({
      x: chartSeriesForRender.length <= 1 ? 50 : (i / (chartSeriesForRender.length - 1)) * 100,
      y: yForAmount(d.targetBudget ?? 0, cap),
    }));
    const plannedPath = smoothPathFromPoints(plannedPts);
    const actualPath = smoothPathFromPoints(actualPts);
    const targetPath = smoothPathFromPoints(targetPts);
    return { plannedPts, plannedPath, actualPts, actualPath, targetPts, targetPath };
  }, [chartSeriesForRender, yAxisLayout.cap]);
  const lineMarkerRx = Math.max(0.12, LINE_MARKER_RADIUS / Math.max(1, lineSvgAspectRatio));

  return (
    <HubCardFrame
      title="Forecasted vs Target Budget vs Actuals"
      style={{ minHeight: 320, maxHeight: 560 }}
      contentStyle={{ paddingTop: 16 }}
      actions={
        <ActionsWrap>
          <Button
            type="button"
            variant="tertiary"
            className="b_tertiary"
            size="sm"
            icon={<Fullscreen size="sm" />}
            aria-label="Full screen"
            onClick={() => {}}
          />
          <Dropdown
            variant="tertiary"
            className="b_tertiary"
            size="sm"
            icon={<EllipsisVertical size="sm" />}
            aria-label="Planned cost card menu"
            placement="bottom-right"
            onSelect={(selection) => {
              if (selection.action !== "selected") return;
            }}
          >
            <Dropdown.Item item="export">Export</Dropdown.Item>
            <Dropdown.Item item="refresh">Refresh</Dropdown.Item>
          </Dropdown>
        </ActionsWrap>
      }
      controls={
        <ControlsRow>
          <ControlsTabsSlot>
            <Tabs>
              <Tabs.Tab
                selected={chartTab === "bar"}
                onPress={() => setChartTab("bar")}
                role="button"
              >
                <Tabs.Link>Bar Chart</Tabs.Link>
              </Tabs.Tab>
              <Tabs.Tab
                selected={chartTab === "line"}
                onPress={() => setChartTab("line")}
                role="button"
              >
                <Tabs.Link>Line Chart</Tabs.Link>
              </Tabs.Tab>
            </Tabs>
          </ControlsTabsSlot>
          <ControlsSelectsSlot>
            <DateRangeWrap>
              <DateInput
                aria-label="Chart start date"
                clearRef={startDateClearRef}
                value={rangeStartDate ?? undefined}
                onChange={(next) => {
                  if (!next) return;
                  const endDate = rangeEndDate ?? programHorizon.end;
                  const clampedToHorizon =
                    next < programHorizon.start
                      ? programHorizon.start
                      : next > programHorizon.end
                        ? programHorizon.end
                        : next;
                  const clamped = clampedToHorizon > endDate ? endDate : clampedToHorizon;
                  setRangeStartDate(clamped);
                }}
                onClear={() => setRangeStartDate(programHorizon.start)}
                style={{ width: 148 }}
              />
              <Typography intent="small" as="span" style={{ color: "var(--color-text-secondary)" }}>
                to
              </Typography>
              <DateInput
                aria-label="Chart end date"
                clearRef={endDateClearRef}
                value={rangeEndDate ?? undefined}
                onChange={(next) => {
                  if (!next) return;
                  const startDate = rangeStartDate ?? programHorizon.start;
                  const clampedToHorizon =
                    next < programHorizon.start
                      ? programHorizon.start
                      : next > programHorizon.end
                        ? programHorizon.end
                        : next;
                  const clamped = clampedToHorizon < startDate ? startDate : clampedToHorizon;
                  setRangeEndDate(clamped);
                }}
                onClear={() => setRangeEndDate(programHorizon.end)}
                style={{ width: 148 }}
              />
            </DateRangeWrap>
            <ControlSelectWrap>
              <Select
                block
                placeholder="View by"
                label={VIEW_BY_OPTIONS.find((o) => o.id === periodView)?.label}
                onSelect={(selection) => {
                  if (selection.action !== "selected") return;
                  const item = selection.item as (typeof VIEW_BY_OPTIONS)[number];
                  setPeriodView(item.id);
                }}
              >
                {VIEW_BY_OPTIONS.map((o) => (
                  <Select.Option key={o.id} value={o} selected={periodView === o.id}>
                    {o.label}
                  </Select.Option>
                ))}
              </Select>
            </ControlSelectWrap>
          </ControlsSelectsSlot>
        </ControlsRow>
      }
    >
      <LegendRow>
        <LegendItem>
          <LegendSwatch $color={PLANNED_BAR} aria-hidden />
          Forecasted
        </LegendItem>
        {showTargetBudget ? (
          <LegendItem>
            <LegendSwatch $color={TARGET_BUDGET_BAR} aria-hidden />
            Target Budget
          </LegendItem>
        ) : null}
        <LegendItem>
          <LegendSwatch $color={ACTUALS_BAR} aria-hidden />
          Actuals
        </LegendItem>
      </LegendRow>

      {chartTab === "bar" ? (
        <ChartFrame>
          <AmountAxisTitle>Amount</AmountAxisTitle>
          <YAxisLabels>
            {[...yAxisLayout.labelsAsc].reverse().map((t, idx) => (
              <YTick key={`bar-y-${periodView}-${idx}-${t}`}>{t}</YTick>
            ))}
          </YAxisLabels>
          <PlotArea>
            <GridBackground>
              {yAxisLayout.labelsAsc.map((_, i) => (
                <GridLine key={`bar-grid-${periodView}-${i}`} />
              ))}
            </GridBackground>
            <BarsLayer>
              {chartSeriesForRender.map((d, i) => (
                <Tooltip
                  key={`${periodView}-${d.label}-${i}`}
                  trigger={["hover", "focus"]}
                  placement="bottom"
                  padding={6}
                  aria-label={`${d.label} values`}
                  overlay={
                    <Tooltip.Content>
                      <HubBarChartPopover
                        periodLabel={d.label}
                        planned={d.planned}
                        actual={d.actual}
                        targetBudget={d.targetBudget ?? 0}
                        showTargetBudget={showTargetBudget}
                      />
                    </Tooltip.Content>
                  }
                >
                  <BarGroup>
                    <BarPair>
                      <BarTooltipTrigger>
                        <BarFill $color={PLANNED_BAR} $pct={(d.planned / yAxisLayout.cap) * 100} />
                      </BarTooltipTrigger>
                    </BarPair>
                    <BarPair>
                      <BarTooltipTrigger>
                        <BarFill $color={TARGET_BUDGET_BAR} $pct={((d.targetBudget ?? 0) / yAxisLayout.cap) * 100} />
                      </BarTooltipTrigger>
                    </BarPair>
                    <BarPair>
                      <BarTooltipTrigger>
                        <BarFill $color={ACTUALS_BAR} $pct={(d.actual / yAxisLayout.cap) * 100} />
                      </BarTooltipTrigger>
                    </BarPair>
                  </BarGroup>
                </Tooltip>
              ))}
            </BarsLayer>
            <XAxisRow>
              {chartSeriesForRender.map((d, i) => (
                <XLabel key={`${periodView}-${d.label}-x-${i}`}>{d.label}</XLabel>
              ))}
            </XAxisRow>
            <XAxisTitle>{xAxisTitle}</XAxisTitle>
          </PlotArea>
        </ChartFrame>
      ) : (
        <ChartFrame>
          <AmountAxisTitle>Amount</AmountAxisTitle>
          <YAxisLabels>
            {[...yAxisLayout.labelsAsc].reverse().map((t, idx) => (
              <YTick key={`line-y-${periodView}-${idx}-${t}`}>{t}</YTick>
            ))}
          </YAxisLabels>
          <PlotArea>
            <LineSvg
              ref={lineSvgRef}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              role="img"
              aria-label="Planned amount and actuals line chart"
            >
              <rect x="0" y="0" width="100" height="100" fill="var(--color-surface-primary)" />
              {yAxisLayout.ticksAsc.map((amt) => {
                const y = yForAmount(amt, yAxisLayout.cap);
                return (
                  <line
                    key={`${periodView}-grid-${amt}`}
                    x1="0"
                    x2="100"
                    y1={y}
                    y2={y}
                    stroke="var(--color-border-separator)"
                    strokeWidth={0.35}
                    strokeDasharray="1.5 1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
              <line
                x1="0"
                x2="100"
                y1="100"
                y2="100"
                stroke="var(--color-border-separator)"
                strokeWidth={0.6}
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={lineGeom.plannedPath}
                fill="none"
                stroke={PLANNED_BAR}
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              {lineGeom.plannedPts.map((p, i) => (
                <g key={`p-${i}`}>
                  <ellipse
                    cx={p.x + PLANNED_MARKER_X_OFFSET}
                    cy={p.y}
                    rx={Math.max(2.2, lineMarkerRx * 8)}
                    ry={Math.max(2.2, LINE_MARKER_RADIUS * 2)}
                    fill="transparent"
                    style={{ pointerEvents: "all" }}
                    tabIndex={0}
                  >
                    <title>{`${chartSeriesForRender[i]?.label ?? "Period"} Forecasted: ${formatAxisUsd(
                      chartSeriesForRender[i]?.planned ?? 0
                    )}`}</title>
                  </ellipse>
                  <ellipse
                    cx={p.x + PLANNED_MARKER_X_OFFSET}
                    cy={p.y}
                    rx={lineMarkerRx}
                    ry={LINE_MARKER_RADIUS}
                    fill={PLANNED_BAR}
                  />
                </g>
              ))}
              {showTargetBudget ? (
                <>
                  <path
                    d={lineGeom.targetPath}
                    fill="none"
                    stroke={TARGET_BUDGET_BAR}
                    strokeWidth={1.75}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                  {lineGeom.targetPts.map((p, i) => (
                    <g key={`t-${i}`}>
                      <ellipse
                        cx={p.x + TARGET_MARKER_X_OFFSET}
                        cy={p.y}
                        rx={Math.max(2.2, lineMarkerRx * 8)}
                        ry={Math.max(2.2, LINE_MARKER_RADIUS * 2)}
                        fill="transparent"
                        style={{ pointerEvents: "all" }}
                        tabIndex={0}
                      >
                        <title>{`${chartSeriesForRender[i]?.label ?? "Period"} Target Budget: ${formatAxisUsd(
                          chartSeriesForRender[i]?.targetBudget ?? 0
                        )}`}</title>
                      </ellipse>
                      <ellipse
                        cx={p.x + TARGET_MARKER_X_OFFSET}
                        cy={p.y}
                        rx={lineMarkerRx}
                        ry={LINE_MARKER_RADIUS}
                        fill={TARGET_BUDGET_BAR}
                      />
                    </g>
                  ))}
                </>
              ) : null}
              <path
                d={lineGeom.actualPath}
                fill="none"
                stroke={ACTUALS_BAR}
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              {lineGeom.actualPts.map((p, i) => (
                <g key={`a-${i}`}>
                  <ellipse
                    cx={p.x + ACTUAL_MARKER_X_OFFSET}
                    cy={p.y}
                    rx={Math.max(2.2, lineMarkerRx * 8)}
                    ry={Math.max(2.2, LINE_MARKER_RADIUS * 2)}
                    fill="transparent"
                    style={{ pointerEvents: "all" }}
                    tabIndex={0}
                  >
                    <title>{`${chartSeriesForRender[i]?.label ?? "Period"} Actuals: ${formatAxisUsd(
                      chartSeriesForRender[i]?.actual ?? 0
                    )}`}</title>
                  </ellipse>
                  <ellipse
                    cx={p.x + ACTUAL_MARKER_X_OFFSET}
                    cy={p.y}
                    rx={lineMarkerRx}
                    ry={LINE_MARKER_RADIUS}
                    fill={ACTUALS_BAR}
                  />
                </g>
              ))}
            </LineSvg>
            <XAxisRow style={{ marginTop: 4 }}>
              {chartSeriesForRender.map((d, i) => (
                <XLabel key={`${periodView}-${d.label}-lx-${i}`}>{d.label}</XLabel>
              ))}
            </XAxisRow>
            <XAxisTitle>{xAxisTitle}</XAxisTitle>
          </PlotArea>
        </ChartFrame>
      )}
    </HubCardFrame>
  );
}
