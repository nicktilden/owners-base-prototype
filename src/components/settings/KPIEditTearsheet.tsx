/**
 * KPI EDIT TEARSHEET
 * Slide-over for editing a single KPI's thresholds, weight, calc type, and active state.
 */

import { useState, useEffect } from 'react';
import { Box, Button, Card, H2, Page, Select, Switch, Tearsheet, Typography } from '@procore/core-react';
import styled, { createGlobalStyle } from 'styled-components';
import type { KPIKey, KPIThreshold } from '@/types/health';
import { KPI_LABELS } from '@/types/health';

// ─── Width override ───────────────────────────────────────────────────────────

const TearsheetWidth = createGlobalStyle`
  [class*="StyledTearsheetBody"]:has(> .kpi-edit-tearsheet-root) {
    flex: 0 0 auto !important;
    width: 60vw !important;
    max-width: 900px !important;
  }
`;

// ─── Styled ───────────────────────────────────────────────────────────────────

const SectionCard = styled(Card)`
  padding: 24px;
  background: var(--color-surface-primary);
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
  margin-bottom: 20px;
  &:last-child { margin-bottom: 0; }
`;

const ThresholdRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const NativeInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 7px 10px;
  border: 1px solid var(--color-border-default);
  border-radius: 4px;
  font-size: 14px;
  color: var(--color-text-primary);
  background: var(--color-surface-primary);
  &:focus { outline: 2px solid var(--color-border-focus); outline-offset: 0; }
