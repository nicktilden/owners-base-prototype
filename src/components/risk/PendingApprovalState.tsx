/**
 * PENDING APPROVAL STATE (v7)
 * Shows a tag's pending_approval workflow status — mocked Procore Workflows steps.
 * "Mock complete" button transitions the tag back to 'open'.
 * Tag is read-only during pending_approval.
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Pill, Typography } from '@procore/core-react';
import { Check, Warning } from '@procore/core-icons';
import type { RiskTag } from '@/types/health';
import { useRiskTags } from '@/context/RiskTagsContext';

// ─── Styled components ────────────────────────────────────────────────────────

const Wrapper = styled.div`
  border: 1px solid var(--color-pill-border-blue);
  border-radius: 6px;
  background: var(--color-pill-bg-blue);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StepList = styled.ol`
  margin: 0;
  padding: 0 0 0 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Step = styled.li<{ $done: boolean }>`
  font-size: 13px;
  color: ${({ $done }) => $done ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'};
  font-weight: ${({ $done }) => $done ? 600 : 400};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StepIcon = styled.span<{ $done: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${({ $done }) => $done ? 'var(--color-pill-bg-green)' : 'var(--color-surface-secondary)'};
  border: 1.5px solid ${({ $done }) => $done ? 'var(--color-pill-border-green)' : 'var(--color-border-default)'};
  flex-shrink: 0;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--color-pill-border-blue);
`;

// ─── Workflow steps ───────────────────────────────────────────────────────────

const WORKFLOW_STEPS = [
  { id: 1, label: 'PM Review', description: 'Project Manager confirms risk details' },
  { id: 2, label: 'Director Approval', description: 'Director of Construction reviews exposure' },
  { id: 3, label: 'Owner Sign-off', description: 'Owner representative accepts or escalates' },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface PendingApprovalStateProps {
  tag: RiskTag;
  compact?: boolean;
}

export default function PendingApprovalState({ tag, compact = false }: PendingApprovalStateProps) {
  const { transitionStatus } = useRiskTags();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const allDone = completedSteps.length === WORKFLOW_STEPS.length;

  function advanceStep() {
    const nextStep = WORKFLOW_STEPS.find(s => !completedSteps.includes(s.id));
    if (nextStep) {
      setCompletedSteps(prev => [...prev, nextStep.id]);
    }
  }

  function handleMockComplete() {
    if (!allDone) {
      setCompletedSteps(WORKFLOW_STEPS.map(s => s.id));
      return;
    }
    transitionStatus(tag.id, 'open');
  }

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Pill color="blue">Pending Approval</Pill>
        <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
          Workflow in progress · {completedSteps.length}/{WORKFLOW_STEPS.length} steps
        </Typography>
      </div>
    );
  }

  return (
    <Wrapper>
      <Header>
        <Warning size="sm" style={{ color: 'var(--color-pill-text-blue)' }} />
        <Typography intent="body" style={{ fontWeight: 600, color: 'var(--color-pill-text-blue)' }}>
          Approval Workflow In Progress
        </Typography>
        <Pill color="blue">Pending Approval</Pill>
      </Header>

      <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
        This tag has triggered the <strong>cost-risk-approval-v2</strong> workflow because the expected impact exceeds the configured threshold.
        The tag is locked from edits until the workflow completes.
      </Typography>

      <StepList>
        {WORKFLOW_STEPS.map(step => {
          const done = completedSteps.includes(step.id);
          return (
            <Step key={step.id} $done={done}>
              <StepIcon $done={done}>
                {done && <Check size="sm" style={{ width: 10, height: 10, color: 'var(--color-pill-text-green)' }} />}
              </StepIcon>
              <span>
                <strong>{step.label}</strong>
                {!done && ` — ${step.description}`}
              </span>
            </Step>
          );
        })}
      </StepList>

      <Footer>
        <Typography intent="small" style={{ color: 'var(--color-text-tertiary)' }}>
          {allDone ? 'All steps complete — ready to finalize' : `${completedSteps.length} of ${WORKFLOW_STEPS.length} steps completed`}
        </Typography>
        <div style={{ display: 'flex', gap: 8 }}>
          {!allDone && (
            <Button variant="secondary" size="sm" onClick={advanceStep}>
              Advance step
            </Button>
          )}
          <Button
            variant={allDone ? 'primary' : 'tertiary'}
            size="sm"
            icon={allDone ? <Check /> : undefined}
            onClick={handleMockComplete}
          >
            {allDone ? 'Complete & return to Open' : 'Skip to complete'}
          </Button>
        </div>
      </Footer>
    </Wrapper>
  );
}
