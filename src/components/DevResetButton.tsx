/**
 * DEV RESET BUTTON
 * Floating button that clears all "owners_" localStorage keys and reloads
 * the page, resetting the prototype back to its seed data state.
 *
 * Positioned fixed at the lower-right corner so it is always accessible
 * during customer demos without interfering with the main UI.
 */

import React from 'react';
import { Tooltip } from '@procore/core-react';
import { Ban } from '@procore/core-icons';
import styled from 'styled-components';
import { usePortfolioStore } from '@/hooks/usePortfolioStore';

const ResetBtn = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid var(--color-border-default);
  background: var(--color-surface-card);
  box-shadow: 0 2px 8px 0 var(--color-shadow);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  transition: background 0.15s, color 0.15s, border-color 0.15s;

  &:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
    border-color: var(--color-border-default);
  }

  &:active {
    background: var(--color-surface-active);
  }
`;

export default function DevResetButton() {
  const { resetStore } = usePortfolioStore();

  function handleReset() {
    resetStore();
    window.location.reload();
  }

  return (
    <Tooltip
      trigger="hover"
      placement="left"
      overlay={
        <Tooltip.Content>Reset demo data</Tooltip.Content>
      }
    >
      <ResetBtn
        aria-label="Reset demo data"
        onClick={handleReset}
      >
        <Ban size="sm" />
      </ResetBtn>
    </Tooltip>
  );
}
