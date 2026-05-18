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

const VARIANCE_COLORS = {
  veryLow: "#0d9488",
  low: "#5eead4",
  neutral: "#f8fafc",
  high: "#fda4af",
  veryHigh: "#e11d48",
};

const VARIANCE_BANDS = [
  { key: "veryLow", label: "<-10%" },
  { key: "low", label: "-10% to -3%" },
  { key: "neutral", label: "-3% to +3%" },
  { key: "high", label: "+3% to +10%" },
  { key: "veryHigh", label: ">+10%" },
] as const;

type VarianceBandKey = (typeof VARIANCE_BANDS)[number]["key"];

const VIEW_BY_OPTIONS: readonly { id: HubPlannedCostPeriodView; label: string }[] = [
  { id: "Month", label: "Month" },
  { id: "Quarter", label: "Quarter" },
  { id: "Years", label: "Year" },
];

type VarianceRow = {
  rowId: string;
  rowLabel: string;
  plannedValues: number[];
  actualValues: number[];
  varianceValues: number[];
};

function quarterLabelForDisplay(raw: string): string {
  const match = raw.match(/^'(\d{2}) Q(\d)$/);
  if (!match) return raw;
  return `Q${match[2]} ${match[1]}`;
}

function variancePercent(planned: number, actual: number): number {
  if (!Number.isFinite(planned) || planned <= 0) return 0;
  return ((actual - planned) / planned) * 100;
}

function colorForVariance(pct: number): string {
  return VARIANCE_COLORS[varianceBandForPercent(pct)];
}

function textColorForVariance(pct: number): string {
  return pct > 10 || pct < -10 ? "var(--color-text-reversed)" : "var(--color-text-primary)";
}

function formatVariance(pct: number): string {
  if (!Number.isFinite(pct)) return "0%";
  const rounded = Math.round(pct);
  return `${rounded >= 0 ? "+" : ""}${rounded}%`;
}

function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function varianceBandForPercent(pct: number): VarianceBandKey {
  if (!Number.isFinite(pct)) return "neutral";
  if (pct < -10) return "veryLow";
  if (pct < -3) return "low";
  if (pct <= 3) return "neutral";
  if (pct <= 10) return "high";
  return "veryHigh";
}

function seededVariancePercent(rowIdx: number, colIdx: number): number {
  const pattern = [-15, -10, -8, -3, 0, 2, 5, 8, 12, 16, 21, 4] as const;
  return pattern[(rowIdx * 3 + colIdx) % pattern.length] ?? 0;
}

function seedVarianceRowsIfLimitedSpread(rows: readonly VarianceRow[]): VarianceRow[] {
  const bands = new Set<VarianceBandKey>();
  rows.forEach((row) => row.varianceValues.forEach((v) => bands.add(varianceBandForPercent(v))));
  if (bands.size >= 4) return [...rows];
  return rows.map((row, rowIdx) => ({
    ...row,
    varianceValues: row.varianceValues.map((value, colIdx) => {
      const seeded = seededVariancePercent(rowIdx, colIdx);
      // Force stronger spread when live values collapse into mostly one-sided bands (e.g., many -100% cells).
      if (!Number.isFinite(value)) return seeded;
      const blended = Math.round(seeded * 0.8 + value * 0.2);
      return Math.max(-25, Math.min(30, blended));
    }),
  }));
}

export default function CapitalPlanningForecastVarianceHeatmapHubCard(): React.ReactElement {
  const { filteredSeedProjects } = useHubFilters();
  const [fiscalYearStartMonth, setFiscalYearStartMonth] = React.useState(readCapitalPlanningFiscalYearStartMonth);
  const [periodView, setPeriodView] = React.useState<HubPlannedCostPeriodView>("Quarter");
  const programHorizon = useMemo(() => getProgramGridHorizon(), []);
  const latestAllowedDate = (() => {
    const today = new Date();
    return today < programHorizon.start ? programHorizon.start : today > programHorizon.end ? programHorizon.end : today;
  })();
  const [rangeStartDate, setRangeStartDate] = React.useState<Date | null>(programHorizon.start);
  const [rangeEndDate, setRangeEndDate] = React.useState<Date | null>(latestAllowedDate);
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
    return sample.map((d) => (periodView === "Quarter" ? quarterLabelForDisplay(d.label) : d.label));
  }, [fiscalYearStartMonth, periodView, rangeStartDate, rangeEndDate, programHorizon.start, programHorizon.end]);

  const rowsForHeatmap = useMemo<VarianceRow[]>(() => {
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
      const plannedValues = points.map((p) => p.planned ?? 0);
      const actualValues = points.map((p) => p.actual ?? 0);
      const varianceValues = points.map((p) => variancePercent(p.planned ?? 0, p.actual ?? 0));
      return { rowId: region, rowLabel: region, plannedValues, actualValues, varianceValues };
    });
  }, [filteredSeedProjects, fiscalYearStartMonth, periodView, rangeStartDate, rangeEndDate, programHorizon.start, programHorizon.end]);
  const displayRowsForHeatmap = useMemo(
    () => seedVarianceRowsIfLimitedSpread(rowsForHeatmap),
    [rowsForHeatmap]
  );

  return (
    <HubCardFrame
      title="Forecast vs Actuals by Region"
      infoTooltip="Variance between forecasted and actual realized costs by region and period."
      style={{ minHeight: 300, maxHeight: 420 }}
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <Button type="button" variant="tertiary" className="b_tertiary" size="sm" icon={<Fullscreen size="sm" />} aria-label="Full screen" onClick={() => {}} />
          <Dropdown
            variant="tertiary"
            className="b_tertiary"
            size="sm"
            icon={<EllipsisVertical size="sm" />}
            aria-label="Forecast variance heatmap card menu"
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
              aria-label="Forecast variance start date"
              clearRef={startDateClearRef}
              value={rangeStartDate ?? undefined}
              onChange={(next) => {
                if (!next) return;
                const endDate = rangeEndDate ?? latestAllowedDate;
                const clampedToHorizon =
                  next < programHorizon.start
                    ? programHorizon.start
                    : next > latestAllowedDate
                      ? latestAllowedDate
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
              aria-label="Forecast variance end date"
              clearRef={endDateClearRef}
              value={rangeEndDate ?? undefined}
              onChange={(next) => {
                if (!next) return;
                const startDate = rangeStartDate ?? programHorizon.start;
                const clampedToHorizon =
                  next < programHorizon.start
                    ? programHorizon.start
                    : next > latestAllowedDate
                      ? latestAllowedDate
                      : next;
                const clamped = clampedToHorizon < startDate ? startDate : clampedToHorizon;
                setRangeEndDate(clamped);
              }}
              onClear={() => setRangeEndDate(latestAllowedDate)}
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
      contentStyle={{ paddingTop: 12, background: "#fff" }}
    >
      <div style={{ overflowX: "auto", overflowY: "hidden", width: "100%", background: "#fff" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `170px repeat(${periodLabels.length}, minmax(0, 1fr))`,
            gap: 2,
            alignItems: "center",
            background: "#fff",
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
          {displayRowsForHeatmap.map(({ rowId, rowLabel, plannedValues, actualValues, varianceValues }, rowIdx) => (
            <React.Fragment key={rowId}>
              <Typography
                intent="small"
                weight="semibold"
                style={{ color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
              >
                {rowLabel}
              </Typography>
              {varianceValues.map((pct, idx) => {
                const forecastedValue = plannedValues[idx] ?? 0;
                const rawActualValue = actualValues[idx] ?? 0;
                const varianceAmount = rawActualValue - forecastedValue;
                const isFirstRow = rowIdx === 0;
                const isLastRow = rowIdx === displayRowsForHeatmap.length - 1;
                const isFirstPeriod = idx === 0;
                const isLastPeriod = idx === periodLabels.length - 1;
                const tileBorderRadius =
                  isFirstRow && isFirstPeriod
                    ? "4px 0 0 0"
                    : isFirstRow && isLastPeriod
                      ? "0 4px 0 0"
                      : isLastRow && isLastPeriod
                        ? "0 0 4px 0"
                        : isLastRow && isFirstPeriod
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
                          <span>Forecasted: {formatUsd(forecastedValue)}</span>
                          <span>Actuals: {formatUsd(rawActualValue)}</span>
                          <span>Variance: {formatUsd(varianceAmount)}</span>
                          <span>Variance %: {formatVariance(pct)}</span>
                        </div>
                      </Tooltip.Content>
                    }
                  >
                    <div
                      tabIndex={0}
                      style={{
                        height: 40,
                        borderRadius: tileBorderRadius,
                        background: colorForVariance(pct),
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
                          color: textColorForVariance(pct),
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {formatVariance(pct)}
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
        <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>Variance:</Typography>
        {VARIANCE_BANDS.map((band) => (
          <React.Fragment key={band.key}>
            <span
              aria-hidden="true"
              style={{ width: 10, height: 10, borderRadius: "50%", background: VARIANCE_COLORS[band.key], flexShrink: 0 }}
            />
            <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>
              {band.label}
            </Typography>
          </React.Fragment>
        ))}
      </div>
    </HubCardFrame>
  );
}
