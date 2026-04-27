/**
 * KPI ROW
 * Full-width KPI row: status chip + label + value + source badge.
 * Used in tearsheets and the health detail pages.
 */

import React from 'react';
import styled from 'styled-components';
import { Typography } from '@procore/core-react';
import { Link as LinkIcon, Connect, Person } from '@procore/core-icons';
import KPIStatusChip from './KPIStatusChip';
import type { KPIResult } from '@/types/health';

// ─── Styled components ────────────────────────────────────────────────────────

const Row = styled.div<{ $clickable?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border-separator);
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  &:hover { background: ${({ $clickable }) => ($clickable ? 'var(--color-surface-hover)' : 'transparent')}; }
  &:last-child { border-bottom: none; }
`;

const StatusCol = styled.div`
  flex-shrink: 0;
  width: 72px;
`;

const LabelCol = styled.div`
  flex: 1;
  min-width: 0;
`;

const ValueCol = styled.div`
  flex-shrink: 0;
  text-align: right;
`;

const SourceBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-separator);
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
`;

const OriginChip = styled.span<{ $origin: 'connected' | 'seed' | 'own' | 'unavailable' }>`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 11px;
  white-space: nowrap;
  flex-shrink: 0;
  background: ${({ $origin }) => $origin === 'connected'
    ? 'var(--color-pill-bg-green)'
    : $origin === 'unavailable'
    ? 'var(--color-surface-secondary)'
    : 'var(--color-pill-bg-blue)'};
  color: ${({ $origin }) => $origin === 'connected'
    ? 'var(--color-pill-text-green)'
    : $origin === 'unavailable'
    ? 'var(--color-text-secondary)'
    : 'var(--color-pill-text-blue)'};
  border: 1px solid ${({ $origin }) => $origin === 'connected'
    ? 'var(--color-pill-border-green)'
    : $origin === 'unavailable'
    ? 'var(--color-border-separator)'
    : 'var(--color-pill-border-blue)'};
`;

const Reasons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 2px;
`;

// ─── Component ────────────────────────────────────────────────────────────────

interface KPIRowProps {
  kpi: KPIResult;
  onClick?: () => void;
  showReasons?: boolean;
  showSource?: boolean;
}

export default function KPIRow({ kpi, onClick, showReasons = false, showSource = true }: KPIRowProps) {
  return (
    <Row $clickable={!!onClick} onClick={onClick}>
      <StatusCol>
        <KPIStatusChip status={kpi.status} />
      </StatusCol>

      <LabelCol>
        <Typography intent="body" style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
          {kpi.label}
        </Typography>
        {showReasons && kpi.reasons.length > 0 && (
          <Reasons>
            {kpi.reasons.map((r, i) => (
              <Typography key={i} intent="small" style={{ color: 'var(--color-text-secondary)' }}>
                {r}
              </Typography>
            ))}
          </Reasons>
        )}
      </LabelCol>

      <ValueCol>
        <Typography intent="body" style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
          {kpi.displayValue}
        </Typography>
      </ValueCol>

      {showSource && (
        <SourceBadge title={`Data source: ${kpi.sourceLabel}`}>
          {kpi.dataSource === 'connected' && <LinkIcon size="sm" />}
          {kpi.sourceLabel}
        </SourceBadge>
      )}
      {showSource && kpi.dataSource !== 'unavailable' && (
        <OriginChip $origin={kpi.dataSource} title={kpi.dataSource === 'connected' ? 'Automated data source' : 'Manual / seed data'}>
          {kpi.dataSource === 'connected'
            ? <><Connect size="sm" /> Auto</>
            : <><Person size="sm" /> Manual</>
          }
        </OriginChip>
      )}
    </Row>
  );
}
