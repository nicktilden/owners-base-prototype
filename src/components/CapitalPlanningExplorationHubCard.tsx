import React, { useEffect, useMemo, useState } from "react";
import { Button, Dropdown, Select, Tabs, Tooltip, Typography } from "@procore/core-react";
import { EllipsisVertical, Fullscreen } from "@procore/core-icons";
import styled from "styled-components";
import HubCardFrame from "@/components/hubs/HubCardFrame";
import { useHubFilters } from "@/context/HubFilterContext";
import { SAMPLE_PROJECT_ROWS } from "@/components/tools/capitalPlanning/capitalPlanningData";
import {
  buildCapitalPlanningHubChartSeries,
  filterCapitalPlanningRowsByProjectIds,
  type HubPlannedCostPeriodView,
} from "@/components/tools/capitalPlanning/capitalPlanningHubChartData";
import {
  CAPITAL_PLANNING_FISCAL_SETTINGS_CHANGED_EVENT,
  readCapitalPlanningFiscalYearStartMonth,
} from "@/utils/capitalPlanningFiscalSettings";

const FIGMA_CAPITAL_PLANNING_EXPLORATIONS =
  "https://www.figma.com/design/HHkPLbAONFYxhCrcfsrpEs/Capital-Planning-Explorations?node-id=5257-327707";

const PERIOD_OPTIONS: { value: HubPlannedCostPeriodView; label: string }[] = [
  { value: "Years", label: "Years" },
  { value: "Quarter", label: "Quarter" },
  { value: "Month", label: "Month" },
];

const PLANNED_BAR = "#2563eb";

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

/** Fills space so the period Select stays flush to the card’s right edge (with HubCardFrame horizontal padding). */
const ControlsTabsSlot = styled.div`
  flex: 1 1 auto;
  min-width: 0;
`;

const PeriodSelectWrap = styled.div`
  flex: 0 0 auto;
  width: 160px;
  max-width: 100%;
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
  text-transform: uppercase;
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
  height: 100%;
`;

const BarPair = styled.div`
  flex: 1 1 0;
  max-width: 28px;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

const BarFill = styled.div<{ $color: string; $pct: number }>`
  width: 100%;
  max-width: 24px;
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

/** Smooth Catmull-Rom–style cubic path through points (passes through all knots). */
function smoothPathFromPoints(pts: readonly { x: number; y: number }[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  if (pts.length === 2) {
    return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;
  }
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

function maxPlannedOnly(series: readonly { planned: number; actual: number }[]): number {
  let m = 0;
  for (const d of series) {
    m = Math.max(m, d.planned);
  }
  return m;
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

function hubBarPeriodNoun(view: HubPlannedCostPeriodView): string {
  if (view === "Years") return "year";
  if (view === "Quarter") return "quarter";
  return "month";
}

function HubBarChartPopover(props: { periodLabel: string; periodView: HubPlannedCostPeriodView; planned: number }) {
  const { periodLabel, periodView, planned } = props;
  const noun = hubBarPeriodNoun(periodView);

  return (
    <BarPopoverBody>
      {/*
        Tooltip.Content sets a light text color on the tooltip surface; Typography defaults
        to color gray15 (dark), which is invisible on Procore's dark tooltip. Force inherit.
      */}
      <Typography intent="body" weight="semibold" style={{ color: "inherit" }} as="div">
        {periodLabel}
      </Typography>
      <Typography intent="small" weight="semibold" style={{ color: "inherit" }} as="div">
        Planned amount: {formatAxisUsd(planned)}
      </Typography>
      <Typography intent="small" style={{ color: "inherit", opacity: 0.85 }} as="div">
        Planned amount for this {noun}. Aggregated from filtered program rows.
      </Typography>
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

  useEffect(() => {
    const sync = () => setFiscalYearStartMonth(readCapitalPlanningFiscalYearStartMonth());
    window.addEventListener(CAPITAL_PLANNING_FISCAL_SETTINGS_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CAPITAL_PLANNING_FISCAL_SETTINGS_CHANGED_EVENT, sync);
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
        undefined,
        fiscalYearStartMonth
      ),
    [filteredCpRows, periodView, fiscalYearStartMonth]
  );

  const yAxisLayout = useMemo(() => {
    const cap = niceAxisCap(maxPlannedOnly(chartSeries));
    const ticksAsc = linearYAxisTicks(cap);
    const labelsAsc = ticksAsc.map((v) => formatAxisUsd(v));
    return { cap, ticksAsc, labelsAsc };
  }, [chartSeries]);

  const xAxisTitle =
    periodView === "Years" ? "Fiscal years" : periodView === "Quarter" ? "Quarters" : "Months";

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
    const plannedPts = seriesToPoints(chartSeries, cap, "planned");
    const plannedPath = smoothPathFromPoints(plannedPts);
    return { plannedPts, plannedPath };
  }, [chartSeries, yAxisLayout.cap]);

  return (
    <HubCardFrame
      title="Planned Cost"
      infoTooltip={figmaTooltip}
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
          <PeriodSelectWrap>
            <Select
              block
              label={PERIOD_OPTIONS.find((o) => o.value === periodView)?.label}
              placeholder="Years"
              onSelect={(selection) => {
                if (selection.action !== "selected") return;
                setPeriodView(selection.item as HubPlannedCostPeriodView);
              }}
            >
              {PERIOD_OPTIONS.map((o) => (
                <Select.Option key={o.value} value={o.value} selected={periodView === o.value}>
                  {o.label}
                </Select.Option>
              ))}
            </Select>
          </PeriodSelectWrap>
        </ControlsRow>
      }
    >
      <LegendRow>
        <LegendItem>
          <LegendSwatch $color={PLANNED_BAR} aria-hidden />
          Planned amount
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
              {chartSeries.map((d, i) => (
                <BarGroup key={`${periodView}-${d.label}-${i}`}>
                  <BarPair>
                    <Tooltip
                      trigger={["hover", "focus"]}
                      placement="bottom"
                      padding={6}
                      aria-label={`${d.label} planned amount ${formatAxisUsd(d.planned)}`}
                      overlay={
                        <Tooltip.Content>
                          <HubBarChartPopover periodLabel={d.label} periodView={periodView} planned={d.planned} />
                        </Tooltip.Content>
                      }
                    >
                      <BarTooltipTrigger>
                        <BarFill $color={PLANNED_BAR} $pct={(d.planned / yAxisLayout.cap) * 100} />
                      </BarTooltipTrigger>
                    </Tooltip>
                  </BarPair>
                </BarGroup>
              ))}
            </BarsLayer>
            <XAxisRow>
              {chartSeries.map((d, i) => (
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
            <LineSvg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Planned amount line chart">
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
                <circle
                  key={`p-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r={0.22}
                  fill="var(--color-surface-primary)"
                  stroke={PLANNED_BAR}
                  strokeWidth={0.09}
                />
              ))}
            </LineSvg>
            <XAxisRow style={{ marginTop: 4 }}>
              {chartSeries.map((d, i) => (
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
