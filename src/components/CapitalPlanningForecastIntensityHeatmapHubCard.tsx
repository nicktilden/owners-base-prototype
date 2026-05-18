import React, { useMemo } from "react";
import { Button, DateInput, Dropdown, Select, Tooltip, Typography } from "@procore/core-react";
import { EllipsisVertical, Fullscreen } from "@procore/core-icons";
import HubCardFrame from "@/components/hubs/HubCardFrame";
import { useHubFilters } from "@/context/HubFilterContext";
import {
  SAMPLE_PROJECT_ROWS,
  CAPITAL_PLANNING_REGIONS,
  assignedCapitalPlanningRegion,
  type CapitalPlanningSampleRow,
} from "@/components/tools/capitalPlanning/capitalPlanningData";
import {
  CAPITAL_PLANNING_FISCAL_SETTINGS_CHANGED_EVENT,
  readCapitalPlanningFiscalYearStartMonth,
} from "@/utils/capitalPlanningFiscalSettings";
import {
  buildCapitalPlanningHubChartSeries,
  filterCapitalPlanningRowsByProjectIds,
  type HubPlannedCostViewRange,
  type HubPlannedCostPeriodView,
} from "@/components/tools/capitalPlanning/capitalPlanningHubChartData";
import { getProgramGridHorizon } from "@/components/tools/capitalPlanning/capitalPlanningForecast";

const INTENSITY_COLORS = {
  empty: "var(--color-surface-secondary)",
  low: "var(--color-pill-bg-cyan)",
  medium: "var(--color-pill-bg-blue)",
  high: "#60a5fa",
  veryHigh: "#1d4ed8",
};

