/**
 * PORTFOLIO RISK REGISTER CONTENT
 * Portfolio-level risk register tool page.
 * Aggregates all Risk records (seed), RiskTags, and ManualRiskItems across every
 * active project and displays them in the same RiskGrid used by the project-level
 * Health & Risk tool — with a Project column added for cross-project visibility.
 *
 * Tabs: Active | Resolved
 * Toolbar: Search · Filters · Group by (Project, Category, Status, Origin, Item Type)
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Button, Search, Select, Tabs, ToggleButton, Typography } from '@procore/core-react';
import { Filter, Plus, ShieldStar, Sliders } from '@procore/core-icons';
import type { ColDef, GridApi } from 'ag-grid-community';
import styled from 'styled-components';
import ToolPageLayout from '@/components/tools/ToolPageLayout';
import { SmartGridWrapper } from '@/components/SmartGrid';
import type { RiskGridRow } from '@/components/SmartGrid/riskColumnDefs';
import type { RiskGridContext } from '@/components/SmartGrid/riskColumnDefs';
import RiskTitleCellRenderer from '@/components/SmartGrid/RiskTitleCellRenderer';
import RiskStatusCellRenderer from '@/components/SmartGrid/RiskStatusCellRenderer';
import RiskScoreCellRenderer from '@/components/SmartGrid/RiskScoreCellRenderer';
import RiskItemTypeCellRenderer from '@/components/SmartGrid/RiskItemTypeCellRenderer';
import RiskCategoriesCellRenderer from '@/components/SmartGrid/RiskCategoriesCellRenderer';
import RiskOriginCellRenderer from '@/components/SmartGrid/RiskOriginCellRenderer';
import RiskFiltersPanel, { type RiskFilterValues } from '@/components/SmartGrid/RiskFiltersPanel';
import ConfigureColumnsPanel from '@/components/SmartGrid/ConfigureColumnsPanel';
import { useRiskTags } from '@/context/RiskTagsContext';
import { useManualRiskItems } from '@/context/ManualRiskItemsContext';
import { useData } from '@/context/DataContext';
import { projects as allProjects } from '@/data/seed/projects';
import { risks as allSeedRisks } from '@/data/seed/risks';
import { users } from '@/data/seed/users';
import { riskTypes } from '@/data/seed/riskTypes';
import { rfis } from '@/data/seed/rfis';
import { changeEvents } from '@/data/seed/change_events';
import { submittals } from '@/data/seed/submittals';
import { punchList } from '@/data/seed/punch_list';
import { correspondence } from '@/data/seed/correspondence';
import type { Risk, RiskTag, ManualRiskItem } from '@/types/health';
import ManualRiskForm from '@/components/risk/ManualRiskForm';
import RfiDetailTearsheet from '@/components/tools/RfiDetailTearsheet';
import ChangeEventDetailTearsheet from '@/components/tools/ChangeEventDetailTearsheet';
import SubmittalDetailTearsheet from '@/components/tools/SubmittalDetailTearsheet';
import PunchListDetailTearsheet from '@/components/tools/PunchListDetailTearsheet';
import CorrespondenceDetailTearsheet from '@/components/tools/CorrespondenceDetailTearsheet';

// ─── Styled ───────────────────────────────────────────────────────────────────

const GridCard = styled.div`
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-separator);
  border-radius: 6px;
  overflow: hidden;
  margin: 20px;
`;

const GridCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 0;
`;

const ToolbarRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px 0;
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

const GridArea = styled.div`
  display: flex;
  height: 560px;
  overflow: hidden;
  margin-top: 12px;
`;

// ─── Summary bar ─────────────────────────────────────────────────────────────

const SummaryBar = styled.div`
  display: flex;
  gap: 24px;
  padding: 16px 24px;
  background: var(--color-surface-primary);
  border-bottom: 1px solid var(--color-border-separator);
  flex-shrink: 0;
`;

const StatBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StatValue = styled.span<{ $color?: string }>`
  font-size: 22px;
  font-weight: 700;
  color: ${({ $color }) => $color ?? 'var(--color-text-primary)'};
  line-height: 1.15;
`;

const StatLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const StatDivider = styled.div`
  width: 1px;
  background: var(--color-border-separator);
  align-self: stretch;
`;

// ─── Constants & helpers ──────────────────────────────────────────────────────

const RESOLVED_STATUSES = new Set(['closed', 'mitigated', 'accepted']);

const riskTypeLookup = Object.fromEntries(riskTypes.map(rt => [rt.id, rt]));
const projectLookup  = Object.fromEntries(allProjects.map(p => [p.id, p]));
const userLookup     = Object.fromEntries(users.map(u => [u.id, u]));

const rfiMap    = Object.fromEntries(rfis.map(r => [r.id, r]));
const ceMap     = Object.fromEntries(changeEvents.map(c => [c.id, c]));
const subMap    = Object.fromEntries(submittals.map(s => [s.id, s]));
const punchMap  = Object.fromEntries(punchList.map(p => [p.id, p]));
const corrMap   = Object.fromEntries(correspondence.map(c => [c.id, c]));

const COST_SCALE: Record<number, number> = { 1: 50000, 2: 250000, 3: 750000, 4: 2000000, 5: 5000000 };
const SCHEDULE_SCALE: Record<number, number> = { 1: 7, 2: 21, 3: 45, 4: 90, 5: 180 };

const SOURCE_TYPE_LABELS: Record<string, string> = {
  rfi: 'RFI', change_event: 'Change Event', submittal: 'Submittal',
  punch_list: 'Punch List', correspondence: 'Correspondence', milestone: 'Milestone',
  budget_line: 'Budget Line', manual: 'Manual', observation: 'Observation',
  incident: 'Incident', inspection: 'Inspection', task: 'Task', document: 'Document',
};

const CATEGORY_DISPLAY: Record<string, string> = {
  financial: 'Financial', schedule: 'Schedule', safety: 'Safety',
  quality: 'Quality', contractual: 'Contractual', regulatory: 'Regulatory',
  environmental: 'Environmental', other: 'Other',
};

function userName(userId: string): string {
  const u = userLookup[userId];
  return u ? `${u.firstName} ${u.lastName}` : '';
}

function formatCostImpact(impact: number, category: string): string {
  if (category === 'schedule' || impact <= 0) return '—';
  if (impact >= 1_000_000) return `$${(impact / 1_000_000).toFixed(1)}M`;
  if (impact >= 1_000) return `$${Math.round(impact / 1_000)}K`;
  return `$${impact.toLocaleString()}`;
}

function formatScheduleImpact(impact: number, category: string): string {
  if (category !== 'schedule' || impact <= 0) return '—';
  return impact === 1 ? '1 day' : `${impact} days`;
}

function formatImpact(impact: number, category: string): string {
  if (impact <= 5) return `${impact}/5`;
  if (category === 'schedule') return impact === 1 ? '1 day' : `${impact} days`;
  if (impact >= 1_000_000) return `$${(impact / 1_000_000).toFixed(1)}M`;
  if (impact >= 1_000) return `$${Math.round(impact / 1_000)}K`;
  return `$${impact.toLocaleString()}`;
}

function getSourceItem(sourceType: string, sourceId: string) {
  switch (sourceType) {
    case 'rfi': {
      const r = rfiMap[sourceId];
      return { itemTitle: r?.subject ?? sourceId, itemDueDate: r?.dueDate ?? '', itemStatus: r?.status ?? '', itemAssignedTo: '' };
    }
    case 'change_event': {
      const c = ceMap[sourceId];
      return { itemTitle: c?.title ?? sourceId, itemDueDate: c?.createdAt instanceof Date ? c.createdAt.toLocaleDateString() : (c?.createdAt ?? ''), itemStatus: c?.status ?? '', itemAssignedTo: '' };
    }
    case 'submittal': {
      const s = subMap[sourceId];
      return { itemTitle: s?.title ?? sourceId, itemDueDate: s?.finalDueDate ?? '', itemStatus: s?.status ?? '', itemAssignedTo: s?.responsibleContractorId ?? '' };
    }
    case 'punch_list': {
      const p = punchMap[sourceId];
      return { itemTitle: p?.description ?? sourceId, itemDueDate: p?.dueDate ?? '', itemStatus: p?.status ?? '', itemAssignedTo: p?.assignedTo ?? '' };
    }
    case 'correspondence': {
      const c = corrMap[sourceId];
      return { itemTitle: c?.subject ?? sourceId, itemDueDate: c?.date ?? '', itemStatus: c?.status ?? '', itemAssignedTo: c?.from ?? '' };
    }
    default:
      return { itemTitle: sourceId, itemDueDate: '', itemStatus: '', itemAssignedTo: '' };
  }
}

function seedRiskToRow(r: Risk): RiskGridRow {
  const maxImpact = Math.max(r.impactCost, r.impactSchedule, r.impactSafety);
  const catLabel  = CATEGORY_DISPLAY[r.category] ?? r.category;
  const costDollars = COST_SCALE[r.impactCost] ?? 0;
  const scheduleDays = SCHEDULE_SCALE[r.impactSchedule] ?? 0;
  return {
    id: r.id,
    itemTitle: r.title,
    itemType: 'Manual',
    itemDueDate: r.dueDate ?? '',
    itemStatus: r.status,
    itemAssignedTo: '',
    categories: [catLabel],
    riskScore: r.probability * maxImpact,
    impactSummary: `${maxImpact}/5`,
    impactRaw: maxImpact,
    costImpact: formatCostImpact(costDollars, r.category),
    scheduleImpact: formatScheduleImpact(scheduleDays, r.category),
    status: r.status,
    assignedTo: '',
    origin: r.origin,
    sourceType: 'manual',
    sourceId: r.id,
    probability: r.probability,
    impact: maxImpact,
    riskTypeLabel: r.category,
    description: r.description,
  };
}

function tagToRow(tag: RiskTag): RiskGridRow {
  const rt = riskTypeLookup[tag.riskTypeId];
  const category = rt?.category ?? 'financial';
  const catLabel  = CATEGORY_DISPLAY[category] ?? category;
  const impactNorm = tag.impact > 5 ? Math.min(5, Math.round(tag.impact / 100000)) || 1 : tag.impact;
  const sourceItem = getSourceItem(tag.sourceType, tag.sourceId);
  return {
    id: tag.id,
    itemTitle: sourceItem.itemTitle,
    itemType: SOURCE_TYPE_LABELS[tag.sourceType] ?? tag.sourceType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    itemDueDate: sourceItem.itemDueDate,
    itemStatus: sourceItem.itemStatus,
    itemAssignedTo: sourceItem.itemAssignedTo,
    categories: [catLabel],
    riskScore: tag.probability * impactNorm,
    impactSummary: formatImpact(tag.impact, category),
    impactRaw: tag.impact,
    costImpact: formatCostImpact(tag.impact, category),
    scheduleImpact: formatScheduleImpact(tag.impact, category),
    status: tag.status,
    assignedTo: userName(tag.riskOwner),
    origin: tag.origin,
    sourceType: tag.sourceType,
    sourceId: tag.sourceId,
    probability: tag.probability,
    impact: tag.impact,
    riskTypeLabel: rt?.label ?? '',
    description: tag.mitigationPlan ?? '',
  };
}

function manualToRow(item: ManualRiskItem): RiskGridRow {
  const rt = riskTypeLookup[item.riskTypeId];
  const category = rt?.category ?? 'financial';
  const catLabel  = CATEGORY_DISPLAY[category] ?? category;
  const impactNorm = item.impact > 5 ? Math.min(5, Math.round(item.impact / 100000)) || 1 : item.impact;
  return {
    id: item.id,
    itemTitle: item.title,
    itemType: 'Manual',
    itemDueDate: '',
    itemStatus: '',
    itemAssignedTo: '',
    categories: [catLabel],
    riskScore: item.probability * impactNorm,
    impactSummary: formatImpact(item.impact, category),
    impactRaw: item.impact,
    costImpact: formatCostImpact(item.impact, category),
    scheduleImpact: formatScheduleImpact(item.impact, category),
    status: item.status,
    assignedTo: userName(item.riskOwner),
    origin: item.origin,
    sourceType: 'manual',
    sourceId: item.id,
    probability: item.probability,
    impact: item.impact,
    riskTypeLabel: rt?.label ?? '',
    description: item.description,
  };
}

// ─── Extended row type (adds projectName for portfolio view) ──────────────────

interface PortfolioRiskRow extends RiskGridRow {
  projectName: string;
  projectId: string;
}

// ─── Group-by options ─────────────────────────────────────────────────────────

const GROUP_BY_OPTIONS = [
  { id: 'projectName', label: 'Project'    },
  { id: 'categories',  label: 'Category'   },
  { id: 'status',      label: 'Status'     },
  { id: 'origin',      label: 'Origin'     },
  { id: 'itemType',    label: 'Item Type'  },
];

// ─── Column defs (project column prepended to the standard set) ───────────────

function buildPortfolioRiskColDefs(onOpenRisk: (id: string) => void): ColDef<PortfolioRiskRow>[] {
  const { riskColumnDefs } = require('@/components/SmartGrid/riskColumnDefs') as typeof import('@/components/SmartGrid/riskColumnDefs');
  return [
    {
      field: 'projectName',
      headerName: 'Project',
      minWidth: 200,
      flex: 1,
      filter: 'agSetColumnFilter',
      enableRowGroup: true,
      pinned: 'left',
      cellStyle: { fontWeight: 500 },
    },
    // Unpin itemTitle (it's pinned in the project tool, less needed here)
    ...riskColumnDefs.map((col: ColDef) =>
      col.field === 'itemTitle' ? { ...col, pinned: undefined } : col
    ),
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────

const TABS = ['Active', 'Resolved'] as const;
type TabName = typeof TABS[number];

export default function PortfolioRiskRegisterContent() {
  const { riskTags } = useRiskTags();
  const { manualRiskItems } = useManualRiskItems();
  const { data } = useData();
  const [activeTab, setActiveTab] = useState<TabName>('Active');
  const [showManualForm, setShowManualForm] = useState(false);
  const [openRiskId, setOpenRiskId] = useState<string | null>(null);

  const activeProjectIds = useMemo(
    () => new Set(allProjects.filter(p => p.status === 'active').map(p => p.id)),
    []
  );

  // ── Build all rows across all active projects ─────────────────────────────

  const allRows = useMemo<PortfolioRiskRow[]>(() => {
    const rows: PortfolioRiskRow[] = [];

    // 1. Seed risk records
    for (const r of allSeedRisks) {
      if (!activeProjectIds.has(r.projectId)) continue;
      const projectName = projectLookup[r.projectId]?.name ?? r.projectId;
      rows.push({ ...seedRiskToRow(r), projectName, projectId: r.projectId });
    }

    // 2. Risk tags (from connected-partner / automated sources)
    for (const tag of riskTags) {
      if (!activeProjectIds.has(tag.projectId)) continue;
      const projectName = projectLookup[tag.projectId]?.name ?? tag.projectId;
      rows.push({ ...tagToRow(tag), projectName, projectId: tag.projectId });
    }

    // 3. Manual risk items
    for (const item of manualRiskItems) {
      if (!activeProjectIds.has(item.projectId)) continue;
      const projectName = projectLookup[item.projectId]?.name ?? item.projectId;
      rows.push({ ...manualToRow(item), projectName, projectId: item.projectId });
    }

    return rows;
  }, [riskTags, manualRiskItems, activeProjectIds]);

  const activeRows   = useMemo(() => allRows.filter(r => !RESOLVED_STATUSES.has(r.status)), [allRows]);
  const resolvedRows = useMemo(() => allRows.filter(r =>  RESOLVED_STATUSES.has(r.status)), [allRows]);

  const displayRows = activeTab === 'Active' ? activeRows : resolvedRows;

  // Summary stats
  const critical  = activeRows.filter(r => r.riskScore >= 15).length;
  const atRisk    = activeRows.filter(r => r.riskScore >= 6 && r.riskScore < 15).length;
  const projectsAffected = new Set(activeRows.map(r => r.projectId)).size;

  // ── Grid ─────────────────────────────────────────────────────────────────

  const gridApiRef = useRef<GridApi<PortfolioRiskRow> | null>(null);
  const [searchText, setSearchText]   = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [configOpen, setConfigOpen]   = useState(false);
  const [groupBys, setGroupBys]       = useState<string[]>(['projectName']);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    gridApiRef.current?.setGridOption('quickFilterText', e.target.value);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchText('');
    gridApiRef.current?.setGridOption('quickFilterText', '');
  }, []);

  const handleGroupBySelect = useCallback((selection: { item: unknown }) => {
    const opt = selection.item as { id: string; label: string };
    const prevId = groupBys[0];
    setGroupBys([opt.id]);
    const api = gridApiRef.current;
    if (!api) return;
    const state = api.getColumnState().map((col) => {
      if (col.colId === opt.id) return { ...col, rowGroup: true, rowGroupIndex: 0, hide: true };
      if (prevId && col.colId === prevId) return { ...col, rowGroup: false, rowGroupIndex: null, hide: false };
      return { ...col, rowGroup: false, rowGroupIndex: null };
    });
    api.applyColumnState({ state });
  }, [groupBys]);

  const handleGroupByClear = useCallback(() => {
    const prevId = groupBys[0];
    setGroupBys([]);
    const api = gridApiRef.current;
    if (!api) return;
    const state = api.getColumnState().map((col) => ({
      ...col,
      rowGroup: false,
      rowGroupIndex: null,
      hide: prevId && col.colId === prevId ? false : col.hide,
    }));
    api.applyColumnState({ state });
  }, [groupBys]);

  const handleFilterApply = useCallback((filterValues: RiskFilterValues) => {
    const api = gridApiRef.current;
    if (!api) return;
    const model: Record<string, unknown> = {};
    if (filterValues.statuses.length > 0) {
      model['status'] = { filterType: 'set', values: filterValues.statuses };
    }
    if (filterValues.categories.length > 0) {
      model['categories'] = { filterType: 'set', values: filterValues.categories };
    }
    if (filterValues.itemTypes.length > 0) {
      model['itemType'] = { filterType: 'set', values: filterValues.itemTypes };
    }
    if (filterValues.origins.length > 0) {
      model['origin'] = { filterType: 'set', values: filterValues.origins };
    }
    api.setFilterModel(model);
    api.onFilterChanged();
  }, []);

  const handleFilterClear = useCallback(() => {
    const api = gridApiRef.current;
    if (!api) return;
    api.setFilterModel(null);
    api.onFilterChanged();
  }, []);

  const handleGridReady = useCallback((e: { api: GridApi<PortfolioRiskRow> }) => {
    gridApiRef.current = e.api;
    // Apply initial project grouping
    e.api.applyColumnState({
      state: [{ colId: 'projectName', rowGroup: true, rowGroupIndex: 0, hide: true }],
    });
  }, []);

  const columnDefs = useMemo(
    () => buildPortfolioRiskColDefs(setOpenRiskId),
    []
  );

  // ── Filter options derived from displayRows ───────────────────────────────

  const filterStatusOptions = useMemo(
    () => [...new Set(displayRows.map((r) => r.status).filter(Boolean))].sort(),
    [displayRows]
  );
  const filterCategoryOptions = useMemo(
    () => [...new Set(displayRows.flatMap((r) => r.categories).filter(Boolean))].sort(),
    [displayRows]
  );
  const filterItemTypeOptions = useMemo(
    () => [...new Set(displayRows.map((r) => r.itemType).filter(Boolean))].sort(),
    [displayRows]
  );
  const filterOriginOptions = useMemo(
    () => [...new Set(displayRows.map((r) => r.origin).filter(Boolean))].sort(),
    [displayRows]
  );

  // ── Source-item tearsheet dispatch ────────────────────────────────────────

  const openRow = useMemo(
    () => openRiskId ? allRows.find(r => r.id === openRiskId) ?? null : null,
    [openRiskId, allRows]
  );

  const closeSourceTearsheet = useCallback(() => setOpenRiskId(null), []);

  return (
    <>
      <ToolPageLayout
        title="Risk Register"
        icon={<ShieldStar size="md" />}
        breadcrumbs={[{ label: 'Portfolio', href: '/portfolio' }]}
        actions={
          <Button variant="primary" className="b_primary" icon={<Plus />} onClick={() => setShowManualForm(true)}>
            Add Risk
          </Button>
        }
        tabs={
          <Tabs>
            {TABS.map(tab => (
              <Tabs.Tab
                key={tab}
                role="button"
                selected={activeTab === tab}
                onPress={() => setActiveTab(tab)}
              >
                {tab}
                {tab === 'Active' && activeRows.length > 0 && (
                  <span style={{
                    marginLeft: 6, fontSize: 11, fontWeight: 700,
                    background: 'var(--color-pill-bg-red)',
                    color: 'var(--color-pill-text-red)',
                    borderRadius: 10, padding: '1px 6px',
                    verticalAlign: 'middle',
                  }}>
                    {activeRows.length}
                  </span>
                )}
              </Tabs.Tab>
            ))}
          </Tabs>
        }
      >
        {/* ── Grid card ── */}
        <GridCard>
          <GridCardHeader>
            <Typography intent="h3" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {activeTab === 'Active' ? 'Active Risks' : 'Resolved Risks'}
            </Typography>
            <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
              {displayRows.length} record{displayRows.length !== 1 ? 's' : ''}
            </Typography>
          </GridCardHeader>

          <ToolbarRow>
            <ToolbarLeft>
              <div style={{ maxWidth: 280 }}>
                <Search
                  placeholder="Search risks…"
                  value={searchText}
                  onChange={handleSearchChange}
                  onClear={handleSearchClear}
                />
              </div>
              <ToggleButton
                selected={filtersOpen}
                className="b_toggle"
                icon={<Filter />}
                onClick={() => { setFiltersOpen(v => !v); if (!filtersOpen) setConfigOpen(false); }}
              >
                Filters
              </ToggleButton>
            </ToolbarLeft>
            <ToolbarRight>
              <div style={{ width: 200 }}>
                <Select
                  placeholder="Group by"
                  label={groupBys.length > 0
                    ? `Group: ${groupBys.map(id => GROUP_BY_OPTIONS.find(o => o.id === id)?.label ?? id).join(', ')}`
                    : undefined}
                  onSelect={handleGroupBySelect}
                  onClear={groupBys.length > 0 ? handleGroupByClear : undefined}
                  block
                >
                  {GROUP_BY_OPTIONS.map(opt => (
                    <Select.Option key={opt.id} value={opt} selected={groupBys.includes(opt.id)}>
                      {opt.label}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              <ToggleButton
                selected={configOpen}
                className="b_toggle"
                icon={<Sliders />}
                onClick={() => { setConfigOpen(v => !v); if (!configOpen) setFiltersOpen(false); }}
              >
                Configure
              </ToggleButton>
            </ToolbarRight>
          </ToolbarRow>

          <GridArea>
            <RiskFiltersPanel
              open={filtersOpen}
              statusOptions={filterStatusOptions}
              categoryOptions={filterCategoryOptions}
              itemTypeOptions={filterItemTypeOptions}
              originOptions={filterOriginOptions}
              onApply={handleFilterApply}
              onClear={handleFilterClear}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <SmartGridWrapper<PortfolioRiskRow>
                id={`portfolio-risk-register-${activeTab.toLowerCase()}`}
                localStorageKey={`owner-proto-portfolio-risk-register-${activeTab.toLowerCase()}-v1`}
                height="100%"
                rowData={displayRows}
                columnDefs={columnDefs}
                getRowId={(p) => p.data.id}
                components={{
                  riskTitleCellRenderer:      RiskTitleCellRenderer,
                  riskStatusCellRenderer:     RiskStatusCellRenderer,
                  riskScoreCellRenderer:      RiskScoreCellRenderer,
                  riskItemTypeCellRenderer:   RiskItemTypeCellRenderer,
                  riskCategoriesCellRenderer: RiskCategoriesCellRenderer,
                  riskOriginCellRenderer:     RiskOriginCellRenderer,
                }}
                context={{ onOpenRisk: setOpenRiskId } as RiskGridContext}
                groupDisplayType="groupRows"
                groupDefaultExpanded={-1}
                autoGroupColumnDef={{ headerName: 'Project', minWidth: 220, cellRendererParams: { suppressCount: false } }}
                sideBar={false as const}
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
              gridApi={gridApiRef.current}
              onClose={() => setConfigOpen(false)}
            />
          </GridArea>

          {displayRows.length === 0 && (
            <Typography intent="body" style={{ color: 'var(--color-text-secondary)', padding: '32px', textAlign: 'center', display: 'block' }}>
              {activeTab === 'Active' ? 'No active risks across your portfolio.' : 'No resolved risks found.'}
            </Typography>
          )}
        </GridCard>

      </ToolPageLayout>

      {/* ── Manual risk form ── */}
      {showManualForm && <ManualRiskForm onClose={() => setShowManualForm(false)} />}

      {/* ── Source-item tearsheets ── */}
      {openRow?.sourceType === 'rfi' && (() => {
        const rfi = rfiMap[openRow.sourceId];
        if (!rfi) return null;
        const proj = allProjects.find(p => p.id === rfi.projectId);
        return <RfiDetailTearsheet key={openRiskId} rfi={rfi} projectName={proj?.name ?? ''} open onClose={closeSourceTearsheet} />;
      })()}
      {openRow?.sourceType === 'change_event' && (() => {
        const ce = ceMap[openRow.sourceId];
        if (!ce) return null;
        return <ChangeEventDetailTearsheet key={openRiskId} item={ce} open onClose={closeSourceTearsheet} />;
      })()}
      {openRow?.sourceType === 'submittal' && (() => {
        const sub = subMap[openRow.sourceId];
        if (!sub) return null;
        return <SubmittalDetailTearsheet key={openRiskId} item={sub} open onClose={closeSourceTearsheet} />;
      })()}
      {openRow?.sourceType === 'punch_list' && (() => {
        const punch = punchMap[openRow.sourceId];
        if (!punch) return null;
        return <PunchListDetailTearsheet key={openRiskId} item={punch} open onClose={closeSourceTearsheet} />;
      })()}
      {openRow?.sourceType === 'correspondence' && (() => {
        const corr = corrMap[openRow.sourceId];
        if (!corr) return null;
        return <CorrespondenceDetailTearsheet key={openRiskId} item={corr} open onClose={closeSourceTearsheet} />;
      })()}
    </>
  );
}
