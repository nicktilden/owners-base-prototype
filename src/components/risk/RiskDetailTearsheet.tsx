/**
 * RISK DETAIL TEARSHEET
 * Detail view for a single risk row — works for both RiskTag and ManualRiskItem.
 */

import React from 'react';
import { Box, Button, Card, H2, Page, Pill, Tearsheet, Typography } from '@procore/core-react';
import { Warning } from '@procore/core-icons';
import styled, { createGlobalStyle } from 'styled-components';
import type { RiskTag, ManualRiskItem, RiskTagStatus, SourceType } from '@/types/health';
import { useData } from '@/context/DataContext';

// ─── Width override ───────────────────────────────────────────────────────────

const TearsheetWidth = createGlobalStyle`
  [class*="StyledTearsheetBody"]:has(> .risk-detail-tearsheet-root) {
    flex: 0 0 560px !important;
  }
`;

// ─── Styled ───────────────────────────────────────────────────────────────────

const SectionCard = styled(Card)`
  padding: 24px;
  background: var(--color-surface-primary);
  margin-bottom: 16px;
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 32px;
`;

const FieldCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FieldCellWide = styled(FieldCell)`
  grid-column: 1 / -1;
`;

const FieldLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const FieldValue = styled.span`
  font-size: 14px;
  color: var(--color-text-primary);
`;

const ScoreBar = styled.div<{ $fill: number }>`
  display: flex;
  gap: 4px;
  align-items: center;
  margin-top: 4px;
`;

