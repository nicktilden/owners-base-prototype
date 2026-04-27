/**
 * HEALTH & RISK SETTINGS CONTENT
 * Client-only content for the /settings/health-risk page.
 * Tabs: Risk Types · KPIs · Scope
 */

import Head from 'next/head';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import {
  Banner,
  Breadcrumbs,
  Button,
  DetailPage,
  H1,
  Pill,
  Switch,
  Table,
  Tabs,
  Title,
  Toast,
  ToolLandingPage,
  Typography,
} from '@procore/core-react';
import { Pencil, Plus, Trash, Warning } from '@procore/core-icons';
import styled from 'styled-components';
import { KPI_LABELS, KPI_CATEGORY_MAP, DEFAULT_THRESHOLDS } from '@/types/health';
import type { KPIKey, KPIThreshold, AccountHealthConfig, RiskType, RiskTypeCategory } from '@/types/health';
import { useData } from '@/context/DataContext';
import AppLayout from '@/components/nav/AppLayout';
import KPICreationWizard from '@/components/health/KPICreationWizard';
import RiskTypeTearsheet from '@/components/settings/RiskTypeTearsheet';

const GlobalHeader = dynamic(() => import('@/components/nav/GlobalHeader'), { ssr: false });

// ─── Styled ───────────────────────────────────────────────────────────────────

const TabBody = styled.div`
  padding-top: 24px;
`;

const FormRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border-separator);
  gap: 16px;
  &:last-child { border-bottom: none; }
`;

const FormLabel = styled.div`
  flex: 1;
  min-width: 0;
`;

const SaveBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 0;
  margin-top: 16px;
  border-top: 1px solid var(--color-border-separator);
`;

const TabContent = styled.div`
  padding: 16px 24px 24px;
`;

const ToastContainer = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  min-width: 260px;
`;

// ── KPI table ─────────────────────────────────────────────────────────────────

/** Wrapper that overrides core-react Table cell height and horizontal padding. */
const SettingsTableWrap = styled.div`
  td {
    height: 48px;
    padding-left: 8px;
    padding-right: 8px;
  }
  th {
    padding-left: 8px;
    padding-right: 8px;
  }
`;

const ThresholdInput = styled.input`
  width: 56px;
  padding: 4px 6px;
  border: 1px solid var(--color-border-default);
  border-radius: 4px;
  font-size: 13px;
  text-align: center;
  color: var(--color-text-primary);
  background: var(--color-surface-primary);
  &:focus { outline: 2px solid var(--color-border-focus); }
`;

const KPIStatusDot = styled.span<{ $active: boolean }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $active }) => $active ? 'var(--color-green-600, #16a34a)' : 'var(--color-text-disabled, #9ca3af)'};
  flex-shrink: 0;
`;

// ─── Category pill color maps ──────────────────────────────────────────────────
// Only use pill colors already established in this project: blue, gray, green, red, yellow, cyan, magenta

type ProjPillColor = 'blue' | 'gray' | 'green' | 'red' | 'yellow' | 'cyan' | 'magenta';

const RISK_CATEGORY_PILL: Record<RiskTypeCategory, ProjPillColor> = {
  financial:     'green',
  schedule:      'blue',
  safety:        'red',
  quality:       'yellow',
  regulatory:    'cyan',
  environmental: 'green',
  contractual:   'magenta',
  other:         'gray',
};

const KPI_CATEGORY_PILL: Record<string, ProjPillColor> = {
  cost:     'green',
  schedule: 'blue',
  delivery: 'cyan',
  risk:     'red',
};

const KPI_CATEGORY_DISPLAY: Record<string, string> = {
  cost:     'Cost',
  schedule: 'Schedule',
  delivery: 'Delivery',
  risk:     'Risk',
};

const CATEGORY_DISPLAY_LABELS: Record<RiskTypeCategory, string> = {
  financial:     'Cost / Financial',
  schedule:      'Schedule',
  safety:        'Safety',
  quality:       'Quality',
  regulatory:    'Regulatory',
  environmental: 'Environmental',
  contractual:   'Contractual',
  other:         'Other',
};

