/**
 * KPI CREATION WIZARD
 * 6-step tearsheet wizard for creating custom KPI cards.
 * Steps: Data Source → Calculation → Filters → Thresholds → Visualization → Name + Save
 * Saves a placeholder CustomKPICard to data.account.healthConfig.customKPIs.
 */

import React, { useState } from 'react';
import { Banner, Button, Pill, Select, Tearsheet, Typography } from '@procore/core-react';
import { Check } from '@procore/core-icons';
import styled, { createGlobalStyle } from 'styled-components';
import type { CalcType, CustomKPICard, KPIThreshold, VisualizationMode } from '@/types/health';
import { useData } from '@/context/DataContext';

// ─── Tearsheet width ──────────────────────────────────────────────────────────

const KPITearsheetWidth = createGlobalStyle`
  [class*="StyledTearsheetBody"]:has(> .kpi-creation-wizard-root) {
    flex: 0 0 60vw !important;
  }
`;

// ─── Styled ───────────────────────────────────────────────────────────────────

const WizardRoot = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const WizardHeader = styled.div`
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--color-border-separator);
  flex-shrink: 0;
`;

// ── Stepper — matches ConnectStepper pattern from ProjectEditTearsheet ─────────

const StepperRow = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border-separator);
  flex-shrink: 0;
`;

const StepItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const StepCircle = styled.div<{ $state: 'done' | 'active' | 'pending' }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  background: ${({ $state }) =>
    $state === 'done' ? 'var(--color-action-primary)' :
    $state === 'active' ? 'var(--color-surface-primary)' :
    'var(--color-surface-secondary)'};
  color: ${({ $state }) =>
    $state === 'done' ? '#fff' :
    $state === 'active' ? 'var(--color-action-primary)' :
    'var(--color-text-disabled)'};
  border: 2px solid ${({ $state }) =>
    $state === 'pending' ? 'var(--color-border-default)' : 'var(--color-action-primary)'};
`;

const StepLabel = styled.div<{ $active: boolean }>`
  font-size: 10px;
  font-weight: ${({ $active }) => ($active ? 700 : 400)};
  color: ${({ $active }) => ($active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)')};
  white-space: nowrap;
  text-align: center;
`;

const StepConnector = styled.div<{ $done: boolean }>`
  flex: 1;
  height: 2px;
  background: ${({ $done }) => $done ? 'var(--color-action-primary)' : 'var(--color-border-default)'};
  margin-top: 14px; /* vertically align with center of 28px circle */
`;

// ── Rest of styled components ─────────────────────────────────────────────────

const WizardBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px;
`;

const OptionCard = styled.button<{ $selected: boolean }>`
  padding: 12px;
  border-radius: 6px;
  border: 2px solid ${({ $selected }) => $selected ? 'var(--color-action-primary)' : 'var(--color-border-default)'};
  background: ${({ $selected }) => $selected ? 'var(--color-surface-hover)' : 'var(--color-surface-primary)'};
  text-align: left;
  cursor: pointer;
  transition: border-color 0.12s;
  &:hover { border-color: var(--color-border-strong); }
`;

const FormField = styled.div`
  margin-bottom: 16px;
`;

const FieldLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 6px;
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

const ThresholdRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: var(--color-surface-secondary);
  border-radius: 6px;
  border: 1px solid var(--color-border-separator);
  margin-bottom: 12px;
`;

const ThresholdNumberInput = styled.input`
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

const ThresholdLabel = styled.div`
  flex: 1;
`;

const PreviewCard = styled.div`
  padding: 16px;
  border: 2px dashed var(--color-border-default);
  border-radius: 8px;
  background: var(--color-surface-secondary);
  text-align: center;
`;

const FooterBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid var(--color-border-separator);
  flex-shrink: 0;
`;

// ─── Constants ────────────────────────────────────────────────────────────────

const DATA_SOURCES = [
  { key: 'budget', label: 'Budget', description: 'Cost, variance, contingency' },
  { key: 'schedule', label: 'Schedule', description: 'Dates, float, baseline' },
  { key: 'rfis', label: 'RFIs', description: 'Open, overdue, response time' },
  { key: 'submittals', label: 'Submittals', description: 'Pending, late, approval rate' },
  { key: 'change_events', label: 'Change Events', description: 'Pending, approved, exposure' },
  { key: 'risk_records', label: 'Risk Records', description: 'Open risks, probability, impact' },
] as const;

const CALC_TYPES: { key: CalcType; label: string; description: string }[] = [
  { key: 'Count', label: 'Count', description: 'Total number of records' },
  { key: 'Sum', label: 'Sum', description: 'Total sum of a numeric field' },
  { key: 'Average', label: 'Average', description: 'Mean value across records' },
  { key: 'Ratio', label: 'Ratio', description: 'Percentage or ratio between two values' },
  { key: 'Variance', label: 'Variance', description: 'Delta from a baseline or budget' },
  { key: 'Trend', label: 'Trend', description: 'Direction of change over time' },
];

