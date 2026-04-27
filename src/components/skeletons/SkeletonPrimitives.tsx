/**
 * SKELETON PRIMITIVES
 *
 * Shared shimmer building blocks used across all Hub card skeletons.
 * Uses a left-to-right gradient shimmer (LinkedIn / DoorDash style).
 *
 * Primitives:
 *   SkeletonLine   — narrow horizontal bar (text placeholder)
 *   SkeletonBlock  — taller rectangle (image / chart placeholder)
 *   SkeletonCircle — round shape (avatar / icon placeholder)
 */

import styled, { css, keyframes } from 'styled-components';

// ─── Shimmer animation ────────────────────────────────────────────────────────

const shimmer = keyframes`
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
`;

/**
 * Base mixin — apply to any skeleton shape via the styled-components `css`
 * helper so that the `keyframes` reference is registered correctly and
 * Fast Refresh does not trigger a full reload.
 */
const shimmerBase = css`
  background: linear-gradient(
    90deg,
    var(--color-surface-secondary, #eef0f1) 25%,
    var(--color-surface-hover, #e0e3e4)     50%,
    var(--color-surface-secondary, #eef0f1) 75%
  );
  background-size: 800px 100%;
  animation: ${shimmer} 1.5s infinite linear;
  border-radius: 4px;
`;

// ─── SkeletonLine ─────────────────────────────────────────────────────────────

export interface SkeletonLineProps {
  /** Width as CSS value, e.g. "60%", "120px". Defaults to "100%". */
  width?: string;
  /** Height in px. Defaults to 12. */
  height?: number;
  /** Extra margin-bottom in px. */
  mb?: number;
}

export const SkeletonLine = styled.div<SkeletonLineProps>`
  ${shimmerBase}
  width: ${({ width }) => width ?? '100%'};
  height: ${({ height }) => height ?? 12}px;
  margin-bottom: ${({ mb }) => mb ?? 0}px;
  flex-shrink: 0;
`;

// ─── SkeletonBlock ────────────────────────────────────────────────────────────

export interface SkeletonBlockProps {
  width?: string;
  height?: number | string;
  radius?: number;
}

export const SkeletonBlock = styled.div<SkeletonBlockProps>`
  ${shimmerBase}
  width: ${({ width }) => width ?? '100%'};
  height: ${({ height }) => (typeof height === 'number' ? `${height}px` : (height ?? '100%'))};
  border-radius: ${({ radius }) => radius ?? 4}px;
  flex-shrink: 0;
`;

// ─── SkeletonCircle ───────────────────────────────────────────────────────────

export interface SkeletonCircleProps {
  size?: number;
}

export const SkeletonCircle = styled.div<SkeletonCircleProps>`
  ${shimmerBase}
  width: ${({ size }) => size ?? 20}px;
  height: ${({ size }) => size ?? 20}px;
  border-radius: 50%;
  flex-shrink: 0;
`;
