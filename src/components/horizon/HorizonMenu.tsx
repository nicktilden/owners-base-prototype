import React, { useRef, useState, useEffect } from 'react';
import { Typography } from '@procore/core-react';
import { CaretDown, CaretUp } from '@procore/core-icons';
import styled from 'styled-components';
import { useHorizon } from '@/context/HorizonContext';
import { RELEASE_FILTERS, RELEASE_TIMEFRAME_LABELS, ReleaseFilter } from '@/types/features';

const PickerButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-nav-surface);
  border: none;
  color: var(--color-nav-text);
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  flex-shrink: 0;
  transition: background 0.15s;
  min-width: 0;
  &:hover { background: var(--color-nav-surface-hover); }
`;

const PickerLabels = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
`;

const DropdownPanel = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 1100;
  background: var(--color-surface-card);
  border: 1px solid var(--color-border-default);
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
  min-width: 140px;
  padding: 4px 0;
  overflow: hidden;
`;

const MenuItem = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 14px;
  background: ${p => p.$selected ? 'var(--color-surface-hover)' : 'transparent'};
  border: none;
  cursor: pointer;
  text-align: left;
  color: var(--color-text-primary);
  font-size: 14px;
  transition: background 0.1s;
  &:hover { background: var(--color-surface-hover); }
`;

const Checkmark = styled.span`
  color: var(--color-action-primary);
  font-size: 12px;
  margin-left: 10px;
`;

const Wrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export function HorizonMenu() {
  const { filter, setFilter } = useHorizon();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <Wrap ref={wrapRef}>
      <PickerButton
        aria-label="Select horizon"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        <PickerLabels>
          <Typography color="white" intent="small" style={{ opacity: 0.6, lineHeight: 1 }}>
            Horizon
          </Typography>
          <Typography color="white" intent="body" style={{ fontWeight: 600, lineHeight: 1.3 }}>
            {RELEASE_TIMEFRAME_LABELS[filter].toUpperCase()}
          </Typography>
        </PickerLabels>
        {open ? <CaretUp size="sm" /> : <CaretDown size="sm" />}
      </PickerButton>

      {open && (
        <DropdownPanel role="listbox" aria-label="Horizon">
          {RELEASE_FILTERS.map(f => (
            <MenuItem
              key={f}
              role="option"
              aria-selected={f === filter}
              $selected={f === filter}
              onClick={() => { setFilter(f as ReleaseFilter); setOpen(false); }}
            >
              {RELEASE_TIMEFRAME_LABELS[f]}
              {f === filter && <Checkmark>✓</Checkmark>}
            </MenuItem>
          ))}
        </DropdownPanel>
      )}
    </Wrap>
  );
}
