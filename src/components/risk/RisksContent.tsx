/**
 * RISKS CONTENT
 * Portfolio-level risks list page. Shows unified view of RiskTags + ManualRiskItems
 * across all projects. SmartGrid with filters by status, source type, origin, project.
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Button, Pill, Search, Typography } from '@procore/core-react';
import { Plus, Warning } from '@procore/core-icons';
import type { ColDef, GridApi, ICellRendererParams } from 'ag-grid-community';
import styled from 'styled-components';
import ToolPageLayout from '@/components/tools/ToolPageLayout';
import { SmartGridWrapper } from '@/components/SmartGrid';
import { useRiskTags } from '@/context/RiskTagsContext';
import { useManualRiskItems } from '@/context/ManualRiskItemsContext';
import { useData } from '@/context/DataContext';
import ManualRiskForm from '@/components/risk/ManualRiskForm';
import RiskDetailTearsheet from '@/components/risk/RiskDetailTearsheet';
import type { RiskDetailItem } from '@/components/risk/RiskDetailTearsheet';
import type { RiskTag, ManualRiskItem, RiskTagStatus, SourceType } from '@/types/health';

// ─── Styled components ────────────────────────────────────────────────────────

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
  height: 640px;
  border: 1px solid var(--color-border-default);
  border-radius: 0;
  overflow: hidden;
`;

const LinkCell = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 13px;
  color: var(--color-text-link);
  text-align: left;
  text-decoration: underline;
  text-underline-offset: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  &:hover { color: var(--color-action-primary); }
`;

// ─── Status color map ─────────────────────────────────────────────────────────

const STATUS_COLORS: Record<RiskTagStatus, 'red' | 'yellow' | 'green' | 'gray' | 'blue'> = {
  open:               'yellow',
  pending_acceptance: 'yellow',
  pending_approval:   'blue',
  mitigated:          'green',
  accepted:           'green',
  closed:             'gray',
};

const STATUS_LABELS: Record<RiskTagStatus, string> = {
  open:               'Open',
  pending_acceptance: 'Pending Acceptance',
  pending_approval:   'Pending Approval',
  mitigated:          'Mitigated',
  accepted:           'Accepted',
  closed:             'Closed',
};

const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  rfi:            'RFI',
  change_event:   'Change Event',
  punch_list:     'Punch List',
  submittal:      'Submittal',
  correspondence: 'Correspondence',
  milestone:      'Milestone',
  budget_line:    'Budget Line',
  observation:    'Observation',
  incident:       'Incident',
  manual:         'Manual',
};

// ─── Row type ─────────────────────────────────────────────────────────────────

interface RiskRow {
  id: string;
  itemType: 'tag' | 'manual';
  project: string;
  sourceType: string;
  sourceItem: string;
  riskType: string;
  probability: number;
  impact: number;
  status: RiskTagStatus;
  origin: string;
  owner: string;
  _raw: RiskDetailItem;
}

function StatusCellRenderer({ value }: { value: RiskTagStatus }) {
  const color = STATUS_COLORS[value] ?? 'gray';
  const label = STATUS_LABELS[value] ?? value;
  return <Pill color={color}>{label}</Pill>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RisksContent() {
  const { riskTags } = useRiskTags();
  const { manualRiskItems } = useManualRiskItems();
  const { data } = useData();
  const gridApiRef = useRef<GridApi | null>(null);
  const [searchText, setSearchText] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RiskDetailItem | null>(null);

  const projects = data.projects ?? [];
  const riskTypes = data.account?.riskTypes ?? [];
  const users = data.users ?? [];

  function getProjectName(projectId: string) {
    return projects.find(p => p.id === projectId)?.name ?? projectId;
  }

  function getRiskTypeName(riskTypeId: string) {
    return riskTypes.find(rt => rt.id === riskTypeId)?.label ?? riskTypeId;
  }

  function getUserName(userId: string) {
    const u = users.find(u => u.id === userId);
    return u ? `${u.firstName} ${u.lastName}` : userId;
  }

  const rowData = useMemo<RiskRow[]>(() => {
    const tagRows: RiskRow[] = riskTags.map(tag => ({
      id: tag.id,
      itemType: 'tag' as const,
      project: getProjectName(tag.projectId),
      sourceType: SOURCE_TYPE_LABELS[tag.sourceType] ?? tag.sourceType,
      sourceItem: tag.sourceId,
      riskType: getRiskTypeName(tag.riskTypeId),
      probability: tag.probability,
      impact: tag.impact,
      status: tag.status,
      origin: tag.origin === 'connected_partner' ? 'Connected' : tag.origin === 'automated' ? 'Automated' : 'Manual',
      owner: getUserName(tag.riskOwner),
      _raw: { kind: 'tag', data: tag },
    }));

    const manualRows: RiskRow[] = manualRiskItems.map(item => ({
      id: item.id,
      itemType: 'manual' as const,
      project: getProjectName(item.projectId),
      sourceType: 'Manual',
      sourceItem: item.title,
      riskType: getRiskTypeName(item.riskTypeId),
      probability: item.probability,
      impact: item.impact,
      status: item.status,
      origin: 'Manual',
      owner: getUserName(item.riskOwner),
      _raw: { kind: 'manual', data: item },
    }));

    return [...tagRows, ...manualRows];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riskTags, manualRiskItems, projects, riskTypes, users]);

  const columnDefs = useMemo<ColDef<RiskRow>[]>(() => [
    {
      field: 'project',
      headerName: 'Project',
      minWidth: 180,
      filter: 'agSetColumnFilter',
      enableRowGroup: true,
    },
    {
      field: 'sourceType',
      headerName: 'Source Type',
      width: 140,
      filter: 'agSetColumnFilter',
      enableRowGroup: true,
    },
    {
      field: 'sourceItem',
      headerName: 'Source Item',
      minWidth: 150,
      cellRenderer: (params: ICellRendererParams<RiskRow>) => {
        if (!params.data) return params.value ?? null;
        const raw = params.data._raw;
        return (
          <LinkCell
            onClick={(e) => { e.stopPropagation(); setSelectedItem(raw); }}
            aria-label={`View risk details: ${params.value}`}
          >
            {params.value}
          </LinkCell>
        );
      },
    },
    {
      field: 'riskType',
      headerName: 'Risk Type',
      minWidth: 160,
      filter: 'agSetColumnFilter',
      enableRowGroup: true,
    },
    {
      field: 'probability',
      headerName: 'Probability',
      width: 120,
      filter: 'agNumberColumnFilter',
      valueFormatter: ({ value }) => value != null ? `${value}/5` : '—',
    },
    {
      field: 'impact',
      headerName: 'Expected Impact',
      width: 150,
      filter: 'agNumberColumnFilter',
      valueFormatter: ({ value }) => value > 0 ? `$${Number(value).toLocaleString()}` : '—',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 175,
      filter: 'agSetColumnFilter',
      enableRowGroup: true,
      cellRenderer: StatusCellRenderer,
    },
    {
      field: 'origin',
      headerName: 'Origin',
      width: 120,
      filter: 'agSetColumnFilter',
      enableRowGroup: true,
    },
    {
      field: 'owner',
      headerName: 'Owner',
      minWidth: 140,
      filter: 'agSetColumnFilter',
    },
  ], []);

  const handleRowClick = useCallback((event: { data?: RiskRow }) => {
    if (event.data) setSelectedItem(event.data._raw);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    gridApiRef.current?.setGridOption('quickFilterText', e.target.value);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchText('');
    gridApiRef.current?.setGridOption('quickFilterText', '');
  }, []);

  return (
    <ToolPageLayout
      title="Risks"
      icon={<Warning size="md" />}
      breadcrumbs={[{ label: 'Portfolio', href: '/portfolio' }]}
      actions={
        <Button
          variant="primary"
          icon={<Plus />}
          onClick={() => setShowManualForm(true)}
        >
          Add manual risk
        </Button>
      }
    >
      <div style={{ padding: '16px 24px', background: 'var(--color-surface-primary)' }}>
        <ToolbarRow>
          <ToolbarLeft>
            <div style={{ width: 280 }}>
              <Search
                placeholder="Search risks…"
                value={searchText}
                onChange={handleSearchChange}
                onClear={handleSearchClear}
              />
            </div>
            <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
              {rowData.length} {rowData.length === 1 ? 'risk' : 'risks'}
            </Typography>
          </ToolbarLeft>
          <ToolbarRight />
        </ToolbarRow>
        <GridArea>
          <SmartGridWrapper
            id="portfolio-risks-grid"
            rowData={rowData}
            columnDefs={columnDefs}
            onGridReady={({ api }) => { gridApiRef.current = api; }}
            onRowClicked={handleRowClick}
          />
        </GridArea>
      </div>

      {showManualForm && (
        <ManualRiskForm
          onClose={() => setShowManualForm(false)}
        />
      )}

      <RiskDetailTearsheet
        open={selectedItem !== null}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </ToolPageLayout>
  );
}
