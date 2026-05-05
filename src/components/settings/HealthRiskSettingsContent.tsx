/**
 * HEALTH & RISK SETTINGS CONTENT
 * Client-only content for the /settings/health-risk page.
 * Tabs: Risk Types · KPIs · Scope
 */

import Head from 'next/head';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import {
  Banner,
  Breadcrumbs,
  Button,
  DetailPage,
  H1,
  Modal,
  Pill,
  Select,
  Switch,
  Table,
  Tabs,
  Title,
  Toast,
  ToolLandingPage,
  Tooltip,
  Typography,
} from '@procore/core-react';
import { Info, Pencil, Plus, Trash, Warning } from '@procore/core-icons';
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

// ── Linked KPI text-link ───────────────────────────────────────────────────────

const KPILinkButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-action-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
  &:hover { color: var(--color-action-primary-hover, var(--color-action-primary)); }
`;

// ── Column header with tooltip ─────────────────────────────────────────────────

const HeaderWithTooltip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
`;

// ── Onboarding modal ──────────────────────────────────────────────────────────

const OnboardingStep = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StepperRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 28px;
`;

const StepItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: none;
`;

const StepCircle = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  background: ${(p) => (p.$completed ? 'var(--color-action-primary)' : p.$active ? '#fff' : 'var(--color-surface-secondary)')};
  border: 2px solid ${(p) => (p.$active || p.$completed ? 'var(--color-action-primary)' : 'var(--color-border-default)')};
  color: ${(p) => (p.$completed ? '#fff' : p.$active ? 'var(--color-action-primary)' : 'var(--color-text-secondary)')};
  flex-shrink: 0;
