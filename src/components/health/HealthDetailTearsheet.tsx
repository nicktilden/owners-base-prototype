/**
 * HEALTH DETAIL TEARSHEET
 * Full slide-over panel for project health detail.
 * Sections: Composite score + forecast + trend, KPI breakdown by category,
 * Sparkline, Risk exposure bar + open risk list, action affordances, integrity warning.
 */

import React, { useState } from 'react';
import { Banner, Box, Button, Card, Page, Pill, Tabs, Tearsheet, Typography } from '@procore/core-react';
import { ArrowRight, Link as LinkIcon, Check, Connect, Person } from '@procore/core-icons';
import styled, { createGlobalStyle } from 'styled-components';
import HealthScoreBadge from './HealthScoreBadge';
import KPIRow from './KPIRow';
import HealthSparkline from './HealthSparkline';
import RiskExposureBar from './RiskExposureBar';
import type { HealthResult, KPICategory, Risk } from '@/types/health';

// ─── Width override (50vw) ────────────────────────────────────────────────────

const HealthTearsheetWidth = createGlobalStyle`
  [class*="StyledTearsheetBody"]:has(> .health-detail-tearsheet-root) {
    flex: 0 0 60vw !important;
  }
`;

// ─── Styled ───────────────────────────────────────────────────────────────────

const Section = styled.div`
  margin-bottom: 20px;
`;

const SectionHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const CategoryLabel = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-separator);
  margin-bottom: 4px;
`;

const RiskItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border-separator);
  &:last-child { border-bottom: none; }
`;

const ProbBar = styled.div<{ $prob: number }>`
  flex-shrink: 0;
  width: 4px;
  height: 36px;
  border-radius: 2px;
  background: ${({ $prob }) => $prob >= 4 ? 'var(--color-pill-border-red)' : $prob >= 3 ? 'var(--color-pill-border-yellow)' : 'var(--color-pill-border-green)'};
`;

