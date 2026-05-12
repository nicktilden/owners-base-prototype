/**
 * HEALTH CONTENT
 * Shared health page body component. Works at portfolio (no projectId) or project scope.
 * Used by:
 *   - src/pages/portfolio/health.tsx (scope=portfolio)
 *   - src/pages/project/[id]/[tool].tsx when tool === 'health' (scope=project)
 *
 * Project scope tabs: Overview | Resolved
 *   Overview  — RiskRegisterCard (signal summary) + active risk records AG Grid
 *   Resolved  — closed/mitigated risk records AG Grid
 *
 * Portfolio scope tabs: Overview | Table | Cards  (unchanged)
 */

import React, { useMemo, useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { Button, Card, Modal, Page, Pill, Search, Select, Tabs, TextArea, TextInput, ToggleButton, Tooltip, Tearsheet, Typography, colors } from '@procore/core-react';
import { Clear, Cog, Copilot, Filter, Grip, Info, Plus, Sliders } from '@procore/core-icons';
import styled, { createGlobalStyle } from 'styled-components';
import type { GridApi } from 'ag-grid-community';
import ToolPageLayout from './ToolPageLayout';
import HealthScoreBadge from '@/components/health/HealthScoreBadge';
import HealthDetailTearsheet from '@/components/health/HealthDetailTearsheet';
import HealthSummaryCard from '@/components/health/cards/HealthSummaryCard';
import CostHealthCard from '@/components/health/cards/CostHealthCard';
import ScheduleHealthCard from '@/components/health/cards/ScheduleHealthCard';
import DeliveryRiskCard from '@/components/health/cards/DeliveryRiskCard';
import RiskRegisterCard from '@/components/health/cards/RiskRegisterCard';
import RiskTrendCard from '@/components/health/cards/RiskTrendCard';
import RiskCategoryDonutCard from '@/components/health/cards/RiskCategoryDonutCard';
import RiskByTypeBarCard from '@/components/health/cards/RiskByTypeBarCard';
import HubCardFrame, { HubCardEmptyState } from '@/components/hubs/HubCardFrame';
import KPIPill from '@/components/KPIPill';
import { SmartGridWrapper } from '@/components/SmartGrid';
import type { RiskGridRow, RiskGridContext } from '@/components/SmartGrid/riskColumnDefs';
import { riskColumnDefs } from '@/components/SmartGrid/riskColumnDefs';
import RiskTitleCellRenderer from '@/components/SmartGrid/RiskTitleCellRenderer';
import RiskStatusCellRenderer from '@/components/SmartGrid/RiskStatusCellRenderer';
import RiskScoreCellRenderer from '@/components/SmartGrid/RiskScoreCellRenderer';
import RiskItemTypeCellRenderer from '@/components/SmartGrid/RiskItemTypeCellRenderer';
import RiskCategoriesCellRenderer from '@/components/SmartGrid/RiskCategoriesCellRenderer';
import RiskOriginCellRenderer from '@/components/SmartGrid/RiskOriginCellRenderer';
import RiskFiltersPanel, { type RiskFilterValues } from '@/components/SmartGrid/RiskFiltersPanel';
import ConfigureColumnsPanel from '@/components/SmartGrid/ConfigureColumnsPanel';
import RfiDetailTearsheet from '@/components/tools/RfiDetailTearsheet';
import ChangeEventDetailTearsheet from '@/components/tools/ChangeEventDetailTearsheet';
import SubmittalDetailTearsheet from '@/components/tools/SubmittalDetailTearsheet';
import PunchListDetailTearsheet from '@/components/tools/PunchListDetailTearsheet';
import CorrespondenceDetailTearsheet from '@/components/tools/CorrespondenceDetailTearsheet';
import { users } from '@/data/seed/users';
import { riskTypes } from '@/data/seed/riskTypes';
import { rfis } from '@/data/seed/rfis';
import { changeEvents } from '@/data/seed/change_events';
import { submittals } from '@/data/seed/submittals';
import { punchList } from '@/data/seed/punch_list';
import { correspondence } from '@/data/seed/correspondence';
import { buildHealthResult, resolveKPIs } from '@/utils/healthEngine';
import { projects as allProjects } from '@/data/seed/projects';
import { getRisksForProject } from '@/data/seed/risks';
import { useData } from '@/context/DataContext';
import { useRiskTags } from '@/context/RiskTagsContext';
import { useManualRiskItems } from '@/context/ManualRiskItemsContext';
import type { HealthResult, HealthScore, KPICategory, KPIKey, KPIResult, Risk, RiskTag, ManualRiskItem, RiskCategory, RiskStatus, ResponseStrategy } from '@/types/health';
import { KPI_DESCRIPTIONS } from '@/types/health';
import type { Project } from '@/types/project';

// ─── Styled ───────────────────────────────────────────────────────────────────

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 16px;
  padding: 20px;
`;

const SummaryRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 20px 20px 0;
`;

const SummaryCard = styled.div<{ $score: HealthScore }>`
  padding: 16px;
  border-radius: 8px;
  border: 1px solid ${({ $score }) =>
    $score === 'red' ? 'var(--color-pill-border-red)' :
    $score === 'yellow' ? 'var(--color-pill-border-yellow)' :
    'var(--color-pill-border-green)'};
  background: ${({ $score }) =>
    $score === 'red' ? 'var(--color-pill-bg-red)' :
    $score === 'yellow' ? 'var(--color-pill-bg-yellow)' :
    'var(--color-pill-bg-green)'};
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CountLabel = styled.div<{ $score: HealthScore }>`
  font-size: 28px;
  font-weight: 700;
  color: ${({ $score }) =>
    $score === 'red' ? 'var(--color-pill-text-red)' :
    $score === 'yellow' ? 'var(--color-pill-text-yellow)' :
    'var(--color-pill-text-green)'};
`;

// Table view
const HealthTable = styled.div`
  padding: 20px;
`;

const TableHead = styled.div`
  display: grid;
  grid-template-columns: 1fr 100px 80px 80px 80px 80px 100px;
  padding: 6px 12px;
  border-bottom: 2px solid var(--color-border-separator);
  gap: 8px;
`;

const TableRow = styled.button`
  display: grid;
  grid-template-columns: 1fr 100px 80px 80px 80px 80px 100px;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-bottom: 1px solid var(--color-border-separator);
  text-align: left;
  cursor: pointer;
  width: 100%;
  gap: 8px;
  align-items: center;
  &:hover { background: var(--color-surface-hover); }
  &:last-child { border-bottom: none; }
`;

const HeaderCell = styled(Typography)`
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// ── Project KPI Scorecard ──────────────────────────────────────────────────────

const KPICenterWrap = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
`;

const ScorecardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  width: 100%;
`;

const KPITile = styled.button`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid var(--color-border-separator);
  border-radius: 8px;
  background: var(--color-surface-card);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s;
  &:hover { border-color: var(--color-action-primary); }
  &:focus-visible { outline: 2px solid var(--color-border-focus); outline-offset: 2px; }
`;

const KPITitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: 500;
  line-height: 1.15;
  color: var(--color-text-primary);
  letter-spacing: 0.15px;
`;

const TrendRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ScorecardTearsheetWidth = createGlobalStyle`
  [class*="StyledTearsheetBody"]:has(> .project-scorecard-tearsheet-root) {
    flex: 0 0 480px !important;
  }
`;

const RiskDetailTearsheetWidth = createGlobalStyle`
  [class*="StyledTearsheetBody"]:has(> .risk-detail-tearsheet-root) {
    flex: 0 0 60vw !important;
  }
`;

const TearsheetHeader = styled.div`
  padding: 24px 24px 16px;
  border-bottom: 1px solid var(--color-border-separator);
`;

const TearsheetBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
`;

const SectionTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  margin-top: 24px;
  &:first-child { margin-top: 0; }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const GridCard = styled(Card)`
  background: var(--color-surface-primary);
  overflow: hidden;
`;

// ── Configure scorecard modal styled components ───────────────────────────────

const ConfigSectionLabel = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 12px;
`;

const DisplayedKPIItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--color-border-separator);
  border-radius: 6px;
  background: var(--color-surface-primary);
  margin-bottom: 8px;
`;

const DragHandle = styled.div`
  display: flex;
  align-items: center;
  cursor: grab;
  flex-shrink: 0;
  color: var(--color-text-secondary);
  padding: 0 2px;
  &:active { cursor: grabbing; }
`;

const ItemNumber = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
  flex-shrink: 0;
  min-width: 20px;
`;

const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ItemSource = styled.div`
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 2px;
`;

const AvailableKPIsSection = styled.div`
  margin-top: 24px;
`;

const AvailableKPIItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border: 1.5px dashed var(--color-border-separator);
  border-radius: 6px;
  background: var(--color-surface-secondary);
  margin-bottom: 8px;
`;

const AvailableItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const AddBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  flex-shrink: 0;
  &:hover { background: var(--color-surface-hover); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const SettingsBanner = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-separator);
  border-radius: 6px;
  margin-bottom: 20px;
`;

const SettingsBannerText = styled.div`
  flex: 1;
  min-width: 0;
`;


const GridCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 0;
`;

// ── Risk grid toolbar ─────────────────────────────────────────────────────────

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

const GridArea = styled.div`
  display: flex;
  height: 560px;
  overflow: hidden;
`;

// ── Create Risk Record Tearsheet ──────────────────────────────────────────────

const RiskTearsheetWidth = createGlobalStyle`
  [class*="StyledTearsheetBody"]:has(> .create-risk-tearsheet-root) {
    flex: 0 0 56vw !important;
  }
`;

const RiskSectionCard = styled(Card)`
  padding: 20px;
  background: var(--color-surface-primary);
  margin-bottom: 16px;
  &:last-child { margin-bottom: 0; }
`;

const RiskFieldLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 6px;
`;

const RiskFormField = styled.div`
  margin-bottom: 16px;
  &:last-child { margin-bottom: 0; }
`;

const ImpactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const RatingRow = styled.div`
  display: flex;
  gap: 6px;
`;

const RatingBtn = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 6px 0;
  border-radius: 4px;
  border: 1.5px solid ${({ $active }) => $active ? 'var(--color-blue-500, #0069be)' : 'var(--color-border-default)'};
  background: ${({ $active }) => $active ? 'var(--color-blue-500, #0069be)' : 'var(--color-surface-primary)'};
  color: ${({ $active }) => $active ? '#fff' : 'var(--color-text-primary)'};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
  &:hover {
    border-color: var(--color-blue-500, #0069be);
    background: ${({ $active }) => $active ? 'var(--color-blue-500, #0069be)' : 'var(--color-surface-hover)'};
  }
`;

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<KPICategory, string> = {
  cost: 'Cost',
  schedule: 'Schedule',
  delivery: 'Delivery',
  risk: 'Risk',
};

const PORTFOLIO_TABS = ['Overview', 'Table', 'Cards'] as const;
const PROJECT_TABS   = ['Overview', 'Resolved'] as const;
type PortfolioTab = typeof PORTFOLIO_TABS[number];
type ProjectTab   = typeof PROJECT_TABS[number];

const riskGroupByOptions = [
  { id: 'itemType',  label: 'Item Type'     },
  { id: 'categories',label: 'Category'      },
  { id: 'status',    label: 'Status'        },
  { id: 'origin',    label: 'Origin'        },
];

const RISK_CATEGORY_OPTIONS: { value: RiskCategory; label: string }[] = [
  { value: 'financial',     label: 'Financial' },
  { value: 'schedule',      label: 'Schedule' },
  { value: 'safety',        label: 'Safety' },
  { value: 'contractual',   label: 'Contractual' },
  { value: 'regulatory',    label: 'Regulatory' },
  { value: 'environmental', label: 'Environmental' },
];

const RISK_STATUS_OPTIONS: { value: RiskStatus; label: string }[] = [
  { value: 'identified', label: 'Identified' },
  { value: 'assessed',   label: 'Assessed' },
  { value: 'mitigated',  label: 'Mitigated' },
  { value: 'closed',     label: 'Closed' },
];

const RESPONSE_STRATEGY_OPTIONS: { value: ResponseStrategy; label: string }[] = [
  { value: 'mitigate', label: 'Mitigate' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'accept',   label: 'Accept' },
  { value: 'avoid',    label: 'Avoid' },
];

// ─── Create Risk Record Tearsheet sub-component ───────────────────────────────

interface CreateRiskRecordTearsheetProps {
  open: boolean;
  projectId: string;
  onClose: () => void;
  onSave: (risk: Risk) => void;
}

interface RiskFormState {
  title: string;
  category: RiskCategory;
  description: string;
  probability: 1 | 2 | 3 | 4 | 5;
  impactCost: 1 | 2 | 3 | 4 | 5;
  impactSchedule: 1 | 2 | 3 | 4 | 5;
  impactSafety: 1 | 2 | 3 | 4 | 5;
  responseStrategy: ResponseStrategy;
  status: RiskStatus;
  dueDate: string;
}

const EMPTY_RISK_FORM: RiskFormState = {
  title: '',
  category: 'financial',
  description: '',
  probability: 3,
  impactCost: 3,
  impactSchedule: 3,
  impactSafety: 1,
  responseStrategy: 'mitigate',
  status: 'identified',
  dueDate: '',
};

const RATING_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: '1 – Rare',
  2: '2 – Unlikely',
  3: '3 – Possible',
  4: '4 – Likely',
  5: '5 – Certain',
};

