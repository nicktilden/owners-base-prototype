/**
 * APP PICKER POPOVER
 * Flyout menu for switching between Procore apps/integrations.
 * Ported directly from stage-based-workflows — no context changes needed.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Button, Search, Typography } from '@procore/core-react';
import styled from 'styled-components';

const APPS = [
  { id: 'laborchart', name: 'LaborChart' },
  { id: 'analytics-project-mgmt-reports', name: 'Analytics Project Mgmt Reports' },
  { id: 'smartpm', name: 'SmartPM' },
  { id: 'strutionsite', name: 'StrutionSite' },
  { id: 'estimating', name: 'Estimating' },
];

const Popover = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  width: 300px;
  background: var(--color-surface-primary);
  border-radius: 8px;
  box-shadow: 0px 4px 28px 0px var(--color-shadow-strong);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1300;
  padding: 16px 0;
  gap: 8px;
  color: var(--color-text-primary);

  html[data-color-scheme="dark"] & span[class],
  html[data-color-scheme="dark"] & p[class] {
    color: var(--color-text-primary);
  }
`;

const SearchWrap = styled.div`
  padding: 0 16px;
  flex-shrink: 0;
`;

const MenuScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  max-height: 224px;
  padding: 8px 0;
`;

const SectionLabel = styled.div`
  padding: 4px 16px 4px 18px;
`;

const AppRow = styled.button`
  display: block;
  width: 100%;
  padding: 4px 16px 4px 18px;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.12s;
  &:hover { background: var(--color-surface-hover); }
`;

const Divider = styled.div`
  height: 1px;
  background: var(--color-border-separator);
  flex-shrink: 0;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 16px 0;
  flex-shrink: 0;
`;

interface AppPickerPopoverProps {
  anchorRef: React.RefObject<HTMLElement>;
  onClose: () => void;
}

export default function AppPickerPopover({ anchorRef, onClose }: AppPickerPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');

  const filteredApps = query.trim()
    ? APPS.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()))
    : APPS;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [anchorRef, onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <Popover ref={popoverRef} role="dialog" aria-label="Select app">
      <SearchWrap>
        <Search
          className="i_search"
          placeholder="Search Apps..."
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          onClear={() => setQuery('')}
          autoFocus
        />
      </SearchWrap>

      <MenuScroll>
        <SectionLabel>
          <Typography intent="body" style={{ fontWeight: 600 }}>Apps</Typography>
        </SectionLabel>
        {filteredApps.map((app) => (
          <AppRow key={app.id} onClick={onClose}>
            <Typography intent="body">{app.name}</Typography>
          </AppRow>
        ))}
        {filteredApps.length === 0 && (
          <SectionLabel>
            <Typography intent="body" style={{ color: 'var(--color-text-secondary)' }}>
              No apps match &ldquo;{query}&rdquo;
            </Typography>
          </SectionLabel>
        )}
      </MenuScroll>

      <Divider />

      <Actions>
        <Button variant="secondary" className="b_secondary" data-variant="secondary" style={{ width: '100%' }}>Marketplace</Button>
        <Button variant="secondary" className="b_secondary" data-variant="secondary" style={{ width: '100%' }}>App Management</Button>
      </Actions>
    </Popover>
  );
}