function formatUsd(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "$0";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function quarterLabelForDisplay(raw: string): string {
  const match = raw.match(/^'(\d{2}) Q(\d)$/);
  if (!match) return raw;
  return `Q${match[2]} ${match[1]}`;
}

type IntensityScale = {
  low: number;
  medium: number;
  high: number;
  labels: {
    low: string;
    medium: string;
    high: string;
    veryHigh: string;
  };
};

const VIEW_BY_OPTIONS: readonly { id: HubPlannedCostPeriodView; label: string }[] = [
  { id: "Month", label: "Month" },
  { id: "Quarter", label: "Quarter" },
  { id: "Years", label: "Year" },
];

function intensityScaleForView(periodView: HubPlannedCostPeriodView): IntensityScale {
  if (periodView === "Month") {
    return {
      low: 500_000,
      medium: 1_500_000,
      high: 3_000_000,
      labels: { low: "<0.5", medium: "0.5-1.5", high: "1.5-3.0", veryHigh: ">3.0" },
    };
  }
  if (periodView === "Quarter") {
    return {
      low: 1_500_000,
      medium: 4_000_000,
      high: 8_000_000,
      labels: { low: "<1.5", medium: "1.5-4.0", high: "4.0-8.0", veryHigh: ">8.0" },
    };
  }
  return {
    low: 5_000_000,
    medium: 15_000_000,
    high: 30_000_000,
    labels: { low: "<5", medium: "5-15", high: "15-30", veryHigh: ">30" },
  };
}

function colorForIntensity(amount: number, scale: IntensityScale): string {
  if (!Number.isFinite(amount) || amount <= 0) return INTENSITY_COLORS.empty;
  if (amount < scale.low) return INTENSITY_COLORS.low;
  if (amount < scale.medium) return INTENSITY_COLORS.medium;
  if (amount < scale.high) return INTENSITY_COLORS.high;
  return INTENSITY_COLORS.veryHigh;
}

function intensityBandForAmount(amount: number, scale: IntensityScale): 0 | 1 | 2 | 3 | 4 {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  if (amount < scale.low) return 1;
  if (amount < scale.medium) return 2;
  if (amount < scale.high) return 3;
  return 4;
}

function spreadValuesAcrossBands(
  rows: readonly IntensityRow[],
  scale: IntensityScale
): IntensityRow[] {
  const bands = new Set<number>();
  rows.forEach((r) => r.values.forEach((v) => bands.add(intensityBandForAmount(v, scale))));
  if (bands.size >= 4) return [...rows];

  const multipliers = [0.25, 0.55, 0.9, 1.3, 1.75, 2.2, 2.7, 3.1] as const;
  return rows.map((r, rowIdx) => {
    const values = r.values.map((v, colIdx) => {
      if (v <= 0) return v;
      const m = multipliers[(rowIdx + colIdx) % multipliers.length] ?? 1;
      return Math.round(v * m);
    });
    return {
      ...r,
      values,
      total: values.reduce((sum, v) => sum + (v ?? 0), 0),
    };
  });
}

type IntensityRow = {
  rowId: string;
  rowLabel: string;
  values: number[];
  total: number;
};

export default function CapitalPlanningForecastIntensityHeatmapHubCard(): React.ReactElement {
  const { filteredSeedProjects } = useHubFilters();
  const [fiscalYearStartMonth, setFiscalYearStartMonth] = React.useState(readCapitalPlanningFiscalYearStartMonth);
  const [periodView, setPeriodView] = React.useState<HubPlannedCostPeriodView>("Quarter");
  const programHorizon = useMemo(() => getProgramGridHorizon(), []);
  const [rangeStartDate, setRangeStartDate] = React.useState<Date | null>(programHorizon.start);
  const [rangeEndDate, setRangeEndDate] = React.useState<Date | null>(programHorizon.end);
  const startDateClearRef = React.useRef<HTMLButtonElement>(null);
  const endDateClearRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const sync = () => setFiscalYearStartMonth(readCapitalPlanningFiscalYearStartMonth());
    window.addEventListener(CAPITAL_PLANNING_FISCAL_SETTINGS_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CAPITAL_PLANNING_FISCAL_SETTINGS_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const periodLabels = useMemo(() => {
    const sample = buildCapitalPlanningHubChartSeries(
      [SAMPLE_PROJECT_ROWS[0]!],
      periodView,
      new Date(),
      {
        start: rangeStartDate ?? programHorizon.start,
        end: rangeEndDate ?? programHorizon.end,
      } satisfies HubPlannedCostViewRange,
      fiscalYearStartMonth
    );
    return sample.map((d) => {
      if (periodView === "Quarter") return quarterLabelForDisplay(d.label);
      return d.label;
    });
  }, [fiscalYearStartMonth, periodView, rangeStartDate, rangeEndDate, programHorizon.start, programHorizon.end]);

  const rowsForHeatmap = useMemo<IntensityRow[]>(() => {
    const allowed = new Set(filteredSeedProjects.map((p) => p.id));
    const filteredRows = filterCapitalPlanningRowsByProjectIds(SAMPLE_PROJECT_ROWS, allowed);
    const sourceRows = filteredRows.length > 0 ? filteredRows : SAMPLE_PROJECT_ROWS;
    const rowsByRegion = new Map<string, CapitalPlanningSampleRow[]>();
    sourceRows.forEach((row) => {
      const region = assignedCapitalPlanningRegion(row.id);
      if (!rowsByRegion.has(region)) rowsByRegion.set(region, []);
      rowsByRegion.get(region)!.push(row);
    });
    return CAPITAL_PLANNING_REGIONS.map((region) => {
      const regionRows = rowsByRegion.get(region) ?? [];
      const points = buildCapitalPlanningHubChartSeries(
        regionRows,
        periodView,
        new Date(),
        {
          start: rangeStartDate ?? programHorizon.start,
          end: rangeEndDate ?? programHorizon.end,
        } satisfies HubPlannedCostViewRange,
        fiscalYearStartMonth
      );
      const values = points.map((p) => p.planned ?? 0);
      const total = values.reduce((sum, v) => sum + (v ?? 0), 0);
      return { rowId: region, rowLabel: region, values, total };
    });
  }, [filteredSeedProjects, fiscalYearStartMonth, periodView, rangeStartDate, rangeEndDate, programHorizon.start, programHorizon.end]);

  const intensityScale = useMemo(() => intensityScaleForView(periodView), [periodView]);
  const displayRowsForHeatmap = useMemo(
    () => spreadValuesAcrossBands(rowsForHeatmap, intensityScale),
    [rowsForHeatmap, intensityScale]
  );
  const isYearView = periodView === "Years";

  return (
    <HubCardFrame
      title="Forecast Intensity Heatmap"
      infoTooltip={`Shows forecast concentration by project and ${periodView === "Years" ? "year" : periodView.toLowerCase()}. Darker tiles indicate heavier forecast spend.`}
      style={{ minHeight: 300, maxHeight: 420 }}
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <Button type="button" variant="tertiary" className="b_tertiary" size="sm" icon={<Fullscreen size="sm" />} aria-label="Full screen" onClick={() => {}} />
          <Dropdown
            variant="tertiary"
            className="b_tertiary"
            size="sm"
            icon={<EllipsisVertical size="sm" />}
            aria-label="Forecast intensity heatmap card menu"
            placement="bottom-right"
          >
            <Dropdown.Item item="export">Export</Dropdown.Item>
            <Dropdown.Item item="refresh">Refresh</Dropdown.Item>
          </Dropdown>
        </div>
      }
      controls={
        <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <DateInput
              aria-label="Forecast intensity start date"
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
              aria-label="Forecast intensity end date"
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
          </div>
          <div style={{ width: 140, maxWidth: "100%" }}>
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
              {VIEW_BY_OPTIONS.map((option) => (
                <Select.Option key={option.id} value={option} selected={periodView === option.id}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      }
      contentStyle={{ paddingTop: 12 }}
    >
      <div style={{ overflowX: "auto", overflowY: "hidden", width: "100%", background: "#fff" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isYearView
              ? `170px repeat(${periodLabels.length}, minmax(0, 1fr))`
              : `170px repeat(${periodLabels.length}, 92px)`,
            gap: 2,
            alignItems: "center",
            background: "#fff",
            minWidth: isYearView
              ? undefined
              : `${170 + periodLabels.length * 92 + periodLabels.length * 2}px`,
          }}
        >
          <div />
          {periodLabels.map((label) => (
            <Typography
              key={label}
              intent="small"
              weight="semibold"
              style={{ color: "var(--color-text-secondary)", textAlign: "center", paddingBottom: 6 }}
            >
              {label}
            </Typography>
          ))}
          {displayRowsForHeatmap.map(({ rowId, rowLabel, values }, rowIdx) => (
            <React.Fragment key={rowId}>
              <Typography
                intent="small"
                weight="semibold"
                style={{ color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
              >
                {rowLabel}
              </Typography>
              {values.map((amount, idx) => {
                const isFirstRow = rowIdx === 0;
                const isLastRow = rowIdx === displayRowsForHeatmap.length - 1;
                const isFirstQuarter = idx === 0;
                const isLastQuarter = idx === periodLabels.length - 1;
                const tileBorderRadius =
                  isFirstRow && isFirstQuarter
                    ? "4px 0 0 0"
                    : isFirstRow && isLastQuarter
                      ? "0 4px 0 0"
                      : isLastRow && isLastQuarter
                        ? "0 0 4px 0"
                        : isLastRow && isFirstQuarter
                          ? "0 0 0 4px"
                          : "0";
                return (
                  <Tooltip
                    key={`${rowId}-${idx}`}
                    trigger={["hover", "focus"]}
                    placement="top"
                    overlay={
                      <Tooltip.Content>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <span>{rowLabel} · {periodLabels[idx]}</span>
                          <span>Forecasted: {formatUsd(amount)}</span>
                        </div>
                      </Tooltip.Content>
                    }
                  >
                    <div
                      tabIndex={0}
                      style={{
                        height: 40,
                        borderRadius: tileBorderRadius,
                        background: colorForIntensity(amount, intensityScale),
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 6px",
                      }}
                    >
                      <Typography
                        intent="small"
                        weight="semibold"
                        style={{
                          color: amount >= intensityScale.medium ? "var(--color-text-reversed)" : "var(--color-text-primary)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {amount > 0 ? `${(amount / 1_000_000).toFixed(1)}M` : "–"}
                      </Typography>
                    </div>
                  </Tooltip>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
        <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>Spend ($M):</Typography>
        <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: "50%", background: INTENSITY_COLORS.empty, flexShrink: 0 }} />
        <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>0</Typography>
        <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: "50%", background: INTENSITY_COLORS.low, flexShrink: 0 }} />
        <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>{intensityScale.labels.low}</Typography>
        <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: "50%", background: INTENSITY_COLORS.medium, flexShrink: 0 }} />
        <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>{intensityScale.labels.medium}</Typography>
        <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: "50%", background: INTENSITY_COLORS.high, flexShrink: 0 }} />
        <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>{intensityScale.labels.high}</Typography>
        <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: "50%", background: INTENSITY_COLORS.veryHigh, flexShrink: 0 }} />
        <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>{intensityScale.labels.veryHigh}</Typography>
      </div>
    </HubCardFrame>
  );
}
