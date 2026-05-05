/**
 * RISK TYPE TEARSHEET
 * Slide-over panel for creating or editing a Risk Type.
 * Matches the ProjectEditTearsheet pattern: gray body bg, white SectionCards, header actions.
 */

import { useState, useEffect } from 'react';
import { Box, Button, Card, Checkbox, H2, Page, Pill, Select, TextArea, TextInput, Tearsheet, Typography } from '@procore/core-react';
import { Plus, Trash } from '@procore/core-icons';
import styled, { createGlobalStyle } from 'styled-components';
import type { KPIKey, RiskType, RiskTypeCategory, RiskTypeSource, ResponseStrategy, RiskTypeRule, ApprovalTrigger, SourceType } from '@/types/health';
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 24px;
  align-items: start;

  /* Normalize left spacing so both columns flush-align */
  & > * {
    margin-left: 0 !important;
    padding-left: 0 !important;
  }
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

// ─── v7 constants ─────────────────────────────────────────────────────────────

const SOURCE_TYPE_OPTIONS: { value: SourceType; label: string }[] = [
  { value: 'rfi',            label: 'RFI' },
  { value: 'change_event',   label: 'Change Event' },
  { value: 'punch_list',     label: 'Punch List' },
  { value: 'submittal',      label: 'Submittal' },
  { value: 'correspondence', label: 'Correspondence' },
  { value: 'milestone',      label: 'Milestone' },
  { value: 'budget_line',    label: 'Budget Line' },
];

const OPERATOR_OPTIONS: { value: string; label: string }[] = [
  { value: 'gt',  label: '>' },
  { value: 'gte', label: '≥' },
  { value: 'lt',  label: '<' },
  { value: 'lte', label: '≤' },
  { value: 'eq',  label: '=' },
];

const PROB_OPTIONS = [1, 2, 3, 4, 5] as const;

// ─── Rule/Trigger row styled ──────────────────────────────────────────────────

const RuleRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--color-border-default);
  border-radius: 6px;
  margin-bottom: 8px;
  background: var(--color-surface-secondary);
`;

const RuleFields = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const InlineNativeSelect = styled.select`
  border: 1px solid var(--color-border-default);
  border-radius: 4px;
  padding: 4px 6px;
  font-size: 12px;
  color: var(--color-text-primary);
  background: var(--color-surface-card);
  width: 100%;
  &:focus { outline: none; border-color: var(--color-border-focus); }
`;

const InlineNativeInput = styled.input`
  border: 1px solid var(--color-border-default);
  border-radius: 4px;
  padding: 4px 6px;
  font-size: 12px;
  color: var(--color-text-primary);
  background: var(--color-surface-card);
  width: 100%;
  box-sizing: border-box;
  &:focus { outline: none; border-color: var(--color-border-focus); }
`;

const InlineLabel = styled.label`
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  display: block;
  margin-bottom: 2px;
`;

const SubField = styled.div`
  display: flex;
  flex-direction: column;
