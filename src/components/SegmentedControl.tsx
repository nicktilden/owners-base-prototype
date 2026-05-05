/**
 * SEGMENTED CONTROL
 * A theme-aware button group for switching between mutually exclusive views.
 *
 * Supports:
 *   - icon only:  <Segment icon={<ViewRows />} tooltip="List" />
 *   - text only:  <Segment label="Small" />
 *   - icon+text:  <Segment icon={<ViewRows />} label="List" />
 *   - up to 4 segments
 *
 * Styling uses only CSS variables — no dynamic class names.
 * Selected state is expressed via data-selected="true" attribute.
 */

import React from 'react';
import styled from 'styled-components';
import { Tooltip } from '@procore/core-react';

// ─── Styled primitives ────────────────────────────────────────────────────────

const Wrapper = styled.div`
  display: inline-flex;
  align-items: stretch;
  border: 1px solid var(--color-border-default);
  border-radius: 6px;
  overflow: hidden;
  background: var(--color-surface-secondary);

  /* Remove the divider line on the button immediately after a selected segment */
  button[data-selected='true'] + button {
    box-shadow: none;
  }
`;

const Seg = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: none;
  /* Inset shadow acts as the left divider — avoids double-border issues */
  box-shadow: inset 1px 0 0 var(--color-border-default);
  padding: 0 10px;
  min-height: 32px;
  font-size: 13px;
  font-family: inherit;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: var(--color-surface-secondary);
  color: var(--color-text-secondary);
  transition: background 0.12s ease, color 0.12s ease;

  /* First segment has no left divider */
  &:first-child {
    box-shadow: none;
  }

  /* Icon-only segments get tighter horizontal padding */
  &[data-icon-only='true'] {
    padding: 0 8px;
  }

  &:hover:not([data-selected='true']):not(:disabled) {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  &[data-selected='true'] {
    background: var(--color-action-primary);
    color: var(--color-text-on-action);
    /* Selected segment suppresses its own divider line */
    box-shadow: none;
    cursor: default;
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: -2px;
    z-index: 1;
    position: relative;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  svg {
    flex-shrink: 0;
  }
`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface SegmentProps {
  /** Mark this segment as active */
  selected?: boolean;
  onClick?: () => void;
  /** Icon element — renders left of label (or alone if no label) */
  icon?: React.ReactNode;
  /** Text label — renders right of icon (or alone if no icon) */
  label?: string;
  /** Native title tooltip (also used as aria-label for icon-only segments) */
  tooltip?: string;
  disabled?: boolean;
}

// ─── Segment ─────────────────────────────────────────────────────────────────

function Segment({ selected = false, onClick, icon, label, tooltip, disabled }: SegmentProps) {
  const iconOnly = !!icon && !label;

  const seg = (
    <Seg
      type="button"
      data-selected={selected ? 'true' : 'false'}
      data-icon-only={iconOnly ? 'true' : 'false'}
      onClick={onClick}
      aria-label={iconOnly ? (tooltip ?? label) : (tooltip ?? label)}
      aria-pressed={selected}
      disabled={disabled}
    >
      {icon}
      {label && <span>{label}</span>}
    </Seg>
  );

  if (tooltip) {
    return (
      <Tooltip overlay={tooltip} trigger={['hover', 'focus']} placement="bottom">
        {seg}
      </Tooltip>
    );
  }

  return seg;
}

// ─── SegmentedControl ─────────────────────────────────────────────────────────

function SegmentedControl({ children }: { children: React.ReactNode }) {
  return (
    <Wrapper role="group">
      {children}
    </Wrapper>
  );
}

SegmentedControl.Segment = Segment;

export default SegmentedControl;
