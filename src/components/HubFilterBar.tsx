/**
 * HUB FILTER BAR
 * Full-width filter bar for hub views. Matches Figma design (node 464:244866).
 * Shows when the Filter toggle button in the hub header is active.
 *
 * Layout:
 *   Left:  [Apply Filter Set (dropdown)] | [Stage] [Program] [Region] [Project Manager] [+ More Filters]
 *   Right: [Clear All (tertiary, disabled when no filters)]
 */

import React, { useEffect, useRef, useState } from 'react';
import { Button, MenuImperative, Select, ToggleButton } from '@procore/core-react';
import { ChevronDown, Plus } from '@procore/core-icons';
import styled from 'styled-components';
import { useHubFilters, toggleFilterValue } from '@/context/HubFilterContext';
import { PROJECT_STAGES, PROJECT_REGIONS, sampleProjectRows } from '@/data/projects';
import type { ProjectStage, ProjectRegion } from '@/data/projects';

// ─── Styled components ─────────────────────────────────────────────────────────

const FilterBarWrap = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--color-surface-primary);
  border-radius: 8px;
  box-shadow: 0px 2px 6px 0px var(--color-shadow);
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
`;

const FilterBarLeft = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

const FilterBarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const VerticalSeparator = styled.div`
  width: 1px;
  height: 36px;
  background: var(--color-border-separator);
  flex-shrink: 0;
`;

// ─── Filter Set trigger button ──────────────────────────────────────────────

const FilterSetTrigger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-separator);
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  color: var(--color-text-primary);
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: var(--color-surface-hover);
  }

  &[aria-expanded='true'] {
    border-color: var(--color-border-focus);
    box-shadow: 0 0 0 2px rgba(13, 95, 203, 0.2);
  }
`;

// ─── Saved filter set data (prototype) ──────────────────────────────────────

const SAVED_FILTER_SETS = [
  'Active Planning Pipeline',
  'Critical Schedule Status',
  'Data Centers View',
  'Eastern (MW, SE, NE) Regions',
  'High Risk Score',
  'Overall Health Status',
  'PM Oversight',
];

// ─── Filter options ─────────────────────────────────────────────────────────────

const STAGE_OPTIONS: { value: ProjectStage; label: string }[] = PROJECT_STAGES.map((s) => ({
  value: s,
  label: s,
}));

const PROGRAM_OPTIONS: string[] = [...new Set(sampleProjectRows.map((p) => p.program))].sort(
  (a, b) => a.localeCompare(b)
);

const REGION_OPTIONS: ProjectRegion[] = [...new Set(PROJECT_REGIONS)].sort(
  (a, b) => a.localeCompare(b)
) as ProjectRegion[];

const PM_OPTIONS: string[] = [...new Set(sampleProjectRows.map((p) => p.projectManager))].sort(
  (a, b) => a.localeCompare(b)
);

// ─── Filter Set Dropdown ────────────────────────────────────────────────────

