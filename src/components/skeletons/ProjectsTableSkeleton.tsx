/**
 * PROJECTS TABLE SKELETON — rows view.
 *
 * Standalone skeleton (not wrapped in HubCardSkeleton) because
 * ProjectsTableCard uses DetailPage.Card, not HubCardFrame.
 *
 * Mirrors:
 *   ToolbarRow (search + filter | groupby + segmented control + configure)
 *   GridArea (640px) → column header row + 12 data rows
 *
 * Approximate column layout matches portfolioColumnDefs:
 *   Name (flex 1) | Program | Stage | Priority | Health | Start | End | Actions
 */

import React from 'react';
import styled from 'styled-components';
import { SkeletonLine, SkeletonBlock, SkeletonCircle } from './SkeletonPrimitives';

// ─── Toolbar ──────────────────────────────────────────────────────────────────

const ToolbarRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 8px;
  gap: 8px;
`;

const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

// ─── Grid area ────────────────────────────────────────────────────────────────

const GridArea = styled.div`
  display: flex;
  flex-direction: column;
  height: 640px;
  border: 1px solid var(--color-border-default);
  border-radius: 0;
  overflow: hidden;
`;

// Column header — approximate widths from portfolioColumnDefs
const ColHeader = styled.div`
  display: grid;
  grid-template-columns: minmax(180px, 1fr) 130px 110px 100px 120px 100px 100px 60px;
  height: 36px;
  align-items: center;
  padding: 0 12px;
  gap: 8px;
  background: var(--color-surface-secondary);
  border-bottom: 2px solid var(--color-border-separator);
  flex-shrink: 0;
`;

const DataRow = styled.div<{ $even?: boolean }>`
  display: grid;
  grid-template-columns: minmax(180px, 1fr) 130px 110px 100px 120px 100px 100px 60px;
  height: 44px;
  align-items: center;
  padding: 0 12px;
  gap: 8px;
  background: ${({ $even }) =>
    $even ? 'var(--color-surface-primary)' : 'var(--color-surface-secondary)'};
  border-bottom: 1px solid var(--color-border-separator);
  flex-shrink: 0;
`;

// ─── Row widths vary to look natural ─────────────────────────────────────────

const ROWS = [
  { name: '68%', program: '55%', stage: '60%', priority: '50%', health: '65px', date1: '65%', date2: '65%' },
  { name: '55%', program: '70%', stage: '50%', priority: '65%', health: '65px', date1: '70%', date2: '60%' },
  { name: '75%', program: '45%', stage: '70%', priority: '50%', health: '65px', date1: '55%', date2: '70%' },
  { name: '60%', program: '60%', stage: '55%', priority: '70%', health: '65px', date1: '65%', date2: '55%' },
  { name: '80%', program: '50%', stage: '65%', priority: '55%', health: '65px', date1: '70%', date2: '65%' },
  { name: '50%', program: '65%', stage: '60%', priority: '60%', health: '65px', date1: '60%', date2: '70%' },
  { name: '65%', program: '55%', stage: '70%', priority: '45%', health: '65px', date1: '65%', date2: '60%' },
  { name: '72%', program: '70%', stage: '50%', priority: '65%', health: '65px', date1: '55%', date2: '65%' },
  { name: '58%', program: '40%', stage: '60%', priority: '70%', health: '65px', date1: '70%', date2: '55%' },
  { name: '70%', program: '60%', stage: '55%', priority: '50%', health: '65px', date1: '60%', date2: '70%' },
  { name: '62%', program: '65%', stage: '65%', priority: '60%', health: '65px', date1: '65%', date2: '60%' },
  { name: '78%', program: '50%', stage: '70%', priority: '55%', health: '65px', date1: '70%', date2: '65%' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectsTableSkeleton() {
  return (
    <>
      {/* Toolbar */}
      <ToolbarRow>
        <ToolbarLeft>
          {/* Search input */}
          <SkeletonBlock width="220px" height={32} radius={4} />
          {/* Filter toggle */}
          <SkeletonBlock width="88px" height={32} radius={4} />
        </ToolbarLeft>
        <ToolbarRight>
          {/* Group by select */}
          <SkeletonBlock width="200px" height={32} radius={4} />
          {/* Segmented control (3 segments) */}
          <SkeletonBlock width="96px" height={32} radius={4} />
          {/* Configure toggle */}
          <SkeletonBlock width="100px" height={32} radius={4} />
        </ToolbarRight>
      </ToolbarRow>

      {/* Grid */}
      <GridArea>
        {/* Column header */}
        <ColHeader>
          <SkeletonLine width="60px" height={11} />
          <SkeletonLine width="55px" height={11} />
          <SkeletonLine width="40px" height={11} />
          <SkeletonLine width="45px" height={11} />
          <SkeletonLine width="75px" height={11} />
          <SkeletonLine width="55px" height={11} />
          <SkeletonLine width="50px" height={11} />
          <span />
        </ColHeader>

        {/* Data rows */}
        {ROWS.map((cfg, i) => (
          <DataRow key={i} $even={i % 2 === 0}>
            {/* Project name — link style line */}
            <SkeletonLine width={cfg.name} height={12} />
            {/* Program */}
            <SkeletonLine width={cfg.program} height={11} />
            {/* Stage — pill-ish */}
            <SkeletonBlock width={cfg.stage} height={20} radius={10} />
            {/* Priority — pill-ish */}
            <SkeletonBlock width={cfg.priority} height={20} radius={10} />
            {/* Project Health — pill with dot */}
            <SkeletonBlock width={cfg.health} height={22} radius={11} />
            {/* Start date */}
            <SkeletonLine width={cfg.date1} height={11} />
            {/* End date */}
            <SkeletonLine width={cfg.date2} height={11} />
            {/* Actions */}
            <SkeletonCircle size={20} />
          </DataRow>
        ))}
      </GridArea>
    </>
  );
}
