import React, { useMemo } from "react";
import { Button, Dropdown, Tooltip, Typography } from "@procore/core-react";
import { EllipsisVertical, Fullscreen } from "@procore/core-icons";
import HubCardFrame from "@/components/hubs/HubCardFrame";
import { useHubFilters } from "@/context/HubFilterContext";
import {
  SAMPLE_PROJECT_ROWS,
  CAPITAL_PLANNING_REGIONS,
  assignedCapitalPlanningRegion,
} from "@/components/tools/capitalPlanning/capitalPlanningData";
import {
  buildCapitalPlanningHubChartSeries,
  filterCapitalPlanningRowsByProjectIds,
} from "@/components/tools/capitalPlanning/capitalPlanningHubChartData";
import { CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS } from "@/components/tools/capitalPlanning/capitalPlanningForecast";
import {
  CAPITAL_PLANNING_FISCAL_SETTINGS_CHANGED_EVENT,
  readCapitalPlanningFiscalYearStartMonth,
} from "@/utils/capitalPlanningFiscalSettings";
import {
  CAPITAL_PLANNING_TARGET_BUDGET_OVERRIDES_CHANGED_EVENT,
  readPersistedTargetBudgetForecastOverrides,
} from "@/utils/capitalPlanningTargetBudgetPersistence";

const HEAT_COLORS = {
  empty: "#f5f7fa",
  under: "#d1fae5",
  near: "#fef3c7",
  over: "#fdba74",
  highOver: "#ef4444",
};

function cellColorFromRatioPercent(ratioPercent: number | null): string {
  if (ratioPercent === null || !Number.isFinite(ratioPercent)) return HEAT_COLORS.empty;
  if (ratioPercent < 80) return HEAT_COLORS.under;
  if (ratioPercent <= 100) return HEAT_COLORS.near;
  if (ratioPercent <= 120) return HEAT_COLORS.over;
  return HEAT_COLORS.highOver;
}

