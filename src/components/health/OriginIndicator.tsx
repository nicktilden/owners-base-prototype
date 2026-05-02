/**
 * ORIGIN INDICATOR (v7)
 * 12px icon encoding how a risk signal was generated.
 * 4 states: automated (filled circle), manual (outlined circle),
 * mixed (half-filled circle), connected_partner (filled circle + bracket).
 */

import React from 'react';
import styled from 'styled-components';
import { Tooltip } from '@procore/core-react';

type OriginState = 'automated' | 'manual' | 'mixed' | 'connected_partner';

const ORIGIN_LABELS: Record<OriginState, string> = {
  automated:         'Automated — detected by rules',
  manual:            'Manual — entered by a team member',
  mixed:             'Mixed — automated + manual signals',
  connected_partner: 'Connected partner — sourced from GC Procore account',
};

const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
`;

// SVG icons at 12px for the 4 origin states
function AutomatedIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="5" fill="var(--color-text-secondary)" />
    </svg>
  );
}

function ManualIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="4.5" stroke="var(--color-text-secondary)" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function MixedIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 1 A5 5 0 0 1 6 11 Z" fill="var(--color-text-secondary)" />
      <circle cx="6" cy="6" r="4.5" stroke="var(--color-text-secondary)" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function ConnectedPartnerIcon() {
  return (
    <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="5" fill="var(--color-action-primary)" />
      <path d="M11 3 L13 3 L13 9 L11 9" stroke="var(--color-action-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

interface OriginIndicatorProps {
  origin: OriginState;
  showTooltip?: boolean;
  className?: string;
}

export default function OriginIndicator({
  origin,
  showTooltip = true,
  className,
}: OriginIndicatorProps) {
  const label = ORIGIN_LABELS[origin];

  const icon = (
    <IconWrapper className={className} aria-label={label}>
      {origin === 'automated'         && <AutomatedIcon />}
      {origin === 'manual'            && <ManualIcon />}
      {origin === 'mixed'             && <MixedIcon />}
      {origin === 'connected_partner' && <ConnectedPartnerIcon />}
    </IconWrapper>
  );

  if (!showTooltip) return icon;

  return (
    <Tooltip overlay={label} placement="top">
      {icon}
    </Tooltip>
  );
}