`;

const SwitchRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

// ─── Constants ────────────────────────────────────────────────────────────────

const DATE_RANGE_OPTIONS: { value: string; label: string }[] = [
  { value: 'all_time',    label: 'All time' },
  { value: 'last_7',     label: 'Last 7 days' },
  { value: 'last_30',    label: 'Last 30 days' },
  { value: 'last_60',    label: 'Last 60 days' },
  { value: 'last_90',    label: 'Last 90 days' },
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
  { value: 'this_quarter', label: 'This quarter' },
  { value: 'last_quarter', label: 'Last quarter' },
  { value: 'this_year',  label: 'This year' },
  { value: 'last_year',  label: 'Last year' },
];

const CALC_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'Variance %',        label: 'Variance %' },
  { value: 'Remaining %',       label: 'Remaining %' },
  { value: 'Count',             label: 'Count' },
  { value: 'Days Behind',       label: 'Days Behind' },
  { value: 'On-Time %',         label: 'On-Time %' },
  { value: 'Count (High-Prob)', label: 'Count (High-Prob)' },
  { value: 'Overdue Count',     label: 'Overdue Count' },
  { value: 'Overdue Days',      label: 'Overdue Days' },
  { value: 'Average (1–5)',     label: 'Average (1–5)' },
  { value: 'Sum ($M)',          label: 'Sum ($M)' },
];

// ─── Form state ───────────────────────────────────────────────────────────────

interface KPIFormState {
  active: boolean;
  calcType: string;
  yellow: number;
  red: number;
  weight: number;
  dateRange: string;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface KPIEditValues {
  active: boolean;
  calcType: string;
  threshold: KPIThreshold;
  weight: number;
  dateRange: string;
}

interface KPIEditTearsheetProps {
  open: boolean;
  kpiKey: KPIKey | null;
  initial: KPIEditValues | null;
  onClose: () => void;
  onSave: (kpiKey: KPIKey, values: KPIEditValues) => void;
}

export default function KPIEditTearsheet({ open, kpiKey, initial, onClose, onSave }: KPIEditTearsheetProps) {
  const [form, setForm] = useState<KPIFormState>({ active: true, calcType: 'Count', yellow: 0, red: 0, weight: 0, dateRange: 'last_30' });

  useEffect(() => {
    if (open && initial) {
      setForm({
        active: initial.active,
        calcType: initial.calcType,
        yellow: initial.threshold.yellow,
        red: initial.threshold.red,
        weight: initial.weight,
        dateRange: initial.dateRange ?? 'last_30',
      });
    }
  }, [open, initial]);

  function handleSave() {
    if (!kpiKey) return;
    onSave(kpiKey, {
      active: form.active,
      calcType: form.calcType,
      threshold: { yellow: form.yellow, red: form.red },
      weight: form.weight,
      dateRange: form.dateRange,
    });
  }

  const kpiLabel = kpiKey ? KPI_LABELS[kpiKey] : '';
  const calcOption = CALC_TYPE_OPTIONS.find(o => o.value === form.calcType) ?? CALC_TYPE_OPTIONS[0];
  const dateRangeOption = DATE_RANGE_OPTIONS.find(o => o.value === form.dateRange) ?? DATE_RANGE_OPTIONS[2];

  return (
    <>
      <TearsheetWidth />
      <Tearsheet open={open} onClose={onClose} aria-label={`Edit KPI: ${kpiLabel}`} placement="right">
        <div
          className="kpi-edit-tearsheet-root"
          style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}
        >
          <Page style={{ height: '100%', background: 'var(--color-surface-primary)', color: 'var(--color-text-primary)' }}>
            <Page.Main style={{ height: '100%', overflow: 'hidden', background: 'var(--color-surface-primary)' }}>

              <Page.Header style={{ background: 'var(--color-surface-primary)', borderColor: 'var(--color-border-separator)' }}>
                <Page.Title>
                  <Box style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <Box style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                      <Typography intent="h2">Edit KPI</Typography>
                      <Typography intent="body" style={{ color: 'var(--color-text-secondary)' }}>
                        {kpiLabel}
                      </Typography>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <Button variant="tertiary" className="b_tertiary" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button variant="primary" className="b_primary" onClick={handleSave}>
                        Save Changes
                      </Button>
                    </Box>
                  </Box>
                </Page.Title>
              </Page.Header>

              <Page.Body style={{ padding: 24, overflowY: 'auto', background: 'var(--color-surface-secondary)' }}>

                {/* ── Status ── */}
                <SectionCard>
                  <H2 style={{ marginBottom: 16 }}>Status</H2>
                  <FormField>
                    <SwitchRow>
                      <div>
                        <Typography intent="body" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          Active
                        </Typography>
                        <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                          Include this KPI in the composite health score calculation.
                        </Typography>
                      </div>
                      <Switch
                        checked={form.active}
                        onChange={() => setForm(f => ({ ...f, active: !f.active }))}
                        aria-label={`KPI active: ${kpiLabel}`}
                      />
                    </SwitchRow>
                  </FormField>
                </SectionCard>

                {/* ── Calculation ── */}
                <SectionCard>
                  <H2 style={{ marginBottom: 16 }}>Calculation</H2>
                  <FormField>
                    <FieldLabel>Calculation Type</FieldLabel>
                    <FieldHint>How the KPI value is derived from source data.</FieldHint>
                    <Select
                      block
                      label={calcOption.label}
                      onSelect={({ item }) => setForm(f => ({ ...f, calcType: (item as typeof CALC_TYPE_OPTIONS[0]).value }))}
                    >
                      {CALC_TYPE_OPTIONS.map(opt => (
                        <Select.Option key={opt.value} value={opt} selected={form.calcType === opt.value}>
                          {opt.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </FormField>
                  <FormField>
                    <FieldLabel>Weight</FieldLabel>
                    <FieldHint>Relative importance in the composite health score. Higher values have more impact.</FieldHint>
                    <NativeInput
                      type="number"
                      min={0}
                      max={100}
                      value={form.weight}
                      onChange={e => setForm(f => ({ ...f, weight: Number(e.target.value) }))}
                      aria-label="KPI weight"
                    />
                  </FormField>
                </SectionCard>

                {/* ── Thresholds ── */}
                <SectionCard>
                  <H2 style={{ marginBottom: 8 }}>Thresholds</H2>
                  <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 16 }}>
                    Define when this KPI signals a project is At Risk or Critical.
                  </Typography>
                  <ThresholdRow>
                    <FormField>
                      <FieldLabel style={{ color: 'var(--color-pill-text-yellow)' }}>At Risk at</FieldLabel>
                      <FieldHint>KPI value that triggers At Risk status.</FieldHint>
                      <NativeInput
                        type="number"
                        value={form.yellow}
                        onChange={e => setForm(f => ({ ...f, yellow: Number(e.target.value) }))}
                        aria-label="At Risk threshold"
                      />
                    </FormField>
                    <FormField>
                      <FieldLabel style={{ color: 'var(--color-text-error)' }}>Critical at</FieldLabel>
                      <FieldHint>KPI value that triggers Critical status.</FieldHint>
                      <NativeInput
                        type="number"
                        value={form.red}
                        onChange={e => setForm(f => ({ ...f, red: Number(e.target.value) }))}
                        aria-label="Critical threshold"
                      />
                    </FormField>
                  </ThresholdRow>
                </SectionCard>

                {/* ── Filters ── */}
                <SectionCard>
                  <H2 style={{ marginBottom: 8 }}>Filters</H2>
                  <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 16 }}>
                    Narrow which records count toward this KPI. All filters default to no restriction.
                  </Typography>
                  <FormField>
                    <FieldLabel>Date Range</FieldLabel>
                    <FieldHint>Restrict the KPI calculation to records within this time window.</FieldHint>
                    <Select
                      block
                      label={dateRangeOption.label}
                      onSelect={({ item }) => setForm(f => ({ ...f, dateRange: (item as typeof DATE_RANGE_OPTIONS[0]).value }))}
                    >
                      {DATE_RANGE_OPTIONS.map(opt => (
                        <Select.Option key={opt.value} value={opt} selected={form.dateRange === opt.value}>
                          {opt.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </FormField>
                </SectionCard>

              </Page.Body>
            </Page.Main>
          </Page>
        </div>
      </Tearsheet>
    </>
  );
}
