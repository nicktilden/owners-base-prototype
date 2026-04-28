/**
 * HEALTH KPI GRID CARD
 * AG Grid showing all active projects with their KPI health status columns.
 * Includes search, filter, and column config toolbar.
 * Row click opens HealthDetailTearsheet.
 */

import React, { useMemo, useRef, useState, useCallback } from 'react';
import { Button, Search, Tooltip, Typography } from '@procore/core-react';
import { Filter, Sliders } from '@procore/core-icons';
import styled from 'styled-components';
import type { ColDef, GridApi, RowClickedEvent } from 'ag-grid-community';
import HubCardFrame from '@/components/hubs/HubCardFrame';
import { SmartGridWrapper } from '@/components/SmartGrid';
import HealthDetailTearsheet from '../HealthDetailTearsheet';
import { buildHealthResult } from '@/utils/healthEngine';
import { projects as allProjects } from '@/data/seed/projects';
import { getRisksForProject } from '@/data/seed/risks';
import { useData } from '@/context/DataContext';
import type { HealthResult } from '@/types/health';
import type { Project } from '@/types/project';

// ─── Row type ─────────────────────────────────────────────────────────────────

interface KPIGridRow {
  id: string;
  name: string;
  region: string;
  stage: string;
  cost: string;
  schedule: string;
  delivery: string;
  risk: string;
  composite: string;
  trend: string;
  _project: Project;
  _result: HealthResult;
}

// ─── Styled ───────────────────────────────────────────────────────────────────

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0 8px;
  flex-shrink: 0;
`;

const GridWrap = styled.div`
  height: 400px;
  min-width: 0;
`;

const StatusDot = styled.span<{ $score: string }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $score }) =>
    $score === 'green' ? 'var(--color-status-success)' :
    $score === 'yellow' ? 'var(--color-status-warning)' :
    $score === 'red' ? 'var(--color-status-danger)' :
    'var(--color-border-default)'};
  margin-right: 5px;
  vertical-align: middle;
`;

// ─── Column helpers ───────────────────────────────────────────────────────────

const SCORE_LABEL: Record<string, string> = {
  green: 'Healthy', yellow: 'At Risk', red: 'Critical', unavailable: 'No Data',
};

const TREND_LABEL: Record<string, string> = {
  improving: '↑ Improving', degrading: '↓ Degrading', stable: '→ Stable',
};

function kpiStatusLabel(status: string): string {
  return SCORE_LABEL[status] ?? 'No Data';
}

function ScoreCellRenderer({ value }: { value: string }) {
  if (!value) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      <StatusDot $score={value} />
      {kpiStatusLabel(value)}
    </span>
  );
}

// ─── Column defs ──────────────────────────────────────────────────────────────

const columnDefs: ColDef<KPIGridRow>[] = [
  { field: 'name', headerName: 'Project', flex: 2, minWidth: 160, pinned: 'left', cellStyle: { fontWeight: 500 } },
  { field: 'region', headerName: 'Region', flex: 1, minWidth: 100 },
  { field: 'stage', headerName: 'Stage', flex: 1, minWidth: 100 },
  {
    field: 'cost',
    headerName: 'Cost',
    flex: 1,
    minWidth: 100,
    cellRenderer: ScoreCellRenderer,
  },
  {
    field: 'schedule',
    headerName: 'Schedule',
    flex: 1,
    minWidth: 110,
    cellRenderer: ScoreCellRenderer,
  },
  {
    field: 'delivery',
    headerName: 'Delivery',
    flex: 1,
    minWidth: 100,
    cellRenderer: ScoreCellRenderer,
  },
  {
    field: 'risk',
    headerName: 'Risk',
    flex: 1,
    minWidth: 100,
    cellRenderer: ScoreCellRenderer,
  },
  {
    field: 'composite',
    headerName: 'Composite',
    flex: 1,
    minWidth: 110,
    cellRenderer: ScoreCellRenderer,
  },
  {
    field: 'trend',
    headerName: 'Trend',
    flex: 1,
    minWidth: 120,
    valueFormatter: ({ value }) => TREND_LABEL[value] ?? '→ Stable',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

type TearsheetEntry = { project: Project; result: HealthResult };

export default function HealthKPIGridCard() {
  const { data } = useData();
  const gridApiRef = useRef<GridApi<KPIGridRow> | null>(null);
  const [search, setSearch] = useState('');
  const [tearsheetEntry, setTearsheetEntry] = useState<TearsheetEntry | null>(null);

  const rowData = useMemo<KPIGridRow[]>(() => {
    if (!data.account) return [];
    const healthConfig = data.account.healthConfig;
    const activeProjects = allProjects.filter((p) => p.status === 'active');
    return activeProjects.map((project) => {
      const risks = getRisksForProject(project.id);
      const result = buildHealthResult(project, healthConfig, undefined, risks);

      const categoryScore = (cat: string) =>
        result.kpis.find((k) => k.category === cat)?.status ?? 'unavailable';

      return {
        id: project.id,
        name: project.name,
        region: project.region ?? '—',
        stage: project.stage ?? '—',
        cost: categoryScore('cost'),
        schedule: categoryScore('schedule'),
        delivery: categoryScore('delivery'),
        risk: categoryScore('risk'),
        composite: result.compositeScore,
        trend: result.trend,
        _project: project,
        _result: result,
      };
    });
  }, [data.account]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    gridApiRef.current?.setGridOption('quickFilterText', value);
  }, []);

  const handleRowClick = useCallback((event: RowClickedEvent<KPIGridRow>) => {
    const row = event.data;
    if (row) setTearsheetEntry({ project: row._project, result: row._result });
  }, []);

  return (
    <>
      <HubCardFrame
        title="Portfolio Health KPIs"
        infoTooltip="All active projects with KPI health status. Click a row to view details."
        style={{ maxHeight: 580 }}
      >
        <Toolbar>
          <Search
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
            placeholder="Search projects..."
            style={{ flex: 1, maxWidth: 260 }}
          />
          <Tooltip
            trigger="hover"
            placement="top"
            overlay={<Tooltip.Content>Filter columns</Tooltip.Content>}
          >
            <Button
              variant="tertiary"
              size="sm"
              icon={<Filter size="sm" />}
              aria-label="Filter"
              onClick={() => gridApiRef.current?.showColumnChooser?.()}
            />
          </Tooltip>
          <Tooltip
            trigger="hover"
            placement="top"
            overlay={<Tooltip.Content>Column settings</Tooltip.Content>}
          >
            <Button
              variant="tertiary"
              size="sm"
              icon={<Sliders size="sm" />}
              aria-label="Column settings"
              onClick={() => gridApiRef.current?.showColumnChooser?.()}
            />
          </Tooltip>
        </Toolbar>
        <GridWrap>
          <SmartGridWrapper
            id="health-kpi-grid"
            columnDefs={columnDefs}
            rowData={rowData}
            height="100%"
            rowSelection={{ mode: 'singleRow' }}
            onRowClicked={handleRowClick}
            onGridReady={({ api }) => { gridApiRef.current = api; }}
          />
        </GridWrap>
      </HubCardFrame>

      {tearsheetEntry && (
        <HealthDetailTearsheet
          open={!!tearsheetEntry}
          onClose={() => setTearsheetEntry(null)}
          result={tearsheetEntry.result}
          projectName={tearsheetEntry.project.name}
          projectId={tearsheetEntry.project.id}
        />
      )}
    </>
  );
}
