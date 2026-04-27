/**
 * HUB CARD SKELETON
 *
 * A structural skeleton that exactly mirrors HubCardFrame's layout:
 *   • Card shell (same border-radius, shadow, border)
 *   • Header row (44px) — title shimmer + action button shimmers
 *   • Optional controls bar — search + control shimmers
 *   • Content area — receives the card-specific content skeleton as children
 *
 * Usage:
 *   <HubCardSkeleton hasControls>
 *     <MyOpenItemsSkeleton />
 *   </HubCardSkeleton>
 */

import React from 'react';
import styled from 'styled-components';
import { SkeletonBlock, SkeletonLine } from './SkeletonPrimitives';

// ─── Shell — mirrors HubCardFrame's Card ─────────────────────────────────────

const Shell = styled.div`
  background: var(--color-surface-card);
  border-radius: 8px;
  border: 1px solid var(--color-card-border);
  box-shadow: 0px 2px 6px 0px var(--color-shadow);
  display: flex;
  flex-direction: column;
  min-height: 200px;
  max-height: 440px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

// ─── Header — mirrors HubCardFrame's Header (44px, same padding) ──────────────

const SkeletonHeader = styled.div`
  padding: 16px 16px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  height: 44px;
  gap: 8px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

// ─── Controls — mirrors HubCardFrame's Controls ───────────────────────────────

const SkeletonControls = styled.div`
  padding: 8px 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

// ─── Content — mirrors HubCardFrame's Content ────────────────────────────────

const SkeletonContent = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 8px 16px 16px;
`;

// ─── Component ────────────────────────────────────────────────────────────────

interface HubCardSkeletonProps {
  /**
   * Whether to render a controls bar (search + dropdowns) between the header
   * and content. Set to true for cards that have controls.
   */
  hasControls?: boolean;
  /** Number of control inputs to show (default 2 — search + one select). */
  controlCount?: number;
  /** Number of action button shimmers in the header (default 2). */
  actionCount?: number;
  /** Card-specific content skeleton */
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export default function HubCardSkeleton({
  hasControls = false,
  controlCount = 2,
  actionCount = 2,
  children,
  style,
}: HubCardSkeletonProps) {
  return (
    <Shell style={style} aria-busy="true" aria-label="Loading card content">
      {/* Header */}
      <SkeletonHeader>
        <HeaderLeft>
          {/* Title shimmer */}
          <SkeletonLine width="140px" height={14} />
        </HeaderLeft>
        <HeaderRight>
          {/* Action button shimmers */}
          {Array.from({ length: actionCount }).map((_, i) => (
            <SkeletonBlock key={i} width="28px" height={28} radius={4} />
          ))}
        </HeaderRight>
      </SkeletonHeader>

      {/* Controls bar */}
      {hasControls && (
        <SkeletonControls>
          {/* Search-width shimmer */}
          <SkeletonBlock width="180px" height={30} radius={4} />
          {Array.from({ length: controlCount - 1 }).map((_, i) => (
            <SkeletonBlock key={i} width="110px" height={30} radius={4} />
          ))}
        </SkeletonControls>
      )}

      {/* Card-specific content */}
      <SkeletonContent>{children}</SkeletonContent>
    </Shell>
  );
}
