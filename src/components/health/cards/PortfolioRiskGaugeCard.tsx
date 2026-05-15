/**
 * PORTFOLIO RISK GAUGE CARD
 * Highcharts solid gauge showing overall portfolio risk level (0–100).
 * Score = % of active projects that are red or yellow.
 * Clicking the gauge label or summary opens HealthDetailTearsheet for the worst project.
 */

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button, Typography } from '@procore/core-react';
import styled from 'styled-components';
import type { Options } from 'highcharts';
import HubCardFrame from '@/components/hubs/HubCardFrame';
import HealthDetailTearsheet from '../HealthDetailTearsheet';
import { buildHealthResult } from '@/utils/healthEngine';
import { getRisksForProject } from '@/data/seed/risks';
import { useData } from '@/context/DataContext';
import { useHubFilters } from '@/context/HubFilterContext';
import { useRiskTags } from '@/context/RiskTagsContext';
import { useManualRiskItems } from '@/context/ManualRiskItemsContext';
import { HC_COLORS } from '@/lib/highcharts';
import type { HealthResult } from '@/types/health';
import type { Project } from '@/types/project';

// ─── SSR-safe Highcharts import ───────────────────────────────────────────────

const HighchartsReact = dynamic(
  () => import('highcharts-react-official'),
  { ssr: false }
);

// Highcharts + modules loaded client-side only
let Highcharts: typeof import('highcharts') | null = null;
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Highcharts = require('@/lib/highcharts').default as typeof import('highcharts');
}

// ─── Styled ───────────────────────────────────────────────────────────────────

const GaugeWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 8px 12px;
  gap: 8px;
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

// ─── Gauge score → color ──────────────────────────────────────────────────────

function gaugeColor(score: number): string {
  if (score <= 33) return HC_COLORS.green;
  if (score <= 66) return HC_COLORS.yellow;
  return HC_COLORS.red;
}

function gaugeLabel(score: number): string {
  if (score <= 33) return 'Low Risk';
  if (score <= 66) return 'Moderate Risk';
  return 'High Risk';
}

// ─── Chart options ────────────────────────────────────────────────────────────

function buildGaugeOptions(score: number): Options {
  const color = gaugeColor(score);
  return {
    chart: {
      type: 'solidgauge',
      height: 160,
      margin: [0, 0, 0, 0],
      spacing: [0, 0, 0, 0],
    },
    pane: {
      startAngle: -150,
      endAngle: 150,
      background: [{
        backgroundColor: HC_COLORS.track,
        innerRadius: '70%',
        outerRadius: '100%',
        borderWidth: 0,
        shape: 'arc',
      }],
    },
    yAxis: {
      min: 0,
      max: 100,
      lineWidth: 0,
      tickWidth: 0,
      minorTickWidth: 0,
      labels: { enabled: false },
      stops: [
        [0.33, HC_COLORS.green],
        [0.66, HC_COLORS.yellow],
        [1.0,  HC_COLORS.red],
      ],
    },
    tooltip: { enabled: false },
    series: [{
      type: 'solidgauge',
      data: [score],
      rounded: true,
      dataLabels: {
        enabled: true,
        y: -28,
        borderWidth: 0,
        style: {
          fontSize: '22px',
          fontWeight: '700',
          color,
          textOutline: 'none',
        },
        format: '{y}',
      },
    }],
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

type TearsheetEntry = { project: Project; result: HealthResult };

export default function PortfolioRiskGaugeCard() {
  const { data } = useData();
  const { filteredSeedProjects } = useHubFilters();
  const { getRiskTagsForProject } = useRiskTags();
  const { getManualRiskItemsForProject } = useManualRiskItems();
  const [tearsheetEntry, setTearsheetEntry] = useState<TearsheetEntry | null>(null);

  const { score, needAttention, total, worstEntry } = useMemo(() => {
    if (!data.account) return { score: 0, needAttention: 0, total: 0, worstEntry: null };
    const healthConfig = data.account.healthConfig;
    const activeProjects = filteredSeedProjects.filter((p) => p.status === 'active');

    const entries = activeProjects.map((project) => {
      const risks = getRisksForProject(project.id);
      const riskTags = getRiskTagsForProject(project.id);
      const manualRisks = getManualRiskItemsForProject(project.id);
      const result = buildHealthResult(project, healthConfig, undefined, risks, riskTags, manualRisks);
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
  }, [data.account, filteredSeedProjects, getRiskTagsForProject, getManualRiskItemsForProject]);

  const options = useMemo(() => buildGaugeOptions(score), [score]);
  const label = gaugeLabel(score);

  return (
    <>
      <HubCardFrame
        title="Portfolio Risk Level"
        infoTooltip={
          <span>
            Reflects the percentage of active projects with elevated risk across cost, schedule, and open risk items.<br /><br />
            <strong>Low (0–33):</strong> Most projects are on track with no significant flags.<br />
            <strong>Moderate (34–66):</strong> A portion of projects have cost overruns, schedule delays, or unresolved risks.<br />
            <strong>High (67–100):</strong> Most projects require immediate attention.
          </span>
        }
      >
        <GaugeWrap>
          {Highcharts && (
            <HighchartsReact
              highcharts={Highcharts}
              options={options}
              containerProps={{ style: { width: '100%', maxWidth: 220 } }}
            />
          )}

          <Typography
            intent="h3"
            style={{ fontWeight: 700, color: gaugeColor(score), textAlign: 'center', display: 'block' }}
          >
            {label}
          </Typography>

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