`;

const StepLabel = styled.div<{ $active: boolean }>`
  font-size: 11px;
  font-weight: ${(p) => (p.$active ? 700 : 500)};
  color: ${(p) => (p.$active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)')};
  white-space: nowrap;
  text-align: center;
`;

const StepConnector = styled.div<{ $completed: boolean }>`
  flex: 1;
  height: 2px;
  background: ${(p) => (p.$completed ? 'var(--color-action-primary)' : 'var(--color-border-separator)')};
  margin: 0 4px;
  margin-bottom: 18px;
`;

const STEP_LABELS = ['What is H&R?', 'Risk Types & KPIs', 'Getting Started'];

function OnboardingStepNav({ step }: { step: number }) {
  return (
    <StepperRow>
      {STEP_LABELS.map((label, i) => (
        <React.Fragment key={i}>
          <StepItem>
            <StepCircle $active={step === i} $completed={step > i}>
              {step > i ? '✓' : i + 1}
            </StepCircle>
            <StepLabel $active={step === i}>{label}</StepLabel>
          </StepItem>
          {i < STEP_LABELS.length - 1 && <StepConnector $completed={step > i} />}
        </React.Fragment>
      ))}
    </StepperRow>
  );
}

const ONBOARDING_STEPS = [
  {
    title: 'What is Risk Register?',
    body: (
      <OnboardingStep>
        <Typography intent="body" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
          Risk Register gives you a real-time view of project and portfolio health by automatically scoring each project across key dimensions — cost, schedule, delivery, and risk.
        </Typography>
        <Typography intent="body" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
          Each project receives a composite health score (Green, Yellow, or Red) based on how its KPIs compare to the thresholds you configure. You can see these scores on the Portfolio Hub, the Portfolio Health page, and each project's detail view.
        </Typography>
        <Banner variant="info">
          <Banner.Content>
            <Banner.Title>Designed for owners</Banner.Title>
            <Banner.Body>The Risk Register framework is built around the metrics that matter most to project owners — financial exposure, milestone delivery, and unmitigated risk.</Banner.Body>
          </Banner.Content>
        </Banner>
      </OnboardingStep>
    ),
  },
  {
    title: 'Risk Types & KPIs',
    body: (
      <OnboardingStep>
        <Typography intent="body" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
          <strong style={{ color: 'var(--color-text-primary)' }}>Risk Types</strong> define the categories of risk on your projects — financial, schedule, safety, regulatory, and more. Each risk type can be linked to specific data sources (e.g. Budget, RFIs) and to KPIs that measure that risk.
        </Typography>
        <Typography intent="body" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
          <strong style={{ color: 'var(--color-text-primary)' }}>KPIs (Key Performance Indicators)</strong> are the specific metrics used to calculate health scores. Examples include Budget Variance %, Schedule Days Behind, and Open Risk Count. You can configure thresholds and weights to reflect your organization's priorities.
        </Typography>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 }}>
          <div style={{ padding: 12, background: 'var(--color-surface-secondary)', borderRadius: 6, border: '1px solid var(--color-border-separator)' }}>
            <Typography intent="small" style={{ fontWeight: 700, color: 'var(--color-text-primary)', display: 'block', marginBottom: 4 }}>Risk Types</Typography>
            <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>Categorize project risks and link them to data sources &amp; KPIs</Typography>
          </div>
          <div style={{ padding: 12, background: 'var(--color-surface-secondary)', borderRadius: 6, border: '1px solid var(--color-border-separator)' }}>
            <Typography intent="small" style={{ fontWeight: 700, color: 'var(--color-text-primary)', display: 'block', marginBottom: 4 }}>KPIs</Typography>
            <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>Measurable indicators with yellow/red thresholds that drive health scores</Typography>
          </div>
        </div>
      </OnboardingStep>
    ),
  },
  {
    title: 'Getting Started',
    body: (
      <OnboardingStep>
        <Typography intent="body" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
          Follow these steps to set up the Risk Register for your organization:
        </Typography>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { num: '1', label: 'Review Risk Types', desc: 'Check the default risk types and edit or create new ones to match your business.' },
            { num: '2', label: 'Configure KPIs', desc: 'Toggle KPIs on/off, set yellow and red thresholds, and assign weights that reflect your priorities.' },
            { num: '3', label: 'Set Portfolio Scope', desc: 'Choose which projects are included in the portfolio health score.' },
            { num: '4', label: 'Review on the Hub', desc: 'Visit the Portfolio Hub → Risk Register tab to see health scores across all your projects.' },
          ].map(step => (
            <div key={step.num} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-action-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {step.num}
              </div>
              <div>
                <Typography intent="body" style={{ fontWeight: 600, color: 'var(--color-text-primary)', display: 'block' }}>{step.label}</Typography>
                <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>{step.desc}</Typography>
              </div>
            </div>
          ))}
        </div>
      </OnboardingStep>
    ),
  },
] as const;

function HealthRiskOnboardingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const total = ONBOARDING_STEPS.length;
  const current = ONBOARDING_STEPS[step];

  function handleClose() {
    setStep(0);
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} aria-label="Risk Register framework overview" style={{ width: 600 }}>
      <Modal.Header onClose={handleClose}>
        {current.title}
      </Modal.Header>
      <Modal.Body>
        <OnboardingStepNav step={step} />
        {current.body}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="tertiary" className="b_tertiary" onClick={handleClose}>
          Close
        </Button>
        <div style={{ display: 'flex', gap: 8 }}>
          {step > 0 && (
            <Button variant="secondary" className="b_secondary" onClick={() => setStep(s => s - 1)}>
              Back
            </Button>
          )}
          {step < total - 1 ? (
            <Button variant="primary" className="b_primary" onClick={() => setStep(s => s + 1)}>
              Next
            </Button>
          ) : (
            <Button variant="primary" className="b_primary" onClick={handleClose}>
              Get Started
            </Button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}

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

// ─── ConnectAccountsTable ─────────────────────────────────────────────────────

const ConnectTableWrapper = styled.div`
  border: 1px solid var(--color-border-default);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 16px;
`;

const ConnectTableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px 120px 1fr;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-separator);
  &:last-child { border-bottom: none; }
  &:first-child { background: var(--color-surface-secondary); font-weight: 600; font-size: 12px; color: var(--color-text-secondary); }
`;

function ConnectAccountsTable() {
  const { data } = useData();
  const accounts = data.account?.connectedAccounts ?? [];

  function formatDate(d: Date | null) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <ConnectTableWrapper>
      <ConnectTableRow>
        <Typography intent="small">Account</Typography>
        <Typography intent="small">Share Level</Typography>
        <Typography intent="small">Status</Typography>
        <Typography intent="small">Last Synced</Typography>
      </ConnectTableRow>
      {accounts.length === 0 && (
        <ConnectTableRow style={{ gridTemplateColumns: '1fr', fontWeight: 400, color: 'var(--color-text-secondary)', fontSize: 13 }}>
          <Typography intent="small">No connected accounts yet.</Typography>
        </ConnectTableRow>
      )}
      {accounts.map(acc => (
        <ConnectTableRow key={acc.id}>
          <div>
            <Typography intent="body" style={{ fontWeight: 500 }}>{acc.companyName}</Typography>
            <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>{acc.contactEmail}</Typography>
          </div>
          <Pill color={acc.shareLevel === 'detail' ? 'blue' : 'gray'}>
            {acc.shareLevel === 'detail' ? 'Detail' : 'Summary'}
          </Pill>
          <Pill color={acc.status === 'active' ? 'green' : acc.status === 'pending' ? 'yellow' : 'gray'}>
            {acc.status.charAt(0).toUpperCase() + acc.status.slice(1)}
          </Pill>
          <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
            {formatDate(acc.lastSyncedAt)}
          </Typography>
        </ConnectTableRow>
      ))}
    </ConnectTableWrapper>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = ['Risk Types', 'KPIs', 'Scope', 'Connect'] as const;
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

// Available calc type options per KPI (simplified — use single option per KPI for now)
const CALC_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'Variance %',        label: 'Variance %' },
  { value: 'Remaining %',       label: 'Remaining %' },
  { value: 'Count',             label: 'Count' },
  { value: 'Days Behind',       label: 'Days Behind' },
  { value: 'On-Time %',         label: 'On-Time %' },
  { value: 'Count (High-Prob)', label: 'Count (High-Prob)' },
  { value: 'Overdue Count',     label: 'Overdue Count' },
  { value: 'Overdue Days',      label: 'Overdue Days' },
  { value: 'Average (1–5)',     label: 'Average (1–5)' },
  { value: 'Sum ($M)',          label: 'Sum ($M)' },
];

