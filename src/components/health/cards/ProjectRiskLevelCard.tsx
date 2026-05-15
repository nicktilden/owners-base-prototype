/**
 * PROJECT RISK LEVEL CARD
 * Solid gauge showing the overall risk level for a single project (0–100).
 * Score = composite health score mapped to a 0–100 range.
 * Clicking the summary opens the HealthDetailTearsheet.
 */

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Typography } from '@procore/core-react';
import styled from 'styled-components';
import type { Options } from 'highcharts';
import HubCardFrame from '@/components/hubs/HubCardFrame';
import HealthDetailTearsheet from '../HealthDetailTearsheet';
import { buildHealthResult } from '@/utils/healthEngine';
import { projects as allProjects } from '@/data/seed/projects';
import { getRisksForProject } from '@/data/seed/risks';
import { useData } from '@/context/DataContext';
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

// ─── Score helpers ────────────────────────────────────────────────────────────

const SCORE_MAP: Record<string, number> = { red: 90, yellow: 55, green: 15, unavailable: 0 };

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

interface ProjectRiskLevelCardProps {
  projectId: string;
}

type TearsheetEntry = { project: Project; result: HealthResult };

export default function ProjectRiskLevelCard({ projectId }: ProjectRiskLevelCardProps) {
  const { data } = useData();
  const { getRiskTagsForProject } = useRiskTags();
  const { getManualRiskItemsForProject } = useManualRiskItems();
  const [tearsheetEntry, setTearsheetEntry] = useState<TearsheetEntry | null>(null);

  const { score, entry } = useMemo(() => {
    if (!data.account) return { score: 0, entry: null };
    const healthConfig = data.account.healthConfig;
    const project = allProjects.find((p) => p.id === projectId);
    if (!project) return { score: 0, entry: null };

    const risks = getRisksForProject(projectId);
    const riskTags = getRiskTagsForProject(projectId);
    const manualRisks = getManualRiskItemsForProject(projectId);
    const result = buildHealthResult(project, healthConfig, undefined, risks, riskTags, manualRisks);
    const score = SCORE_MAP[result.compositeScore] ?? 0;

    return { score, entry: { project, result } };
  }, [data.account, projectId, getRiskTagsForProject, getManualRiskItemsForProject]);

  const options = useMemo(() => buildGaugeOptions(score), [score]);
  const label = gaugeLabel(score);

  return (
    <>
      <HubCardFrame
        title="Project Risk Level"
        infoTooltip={
          <span>
            Composite risk score based on cost performance, schedule health, and open risk items for this project.<br /><br />
            <strong>Low Risk:</strong> Project is on track with no significant flags.<br />
            <strong>Moderate Risk:</strong> Some cost overruns, schedule delays, or unresolved risks require monitoring.<br />
            <strong>High Risk:</strong> Significant issues present — immediate attention recommended.
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

          <SummaryText onClick={() => entry && setTearsheetEntry(entry)}>
            View risk details
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
