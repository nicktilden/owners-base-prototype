/**
 * AI DAILY PLANNER SKELETON — content area only.
 *
 * Mirrors the layout of AIDailyPlannerCard:
 *   • Alert banner (rounded rect with 2 shimmer lines inside)
 *   • 5 brief rows — each: circle icon | title line + badge circle | subtitle line
 *
 * Slot inside: <HubCardSkeleton hasControls={false} actionCount={2}>
 */

import React from 'react';
import styled from 'styled-components';
import { SkeletonLine, SkeletonBlock, SkeletonCircle } from './SkeletonPrimitives';

// ─── Alert banner placeholder ─────────────────────────────────────────────────

const BannerSkeleton = styled.div`
  border-radius: 4px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
  flex-shrink: 0;
  /* Use the brand-surface tint so the shape is visible but shimmer lines pop */
  background: var(--color-brand-surface, #fff8f0);
`;

// ─── Row placeholder — mirrors BriefRow ──────────────────────────────────────

const RowSkeleton = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-bottom: 1px solid var(--color-border-separator);

  &:last-child {
    border-bottom: none;
  }
`;

const RowBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
`;

const TitleLine = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

// ─── Row configs — vary widths so rows look natural ───────────────────────────

const ROWS = [
  { title: '55%', subtitle: '70%' },
  { title: '50%', subtitle: '65%' },
  { title: '45%', subtitle: '75%' },
  { title: '60%', subtitle: '55%' },
  { title: '52%', subtitle: '68%' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AIDailyPlannerSkeleton() {
  return (
    <>
      {/* Alert banner */}
      <BannerSkeleton>
        <SkeletonLine width="90px" height={12} />
        <SkeletonLine width="75%" height={11} />
      </BannerSkeleton>

      {/* Brief rows */}
      {ROWS.map((cfg, i) => (
        <RowSkeleton key={i}>
          {/* IconWrap — rounded circle */}
          <SkeletonCircle size={36} />

          {/* Row text content */}
          <RowBody>
            <TitleLine>
              <SkeletonLine width={cfg.title} height={12} />
              {/* Count badge */}
              <SkeletonBlock width="20px" height={20} radius={10} />
            </TitleLine>
            <SkeletonLine width={cfg.subtitle} height={10} />
          </RowBody>
        </RowSkeleton>
      ))}
    </>
  );
}
