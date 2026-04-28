/**
 * RISK SIGNALS CARD
 * Portfolio-level KPI scorecard — aggregates health engine KPIs across all active projects.
 * Available KPIs are driven by account healthConfig.activeKPIs (settings as source of truth).
 * User selects up to 4 KPIs to display via the Configure Scorecard modal.
 */

import React, { useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { Button, Modal, Tearsheet, Tooltip, Typography, colors } from '@procore/core-react';
import { Cog, Copilot, Grip, Clear, Info, Plus } from '@procore/core-icons';
import styled, { createGlobalStyle } from 'styled-components';
import HubCardFrame, { HubCardEmptyState } from '@/components/hubs/HubCardFrame';
import KPIPill from '@/components/KPIPill';
import { projects as allProjects } from '@/data/seed/projects';
import { getRisksForProject } from '@/data/seed/risks';
import { useData } from '@/context/DataContext';
import { resolveKPIs, aggregatePortfolioKPIs } from '@/utils/healthEngine';
import { KPI_DESCRIPTIONS } from '@/types/health';
import type { KPIKey, KPIResult } from '@/types/health';
import { useHubLoading } from '@/context/HubLoadingContext';
import HubCardSkeleton from '@/components/skeletons/HubCardSkeleton';
import RiskScorecardSkeleton from '@/components/skeletons/RiskScorecardSkeleton';
import { useAiPanel } from '@/context/AiPanelContext';

// ─── Styled Components ────────────────────────────────────────────────────────

const KPICenterWrap = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
`;

const KPIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  width: 100%;
`;

const KPITile = styled.button`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid var(--color-border-separator);
  border-radius: 8px;
  background: var(--color-surface-card);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s;
  &:hover { border-color: var(--color-action-primary); }
  &:focus-visible { outline: 2px solid var(--color-border-focus); outline-offset: 2px; }
`;

const KPITitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: 500;
  line-height: 1.15;
  color: var(--color-text-primary);
  letter-spacing: 0.15px;
`;

const TrendRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const RiskScorecardTearsheetWidth = createGlobalStyle`
  [class*="StyledTearsheetBody"]:has(> .risk-scorecard-tearsheet-root) {
    flex: 0 0 50vw !important;
  }
`;

const TearsheetHeader = styled.div`
  padding: 24px 24px 16px;
  border-bottom: 1px solid var(--color-border-separator);
`;

const TearsheetBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
`;

const SectionTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  margin-top: 24px;
  &:first-child { margin-top: 0; }
`;

const BreakdownTable = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0;
  border: 1px solid var(--color-border-separator);
  border-radius: 6px;
  overflow: hidden;
`;

const BreakdownHead = styled.div`
  display: contents;
  > div {
    padding: 6px 12px;
    background: var(--color-surface-secondary);
    font-size: 12px;
    font-weight: 600;
    color: var(--color-text-secondary);
    border-bottom: 1px solid var(--color-border-separator);
  }
`;

const BreakdownRow = styled.div`
  display: contents;
  > div {
    padding: 8px 12px;
    font-size: 13px;
    color: var(--color-text-primary);
    border-bottom: 1px solid var(--color-border-separator);
    display: flex;
    align-items: center;
  }
  &:last-child > div { border-bottom: none; }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

// ─── Configure Modal Styled Components ────────────────────────────────────────

const ConfigSectionLabel = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 12px;
`;

const DisplayedKPIItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--color-border-separator);
  border-radius: 6px;
  background: var(--color-surface-primary);
  margin-bottom: 8px;
`;

const DragHandle = styled.div`
  display: flex;
  align-items: center;
  cursor: grab;
  flex-shrink: 0;
  color: var(--color-text-secondary);
  padding: 0 2px;
  &:active { cursor: grabbing; }
`;

const ItemNumber = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
  flex-shrink: 0;
  min-width: 20px;
`;

const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ItemSource = styled.div`
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 2px;
`;

const AvailableKPIsSection = styled.div`
  margin-top: 24px;
`;

const AvailableKPIItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border: 1.5px dashed var(--color-border-separator);
  border-radius: 6px;
  background: var(--color-surface-secondary);
  margin-bottom: 8px;
`;

const AvailableItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const AddBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  flex-shrink: 0;
  &:hover { background: var(--color-surface-hover); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const SettingsBanner = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-separator);
  border-radius: 6px;
  margin-bottom: 20px;
`;

const SettingsBannerText = styled.div`
  flex: 1;
  min-width: 0;
`;

// ─── Tearsheet detail content ──────────────────────────────────────────────────

function KPIDetailContent({ kpi, allResults }: { kpi: KPIResult; allResults: Array<{ projectName: string; kpi: KPIResult }> }) {
  return (
    <>
      <SectionTitle>Definition</SectionTitle>
      <Typography intent="body" style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 16 }}>
        {KPI_DESCRIPTIONS[kpi.key]}
      </Typography>
      <SectionTitle>By Project</SectionTitle>
      <BreakdownTable>
        <BreakdownHead>
          <div>Project</div>
          <div style={{ textAlign: 'right' }}>Value</div>
          <div style={{ textAlign: 'right' }}>Status</div>
        </BreakdownHead>
        {allResults.map(({ projectName, kpi: pk }) => (
          <BreakdownRow key={projectName}>
            <div style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {projectName.length > 28 ? projectName.slice(0, 28) + '…' : projectName}
            </div>
            <div style={{ justifyContent: 'flex-end', fontWeight: 600 }}>{pk.displayValue}</div>
            <div style={{ justifyContent: 'flex-end' }}>
              <span style={{
                padding: '2px 8px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                background: pk.status === 'red' ? 'var(--color-pill-bg-red)' : pk.status === 'yellow' ? 'var(--color-pill-bg-yellow)' : pk.status === 'green' ? 'var(--color-pill-bg-green)' : 'var(--color-surface-secondary)',
                color: pk.status === 'red' ? 'var(--color-pill-text-red)' : pk.status === 'yellow' ? 'var(--color-pill-text-yellow)' : pk.status === 'green' ? 'var(--color-pill-text-green)' : 'var(--color-text-secondary)',
              }}>
                {pk.status === 'unavailable' ? '—' : pk.status.charAt(0).toUpperCase() + pk.status.slice(1)}
              </span>
            </div>
          </BreakdownRow>
        ))}
      </BreakdownTable>
    </>
  );
}

// ─── Tone helper ──────────────────────────────────────────────────────────────

type KPITone = 'positive' | 'negative' | 'neutral';

