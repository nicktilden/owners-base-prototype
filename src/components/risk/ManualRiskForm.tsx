/**
 * MANUAL RISK FORM
 * Modal for creating a manual risk item (escape hatch for risks with no source object).
 * Same fields as TagForm plus title and description.
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Modal } from '@procore/core-react';
import type { ManualRiskItem, ResponseStrategy } from '@/types/health';
import { useManualRiskItems } from '@/context/ManualRiskItemsContext';
import { usePersona } from '@/context/PersonaContext';
import { useData } from '@/context/DataContext';

// ─── Styled components ────────────────────────────────────────────────────────

const FieldRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
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
  margin-top: 2px;
`;

// ─── Constants ────────────────────────────────────────────────────────────────

const PROBABILITY_LABELS = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];

// ─── Props ────────────────────────────────────────────────────────────────────

interface ManualRiskFormProps {
  onClose: () => void;
}

export default function ManualRiskForm({ onClose }: ManualRiskFormProps) {
  const { addManualRiskItem } = useManualRiskItems();
  const { activeUser } = usePersona();
  const { data } = useData();

  const projects = data.projects ?? [];
  const riskTypes = data.account?.riskTypes ?? [];

  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [riskTypeId, setRiskTypeId] = useState('');
  const [probability, setProbability] = useState<number>(2);
  const [impact, setImpact] = useState<number>(0);
  const [responseStrategy, setResponseStrategy] = useState<ResponseStrategy | ''>('');
  const [mitigationPlan, setMitigationPlan] = useState('');

  const canSave = !!projectId && !!title.trim() && !!riskTypeId;

  function handleSave() {
    if (!canSave) return;
    addManualRiskItem({
      id: `mri-${Date.now()}`,
      projectId,
      title: title.trim(),
      description: description.trim(),
      riskTypeId,
      probability: probability as 1 | 2 | 3 | 4 | 5,
      impact,
      status: 'open',
      riskOwner: activeUser?.id ?? '',
      responseStrategy: responseStrategy || undefined,
      mitigationPlan: mitigationPlan || undefined,
      origin: 'manual',
      createdBy: activeUser?.id ?? '',
      createdAt: new Date(),
    });
    onClose();
  }

  return (
    <Modal open onClickOverlay={onClose} aria-labelledby="manual-risk-form-title">
      <Modal.Header id="manual-risk-form-title" onClose={onClose}>
        Add Manual Risk
      </Modal.Header>
      <Modal.Body>
        <FieldRow>
          <FieldLabel htmlFor="mrf-project">Project</FieldLabel>
          <NativeSelect id="mrf-project" value={projectId} onChange={e => setProjectId(e.target.value)}>
            <option value="">Select a project…</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </NativeSelect>
        </FieldRow>

        <FieldRow>
          <FieldLabel htmlFor="mrf-title">Title</FieldLabel>
          <NativeInput
            id="mrf-title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Brief risk title…"
          />
        </FieldRow>

        <FieldRow>
          <FieldLabel htmlFor="mrf-description">Description</FieldLabel>
          <NativeTextarea
            id="mrf-description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe the risk and its potential impact…"
          />
        </FieldRow>

        <FieldRow>
          <FieldLabel htmlFor="mrf-risk-type">Risk Type</FieldLabel>
          <NativeSelect id="mrf-risk-type" value={riskTypeId} onChange={e => setRiskTypeId(e.target.value)}>
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
            <FieldLabel htmlFor="mrf-impact">Expected Impact ($)</FieldLabel>
            <NativeInput
              id="mrf-impact"
              type="number"
              value={impact}
              min={0}
              step={1000}
              onChange={e => setImpact(Number(e.target.value))}
            />
          </FieldRow>
        </TwoCol>

        <FieldRow>
          <FieldLabel htmlFor="mrf-response">Response Strategy</FieldLabel>
          <NativeSelect
            id="mrf-response"
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
            <FieldLabel htmlFor="mrf-mitigation">Mitigation Plan</FieldLabel>
            <NativeTextarea
              id="mrf-mitigation"
              value={mitigationPlan}
              onChange={e => setMitigationPlan(e.target.value)}
              rows={2}
              placeholder="Describe the mitigation approach…"
            />
          </FieldRow>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Modal.FooterButtons>
          <Button variant="tertiary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={!canSave}>
            Add risk
          </Button>
        </Modal.FooterButtons>
      </Modal.Footer>
    </Modal>
  );
}