const KPI_COLUMN_TOOLTIPS: { header: string; tooltip: string }[] = [
  { header: 'KPI',               tooltip: 'Name of the key performance indicator' },
  { header: 'Category',          tooltip: 'Health category this KPI belongs to' },
  { header: 'Calc Type',         tooltip: 'How the KPI value is derived from source data' },
  { header: 'Active',            tooltip: 'Toggle to include or exclude from portfolio health scoring' },
  { header: 'Yellow at',         tooltip: 'Threshold value that turns the KPI yellow (At Risk)' },
  { header: 'Red at',            tooltip: 'Threshold value that turns the KPI red (Critical)' },
  { header: 'Weight',            tooltip: 'Relative importance of this KPI in the composite health score (higher = more impact)' },
  { header: 'Linked Risk Types', tooltip: 'Risk types that use this KPI as a contributing factor' },
];

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
  const [onboardingOpen, setOnboardingOpen] = useState(false);

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
  const [calcTypes, setCalcTypes] = useState<Partial<Record<KPIKey, string>>>(
    () => {
      const init: Partial<Record<KPIKey, string>> = {};
      (Object.keys(KPI_CALC_LABELS) as KPIKey[]).forEach(k => { init[k] = KPI_CALC_LABELS[k]; });
      return init;
    }
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
      <Head><title>Risk Register Settings — Owner Prototype</title></Head>
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
                  <Breadcrumbs.Crumb active>Risk Register Configuration</Breadcrumbs.Crumb>
                </Breadcrumbs>
                <Title>
                  <Title.Text>
                    <H1 style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-text-primary)' }}>
                      <Warning size="md" style={{ color: 'var(--color-pill-text-yellow)' }} />
                      Risk Register Configuration
                      <Pill color="blue">Account Level</Pill>
                    </H1>
                  </Title.Text>
                  <Title.Actions>
                    {/* Onboarding guide — always visible */}
                    <Tooltip trigger="hover" placement="bottom" overlay={<Tooltip.Content>Learn how Risk Register works</Tooltip.Content>}>
                      <Button
                        variant="tertiary"
                        className="b_tertiary"
                        icon={<Info size="sm" />}
                        aria-label="Learn how Risk Register works"
                        onClick={() => setOnboardingOpen(true)}
                      >
                        How it works
                      </Button>
                    </Tooltip>
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
                              const linkedKPINames = rt.linkedKpiKeys.map(k => KPI_LABELS[k]).filter(Boolean);

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
                                    {kpiCount === 0 ? (
                                      <span style={{ color: 'var(--color-text-disabled)', fontSize: 13 }}>—</span>
                                    ) : (
                                      <Tooltip
                                        trigger="hover"
                                        placement="top"
                                        overlay={
                                          <Tooltip.Content>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140 }}>
                                              <Typography intent="small" style={{ fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: 4 }}>
                                                Linked KPIs
                                              </Typography>
                                              {linkedKPINames.map((name, i) => (
                                                <Typography key={i} intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                                                  • {name}
                                                </Typography>
                                              ))}
                                            </div>
                                          </Tooltip.Content>
                                        }
                                      >
                                        <KPILinkButton type="button" aria-label={`View ${kpiCount} linked KPI${kpiCount !== 1 ? 's' : ''}`}>
                                          {kpiCount} KPI{kpiCount !== 1 ? 's' : ''}
                                        </KPILinkButton>
                                      </Tooltip>
                                    )}
                                  </Table.BodyCell>
                                  <Table.BodyCell>
                                    <Switch
                                      checked={!rt.isHidden}
                                      onChange={() => handleToggleVisibility(rt.id)}
                                      aria-label={`${rt.isHidden ? 'Show' : 'Hide'} ${rt.label}`}
                                    />
                                  </Table.BodyCell>
                                  <Table.BodyCell>
                                    <span style={{ color: 'var(--color-text-secondary)', fontSize: 13, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: 300 }}>
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
                                {KPI_COLUMN_TOOLTIPS.map(({ header, tooltip }) => (
                                  <Table.HeaderCell key={header}>
                                    <HeaderWithTooltip>
                                      {header}
                                      <Tooltip
                                        trigger="hover"
                                        placement="top"
                                        overlay={<Tooltip.Content><div style={{ maxWidth: 200, whiteSpace: 'normal' }}>{tooltip}</div></Tooltip.Content>}
                                      >
                                        <span style={{ display: 'inline-flex', color: 'var(--color-text-secondary)', cursor: 'help' }}>
                                          <Info size="sm" />
                                        </span>
                                      </Tooltip>
                                    </HeaderWithTooltip>
                                  </Table.HeaderCell>
                                ))}
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
                                const currentCalcType = calcTypes[key] ?? KPI_CALC_LABELS[key];
                                const calcOption = CALC_TYPE_OPTIONS.find(o => o.value === currentCalcType) ?? CALC_TYPE_OPTIONS[0];

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
                                      <div style={{ minWidth: 140 }}>
                                        <Select
                                          label={calcOption.label}
                                          onSelect={({ item }) => {
                                            const opt = item as typeof CALC_TYPE_OPTIONS[0];
                                            setCalcTypes(prev => ({ ...prev, [key]: opt.value }));
                                          }}
                                        >
                                          {CALC_TYPE_OPTIONS.map(opt => (
                                            <Select.Option
                                              key={opt.value}
                                              value={opt}
                                              selected={currentCalcType === opt.value}
                                            >
                                              {opt.label}
                                            </Select.Option>
                                          ))}
                                        </Select>
                                      </div>
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
                              const init: Partial<Record<KPIKey, string>> = {};
                              (Object.keys(KPI_CALC_LABELS) as KPIKey[]).forEach(k => { init[k] = KPI_CALC_LABELS[k]; });
                              setCalcTypes(init);
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
                        <Typography intent="body" style={{ color: 'var(--color-text-secondary)', marginBottom: 16, display: 'block' }}>
                          Choose which projects are included in the portfolio health score. By default, all active projects are included.
                        </Typography>
                        <Banner variant="info" style={{ marginBottom: 20 }}>
                          <Banner.Content>
                            <Banner.Title>Project-level and user-level scoping</Banner.Title>
                            <Banner.Body>
                              Project managers can configure health scoring preferences per project. Individual users can also choose which health cards to display on their home hub. These controls are coming soon.
                            </Banner.Body>
                          </Banner.Content>
                        </Banner>
                        <FormRow>
                          <FormLabel>
                            <Typography intent="body" style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                              Include all active projects
                            </Typography>
                            <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                              Automatically includes all projects with status &ldquo;Active&rdquo; in the portfolio health score.
                            </Typography>
                          </FormLabel>
                          <Switch checked aria-label="Include all active projects" onChange={() => {}} />
                        </FormRow>
                        <FormRow>
                          <FormLabel>
                            <Typography intent="body" style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                              Exclude completed projects
                            </Typography>
                            <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                              Projects marked as complete are excluded from the portfolio health score.
                            </Typography>
                          </FormLabel>
                          <Switch checked aria-label="Exclude completed projects" onChange={() => {}} />
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
                        <FormRow>
                          <FormLabel>
                            <Typography intent="body" style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                              Minimum project value threshold
                            </Typography>
                            <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                              Only include projects above a minimum contract value in the portfolio score.
                            </Typography>
                          </FormLabel>
                          <Switch checked={false} aria-label="Minimum project value threshold" onChange={() => {}} />
                        </FormRow>
                        <FormRow>
                          <FormLabel>
                            <Typography intent="body" style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                              Limit by region
                            </Typography>
                            <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                              Limit portfolio health score to projects within specific regions. When enabled, configure included regions in the filter below.
                            </Typography>
                          </FormLabel>
                          <Switch checked={false} aria-label="Limit portfolio health by region" onChange={() => {}} />
                        </FormRow>
                        <SaveBar>
                          <Button variant="primary" className="b_primary">Save Changes</Button>
                        </SaveBar>
                      </DetailPage.Section>
                    </DetailPage.Card>
                  </TabBody>
                )}

                {/* ── Connect Tab ── */}
                {activeTab === 'Connect' && (
                  <TabBody>
                    <DetailPage.Card>
                      <DetailPage.Section heading="Procore Connect">
                        <Typography intent="body" style={{ color: 'var(--color-text-secondary)', marginBottom: 16, display: 'block' }}>
                          Procore Connect allows your Owner account to receive pre-aggregated health and risk data from General Contractor accounts.
                          GC data appears alongside your owner-managed projects in the portfolio health views.
                        </Typography>
                        <Banner variant="info" style={{ marginBottom: 20 }}>
                          <Banner.Content>
                            <Banner.Title>Connected accounts receive read-only health summaries</Banner.Title>
                            <Banner.Body>
                              GC accounts control what data they share. You can view health status and risk exposure at the detail or summary level,
                              depending on the share level granted by each GC.
                            </Banner.Body>
                          </Banner.Content>
                        </Banner>
                        <ConnectAccountsTable />
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
            <Toast.Text>Risk Register settings saved</Toast.Text>
            <Toast.Dismiss onClick={() => setShowToast(false)} aria-label="Dismiss" />
          </Toast>
        </ToastContainer>
      )}

      {/* ── Onboarding modal ── */}
      <HealthRiskOnboardingModal open={onboardingOpen} onClose={() => setOnboardingOpen(false)} />

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