`;

// ─── Form state type ──────────────────────────────────────────────────────────

interface RiskTypeFormState {
  label: string;
  category: RiskTypeCategory;
  sourceData: RiskTypeSource[];
  linkedKpiKeys: KPIKey[];
  description: string;
  defaultResponseStrategies: ResponseStrategy[];
  taggingRules: RiskTypeRule[];
  approvalTriggers: ApprovalTrigger[];
}

const EMPTY_FORM: RiskTypeFormState = {
  label: '',
  category: 'financial',
  sourceData: [],
  linkedKpiKeys: [],
  description: '',
  defaultResponseStrategies: ['mitigate'],
  taggingRules: [],
  approvalTriggers: [],
};

function riskTypeToForm(rt: RiskType): RiskTypeFormState {
  return {
    label: rt.label,
    category: rt.category,
    sourceData: [...rt.sourceData],
    linkedKpiKeys: [...rt.linkedKpiKeys],
    description: rt.description,
    defaultResponseStrategies: [...rt.defaultResponseStrategies],
    taggingRules: [...(rt.taggingRules ?? [])],
    approvalTriggers: [...(rt.approvalTriggers ?? [])],
  };
}

function emptyRule(riskTypeId: string): RiskTypeRule {
  return {
    id: `rtr-${Date.now()}`,
    riskTypeId,
    sourceType: 'rfi',
    filter: { field: 'costImpact', operator: 'gt', value: 50000 },
    defaultProbability: 3,
    defaultImpact: 'inherit_from_source',
    autoCreate: false,
  };
}

function emptyTrigger(riskTypeId: string): ApprovalTrigger {
  return {
    id: `at-${Date.now()}`,
    riskTypeId,
    condition: { field: 'impact', operator: 'gt', value: 250000 },
    workflowId: 'risk-approval-workflow',
    onTrigger: 'pending_approval',
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

  const riskTypeId = isEdit ? riskType.id : `rt-${Date.now()}-pending`;

  function updateRule(idx: number, patch: Partial<RiskTypeRule>) {
    setForm(f => ({
      ...f,
      taggingRules: f.taggingRules.map((r, i) => i === idx ? { ...r, ...patch } : r),
    }));
  }

  function updateTrigger(idx: number, patch: Partial<ApprovalTrigger>) {
    setForm(f => ({
      ...f,
      approvalTriggers: f.approvalTriggers.map((t, i) => i === idx ? { ...t, ...patch } : t),
    }));
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

                {/* ── Tagging Rules ── */}
                <SectionCard>
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <H2>Tagging Rules</H2>
                    <Button
                      variant="tertiary"
                      size="sm"
                      icon={<Plus />}
                      onClick={() => setForm(f => ({ ...f, taggingRules: [...f.taggingRules, emptyRule(riskTypeId)] }))}
                    >
                      Add rule
                    </Button>
                  </Box>
                  <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 16 }}>
                    Rules surface source items as suggested risk tags. Set <em>Auto-create</em> to create tags automatically without review.
                  </Typography>
                  {form.taggingRules.length === 0 && (
                    <Typography intent="small" style={{ color: 'var(--color-text-tertiary)' }}>
                      No rules yet. Click &ldquo;Add rule&rdquo; to get started.
                    </Typography>
                  )}
                  {form.taggingRules.map((rule, idx) => (
                    <RuleRow key={rule.id}>
                      <RuleFields>
                        <SubField>
                          <InlineLabel>Source Type</InlineLabel>
                          <InlineNativeSelect
                            value={rule.sourceType}
                            onChange={e => updateRule(idx, { sourceType: e.target.value as SourceType })}
                          >
                            {SOURCE_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </InlineNativeSelect>
                        </SubField>
                        <SubField>
                          <InlineLabel>Filter Field</InlineLabel>
                          <InlineNativeInput
                            type="text"
                            value={rule.filter.field}
                            onChange={e => updateRule(idx, { filter: { ...rule.filter, field: e.target.value } })}
                            placeholder="e.g. costImpact"
                          />
                        </SubField>
                        <SubField>
                          <InlineLabel>Operator</InlineLabel>
                          <InlineNativeSelect
                            value={rule.filter.operator}
                            onChange={e => updateRule(idx, { filter: { ...rule.filter, operator: e.target.value as 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'contains' } })}
                          >
                            {OPERATOR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </InlineNativeSelect>
                        </SubField>
                        <SubField>
                          <InlineLabel>Value</InlineLabel>
                          <InlineNativeInput
                            type="number"
                            value={String(rule.filter.value)}
                            onChange={e => updateRule(idx, { filter: { ...rule.filter, value: Number(e.target.value) } })}
                          />
                        </SubField>
                        <SubField>
                          <InlineLabel>Default Probability</InlineLabel>
                          <InlineNativeSelect
                            value={String(rule.defaultProbability)}
                            onChange={e => updateRule(idx, { defaultProbability: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 })}
                          >
                            {PROB_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                          </InlineNativeSelect>
                        </SubField>
                        <SubField>
                          <InlineLabel>Default Impact</InlineLabel>
                          <InlineNativeSelect
                            value={rule.defaultImpact === 'inherit_from_source' ? 'inherit' : String(rule.defaultImpact)}
                            onChange={e => updateRule(idx, { defaultImpact: e.target.value === 'inherit' ? 'inherit_from_source' : Number(e.target.value) })}
                          >
                            <option value="inherit">Inherit from source</option>
                            <option value="0">$0</option>
                            <option value="50000">$50,000</option>
                            <option value="100000">$100,000</option>
                            <option value="250000">$250,000</option>
                            <option value="500000">$500,000</option>
                          </InlineNativeSelect>
                        </SubField>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <Checkbox
                            checked={rule.autoCreate}
                            onChange={() => updateRule(idx, { autoCreate: !rule.autoCreate })}
                          >
                            Auto-create tag (no review required)
                          </Checkbox>
                        </div>
                      </RuleFields>
                      <Button
                        variant="tertiary"
                        size="sm"
                        icon={<Trash />}
                        aria-label="Remove rule"
                        onClick={() => setForm(f => ({ ...f, taggingRules: f.taggingRules.filter((_, i) => i !== idx) }))}
                      />
                    </RuleRow>
                  ))}
                </SectionCard>

                {/* ── Approval Triggers ── */}
                <SectionCard>
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <H2>Approval Triggers</H2>
                    <Button
                      variant="tertiary"
                      size="sm"
                      icon={<Plus />}
                      onClick={() => setForm(f => ({ ...f, approvalTriggers: [...f.approvalTriggers, emptyTrigger(riskTypeId)] }))}
                    >
                      Add trigger
                    </Button>
                  </Box>
                  <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 16 }}>
                    Triggers launch a Procore Workflow when a tag on this risk type crosses the defined threshold. The tag moves to <em>Pending Approval</em> until the workflow completes.
                  </Typography>
                  {form.approvalTriggers.length === 0 && (
                    <Typography intent="small" style={{ color: 'var(--color-text-tertiary)' }}>
                      No triggers yet. Click &ldquo;Add trigger&rdquo; to require approval for high-impact risks.
                    </Typography>
                  )}
                  {form.approvalTriggers.map((trigger, idx) => (
                    <RuleRow key={trigger.id}>
                      <RuleFields>
                        <SubField>
                          <InlineLabel>Condition Field</InlineLabel>
                          <InlineNativeInput
                            type="text"
                            value={trigger.condition.field}
                            onChange={e => updateTrigger(idx, { condition: { ...trigger.condition, field: e.target.value } })}
                            placeholder="e.g. impact"
                          />
                        </SubField>
                        <SubField>
                          <InlineLabel>Operator</InlineLabel>
                          <InlineNativeSelect
                            value={trigger.condition.operator}
                            onChange={e => updateTrigger(idx, { condition: { ...trigger.condition, operator: e.target.value as 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'contains' } })}
                          >
                            {OPERATOR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </InlineNativeSelect>
                        </SubField>
                        <SubField>
                          <InlineLabel>Threshold Value</InlineLabel>
                          <InlineNativeInput
                            type="number"
                            value={String(trigger.condition.value)}
                            onChange={e => updateTrigger(idx, { condition: { ...trigger.condition, value: Number(e.target.value) } })}
                          />
                        </SubField>
                        <SubField>
                          <InlineLabel>Workflow ID</InlineLabel>
                          <InlineNativeInput
                            type="text"
                            value={trigger.workflowId}
                            onChange={e => updateTrigger(idx, { workflowId: e.target.value })}
                            placeholder="e.g. cost-risk-approval-v2"
                          />
                        </SubField>
                      </RuleFields>
                      <Button
                        variant="tertiary"
                        size="sm"
                        icon={<Trash />}
                        aria-label="Remove trigger"
                        onClick={() => setForm(f => ({ ...f, approvalTriggers: f.approvalTriggers.filter((_, i) => i !== idx) }))}
                      />
                    </RuleRow>
                  ))}
                </SectionCard>

              </Page.Body>
            </Page.Main>
          </Page>
        </div>
      </Tearsheet>
    </>
  );
}
