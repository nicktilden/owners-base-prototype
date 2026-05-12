/**
 * TAG FORM (v7)
 * Inline risk tag creation/edit form. Used inside TagPanel.
 * Pre-fills probability/impact from source object fields when available.
 * Supports multiple tags per source item.
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Select, TextArea, TextInput } from '@procore/core-react';
import type { RiskTag, RiskTagStatus, SourceType, ResponseStrategy } from '@/types/health';
import { useData } from '@/context/DataContext';
import { usePersona } from '@/context/PersonaContext';

// ─── Styled components ────────────────────────────────────────────────────────

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--color-border-focus);
  border-radius: 6px;
  background: var(--color-surface-card);
`;

const FieldRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FieldLabel = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const SliderRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ProbLabel = styled.span`
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-top: 2px;
  display: block;
`;

const RatingDot = styled.button<{ $active: boolean; $level: number }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid ${({ $active, $level }) => ($active
    ? ($level >= 5 ? 'var(--color-pill-border-red)' : $level >= 3 ? 'var(--color-pill-border-yellow)' : 'var(--color-pill-border-green)')
    : 'var(--color-border-default)'
  )};
  background: ${({ $active, $level }) => ($active
    ? ($level >= 5 ? 'var(--color-pill-bg-red)' : $level >= 3 ? 'var(--color-pill-bg-yellow)' : 'var(--color-pill-bg-green)')
    : 'transparent'
  )};
  color: ${({ $active, $level }) => ($active
    ? ($level >= 5 ? 'var(--color-pill-text-red)' : $level >= 3 ? 'var(--color-pill-text-yellow)' : 'var(--color-pill-text-green)')
    : 'var(--color-text-secondary)'
  )};
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s;
  &:focus-visible { outline: 2px solid var(--color-border-focus); outline-offset: 2px; }
`;

// ─── Constants ────────────────────────────────────────────────────────────────

const PROBABILITY_LABELS = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];

const RESPONSE_OPTIONS: { value: ResponseStrategy | ''; label: string }[] = [
  { value: 'mitigate', label: 'Mitigate' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'accept',   label: 'Accept'   },
  { value: 'avoid',    label: 'Avoid'    },
];

interface TagFormProps {
  sourceType: SourceType;
  sourceId: string;
  projectId: string;
  existingTag?: Partial<RiskTag>;
  prefillImpact?: number;
  prefillProbability?: number;
  onSave: (tag: Omit<RiskTag, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export default function TagForm({
  sourceType,
  sourceId,
  projectId,
  existingTag,
  prefillImpact,
  prefillProbability,
  onSave,
  onCancel,
}: TagFormProps) {
  const { data } = useData();
  const { activeUser } = usePersona();

  const riskTypes = data.account?.riskTypes ?? [];

  const [riskTypeId, setRiskTypeId]         = useState<string>(existingTag?.riskTypeId ?? '');
  const [probability, setProbability]       = useState<number>(existingTag?.probability ?? prefillProbability ?? 2);
  const [impact, setImpact]                 = useState<number>(existingTag?.impact ?? prefillImpact ?? 0);
  const [scheduleImpact, setScheduleImpact] = useState<number>(existingTag?.scheduleImpact ?? 0);
  const [responseStrategy, setResponseStrategy] = useState<ResponseStrategy | ''>(existingTag?.responseStrategy ?? '');
  const [mitigationPlan, setMitigationPlan] = useState<string>(existingTag?.mitigationPlan ?? '');

  function handleSave() {
    if (!riskTypeId) return;
    onSave({
      sourceType,
      sourceId,
      projectId,
      riskTypeId,
      probability: probability as 1 | 2 | 3 | 4 | 5,
      impact,
      scheduleImpact: scheduleImpact > 0 ? scheduleImpact : undefined,
      status: (existingTag?.status as RiskTagStatus) ?? 'open',
      riskOwner: activeUser?.id ?? '',
      responseStrategy: responseStrategy || undefined,
      mitigationPlan: mitigationPlan || undefined,
      origin: 'manual',
      createdBy: activeUser?.id ?? '',
      autoCloseOnSourceClose: true,
    });
  }

  const canSave = !!riskTypeId;
  const selectedRiskType = riskTypes.find(rt => rt.id === riskTypeId);
  const selectedResponse = RESPONSE_OPTIONS.find(o => o.value === responseStrategy);

  return (
    <FormWrapper>

      {/* Risk Type */}
      <FieldRow>
        <FieldLabel htmlFor="tag-risk-type">Risk Type</FieldLabel>
        <Select
          placeholder="Select a risk type…"
          label={selectedRiskType?.label}
          block
          onSelect={(s: { item: unknown }) => {
            const item = s.item as { value: string };
            setRiskTypeId(item.value);
          }}
          onClear={riskTypeId ? () => setRiskTypeId('') : undefined}
        >
          {riskTypes.map(rt => (
            <Select.Option key={rt.id} value={{ value: rt.id }} selected={riskTypeId === rt.id}>
              {rt.label}
            </Select.Option>
          ))}
        </Select>
      </FieldRow>

      {/* Probability */}
      <FieldRow>
        <FieldLabel>Probability</FieldLabel>
        <SliderRow>
          {[1, 2, 3, 4, 5].map(val => (
            <RatingDot
              key={val}
              type="button"
              $active={probability === val}
              $level={val}
              aria-label={`Probability ${val} — ${PROBABILITY_LABELS[val - 1]}`}
              aria-pressed={probability === val}
              onClick={() => setProbability(val)}
            >
              {val}
            </RatingDot>
          ))}
        </SliderRow>
        <ProbLabel>{PROBABILITY_LABELS[probability - 1]}</ProbLabel>
      </FieldRow>

      {/* Cost Impact + Schedule Impact */}
      <TwoCol>
        <FieldRow>
          <FieldLabel htmlFor="tag-impact">Cost Impact ($)</FieldLabel>
          <TextInput
            id="tag-impact"
            type="number"
            value={String(impact)}
            min={0}
            step={1000}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImpact(Number(e.target.value))}
          />
        </FieldRow>

        <FieldRow>
          <FieldLabel htmlFor="tag-schedule-impact">Schedule Impact (days)</FieldLabel>
          <TextInput
            id="tag-schedule-impact"
            type="number"
            value={String(scheduleImpact)}
            min={0}
            step={1}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setScheduleImpact(Number(e.target.value))}
          />
        </FieldRow>
      </TwoCol>

      {/* Response Strategy */}
      <FieldRow>
        <FieldLabel htmlFor="tag-response">Response Strategy</FieldLabel>
        <Select
          placeholder="Optional"
          label={selectedResponse?.label}
          block
          onSelect={(s: { item: unknown }) => {
            const item = s.item as { value: string };
            setResponseStrategy(item.value as ResponseStrategy | '');
          }}
          onClear={responseStrategy ? () => setResponseStrategy('') : undefined}
        >
          {RESPONSE_OPTIONS.map(opt => (
            <Select.Option key={opt.value} value={{ value: opt.value }} selected={responseStrategy === opt.value}>
              {opt.label}
            </Select.Option>
          ))}
        </Select>
      </FieldRow>

      {/* Mitigation Plan (conditional) */}
      {responseStrategy === 'mitigate' && (
        <FieldRow>
          <FieldLabel htmlFor="tag-mitigation">Mitigation Plan</FieldLabel>
          <TextArea
            id="tag-mitigation"
            value={mitigationPlan}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMitigationPlan(e.target.value)}
            rows={2}
            placeholder="Describe the mitigation approach…"
          />
        </FieldRow>
      )}

      <ButtonRow>
        <Button variant="tertiary" size="sm" onClick={onCancel}>Cancel</Button>
        <Button variant="secondary" size="sm" onClick={handleSave} disabled={!canSave}>
          {existingTag?.riskTypeId ? 'Update tag' : 'Tag as risk'}
        </Button>
      </ButtonRow>
    </FormWrapper>
  );
}
