/**
 * RISK TYPE TEARSHEET
 * Slide-over panel for creating or editing a Risk Type.
 * Matches the ProjectEditTearsheet pattern: gray body bg, white SectionCards, header actions.
 */

import { useState, useEffect } from 'react';
import { Box, Button, Card, Checkbox, H2, Page, Pill, Select, TextArea, TextInput, Tearsheet, Typography } from '@procore/core-react';
import styled, { createGlobalStyle } from 'styled-components';
import type { KPIKey, RiskType, RiskTypeCategory, RiskTypeSource, ResponseStrategy } from '@/types/health';
import { KPI_LABELS } from '@/types/health';

// ─── Width override ───────────────────────────────────────────────────────────

const TearsheetWidth = createGlobalStyle`
  [class*="StyledTearsheetBody"]:has(> .risk-type-tearsheet-root) {
    flex: 0 0 60vw !important;
  }
`;

// ─── Styled ───────────────────────────────────────────────────────────────────

const SectionCard = styled(Card)`
  padding: 24px;
  background: var(--color-surface-primary);
  margin-bottom: 16px;
`;

const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
`;

const FieldLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 6px;
`;

const FormField = styled.div`
  margin-bottom: 16px;
  &:last-child { margin-bottom: 0; }
`;

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS: { value: RiskTypeCategory; label: string }[] = [
  { value: 'financial',     label: 'Cost / Financial' },
  { value: 'schedule',      label: 'Schedule' },
  { value: 'safety',        label: 'Safety' },
  { value: 'quality',       label: 'Quality' },
  { value: 'regulatory',    label: 'Regulatory' },
  { value: 'environmental', label: 'Environmental' },
  { value: 'contractual',   label: 'Contractual' },
  { value: 'other',         label: 'Other' },
];

const SOURCE_OPTIONS: { value: RiskTypeSource; label: string }[] = [
  { value: 'budget',         label: 'Budget' },
  { value: 'schedule',       label: 'Schedule' },
  { value: 'rfis',           label: 'RFIs' },
  { value: 'submittals',     label: 'Submittals' },
  { value: 'change_events',  label: 'Change Events' },
  { value: 'observations',   label: 'Observations / Manual' },
  { value: 'inspections',    label: 'Inspections' },
  { value: 'punch_list',     label: 'Punch List' },
  { value: 'action_plans',   label: 'Action Plans' },
];

const RESPONSE_STRATEGIES: { value: ResponseStrategy; label: string }[] = [
  { value: 'mitigate', label: 'Mitigate' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'accept',   label: 'Accept' },
  { value: 'avoid',    label: 'Avoid' },
];

const ALL_KPI_KEYS = Object.keys(KPI_LABELS) as KPIKey[];

// ─── Form state type ──────────────────────────────────────────────────────────

interface RiskTypeFormState {
  label: string;
  category: RiskTypeCategory;
  sourceData: RiskTypeSource[];
  linkedKpiKeys: KPIKey[];
  description: string;
  defaultResponseStrategies: ResponseStrategy[];
}

const EMPTY_FORM: RiskTypeFormState = {
  label: '',
  category: 'financial',
  sourceData: [],
  linkedKpiKeys: [],
  description: '',
  defaultResponseStrategies: ['mitigate'],
};