const ScoreDot = styled.div<{ $filled: boolean; $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $filled, $color }) => $filled ? $color : 'var(--color-border-default)'};
`;

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<RiskTagStatus, 'red' | 'yellow' | 'green' | 'gray' | 'blue'> = {
  open:               'yellow',
  pending_acceptance: 'yellow',
  pending_approval:   'blue',
  mitigated:          'green',
  accepted:           'green',
  closed:             'gray',
};

const STATUS_LABELS: Record<RiskTagStatus, string> = {
  open:               'Open',
  pending_acceptance: 'Pending Acceptance',
  pending_approval:   'Pending Approval',
  mitigated:          'Mitigated',
  accepted:           'Accepted',
  closed:             'Closed',
};

const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  rfi:            'RFI',
  change_event:   'Change Event',
  punch_list:     'Punch List',
  submittal:      'Submittal',
  correspondence: 'Correspondence',
  milestone:      'Milestone',
  budget_line:    'Budget Line',
  observation:    'Observation',
  incident:       'Incident',
  manual:         'Manual',
};

const RESPONSE_LABELS: Record<string, string> = {
  mitigate: 'Mitigate',
  transfer: 'Transfer',
  accept:   'Accept',
  avoid:    'Avoid',
};

// ─── Props ────────────────────────────────────────────────────────────────────

export type RiskDetailItem =
  | { kind: 'tag'; data: RiskTag }
  | { kind: 'manual'; data: ManualRiskItem };

interface RiskDetailTearsheetProps {
  open: boolean;
  item: RiskDetailItem | null;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RiskDetailTearsheet({ open, item, onClose }: RiskDetailTearsheetProps) {
  const { data } = useData();

  if (!item) return null;

  const { data: risk } = item;
  const isManual = item.kind === 'manual';

  const project = data.projects?.find(p => p.id === risk.projectId);
  const riskType = data.account?.riskTypes.find(rt => rt.id === risk.riskTypeId);
  const owner = data.users?.find(u => u.id === risk.riskOwner);
  const createdByUser = data.users?.find(u => u.id === risk.createdBy);

  const title = isManual
    ? (item.data as ManualRiskItem).title
    : `${SOURCE_TYPE_LABELS[(item.data as RiskTag).sourceType]} — ${(item.data as RiskTag).sourceId}`;

  const riskScore = risk.probability * (risk.impact > 0 ? Math.min(5, Math.ceil(risk.impact / 100000)) : 1);
  const probColor = risk.probability >= 4 ? 'var(--color-text-error)' : risk.probability >= 3 ? 'var(--color-pill-text-yellow)' : 'var(--color-icon-success)';

  return (
    <>
      <TearsheetWidth />
      <Tearsheet open={open} onClose={onClose} aria-label={`Risk detail: ${title}`} placement="right">
        <div className="risk-detail-tearsheet-root" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Page style={{ height: '100%', background: 'var(--color-surface-primary)', color: 'var(--color-text-primary)' }}>
            <Page.Main style={{ height: '100%', overflow: 'hidden', background: 'var(--color-surface-primary)' }}>

              <Page.Header style={{ background: 'var(--color-surface-primary)', borderColor: 'var(--color-border-separator)' }}>
                <Page.Title>
                  <Box style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <Box style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Warning size="sm" style={{ color: 'var(--color-pill-text-yellow)', flexShrink: 0 }} />
                        <Typography intent="h2" style={{ color: 'var(--color-text-primary)' }}>
                          {title}
                        </Typography>
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Pill color={STATUS_COLORS[risk.status]}>
                          {STATUS_LABELS[risk.status]}
                        </Pill>
                        {isManual && <Pill color="gray" style={{ fontSize: 11 }}>Manual</Pill>}
                        {riskType && (
                          <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
                            {riskType.label}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Button variant="tertiary" className="b_tertiary" onClick={onClose}>
                      Close
                    </Button>
                  </Box>
                </Page.Title>
              </Page.Header>

              <Page.Body style={{ padding: 24, overflowY: 'auto', background: 'var(--color-surface-secondary)' }}>

                {/* ── Overview ── */}
                <SectionCard>
                  <H2 style={{ marginBottom: 16 }}>Overview</H2>
                  <FieldGrid>
                    <FieldCell>
                      <FieldLabel>Project</FieldLabel>
                      <FieldValue>{project?.name ?? risk.projectId}</FieldValue>
                    </FieldCell>
                    <FieldCell>
                      <FieldLabel>Risk Type</FieldLabel>
                      <FieldValue>{riskType?.label ?? risk.riskTypeId}</FieldValue>
                    </FieldCell>
                    <FieldCell>
                      <FieldLabel>Source</FieldLabel>
                      <FieldValue>
                        {isManual
                          ? 'Manual'
                          : SOURCE_TYPE_LABELS[(item.data as RiskTag).sourceType]}
                      </FieldValue>
                    </FieldCell>
                    <FieldCell>
                      <FieldLabel>Origin</FieldLabel>
                      <FieldValue>
                        {risk.origin === 'connected_partner' ? 'Connected Partner'
                          : risk.origin === 'automated' ? 'Automated'
                          : 'Manual'}
                      </FieldValue>
                    </FieldCell>
                    <FieldCell>
                      <FieldLabel>Owner</FieldLabel>
                      <FieldValue>
                        {owner ? `${owner.firstName} ${owner.lastName}` : risk.riskOwner}
                      </FieldValue>
                    </FieldCell>
                    <FieldCell>
                      <FieldLabel>Created By</FieldLabel>
                      <FieldValue>
                        {createdByUser ? `${createdByUser.firstName} ${createdByUser.lastName}` : risk.createdBy}
                      </FieldValue>
                    </FieldCell>
                    <FieldCell>
                      <FieldLabel>Created</FieldLabel>
                      <FieldValue>
                        {new Date(risk.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </FieldValue>
                    </FieldCell>
                    {isManual && (item.data as ManualRiskItem).description && (
                      <FieldCellWide>
                        <FieldLabel>Description</FieldLabel>
                        <FieldValue>{(item.data as ManualRiskItem).description}</FieldValue>
                      </FieldCellWide>
                    )}
                  </FieldGrid>
                </SectionCard>

                {/* ── Risk Assessment ── */}
                <SectionCard>
                  <H2 style={{ marginBottom: 16 }}>Risk Assessment</H2>
                  <FieldGrid>
                    <FieldCell>
                      <FieldLabel>Probability</FieldLabel>
                      <ScoreBar $fill={risk.probability}>
                        {[1, 2, 3, 4, 5].map(n => (
                          <ScoreDot key={n} $filled={n <= risk.probability} $color={probColor} />
                        ))}
                        <FieldValue style={{ marginLeft: 6 }}>{risk.probability}/5</FieldValue>
                      </ScoreBar>
                    </FieldCell>
                    <FieldCell>
                      <FieldLabel>Expected Impact</FieldLabel>
                      <FieldValue style={{ fontWeight: 600 }}>
                        {risk.impact > 0 ? `$${Number(risk.impact).toLocaleString()}` : '—'}
                      </FieldValue>
                    </FieldCell>
                    {risk.residualImpact != null && (
                      <FieldCell>
                        <FieldLabel>Residual Impact</FieldLabel>
                        <FieldValue>
                          {risk.residualImpact > 0 ? `$${Number(risk.residualImpact).toLocaleString()}` : '—'}
                        </FieldValue>
                      </FieldCell>
                    )}
                    {risk.responseStrategy && (
                      <FieldCell>
                        <FieldLabel>Response Strategy</FieldLabel>
                        <FieldValue>{RESPONSE_LABELS[risk.responseStrategy] ?? risk.responseStrategy}</FieldValue>
                      </FieldCell>
                    )}
                    {risk.mitigationPlan && (
                      <FieldCellWide>
                        <FieldLabel>Mitigation Plan</FieldLabel>
                        <FieldValue>{risk.mitigationPlan}</FieldValue>
                      </FieldCellWide>
                    )}
                  </FieldGrid>
                </SectionCard>

                {/* ── Linked Risk Types ── */}
                {riskType?.linkedKpiKeys && riskType.linkedKpiKeys.length > 0 && (
                  <SectionCard>
                    <H2 style={{ marginBottom: 12 }}>Linked KPIs</H2>
                    <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {riskType.linkedKpiKeys.map(key => (
                        <Pill key={key} color="blue" style={{ fontSize: 12 }}>{key}</Pill>
                      ))}
                    </Box>
                  </SectionCard>
                )}

              </Page.Body>
            </Page.Main>
          </Page>
        </div>
      </Tearsheet>
    </>
  );
}
