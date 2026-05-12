/**
 * PORTFOLIO RISK TABLE CARD
 * AG Grid hub card showing all active projects with every Health & Risk KPI.
 * Grouped by Region by default. Includes search, filter, group-by, and configure.
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Search, Select, ToggleButton } from '@procore/core-react';
import { Filter, Sliders } from '@procore/core-icons';
import type { GridApi } from 'ag-grid-community';
import styled from 'styled-components';
import HubCardFrame from '@/components/hubs/HubCardFrame';
import { SmartGridWrapper } from '@/components/SmartGrid';
import ConfigureColumnsPanel from '@/components/SmartGrid/ConfigureColumnsPanel';
import { useData } from '@/context/DataContext';
import { projects as allProjects } from '@/data/seed/projects';
import { getRisksForProject } from '@/data/seed/risks';
import { buildHealthResult } from '@/utils/healthEngine';
import {
  portfolioRiskFixedCols,
  buildKpiColumns,
  buildOverallHealthCol,
  type PortfolioRiskRow,
} from '@/components/SmartGrid/portfolioRiskColumnDefs';
import type { KpiCellValue } from '@/components/SmartGrid/PortfolioRiskKpiCellRenderer';
import type { KPIKey } from '@/types/health';

// Derive a program label from sector string (e.g. "Institutional > Health Care > Hospital" → "Hospital")
function deriveProgram(sector: string): string {
  const parts = sector.split('>').map(s => s.trim());
  return parts[parts.length - 1] ?? sector;
}

/**
 * Generate a deterministic 8-point sparkline (values 0–1) for a given project+KPI.
 * Uses a seeded pseudo-random walk so each cell has a unique but stable shape.
 * The final point is anchored to reflect the current status severity.
 */
function makeSparkline(projectId: string, kpiKey: string, status: string): number[] {
  // Simple string hash for seeding
  const seed = [...`${projectId}:${kpiKey}`].reduce((acc, c) => acc * 31 + c.charCodeAt(0), 0);
  const rng = (n: number) => {
    const x = Math.sin(seed + n) * 10000;
    return x - Math.floor(x);
  };

  const N = 8;
  const points: number[] = [];
  let v = 0.3 + rng(0) * 0.4; // start in middle band
  for (let i = 0; i < N; i++) {
    v = Math.max(0.05, Math.min(0.95, v + (rng(i + 1) - 0.48) * 0.22));
    points.push(v);
  }

  // Anchor the last point to the current status so the chart "ends" at the right level
  const statusAnchor: Record<string, number> = { red: 0.85, yellow: 0.55, green: 0.2, unavailable: 0.5 };
  points[N - 1] = statusAnchor[status] ?? 0.5;
  return points;
}

// ─── Styled ───────────────────────────────────────────────────────────────────

const ToolbarRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 8px;
  gap: 8px;
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

const GridArea = styled.div`
  display: flex;
  height: 480px;
  border: 1px solid var(--color-border-default);
  overflow: hidden;
`;

// ─── Group-by options ─────────────────────────────────────────────────────────

interface GroupByOption {
  id: 'program' | 'region' | 'stage' | 'sector';
  label: string;
}

const GROUP_BY_OPTIONS: GroupByOption[] = [
  { id: 'program', label: 'Program' },
  { id: 'region',  label: 'Region'  },
  { id: 'stage',   label: 'Stage'   },
  { id: 'sector',  label: 'Sector'  },
];

