/**
 * HEALTH DETAIL TEARSHEET (v7)
 * Full slide-over panel for project health detail.
 * v7 anatomy: DualStatusBadge header → Sparkline trend → "Why this score?" EvidenceCards
 * → Actions → "Go to project" CTA.
 * Connected projects: aggregate-only view, no drill-in, trust language, no edit actions.
 */

import React, { useState } from 'react';
import { Banner, Box, Button, Card, Page, Pill, Tabs, Tearsheet, Typography } from '@procore/core-react';
import { ArrowRight, Check } from '@procore/core-icons';
import styled, { createGlobalStyle } from 'styled-components';
import HealthSparkline from './HealthSparkline';
import DualStatusBadge from './DualStatusBadge';
import OriginIndicator from './OriginIndicator';
import EvidenceCard from './EvidenceCard';
import KPIRow from './KPIRow';
import RiskExposureBar from './RiskExposureBar';
import type { HealthResult, KPICategory, Risk, ConnectedProjectHealth } from '@/types/health';
import { useRiskTags } from '@/context/RiskTagsContext';
import { useData } from '@/context/DataContext';
import PendingApprovalState from '@/components/risk/PendingApprovalState';

// ─── Width override (60%) ─────────────────────────────────────────────────────

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
  margin-bottom: 12px;
`;

const EvidenceStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
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

const ConnectedBanner = styled.div`
  padding: 12px 16px;
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-separator);
  border-radius: 6px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FooterLink = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 0 0;
  border-top: 1px solid var(--color-border-separator);