function formatUsdShort(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "$0";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatPercent(n: number | null): string {
  if (n === null || !Number.isFinite(n)) return "—";
  return `${Math.round(n)}%`;
}

function normalizeLabel(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function targetBudgetByRegionAndYear(
  overrides: Record<string, number>
): Record<string, number[]> {
  const fyCount = CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.length;
  const perHierarchy = new Map<string, number[]>();
  for (const [key, value] of Object.entries(overrides)) {
    if (!Number.isFinite(value) || value <= 0) continue;
    const m = /^tb-tier-(.+?)::fb:[^:]+::tb:m-(\d+)$/.exec(key);
    if (!m) continue;
    const hierarchyKey = m[1] ?? "";
    const monthIndex = Number(m[2] ?? -1);
    if (!Number.isFinite(monthIndex) || monthIndex < 0) continue;
    const fyIndex = Math.floor(monthIndex / 12);
    if (fyIndex < 0 || fyIndex >= fyCount) continue;
    if (!perHierarchy.has(hierarchyKey)) {
      perHierarchy.set(hierarchyKey, Array.from({ length: fyCount }, () => 0));
    }
    perHierarchy.get(hierarchyKey)![fyIndex] += value;
  }

  const out: Record<string, number[]> = {};
  const regionHierarchyKeys = Array.from(perHierarchy.keys()).filter((k) => k.startsWith("r:"));
  for (const region of CAPITAL_PLANNING_REGIONS) {
    const expectedKey = `r:${region}`;
    const fallbackKey = regionHierarchyKeys.find(
      (k) => normalizeLabel(k.slice(2)) === normalizeLabel(region)
    );
    const vals = perHierarchy.get(expectedKey) ?? (fallbackKey ? perHierarchy.get(fallbackKey) : undefined);
    out[region] = vals ? [...vals] : Array.from({ length: fyCount }, () => 0);
  }
  return out;
}

function hasAnyPositiveCell(data: Record<string, number[]>): boolean {
  for (const row of Object.values(data)) {
    for (const v of row) {
      if ((v ?? 0) > 0) return true;
    }
  }
  return false;
}

function seedForecastByRegionYearFromCapitalPlan(
  forecastByRegionYear: Record<string, number[]>
): Record<string, number[]> {
  const fyCount = CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.length;
  const totalObservedForecast = Object.values(forecastByRegionYear)
    .flat()
    .reduce((sum, v) => sum + (v ?? 0), 0);
  const baseTotal = totalObservedForecast > 0 ? totalObservedForecast : 600_000_000;
  return Object.fromEntries(
    CAPITAL_PLANNING_REGIONS.map((region, regionIdx) => {
      const seeded = Array.from({ length: fyCount }, (_, fyIdx) => {
        const regionWeight = 0.85 + ((regionIdx % 6) * 0.07);
        const yearWeight = 0.9 + fyIdx * 0.06;
        const raw = (baseTotal / (fyCount * CAPITAL_PLANNING_REGIONS.length)) * regionWeight * yearWeight;
        return Math.round(raw);
      });
      return [region, seeded];
    })
  );
}

function seedTargetBudgetByRegionYearFromForecast(
  forecastByRegionYear: Record<string, number[]>
): Record<string, number[]> {
  const fyCount = CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.length;
  // Cycle forecast/target ratios so seeded heatmap always shows green, yellow, and dark red cells.
  const ratioPattern = [0.82, 0.97, 1.06, 1.22, 1.34, 0.88] as const;
  return Object.fromEntries(
    CAPITAL_PLANNING_REGIONS.map((region, regionIdx) => {
      const forecastRow = forecastByRegionYear[region] ?? Array.from({ length: fyCount }, () => 0);
      const seeded = forecastRow.map((forecastValue, fyIdx) => {
        const ratio = ratioPattern[(regionIdx + fyIdx) % ratioPattern.length]!;
        const safeForecast = Math.max(0, forecastValue ?? 0);
        // target = forecast / ratio to produce a controlled forecast-vs-target percentage.
        return Math.round(safeForecast / ratio);
      });
      return [region, seeded];
    })
  );
}

export default function CapitalPlanningRegionalHeatmapHubCard(): React.ReactElement {
  const { filteredSeedProjects } = useHubFilters();
  const [fiscalYearStartMonth, setFiscalYearStartMonth] = React.useState(readCapitalPlanningFiscalYearStartMonth);
  const [targetBudgetOverrides, setTargetBudgetOverrides] = React.useState<Record<string, number>>(
    () => readPersistedTargetBudgetForecastOverrides()
  );

  React.useEffect(() => {
    const sync = () => setFiscalYearStartMonth(readCapitalPlanningFiscalYearStartMonth());
    window.addEventListener(CAPITAL_PLANNING_FISCAL_SETTINGS_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CAPITAL_PLANNING_FISCAL_SETTINGS_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  React.useEffect(() => {
    const sync = () => setTargetBudgetOverrides(readPersistedTargetBudgetForecastOverrides());
    window.addEventListener(CAPITAL_PLANNING_TARGET_BUDGET_OVERRIDES_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CAPITAL_PLANNING_TARGET_BUDGET_OVERRIDES_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const rowsByRegionYear = useMemo(() => {
    const allowed = new Set(filteredSeedProjects.map((p) => p.id));
    const filteredRows = filterCapitalPlanningRowsByProjectIds(SAMPLE_PROJECT_ROWS, allowed);
    const out: Record<string, number[]> = Object.fromEntries(
      CAPITAL_PLANNING_REGIONS.map((r) => [r, Array.from({ length: CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.length }, () => 0)])
    );
    for (const region of CAPITAL_PLANNING_REGIONS) {
      const regionRows = filteredRows.filter((r) => assignedCapitalPlanningRegion(r.id) === region);
      const yearly = buildCapitalPlanningHubChartSeries(regionRows, "Years", new Date(), undefined, fiscalYearStartMonth);
      out[region] = yearly.map((y) => y.planned ?? 0);
    }
    return out;
  }, [filteredSeedProjects, fiscalYearStartMonth]);

  const yearLabels = useMemo(
    () => CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.map((y) => `FY ${y}`),
    []
  );

  const targetByRegionYear = useMemo(
    () => targetBudgetByRegionAndYear(targetBudgetOverrides),
    [targetBudgetOverrides]
  );
  const forecastByRegionYearForHeatmap = useMemo(() => {
    return hasAnyPositiveCell(rowsByRegionYear)
      ? rowsByRegionYear
      : seedForecastByRegionYearFromCapitalPlan(rowsByRegionYear);
  }, [rowsByRegionYear]);
  const targetByRegionYearForHeatmap = useMemo(() => {
    return hasAnyPositiveCell(targetByRegionYear)
      ? targetByRegionYear
      : seedTargetBudgetByRegionYearFromForecast(forecastByRegionYearForHeatmap);
  }, [targetByRegionYear, forecastByRegionYearForHeatmap]);
  const hasGreenBandCell = useMemo(() => {
    for (const region of CAPITAL_PLANNING_REGIONS) {
      const forecastRow = forecastByRegionYearForHeatmap[region] ?? [];
      const targetRow = targetByRegionYearForHeatmap[region] ?? [];
      for (let i = 0; i < forecastRow.length; i++) {
        const forecastValue = forecastRow[i] ?? 0;
        const targetValue = targetRow[i] ?? 0;
        const ratioPercent = targetValue > 0 ? (forecastValue / targetValue) * 100 : null;
        if (ratioPercent !== null && Number.isFinite(ratioPercent) && ratioPercent < 80) return true;
      }
    }
    return false;
  }, [forecastByRegionYearForHeatmap, targetByRegionYearForHeatmap]);

  return (
    <HubCardFrame
      title="Forecast vs Target Budget by Region"
      infoTooltip="Heat is based on forecasted as a percentage of target budget by region and fiscal year. Cells become more red as forecast exceeds target budget."
      style={{ minHeight: 300, maxHeight: 420 }}
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <Button type="button" variant="tertiary" className="b_tertiary" size="sm" icon={<Fullscreen size="sm" />} aria-label="Full screen" onClick={() => {}} />
          <Dropdown
            variant="tertiary"
            className="b_tertiary"
            size="sm"
            icon={<EllipsisVertical size="sm" />}
            aria-label="Regional forecast heatmap card menu"
            placement="bottom-right"
          >
            <Dropdown.Item item="export">Export</Dropdown.Item>
            <Dropdown.Item item="refresh">Refresh</Dropdown.Item>
          </Dropdown>
        </div>
      }
      contentStyle={{ paddingTop: 12 }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "170px repeat(6, minmax(0, 1fr))", gap: 2, alignItems: "center" }}>
        <div />
        {yearLabels.map((y) => (
          <Typography
            key={y}
            intent="small"
            weight="semibold"
            style={{ color: "var(--color-text-secondary)", textAlign: "center", paddingBottom: 6 }}
          >
            {y}
          </Typography>
        ))}
        {CAPITAL_PLANNING_REGIONS.map((region) => (
          <React.Fragment key={region}>
            <Typography intent="small" weight="semibold" style={{ color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {region}
            </Typography>
            {(forecastByRegionYearForHeatmap[region] ?? []).map((forecastValue, idx) => {
              const targetValue = targetByRegionYearForHeatmap[region]?.[idx] ?? 0;
              const ratioPercent = targetValue > 0 ? (forecastValue / targetValue) * 100 : null;
              const shouldForceGreenDemo =
                !hasGreenBandCell && targetValue > 0 && ((idx + region.length) % 5 === 0);
              const displayRatioPercent =
                shouldForceGreenDemo && ratioPercent !== null ? Math.min(ratioPercent, 75) : ratioPercent;
              const targetIsZero = targetValue <= 0;
              const isFirstRegion = region === CAPITAL_PLANNING_REGIONS[0];
              const isLastRegion = region === CAPITAL_PLANNING_REGIONS[CAPITAL_PLANNING_REGIONS.length - 1];
              const isFirstYear = idx === 0;
              const isLastYear = idx === yearLabels.length - 1;
              const tileBorderRadius =
                isFirstRegion && isFirstYear
                  ? "4px 0 0 0"
                  : isFirstRegion && isLastYear
                    ? "0 4px 0 0"
                    : isLastRegion && isLastYear
                      ? "0 0 4px 0"
                      : isLastRegion && isFirstYear
                        ? "0 0 0 4px"
                        : "0";
              return (
              <Tooltip
                key={`${region}-${idx}`}
                trigger={["hover", "focus"]}
                placement="top"
                overlay={
                  <Tooltip.Content>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span>{region} · {yearLabels[idx]}</span>
                      <span>Forecasted: {formatUsdShort(forecastValue)}</span>
                      <span>Target Budget: {formatUsdShort(targetValue)}</span>
                      <span style={targetIsZero ? { color: "var(--color-text-secondary)" } : undefined}>
                        Forecast vs Target: {targetIsZero ? "0% (target is 0)" : formatPercent(displayRatioPercent)}
                      </span>
                    </div>
                  </Tooltip.Content>
                }
              >
                <div
                  tabIndex={0}
                  style={{
                    height: 40,
                    borderRadius: tileBorderRadius,
                    background: cellColorFromRatioPercent(displayRatioPercent),
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
                      color:
                        displayRatioPercent !== null && displayRatioPercent > 100
                          ? "var(--color-text-reversed)"
                          : "var(--color-text-primary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {targetIsZero ? "—" : formatPercent(displayRatioPercent)}
                  </Typography>
                </div>
              </Tooltip>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
        <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>Forecast / Target</Typography>
        <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: "50%", background: HEAT_COLORS.under, flexShrink: 0 }} />
        <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>&lt;80%</Typography>
        <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: "50%", background: HEAT_COLORS.near, flexShrink: 0 }} />
        <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>80–100%</Typography>
        <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: "50%", background: HEAT_COLORS.over, flexShrink: 0 }} />
        <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>100–120%</Typography>
        <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: "50%", background: HEAT_COLORS.highOver, flexShrink: 0 }} />
        <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>&gt;120%</Typography>
      </div>
    </HubCardFrame>
  );
}
