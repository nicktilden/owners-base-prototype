/**
 * PORTFOLIO RISK GAUGE CARD
 * SVG semicircle gauge showing overall portfolio risk level (0–100).
 * Score = % of active projects that are red or yellow.
 * Clicking the gauge or summary opens HealthDetailTearsheet for the worst project.
 */

import React, { useMemo, useState } from 'react';
import { Button, Typography } from '@procore/core-react';
import styled from 'styled-components';
import HubCardFrame from '@/components/hubs/HubCardFrame';
import HealthDetailTearsheet from '../HealthDetailTearsheet';
import { buildHealthResult } from '@/utils/healthEngine';
import { projects as allProjects } from '@/data/seed/projects';
import { getRisksForProject } from '@/data/seed/risks';
import { useData } from '@/context/DataContext';
import type { HealthResult } from '@/types/health';
import type { Project } from '@/types/project';

// ─── Styled ───────────────────────────────────────────────────────────────────

const GaugeWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px 8px;
  gap: 12px;
`;

const GaugeSvgWrap = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { opacity: 0.85; }
`;

const GaugeLabel = styled.div`
  text-align: center;
`;

const SummaryText = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  color: var(--color-text-secondary);
  text-decoration: underline;
  padding: 0;
  &:hover { color: var(--color-text-primary); }
`;

// ─── Gauge SVG helpers ────────────────────────────────────────────────────────

/**
 * Semicircle gauge with color zones drawn as arc segments.
 * score: 0–100, where 0 = all healthy, 100 = all critical
 */
function GaugeSvg({ score }: { score: number }) {
  const cx = 100;
  const cy = 100;
  const r = 80;

  // Semicircle goes from 180° to 0° (left to right across bottom)
  function polarToXY(angleDeg: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy - r * Math.sin(rad),
    };
  }

  function arcPath(startDeg: number, endDeg: number) {
    const start = polarToXY(startDeg);
    const end = polarToXY(endDeg);
    const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    // Going counter-clockwise from startDeg to endDeg (sweep = 0 for CCW)
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  }

  // Map score (0–100) to needle angle: 180° (left, 0) → 0° (right, 100)
  const needleAngleDeg = 180 - score * 1.8;
  const needleTip = polarToXY(needleAngleDeg);

  // Zone colors using CSS vars approximations (SVG can't use CSS vars on fills easily)
  // Zones: green 0–33 (180→120°), yellow 34–66 (120→60°), red 67–100 (60→0°)
  const green = '#2e7d32';
  const yellow = '#f9a825';
  const red = '#c62828';
  const trackColor = '#e5e7eb';

  const gaugeColor = score <= 33 ? green : score <= 66 ? yellow : red;

  return (
    <svg width="200" height="110" viewBox="0 0 200 110" aria-hidden="true">
      {/* Track */}
      <path d={arcPath(180, 0)} fill="none" stroke={trackColor} strokeWidth="18" strokeLinecap="round" />
      {/* Green zone */}
      <path d={arcPath(180, 120)} fill="none" stroke={green} strokeWidth="18" strokeLinecap="butt" opacity="0.25" />
      {/* Yellow zone */}
      <path d={arcPath(120, 60)} fill="none" stroke={yellow} strokeWidth="18" strokeLinecap="butt" opacity="0.25" />
      {/* Red zone */}
      <path d={arcPath(60, 0)} fill="none" stroke={red} strokeWidth="18" strokeLinecap="butt" opacity="0.25" />

      {/* Score arc up to needle */}
      {score > 0 && (
        <path
          d={arcPath(180, needleAngleDeg)}
          fill="none"
          stroke={gaugeColor}
          strokeWidth="18"
          strokeLinecap="round"
        />
      )}

      {/* Needle */}
      <line
        x1={cx}
        y1={cy}
        x2={needleTip.x}
        y2={needleTip.y}
        stroke="#1a1a1a"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r="5" fill="#1a1a1a" />

      {/* Score label */}
      <text x={cx} y={cy + 22} textAnchor="middle" fontSize="20" fontWeight="700" fill={gaugeColor}>
        {score}
      </text>
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

type TearsheetEntry = { project: Project; result: HealthResult };

export default function PortfolioRiskGaugeCard() {
  const { data } = useData();
  const [tearsheetEntry, setTearsheetEntry] = useState<TearsheetEntry | null>(null);

  const { score, needAttention, total, worstEntry } = useMemo(() => {
    if (!data.account) return { score: 0, needAttention: 0, total: 0, worstEntry: null };
    const healthConfig = data.account.healthConfig;
    const activeProjects = allProjects.filter((p) => p.status === 'active');

    const entries = activeProjects.map((project) => {
      const risks = getRisksForProject(project.id);
      const result = buildHealthResult(project, healthConfig, undefined, risks);
      return { project, result };
    });

    const needAttention = entries.filter(
      (e) => e.result.compositeScore === 'red' || e.result.compositeScore === 'yellow'
    ).length;

    const total = entries.length;
    const score = total > 0 ? Math.round((needAttention / total) * 100) : 0;

    const worstEntry = entries.sort((a, b) => {
      const order: Record<string, number> = { red: 0, yellow: 1, green: 2, unavailable: 3 };
      return (order[a.result.compositeScore] ?? 3) - (order[b.result.compositeScore] ?? 3);
    })[0] ?? null;

    return { score, needAttention, total, worstEntry };
  }, [data.account]);

  const gaugeLabel =
    score <= 33 ? 'Low Risk' : score <= 66 ? 'Moderate Risk' : 'High Risk';

  return (
    <>
      <HubCardFrame title="Portfolio Risk Level" infoTooltip="Percentage of active projects that are At Risk or Critical.">
        <GaugeWrap>
          <GaugeSvgWrap
            onClick={() => worstEntry && setTearsheetEntry(worstEntry)}
            aria-label={`Portfolio risk gauge: ${score} — ${gaugeLabel}`}
          >
            <GaugeSvg score={score} />
          </GaugeSvgWrap>

          <GaugeLabel>
            <Typography intent="h3" style={{ fontWeight: 700, color: 'var(--color-text-primary)', display: 'block', textAlign: 'center' }}>
              {gaugeLabel}
            </Typography>
          </GaugeLabel>

          <SummaryText onClick={() => worstEntry && setTearsheetEntry(worstEntry)}>
            {needAttention} of {total} project{total !== 1 ? 's' : ''} need{needAttention === 1 ? 's' : ''} attention
          </SummaryText>
        </GaugeWrap>
      </HubCardFrame>

      {tearsheetEntry && (
        <HealthDetailTearsheet
          open={!!tearsheetEntry}
          onClose={() => setTearsheetEntry(null)}
          result={tearsheetEntry.result}
          projectName={tearsheetEntry.project.name}
          projectId={tearsheetEntry.project.id}
        />
      )}
    </>
  );
}
