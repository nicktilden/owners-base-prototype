/**
 * MY OPEN ITEMS SKELETON — content area only.
 *
 * Mirrors the exact table grid of MyOpenItemsCard:
 *   grid-template-columns: 100px 1fr 110px 100px 36px
 *   (Type | Item | Project | Due Date | Actions)
 *
 * Shows a shimmer table header + 6 shimmer data rows.
 * Designed to slot inside <HubCardSkeleton hasControls controlCount={2} actionCount={3}>
 */

import React from 'react';
import styled from 'styled-components';
import { SkeletonLine, SkeletonCircle, SkeletonBlock } from './SkeletonPrimitives';

// ─── Mirror of ItemTable + TableHeader + ItemRow ──────────────────────────────

const SkeletonTable = styled.div`
  width: 100%;
`;

const SkeletonTableHeader = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr 110px 100px 36px;
  padding: 0 8px;
  height: 28px;
  align-items: center;
  border-bottom: 1px solid var(--color-border-separator);
  gap: 8px;
`;

const SkeletonRow = styled.div<{ $even?: boolean }>`
  display: grid;
  grid-template-columns: 100px 1fr 110px 100px 36px;
  padding: 0 8px;
  min-height: 44px;
  align-items: center;
  border-bottom: 1px solid var(--color-border-separator);
  gap: 8px;
  background: ${({ $even }) =>
    $even ? 'var(--color-surface-primary)' : 'var(--color-surface-secondary)'};
`;

// Icon + short label — mirrors TypeCell
const TypeCellSkeleton = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

// Action dot — mirrors the EllipsisVertical icon button
const ActionCellSkeleton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

// ─── Row widths vary slightly to look natural ─────────────────────────────────

const ROW_CONFIGS = [
  { desc: '75%', project: '70%', date: '60%' },
  { desc: '60%', project: '80%', date: '55%' },
  { desc: '85%', project: '65%', date: '70%' },
  { desc: '50%', project: '75%', date: '60%' },
  { desc: '70%', project: '55%', date: '65%' },
  { desc: '65%', project: '80%', date: '50%' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function MyOpenItemsSkeleton() {
  return (
    <SkeletonTable>
      {/* Table header row — column label shimmers */}
      <SkeletonTableHeader>
        <SkeletonLine width="55px" height={10} />
        <SkeletonLine width="40px" height={10} />
        <SkeletonLine width="50px" height={10} />
        <SkeletonLine width="55px" height={10} />
        <span />
      </SkeletonTableHeader>

      {/* Data rows */}
      {ROW_CONFIGS.map((cfg, i) => (
        <SkeletonRow key={i} $even={i % 2 === 0}>
          {/* Type — icon circle + short label */}
          <TypeCellSkeleton>
            <SkeletonCircle size={16} />
            <SkeletonLine width="55px" height={11} />
          </TypeCellSkeleton>

          {/* Item description — long line */}
          <SkeletonLine width={cfg.desc} height={11} />

          {/* Project name */}
          <SkeletonLine width={cfg.project} height={11} />

          {/* Due date */}
          <SkeletonLine width={cfg.date} height={11} />

          {/* Actions — small circle */}
          <ActionCellSkeleton>
            <SkeletonCircle size={20} />
          </ActionCellSkeleton>
        </SkeletonRow>
      ))}
    </SkeletonTable>
  );
}
