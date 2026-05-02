/**
 * TAG FORM (v7)
 * Inline risk tag creation/edit form. Used inside TagPanel.
 * Pre-fills probability/impact from source object fields when available.
 * Supports multiple tags per source item.
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '@procore/core-react';
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
  gap: 12px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const NativeSelect = styled.select`
  border: 1px solid var(--color-border-default);
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 13px;
  color: var(--color-text-primary);
  background: var(--color-surface-card);
  outline: none;
  width: 100%;
  &:focus { border-color: var(--color-border-focus); }
`;

const NativeInput = styled.input`
  border: 1px solid var(--color-border-default);
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 13px;
  color: var(--color-text-primary);
  background: var(--color-surface-card);
  outline: none;
  width: 100%;
  box-sizing: border-box;
  &:focus { border-color: var(--color-border-focus); }
`;

const NativeTextarea = styled.textarea`
  border: 1px solid var(--color-border-default);
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 13px;
  color: var(--color-text-primary);
  background: var(--color-surface-card);
  resize: vertical;
  font-family: inherit;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  &:focus { border-color: var(--color-border-focus); }
`;

const SliderRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
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

const ProbLabel = styled.span`
  font-size: 11px;
  color: var(--color-text-secondary);
`;

// ─── Types ────────────────────────────────────────────────────────────────────

const PROBABILITY_LABELS = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];

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

  const [riskTypeId, setRiskTypeId] = useState<string>(existingTag?.riskTypeId ?? '');
  const [probability, setProbability] = useState<number>(existingTag?.probability ?? prefillProbability ?? 2);
  const [impact, setImpact] = useState<number>(existingTag?.impact ?? prefillImpact ?? 0);
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

  return (
    <FormWrapper>
      <FieldRow>
        <FieldLabel htmlFor="tag-risk-type">Risk Type</FieldLabel>
        <NativeSelect
          id="tag-risk-type"
          value={riskTypeId}
          onChange={e => setRiskTypeId(e.target.value)}
        >
          <option value="">Select a risk type…</option>
          {riskTypes.map(rt => (
            <option key={rt.id} value={rt.id}>{rt.label}</option>
          ))}
        </NativeSelect>
      </FieldRow>

      <TwoCol>
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

        <FieldRow>
          <FieldLabel htmlFor="tag-impact">Expected Impact ($)</FieldLabel>
          <NativeInput
            id="tag-impact"
            type="number"
            value={impact}
            min={0}
            step={1000}
            onChange={e => setImpact(Number(e.target.value))}
          />
        </FieldRow>
      </TwoCol>

      <FieldRow>
        <FieldLabel htmlFor="tag-response">Response Strategy</FieldLabel>
        <NativeSelect
          id="tag-response"
          value={responseStrategy}
          onChange={e => setResponseStrategy(e.target.value as ResponseStrategy | '')}
        >
          <option value="">Optional</option>
          <option value="mitigate">Mitigate</option>
          <option value="transfer">Transfer</option>
          <option value="accept">Accept</option>
          <option value="avoid">Avoid</option>
        </NativeSelect>
      </FieldRow>

      {responseStrategy === 'mitigate' && (
        <FieldRow>
          <FieldLabel htmlFor="tag-mitigation">Mitigation Plan</FieldLabel>
          <NativeTextarea
            id="tag-mitigation"
            value={mitigationPlan}
            onChange={e => setMitigationPlan(e.target.value)}
            rows={2}
            placeholder="Describe the mitigation approach…"
          />
        </FieldRow>
      )}

      <ButtonRow>
        <Button variant="tertiary" size="sm" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" size="sm" onClick={handleSave} disabled={!canSave}>
          {existingTag?.riskTypeId ? 'Update tag' : 'Tag as risk'}
        </Button>
      </ButtonRow>
    </FormWrapper>
  );
}