// AG Grid sidebar config — shows filters panel when toggled
const SIDEBAR_CONFIG = {
  toolPanels: [
    {
      id: 'filters',
      labelDefault: 'Filters',
      labelKey: 'filters',
      iconKey: 'filter',
      toolPanel: 'agFiltersToolPanel',
    },
  ],
  defaultToolPanel: '',
  hiddenByDefault: true,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function PortfolioRiskTableCard() {
  const { data } = useData();
  const gridApiRef = useRef<GridApi<PortfolioRiskRow> | null>(null);
  const [gridApi, setGridApi] = useState<GridApi<PortfolioRiskRow> | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [groupBys, setGroupBys] = useState<GroupByOption[]>([{ id: 'program', label: 'Program' }]);

  // ── Build row data from seed projects + health engine ──────────────────────
  const activeKPIs = useMemo<KPIKey[]>(
    () => (data.account?.healthConfig.activeKPIs ?? []) as KPIKey[],
    [data.account]
  );

  const rowData = useMemo<PortfolioRiskRow[]>(() => {
    if (!data.account) return [];
    const config = data.account.healthConfig;
    const activeProjects = allProjects.filter((p) => p.status === 'active');

    return activeProjects.map((project) => {
      const risks = getRisksForProject(project.id);
      const result = buildHealthResult(project, config, undefined, risks);

      const kpiValues: Record<string, KpiCellValue> = {};
      for (const kpi of result.kpis) {
        kpiValues[kpi.key] = {
          status: kpi.status,
          displayValue: kpi.displayValue,
          sparkline: makeSparkline(project.id, kpi.key, kpi.status),
        };
      }

      const overallHealth: KpiCellValue = {
        status: result.compositeScore,
        displayValue: result.compositeScore === 'green' ? 'Healthy'
          : result.compositeScore === 'yellow' ? 'At Risk'
          : 'Critical',
        sparkline: makeSparkline(project.id, 'overall', result.compositeScore),
      };

      return {
        id: project.id,
        number: project.number,
        name: project.name,
        stage: project.stage,
        program: deriveProgram(project.sector),
        region: project.region,
        sector: project.sector,
        overallHealth,
        ...kpiValues,
      };
    });
  }, [data.account]);

  // ── Column defs ────────────────────────────────────────────────────────────
  const columnDefs = useMemo(
    () => [
      ...portfolioRiskFixedCols,
      buildOverallHealthCol(),
      ...buildKpiColumns(activeKPIs),
    ],
    [activeKPIs]
  );

  // ── Toolbar handlers ───────────────────────────────────────────────────────
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    gridApiRef.current?.setGridOption('quickFilterText', e.target.value);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchText('');
    gridApiRef.current?.setGridOption('quickFilterText', '');
  }, []);

  const applyGroupsToGrid = useCallback((next: GroupByOption[], prev: GroupByOption[]) => {
    const api = gridApiRef.current;
    if (!api) return;
    const nextIds = new Set(next.map((g) => g.id));
    api.applyColumnState({
      state: [
        ...next.map((g, i) => ({ colId: g.id, rowGroup: true, rowGroupIndex: i, hide: true })),
        ...prev
          .filter((g) => !nextIds.has(g.id))
          .map((g) => ({ colId: g.id, rowGroup: false, rowGroupIndex: null, hide: false })),
      ],
      defaultState: { rowGroup: false, rowGroupIndex: null },
    });
  }, []);

  const handleGroupBySelect = useCallback(
    (selection: { item: unknown }) => {
      const opt = selection.item as GroupByOption;
      const already = groupBys.some((g) => g.id === opt.id);
      const next = already ? groupBys.filter((g) => g.id !== opt.id) : [...groupBys, opt];
      setGroupBys(next);
      applyGroupsToGrid(next, groupBys);
    },
    [groupBys, applyGroupsToGrid]
  );

  const handleGroupByClear = useCallback(() => {
    const prev = groupBys;
    setGroupBys([]);
    applyGroupsToGrid([], prev);
  }, [groupBys, applyGroupsToGrid]);

  const handleFiltersToggle = useCallback(() => {
    const api = gridApiRef.current;
    if (!api) return;
    const next = !filtersOpen;
    setFiltersOpen(next);
    if (next) {
      setConfigOpen(false);
      api.openToolPanel('filters');
    } else {
      api.closeToolPanel();
    }
  }, [filtersOpen]);

  const handleConfigToggle = useCallback(() => {
    setConfigOpen((v) => {
      if (!v) {
        setFiltersOpen(false);
        gridApiRef.current?.closeToolPanel();
      }
      return !v;
    });
  }, []);

  const getRowId = useCallback((params: { data: PortfolioRiskRow }) => params.data.id, []);

  const handleGridReady = useCallback(
    (event: { api: GridApi<PortfolioRiskRow> }) => {
      gridApiRef.current = event.api;
      setGridApi(event.api);
      // Apply initial program grouping and fix column widths after autoSizeAllColumns runs
      event.api.applyColumnState({
        state: [
          { colId: 'program', rowGroup: true, rowGroupIndex: 0, hide: true },
          { colId: 'name', width: 300 },
        ],
      });
    },
    []
  );

  return (
    <HubCardFrame
      title="Portfolio Risk"
      infoTooltip="All active projects with Risk Register KPI scores. Grouped by region."
    >
      <ToolbarRow>
        <ToolbarLeft>
          <div style={{ maxWidth: 260 }}>
            <Search
              placeholder="Search projects"
              value={searchText}
              onChange={handleSearchChange}
              onClear={handleSearchClear}
            />
          </div>
          <ToggleButton
            selected={filtersOpen}
            className="b_toggle"
            icon={<Filter />}
            onClick={handleFiltersToggle}
          >
            Filters
          </ToggleButton>
        </ToolbarLeft>
        <ToolbarRight>
          <div style={{ width: 180 }}>
            <Select
              placeholder="Group by"
              label={groupBys.length > 0 ? `Group: ${groupBys.map((g) => g.label).join(', ')}` : undefined}
              onSelect={handleGroupBySelect}
              onClear={groupBys.length > 0 ? handleGroupByClear : undefined}
              block
            >
              {GROUP_BY_OPTIONS.map((opt) => (
                <Select.Option
                  key={opt.id}
                  value={opt}
                  selected={groupBys.some((g) => g.id === opt.id)}
                >
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </div>
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

      <GridArea>
        <div style={{ flex: 1, minWidth: 0 }}>
          <SmartGridWrapper<PortfolioRiskRow>
            id="portfolio-risk-grid"
            localStorageKey="owner-prototype-portfolio-risk-grid-v3"
            height="100%"
            rowData={rowData}
            columnDefs={columnDefs}
            getRowId={getRowId}
            groupDisplayType="groupRows"
            autoGroupColumnDef={{
              headerName: 'Group',
              minWidth: 200,
              cellRendererParams: { suppressCount: false },
            }}
            sideBar={SIDEBAR_CONFIG}
            onGridReady={handleGridReady}
            statusBar={{
              statusPanels: [
                { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
              ],
            }}
          />
        </div>
        <ConfigureColumnsPanel
          open={configOpen}
          gridApi={gridApi}
          onClose={() => setConfigOpen(false)}
        />
      </GridArea>
    </HubCardFrame>
  );
}