const IMPACT_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: '1 – Minimal',
  2: '2 – Minor',
  3: '3 – Moderate',
  4: '4 – Major',
  5: '5 – Catastrophic',
};

function CreateRiskRecordTearsheet({ open, projectId, onClose, onSave }: CreateRiskRecordTearsheetProps) {
  const [form, setForm] = useState<RiskFormState>(EMPTY_RISK_FORM);

  // Reset form when opened
  React.useEffect(() => {
    if (open) setForm(EMPTY_RISK_FORM);
  }, [open]);

  const canSave = !!form.title.trim();

  function handleSave() {
    if (!canSave) return;
    const risk: Risk = {
      id: `risk-manual-${Date.now()}`,
      projectId,
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      probability: form.probability,
      impactCost: form.impactCost,
      impactSchedule: form.impactSchedule,
      impactSafety: form.impactSafety,
      responseStrategy: form.responseStrategy,
      status: form.status,
      dueDate: form.dueDate.trim() || null,
      origin: 'manual',
    };
    onSave(risk);
  }

  const selectedCategory = RISK_CATEGORY_OPTIONS.find(o => o.value === form.category) ?? RISK_CATEGORY_OPTIONS[0];
  const selectedStatus = RISK_STATUS_OPTIONS.find(o => o.value === form.status) ?? RISK_STATUS_OPTIONS[0];
  const selectedStrategy = RESPONSE_STRATEGY_OPTIONS.find(o => o.value === form.responseStrategy) ?? RESPONSE_STRATEGY_OPTIONS[0];

  function RatingControl({ value, onChange, labels }: {
    value: 1 | 2 | 3 | 4 | 5;
    onChange: (v: 1 | 2 | 3 | 4 | 5) => void;
    labels: Record<1 | 2 | 3 | 4 | 5, string>;
  }) {
    return (
      <>
        <RatingRow>
          {([1, 2, 3, 4, 5] as const).map(n => (
            <RatingBtn
              key={n}
              type="button"
              $active={value === n}
              onClick={() => onChange(n)}
              title={labels[n]}
            >
              {n}
            </RatingBtn>
          ))}
        </RatingRow>
        <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block', marginTop: 4 }}>
          {labels[value]}
        </Typography>
      </>
    );
  }

  return (
    <>
      <RiskTearsheetWidth />
      <Tearsheet open={open} onClose={onClose} aria-label="Create Risk Record" placement="right">
        <div
          className="create-risk-tearsheet-root"
          style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}
        >
          <Page style={{ height: '100%', background: 'var(--color-surface-primary)', color: 'var(--color-text-primary)' }}>
            <Page.Main style={{ height: '100%', overflow: 'hidden', background: 'var(--color-surface-primary)' }}>

              <Page.Header style={{ background: 'var(--color-surface-primary)', borderColor: 'var(--color-border-separator)' }}>
                <Page.Title>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                      <Typography intent="h2">New Risk Record</Typography>
                      <Typography intent="body" style={{ color: 'var(--color-text-secondary)' }}>
                        Manually document a risk for this project
                      </Typography>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <Button variant="tertiary" className="b_tertiary" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        className="b_primary"
                        onClick={handleSave}
                        disabled={!canSave}
                      >
                        Create Risk Record
                      </Button>
                    </div>
                  </div>
                </Page.Title>
              </Page.Header>

              <Page.Body style={{ padding: 24, overflowY: 'auto', background: 'var(--color-surface-secondary)' }}>

                {/* ── Identity ── */}
                <RiskSectionCard>
                  <Typography intent="h3" style={{ fontWeight: 700, marginBottom: 16, display: 'block' }}>Identity</Typography>
                  <RiskFormField>
                    <RiskFieldLabel htmlFor="risk-title">Title *</RiskFieldLabel>
                    <TextInput
                      id="risk-title"
                      value={form.title}
                      placeholder="e.g. Foundation soil conditions unknown"
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    />
                  </RiskFormField>
                  <RiskFormField>
                    <RiskFieldLabel>Category</RiskFieldLabel>
                    <Select
                      block
                      label={selectedCategory.label}
                      onSelect={({ item }) => setForm(f => ({ ...f, category: (item as typeof RISK_CATEGORY_OPTIONS[0]).value }))}
                    >
                      {RISK_CATEGORY_OPTIONS.map(opt => (
                        <Select.Option key={opt.value} value={opt} selected={form.category === opt.value}>
                          {opt.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </RiskFormField>
                  <RiskFormField>
                    <RiskFieldLabel htmlFor="risk-desc">Description</RiskFieldLabel>
                    <TextArea
                      id="risk-desc"
                      value={form.description}
                      placeholder="Describe the risk, its context, and potential consequences..."
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      style={{ minHeight: 80, width: '100%', boxSizing: 'border-box' }}
                    />
                  </RiskFormField>
                </RiskSectionCard>

                {/* ── Probability & Impact ── */}
                <RiskSectionCard>
                  <Typography intent="h3" style={{ fontWeight: 700, marginBottom: 4, display: 'block' }}>Probability &amp; Impact</Typography>
                  <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 16 }}>
                    Rate from 1 (low) to 5 (high). Risk Score = Probability × Max Impact.
                  </Typography>

                  <RiskFormField>
                    <RiskFieldLabel>Probability</RiskFieldLabel>
                    <RatingControl
                      value={form.probability}
                      onChange={v => setForm(f => ({ ...f, probability: v }))}
                      labels={RATING_LABELS}
                    />
                  </RiskFormField>

                  <ImpactGrid>
                    <RiskFormField>
                      <RiskFieldLabel>Cost Impact</RiskFieldLabel>
                      <RatingControl
                        value={form.impactCost}
                        onChange={v => setForm(f => ({ ...f, impactCost: v }))}
                        labels={IMPACT_LABELS}
                      />
                    </RiskFormField>
                    <RiskFormField>
                      <RiskFieldLabel>Schedule Impact</RiskFieldLabel>
                      <RatingControl
                        value={form.impactSchedule}
                        onChange={v => setForm(f => ({ ...f, impactSchedule: v }))}
                        labels={IMPACT_LABELS}
                      />
                    </RiskFormField>
                    <RiskFormField>
                      <RiskFieldLabel>Safety Impact</RiskFieldLabel>
                      <RatingControl
                        value={form.impactSafety}
                        onChange={v => setForm(f => ({ ...f, impactSafety: v }))}
                        labels={IMPACT_LABELS}
                      />
                    </RiskFormField>
                  </ImpactGrid>
                </RiskSectionCard>

                {/* ── Response & Status ── */}
                <RiskSectionCard>
                  <Typography intent="h3" style={{ fontWeight: 700, marginBottom: 16, display: 'block' }}>Response &amp; Status</Typography>
                  <RiskFormField>
                    <RiskFieldLabel>Response Strategy</RiskFieldLabel>
                    <Select
                      block
                      label={selectedStrategy.label}
                      onSelect={({ item }) => setForm(f => ({ ...f, responseStrategy: (item as typeof RESPONSE_STRATEGY_OPTIONS[0]).value }))}
                    >
                      {RESPONSE_STRATEGY_OPTIONS.map(opt => (
                        <Select.Option key={opt.value} value={opt} selected={form.responseStrategy === opt.value}>
                          {opt.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </RiskFormField>
                  <RiskFormField>
                    <RiskFieldLabel>Status</RiskFieldLabel>
                    <Select
                      block
                      label={selectedStatus.label}
                      onSelect={({ item }) => setForm(f => ({ ...f, status: (item as typeof RISK_STATUS_OPTIONS[0]).value }))}
                    >
                      {RISK_STATUS_OPTIONS.map(opt => (
                        <Select.Option key={opt.value} value={opt} selected={form.status === opt.value}>
                          {opt.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </RiskFormField>
                  <RiskFormField>
                    <RiskFieldLabel htmlFor="risk-due">Due Date</RiskFieldLabel>
                    <TextInput
                      id="risk-due"
                      type="date"
                      value={form.dueDate}
                      onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                    />
                  </RiskFormField>
                </RiskSectionCard>

              </Page.Body>
            </Page.Main>
          </Page>
        </div>
      </Tearsheet>
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// 1-5 scale → real dollar amounts (healthcare construction magnitude)
const COST_SCALE: Record<number, number> = { 1: 50000, 2: 250000, 3: 750000, 4: 2000000, 5: 5000000 };
// 1-5 scale → days
const SCHEDULE_SCALE: Record<number, number> = { 1: 7, 2: 21, 3: 45, 4: 90, 5: 180 };

function toRiskGridRow(r: Risk, assignedTo = ''): RiskGridRow {
  const maxImpact = Math.max(r.impactCost, r.impactSchedule, r.impactSafety);
  const catLabel = CATEGORY_DISPLAY[r.category] ?? r.category;
  const costDollars = COST_SCALE[r.impactCost] ?? 0;
  const scheduleDays = SCHEDULE_SCALE[r.impactSchedule] ?? 0;
  return {
    id:             r.id,
    itemTitle:      r.title,
    itemType:       'Manual',
    itemDueDate:    r.dueDate ?? '',
    itemStatus:     r.status,
    itemAssignedTo: assignedTo,
    categories:     [catLabel],
    riskScore:      r.probability * maxImpact,
    impactSummary:  `${maxImpact}/5`,
    impactRaw:      maxImpact,
    costImpact:     formatCostImpact(costDollars, 'financial'),
    scheduleImpact: formatScheduleImpact(scheduleDays, 'schedule'),
    status:         r.status,
    assignedTo,
    origin:         r.origin,
    sourceType:     'manual',
    sourceId:       r.id,
    probability:    r.probability,
    impact:         maxImpact,
    riskTypeLabel:  r.category,
    description:    r.description,
  };
}

const riskTypeLookup = Object.fromEntries(riskTypes.map(rt => [rt.id, rt]));

// ─── Source-item lookup maps ──────────────────────────────────────────────────

const rfiMap = Object.fromEntries(rfis.map(r => [r.id, r]));
const ceMap  = Object.fromEntries(changeEvents.map(c => [c.id, c]));
const subMap = Object.fromEntries(submittals.map(s => [s.id, s]));
const punchMap = Object.fromEntries(punchList.map(p => [p.id, p]));
const corrMap  = Object.fromEntries(correspondence.map(c => [c.id, c]));

const SOURCE_TYPE_LABELS: Record<string, string> = {
  rfi:            'RFI',
  change_event:   'Change Event',
  submittal:      'Submittal',
  punch_list:     'Punch List',
  correspondence: 'Correspondence',
  milestone:      'Milestone',
  budget_line:    'Budget Line',
  manual:         'Manual',
  observation:    'Observation',
  incident:       'Incident',
  inspection:     'Inspection',
  task:           'Task',
  document:       'Document',
};

const CATEGORY_DISPLAY: Record<string, string> = {
  financial:    'Financial',
  schedule:     'Schedule',
  safety:       'Safety',
  quality:      'Quality',
  contractual:  'Contractual',
  regulatory:   'Regulatory',
  environmental:'Environmental',
  other:        'Other',
};

function formatImpact(impact: number, category: string): string {
  if (impact <= 5) {
    return `${impact}/5`;
  }
  if (category === 'schedule') {
    return impact === 1 ? '1 day' : `${impact} days`;
  }
  if (impact >= 1_000_000) return `$${(impact / 1_000_000).toFixed(1)}M`;
  if (impact >= 1_000)     return `$${Math.round(impact / 1_000)}K`;
  return `$${impact.toLocaleString()}`;
}

function formatCostImpact(impact: number, category: string): string {
  if (category === 'schedule') return '—';
  if (impact <= 0) return '—';
  if (impact >= 1_000_000) return `$${(impact / 1_000_000).toFixed(1)}M`;
  if (impact >= 1_000)     return `$${Math.round(impact / 1_000)}K`;
  return `$${impact.toLocaleString()}`;
}

function formatScheduleImpact(impact: number, category: string): string {
  if (category !== 'schedule') return '—';
  if (impact <= 0) return '—';
  return impact === 1 ? '1 day' : `${impact} days`;
}

function getSourceItem(sourceType: string, sourceId: string): {
  itemTitle: string;
  itemDueDate: string;
  itemStatus: string;
  itemAssignedTo: string;
} {
  switch (sourceType) {
    case 'rfi': {
      const r = rfiMap[sourceId];
      return {
        itemTitle:      r ? (r.subject ?? sourceId) : sourceId,
        itemDueDate:    r?.dueDate ?? '',
        itemStatus:     r?.status ?? '',
        itemAssignedTo: '',
      };
    }
    case 'change_event': {
      const c = ceMap[sourceId];
      return {
        itemTitle:      c?.title ?? sourceId,
        itemDueDate:    c?.createdAt instanceof Date ? c.createdAt.toLocaleDateString() : (c?.createdAt ?? ''),
        itemStatus:     c?.status ?? '',
        itemAssignedTo: '',
      };
    }
    case 'submittal': {
      const s = subMap[sourceId];
      return {
        itemTitle:      s?.title ?? sourceId,
        itemDueDate:    s?.finalDueDate ?? '',
        itemStatus:     s?.status ?? '',
        itemAssignedTo: s?.responsibleContractorId ?? '',
      };
    }
    case 'punch_list': {
      const p = punchMap[sourceId];
      return {
        itemTitle:      p?.description ?? sourceId,
        itemDueDate:    p?.dueDate ?? '',
        itemStatus:     p?.status ?? '',
        itemAssignedTo: p?.assignedTo ?? '',
      };
    }
    case 'correspondence': {
      const c = corrMap[sourceId];
      return {
        itemTitle:      c?.subject ?? sourceId,
        itemDueDate:    c?.date ?? '',
        itemStatus:     c?.status ?? '',
        itemAssignedTo: c?.from ?? '',
      };
    }
    default:
      return { itemTitle: sourceId, itemDueDate: '', itemStatus: '', itemAssignedTo: '' };
  }
}

function toRiskGridRowFromTag(tag: RiskTag, ownerName = ''): RiskGridRow {
  const rt = riskTypeLookup[tag.riskTypeId];
  const category = rt?.category ?? 'financial';
  const catLabel = CATEGORY_DISPLAY[category] ?? category;
  const impactNorm = tag.impact > 5 ? Math.min(5, Math.round(tag.impact / 100000)) || 1 : tag.impact;
  const sourceItem = getSourceItem(tag.sourceType, tag.sourceId);
  return {
    id:            tag.id,
    itemTitle:     sourceItem.itemTitle,
    itemType:      SOURCE_TYPE_LABELS[tag.sourceType] ?? tag.sourceType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    itemDueDate:   sourceItem.itemDueDate,
    itemStatus:    sourceItem.itemStatus,
    itemAssignedTo:sourceItem.itemAssignedTo,
    categories:    [catLabel],
    riskScore:     tag.probability * impactNorm,
    impactSummary: formatImpact(tag.impact, category),
    impactRaw:     tag.impact,
    costImpact:    formatCostImpact(tag.impact, category),
    scheduleImpact:formatScheduleImpact(tag.impact, category),
    status:        tag.status,
    assignedTo:    ownerName,
    origin:        tag.origin,
    sourceType:    tag.sourceType,
    sourceId:      tag.sourceId,
    probability:   tag.probability,
    impact:        tag.impact,
    riskTypeLabel: rt?.label ?? '',
    description:   tag.mitigationPlan ?? '',
  };
}

function toRiskGridRowFromManualItem(item: ManualRiskItem, ownerName = ''): RiskGridRow {
  const rt = riskTypeLookup[item.riskTypeId];
  const category = rt?.category ?? 'financial';
  const catLabel = CATEGORY_DISPLAY[category] ?? category;
  const impactNorm = item.impact > 5 ? Math.min(5, Math.round(item.impact / 100000)) || 1 : item.impact;
  return {
    id:            item.id,
    itemTitle:     item.title,
    itemType:      'Manual',
    itemDueDate:   '',
    itemStatus:    '',
    itemAssignedTo:'',
    categories:    [catLabel],
    riskScore:     item.probability * impactNorm,
    impactSummary: formatImpact(item.impact, category),
    impactRaw:     item.impact,
    costImpact:    formatCostImpact(item.impact, category),
    scheduleImpact:formatScheduleImpact(item.impact, category),
    status:        item.status,
    assignedTo:    ownerName,
    origin:        item.origin,
    sourceType:    'manual',
    sourceId:      item.id,
    probability:   item.probability,
    impact:        item.impact,
    riskTypeLabel: rt?.label ?? '',
    description:   item.description,
  };
}

// ─── Risk Records Grid (shared between Overview + Resolved tabs) ───────────────

interface RiskGridProps {
  rows: RiskGridRow[];
  gridId: string;
  localStorageKey: string;
  searchPlaceholder: string;
  emptyLabel: string;
  title: string;
  onOpenRisk?: (id: string) => void;
}

function RiskGrid({ rows, gridId, localStorageKey, searchPlaceholder, emptyLabel, title, onOpenRisk }: RiskGridProps) {
  const gridApiRef = useRef<GridApi<RiskGridRow> | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [groupBys, setGroupBys] = useState<string[]>([]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchText(val);
    gridApiRef.current?.setGridOption('quickFilterText', val);
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

  const statusOptions = useMemo(
    () => [...new Set(rows.map((r) => r.status).filter(Boolean))].sort(),
    [rows]
  );
  const categoryOptions = useMemo(
    () => [...new Set(rows.flatMap((r) => r.categories).filter(Boolean))].sort(),
    [rows]
  );
  const itemTypeOptions = useMemo(
    () => [...new Set(rows.map((r) => r.itemType).filter(Boolean))].sort(),
    [rows]
  );
  const originOptions = useMemo(
    () => [...new Set(rows.map((r) => r.origin).filter(Boolean))].sort(),
    [rows]
  );

  return (
    <GridCard>
      <GridCardHeader>
        <Typography intent="h3" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {title}
        </Typography>
        <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
          {rows.length} record{rows.length !== 1 ? 's' : ''}
        </Typography>
      </GridCardHeader>
      <div style={{ padding: '12px 20px 0' }}>
        <ToolbarRow>
          <ToolbarLeft>
            <div style={{ maxWidth: 260 }}>
              <Search
                placeholder={searchPlaceholder}
                value={searchText}
                onChange={handleSearchChange}
                onClear={handleSearchClear}
              />
            </div>
            <ToggleButton
              selected={filtersOpen}
              className="b_toggle"
              icon={<Filter />}
              onClick={() => {
                setFiltersOpen(v => !v);
                if (!filtersOpen) setConfigOpen(false);
              }}
            >
              Filters
            </ToggleButton>
          </ToolbarLeft>
          <ToolbarRight>
            <div style={{ width: 180 }}>
              <Select
                placeholder="Group by"
                label={groupBys.length > 0
                  ? `Group by: ${groupBys.map(id => riskGroupByOptions.find(o => o.id === id)?.label ?? id).join(', ')}`
                  : undefined}
                onSelect={handleGroupBySelect}
                onClear={groupBys.length > 0 ? handleGroupByClear : undefined}
                block
              >
                {riskGroupByOptions.map(opt => (
                  <Select.Option
                    key={opt.id}
                    value={opt}
                    selected={groupBys.includes(opt.id)}
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
              onClick={() => {
                setConfigOpen(v => !v);
                if (!configOpen) setFiltersOpen(false);
              }}
            >
              Configure
            </ToggleButton>
          </ToolbarRight>
        </ToolbarRow>
      </div>
      <GridArea>
        <RiskFiltersPanel
          open={filtersOpen}
          statusOptions={statusOptions}
          categoryOptions={categoryOptions}
          itemTypeOptions={itemTypeOptions}
          originOptions={originOptions}
          onApply={handleFilterApply}
          onClear={handleFilterClear}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <SmartGridWrapper<RiskGridRow>
            id={gridId}
            localStorageKey={localStorageKey}
            height="100%"
            rowData={rows}
            columnDefs={riskColumnDefs}
            getRowId={(p) => p.data.id}
            components={{
              riskTitleCellRenderer: RiskTitleCellRenderer,
              riskStatusCellRenderer: RiskStatusCellRenderer,
              riskScoreCellRenderer: RiskScoreCellRenderer,
              riskItemTypeCellRenderer: RiskItemTypeCellRenderer,
              riskCategoriesCellRenderer: RiskCategoriesCellRenderer,
              riskOriginCellRenderer: RiskOriginCellRenderer,
            }}
            context={{ onOpenRisk } as RiskGridContext}
            groupDisplayType="groupRows"
            autoGroupColumnDef={{ headerName: 'Item Title', minWidth: 220 }}
            sideBar={false as const}
            onGridReady={(e) => { gridApiRef.current = e.api; }}
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
      {rows.length === 0 && (
        <Typography intent="body" style={{ color: 'var(--color-text-secondary)', padding: '24px', textAlign: 'center', display: 'block' }}>
          {emptyLabel}
        </Typography>
      )}
    </GridCard>
  );
}

// ─── Project Risk Scorecard (configurable, max 4 KPIs, empty-state + modal) ───

interface ProjectRiskScorecardProps {
  projectId: string;
}

function ProjectRiskScorecard({ projectId }: ProjectRiskScorecardProps) {
  const { data } = useData();
  const config = data.account?.healthConfig;

  const [displayedIds, setDisplayedIds] = useState<KPIKey[]>(['budgetVariance', 'rfisAtRisk', 'scheduleStatus', 'changeEvents']);
  const [configOpen, setConfigOpen] = useState(false);
  const [draftIds, setDraftIds] = useState<KPIKey[]>([]);
  const [selectedKPIKey, setSelectedKPIKey] = useState<KPIKey | null>(null);
  const dragIndexRef = useRef<number | null>(null);

  // Resolve all KPIs for this project
  const allProjectKPIs = useMemo<KPIResult[]>(() => {
    if (!config) return [];
    const project = allProjects.find(p => p.id === projectId);
    if (!project) return [];
    const risks = getRisksForProject(projectId);
    return resolveKPIs(project, config, undefined, risks);
  }, [config, projectId]);

  const availableKPIKeys: KPIKey[] = config?.activeKPIs ?? [];

  // KPIs selected for display, in order
  const displayedKPIs = displayedIds
    .map(id => allProjectKPIs.find(k => k.key === id))
    .filter((k): k is KPIResult => k != null);

  // Draft state for the modal
  const displayedDraftKPIs = draftIds
    .map(id => allProjectKPIs.find(k => k.key === id))
    .filter((k): k is KPIResult => k != null);

  const availableForDraft = availableKPIKeys.filter(id => !draftIds.includes(id));

  function openConfig() {
    setDraftIds([...displayedIds]);
    setConfigOpen(true);
  }

  function handleSaveConfig() {
    setDisplayedIds([...draftIds]);
    setConfigOpen(false);
  }

  function handleRemoveDraft(id: KPIKey) {
    setDraftIds(prev => prev.filter(d => d !== id));
  }

  function handleAddDraft(id: KPIKey) {
    if (draftIds.length >= 4) return;
    setDraftIds(prev => [...prev, id]);
  }

  function handleDragStart(index: number) {
    dragIndexRef.current = index;
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from === null || from === index) return;
    setDraftIds(prev => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(index, 0, item);
      return next;
    });
    dragIndexRef.current = index;
  }

  function handleDragEnd() {
    dragIndexRef.current = null;
  }

  const activeKPI = selectedKPIKey ? allProjectKPIs.find(k => k.key === selectedKPIKey) ?? null : null;

  function toneFromStatus(status: KPIResult['status']): 'positive' | 'negative' | 'neutral' {
    if (status === 'green') return 'positive';
    if (status === 'red') return 'negative';
    return 'neutral';
  }

  return (
    <>
      <HubCardFrame
        title="Risk KPIs"
        actions={
          <HeaderActions>
            {displayedKPIs.length > 0 && (
              <Button
                className="b_secondary"
                variant="secondary"
                size="sm"
                icon={<Copilot size="sm" style={{ color: colors.orange50 }} />}
                aria-label="Summarize with AI"
                style={{
                  background: colors.orange98,
                  border: `1px solid ${colors.orange50}`,
                  borderRadius: 4,
                  color: colors.gray15,
                }}
              >
                Summarize
              </Button>
            )}
            <Tooltip trigger="hover" placement="top" overlay={<Tooltip.Content>Configure scorecard</Tooltip.Content>}>
              <Button
                variant="tertiary"
                size="sm"
                icon={<Cog size="sm" />}
                aria-label="Configure scorecard"
                onClick={openConfig}
              />
            </Tooltip>
          </HeaderActions>
        }
      >
        {displayedKPIs.length === 0
          ? <HubCardEmptyState
              title="There Are No KPIs to Display Right Now"
              body="Select up to 4 KPIs from your active Risk Register settings to track on this project."
              actions={
                <>
                  <Button variant="secondary" className="b_secondary" size="sm" onClick={openConfig}>
                    Configure Scorecard
                  </Button>
                  <Link href="/settings/health-risk">
                    <Button variant="tertiary" size="sm">
                      Account Settings
                    </Button>
                  </Link>
                </>
              }
            />
          : <KPICenterWrap>
              <ScorecardGrid>
                {displayedKPIs.map(kpi => (
                  <KPITile
                    key={kpi.key}
                    onClick={() => setSelectedKPIKey(kpi.key)}
                    aria-label={`${kpi.label}: ${kpi.displayValue}. Click to view details.`}
                  >
                    <KPITitleRow>
                      <Typography
                        intent="body"
                        style={{ color: 'var(--color-text-primary)', fontWeight: 400, fontSize: 14, lineHeight: '20px', letterSpacing: '0.15px' }}
                      >
                        {kpi.label}
                      </Typography>
                      <Tooltip
                        trigger="hover"
                        placement="top"
                        overlay={<Tooltip.Content><div style={{ maxWidth: 220, whiteSpace: 'normal' }}>{KPI_DESCRIPTIONS[kpi.key]}</div></Tooltip.Content>}
                      >
                        <span style={{ display: 'inline-flex', color: 'var(--color-text-primary)', cursor: 'help' }}>
                          <Info size="sm" />
                        </span>
                      </Tooltip>
                    </KPITitleRow>
                    <MetricValue>{kpi.displayValue}</MetricValue>
                    <TrendRow>
                      <KPIPill
                        tone={toneFromStatus(kpi.status)}
                        trendValue={0}
                        value={kpi.status === 'unavailable' ? 'No data' : kpi.status === 'green' ? 'On Track' : kpi.status === 'yellow' ? 'At Risk' : 'Critical'}
                      />
                      <Typography intent="small" style={{ color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>Last 30 days</Typography>
                    </TrendRow>
                  </KPITile>
                ))}
              </ScorecardGrid>
            </KPICenterWrap>
        }
      </HubCardFrame>

      {/* ── Configure Scorecard Modal ── */}
      <Modal
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        aria-label="Configure Scorecard"
        howToClose={['x', 'scrim']}
        style={{ width: 640 }}
      >
        <Modal.Header onClose={() => setConfigOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Cog size="md" style={{ flexShrink: 0 }} />
          Configure Scorecard
        </Modal.Header>

        <Modal.Body>
          <SettingsBanner>
            <SettingsBannerText>
              <Typography intent="body" style={{ fontWeight: 700, color: 'var(--color-text-primary)', display: 'block', marginBottom: 4 }}>
                Manage Risk Register KPIs
              </Typography>
              <Typography intent="body" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                Available KPIs are defined in Account Settings. Go to Settings to add, remove, or adjust thresholds.
              </Typography>
            </SettingsBannerText>
            <Link href="/settings/health-risk" style={{ textDecoration: 'none', flexShrink: 0 }}>
              <Button variant="secondary" className="b_secondary" size="sm" onClick={() => setConfigOpen(false)}>
                Go To Settings
              </Button>
            </Link>
          </SettingsBanner>

          <Typography intent="body" style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 20 }}>
            Choose up to 4 KPIs to display on the scorecard for this project.
          </Typography>

          <ConfigSectionLabel>Displayed KPIs ({draftIds.length}/4)</ConfigSectionLabel>

          {displayedDraftKPIs.map((kpi, idx) => (
            <DisplayedKPIItem
              key={kpi.key}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
            >
              <DragHandle aria-hidden><Grip size="sm" /></DragHandle>
              <ItemNumber>{idx + 1}.</ItemNumber>
              <ItemInfo>
                <ItemLabel>
                  {kpi.label}
                  <Tooltip
                    trigger="hover"
                    placement="top"
                    overlay={<Tooltip.Content><div style={{ maxWidth: 220, whiteSpace: 'normal' }}>{KPI_DESCRIPTIONS[kpi.key]}</div></Tooltip.Content>}
                  >
                    <span style={{ display: 'inline-flex', color: 'var(--color-text-secondary)', cursor: 'help' }}>
                      <Info size="sm" />
                    </span>
                  </Tooltip>
                </ItemLabel>
                <ItemSource>{kpi.sourceLabel}</ItemSource>
              </ItemInfo>
              <Button
                variant="tertiary"
                size="sm"
                icon={<Clear size="sm" />}
                aria-label={`Remove ${kpi.label}`}
                onClick={() => handleRemoveDraft(kpi.key)}
              />
            </DisplayedKPIItem>
          ))}

          {draftIds.length === 0 && (
            <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block', padding: '12px 0' }}>
              No KPIs selected. Add up to 4 from the list below.
            </Typography>
          )}

          {availableForDraft.length > 0 && (
            <AvailableKPIsSection>
              <ConfigSectionLabel>Available KPIs ({availableForDraft.length})</ConfigSectionLabel>
              {availableForDraft.map(key => {
                const kpi = allProjectKPIs.find(k => k.key === key);
                if (!kpi) return null;
                return (
                  <AvailableKPIItem key={key}>
                    <AvailableItemInfo>
                      <ItemLabel>
                        {kpi.label}
                        <Tooltip
                          trigger="hover"
                          placement="top"
                          overlay={<Tooltip.Content><div style={{ maxWidth: 220, whiteSpace: 'normal' }}>{KPI_DESCRIPTIONS[key]}</div></Tooltip.Content>}
                        >
                          <span style={{ display: 'inline-flex', color: 'var(--color-text-secondary)', cursor: 'help' }}>
                            <Info size="sm" />
                          </span>
                        </Tooltip>
                      </ItemLabel>
                      <ItemSource>{kpi.sourceLabel}</ItemSource>
                    </AvailableItemInfo>
                    <AddBtn
                      type="button"
                      disabled={draftIds.length >= 4}
                      aria-label={`Add ${kpi.label}`}
                      onClick={() => handleAddDraft(key)}
                    >
                      <Plus size="sm" />
                      Add
                    </AddBtn>
                  </AvailableKPIItem>
                );
              })}
            </AvailableKPIsSection>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="tertiary" className="b_tertiary" onClick={() => setConfigOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="b_primary"
            onClick={handleSaveConfig}
            disabled={draftIds.length === 0}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── KPI Detail Tearsheet ── */}
      <ScorecardTearsheetWidth />
      <Tearsheet
        open={selectedKPIKey !== null}
        onClose={() => setSelectedKPIKey(null)}
        placement="right"
        block
        aria-label={activeKPI ? `${activeKPI.label} details` : 'KPI details'}
      >
        <div className="project-scorecard-tearsheet-root" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {activeKPI && (
            <>
              <TearsheetHeader>
                <Typography intent="h2" style={{ fontWeight: 700, color: 'var(--color-text-primary)', display: 'block' }}>
                  {activeKPI.label}
                </Typography>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                  <span style={{ fontSize: 28, fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '0.15px' }}>
                    {activeKPI.displayValue}
                  </span>
                  <KPIPill
                    tone={activeKPI.status === 'green' ? 'positive' : activeKPI.status === 'red' ? 'negative' : 'neutral'}
                    trendValue={0}
                    value={activeKPI.status === 'green' ? 'On Track' : activeKPI.status === 'yellow' ? 'At Risk' : activeKPI.status === 'red' ? 'Critical' : 'No Data'}
                  />
                </div>
                <Typography intent="body" style={{ color: 'var(--color-text-secondary)', display: 'block', marginTop: 4 }}>
                  {KPI_DESCRIPTIONS[activeKPI.key]}
                </Typography>
              </TearsheetHeader>
              <TearsheetBody>
                <SectionTitle>Definition</SectionTitle>
                <Typography intent="body" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                  {KPI_DESCRIPTIONS[activeKPI.key]}
                </Typography>
              </TearsheetBody>
            </>
          )}
        </div>
      </Tearsheet>
    </>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface HealthContentProps {
  scope: 'portfolio' | 'project';
  projectId?: string;
}

export default function HealthContent({ scope, projectId }: HealthContentProps) {
  const { data } = useData();
  const config = data.account?.healthConfig;
  const { getRiskTagsForProject } = useRiskTags();
  const { getManualRiskItemsForProject } = useManualRiskItems();
  const [activeTab, setActiveTab] = useState<PortfolioTab | ProjectTab>('Overview');
  const [tearsheet, setTearsheet] = useState<{ project: Project; result: HealthResult } | null>(null);
  const [createRiskOpen, setCreateRiskOpen] = useState(false);
  const [extraRisks, setExtraRisks] = useState<Risk[]>([]);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
  const [assignedUsers, setAssignedUsers] = useState<Record<string, string>>({});
  const [openRiskId, setOpenRiskId] = useState<string | null>(null);


  const projectResults = useMemo(() => {
    if (!config) return [];
    const source = scope === 'project' && projectId
      ? allProjects.filter(p => p.id === projectId)
      : allProjects;

    return source.map(p => {
      const risks = getRisksForProject(p.id);
      const result = buildHealthResult(p, config, undefined, risks);
      return { project: p, result };
    });
  }, [config, scope, projectId]);

  const activeResults = scope === 'portfolio'
    ? projectResults.filter(r => r.project.status === 'active')
    : projectResults;

  const counts: Record<HealthScore, number> = { green: 0, yellow: 0, red: 0 };
  activeResults.forEach(r => { counts[r.result.compositeScore]++; });

  const singleResult = scope === 'project' ? projectResults[0] : null;
  const singleProject = singleResult?.project ?? null;

  // ── Project-scope risk rows ───────────────────────────────────────────────
  const allProjectRisks = useMemo(() => {
    if (scope !== 'project' || !projectId) return [];
    const seedRisks = getRisksForProject(projectId);
    const extra = extraRisks.filter(r => r.projectId === projectId);
    return [...seedRisks, ...extra];
  }, [scope, projectId, extraRisks]);

  const projectRiskTags = useMemo(() =>
    scope === 'project' && projectId ? getRiskTagsForProject(projectId) : [],
  [scope, projectId, getRiskTagsForProject]);

  const projectManualItems = useMemo(() =>
    scope === 'project' && projectId ? getManualRiskItemsForProject(projectId) : [],
  [scope, projectId, getManualRiskItemsForProject]);

  const RESOLVED_STATUSES = new Set(['closed', 'mitigated']);

  const activeRiskRows = useMemo<RiskGridRow[]>(() => {
    const legacyRows = allProjectRisks
      .filter(r => r.status !== 'closed' && r.status !== 'mitigated' && !resolvedIds.has(r.id))
      .map(r => {
        const uid = assignedUsers[r.id];
        const u = users.find(u => u.id === uid);
        return toRiskGridRow(r, u ? `${u.firstName} ${u.lastName}` : '');
      });
    const tagRows = projectRiskTags
      .filter(t => !RESOLVED_STATUSES.has(t.status) && !resolvedIds.has(t.id))
      .map(t => {
        const u = users.find(u => u.id === t.riskOwner);
        return toRiskGridRowFromTag(t, u ? `${u.firstName} ${u.lastName}` : '');
      });
    const manualRows = projectManualItems
      .filter(m => !RESOLVED_STATUSES.has(m.status) && !resolvedIds.has(m.id))
      .map(m => {
        const u = users.find(u => u.id === m.riskOwner);
        return toRiskGridRowFromManualItem(m, u ? `${u.firstName} ${u.lastName}` : '');
      });
    return [...legacyRows, ...tagRows, ...manualRows];
  }, [allProjectRisks, projectRiskTags, projectManualItems, resolvedIds, assignedUsers]);

  const resolvedRiskRows = useMemo<RiskGridRow[]>(() => {
    const legacyRows = allProjectRisks
      .filter(r => r.status === 'closed' || r.status === 'mitigated' || resolvedIds.has(r.id))
      .map(r => {
        const uid = assignedUsers[r.id];
        const u = users.find(u => u.id === uid);
        return toRiskGridRow(r, u ? `${u.firstName} ${u.lastName}` : '');
      });
    const tagRows = projectRiskTags
      .filter(t => RESOLVED_STATUSES.has(t.status) || resolvedIds.has(t.id))
      .map(t => {
        const u = users.find(u => u.id === t.riskOwner);
        return toRiskGridRowFromTag(t, u ? `${u.firstName} ${u.lastName}` : '');
      });
    const manualRows = projectManualItems
      .filter(m => RESOLVED_STATUSES.has(m.status) || resolvedIds.has(m.id))
      .map(m => {
        const u = users.find(u => u.id === m.riskOwner);
        return toRiskGridRowFromManualItem(m, u ? `${u.firstName} ${u.lastName}` : '');
      });
    return [...legacyRows, ...tagRows, ...manualRows];
  }, [allProjectRisks, projectRiskTags, projectManualItems, resolvedIds, assignedUsers]);

  // ── Project-scope KPI scorecard ───────────────────────────────────────────
  // (computed inside ProjectRiskScorecard sub-component)

  if (!config) return null;

  const breadcrumbs = scope === 'portfolio'
    ? [{ label: 'Portfolio', href: '/portfolio' }]
    : [{ label: 'Portfolio', href: '/portfolio' }, { label: singleProject?.name ?? 'Project', href: projectId ? `/project/${projectId}/overview` : undefined }];

  const tabs = scope === 'portfolio' ? PORTFOLIO_TABS : PROJECT_TABS;
  const currentTab = activeTab as any;

  return (
    <>
      <ToolPageLayout
        title="Risk Register"
        breadcrumbs={breadcrumbs}
        actions={scope === 'project' && projectId ? (
          <Button
            variant="primary"
            className="b_primary"
            icon={<Plus />}
            onClick={() => setCreateRiskOpen(true)}
          >
            Create Risk Record
          </Button>
        ) : undefined}
        tabs={
          <Tabs>
            {tabs.map(tab => (
              <Tabs.Tab
                key={tab}
                role="button"
                selected={currentTab === tab}
                onPress={() => setActiveTab(tab as any)}
              >
                {tab}
              </Tabs.Tab>
            ))}
          </Tabs>
        }
      >
        {/* ── PORTFOLIO: OVERVIEW TAB ── */}
        {scope === 'portfolio' && currentTab === 'Overview' && (
          <>
            <SummaryRow>
              {(['red', 'yellow', 'green'] as HealthScore[]).map(score => (
                <SummaryCard key={score} $score={score}>
                  <CountLabel $score={score}>{counts[score]}</CountLabel>
                  <Typography intent="body" style={{ color: score === 'red' ? 'var(--color-pill-text-red)' : score === 'yellow' ? 'var(--color-pill-text-yellow)' : 'var(--color-pill-text-green)', fontWeight: 600 }}>
                    {score === 'red' ? 'Critical' : score === 'yellow' ? 'At Risk' : 'Healthy'}
                  </Typography>
                  <Typography intent="small" style={{ color: score === 'red' ? 'var(--color-pill-text-red)' : score === 'yellow' ? 'var(--color-pill-text-yellow)' : 'var(--color-pill-text-green)', opacity: 0.8 }}>
                    project{counts[score] !== 1 ? 's' : ''}
                  </Typography>
                </SummaryCard>
              ))}
            </SummaryRow>
            <CardsGrid>
              <HealthSummaryCard scope="portfolio" />
              <CostHealthCard scope="portfolio" />
              <ScheduleHealthCard scope="portfolio" />
              <DeliveryRiskCard scope="portfolio" />
              <RiskRegisterCard scope="portfolio" />
            </CardsGrid>
          </>
        )}

        {/* ── PORTFOLIO: TABLE TAB ── */}
        {scope === 'portfolio' && currentTab === 'Table' && (
          <HealthTable>
            <TableHead>
              <HeaderCell intent="small">Project</HeaderCell>
              <HeaderCell intent="small">Health</HeaderCell>
              <HeaderCell intent="small">Cost</HeaderCell>
              <HeaderCell intent="small">Schedule</HeaderCell>
              <HeaderCell intent="small">Delivery</HeaderCell>
              <HeaderCell intent="small">Risk</HeaderCell>
              <HeaderCell intent="small">Trend</HeaderCell>
            </TableHead>
            {activeResults
              .sort((a, b) => {
                const order = { red: 0, yellow: 1, green: 2 };
                return order[a.result.compositeScore] - order[b.result.compositeScore];
              })
              .map(({ project, result }) => {
                const catScore = (cat: KPICategory): HealthScore => {
                  const catKPIs = result.kpis.filter(k => k.category === cat);
                  if (catKPIs.some(k => k.status === 'red'))    return 'red';
                  if (catKPIs.some(k => k.status === 'yellow')) return 'yellow';
                  return 'green';
                };
                return (
                  <TableRow key={project.id} onClick={() => setTearsheet({ project, result })}>
                    <div>
                      <Typography intent="small" style={{ color: 'var(--color-text-primary)', fontWeight: 500, display: 'block' }}>
                        {project.name.length > 40 ? project.name.slice(0, 40) + '…' : project.name}
                      </Typography>
                      <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                        {project.region} · {project.stage.replace(/_/g, ' ')}
                      </Typography>
                    </div>
                    <HealthScoreBadge score={result.compositeScore} forecastScore={result.forecastScore} />
                    <Pill color={catScore('cost') === 'red' ? 'red' : catScore('cost') === 'yellow' ? 'yellow' : 'green'}>{catScore('cost') === 'red' ? 'Crit.' : catScore('cost') === 'yellow' ? 'Risk' : 'Good'}</Pill>
                    <Pill color={catScore('schedule') === 'red' ? 'red' : catScore('schedule') === 'yellow' ? 'yellow' : 'green'}>{catScore('schedule') === 'red' ? 'Crit.' : catScore('schedule') === 'yellow' ? 'Risk' : 'Good'}</Pill>
                    <Pill color={catScore('delivery') === 'red' ? 'red' : catScore('delivery') === 'yellow' ? 'yellow' : 'green'}>{catScore('delivery') === 'red' ? 'Crit.' : catScore('delivery') === 'yellow' ? 'Risk' : 'Good'}</Pill>
                    <Pill color={catScore('risk') === 'red' ? 'red' : catScore('risk') === 'yellow' ? 'yellow' : 'green'}>{catScore('risk') === 'red' ? 'Crit.' : catScore('risk') === 'yellow' ? 'Risk' : 'Good'}</Pill>
                    <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
                      {result.trend === 'degrading' ? '↓ Degrading' : result.trend === 'improving' ? '↑ Improving' : '— Stable'}
                    </Typography>
                  </TableRow>
                );
              })}
          </HealthTable>
        )}

        {/* ── PORTFOLIO: CARDS TAB ── */}
        {scope === 'portfolio' && currentTab === 'Cards' && (
          <CardsGrid>
            <HealthSummaryCard scope="portfolio" />
            <CostHealthCard scope="portfolio" />
            <ScheduleHealthCard scope="portfolio" />
            <DeliveryRiskCard scope="portfolio" />
            <RiskRegisterCard scope="portfolio" />
          </CardsGrid>
        )}

        {/* ── PROJECT: OVERVIEW TAB ── */}
        {scope === 'project' && currentTab === 'Overview' && projectId && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Risk summary cards */}
            <CardsGrid>
              <RiskCategoryDonutCard scope="project" projectId={projectId} />
              <RiskByTypeBarCard scope="project" projectId={projectId} />
              <RiskTrendCard risks={allProjectRisks} resolvedIds={resolvedIds} />
            </CardsGrid>

            {/* Active risk records grid */}
            <div style={{ padding: '0 20px 20px' }}>
              <RiskGrid
                rows={activeRiskRows}
                gridId="active-risk-records"
                title="Active Risks"
                localStorageKey="owner-prototype-risk-records-active-grid"
                searchPlaceholder="Search active risks"
                emptyLabel="No active risk records for this project."
                onOpenRisk={setOpenRiskId}
              />
            </div>
          </div>
        )}

        {/* ── PROJECT: RESOLVED TAB ── */}
        {scope === 'project' && currentTab === 'Resolved' && (
          <div style={{ padding: 20 }}>
            <RiskGrid
              rows={resolvedRiskRows}
              gridId="resolved-risk-records"
              title="Resolved Risk Records"
              localStorageKey="owner-prototype-risk-records-resolved-grid"
              searchPlaceholder="Search resolved risks"
              emptyLabel="No resolved risk records for this project."
              onOpenRisk={setOpenRiskId}
            />
          </div>
        )}

      </ToolPageLayout>

      {tearsheet && (
        <HealthDetailTearsheet
          open={!!tearsheet}
          onClose={() => setTearsheet(null)}
          result={tearsheet.result}
          projectName={tearsheet.project.name}
          projectId={tearsheet.project.id}
        />
      )}

      {scope === 'project' && projectId && (
        <CreateRiskRecordTearsheet
          open={createRiskOpen}
          projectId={projectId}
          onClose={() => setCreateRiskOpen(false)}
          onSave={(risk) => {
            setExtraRisks(prev => [...prev, risk]);
            setCreateRiskOpen(false);
          }}
        />
      )}

      {/* ── Source-item tearsheets dispatched from Active Risks grid ── */}
      {openRiskId && (() => {
        // Find the row in active or resolved rows to get sourceType / sourceId
        const allRows = [...activeRiskRows, ...resolvedRiskRows];
        const row = allRows.find(r => r.id === openRiskId);
        if (!row) return null;

        const close = () => setOpenRiskId(null);

        if (row.sourceType === 'rfi') {
          const rfi = rfiMap[row.sourceId];
          if (!rfi) return null;
          const proj = allProjects.find(p => p.id === rfi.projectId);
          return <RfiDetailTearsheet key={openRiskId} rfi={rfi} projectName={proj?.name ?? ''} open onClose={close} />;
        }
        if (row.sourceType === 'change_event') {
          const ce = ceMap[row.sourceId];
          if (!ce) return null;
          return <ChangeEventDetailTearsheet key={openRiskId} item={ce} open onClose={close} />;
        }
        if (row.sourceType === 'submittal') {
          const sub = subMap[row.sourceId];
          if (!sub) return null;
          return <SubmittalDetailTearsheet key={openRiskId} item={sub} open onClose={close} />;
        }
        if (row.sourceType === 'punch_list') {
          const punch = punchMap[row.sourceId];
          if (!punch) return null;
          return <PunchListDetailTearsheet key={openRiskId} item={punch} open onClose={close} />;
        }
        if (row.sourceType === 'correspondence') {
          const corr = corrMap[row.sourceId];
          if (!corr) return null;
          return <CorrespondenceDetailTearsheet key={openRiskId} item={corr} open onClose={close} />;
        }
        return null;
      })()}
    </>
  );
}