`;

const TABS = ['Evidence', 'KPIs', 'Risks', 'Trend'] as const;
type TearsheetTab = typeof TABS[number];

const CATEGORY_LABELS: Record<KPICategory, string> = {
  cost: 'Cost',
  schedule: 'Schedule',
  delivery: 'Delivery',
  risk: 'Risk',
};

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
  isConnected?: boolean;
  connectData?: ConnectedProjectHealth;
}

export default function HealthDetailTearsheet({
  open,
  onClose,
  result,
  projectName,
  projectId,
  isConnected = false,
  connectData,
}: HealthDetailTearsheetProps) {
  const [activeTab, setActiveTab] = useState<TearsheetTab>('Evidence');
  const [acknowledgedKPIs, setAcknowledgedKPIs] = useState<Set<string>>(new Set());
  const { getRiskTagsForProject } = useRiskTags();
  const { data } = useData();

  if (!result) return null;

  const v7Tags = projectId ? getRiskTagsForProject(projectId).filter(t => t.status !== 'closed') : [];
  const riskTypes = data.account?.riskTypes ?? [];
  function getRiskTypeName(id: string) { return riskTypes.find(rt => rt.id === id)?.label ?? id; }

  const openRisks = result.risks.filter(r => r.status !== 'closed' && r.status !== 'mitigated');
  const categories: KPICategory[] = ['cost', 'schedule', 'delivery', 'risk'];

  // Sort KPIs by impact: red → yellow → unavailable → green
  const orderedKPIs = [...result.kpis].sort((a, b) => {
    const rank = { red: 0, yellow: 1, unavailable: 2, green: 3 };
    return (rank[a.status] ?? 3) - (rank[b.status] ?? 3);
  });

  const toggleAck = (key: string) => {
    setAcknowledgedKPIs(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const showForecastWarning = result.forecastScore !== result.compositeScore;

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
                  <Box style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <DualStatusBadge
                      currentScore={result.compositeScore}
                      forecastScore={result.forecastScore}
                    />
                    <Typography intent="h2" style={{ color: 'var(--color-text-primary)' }}>
                      {projectName}
                    </Typography>
                    {isConnected && (
                      <OriginIndicator origin="connected_partner" />
                    )}
                  </Box>
                  {projectId && (
                    <Button
                      variant="secondary"
                      className="b_secondary"
                      size="sm"
                      icon={<ArrowRight size="sm" />}
                      onClick={() => { window.location.href = `/project/${projectId}/risk-register`; }}
                    >
                      Go to Project
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

              {/* Connected project — trust language */}
              {isConnected && connectData && (
                <ConnectedBanner>
                  <OriginIndicator origin="connected_partner" showTooltip={false} />
                  <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
                    Health data sourced from <strong>{connectData.sourceAccountName}</strong> via Procore Connect.
                    Synced {new Date(connectData.syncedAt).toLocaleDateString()}.
                    {connectData.shareLevel === 'summary' && ' Summary view only — drill-down data not shared.'}
                  </Typography>
                </ConnectedBanner>
              )}

              {/* Integrity warning */}
              {!result.integrity.isComplete && !isConnected && (
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

              {/* Forecast warning */}
              {showForecastWarning && (
                <Box style={{ padding: 12, background: 'var(--color-pill-bg-yellow)', border: '1px solid var(--color-pill-border-yellow)', borderRadius: 6, marginBottom: 16 }}>
                  <Typography intent="body" style={{ color: 'var(--color-pill-text-yellow)', fontWeight: 600, marginBottom: 4 }}>
                    Forecast Warning
                  </Typography>
                  <Typography intent="small" style={{ color: 'var(--color-pill-text-yellow)' }}>
                    This project is currently {result.compositeScore === 'green' ? 'Healthy' : 'At Risk'} but forecast to be{' '}
                    {result.forecastScore === 'red' ? 'Critical' : 'At Risk'} based on open high-probability risks.
                  </Typography>
                </Box>
              )}

              {/* ── EVIDENCE TAB (v7 default) ── */}
              {activeTab === 'Evidence' && (
                <Card style={{ padding: 20, background: 'var(--color-surface-primary)' }}>
                  <Section>
                    <SectionHeading>
                      <Typography intent="h3" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        Why this score?
                      </Typography>
                      <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
                        As of {new Date(result.dataAsOf).toLocaleDateString()}
                      </Typography>
                    </SectionHeading>

                    {/* Trend sparkline */}
                    <div style={{ marginBottom: 16 }}>
                      <HealthSparkline
                        history={result.history}
                        forecastScore={showForecastWarning ? result.forecastScore : undefined}
                        width={480}
                        height={60}
                      />
                    </div>

                    {/* Connected projects: aggregate dimensions only */}
                    {isConnected && connectData && connectData.shareLevel === 'detail' ? (
                      <EvidenceStack>
                        {Object.entries(connectData.dimensions ?? {})
                          .filter(([key, v]) => key !== 'composite' && v != null)
                          .map(([dimKey, dimData]) => {
                            const dim = dimData!;
                            return (
                              <EvidenceCard
                                key={dimKey}
                                kpi={{
                                  key: dimKey as any,
                                  label: dimKey.charAt(0).toUpperCase() + dimKey.slice(1),
                                  category: 'cost' as KPICategory,
                                  weight: 0,
                                  threshold: { yellow: 0, red: 0 },
                                  status: dim.status as any,
                                  displayValue: dim.status,
                                  numericValue: null,
                                  dataSource: 'connected',
                                  sourceLabel: connectData.sourceAccountName,
                                  reasons: [],
                                  integrity: { isComplete: true, missingFields: [], issueType: null, resolutionPath: null, signalOrigin: 'automated' },
                                }}
                                forecastScore={dim.forecastStatus}
                              />
                            );
                          })
                        }
                      </EvidenceStack>
                    ) : isConnected ? (
                      <Typography intent="body" style={{ color: 'var(--color-text-secondary)' }}>
                        Summary-level view only. Detailed dimension data is not shared for this project.
                      </Typography>
                    ) : (
                      <EvidenceStack>
                        {orderedKPIs
                          .filter(k => k.status !== 'green' && k.status !== 'unavailable')
                          .concat(orderedKPIs.filter(k => k.status === 'green'))
                          .slice(0, 8)
                          .map(kpi => (
                            <EvidenceCard
                              key={kpi.key}
                              kpi={kpi}
                              forecastScore={result.forecastScore}
                            />
                          ))
                        }
                        {result.kpis.length === 0 && (
                          <Typography intent="body" style={{ color: 'var(--color-text-secondary)' }}>
                            No KPI data available for this project.
                          </Typography>
                        )}
                      </EvidenceStack>
                    )}
                  </Section>

                  {/* Exposure bar — not for connected/summary projects */}
                  {!isConnected && result.risks.length > 0 && (
                    <Section>
                      <SectionHeading>
                        <Typography intent="h3" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          Risk Exposure
                        </Typography>
                      </SectionHeading>
                      <RiskExposureBar risks={result.risks} />
                    </Section>
                  )}

                  {/* Footer CTA */}
                  {projectId && (
                    <FooterLink>
                      <Button
                        variant="tertiary"
                        icon={<ArrowRight size="sm" />}
                        onClick={() => { window.location.href = `/project/${projectId}/risk-register`; }}
                      >
                        Go to project health page
                      </Button>
                    </FooterLink>
                  )}
                </Card>
              )}

              {/* ── KPIs TAB ── */}
              {activeTab === 'KPIs' && !isConnected && (
                <Card style={{ padding: 20, background: 'var(--color-surface-primary)' }}>
                  {categories.map(cat => {
                    const catKPIs = result.kpis.filter(k => k.category === cat);
                    if (catKPIs.length === 0) return null;
                    return (
                      <Section key={cat}>
                        <Typography intent="h3" style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>
                          {CATEGORY_LABELS[cat]}
                        </Typography>
                        {catKPIs.map(kpi => (
                          <div key={kpi.key} style={{ borderBottom: '1px solid var(--color-border-separator)' }}>
                            <KPIRow kpi={kpi} showReasons showSource />
                            {kpi.status !== 'green' && kpi.status !== 'unavailable' && (
                              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 10 }}>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="b_secondary"
                                  icon={<Check size="sm" />}
                                  onClick={() => toggleAck(kpi.key)}
                                >
                                  {acknowledgedKPIs.has(kpi.key) ? 'Acknowledged' : 'Acknowledge'}
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </Section>
                    );
                  })}
                  {isConnected && (
                    <Typography intent="body" style={{ color: 'var(--color-text-secondary)' }}>
                      KPI breakdown is not available for connected projects.
                    </Typography>
                  )}
                </Card>
              )}

              {/* ── RISKS TAB ── */}
              {activeTab === 'Risks' && !isConnected && (
                <Card style={{ padding: 20, background: 'var(--color-surface-primary)' }}>
                  {v7Tags.length > 0 && (
                    <Section>
                      <SectionHeading>
                        <Typography intent="h3" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          Risk Tags ({v7Tags.length})
                        </Typography>
                      </SectionHeading>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {v7Tags
                          .sort((a, b) => (b.probability * b.impact) - (a.probability * a.impact))
                          .map(tag => (
                            tag.status === 'pending_approval'
                              ? <PendingApprovalState key={tag.id} tag={tag} />
                              : (
                                <RiskItem key={tag.id}>
                                  <ProbBar $prob={tag.probability} aria-hidden="true" />
                                  <Box style={{ flex: 1 }}>
                                    <Box style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                                      <Typography intent="body" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                        {getRiskTypeName(tag.riskTypeId)}
                                      </Typography>
                                      <Pill color="gray" style={{ fontSize: 10 }}>{tag.sourceType}</Pill>
                                      <Pill color={tag.status === 'open' ? 'yellow' : tag.status === 'mitigated' ? 'green' : 'gray'} style={{ fontSize: 10 }}>
                                        {tag.status}
                                      </Pill>
                                    </Box>
                                    <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
                                      Probability: <strong>{riskProbLabel(tag.probability)}</strong>
                                      {tag.impact > 0 && <> · Expected impact: <strong>${tag.impact.toLocaleString()}</strong></>}
                                    </Typography>
                                  </Box>
                                </RiskItem>
                              )
                          ))}
                      </div>
                    </Section>
                  )}

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
                              </Box>
                              <Typography intent="small" style={{ color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                                {risk.description}
                              </Typography>
                              <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
                                Probability: <strong>{riskProbLabel(risk.probability)}</strong> · Category: <strong>{risk.category}</strong>
                                {risk.dueDate && ` · Due ${risk.dueDate}`}
                              </Typography>
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
                      forecastScore={showForecastWarning ? result.forecastScore : undefined}
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