const SOURCE_DISPLAY_LABELS: Record<string, string> = {
  budget:         'Budget',
  schedule:       'Schedule',
  rfis:           'RFIs',
  submittals:     'Submittals',
  change_events:  'Change Events',
  observations:   'Observations',
  inspections:    'Inspections',
  punch_list:     'Punch List',
  action_plans:   'Action Plans',
};

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = ['Risk Types', 'KPIs', 'Scope'] as const;
type SettingsTab = typeof TABS[number];

const KPI_CALC_LABELS: Record<KPIKey, string> = {
  budgetVariance:       'Variance %',
  remainingContingency: 'Remaining %',
  changeEvents:         'Count',
  forecastToComplete:   'Variance %',
  costAtCompletion:     'Variance %',
  scheduleStatus:       'Days Behind',
  milestoneRate:        'On-Time %',
  scheduleVariance:     'Days Behind',
  aggregateRisk:        'Count (High-Prob)',
  rfisAtRisk:           'Overdue Count',
  submittalsAtRisk:     'Overdue Count',
  invoiceStatus:        'Overdue Days',
  avgRiskSeverity:      'Average (1–5)',
  financialExposure:    'Sum ($M)',
  openRiskCount:        'Count',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildInitialThresholds(config: AccountHealthConfig): Record<KPIKey, KPIThreshold> {
  const allKeys = Object.keys(KPI_LABELS) as KPIKey[];
  const result = {} as Record<KPIKey, KPIThreshold>;
  for (const key of allKeys) {
    result[key] = config.thresholds[key] ?? DEFAULT_THRESHOLDS[key];
  }
  return result;
}

function buildInitialWeights(config: AccountHealthConfig): Partial<Record<KPIKey, number>> {
  return { ...config.kpiWeights };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HealthRiskSettingsContent() {
  const router = useRouter();
  const { data, setData } = useData();
  const config = data.account?.healthConfig;
  const [activeTab, setActiveTab] = useState<SettingsTab>('Risk Types');
  const [showToast, setShowToast] = useState(false);

  // ── KPIs tab state
  const [activeKPIs, setActiveKPIs] = useState<Set<KPIKey>>(
    new Set(config?.activeKPIs ?? [])
  );
  const [thresholds, setThresholds] = useState<Record<KPIKey, KPIThreshold>>(
    () => config ? buildInitialThresholds(config) : ({} as Record<KPIKey, KPIThreshold>)
  );
  const [kpiWeights, setKpiWeights] = useState<Partial<Record<KPIKey, number>>>(
    () => config ? buildInitialWeights(config) : {}
  );

  // ── Risk Types state
  const [riskTypes, setRiskTypes] = useState<RiskType[]>(data.account?.riskTypes ?? []);
  const [tearsheetRiskType, setTearsheetRiskType] = useState<RiskType | 'new' | null>(null);

  // ── KPI Wizard state
  const [showKPIWizard, setShowKPIWizard] = useState(false);

  const allKPIKeys = Object.keys(KPI_LABELS) as KPIKey[];

  function triggerToast() {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }

  function persistConfig(partial: Partial<AccountHealthConfig>) {
    if (!data.account) return;
    setData({
      ...data,
      account: {
        ...data.account,
        healthConfig: { ...data.account.healthConfig, ...partial },
      },
    });
    triggerToast();
  }

  function handleRiskTypeSave(rt: RiskType) {
    const isNew = tearsheetRiskType === 'new';
    const updated: RiskType[] = isNew
      ? [...riskTypes, rt]
      : riskTypes.map(existing => existing.id === rt.id ? rt : existing);
    setRiskTypes(updated);
    if (!data.account) return;
    setData({ ...data, account: { ...data.account, riskTypes: updated } });
    setTearsheetRiskType(null);
    triggerToast();
  }

  function handleToggleVisibility(id: string) {
    const updated = riskTypes.map(rt =>
      rt.id === id ? { ...rt, isHidden: !rt.isHidden } : rt
    );
    setRiskTypes(updated);
    if (!data.account) return;
    setData({ ...data, account: { ...data.account, riskTypes: updated } });
  }

  function handleDeleteRiskType(id: string) {
    const updated = riskTypes.filter(rt => rt.id !== id);
    setRiskTypes(updated);
    if (!data.account) return;
    setData({ ...data, account: { ...data.account, riskTypes: updated } });
  }

  function saveKPIs() {
    persistConfig({
      activeKPIs: [...activeKPIs],
      thresholds: { ...thresholds },
      kpiWeights: { ...kpiWeights },
    });
  }

  if (!config) return null;

  const tearsheetOpen = tearsheetRiskType !== null;
  const tearsheetTarget = tearsheetRiskType === 'new' ? null : tearsheetRiskType;

  return (
    <>
      <Head><title>Health &amp; Risk Settings — Owner Prototype</title></Head>
      <GlobalHeader />
      <AppLayout>
        <ToolLandingPage style={{ background: 'var(--color-surface-secondary)' }}>
          <ToolLandingPage.Main style={{ background: 'var(--color-surface-primary)' }}>

            <ToolLandingPage.Header style={{ background: 'var(--color-surface-primary)', borderBottom: '1px solid var(--color-border-separator)' }}>
              <ToolLandingPage.Title style={{ background: 'var(--color-surface-primary)' }}>
                <Breadcrumbs variant="list" style={{ color: 'var(--color-text-secondary)' }}>
                  <Breadcrumbs.Crumb>
                    <a
                      href="/settings"
                      style={{ color: 'var(--color-text-secondary)' }}
                      onClick={(e) => { e.preventDefault(); router.push('/settings'); }}
                    >
                      Settings
                    </a>
                  </Breadcrumbs.Crumb>
                  <Breadcrumbs.Crumb active>Health &amp; Risk Configuration</Breadcrumbs.Crumb>
                </Breadcrumbs>
                <Title>
                  <Title.Text>
                    <H1 style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-text-primary)' }}>
                      <Warning size="md" style={{ color: 'var(--color-pill-text-yellow)' }} />
                      Health &amp; Risk Configuration
                      <Pill color="blue">Account Level</Pill>
                    </H1>
                  </Title.Text>
                  <Title.Actions>
                    {activeTab === 'Risk Types' && (
                      <Button
                        variant="primary"
                        className="b_primary"
                        icon={<Plus size="sm" />}
                        onClick={() => setTearsheetRiskType('new')}
                      >
                        Create Risk Type
                      </Button>
                    )}
                    {activeTab === 'KPIs' && (
                      <Button
                        variant="primary"
                        className="b_primary"
                        icon={<Plus size="sm" />}
                        onClick={() => setShowKPIWizard(true)}
                      >
                        Create KPI
                      </Button>
                    )}
                  </Title.Actions>
                </Title>
                <Typography intent="body" style={{ color: 'var(--color-text-secondary)', display: 'block', marginTop: 4 }}>
                  Define Risk Types, configure KPIs and scoring thresholds, and set portfolio scope. These settings apply to all projects unless overridden at the project level.
                </Typography>
              </ToolLandingPage.Title>

              <ToolLandingPage.Tabs style={{ background: 'var(--color-surface-primary)', borderColor: 'var(--color-border-separator)' }}>
                <Tabs>
                  {TABS.map(tab => (
                    <Tabs.Tab key={tab} role="button" selected={activeTab === tab} onPress={() => setActiveTab(tab)}>
                      {tab}
                    </Tabs.Tab>
                  ))}
                </Tabs>
              </ToolLandingPage.Tabs>
            </ToolLandingPage.Header>

            <ToolLandingPage.Body style={{ background: 'var(--color-surface-secondary)' }}>
              <TabContent>

                {/* ── Risk Types Tab ── */}
                {activeTab === 'Risk Types' && (
                  <TabBody>
                    <DetailPage.Card>
                      <DetailPage.Section heading="Risk Types">
                      <SettingsTableWrap>
                      <Table.Container>
                        <Table>
                          <Table.Header>
                            <Table.HeaderRow>
                              <Table.HeaderCell>Name</Table.HeaderCell>
                              <Table.HeaderCell>Category</Table.HeaderCell>
                              <Table.HeaderCell>Source Data</Table.HeaderCell>
                              <Table.HeaderCell>Linked KPIs</Table.HeaderCell>
                              <Table.HeaderCell>Visible</Table.HeaderCell>
                              <Table.HeaderCell>Description</Table.HeaderCell>
                              <Table.HeaderCell snugfit aria-label="Actions" />
                            </Table.HeaderRow>
                          </Table.Header>
                          <Table.Body>
                            {riskTypes.map(rt => {
                              const sources = rt.sourceData.map(s => SOURCE_DISPLAY_LABELS[s] ?? s);
                              const sourceSummary = sources.length <= 2
                                ? sources.join(', ')
                                : `${sources.slice(0, 2).join(', ')} +${sources.length - 2}`;
                              const kpiCount = rt.linkedKpiKeys.length;

                              return (
                                <Table.BodyRow key={rt.id}>
                                  <Table.BodyCell>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                      <span style={{ fontWeight: 600 }}>{rt.label}</span>
                                      {rt.isDefault && (
                                        <Pill color="gray" style={{ fontSize: 10 }}>Default</Pill>
                                      )}
                                    </div>
                                  </Table.BodyCell>
                                  <Table.BodyCell>
                                    <Pill color={RISK_CATEGORY_PILL[rt.category]} style={{ fontSize: 11 }}>
                                      {CATEGORY_DISPLAY_LABELS[rt.category]}
                                    </Pill>
                                  </Table.BodyCell>
                                  <Table.BodyCell>
                                    <span style={{ color: sources.length === 0 ? 'var(--color-text-disabled)' : 'var(--color-text-secondary)', fontSize: 13 }}>
                                      {sources.length === 0 ? '—' : sourceSummary}
                                    </span>
                                  </Table.BodyCell>
                                  <Table.BodyCell>
                                    <span style={{ color: kpiCount === 0 ? 'var(--color-text-disabled)' : 'var(--color-text-secondary)', fontSize: 13 }}>
                                      {kpiCount === 0 ? '—' : `${kpiCount} KPI${kpiCount !== 1 ? 's' : ''}`}
                                    </span>
                                  </Table.BodyCell>
                                  <Table.BodyCell>
                                    <Switch
                                      checked={!rt.isHidden}
                                      onChange={() => handleToggleVisibility(rt.id)}
                                      aria-label={`${rt.isHidden ? 'Show' : 'Hide'} ${rt.label}`}
                                    />
                                  </Table.BodyCell>
                                  <Table.BodyCell>
                                    <span style={{ color: 'var(--color-text-secondary)', fontSize: 13, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                      {rt.description || '—'}
                                    </span>
                                  </Table.BodyCell>
                                  <Table.BodyCell snugfit>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <Button
                                        variant="tertiary"
                                        size="sm"
                                        icon={<Pencil size="sm" />}
                                        aria-label={`Edit ${rt.label}`}
                                        onClick={() => setTearsheetRiskType(rt)}
                                      />
                                      {!rt.isDefault && (
                                        <Button
                                          variant="tertiary"
                                          size="sm"
                                          icon={<Trash size="sm" />}
                                          aria-label={`Delete ${rt.label}`}
                                          onClick={() => handleDeleteRiskType(rt.id)}
                                        />
                                      )}
                                    </div>
                                  </Table.BodyCell>
                                </Table.BodyRow>
                              );
                            })}
                          </Table.Body>
                        </Table>
                      </Table.Container>
                      </SettingsTableWrap>
                      </DetailPage.Section>
                    </DetailPage.Card>
                  </TabBody>
                )}

                {/* ── KPIs Tab ── */}
                {activeTab === 'KPIs' && (
                  <TabBody>
                    <DetailPage.Card>
                      <DetailPage.Section heading="KPIs">
                        <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 16 }}>
                          Toggle KPIs on or off, set yellow/red thresholds, and assign weights. Changes take effect when you save.
                        </Typography>
                        <SettingsTableWrap>
                        <Table.Container>
                          <Table>
                            <Table.Header>
                              <Table.HeaderRow>
                                <Table.HeaderCell>KPI</Table.HeaderCell>
                                <Table.HeaderCell>Category</Table.HeaderCell>
                                <Table.HeaderCell>Calc Type</Table.HeaderCell>
                                <Table.HeaderCell>Active</Table.HeaderCell>
                                <Table.HeaderCell>Yellow at</Table.HeaderCell>
                                <Table.HeaderCell>Red at</Table.HeaderCell>
                                <Table.HeaderCell>Weight</Table.HeaderCell>
                                <Table.HeaderCell>Linked Risk Types</Table.HeaderCell>
                              </Table.HeaderRow>
                            </Table.Header>
                            <Table.Body>
                              {allKPIKeys.map(key => {
                                const isActive = activeKPIs.has(key);
                                const thr = thresholds[key] ?? DEFAULT_THRESHOLDS[key];
                                const cat = KPI_CATEGORY_MAP[key];
                                const linked = riskTypes
                                  .filter(rt => rt.linkedKpiKeys.includes(key))
                                  .map(rt => rt.label);

                                return (
                                  <Table.BodyRow key={key} style={{ opacity: isActive ? 1 : 0.5 }}>
                                    <Table.BodyCell>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <KPIStatusDot $active={isActive} />
                                        <span style={{ fontWeight: 500, fontSize: 13 }}>{KPI_LABELS[key]}</span>
                                      </div>
                                    </Table.BodyCell>
                                    <Table.BodyCell>
                                      <Pill color={KPI_CATEGORY_PILL[cat] ?? 'gray'} style={{ fontSize: 11 }}>
                                        {KPI_CATEGORY_DISPLAY[cat] ?? cat.charAt(0).toUpperCase() + cat.slice(1)}
                                      </Pill>
                                    </Table.BodyCell>
                                    <Table.BodyCell>
                                      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                                        {KPI_CALC_LABELS[key]}
                                      </span>
                                    </Table.BodyCell>
                                    <Table.BodyCell>
                                      <Switch
                                        checked={isActive}
                                        onChange={() => {
                                          setActiveKPIs(prev => {
                                            const next = new Set(prev);
                                            if (next.has(key)) { next.delete(key); } else { next.add(key); }
                                            return next;
                                          });
                                        }}
                                        aria-label={`${isActive ? 'Deactivate' : 'Activate'} ${KPI_LABELS[key]}`}
                                      />
                                    </Table.BodyCell>
                                    <Table.BodyCell>
                                      <ThresholdInput
                                        type="number"
                                        value={thr.yellow}
                                        onChange={e => setThresholds(prev => ({
                                          ...prev,
                                          [key]: { ...prev[key], yellow: Number(e.target.value) },
                                        }))}
                                        aria-label={`Yellow threshold for ${KPI_LABELS[key]}`}
                                        style={{ borderColor: 'var(--color-yellow-400, #facc15)' }}
                                      />
                                    </Table.BodyCell>
                                    <Table.BodyCell>
                                      <ThresholdInput
                                        type="number"
                                        value={thr.red}
                                        onChange={e => setThresholds(prev => ({
                                          ...prev,
                                          [key]: { ...prev[key], red: Number(e.target.value) },
                                        }))}
                                        aria-label={`Red threshold for ${KPI_LABELS[key]}`}
                                        style={{ borderColor: 'var(--color-red-400, #f87171)' }}
                                      />
                                    </Table.BodyCell>
                                    <Table.BodyCell>
                                      <ThresholdInput
                                        type="number"
                                        value={kpiWeights[key] ?? 0}
                                        onChange={e => setKpiWeights(prev => ({
                                          ...prev,
                                          [key]: Number(e.target.value),
                                        }))}
                                        aria-label={`Weight for ${KPI_LABELS[key]}`}
                                      />
                                    </Table.BodyCell>
                                    <Table.BodyCell>
                                      <span style={{ fontSize: 12, color: linked.length === 0 ? 'var(--color-text-disabled)' : 'var(--color-text-secondary)' }}>
                                        {linked.length === 0 ? '—' : linked.join(', ')}
                                      </span>
                                    </Table.BodyCell>
                                  </Table.BodyRow>
                                );
                              })}
                            </Table.Body>
                          </Table>
                        </Table.Container>
                        </SettingsTableWrap>
                        <SaveBar>
                          <Button variant="secondary" className="b_secondary" onClick={() => {
                            if (config) {
                              setThresholds(buildInitialThresholds(config));
                              setKpiWeights(buildInitialWeights(config));
                              setActiveKPIs(new Set(config.activeKPIs));
                            }
                          }}>
                            Reset
                          </Button>
                          <Button variant="primary" className="b_primary" onClick={saveKPIs}>
                            Save Changes
                          </Button>
                        </SaveBar>
                      </DetailPage.Section>
                    </DetailPage.Card>
                  </TabBody>
                )}

                {/* ── Scope Tab ── */}
                {activeTab === 'Scope' && (
                  <TabBody>
                    <DetailPage.Card>
                      <DetailPage.Section heading="Portfolio Scope">
                        <Typography intent="body" style={{ color: 'var(--color-text-secondary)', marginBottom: 20, display: 'block' }}>
                          Choose which projects are included in the portfolio health score. By default, all active projects are included.
                        </Typography>
                        <FormRow>
                          <FormLabel>
                            <Typography intent="body" style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                              Include all active projects
                            </Typography>
                            <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                              Automatically includes all projects with status "Active" in the portfolio health score.
                            </Typography>
                          </FormLabel>
                          <Switch checked aria-label="Include all active projects" onChange={() => {}} />
                        </FormRow>
                        <FormRow>
                          <FormLabel>
                            <Typography intent="body" style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                              Include on-hold projects
                            </Typography>
                            <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                              On-hold projects are included in the score but flagged with a hold indicator.
                            </Typography>
                          </FormLabel>
                          <Switch checked={false} aria-label="Include on-hold projects" onChange={() => {}} />
                        </FormRow>
                        <FormRow>
                          <FormLabel>
                            <Typography intent="body" style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                              Project-level overrides
                            </Typography>
                            <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                              Allow project managers to configure KPI weights and thresholds for their specific project.
                            </Typography>
                          </FormLabel>
                          <Switch checked={false} aria-label="Allow project-level overrides" onChange={() => {}} />
                        </FormRow>
                        <Banner variant="info" style={{ marginTop: 16 }}>
                          <Banner.Content>
                            <Banner.Title>Project-level and user-level scoping</Banner.Title>
                            <Banner.Body>
                              Project managers can configure health scoring preferences per project. Individual users can also choose which health cards to display on their home hub. These controls are coming soon.
                            </Banner.Body>
                          </Banner.Content>
                        </Banner>
                        <SaveBar>
                          <Button variant="primary" className="b_primary">Save Changes</Button>
                        </SaveBar>
                      </DetailPage.Section>
                    </DetailPage.Card>
                  </TabBody>
                )}

              </TabContent>
            </ToolLandingPage.Body>

          </ToolLandingPage.Main>
        </ToolLandingPage>
      </AppLayout>

      {/* ── Toast notification ── */}
      {showToast && (
        <ToastContainer>
          <Toast variant="success">
            <Toast.Text>Health &amp; Risk settings saved</Toast.Text>
            <Toast.Dismiss onClick={() => setShowToast(false)} aria-label="Dismiss" />
          </Toast>
        </ToastContainer>
      )}

      {/* ── Risk Type Tearsheet ── */}
      <RiskTypeTearsheet
        open={tearsheetOpen}
        riskType={tearsheetTarget}
        onClose={() => setTearsheetRiskType(null)}
        onSave={handleRiskTypeSave}
      />

      {/* ── KPI Creation Wizard ── */}
      <KPICreationWizard
        open={showKPIWizard}
        onClose={() => setShowKPIWizard(false)}
        onSaved={() => triggerToast()}
      />
    </>
  );
}