function FilterSetDropdown() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const filtered = SAVED_FILTER_SETS.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase())
  );

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div ref={wrapRef} style={{ position: 'relative', flexShrink: 0 }}>
      <FilterSetTrigger
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Apply Filter Set
        <ChevronDown size="sm" style={{ flexShrink: 0, opacity: 0.6 }} />
      </FilterSetTrigger>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            width: 260,
            borderRadius: 8,
            boxShadow: '0 4px 12px 0 rgba(0,0,0,0.2)',
            zIndex: 200,
            overflow: 'hidden',
          }}
        >
          <MenuImperative className="menu_container">
            <MenuImperative.Search
              className="i_search"
              placeholder="Search"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
            <MenuImperative.Options>
              {filtered.length > 0 ? (
                filtered.map((name) => (
                  <MenuImperative.Item
                    key={name}
                    onClick={() => setOpen(false)}
                  >
                    {name}
                  </MenuImperative.Item>
                ))
              ) : (
                <div style={{ padding: '10px 16px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  No filter sets found
                </div>
              )}
            </MenuImperative.Options>
            <MenuImperative.Footer>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 8 }}>
                <Button
                  className="b_tertiary"
                  variant="tertiary"
                  size="sm"
                  onClick={() => setOpen(false)}
                >
                  Clear All
                </Button>
                <Button
                  className="b_secondary"
                  variant="secondary"
                  size="sm"
                  icon={<Plus />}
                  onClick={() => setOpen(false)}
                >
                  Create Filter Set
                </Button>
              </div>
            </MenuImperative.Footer>
          </MenuImperative>
        </div>
      )}
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function HubFilterBar() {
  const { filters, setFilters, clearFilters, hasActiveFilters } = useHubFilters();

  function filterLabel(arr: string[], singular: string): string | undefined {
    if (arr.length === 0) return undefined;
    if (arr.length === 1) return arr[0];
    return `${arr.length} ${singular}`;
  }

  return (
    <FilterBarWrap className="card_container">
      <FilterBarLeft>
        {/* Apply Filter Set — saved filter set dropdown */}
        <FilterSetDropdown />

        <VerticalSeparator />

        {/* Stage */}
        <Select
          aria-label="Stage filter"
          placeholder="Stage"
          label={filterLabel(filters.stage, 'stages')}
          onSelect={(s) =>
            setFilters((prev) => ({
              ...prev,
              stage: toggleFilterValue(prev.stage, s.item as ProjectStage),
            }))
          }
          onClear={() => setFilters((prev) => ({ ...prev, stage: [] }))}
          style={{ minWidth: 130, maxWidth: 190 }}
        >
          {STAGE_OPTIONS.map((o) => (
            <Select.Option key={o.value} value={o.value} selected={filters.stage.includes(o.value)}>
              {o.label}
            </Select.Option>
          ))}
        </Select>

        {/* Program */}
        <Select
          aria-label="Program filter"
          placeholder="Program"
          label={filterLabel(filters.program, 'programs')}
          onSelect={(s) =>
            setFilters((prev) => ({
              ...prev,
              program: toggleFilterValue(prev.program, s.item as string),
            }))
          }
          onClear={() => setFilters((prev) => ({ ...prev, program: [] }))}
          style={{ minWidth: 130, maxWidth: 190 }}
        >
          {PROGRAM_OPTIONS.map((o) => (
            <Select.Option key={o} value={o} selected={filters.program.includes(o)}>
              {o}
            </Select.Option>
          ))}
        </Select>

        {/* Region */}
        <Select
          aria-label="Region filter"
          placeholder="Region"
          label={filterLabel(filters.region, 'regions')}
          onSelect={(s) =>
            setFilters((prev) => ({
              ...prev,
              region: toggleFilterValue(prev.region, s.item as ProjectRegion),
            }))
          }
          onClear={() => setFilters((prev) => ({ ...prev, region: [] }))}
          style={{ minWidth: 140, maxWidth: 190 }}
        >
          {REGION_OPTIONS.map((o) => (
            <Select.Option key={o} value={o} selected={filters.region.includes(o)}>
              {o}
            </Select.Option>
          ))}
        </Select>

        {/* Project Manager */}
        <Select
          aria-label="Project Manager filter"
          placeholder="Project Manager"
          label={filterLabel(filters.projectManager, 'PMs')}
          onSelect={(s) =>
            setFilters((prev) => ({
              ...prev,
              projectManager: toggleFilterValue(prev.projectManager, s.item as string),
            }))
          }
          onClear={() => setFilters((prev) => ({ ...prev, projectManager: [] }))}
          style={{ minWidth: 160, maxWidth: 190 }}
        >
          {PM_OPTIONS.map((o) => (
            <Select.Option key={o} value={o} selected={filters.projectManager.includes(o)}>
              {o}
            </Select.Option>
          ))}
        </Select>

        {/* More Filters toggle — future expansion */}
        <ToggleButton className="b_toggle" icon={<Plus />}>More Filters</ToggleButton>
      </FilterBarLeft>

      <FilterBarRight>
        <Button
          className="b_tertiary"
          variant="tertiary"
          disabled={!hasActiveFilters}
          onClick={clearFilters}
        >
          Clear All
        </Button>
      </FilterBarRight>
    </FilterBarWrap>
  );
}
