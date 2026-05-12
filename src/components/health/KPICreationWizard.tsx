/**
 * KPI CREATION WIZARD
 * Single-page tearsheet for creating custom KPI cards.
 * Risk Type selection auto-populates data sources; "Custom" allows manual selection.
 * Filters and thresholds are conditional on data source / calc type.
 */

import React, { useEffect, useState } from 'react';
import { Banner, Button, Card, H2, Pill, Select, Switch, Tearsheet, Typography } from '@procore/core-react';
import styled, { createGlobalStyle } from 'styled-components';
import type { CalcType, CustomKPICard, VisualizationMode } from '@/types/health';
import { useData } from '@/context/DataContext';

// ─── Tearsheet width ──────────────────────────────────────────────────────────

const KPITearsheetWidth = createGlobalStyle`
  [class*="StyledTearsheetBody"]:has(> .kpi-creation-wizard-root) {
    flex: 0 0 auto !important;
    width: 60vw !important;
    max-width: 900px !important;
  }
`;

// ─── Styled ───────────────────────────────────────────────────────────────────

const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: var(--color-surface-secondary);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionCard = styled(Card)`
  padding: 24px;
  background: var(--color-surface-primary);
`;

const SectionTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
`;

const FieldLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 6px;
`;

const FieldHint = styled.span`
  display: block;
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
`;

const FormField = styled.div`
  margin-bottom: 16px;
  &:last-child { margin-bottom: 0; }
`;

const TextInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border-default);
  border-radius: 4px;
  font-size: 14px;
  color: var(--color-text-primary);
  background: var(--color-surface-primary);
  box-sizing: border-box;
  &:focus { outline: 2px solid var(--color-border-focus); }
`;

const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
`;

const OptionCard = styled.button<{ $selected: boolean; $locked?: boolean; $disabled?: boolean }>`
  padding: 10px 12px;
  border-radius: 6px;
  border: 2px solid ${({ $selected, $disabled }) => $disabled ? 'var(--color-border-separator)' : $selected ? 'var(--color-action-primary)' : 'var(--color-border-default)'};
  background: ${({ $selected, $locked, $disabled }) =>
    $disabled ? 'var(--color-surface-secondary)' :
    $locked ? 'var(--color-surface-secondary)' :
    $selected ? 'var(--color-surface-hover)' : 'var(--color-surface-primary)'};
  text-align: left;
  cursor: ${({ $locked, $disabled }) => ($locked || $disabled) ? 'default' : 'pointer'};
  opacity: ${({ $locked, $selected, $disabled }) => $disabled ? 0.4 : ($locked && !$selected ? 0.45 : 1)};
  transition: border-color 0.12s;
  &:hover:not(:disabled) { border-color: ${({ $locked, $disabled }) => ($locked || $disabled) ? 'var(--color-border-separator)' : 'var(--color-border-strong)'}; }
`;

const ThresholdRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: var(--color-surface-secondary);
  border-radius: 6px;
  border: 1px solid var(--color-border-separator);
  margin-bottom: 10px;
`;

const ThresholdLabel = styled.div`
  flex: 1;
`;

const ThresholdInput = styled.input`
  width: 72px;
  padding: 6px 10px;
  border: 1px solid var(--color-border-default);
  border-radius: 4px;
  font-size: 14px;
  color: var(--color-text-primary);
  background: var(--color-surface-primary);
  text-align: center;
  &:focus { outline: 2px solid var(--color-border-focus); }
`;

const FooterBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid var(--color-border-separator);
  flex-shrink: 0;
  background: var(--color-surface-primary);
`;

const LockedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-left: 8px;
`;

// ─── Constants ────────────────────────────────────────────────────────────────

const DATA_SOURCES: { key: string; label: string; description: string }[] = [
  { key: 'budget',        label: 'Budget',        description: 'Cost, variance, contingency' },
  { key: 'schedule',      label: 'Schedule',      description: 'Dates, float, baseline' },
  { key: 'rfis',          label: 'RFIs',          description: 'Open, overdue, response time' },
  { key: 'submittals',    label: 'Submittals',    description: 'Pending, late, approval rate' },
  { key: 'change_events', label: 'Change Events', description: 'Pending, approved, exposure' },
  { key: 'risk_records',  label: 'Risk Records',  description: 'Open risks, probability, impact' },
  { key: 'punch_list',    label: 'Punch List',    description: 'Open, overdue items' },
  { key: 'observations',  label: 'Observations',  description: 'Safety, quality findings' },
];

const CALC_TYPES: { key: CalcType; label: string; description: string }[] = [
  { key: 'Count',    label: 'Count',    description: 'Total number of records' },
  { key: 'Sum',      label: 'Sum',      description: 'Total sum of a numeric field' },
  { key: 'Average',  label: 'Average',  description: 'Mean value across records' },
  { key: 'Ratio',    label: 'Ratio',    description: 'Percentage or ratio between two values' },
  { key: 'Variance', label: 'Variance', description: 'Delta from a baseline or budget' },
  { key: 'Trend',    label: 'Trend',    description: 'Direction of change over time' },
];

// Status options keyed by data source
const SOURCE_STATUS_OPTIONS: Record<string, { value: string; label: string }[]> = {
  rfis:          [{ value: 'all', label: 'All' }, { value: 'open', label: 'Open' }, { value: 'closed', label: 'Closed' }, { value: 'overdue', label: 'Overdue' }],
  submittals:    [{ value: 'all', label: 'All' }, { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }, { value: 'overdue', label: 'Overdue' }],
  change_events: [{ value: 'all', label: 'All' }, { value: 'open', label: 'Open' }, { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }],
  punch_list:    [{ value: 'all', label: 'All' }, { value: 'open', label: 'Open' }, { value: 'closed', label: 'Closed' }, { value: 'overdue', label: 'Overdue' }],
  observations:  [{ value: 'all', label: 'All' }, { value: 'open', label: 'Open' }, { value: 'closed', label: 'Closed' }, { value: 'in_progress', label: 'In Progress' }],
  risk_records:  [{ value: 'all', label: 'All' }, { value: 'open', label: 'Open' }, { value: 'mitigated', label: 'Mitigated' }, { value: 'accepted', label: 'Accepted' }, { value: 'closed', label: 'Closed' }],
};

// Threshold unit hint keyed by calc type
const THRESHOLD_UNIT: Record<CalcType, string> = {
  Count:    'count (e.g. 5 items)',
  Sum:      'dollar amount (e.g. 100000)',
  Average:  'average value (e.g. 3.5)',
  Ratio:    'percentage (e.g. 25 for 25%)',
  Variance: 'variance % (e.g. 10 for 10%)',
  Trend:    'periods of decline (e.g. 3)',
};

const DATE_RANGE_OPTIONS = [
  { value: 'all',            label: 'All time' },
  { value: 'last_7',         label: 'Last 7 days' },
  { value: 'last_30',        label: 'Last 30 days' },
  { value: 'last_90',        label: 'Last 90 days' },
  { value: 'current_period', label: 'Current period' },
];

// Normalize riskType sourceData keys → DATA_SOURCES keys
const SOURCE_DATA_MAP: Record<string, string> = {
  budget:       'budget',
  schedule:     'schedule',
  rfis:         'rfis',
  submittals:   'submittals',
  change_events:'change_events',
  risk_records: 'risk_records',
  punch_list:   'punch_list',
  observations: 'observations',
  inspections:  'observations', // map inspections → observations for display
  action_plans: 'risk_records', // map action_plans → risk_records for display
};

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  riskTypeId: string; // '' = custom
  dataSources: string[];
  calcType: CalcType | '';
  filterStatus: string;
  filterDateRange: string;
  thresholdYellow: number;
  thresholdRed: number;
  active: boolean;
}

const INITIAL: FormState = {
  name: '',
  riskTypeId: '',
  dataSources: [],
  calcType: '',
  filterStatus: 'all',
  filterDateRange: 'last_30',
  thresholdYellow: 5,
  thresholdRed: 10,
  active: true,
};

// ─── Component ────────────────────────────────────────────────────────────────

interface KPICreationWizardProps {
  open: boolean;
  onClose: () => void;
  onSaved?: (kpi: CustomKPICard) => void;
}

export default function KPICreationWizard({ open, onClose, onSaved }: KPICreationWizardProps) {
  const { data, setData } = useData();
  const [form, setForm] = useState<FormState>(INITIAL);

  const riskTypes = data.account?.riskTypes ?? [];
  const noRiskTypeSelected = form.riskTypeId === '';
  const isCustom = form.riskTypeId === 'custom';
  // Sources are locked (read-only, pre-populated) when a specific risk type is chosen
  const lockedSources = !noRiskTypeSelected && !isCustom;
  // Sources are disabled (unselectable) until a risk type is chosen
  const sourcesDisabled = noRiskTypeSelected;

  // When risk type changes, auto-populate data sources
  useEffect(() => {
    if (form.riskTypeId === '') return; // no selection yet — leave sources empty
    if (form.riskTypeId === 'custom') {
      setForm(f => ({ ...f, dataSources: [] }));
      return;
    }
    const rt = riskTypes.find(r => r.id === form.riskTypeId);
    if (!rt) return;
    const mapped = [...new Set(rt.sourceData.map(s => SOURCE_DATA_MAP[s] ?? s).filter(s => DATA_SOURCES.some(d => d.key === s)))];
    setForm(f => ({ ...f, dataSources: mapped, filterStatus: 'all' }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.riskTypeId]);

  // Reset status filter when data sources change
  useEffect(() => {
    setForm(f => ({ ...f, filterStatus: 'all' }));
  }, [form.dataSources.join(',')]);

  const primarySource = form.dataSources[0] ?? '';
  const statusOptions = SOURCE_STATUS_OPTIONS[primarySource] ?? [{ value: 'all', label: 'All' }];
  const showStatusFilter = primarySource && SOURCE_STATUS_OPTIONS[primarySource];
  const thresholdUnit = form.calcType ? THRESHOLD_UNIT[form.calcType as CalcType] : null;

  const canSave = !!form.name.trim() && form.dataSources.length > 0 && !!form.calcType && form.thresholdYellow > 0 && form.thresholdRed > 0;

  function toggleDataSource(key: string) {
    if (sourcesDisabled || lockedSources) return;
    setForm(f => {
      const next = f.dataSources.includes(key)
        ? f.dataSources.filter(s => s !== key)
        : [...f.dataSources, key];
      // If this is a risk-type-backed selection and the user diverges, switch to custom
      const wasRiskTypeBacked = f.riskTypeId !== '' && f.riskTypeId !== 'custom';
      if (wasRiskTypeBacked) {
        // adding a source not in the current set triggers auto-switch to custom
        const isAdding = !f.dataSources.includes(key);
        if (isAdding) return { ...f, dataSources: next, riskTypeId: 'custom' };
      }
      return { ...f, dataSources: next };
    });
  }

  function handleSave() {
    if (!data.account || !canSave) return;
    const newKPI: CustomKPICard = {
      id: `custom-kpi-${Date.now()}`,
      name: form.name.trim(),
      dataSource: form.dataSources[0] ?? '',
      calcType: form.calcType as CalcType,
      filters: {
        ...(form.filterStatus !== 'all' && { status: form.filterStatus }),
        ...(form.filterDateRange !== 'all' && { dateRange: form.filterDateRange }),
      },
      thresholds: { yellow: form.thresholdYellow, red: form.thresholdRed },
      visualization: [],
      placeholderValue: '—',
      placeholderStatus: 'green',
    };
    const existing = data.account.healthConfig.customKPIs ?? [];
    setData({ ...data, account: { ...data.account, healthConfig: { ...data.account.healthConfig, customKPIs: [...existing, newKPI] } } });
    onSaved?.(newKPI);
    setForm(INITIAL);
    onClose();
  }

  function handleClose() {
    setForm(INITIAL);
    onClose();
  }

  const selectedRiskType = riskTypes.find(r => r.id === form.riskTypeId);

  return (
    <>
      <KPITearsheetWidth />
      <Tearsheet open={open} onClose={handleClose} aria-label="Create Custom KPI" placement="right">
        <div className="kpi-creation-wizard-root" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

          {/* Header */}
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-border-separator)', flexShrink: 0, background: 'var(--color-surface-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Typography intent="h2" style={{ fontWeight: 700, color: 'var(--color-text-primary)', display: 'block' }}>
                Create Custom KPI
              </Typography>
              <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block', marginTop: 2 }}>
                Define a new KPI to track and score project health.
              </Typography>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="tertiary" className="b_tertiary" onClick={handleClose}>Cancel</Button>
              <Button variant="primary" className="b_primary" onClick={handleSave} disabled={!canSave}>Create KPI</Button>
            </div>
          </div>

          {/* Body */}
          <Body>

            {/* ── Identity ── */}
            <SectionCard>
              <SectionTitle>
                <Typography intent="h3" style={{ color: 'var(--color-text-primary)', display: 'block' }}>Identity</Typography>
              </SectionTitle>
              <FormField>
                <FieldLabel htmlFor="kpi-name">KPI Name *</FieldLabel>
                <TextInput
                  id="kpi-name"
                  type="text"
                  value={form.name}
                  placeholder="e.g. Overdue Change Events"
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  autoFocus
                />
              </FormField>
              <FormField>
                <FieldLabel>Risk Type</FieldLabel>
                <FieldHint>Selecting a Risk Type auto-populates its data sources. Choose Custom to configure manually.</FieldHint>
                <Select
                  block
                  label={form.riskTypeId === 'custom' ? 'Custom' : (selectedRiskType?.label ?? 'Select a Risk Type…')}
                  onSelect={({ item }) => {
                    const id = (item as { id: string }).id;
                    setForm(f => ({ ...f, riskTypeId: id, calcType: '' }));
                  }}
                >
                  <Select.Option value={{ id: 'custom' }} selected={form.riskTypeId === 'custom'}>
                    Custom
                  </Select.Option>
                  {riskTypes.filter(rt => !rt.isHidden).map(rt => (
                    <Select.Option key={rt.id} value={{ id: rt.id }} selected={form.riskTypeId === rt.id}>
                      {rt.label}
                    </Select.Option>
                  ))}
                </Select>
              </FormField>
              <FormField style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 }}>
                <div>
                  <Typography intent="body" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Active</Typography>
                  <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>Include in composite health scoring.</Typography>
                </div>
                <Switch checked={form.active} onChange={() => setForm(f => ({ ...f, active: !f.active }))} aria-label="KPI active" />
              </FormField>
            </SectionCard>

            {/* ── Data Sources ── */}
            <SectionCard style={{ opacity: sourcesDisabled ? 0.6 : 1, transition: 'opacity 0.15s' }}>
              <SectionTitle>
                <Typography intent="h3" style={{ color: 'var(--color-text-primary)', display: 'block' }}>
                  Data Sources
                  {lockedSources && <LockedBadge>— set by Risk Type</LockedBadge>}
                </Typography>
                <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                  {sourcesDisabled
                    ? 'Select a Risk Type above to configure data sources.'
                    : lockedSources
                      ? `Pre-selected by the ${selectedRiskType?.label} risk type. Select an additional source to switch to Custom.`
                      : 'Choose one or more tools whose data this KPI will measure.'}
                </Typography>
              </SectionTitle>
              <OptionGrid>
                {DATA_SOURCES.map(src => {
                  const selected = form.dataSources.includes(src.key);
                  return (
                    <OptionCard
                      key={src.key}
                      $selected={selected}
                      $locked={lockedSources}
                      $disabled={sourcesDisabled}
                      onClick={() => toggleDataSource(src.key)}
                      aria-pressed={selected}
                      disabled={sourcesDisabled || lockedSources}
                    >
                      <Typography intent="body" style={{ fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: 2 }}>
                        {src.label}
                      </Typography>
                      <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
                        {src.description}
                      </Typography>
                    </OptionCard>
                  );
                })}
              </OptionGrid>
            </SectionCard>

            {/* ── Calculation ── */}
            <SectionCard>
              <SectionTitle>
                <Typography intent="h3" style={{ color: 'var(--color-text-primary)', display: 'block' }}>Calculation</Typography>
                <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                  How should the KPI value be derived{primarySource ? ` from ${DATA_SOURCES.find(s => s.key === primarySource)?.label ?? primarySource}` : ''}?
                </Typography>
              </SectionTitle>
              <OptionGrid>
                {CALC_TYPES.map(ct => (
                  <OptionCard
                    key={ct.key}
                    $selected={form.calcType === ct.key}
                    onClick={() => setForm(f => ({ ...f, calcType: ct.key }))}
                    aria-pressed={form.calcType === ct.key}
                  >
                    <Typography intent="body" style={{ fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: 2 }}>
                      {ct.label}
                    </Typography>
                    <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
                      {ct.description}
                    </Typography>
                  </OptionCard>
                ))}
              </OptionGrid>
            </SectionCard>

            {/* ── Filters — only when data sources are selected ── */}
            {form.dataSources.length > 0 && (
              <SectionCard>
                <SectionTitle>
                  <Typography intent="h3" style={{ color: 'var(--color-text-primary)', display: 'block' }}>Filters</Typography>
                  <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                    Narrow which records count toward this KPI. All filters default to no restriction.
                  </Typography>
                </SectionTitle>
                {showStatusFilter && (
                  <FormField>
                    <FieldLabel>Status</FieldLabel>
                    <Select
                      block
                      label={statusOptions.find(o => o.value === form.filterStatus)?.label ?? 'All'}
                      onSelect={({ item }) => setForm(f => ({ ...f, filterStatus: (item as { value: string }).value }))}
                    >
                      {statusOptions.map(opt => (
                        <Select.Option key={opt.value} value={opt} selected={form.filterStatus === opt.value}>
                          {opt.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </FormField>
                )}
                <FormField>
                  <FieldLabel>Date Range</FieldLabel>
                  <Select
                    block
                    label={DATE_RANGE_OPTIONS.find(o => o.value === form.filterDateRange)?.label ?? 'Last 30 days'}
                    onSelect={({ item }) => setForm(f => ({ ...f, filterDateRange: (item as { value: string }).value }))}
                  >
                    {DATE_RANGE_OPTIONS.map(opt => (
                      <Select.Option key={opt.value} value={opt} selected={form.filterDateRange === opt.value}>
                        {opt.label}
                      </Select.Option>
                    ))}
                  </Select>
                </FormField>
              </SectionCard>
            )}

            {/* ── Thresholds — only when calc type is selected ── */}
            {form.calcType && (
              <SectionCard>
                <SectionTitle>
                  <Typography intent="h3" style={{ color: 'var(--color-text-primary)', display: 'block' }}>Thresholds</Typography>
                  <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                    Set when this KPI turns At Risk or Critical.
                    {thresholdUnit && <> Enter as {thresholdUnit}.</>}
                  </Typography>
                </SectionTitle>
                <ThresholdRow>
                  <ThresholdLabel>
                    <Typography intent="body" style={{ fontWeight: 600, color: 'var(--color-text-primary)', display: 'block' }}>At Risk at</Typography>
                    <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>KPI turns At Risk</Typography>
                  </ThresholdLabel>
                  <ThresholdInput
                    type="number"
                    min={0}
                    value={form.thresholdYellow}
                    onChange={e => setForm(f => ({ ...f, thresholdYellow: parseFloat(e.target.value) || 0 }))}
                    aria-label="At Risk threshold"
                  />
                  <Pill color="yellow">At Risk</Pill>
                </ThresholdRow>
                <ThresholdRow>
                  <ThresholdLabel>
                    <Typography intent="body" style={{ fontWeight: 600, color: 'var(--color-text-primary)', display: 'block' }}>Critical at</Typography>
                    <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>KPI turns Critical</Typography>
                  </ThresholdLabel>
                  <ThresholdInput
                    type="number"
                    min={0}
                    value={form.thresholdRed}
                    onChange={e => setForm(f => ({ ...f, thresholdRed: parseFloat(e.target.value) || 0 }))}
                    aria-label="Critical threshold"
                  />
                  <Pill color="red">Critical</Pill>
                </ThresholdRow>
              </SectionCard>
            )}

          </Body>

        </div>
      </Tearsheet>
    </>
  );
}