function riskTypeToForm(rt: RiskType): RiskTypeFormState {
  return {
    label: rt.label,
    category: rt.category,
    sourceData: [...rt.sourceData],
    linkedKpiKeys: [...rt.linkedKpiKeys],
    description: rt.description,
    defaultResponseStrategies: [...rt.defaultResponseStrategies],
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface RiskTypeTearsheetProps {
  open: boolean;
  /** null = create mode; RiskType = edit mode */
  riskType: RiskType | null;
  onClose: () => void;
  onSave: (rt: RiskType) => void;
}

export default function RiskTypeTearsheet({ open, riskType, onClose, onSave }: RiskTypeTearsheetProps) {
  const isEdit = riskType !== null;
  const [form, setForm] = useState<RiskTypeFormState>(EMPTY_FORM);

  useEffect(() => {
    if (open) {
      setForm(riskType ? riskTypeToForm(riskType) : EMPTY_FORM);
    }
  }, [open, riskType]);

  function toggleMulti<T>(current: T[], value: T): T[] {
    return current.includes(value) ? current.filter(v => v !== value) : [...current, value];
  }

  function handleSave() {
    if (!form.label.trim()) return;
    const saved: RiskType = isEdit
      ? { ...riskType, ...form, label: form.label.trim() }
      : {
          id: `rt-${Date.now()}`,
          ...form,
          label: form.label.trim(),
          isDefault: false,
          isHidden: false,
        };
    onSave(saved);
  }

  const canSave = !!form.label.trim();
  const selectedCategory = CATEGORY_OPTIONS.find(o => o.value === form.category) ?? CATEGORY_OPTIONS[0];

  return (
    <>
      <TearsheetWidth />
      <Tearsheet open={open} onClose={onClose} aria-label={isEdit ? 'Edit Risk Type' : 'Add Risk Type'} placement="right">
        <div
          className="risk-type-tearsheet-root"
          style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}
        >
          <Page style={{ height: '100%', background: 'var(--color-surface-primary)', color: 'var(--color-text-primary)' }}>
            <Page.Main style={{ height: '100%', overflow: 'hidden', background: 'var(--color-surface-primary)' }}>

              <Page.Header style={{ background: 'var(--color-surface-primary)', borderColor: 'var(--color-border-separator)' }}>
                <Page.Title>
                  <Box style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <Box style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Typography intent="h2">
                          {isEdit ? 'Edit Risk Type' : 'New Risk Type'}
                        </Typography>
                        {riskType?.isDefault && (
                          <Pill color="gray" style={{ fontSize: 11 }}>Default</Pill>
                        )}
                      </div>
                      {isEdit && (
                        <Typography intent="body" style={{ color: 'var(--color-text-secondary)' }}>
                          {riskType.label}
                        </Typography>
                      )}
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <Button variant="tertiary" className="b_tertiary" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        className="b_primary"
                        onClick={handleSave}
                        disabled={!canSave}
                      >
                        {isEdit ? 'Save Changes' : 'Add Risk Type'}
                      </Button>
                    </Box>
                  </Box>
                </Page.Title>
              </Page.Header>

              <Page.Body style={{ padding: 24, overflowY: 'auto', background: 'var(--color-surface-secondary)' }}>

                {/* ── Identity ── */}
                <SectionCard>
                  <H2 style={{ marginBottom: 16 }}>Identity</H2>
                  <FormField>
                    <FieldLabel htmlFor="rt-name">Name *</FieldLabel>
                    <TextInput
                      id="rt-name"
                      value={form.label}
                      placeholder="e.g. Geotechnical Risk"
                      onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                    />
                  </FormField>
                  <FormField>
                    <FieldLabel>Category</FieldLabel>
                    <Select
                      block
                      label={selectedCategory.label}
                      onSelect={({ item }) => setForm(f => ({ ...f, category: (item as typeof CATEGORY_OPTIONS[0]).value }))}
                    >
                      {CATEGORY_OPTIONS.map(opt => (
                        <Select.Option key={opt.value} value={opt} selected={form.category === opt.value}>
                          {opt.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </FormField>
                  <FormField>
                    <FieldLabel htmlFor="rt-desc">Description</FieldLabel>
                    <TextArea
                      id="rt-desc"
                      value={form.description}
                      placeholder="Describe when this risk type applies to a project..."
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      style={{ minHeight: 72, width: '100%', boxSizing: 'border-box' }}
                    />
                  </FormField>
                </SectionCard>

                {/* ── Source Data ── */}
                <SectionCard>
                  <H2 style={{ marginBottom: 8 }}>Source Data</H2>
                  <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 16 }}>
                    Select which Procore tools or data sources signal this type of risk. &quot;Observations / Manual&quot; means the risk is logged directly by users.
                  </Typography>
                  <CheckboxGrid>
                    {SOURCE_OPTIONS.map(src => (
                      <Checkbox
                        key={src.value}
                        checked={form.sourceData.includes(src.value)}
                        onChange={() => setForm(f => ({ ...f, sourceData: toggleMulti(f.sourceData, src.value) }))}
                      >
                        {src.label}
                      </Checkbox>
                    ))}
                  </CheckboxGrid>
                </SectionCard>

                {/* ── Linked KPIs ── */}
                <SectionCard>
                  <H2 style={{ marginBottom: 8 }}>Linked KPIs</H2>
                  <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 16 }}>
                    Select which hub-level KPIs this risk type feeds into. Linked KPIs will show this risk type as a contributing factor in their detail view.
                  </Typography>
                  <CheckboxGrid>
                    {ALL_KPI_KEYS.map(key => (
                      <Checkbox
                        key={key}
                        checked={form.linkedKpiKeys.includes(key)}
                        onChange={() => setForm(f => ({ ...f, linkedKpiKeys: toggleMulti(f.linkedKpiKeys, key) }))}
                      >
                        {KPI_LABELS[key]}
                      </Checkbox>
                    ))}
                  </CheckboxGrid>
                </SectionCard>

                {/* ── Default Response Strategies ── */}
                <SectionCard>
                  <H2 style={{ marginBottom: 8 }}>Default Response Strategies</H2>
                  <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 16 }}>
                    These strategies will be pre-selected when a user creates a new risk of this type.
                  </Typography>
                  <CheckboxGrid>
                    {RESPONSE_STRATEGIES.map(s => (
                      <Checkbox
                        key={s.value}
                        checked={form.defaultResponseStrategies.includes(s.value)}
                        onChange={() => setForm(f => ({ ...f, defaultResponseStrategies: toggleMulti(f.defaultResponseStrategies, s.value) }))}
                      >
                        {s.label}
                      </Checkbox>
                    ))}
                  </CheckboxGrid>
                </SectionCard>

              </Page.Body>
            </Page.Main>
          </Page>
        </div>
      </Tearsheet>
    </>
  );
}