function toneFromStatus(status: KPIResult['status']): KPITone {
  if (status === 'green') return 'positive';
  if (status === 'red') return 'negative';
  return 'neutral';
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RiskScorecardCard({ defaultKPIs }: { defaultKPIs?: KPIKey[] } = {}) {
  const { isLoading } = useHubLoading();
  const { data } = useData();
  const config = data.account?.healthConfig;
  const { openPanel } = useAiPanel();

  const [selectedKPIKey, setSelectedKPIKey] = useState<KPIKey | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [displayedIds, setDisplayedIds] = useState<KPIKey[]>(defaultKPIs ?? []);
  const [draftIds, setDraftIds] = useState<KPIKey[]>([]);
  const dragIndexRef = useRef<number | null>(null);

  function openConfig() {
    setDraftIds([...displayedIds]);
    setConfigOpen(true);
  }

  function handleRemoveDraft(id: KPIKey) {
    setDraftIds(prev => prev.filter(d => d !== id));
  }

  function handleAddDraft(id: KPIKey) {
    if (draftIds.length >= 4) return;
    setDraftIds(prev => [...prev, id]);
  }

  function handleSaveConfig() {
    setDisplayedIds([...draftIds]);
    setConfigOpen(false);
  }

  function handleDragStart(index: number) {
    dragIndexRef.current = index;
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from === null || from === index) return;
    setDraftIds(prev => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(index, 0, item);
      return next;
    });
    dragIndexRef.current = index;
  }

  function handleDragEnd() {
    dragIndexRef.current = null;
  }

  // ── Aggregate KPIs across all active projects ────────────────────────────────

  const { portfolioKPIs, perProjectByKey } = useMemo(() => {
    if (!config) return { portfolioKPIs: [], perProjectByKey: {} as Record<KPIKey, Array<{ projectName: string; kpi: KPIResult }>> };

    const activeProjects = allProjects.filter(p => p.status === 'active');
    const projectResults = activeProjects.map(p => {
      const risks = getRisksForProject(p.id);
      const kpis = resolveKPIs(p, config, undefined, risks);
      return { projectName: p.name, kpis, risks };
    });

    const portfolioKPIs = aggregatePortfolioKPIs(projectResults, config);

    // Build per-project lookup by KPI key for tearsheet drill-down
    const perProjectByKey: Record<string, Array<{ projectName: string; kpi: KPIResult }>> = {};
    portfolioKPIs.forEach(pk => {
      perProjectByKey[pk.key] = projectResults.map(({ projectName, kpis }) => {
        const found = kpis.find(k => k.key === pk.key);
        return { projectName, kpi: found ?? { ...pk, status: 'unavailable' as const, displayValue: '—', numericValue: null } };
      });
    });

    return { portfolioKPIs, perProjectByKey };
  }, [config]);

  // KPIs available in the configure modal = all active KPIs from settings
  const availableKPIKeys: KPIKey[] = config?.activeKPIs ?? [];

  // Displayed KPI results in order
  const displayedKPIs = displayedIds
    .map(id => portfolioKPIs.find(k => k.key === id))
    .filter((k): k is KPIResult => k !== null && k !== undefined);

  const activeKPI = selectedKPIKey ? portfolioKPIs.find(k => k.key === selectedKPIKey) ?? null : null;

  const availableForDraft = availableKPIKeys.filter(id => !draftIds.includes(id));
  const displayedDraftKPIs = draftIds
    .map(id => portfolioKPIs.find(k => k.key === id))
    .filter((k): k is KPIResult => k !== null && k !== undefined);

  // ── Render ──────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <HubCardSkeleton hasControls={false} actionCount={2}>
        <RiskScorecardSkeleton />
      </HubCardSkeleton>
    );
  }

  return (
    <>
      <HubCardFrame
        title="Risk Signals"
        actions={
          <HeaderActions>
            {displayedKPIs.length > 0 && (
              <Button
                className="b_secondary"
                variant="secondary"
                size="sm"
                icon={<Copilot size="sm" style={{ color: colors.orange50 }} />}
                aria-label="Summarize with AI"
                style={{
                  background: colors.orange98,
                  border: `1px solid ${colors.orange50}`,
                  borderRadius: 4,
                  color: colors.gray15,
                }}
                onClick={() => openPanel({
                  itemName: 'Risk Signals',
                  cardType: 'risk_scorecard',
                  aiSummary: displayedKPIs.map(k =>
                    `${k.label}: ${k.displayValue} (${k.status === 'unavailable' ? 'No data' : k.status === 'green' ? 'On Track' : k.status === 'yellow' ? 'At Risk' : 'Critical'})`
                  ).join('\n'),
                })}
              >
                Summarize
              </Button>
            )}
            <Tooltip trigger="hover" placement="top" overlay={<Tooltip.Content>Configure scorecard</Tooltip.Content>}>
              <Button
                variant="tertiary"
                size="sm"
                icon={<Cog size="sm" />}
                aria-label="Configure scorecard"
                onClick={openConfig}
              />
            </Tooltip>
          </HeaderActions>
        }
      >
        {displayedKPIs.length === 0
          ? <HubCardEmptyState
              title="There Are No KPIs to Display Right Now"
              body="The Risk Scorecard tool helps your team monitor project health. Once you select KPIs to track, you can access them here."
              actions={
                <>
                  <Button variant="secondary" className="b_secondary" size="sm" onClick={openConfig}>
                    Configure Scorecard
                  </Button>
                  <Link href="/settings/health-risk">
                    <Button variant="tertiary" size="sm">
                      Account Settings
                    </Button>
                  </Link>
                </>
              }
            />
          : <KPICenterWrap>
              <KPIGrid>
                {displayedKPIs.map(kpi => (
                  <KPITile
                    key={kpi.key}
                    onClick={() => setSelectedKPIKey(kpi.key)}
                    aria-label={`${kpi.label}: ${kpi.displayValue}. Click to view details.`}
                  >
                    <KPITitleRow>
                      <Typography
                        intent="body"
                        style={{ color: 'var(--color-text-primary)', fontWeight: 400, fontSize: 14, lineHeight: '20px', letterSpacing: '0.15px' }}
                      >
                        {kpi.label}
                      </Typography>
                      <Tooltip
                        trigger="hover"
                        placement="top"
                        overlay={<Tooltip.Content><div style={{ maxWidth: 220, whiteSpace: 'normal' }}>{KPI_DESCRIPTIONS[kpi.key]}</div></Tooltip.Content>}
                      >
                        <span style={{ display: 'inline-flex', color: 'var(--color-text-primary)', cursor: 'help' }}>
                          <Info size="sm" />
                        </span>
                      </Tooltip>
                    </KPITitleRow>
                    <MetricValue>{kpi.displayValue}</MetricValue>
                    <TrendRow>
                      <KPIPill tone={toneFromStatus(kpi.status)} trendValue={0} value={kpi.status === 'unavailable' ? 'No data' : kpi.status === 'green' ? 'On Track' : kpi.status === 'yellow' ? 'At Risk' : 'Critical'} />
                    </TrendRow>
                  </KPITile>
                ))}
              </KPIGrid>
            </KPICenterWrap>
        }
      </HubCardFrame>

      {/* ── Configure Scorecard Modal ── */}
      <Modal
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        aria-label="Configure Scorecard"
        howToClose={['x', 'scrim']}
        style={{ width: 640 }}
      >
        <Modal.Header
          onClose={() => setConfigOpen(false)}
          style={{ display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <Cog size="md" style={{ flexShrink: 0 }} />
          Configure Scorecard
        </Modal.Header>

        <Modal.Body>
          <SettingsBanner>
            <SettingsBannerText>
              <Typography intent="body" style={{ fontWeight: 700, color: 'var(--color-text-primary)', display: 'block', marginBottom: 4 }}>
                Manage Health &amp; Risk KPIs
              </Typography>
              <Typography intent="body" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                Your Health &amp; Risk system is managed in Account Settings, giving your organization a central place to set thresholds, rules, and KPI standards.
              </Typography>
            </SettingsBannerText>
            <Link href="/settings/health-risk" style={{ textDecoration: 'none', flexShrink: 0 }}>
              <Button variant="secondary" className="b_secondary" size="sm" onClick={() => setConfigOpen(false)}>
                Go To Settings
              </Button>
            </Link>
          </SettingsBanner>

          <Typography intent="body" style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 20 }}>
            Choose up to 4 KPIs from your active Health &amp; Risk KPIs to display on the scorecard.
          </Typography>

          <ConfigSectionLabel>
            Displayed KPIs ({draftIds.length}/4)
          </ConfigSectionLabel>

          {displayedDraftKPIs.map((kpi, idx) => (
            <DisplayedKPIItem
              key={kpi.key}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
            >
              <DragHandle aria-hidden>
                <Grip size="sm" />
              </DragHandle>
              <ItemNumber>{idx + 1}.</ItemNumber>
              <ItemInfo>
                <ItemLabel>
                  {kpi.label}
                  <Tooltip
                    trigger="hover"
                    placement="top"
                    overlay={<Tooltip.Content><div style={{ maxWidth: 220, whiteSpace: 'normal' }}>{KPI_DESCRIPTIONS[kpi.key]}</div></Tooltip.Content>}
                  >
                    <span style={{ display: 'inline-flex', color: 'var(--color-text-secondary)', cursor: 'help' }}>
                      <Info size="sm" />
                    </span>
                  </Tooltip>
                </ItemLabel>
                <ItemSource>{kpi.sourceLabel}</ItemSource>
              </ItemInfo>
              <Button
                variant="tertiary"
                size="sm"
                icon={<Clear size="sm" />}
                aria-label={`Remove ${kpi.label}`}
                onClick={() => handleRemoveDraft(kpi.key)}
              />
            </DisplayedKPIItem>
          ))}

          {draftIds.length === 0 && (
            <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block', padding: '12px 0' }}>
              No KPIs selected. Add up to 4 from the list below.
            </Typography>
          )}

          {availableForDraft.length > 0 && (
            <AvailableKPIsSection>
              <ConfigSectionLabel>
                Available KPIs ({availableForDraft.length})
              </ConfigSectionLabel>

              {availableForDraft.map(key => {
                const kpi = portfolioKPIs.find(k => k.key === key);
                if (!kpi) return null;
                return (
                  <AvailableKPIItem key={key}>
                    <AvailableItemInfo>
                      <ItemLabel>
                        {kpi.label}
                        <Tooltip
                          trigger="hover"
                          placement="top"
                          overlay={<Tooltip.Content><div style={{ maxWidth: 220, whiteSpace: 'normal' }}>{KPI_DESCRIPTIONS[key]}</div></Tooltip.Content>}
                        >
                          <span style={{ display: 'inline-flex', color: 'var(--color-text-secondary)', cursor: 'help' }}>
                            <Info size="sm" />
                          </span>
                        </Tooltip>
                      </ItemLabel>
                      <ItemSource>{kpi.sourceLabel}</ItemSource>
                    </AvailableItemInfo>
                    <AddBtn
                      type="button"
                      disabled={draftIds.length >= 4}
                      aria-label={`Add ${kpi.label}`}
                      onClick={() => handleAddDraft(key)}
                    >
                      <Plus size="sm" />
                      Add
                    </AddBtn>
                  </AvailableKPIItem>
                );
              })}
            </AvailableKPIsSection>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="tertiary" className="b_tertiary" onClick={() => setConfigOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="b_primary"
            onClick={handleSaveConfig}
            disabled={draftIds.length === 0}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── KPI Detail Tearsheet ── */}
      <RiskScorecardTearsheetWidth />
      <Tearsheet
        open={selectedKPIKey !== null}
        onClose={() => setSelectedKPIKey(null)}
        placement="right"
        block
        aria-label={activeKPI ? `${activeKPI.label} details` : 'KPI details'}
      >
        <div className="risk-scorecard-tearsheet-root" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {activeKPI && (
          <>
            <TearsheetHeader>
              <Typography intent="h2" style={{ fontWeight: 700, color: 'var(--color-text-primary)', display: 'block' }}>
                {activeKPI.label}
              </Typography>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                <span style={{ fontSize: 28, fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '0.15px' }}>
                  {activeKPI.displayValue}
                </span>
                <KPIPill
                  tone={toneFromStatus(activeKPI.status)}
                  trendValue={0}
                  value={activeKPI.status === 'green' ? 'On Track' : activeKPI.status === 'yellow' ? 'At Risk' : activeKPI.status === 'red' ? 'Critical' : 'No Data'}
                />
              </div>
              <Typography intent="body" style={{ color: 'var(--color-text-secondary)', display: 'block', marginTop: 4 }}>
                {KPI_DESCRIPTIONS[activeKPI.key]}
              </Typography>
            </TearsheetHeader>
            <TearsheetBody>
              <KPIDetailContent
                kpi={activeKPI}
                allResults={perProjectByKey[activeKPI.key] ?? []}
              />
            </TearsheetBody>
          </>
        )}
        </div>
      </Tearsheet>
    </>
  );
}
