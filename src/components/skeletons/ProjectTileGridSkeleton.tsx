/**
 * PROJECT TILE GRID SKELETON — tiles view.
 *
 * Mirrors the TileGrid + ProjectTileCard layout used when viewMode === "tiles":
 *   - 3-column grid, max-height 640px
 *   - Each tile card:
 *       CardHeader: 56×56 image block | project number + name + meta | menu circle
 *       AttributeGrid: 4×2 grid of cells (icon row + value + label each)
 *       CardFooter: PM name | stage pill
 *
 * Shows 6 skeleton tiles (fills 2 full rows).
 */

import React from 'react';
import styled from 'styled-components';
import { SkeletonLine, SkeletonBlock, SkeletonCircle } from './SkeletonPrimitives';

// ─── Mirrors TileGrid ─────────────────────────────────────────────────────────

const TileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 4px 0 16px;
  max-height: 640px;
  overflow: hidden;
`;

// ─── Mirrors Card ─────────────────────────────────────────────────────────────

const Card = styled.div`
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-separator);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

// ─── CardHeader ───────────────────────────────────────────────────────────────

const CardHeader = styled.div`
  padding: 16px 16px 12px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const HeaderText = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

// ─── AttributeGrid — 4×2 ─────────────────────────────────────────────────────

const AttributeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid var(--color-border-separator);
  border-bottom: 1px solid var(--color-border-separator);
`;

const AttributeCell = styled.div<{ $col: number; $row: number }>`
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-right: ${({ $col }) => ($col < 4 ? '1px solid var(--color-border-separator)' : 'none')};
  border-bottom: ${({ $row }) => ($row < 2 ? '1px solid var(--color-border-separator)' : 'none')};
`;

// ─── CardFooter ───────────────────────────────────────────────────────────────

const CardFooter = styled.div`
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

// ─── Per-tile width variation ─────────────────────────────────────────────────

const TILES = [
  { number: '40px', name: '80%', meta: '65%' },
  { number: '44px', name: '65%', meta: '55%' },
  { number: '38px', name: '75%', meta: '70%' },
  { number: '42px', name: '70%', meta: '60%' },
  { number: '36px', name: '85%', meta: '50%' },
  { number: '40px', name: '60%', meta: '65%' },
];

// ─── Single skeleton tile ─────────────────────────────────────────────────────

function SkeletonTile({ cfg }: { cfg: typeof TILES[0] }) {
  return (
    <Card>
      {/* Header */}
      <CardHeader>
        {/* Image placeholder — 56×56 rounded rect */}
        <SkeletonBlock width="56px" height={56} radius={6} />

        {/* Project number + name + meta */}
        <HeaderText>
          <SkeletonLine width={cfg.number} height={10} />
          <SkeletonLine width={cfg.name} height={14} />
          <SkeletonLine width={cfg.meta} height={10} />
        </HeaderText>

        {/* Menu button */}
        <SkeletonCircle size={24} />
      </CardHeader>

      {/* Attribute grid — 4 cols × 2 rows = 8 cells */}
      <AttributeGrid>
        {Array.from({ length: 8 }).map((_, idx) => {
          const col = (idx % 4) + 1;
          const row = Math.floor(idx / 4) + 1;
          return (
            <AttributeCell key={idx} $col={col} $row={row}>
              {/* Icon + label row */}
              <SkeletonLine width="70%" height={10} />
              {/* Value — bigger */}
              <SkeletonLine width="55%" height={14} />
            </AttributeCell>
          );
        })}
      </AttributeGrid>

      {/* Footer */}
      <CardFooter>
        <SkeletonLine width="120px" height={11} />
        <SkeletonBlock width="80px" height={20} radius={10} />
      </CardFooter>
    </Card>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectTileGridSkeleton() {
  return (
    <>
      {/* Toolbar row — same as ProjectsTableSkeleton */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <SkeletonBlock width="220px" height={32} radius={4} />
          <SkeletonBlock width="88px" height={32} radius={4} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SkeletonBlock width="200px" height={32} radius={4} />
          <SkeletonBlock width="96px" height={32} radius={4} />
          <SkeletonBlock width="100px" height={32} radius={4} />
        </div>
      </div>

      {/* Tile grid */}
      <TileGrid>
        {TILES.map((cfg, i) => (
          <SkeletonTile key={i} cfg={cfg} />
        ))}
      </TileGrid>
    </>
  );
}