const VIZ_MODES: { key: VisualizationMode; label: string; description: string }[] = [
  { key: 'card', label: 'Card', description: 'Status chip with value + label' },
  { key: 'table-column', label: 'Table Column', description: 'Column in portfolio table view' },
  { key: 'sparkline', label: 'Sparkline', description: 'Trend line over last 6 periods' },
];

const STEP_LABELS = ['Data Source', 'Calculation', 'Filters', 'Thresholds', 'Visualization', 'Name & Save'];

// ── Filter select options ──────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'open', label: 'Open only' },
  { value: 'pending', label: 'Pending only' },
  { value: 'overdue', label: 'Overdue only' },
];

const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'All time' },
  { value: 'last_7', label: 'Last 7 days' },
  { value: 'last_30', label: 'Last 30 days' },
  { value: 'last_90', label: 'Last 90 days' },
  { value: 'current_period', label: 'Current period' },
];

const PROJECT_TYPE_OPTIONS = [
  { value: 'all', label: 'All project types' },
  { value: 'capital', label: 'Capital' },
  { value: 'renovation', label: 'Renovation' },
  { value: 'new_construction', label: 'New Construction' },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface KPICreationWizardProps {
  open: boolean;
  onClose: () => void;
  onSaved?: (kpi: CustomKPICard) => void;
}

interface WizardState {
  dataSource: string;
  calcType: CalcType | '';
  filterStatus: string;
  filterDateRange: string;
  filterProjectType: string;
  thresholdYellow: number;
  thresholdRed: number;
  visualization: VisualizationMode | '';
  name: string;
}

const INITIAL_STATE: WizardState = {
  dataSource: '',
  calcType: '',
  filterStatus: 'all',
  filterDateRange: 'last_30',
  filterProjectType: 'all',
  thresholdYellow: 5,
  thresholdRed: 10,
  visualization: '',
  name: '',
};

export default function KPICreationWizard({ open, onClose, onSaved }: KPICreationWizardProps) {
  const { data, setData } = useData();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<WizardState>(INITIAL_STATE);

  function canAdvance(): boolean {
    if (step === 1) return !!form.dataSource;
    if (step === 2) return !!form.calcType;
    if (step === 3) return true; // filters always optional
    if (step === 4) return form.thresholdYellow > 0 && form.thresholdRed > 0;
    if (step === 5) return !!form.visualization;
    if (step === 6) return !!form.name.trim();
    return false;
  }

  function handleSave() {
    if (!data.account) return;
    const filters: Record<string, string> = {};
    if (form.filterStatus !== 'all') filters.status = form.filterStatus;
    if (form.filterDateRange !== 'all') filters.dateRange = form.filterDateRange;
    if (form.filterProjectType !== 'all') filters.projectType = form.filterProjectType;

    const newKPI: CustomKPICard = {
      id: `custom-kpi-${Date.now()}`,
      name: form.name.trim(),
      dataSource: form.dataSource,
      calcType: form.calcType as CalcType,
      filters,
      thresholds: { yellow: form.thresholdYellow, red: form.thresholdRed },
      visualization: form.visualization as VisualizationMode,
      placeholderValue: '—',
      placeholderStatus: 'green',
    };

    const existing = data.account.healthConfig.customKPIs ?? [];
    setData({
      ...data,
      account: {
        ...data.account,
        healthConfig: {
          ...data.account.healthConfig,
          customKPIs: [...existing, newKPI],
        },
      },
    });

    onSaved?.(newKPI);
    setStep(1);
    setForm(INITIAL_STATE);
    onClose();
  }

  function handleClose() {
    setStep(1);
    setForm(INITIAL_STATE);
    onClose();
  }

  return (
    <>
      <KPITearsheetWidth />
      <Tearsheet open={open} onClose={handleClose} aria-label="Create KPI wizard" placement="right">
        <div className="kpi-creation-wizard-root" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

          {/* Header */}
          <WizardHeader>
            <Typography intent="h2" style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Create Custom KPI
            </Typography>
          </WizardHeader>

          {/* Step progress — matches ConnectStepper layout */}
          <StepperRow>
            {STEP_LABELS.map((label, i) => {
              const num = i + 1;
              const state: 'done' | 'active' | 'pending' = num < step ? 'done' : num === step ? 'active' : 'pending';
              return (
                <React.Fragment key={label}>
                  {i > 0 && <StepConnector $done={num <= step} />}
                  <StepItem>
                    <StepCircle $state={state}>
                      {state === 'done' ? <Check size="sm" /> : num}
                    </StepCircle>
                    <StepLabel $active={state === 'active'}>{label}</StepLabel>
                  </StepItem>
                </React.Fragment>
              );
            })}
          </StepperRow>

          {/* Body */}
          <WizardBody>
            {/* ── Step 1: Data Source ── */}
            {step === 1 && (
              <>
                <div>
                  <Typography intent="h3" style={{ color: 'var(--color-text-primary)', marginBottom: 4 }}>Select Data Source</Typography>
                  <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
                    Choose the tool data that this KPI will measure.
                  </Typography>
                </div>
                <OptionGrid>
                  {DATA_SOURCES.map(src => (
                    <OptionCard
                      key={src.key}
                      $selected={form.dataSource === src.key}
                      onClick={() => setForm(f => ({ ...f, dataSource: src.key }))}
                      aria-pressed={form.dataSource === src.key}
                    >
                      <Typography intent="body" style={{ fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: 2 }}>
                        {src.label}
                      </Typography>
                      <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
                        {src.description}
                      </Typography>
                    </OptionCard>
                  ))}
                </OptionGrid>
              </>
            )}

            {/* ── Step 2: Calculation Type ── */}
            {step === 2 && (
              <>
                <div>
                  <Typography intent="h3" style={{ color: 'var(--color-text-primary)', marginBottom: 4 }}>Calculation Type</Typography>
                  <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
                    How should the KPI value be derived from {DATA_SOURCES.find(s => s.key === form.dataSource)?.label ?? 'the selected'} data?
                  </Typography>
                </div>
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
              </>
            )}

            {/* ── Step 3: Filters ── */}
            {step === 3 && (
              <>
                <div>
                  <Typography intent="h3" style={{ color: 'var(--color-text-primary)', marginBottom: 4 }}>Filters</Typography>
                  <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
                    Optionally narrow the data scope. All filters default to no restriction.
                  </Typography>
                </div>
                <FormField>
                  <FieldLabel>Status</FieldLabel>
                  <Select
                    label={STATUS_OPTIONS.find(o => o.value === form.filterStatus)?.label ?? 'All statuses'}
                    onSelect={({ item }) => {
                      const opt = item as typeof STATUS_OPTIONS[0];
                      setForm(f => ({ ...f, filterStatus: opt.value }));
                    }}
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <Select.Option key={opt.value} value={opt} selected={form.filterStatus === opt.value}>
                        {opt.label}
                      </Select.Option>
                    ))}
                  </Select>
                </FormField>
                <FormField>
                  <FieldLabel>Date Range</FieldLabel>
                  <Select
                    label={DATE_RANGE_OPTIONS.find(o => o.value === form.filterDateRange)?.label ?? 'All time'}
                    onSelect={({ item }) => {
                      const opt = item as typeof DATE_RANGE_OPTIONS[0];
                      setForm(f => ({ ...f, filterDateRange: opt.value }));
                    }}
                  >
                    {DATE_RANGE_OPTIONS.map(opt => (
                      <Select.Option key={opt.value} value={opt} selected={form.filterDateRange === opt.value}>
                        {opt.label}
                      </Select.Option>
                    ))}
                  </Select>
                </FormField>
                <FormField>
                  <FieldLabel>Project Type</FieldLabel>
                  <Select
                    label={PROJECT_TYPE_OPTIONS.find(o => o.value === form.filterProjectType)?.label ?? 'All project types'}
                    onSelect={({ item }) => {
                      const opt = item as typeof PROJECT_TYPE_OPTIONS[0];
                      setForm(f => ({ ...f, filterProjectType: opt.value }));
                    }}
                  >
                    {PROJECT_TYPE_OPTIONS.map(opt => (
                      <Select.Option key={opt.value} value={opt} selected={form.filterProjectType === opt.value}>
                        {opt.label}
                      </Select.Option>
                    ))}
                  </Select>
                </FormField>
              </>
            )}

            {/* ── Step 4: Thresholds ── */}
            {step === 4 && (
              <>
                <div>
                  <Typography intent="h3" style={{ color: 'var(--color-text-primary)', marginBottom: 4 }}>Thresholds</Typography>
                  <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
                    Set the values at which this KPI turns yellow (at risk) or red (critical).
                  </Typography>
                </div>
                <Banner variant="info">
                  <Banner.Content>
                    <Banner.Body>
                      Higher values are treated as worse. Use the same unit as your selected calculation ({form.calcType || 'selected type'}).
                    </Banner.Body>
                  </Banner.Content>
                </Banner>
                <div>
                  <ThresholdRow>
                    <ThresholdLabel>
                      <Typography intent="body" style={{ fontWeight: 600, color: 'var(--color-text-primary)', display: 'block' }}>
                        Yellow at
                      </Typography>
                      <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                        KPI turns At Risk
                      </Typography>
                    </ThresholdLabel>
                    <ThresholdNumberInput
                      type="number"
                      min={0}
                      value={form.thresholdYellow}
                      onChange={e => setForm(f => ({ ...f, thresholdYellow: parseFloat(e.target.value) || 0 }))}
                      aria-label="Yellow threshold"
                    />
                    <Pill color="yellow">At Risk</Pill>
                  </ThresholdRow>
                  <ThresholdRow>
                    <ThresholdLabel>
                      <Typography intent="body" style={{ fontWeight: 600, color: 'var(--color-text-primary)', display: 'block' }}>
                        Red at
                      </Typography>
                      <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                        KPI turns Critical
                      </Typography>
                    </ThresholdLabel>
                    <ThresholdNumberInput
                      type="number"
                      min={0}
                      value={form.thresholdRed}
                      onChange={e => setForm(f => ({ ...f, thresholdRed: parseFloat(e.target.value) || 0 }))}
                      aria-label="Red threshold"
                    />
                    <Pill color="red">Critical</Pill>
                  </ThresholdRow>
                </div>
              </>
            )}

            {/* ── Step 5: Visualization ── */}
            {step === 5 && (
              <>
                <div>
                  <Typography intent="h3" style={{ color: 'var(--color-text-primary)', marginBottom: 4 }}>Visualization Mode</Typography>
                  <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
                    Choose how this KPI is displayed on hub cards and the portfolio table.
                  </Typography>
                </div>
                <OptionGrid>
                  {VIZ_MODES.map(viz => (
                    <OptionCard
                      key={viz.key}
                      $selected={form.visualization === viz.key}
                      onClick={() => setForm(f => ({ ...f, visualization: viz.key }))}
                      aria-pressed={form.visualization === viz.key}
                    >
                      <Typography intent="body" style={{ fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: 2 }}>
                        {viz.label}
                      </Typography>
                      <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
                        {viz.description}
                      </Typography>
                    </OptionCard>
                  ))}
                </OptionGrid>
                {form.visualization && (
                  <PreviewCard>
                    <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8 }}>Preview</Typography>
                    {form.visualization === 'card' && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--color-surface-primary)', borderRadius: 6, border: '1px solid var(--color-border-separator)' }}>
                        <Pill color="green">Good</Pill>
                        <Typography intent="body" style={{ fontWeight: 700 }}>—</Typography>
                        <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>{form.name || 'KPI Name'}</Typography>
                      </div>
                    )}
                    {form.visualization === 'table-column' && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: 'var(--color-surface-primary)', borderRadius: 4, border: '1px solid var(--color-border-separator)' }}>
                        <Typography intent="small" style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>{form.name || 'KPI'}</Typography>
                        <Pill color="green" style={{ fontSize: 11 }}>—</Pill>
                      </div>
                    )}
                    {form.visualization === 'sparkline' && (
                      <svg width={120} height={40} style={{ display: 'block', margin: '0 auto' }}>
                        <polyline points="0,30 20,25 40,28 60,18 80,20 100,15 120,10" fill="none" stroke="var(--color-action-primary)" strokeWidth={2} />
                      </svg>
                    )}
                  </PreviewCard>
                )}
              </>
            )}

            {/* ── Step 6: Name + Save ── */}
            {step === 6 && (
              <>
                <div>
                  <Typography intent="h3" style={{ color: 'var(--color-text-primary)', marginBottom: 4 }}>Name &amp; Save</Typography>
                  <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
                    Give your KPI a clear name. It will appear on hub cards and the portfolio table.
                  </Typography>
                </div>
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

                <Banner variant="info">
                  <Banner.Content>
                    <Banner.Title>Summary</Banner.Title>
                    <Banner.Body>
                      <strong>{form.name || '(unnamed)'}</strong> — {DATA_SOURCES.find(s => s.key === form.dataSource)?.label} · {form.calcType} · {form.visualization} view.
                      Yellow at {form.thresholdYellow}, Red at {form.thresholdRed}.
                    </Banner.Body>
                  </Banner.Content>
                </Banner>

                <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
                  This will create a placeholder KPI card visible in your Health hub. Data will populate once connected to a live source.
                </Typography>
              </>
            )}
          </WizardBody>

          {/* Footer */}
          <FooterBar>
            <div>
              {step > 1 && (
                <Button variant="secondary" className="b_secondary" onClick={() => setStep(s => s - 1)}>
                  Back
                </Button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
                Step {step} of {STEP_LABELS.length}
              </Typography>
              <Button variant="secondary" className="b_secondary" onClick={handleClose}>
                Cancel
              </Button>
              {step < STEP_LABELS.length ? (
                <Button
                  variant="primary"
                  className="b_primary"
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canAdvance()}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="primary"
                  className="b_primary"
                  onClick={handleSave}
                  disabled={!canAdvance()}
                >
                  Create KPI
                </Button>
              )}
            </div>
          </FooterBar>

        </div>
      </Tearsheet>
    </>
  );
}
