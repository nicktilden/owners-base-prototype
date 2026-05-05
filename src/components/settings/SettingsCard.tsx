/**
 * SETTINGS CARD
 * A navigable card in the Settings directory. 88px tall.
 * Icon + title + description + optional badge.
 */

import React from 'react';
import styled from 'styled-components';
import { Typography } from '@procore/core-react';
import { ChevronRight } from '@procore/core-icons';

const Card = styled.button`
  display: grid;
  grid-template-columns: 40px 1fr 20px;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-default);
  border-radius: 8px;
  box-shadow: 0 1px 3px var(--color-shadow);
  text-align: left;
  cursor: pointer;
  width: 100%;
  min-height: 72px;
  transition: box-shadow 0.12s, border-color 0.12s;

  &:hover {
    box-shadow: 0 2px 8px var(--color-shadow);
    border-color: var(--color-border-strong);
  }

  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }
`;

const IconWrap = styled.div<{ $color?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${({ $color }) => $color ?? 'var(--color-surface-secondary)'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-icon-secondary);
`;

const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const Title = styled(Typography)`
  font-weight: 600;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Desc = styled(Typography)`
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

interface SettingsCardProps {
  icon: React.ReactNode;
  iconColor?: string;
  title: string;
  description: string;
  onClick: () => void;
  badge?: string;
}

export default function SettingsCard({ icon, iconColor, title, description, onClick, badge }: SettingsCardProps) {
  return (
    <Card onClick={onClick} aria-label={`${title} settings`}>
      <IconWrap $color={iconColor}>
        {icon}
      </IconWrap>
      <TextBlock>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Title intent="body">{title}</Title>
          {badge && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: 'var(--color-pill-bg-blue)', color: 'var(--color-pill-text-blue)', border: '1px solid var(--color-pill-border-blue)', flexShrink: 0 }}>
              {badge}
            </span>
          )}
        </div>
        <Desc intent="small">{description}</Desc>
      </TextBlock>
      <ChevronRight size="sm" style={{ color: 'var(--color-icon-secondary)', flexShrink: 0 }} />
    </Card>
  );
}
