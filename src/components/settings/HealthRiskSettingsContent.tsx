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
  Box,
  Breadcrumbs,
  Button,
  Card,
  DetailPage,
  H1,
  H2,
  Modal,
  Page,
  Pill,
  NumberInput,
  Select,
  Switch,
  Table,
  TextInput,
  Tabs,
  Tearsheet,
  Title,
  Toast,
  ToolLandingPage,
  Tooltip,
  Typography,
} from '@procore/core-react';
import { Info, Pencil, Plus, Trash, Warning } from '@procore/core-icons';
import type { AutomationRule } from '@/types/automation';
import { automationRules as seedAutomationRules } from '@/data/seed/automationRules';
import styled, { createGlobalStyle } from 'styled-components';
import { KPI_LABELS, KPI_CATEGORY_MAP, DEFAULT_THRESHOLDS } from '@/types/health';
import type { KPIKey, KPIThreshold, AccountHealthConfig, RiskType, RiskTypeCategory } from '@/types/health';
import { useData } from '@/context/DataContext';
import AppLayout from '@/components/nav/AppLayout';
import KPICreationWizard from '@/components/health/KPICreationWizard';
import RiskTypeTearsheet from '@/components/settings/RiskTypeTearsheet';
import KPIEditTearsheet from '@/components/settings/KPIEditTearsheet';
import type { KPIEditValues } from '@/components/settings/KPIEditTearsheet';

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

// ─── Automation Rules Tab ─────────────────────────────────────────────────────

// ─── Automation tearsheet width ───────────────────────────────────────────────

const AutomationTearsheetWidth = createGlobalStyle`
  [class*="StyledTearsheetBody"]:has(> .automation-rule-editor-root) {
    flex: 0 0 auto !important;
    width: 60vw !important;
    max-width: 900px !important;
  }
`;

// ─── Condition formatter ──────────────────────────────────────────────────────

const FIELD_LABELS: Record<string, string> = {
  currentEstimate:      'Current Estimate',
  criticalPath:         'Critical Path',
  daysInCurrentReview:  'Days In Current Review',
  status:               'Status',
  cause:                'Cause',
  oshaRecordable:       'OSHA Recordable',
  incidentType:         'Incident Type',
  daysOpen:             'Days Open',
  overdueDays:          'Overdue Days',
  probability:          'Probability',
  impact:               'Impact',
};

const OPERATOR_LABELS: Record<string, string> = {
  gt:       '>',
  lt:       '<',
  gte:      '≥',
  lte:      '≤',
  eq:       '=',
  neq:      '≠',
  contains: 'contains',
  aging_gt: 'aging >',
};