const ActionBar = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 8px;
`;

const TABS = ['Overview', 'KPIs', 'Risks', 'Trend'] as const;
type TearsheetTab = typeof TABS[number];

const CATEGORY_LABELS: Record<KPICategory, string> = {
  cost: 'Cost',
  schedule: 'Schedule',
  delivery: 'Delivery',
  risk: 'Risk',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function riskProbLabel(p: number): string {
  return ['', 'Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'][p] ?? String(p);
}

function riskStatusColor(r: Risk): 'green' | 'yellow' | 'red' | 'gray' {
  if (r.status === 'closed' || r.status === 'mitigated') return 'green';
  if (r.probability >= 4) return 'red';
  if (r.probability >= 3) return 'yellow';
  return 'gray';
}

// ─── Component ────────────────────────────────────────────────────────────────

interface HealthDetailTearsheetProps {
  open: boolean;
  onClose: () => void;
  result: HealthResult | null;
  projectName: string;
  projectId?: string;
}

export default function HealthDetailTearsheet({
  open,
  onClose,
  result,
  projectName,
  projectId,
}: HealthDetailTearsheetProps) {
  const [activeTab, setActiveTab] = useState<TearsheetTab>('Overview');
  const [acknowledgedKPIs, setAcknowledgedKPIs] = useState<Set<string>>(new Set());

  if (!result) return null;

  const openRisks = result.risks.filter(r => r.status !== 'closed' && r.status !== 'mitigated');
  const categories: KPICategory[] = ['cost', 'schedule', 'delivery', 'risk'];

  const toggleAck = (key: string) => {
    setAcknowledgedKPIs(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  return (
    <>
      <HealthTearsheetWidth />
      <Tearsheet open={open} onClose={onClose} aria-label={`Health details for ${projectName}`} placement="right">
        <div className="health-detail-tearsheet-root" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Page style={{ height: '100%', background: 'var(--color-surface-primary)', color: 'var(--color-text-primary)' }}>
          <Page.Main style={{ height: '100%', overflow: 'hidden', background: 'var(--color-surface-primary)' }}>

            {/* ── Header ── */}
            <Page.Header style={{ background: 'var(--color-surface-primary)', borderColor: 'var(--color-border-separator)' }}>
              <Page.Title>
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Typography intent="h2" style={{ color: 'var(--color-text-primary)' }}>
                      {projectName}
                    </Typography>
                    <HealthScoreBadge
                      score={result.compositeScore}
                      forecastScore={result.forecastScore}
                      trend={result.trend}
                      showTrend
                    />
                    {result.forecastScore !== result.compositeScore && (
                      <Pill color="yellow" style={{ fontSize: 11 }}>
                        Forecast: {result.forecastScore === 'red' ? 'Critical' : 'At Risk'}
                      </Pill>
                    )}
                  </Box>
                  {projectId && (
                    <Button
                      variant="secondary"
                      className="b_secondary"
                      size="sm"
                      icon={<ArrowRight size="sm" />}
                      onClick={() => { window.location.href = `/project/${projectId}/health`; }}
                    >
                      Go to Health
                    </Button>
                  )}
                </Box>
              </Page.Title>
              <Page.Tabs>
                <Tabs>
                  {TABS.map(tab => (
                    <Tabs.Tab
                      key={tab}
                      role="button"
                      selected={activeTab === tab}
                      onPress={() => setActiveTab(tab)}
                    >
                      {tab}
                    </Tabs.Tab>
                  ))}
                </Tabs>
              </Page.Tabs>
            </Page.Header>

            {/* ── Body ── */}
            <Page.Body style={{ padding: 20, overflowY: 'auto', background: 'var(--color-surface-secondary)' }}>

              {/* Integrity warning */}
              {!result.integrity.isComplete && (
                <Banner variant="attention" style={{ marginBottom: 16 }}>
                  <Banner.Content>
                    <Banner.Title>Partial health score</Banner.Title>
                    <Banner.Body>
                      {result.integrity.missingFields.length} KPI{result.integrity.missingFields.length !== 1 ? 's' : ''} have no data source connected ({result.integrity.missingFields.join(', ')}).{' '}
                      {result.integrity.resolutionPath}
                    </Banner.Body>
                  </Banner.Content>
                </Banner>
              )}

              {/* ── OVERVIEW TAB ── */}
              {activeTab === 'Overview' && (
                <Card style={{ padding: 20, background: 'var(--color-surface-primary)' }}>
                  <Section>
                    <SectionHeading>
                      <Typography intent="h3" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        Current Score
                      </Typography>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {result.integrity.signalOrigin === 'automated' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Connect size="sm" style={{ color: 'var(--color-text-secondary)' }} />
                            <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>Automated data</Typography>
                          </div>
                        )}
                        {result.integrity.signalOrigin === 'manual' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Person size="sm" style={{ color: 'var(--color-text-secondary)' }} />
                            <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>Manual data</Typography>
                          </div>
                        )}
                        {result.integrity.signalOrigin === 'mixed' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Person size="sm" style={{ color: 'var(--color-text-secondary)' }} />
                            <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>Automated + Manual</Typography>
                          </div>
                        )}
                        <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
                          As of {new Date(result.dataAsOf).toLocaleDateString()}
                        </Typography>
                      </div>
                    </SectionHeading>
                    <Box style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                      {(['cost', 'schedule', 'delivery', 'risk'] as KPICategory[]).map(cat => {
                        const catKPIs = result.kpis.filter(k => k.category === cat);
                        const worstStatus = catKPIs.some(k => k.status === 'red') ? 'red' : catKPIs.some(k => k.status === 'yellow') ? 'yellow' : 'green';
                        return (
                          <Box key={cat} style={{ flex: 1, minWidth: 100, padding: 12, background: 'var(--color-surface-secondary)', borderRadius: 6, border: '1px solid var(--color-border-separator)' }}>
                            <Typography intent="small" style={{ color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                              {CATEGORY_LABELS[cat]}
                            </Typography>
                            <Pill color={worstStatus === 'red' ? 'red' : worstStatus === 'yellow' ? 'yellow' : 'green'}>
                              {worstStatus === 'red' ? 'Critical' : worstStatus === 'yellow' ? 'At Risk' : 'Good'}
                            </Pill>
                          </Box>
                        );
                      })}
                    </Box>
                  </Section>

                  <Section>
                    <SectionHeading>
                      <Typography intent="h3" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        Risk Exposure
                      </Typography>
                    </SectionHeading>
                    <RiskExposureBar risks={result.risks} />
                  </Section>

                  {result.forecastScore !== result.compositeScore && (
                    <Section>
                      <Box style={{ padding: 12, background: 'var(--color-pill-bg-yellow)', border: '1px solid var(--color-pill-border-yellow)', borderRadius: 6 }}>
                        <Typography intent="body" style={{ color: 'var(--color-pill-text-yellow)', fontWeight: 600, marginBottom: 4 }}>
                          Forecast Warning
                        </Typography>
                        <Typography intent="small" style={{ color: 'var(--color-pill-text-yellow)' }}>
                          This project is currently {result.compositeScore === 'green' ? 'Healthy' : 'At Risk'} but{' '}
                          {result.risks.filter(r => r.status !== 'closed' && r.status !== 'mitigated' && r.probability >= 4).length} open high-probability risks
                          {' '}forecast a {result.forecastScore === 'red' ? 'Critical' : 'At Risk'} status if not addressed.
                        </Typography>
                      </Box>
                    </Section>
                  )}
                </Card>
              )}

              {/* ── KPIs TAB ── */}
              {activeTab === 'KPIs' && (
                <Card style={{ padding: 20, background: 'var(--color-surface-primary)' }}>
                  {categories.map(cat => {
                    const catKPIs = result.kpis.filter(k => k.category === cat);
                    if (catKPIs.length === 0) return null;
                    return (
                      <Section key={cat}>
                        <CategoryLabel>
                          <Typography intent="small" style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                            {CATEGORY_LABELS[cat]}
                          </Typography>
                        </CategoryLabel>
                        {catKPIs.map(kpi => (
                          <Box key={kpi.key}>
                            <KPIRow kpi={kpi} showReasons showSource />
                            {kpi.status !== 'green' && kpi.status !== 'unavailable' && (
                              <Box style={{ display: 'flex', gap: 8, paddingBottom: 8 }}>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="b_secondary"
                                  icon={<Check size="sm" />}
                                  onClick={() => toggleAck(kpi.key)}
                                >
                                  {acknowledgedKPIs.has(kpi.key) ? 'Acknowledged' : 'Acknowledge'}
                                </Button>
                              </Box>
                            )}
                          </Box>
                        ))}
                      </Section>
                    );
                  })}
                </Card>
              )}

              {/* ── RISKS TAB ── */}
              {activeTab === 'Risks' && (
                <Card style={{ padding: 20, background: 'var(--color-surface-primary)' }}>
                  <Section>
                    <SectionHeading>
                      <Typography intent="h3" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        Open Risks
                      </Typography>
                      <Pill color="gray">{openRisks.length}</Pill>
                    </SectionHeading>

                    {openRisks.length === 0 ? (
                      <Typography intent="body" style={{ color: 'var(--color-text-secondary)' }}>
                        No open risks on this project.
                      </Typography>
                    ) : (
                      openRisks
                        .sort((a, b) => (b.probability * Math.max(b.impactCost, b.impactSchedule)) - (a.probability * Math.max(a.impactCost, a.impactSchedule)))
                        .map(risk => (
                          <RiskItem key={risk.id}>
                            <ProbBar $prob={risk.probability} aria-hidden="true" />
                            <Box style={{ flex: 1 }}>
                              <Box style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                                <Typography intent="body" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                  {risk.title}
                                </Typography>
                                <Pill color={riskStatusColor(risk)} style={{ fontSize: 10 }}>
                                  {risk.status.charAt(0).toUpperCase() + risk.status.slice(1)}
                                </Pill>
                                {risk.origin === 'promoted' ? (
                                  <Pill color="green" style={{ fontSize: 10 }}>
                                    <Connect size="sm" /> Auto
                                  </Pill>
                                ) : (
                                  <Pill color="blue" style={{ fontSize: 10 }}>
                                    <Person size="sm" /> Manual
                                  </Pill>
                                )}
                              </Box>
                              <Typography intent="small" style={{ color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                                {risk.description}
                              </Typography>
                              <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
                                Probability: <strong>{riskProbLabel(risk.probability)}</strong> · Category: <strong>{risk.category}</strong>
                                {risk.dueDate && ` · Due ${risk.dueDate}`}
                              </Typography>
                              <ActionBar>
                                <Button size="sm" variant="secondary" className="b_secondary" onClick={() => {}}>
                                  Mitigate
                                </Button>
                                <Button size="sm" variant="secondary" className="b_secondary" onClick={() => {}}>
                                  Accept
                                </Button>
                                <Button size="sm" variant="secondary" className="b_secondary" onClick={() => {}}>
                                  Close
                                </Button>
                              </ActionBar>
                            </Box>
                          </RiskItem>
                        ))
                    )}
                  </Section>
                </Card>
              )}

              {/* ── TREND TAB ── */}
              {activeTab === 'Trend' && (
                <Card style={{ padding: 20, background: 'var(--color-surface-primary)' }}>
                  <Section>
                    <HealthSparkline
                      history={result.history}
                      forecastScore={result.forecastScore !== result.compositeScore ? result.forecastScore : undefined}
                      width={480}
                      height={100}
                    />
                  </Section>
                  <Section>
                    <Typography intent="body" style={{ color: 'var(--color-text-secondary)' }}>
                      Trend: <strong style={{ color: 'var(--color-text-primary)' }}>
                        {result.trend === 'improving' ? 'Improving' : result.trend === 'degrading' ? 'Degrading' : 'Stable'}
                      </strong>
                      {' '}· Data as of {new Date(result.dataAsOf).toLocaleDateString()}
                    </Typography>
                  </Section>
                </Card>
              )}

            </Page.Body>
          </Page.Main>
        </Page>
        </div>
      </Tearsheet>
    </>
  );
}
