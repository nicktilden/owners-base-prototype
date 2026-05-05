/**
 * RISK SCORECARD SKELETON — content area only.
 *
 * Mirrors the layout of RiskScorecardCard's content:
 *   KPICenterWrap → KPIGrid (4 equal columns) → 4 KPITile placeholders
 *
 * Each tile placeholder:
 *   • Title row: shimmer label + small circle (info icon)
 *   • Large metric value line (24px-ish)
 *   • Trend row: pill shimmer + "vs Prior Month" text shimmer
 *
 * Slot inside: <HubCardSkeleton hasControls={false} actionCount={2}>
 */

import React from 'react';
import styled from 'styled-components';
import { SkeletonLine, SkeletonBlock, SkeletonCircle } from './SkeletonPrimitives';

// ─── Mirrors KPICenterWrap ────────────────────────────────────────────────────

const CenterWrap = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
`;

// ─── Mirrors KPIGrid ──────────────────────────────────────────────────────────

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  width: 100%;
`;

// ─── Mirrors KPITile ──────────────────────────────────────────────────────────

const Tile = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid var(--color-border-separator);
  border-radius: 8px;
  background: var(--color-surface-card);
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TrendRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// ─── Title label widths vary per tile ────────────────────────────────────────

const TILES = [
  { label: '80%' },
  { label: '72%' },
  { label: '88%' },
  { label: '76%' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function RiskScorecardSkeleton() {
  return (
    <CenterWrap>
      <Grid>
        {TILES.map((cfg, i) => (
          <Tile key={i}>
            {/* Title + info icon */}
            <TitleRow>
              <SkeletonLine width={cfg.label} height={12} />
              <SkeletonCircle size={14} />
            </TitleRow>

            {/* Large metric value */}
            <SkeletonLine width="55%" height={24} />

            {/* Trend pill + label */}
            <TrendRow>
              <SkeletonBlock width="52px" height={20} radius={10} />
              <SkeletonLine width="65px" height={10} />
            </TrendRow>
          </Tile>
        ))}
      </Grid>
    </CenterWrap>
  );
}