function formatConditionValue(value: number | string | boolean): string {
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (typeof value === 'number') return value >= 1000 ? `$${value.toLocaleString()}` : String(value);
  // snake_case → Title Case
  return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatConditions(conditions: { field: string; operator: string; value: number | string | boolean }[]): string {
  return conditions
    .map(c => {
      const field = FIELD_LABELS[c.field] ?? c.field.replace(/_/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
      const op = OPERATOR_LABELS[c.operator] ?? c.operator;
      const val = formatConditionValue(c.value);
      return `${field} ${op} ${val}`;
    })
    .join(' AND ');
}

// ─── Editor section card ──────────────────────────────────────────────────────

const EditorSectionCard = styled(Card)`
  padding: 20px 24px;
  background: var(--color-surface-primary);
  margin-bottom: 16px;
`;

const SOURCE_LABELS: Record<string, string> = {
  change_event: 'Change Event', rfi: 'RFI', submittal: 'Submittal',
  punch_list: 'Punch List', milestone: 'Milestone', incident: 'Incident',
  observation: 'Observation', correspondence: 'Correspondence', budget_line: 'Budget Line',
};

const WORKFLOW_OPTIONS: { value: string; label: string }[] = [
  { value: 'wf-change-mgmt',   label: 'Change Management Approval' },
  { value: 'wf-budget-change', label: 'Budget Change Approval' },
  { value: 'wf-schedule-esc',  label: 'Schedule Escalation' },
  { value: 'wf-scope-change',  label: 'Scope Change Approval' },
  { value: 'wf-csuite',        label: 'C-Suite Override' },
];

const STATUS_PILL: Record<string, 'green' | 'gray' | 'blue'> = {
  active: 'green', inactive: 'gray', draft: 'blue',
};

function formatLastFired(rule: AutomationRule): string {
  if (!rule.lastFiredAt) return '—';
  const now = new Date('2026-05-04');
  const diffMs = now.getTime() - rule.lastFiredAt.getTime();
  const diffHrs = Math.floor(diffMs / 3600000);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

function AutomationRulesTab({ triggerCreate }: { triggerCreate: number }) {
  const [rules, setRules] = useState<AutomationRule[]>(seedAutomationRules);
  const [editRule, setEditRule] = useState<AutomationRule | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  React.useEffect(() => {
    if (triggerCreate > 0) {
      setEditRule(null);
      setShowEditor(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerCreate]);

  function openEdit(rule: AutomationRule) {
    setEditRule(rule);
    setShowEditor(true);
  }

  function handleDelete(id: string) {
    setRules(prev => prev.filter(r => r.id !== id));
  }

  return (
    <TabBody>
      <DetailPage.Card>
        <DetailPage.Section heading="Automation Rules">
          <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 16 }}>
            Rules evaluate source items automatically. When conditions match, the rule creates a risk tag and optionally triggers an approval workflow.
          </Typography>
          <SettingsTableWrap>
            <Table.Container>
              <Table>
                <Table.Header>
                  <Table.HeaderRow>
                    <Table.HeaderCell>Rule</Table.HeaderCell>
                    <Table.HeaderCell>Source</Table.HeaderCell>
                    <Table.HeaderCell>Conditions</Table.HeaderCell>
                    <Table.HeaderCell>Actions</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell>Last Fired</Table.HeaderCell>
                    <Table.HeaderCell snugfit aria-label="Actions" />
                  </Table.HeaderRow>
                </Table.Header>
                <Table.Body>
                  {rules.map(rule => (
                    <Table.BodyRow key={rule.id}>
                      <Table.BodyCell>
                        <span style={{ fontWeight: 500, fontSize: 13 }}>{rule.name}</span>
                      </Table.BodyCell>
                      <Table.BodyCell>
                        <span style={{ fontSize: 13 }}>{SOURCE_LABELS[rule.sourceType] ?? rule.sourceType}</span>
                      </Table.BodyCell>
                      <Table.BodyCell>
                        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                          {formatConditions(rule.conditions)}
                        </span>
                      </Table.BodyCell>
                      <Table.BodyCell>
                        <span style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
                          {[
                            rule.taggingAction ? 'Tagged' : null,
                            rule.workflowAction ? 'Workflow' : null,
                          ].filter(Boolean).join(' + ') || '—'}
                        </span>
                      </Table.BodyCell>
                      <Table.BodyCell>
                        <Pill color={STATUS_PILL[rule.status] ?? 'gray'} style={{ fontSize: 11, display: 'inline-flex' }}>
                          {rule.status.charAt(0).toUpperCase() + rule.status.slice(1)}
                        </Pill>
                      </Table.BodyCell>
                      <Table.BodyCell>
                        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                          {formatLastFired(rule)}{rule.fireCount > 0 ? ` · ${rule.fireCount}×` : ''}
                        </span>
                      </Table.BodyCell>
                      <Table.BodyCell>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <Button variant="tertiary" size="sm" className="b_tertiary" icon={<Pencil />} onClick={() => openEdit(rule)} aria-label="Edit rule" />
                          <Button variant="tertiary" size="sm" className="b_tertiary" icon={<Trash />} onClick={() => handleDelete(rule.id)} aria-label="Delete rule" />
                        </div>
                      </Table.BodyCell>
                    </Table.BodyRow>
                  ))}
                </Table.Body>
              </Table>
            </Table.Container>
          </SettingsTableWrap>
        </DetailPage.Section>
      </DetailPage.Card>

      {showEditor && (
        <AutomationRuleEditor
          rule={editRule}
          onClose={() => setShowEditor(false)}
          onSave={(updated) => {
            if (editRule) {
              setRules(prev => prev.map(r => r.id === updated.id ? updated : r));
            } else {
              setRules(prev => [...prev, updated]);
            }
            setShowEditor(false);
          }}
        />
      )}
    </TabBody>
  );
}

// ─── Automation Rule Editor Modal ─────────────────────────────────────────────

const RULE_SOURCE_OPTIONS = [
  { value: 'change_event', label: 'Change Event' },
  { value: 'rfi', label: 'RFI' },
  { value: 'submittal', label: 'Submittal' },
  { value: 'punch_list', label: 'Punch List' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'incident', label: 'Incident' },
  { value: 'observation', label: 'Observation' },
];

const CONDITION_OPERATORS = [
  { value: 'gt', label: 'is greater than' },
  { value: 'lt', label: 'is less than' },
  { value: 'gte', label: 'is ≥' },
  { value: 'lte', label: 'is ≤' },
  { value: 'eq', label: 'equals' },
  { value: 'neq', label: 'does not equal' },
  { value: 'aging_gt', label: 'is aging >' },
];

// ─── Per-source attribute definitions ────────────────────────────────────────
//
// Each attribute has:
//   label      – human-readable name shown in "Select Attribute" dropdown
//   operators  – which operators apply
//   valueType  – 'number' | 'boolean' | 'select' | 'text'
//   options    – for valueType === 'select', the list of choices
//   placeholder – hint for number/text inputs

interface AttrDef {
  field: string;
  label: string;
  operators: string[];
  valueType: 'number' | 'boolean' | 'select' | 'text';
  options?: { value: string | number | boolean; label: string }[];
  placeholder?: string;
}

const NUMERIC_OPS = ['gt', 'lt', 'gte', 'lte', 'eq', 'neq'];
const AGING_OPS   = ['aging_gt', 'gt', 'lt'];
const EQ_OPS      = ['eq', 'neq'];

const SOURCE_ATTRIBUTES: Record<string, AttrDef[]> = {
  change_event: [
    { field: 'currentEstimate', label: 'Current Estimate ($)', operators: NUMERIC_OPS, valueType: 'number', placeholder: 'e.g. 250000' },
    { field: 'cause', label: 'Cause', operators: EQ_OPS, valueType: 'select', options: [
      { value: 'owner_driven', label: 'Owner Driven' },
      { value: 'design_error', label: 'Design Error' },
      { value: 'differing_site_conditions', label: 'Differing Site Conditions' },
      { value: 'scope_change', label: 'Scope Change' },
      { value: 'unforeseen', label: 'Unforeseen Conditions' },
    ]},
    { field: 'status', label: 'Status', operators: EQ_OPS, valueType: 'select', options: [
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
    ]},
    { field: 'daysOpen', label: 'Days Open', operators: AGING_OPS, valueType: 'number', placeholder: 'e.g. 30' },
  ],
  rfi: [
    { field: 'daysOpen', label: 'Days Open', operators: AGING_OPS, valueType: 'number', placeholder: 'e.g. 21' },
    { field: 'criticalPath', label: 'Critical Path', operators: EQ_OPS, valueType: 'boolean' },
    { field: 'daysInCurrentReview', label: 'Days In Current Review', operators: AGING_OPS, valueType: 'number', placeholder: 'e.g. 14' },
    { field: 'status', label: 'Status', operators: EQ_OPS, valueType: 'select', options: [
      { value: 'open', label: 'Open' },
      { value: 'closed', label: 'Closed' },
      { value: 'overdue', label: 'Overdue' },
    ]},
  ],
  submittal: [
    { field: 'daysOpen', label: 'Days Open', operators: AGING_OPS, valueType: 'number', placeholder: 'e.g. 14' },
    { field: 'criticalPath', label: 'Critical Path', operators: EQ_OPS, valueType: 'boolean' },
    { field: 'daysInCurrentReview', label: 'Days In Current Review', operators: AGING_OPS, valueType: 'number', placeholder: 'e.g. 14' },
    { field: 'status', label: 'Status', operators: EQ_OPS, valueType: 'select', options: [
      { value: 'open', label: 'Open' },
      { value: 'pending_approval', label: 'Pending Approval' },
      { value: 'approved', label: 'Approved' },
      { value: 'revise_resubmit', label: 'Revise & Resubmit' },
    ]},
  ],
  punch_list: [
    { field: 'daysOpen', label: 'Days Open', operators: AGING_OPS, valueType: 'number', placeholder: 'e.g. 30' },
    { field: 'status', label: 'Status', operators: EQ_OPS, valueType: 'select', options: [
      { value: 'open', label: 'Open' },
      { value: 'closed', label: 'Closed' },
      { value: 'ready_for_review', label: 'Ready for Review' },
    ]},
  ],
  milestone: [
    { field: 'startsInDays', label: 'Starts In Days', operators: NUMERIC_OPS, valueType: 'number', placeholder: 'e.g. 14' },
    { field: 'safetyPlanCompleted', label: 'Safety Plan Completed', operators: EQ_OPS, valueType: 'boolean' },
    { field: 'hazardousActivityType', label: 'Hazardous Activity Type', operators: EQ_OPS, valueType: 'select', options: [
      { value: 'null', label: 'None' },
      { value: 'excavation', label: 'Excavation' },
      { value: 'electrical', label: 'Electrical' },
      { value: 'confined_space', label: 'Confined Space' },
      { value: 'heights', label: 'Heights' },
    ]},
    { field: 'daysLate', label: 'Days Late', operators: AGING_OPS, valueType: 'number', placeholder: 'e.g. 7' },
  ],
  incident: [
    { field: 'oshaRecordable', label: 'OSHA Recordable', operators: EQ_OPS, valueType: 'boolean' },
    { field: 'incidentType', label: 'Incident Type', operators: EQ_OPS, valueType: 'select', options: [
      { value: 'near_miss', label: 'Near Miss' },
      { value: 'first_aid', label: 'First Aid' },
      { value: 'recordable', label: 'Recordable Injury' },
      { value: 'lost_time', label: 'Lost Time' },
      { value: 'property_damage', label: 'Property Damage' },
    ]},
    { field: 'daysOpen', label: 'Days Open', operators: AGING_OPS, valueType: 'number', placeholder: 'e.g. 7' },
  ],
  observation: [
    { field: 'daysOpen', label: 'Days Open', operators: AGING_OPS, valueType: 'number', placeholder: 'e.g. 14' },
    { field: 'status', label: 'Status', operators: EQ_OPS, valueType: 'select', options: [
      { value: 'open', label: 'Open' },
      { value: 'closed', label: 'Closed' },
      { value: 'in_review', label: 'In Review' },
    ]},
  ],
};

// ─── Styled: Condition builder ────────────────────────────────────────────────

const ConditionBlock = styled.div`
  border: 1px solid var(--color-border-default);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ConditionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--color-surface-secondary);
  border-bottom: 1px solid var(--color-border-default);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
`;

const ConditionRow = styled.div`
  display: grid;
  grid-template-columns: 72px 1fr 160px 1fr 32px;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid var(--color-border-separator);
  &:first-of-type { border-top: none; }
  background: var(--color-surface-primary);
`;

const ConditionLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

// Wrapper to make core-react Select fill its grid cell and work at small sizes
const ConditionSelectWrap = styled.div`
  width: 100%;
  > div, > button { width: 100% !important; }
`;

const AddConditionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 10px 14px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-default);
  border-radius: 4px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  &:hover { background: var(--color-surface-hover); color: var(--color-text-primary); }
`;

// ─── ConditionsBuilder component ─────────────────────────────────────────────

interface DraftCondition {
  field: string;
  operator: string;
  value: string; // always string in UI; parsed on save
}

interface ConditionsBuilderProps {
  sourceType: string;
  conditions: DraftCondition[];
  onChange: (conditions: DraftCondition[]) => void;
}

function blankCondition(): DraftCondition {
  return { field: '', operator: 'eq', value: '' };
}

function ConditionsBuilder({ sourceType, conditions, onChange }: ConditionsBuilderProps) {
  const attrs = SOURCE_ATTRIBUTES[sourceType] ?? [];

  function updateCondition(idx: number, patch: Partial<DraftCondition>) {
    const next = conditions.map((c, i) => i === idx ? { ...c, ...patch } : c);
    // Reset operator/value when field changes
    if (patch.field !== undefined && patch.field !== conditions[idx].field) {
      const attr = attrs.find(a => a.field === patch.field);
      next[idx] = { field: patch.field, operator: attr?.operators[0] ?? 'eq', value: '' };
    }
    onChange(next);
  }

  function removeCondition(idx: number) {
    onChange(conditions.filter((_, i) => i !== idx));
  }

  function addCondition() {
    onChange([...conditions, blankCondition()]);
  }

  return (
    <ConditionBlock>
      <ConditionHeader>
        <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--color-border-default)', display: 'inline-block', flexShrink: 0 }} />
        Rule 1
      </ConditionHeader>

      {conditions.map((cond, idx) => {
        const attr = attrs.find(a => a.field === cond.field);
        const applicableOps = attr ? CONDITION_OPERATORS.filter(op => attr.operators.includes(op.value)) : CONDITION_OPERATORS;
        const selectedAttrLabel = attrs.find(a => a.field === cond.field)?.label;
        const selectedOpLabel = applicableOps.find(op => op.value === cond.operator)?.label;
        const selectedValLabel = attr?.options?.find(o => String(o.value) === cond.value)?.label;

        return (
          <ConditionRow key={idx}>
            <ConditionLabel>{idx === 0 ? 'WHEN' : 'AND'}</ConditionLabel>

            {/* Attribute picker */}
            <ConditionSelectWrap>
              <Select
                placeholder="Select Attribute"
                label={selectedAttrLabel}
                block
                onSelect={(item) => updateCondition(idx, { field: (item as unknown as { id: string }).id })}
              >
                {attrs.map(a => (
                  <Select.Option key={a.field} value={{ id: a.field }} selected={cond.field === a.field}>
                    {a.label}
                  </Select.Option>
                ))}
              </Select>
            </ConditionSelectWrap>

            {/* Operator picker */}
            <ConditionSelectWrap>
              <Select
                label={selectedOpLabel}
                placeholder="IS"
                block
                disabled={!cond.field}
                onSelect={(item) => updateCondition(idx, { operator: (item as unknown as { id: string }).id, value: '' })}
              >
                {applicableOps.map(op => (
                  <Select.Option key={op.value} value={{ id: op.value }} selected={cond.operator === op.value}>
                    {op.label}
                  </Select.Option>
                ))}
              </Select>
            </ConditionSelectWrap>

            {/* Value input — adapts to attribute type */}
            {!attr || attr.valueType === 'number' ? (
              <NumberInput
                placeholder={attr?.placeholder ?? 'Enter value'}
                value={cond.value !== '' ? Number(cond.value) : undefined}
                disabled={!cond.field}
                onChange={(val) => updateCondition(idx, { value: val.value })}
              />
            ) : attr.valueType === 'boolean' ? (
              <ConditionSelectWrap>
                <Select
                  placeholder="Select values"
                  label={cond.value === 'true' ? 'True' : cond.value === 'false' ? 'False' : undefined}
                  block
                  disabled={!cond.field}
                  onSelect={(item) => updateCondition(idx, { value: (item as unknown as { id: string }).id })}
                >
                  <Select.Option value={{ id: 'true' }} selected={cond.value === 'true'}>True</Select.Option>
                  <Select.Option value={{ id: 'false' }} selected={cond.value === 'false'}>False</Select.Option>
                </Select>
              </ConditionSelectWrap>
            ) : attr.valueType === 'select' ? (
              <ConditionSelectWrap>
                <Select
                  placeholder="Select values"
                  label={selectedValLabel}
                  block
                  disabled={!cond.field}
                  onSelect={(item) => updateCondition(idx, { value: (item as unknown as { id: string }).id })}
                >
                  {attr.options?.map(opt => (
                    <Select.Option key={String(opt.value)} value={{ id: String(opt.value) }} selected={cond.value === String(opt.value)}>
                      {opt.label}
                    </Select.Option>
                  ))}
                </Select>
              </ConditionSelectWrap>
            ) : (
              <TextInput
                placeholder={attr?.placeholder ?? 'Enter value'}
                value={cond.value}
                disabled={!cond.field}
                onChange={(e) => updateCondition(idx, { value: e.target.value })}
              />
            )}

            {/* Delete row */}
            <Button
              variant="tertiary"
              size="sm"
              icon={<Trash />}
              onClick={() => removeCondition(idx)}
              aria-label="Remove condition"
            />
          </ConditionRow>
        );
      })}

      <AddConditionBtn onClick={addCondition} type="button">
        <Plus size="sm" /> AND
      </AddConditionBtn>
    </ConditionBlock>
  );
}

interface EditorProps {
  rule: AutomationRule | null;
  onClose: () => void;
  onSave: (rule: AutomationRule) => void;
}

function conditionsToDraft(conditions: AutomationRule['conditions']): DraftCondition[] {
  return conditions.map(c => ({ field: c.field, operator: c.operator, value: String(c.value) }));
}

function draftToConditions(drafts: DraftCondition[]): AutomationRule['conditions'] {
  return drafts
    .filter(d => d.field && d.value !== '')
    .map(d => {
      const attrs = Object.values(SOURCE_ATTRIBUTES).flat();
      const attr = attrs.find(a => a.field === d.field);
      let parsed: number | string | boolean = d.value;
      if (attr?.valueType === 'boolean') parsed = d.value === 'true';
      else if (attr?.valueType === 'number') parsed = parseFloat(d.value) || 0;
      return { field: d.field, operator: d.operator as AutomationRule['conditions'][0]['operator'], value: parsed };
    });
}

function AutomationRuleEditor({ rule, onClose, onSave }: EditorProps) {
  const [name, setName] = useState(rule?.name ?? '');
  const [status, setStatus] = useState<AutomationRule['status']>(rule?.status ?? 'draft');
  const [sourceType, setSourceType] = useState<string>(rule?.sourceType ?? 'change_event');
  const [conditions, setConditions] = useState<DraftCondition[]>(
    rule?.conditions?.length ? conditionsToDraft(rule.conditions) : [blankCondition()]
  );
  const [enableTagging, setEnableTagging] = useState(!!rule?.taggingAction);
  const [enableWorkflow, setEnableWorkflow] = useState(!!rule?.workflowAction);
  const [workflowId, setWorkflowId] = useState<string>(rule?.workflowAction?.workflowId ?? WORKFLOW_OPTIONS[0].value);

  // Reset conditions only when sourceType changes away from the initial value
  const initialSourceType = React.useRef(sourceType);
  React.useEffect(() => {
    if (sourceType === initialSourceType.current) return;
    setConditions([blankCondition()]);
  }, [sourceType]);

  function handleSave() {
    const saved: AutomationRule = {
      id: rule?.id ?? `ar-${Date.now()}`,
      name: name || 'Untitled Rule',
      status,
      sourceType: sourceType as AutomationRule['sourceType'],
      conditions: draftToConditions(conditions),
      taggingAction: enableTagging ? (rule?.taggingAction ?? { riskTypeId: 'rt-001', defaultProbability: 3, defaultImpact: 'inherit_from_source', behavior: 'auto_create' }) : undefined,
      workflowAction: enableWorkflow ? { workflowId, tagStateOnTrigger: rule?.workflowAction?.tagStateOnTrigger ?? 'pending_approval' } : undefined,
      fireCount: rule?.fireCount ?? 0,
      lastFiredAt: rule?.lastFiredAt,
      createdBy: 'user-001',
      createdAt: rule?.createdAt ?? new Date(),
    };
    onSave(saved);
  }

  return (
    <>
      <AutomationTearsheetWidth />
      <Tearsheet open onClose={onClose} aria-label={rule ? 'Edit rule' : 'Create rule'} placement="right">
        <div className="automation-rule-editor-root" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Page style={{ height: '100%', background: 'var(--color-surface-primary)', color: 'var(--color-text-primary)' }}>
            <Page.Main style={{ height: '100%', overflow: 'hidden', background: 'var(--color-surface-primary)' }}>

              <Page.Header style={{ background: 'var(--color-surface-primary)', borderColor: 'var(--color-border-separator)' }}>
                <Page.Title>
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <H2 style={{ margin: 0, color: 'var(--color-text-primary)' }}>
                      {rule ? 'Edit rule' : 'Create rule'}
                    </H2>
                    <Box style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <Button variant="secondary" className="b_secondary" onClick={onClose}>Cancel</Button>
                      <Button variant="primary" className="b_primary" onClick={handleSave}>Save rule</Button>
                    </Box>
                  </Box>
                </Page.Title>
              </Page.Header>

              <Page.Body style={{ padding: 24, overflowY: 'auto', background: 'var(--color-surface-secondary)' }}>

                {/* ── Identity ── */}
                <EditorSectionCard>
                  <H2 style={{ marginBottom: 16 }}>Rule details</H2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <Typography intent="small" style={{ fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Rule name *</Typography>
                      <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Large CE auto-approval"
                        style={{ width: '100%', padding: '8px 10px', fontSize: 14, border: '1px solid var(--color-border-default)', borderRadius: 4, background: 'var(--color-surface-primary)', color: 'var(--color-text-primary)', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <Typography intent="small" style={{ fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Status</Typography>
                        <Select
                          label={status.charAt(0).toUpperCase() + status.slice(1)}
                          onSelect={(item) => setStatus((item as unknown as { id: string }).id as AutomationRule['status'])}
                        >
                          {(['active', 'inactive', 'draft'] as const).map(s => (
                            <Select.Option key={s} value={{ id: s }} selected={status === s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <Typography intent="small" style={{ fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Source type</Typography>
                        <Select
                          label={RULE_SOURCE_OPTIONS.find(o => o.value === sourceType)?.label ?? sourceType}
                          onSelect={(item) => { setSourceType((item as unknown as { id: string }).id); }}
                        >
                          {RULE_SOURCE_OPTIONS.map(opt => (
                            <Select.Option key={opt.value} value={{ id: opt.value }} selected={sourceType === opt.value}>
                              {opt.label}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  </div>
                </EditorSectionCard>

                {/* ── Conditions ── */}
                <EditorSectionCard>
                  <H2 style={{ marginBottom: 4 }}>Set Conditional Rules</H2>
                  <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 16 }}>
                    Define when this rule fires. All conditions must be met.
                  </Typography>
                  <ConditionsBuilder
                    sourceType={sourceType}
                    conditions={conditions}
                    onChange={setConditions}
                  />
                </EditorSectionCard>

                {/* ── Actions ── */}
                <EditorSectionCard>
                  <H2 style={{ marginBottom: 16 }}>Actions</H2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                      <div>
                        <Typography intent="body" style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>Create risk association</Typography>
                        <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>Automatically tag the source item with a risk type when conditions match.</Typography>
                      </div>
                      <Switch checked={enableTagging} onChange={() => setEnableTagging(v => !v)} aria-label="Enable risk tagging" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                        <div>
                          <Typography intent="body" style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>Trigger approval workflow</Typography>
                          <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>Start an approval workflow when the rule fires.</Typography>
                        </div>
                        <Switch checked={enableWorkflow} onChange={() => setEnableWorkflow(v => !v)} aria-label="Enable workflow trigger" />
                      </div>
                      {enableWorkflow && (
                        <div style={{ paddingLeft: 0 }}>
                          <Typography intent="small" style={{ fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Workflow</Typography>
                          <Select
                            block
                            label={WORKFLOW_OPTIONS.find(o => o.value === workflowId)?.label ?? 'Select workflow'}
                            onSelect={(item) => setWorkflowId((item as unknown as { id: string }).id)}
                          >
                            {WORKFLOW_OPTIONS.map(opt => (
                              <Select.Option key={opt.value} value={{ id: opt.value }} selected={workflowId === opt.value}>
                                {opt.label}
                              </Select.Option>
                            ))}
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                </EditorSectionCard>

              </Page.Body>
            </Page.Main>
          </Page>
        </div>
      </Tearsheet>
    </>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = ['KPIs', 'Automation Rules', 'Risk Types', 'Scope'] as const;
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
  { header: 'KPI',         tooltip: 'Name of the key performance indicator' },
  { header: 'Calc Type',   tooltip: 'How the KPI value is derived from source data' },
  { header: 'Active',      tooltip: 'Toggle to include or exclude from portfolio health scoring' },
  { header: 'At Risk at',  tooltip: 'Threshold value that turns the KPI yellow (At Risk)' },
  { header: 'Critical at', tooltip: 'Threshold value that turns the KPI red (Critical)' },
  { header: 'Weight',      tooltip: 'Relative importance of this KPI in the composite health score (higher = more impact)' },
  { header: 'Risk Types',   tooltip: 'Risk types that use this KPI as a contributing factor' },
  { header: 'Date Range',   tooltip: 'The time window used to filter records when calculating this KPI' },
  { header: 'Actions',      tooltip: '' },
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
  const [activeTab, setActiveTab] = useState<SettingsTab>('KPIs');
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
  const [kpiDateRanges, setKpiDateRanges] = useState<Partial<Record<KPIKey, string>>>({});

  // ── Risk Types state
  const [riskTypes, setRiskTypes] = useState<RiskType[]>(data.account?.riskTypes ?? []);
  const [tearsheetRiskType, setTearsheetRiskType] = useState<RiskType | 'new' | null>(null);

  // ── KPI edit tearsheet state
  const [editingKPI, setEditingKPI] = useState<KPIKey | null>(null);

  // ── KPI Wizard state
  const [showKPIWizard, setShowKPIWizard] = useState(false);
  const [automationCreateTrigger, setAutomationCreateTrigger] = useState(0);

  // ── Scope tab toggle state (auto-saved on change)
  const [scopeIncludeAll, setScopeIncludeAll] = useState(true);
  const [scopeExcludeCompleted, setScopeExcludeCompleted] = useState(true);
  const [scopeProjectOverrides, setScopeProjectOverrides] = useState(false);
  const [scopeMinValue, setScopeMinValue] = useState(false);
  const [scopeLimitRegion, setScopeLimitRegion] = useState(false);
  const [vizCard, setVizCard] = useState(true);
  const [vizTableColumn, setVizTableColumn] = useState(true);
  const [vizSparkline, setVizSparkline] = useState(true);

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

  function handleKPISave(key: KPIKey, values: KPIEditValues) {
    const nextActive = new Set(activeKPIs);
    if (values.active) { nextActive.add(key); } else { nextActive.delete(key); }
    setActiveKPIs(nextActive);
    setCalcTypes(prev => ({ ...prev, [key]: values.calcType }));
    setThresholds(prev => ({ ...prev, [key]: values.threshold }));
    setKpiWeights(prev => ({ ...prev, [key]: values.weight }));
    setKpiDateRanges(prev => ({ ...prev, [key]: values.dateRange }));
    persistConfig({
      activeKPIs: [...nextActive],
      thresholds: { ...thresholds, [key]: values.threshold },
      kpiWeights: { ...kpiWeights, [key]: values.weight },
    });
    setEditingKPI(null);
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
                  <Breadcrumbs.Crumb active>Health & Risk Configuration</Breadcrumbs.Crumb>
                </Breadcrumbs>
                <Title>
                  <Title.Text>
                    <H1 style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-text-primary)' }}>
                      <Warning size="md" style={{ color: 'var(--color-pill-text-yellow)' }} />
                      Health & Risk Configuration
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
                    {activeTab === 'Automation Rules' && (
                      <Button
                        variant="primary"
                        className="b_primary"
                        icon={<Plus size="sm" />}
                        onClick={() => setAutomationCreateTrigger(n => n + 1)}
                      >
                        Create rule
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
                                      <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{currentCalcType}</span>
                                    </Table.BodyCell>
                                    <Table.BodyCell>
                                      <Pill color={isActive ? 'green' : 'gray'} style={{ fontSize: 11 }}>
                                        {isActive ? 'Active' : 'Inactive'}
                                      </Pill>
                                    </Table.BodyCell>
                                    <Table.BodyCell>
                                      <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{thr.yellow}</span>
                                    </Table.BodyCell>
                                    <Table.BodyCell>
                                      <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{thr.red}</span>
                                    </Table.BodyCell>
                                    <Table.BodyCell>
                                      <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{kpiWeights[key] ?? 0}</span>
                                    </Table.BodyCell>
                                    <Table.BodyCell>
                                      <span style={{ fontSize: 12, color: linked.length === 0 ? 'var(--color-text-disabled)' : 'var(--color-text-secondary)' }}>
                                        {linked.length === 0 ? '—' : linked.join(', ')}
                                      </span>
                                    </Table.BodyCell>
                                    <Table.BodyCell>
                                      {(() => {
                                        const dr = kpiDateRanges[key] ?? 'last_30';
                                        const labels: Record<string, string> = {
                                          all_time: 'All time', last_7: 'Last 7 days', last_30: 'Last 30 days',
                                          last_60: 'Last 60 days', last_90: 'Last 90 days', this_month: 'This month',
                                          last_month: 'Last month', this_quarter: 'This quarter',
                                          last_quarter: 'Last quarter', this_year: 'This year', last_year: 'Last year',
                                        };
                                        return <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{labels[dr] ?? dr}</span>;
                                      })()}
                                    </Table.BodyCell>
                                    <Table.BodyCell>
                                      <Button
                                        variant="tertiary"
                                        size="sm"
                                        icon={<Pencil />}
                                        aria-label={`Edit ${KPI_LABELS[key]}`}
                                        onClick={() => setEditingKPI(key)}
                                      />
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

                {/* ── Scope Tab ── */}
                {activeTab === 'Scope' && (
                  <TabBody>
                    <DetailPage.Card>
                      <DetailPage.Section heading="Portfolio Scope">
                        <Typography intent="body" style={{ color: 'var(--color-text-secondary)', marginBottom: 16, display: 'block' }}>
                          Choose which projects are included in the portfolio health score. By default, all active projects are included.
                        </Typography>
                        <FormRow>
                          <FormLabel>
                            <Typography intent="body" style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                              Include all active projects
                            </Typography>
                            <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                              Automatically includes all projects with status &ldquo;Active&rdquo; in the portfolio health score.
                            </Typography>
                          </FormLabel>
                          <Switch checked={scopeIncludeAll} aria-label="Include all active projects" onChange={() => { setScopeIncludeAll(v => !v); triggerToast(); }} />
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
                          <Switch checked={scopeExcludeCompleted} aria-label="Exclude completed projects" onChange={() => { setScopeExcludeCompleted(v => !v); triggerToast(); }} />
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
                          <Switch checked={scopeProjectOverrides} aria-label="Allow project-level overrides" onChange={() => { setScopeProjectOverrides(v => !v); triggerToast(); }} />
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
                          <Switch checked={scopeMinValue} aria-label="Minimum project value threshold" onChange={() => { setScopeMinValue(v => !v); triggerToast(); }} />
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
                          <Switch checked={scopeLimitRegion} aria-label="Limit portfolio health by region" onChange={() => { setScopeLimitRegion(v => !v); triggerToast(); }} />
                        </FormRow>
                      </DetailPage.Section>
                    </DetailPage.Card>

                    <DetailPage.Card>
                      <DetailPage.Section heading="Visualization Support">
                        <Typography intent="body" style={{ color: 'var(--color-text-secondary)', marginBottom: 16, display: 'block' }}>
                          Choose which visualization modes are available across all KPIs in this account. Enabled modes will be available for users to enable on individual KPIs.
                        </Typography>
                        <FormRow>
                          <FormLabel>
                            <Typography intent="body" style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                              Card
                            </Typography>
                            <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                              Status chip with value and label — shown on hub cards.
                            </Typography>
                          </FormLabel>
                          <Switch checked={vizCard} aria-label="Enable Card visualization" onChange={() => { setVizCard(v => !v); triggerToast(); }} />
                        </FormRow>
                        <FormRow>
                          <FormLabel>
                            <Typography intent="body" style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                              Table Column
                            </Typography>
                            <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                              Adds a KPI column to the portfolio table view.
                            </Typography>
                          </FormLabel>
                          <Switch checked={vizTableColumn} aria-label="Enable Table Column visualization" onChange={() => { setVizTableColumn(v => !v); triggerToast(); }} />
                        </FormRow>
                        <FormRow>
                          <FormLabel>
                            <Typography intent="body" style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                              Sparkline
                            </Typography>
                            <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                              Trend line showing KPI movement over the last 6 periods.
                            </Typography>
                          </FormLabel>
                          <Switch checked={vizSparkline} aria-label="Enable Sparkline visualization" onChange={() => { setVizSparkline(v => !v); triggerToast(); }} />
                        </FormRow>
                      </DetailPage.Section>
                    </DetailPage.Card>
                  </TabBody>
                )}

                {/* ── Automation Rules Tab ── */}
                {activeTab === 'Automation Rules' && (
                  <AutomationRulesTab triggerCreate={automationCreateTrigger} />
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

      {/* ── KPI Edit Tearsheet ── */}
      <KPIEditTearsheet
        open={editingKPI !== null}
        kpiKey={editingKPI}
        initial={editingKPI ? {
          active: activeKPIs.has(editingKPI),
          calcType: calcTypes[editingKPI] ?? KPI_CALC_LABELS[editingKPI] ?? 'Count',
          threshold: thresholds[editingKPI] ?? DEFAULT_THRESHOLDS[editingKPI],
          weight: kpiWeights[editingKPI] ?? 0,
          dateRange: kpiDateRanges[editingKPI] ?? 'last_30',
        } : null}
        onClose={() => setEditingKPI(null)}
        onSave={handleKPISave}
      />
    </>
  );
}
