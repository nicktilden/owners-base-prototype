/**
 * EVIDENCE CARD (v7)
 * Per-dimension evidence card used in the v7 health detail tearsheet.
 * Shows: DualStatusBadge → dimension name → OriginIndicator → summary sentence → reasons → action.
 * Sorted by impact (caller's responsibility to pre-sort).
 */

import React from 'react';
import styled from 'styled-components';
import { Typography, Button } from '@procore/core-react';
import type { KPIResult, HealthScore } from '@/types/health';
import DualStatusBadge from './DualStatusBadge';
import OriginIndicator from './OriginIndicator';

// ─── Styled components ────────────────────────────────────────────────────────

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border: 1px solid var(--color-border-default);
  border-radius: 6px;
  background: var(--color-surface-card);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DimensionName = styled.div`
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const ReasonList = styled.ul`
  margin: 0;
  padding: 0 0 0 16px;
  list-style: disc;
`;

const ReasonItem = styled.li`
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 18px;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SourceLabel = styled.span`
  font-size: 11px;
  color: var(--color-text-tertiary);
`;

const ActionRow = styled.div`
  margin-top: 4px;
`;

// ─── Component ────────────────────────────────────────────────────────────────

interface EvidenceCardProps {
  kpi: KPIResult;
  forecastScore?: HealthScore;
  onAction?: () => void;
  actionLabel?: string;
}

export default function EvidenceCard({
  kpi,
  forecastScore,
  onAction,
  actionLabel,
}: EvidenceCardProps) {
  const currentScore = kpi.status === 'unavailable' ? 'green' : (kpi.status as HealthScore);
  const fScore = forecastScore ?? currentScore;

  const originState: 'automated' | 'manual' | 'mixed' | 'connected_partner' =
    kpi.dataSource === 'connected' ? 'connected_partner' :
    kpi.integrity.signalOrigin === 'automated' ? 'automated' :
    kpi.integrity.signalOrigin === 'mixed' ? 'mixed' :
    'manual';

  return (
    <Card>
      <Header>
        <DualStatusBadge currentScore={currentScore} forecastScore={fScore} />
        <DimensionName>{kpi.label}</DimensionName>
        <OriginIndicator origin={originState} />
      </Header>

      <MetaRow>
        <Typography intent="small">
          {kpi.displayValue}
        </Typography>
        {kpi.sourceLabel && (
          <SourceLabel>· {kpi.sourceLabel}</SourceLabel>
        )}
      </MetaRow>

      {kpi.reasons.length > 0 && (
        <ReasonList>
          {kpi.reasons.map((r, i) => (
            <ReasonItem key={i}>{r}</ReasonItem>
          ))}
        </ReasonList>
      )}

      {onAction && actionLabel && (
        <ActionRow>
          <Button variant="tertiary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </ActionRow>
      )}
    </Card>
  );
}
