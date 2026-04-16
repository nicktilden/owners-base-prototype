/**
 * ActionPanel — Slide-in panel from the right that hosts the AI action rail.
 * Wraps a Tearsheet with the two-tier ActionRail and contextual header.
 */

import React, { useState, useCallback } from 'react';
import { Tearsheet, Typography, Pill, Avatar, Button } from '@procore/core-react';
import { Lightning } from '@procore/core-icons';
import styled from 'styled-components';
import ActionRail from '@/components/hubs/ActionRail';
import type { ActionCardType, ActionRole, HubAction } from '@/types/actions';

// ─── Styled Components ────────────────────────────────────────────────────────

const PanelHeader = styled.div`
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e8eaec;
  flex-shrink: 0;
`;

const AiBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  background: linear-gradient(135deg, #e8e0ff 0%, #d4e4ff 100%);
  color: #5b3cc4;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3px;
`;

const ContextCard = styled.div`
  margin: 16px 24px 0;
  padding: 14px 16px;
  background: #f8f9fa;
  border: 1px solid #e8eaec;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ContextRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ContextLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #6a767c;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 60px;
`;

const ContextValue = styled.span`
  font-size: 13px;
  color: #232729;
  font-weight: 500;
`;

const RailWrapper = styled.div`
  padding: 0 24px 24px;
  flex: 1;
  overflow-y: auto;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 24px;
  text-align: center;
`;

const ExecutionLog = styled.div`
  margin: 0 24px 16px;
  padding: 12px 14px;
  background: #f0f7ff;
  border: 1px solid #c8ddf5;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const LogEntry = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #232729;
  line-height: 18px;
`;

const LogTimestamp = styled.span`
  font-size: 11px;
  color: #6a767c;
  white-space: nowrap;
  margin-top: 1px;
`;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ActionPanelContext {
  /** Display name of the item, e.g. project name */
  itemName?: string;
  /** Object identifier, e.g. project number */
  itemId?: string;
  /** Extra context pills, e.g. variance badge, stage */
  pills?: Array<{ label: string; color?: string }>;
  /** AI-generated summary of the current situation */
  aiSummary?: string;
}

export interface ActionPanelProps {
  open: boolean;
  onClose: () => void;
  cardType: ActionCardType;
  userRoles: ActionRole[];
  context?: ActionPanelContext;
  currentUserIsAssignee?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ActionPanel({
  open,
  onClose,
  cardType,
  userRoles,
  context,
  currentUserIsAssignee = false,
}: ActionPanelProps) {
  const [executionHistory, setExecutionHistory] = useState<Record<string, Date>>({});
  const [executionLog, setExecutionLog] = useState<
    Array<{ actionId: string; label: string; timestamp: Date }>
  >([]);

  const handleExecute = useCallback((action: HubAction) => {
    const now = new Date();
    setExecutionHistory((prev) => ({
      ...prev,
      [action.action_id]: now,
    }));
    setExecutionLog((prev) => [
      { actionId: action.action_id, label: action.label, timestamp: now },
      ...prev,
    ]);
  }, []);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const CARD_TYPE_LABELS: Record<ActionCardType, string> = {
    invoices: 'Invoices',
    rfis: 'RFIs',
    action_items: 'Action Items',
    budget: 'Budget',
    submittals: 'Submittals',
    financial_scorecard: 'Financial Scorecard',
    schedule_variance: 'Schedule Variance',
    open_items: 'Open Items',
  };

  return (
    <Tearsheet open={open} onClose={onClose} aria-label="AI Actions" placement="right" block>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* ── Header ── */}
        <PanelHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Lightning size="sm" style={{ color: '#5b3cc4' }} />
            <Typography
              intent="h2"
              style={{ fontWeight: 700, color: '#232729', flex: 1 }}
            >
              AI Actions
            </Typography>
            <AiBadge>
              <Lightning size="sm" />
              AI-powered
            </AiBadge>
          </div>
          <Typography intent="small" style={{ color: '#6a767c', display: 'block' }}>
            Actions suggested by the AI based on the current {CARD_TYPE_LABELS[cardType]} context.
            Confirm before any changes are made.
          </Typography>
        </PanelHeader>

        {/* ── Context Card ── */}
        {context && (context.itemName || context.aiSummary) && (
          <ContextCard>
            {context.itemName && (
              <ContextRow>
                <ContextLabel>Item</ContextLabel>
                <ContextValue>
                  {context.itemId && (
                    <span style={{ color: '#6a767c', marginRight: 6 }}>{context.itemId}</span>
                  )}
                  {context.itemName}
                </ContextValue>
              </ContextRow>
            )}
            {context.pills && context.pills.length > 0 && (
              <ContextRow>
                <ContextLabel>Status</ContextLabel>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {context.pills.map((p) => (
                    <Pill key={p.label} color={(p.color as any) ?? 'blue'}>
                      {p.label}
                    </Pill>
                  ))}
                </div>
              </ContextRow>
            )}
            {context.aiSummary && (
              <div
                style={{
                  marginTop: 4,
                  padding: '10px 12px',
                  background: '#fff',
                  borderRadius: 6,
                  border: '1px solid #e8eaec',
                  fontSize: 13,
                  color: '#3d4447',
                  lineHeight: '18px',
                }}
              >
                {context.aiSummary}
              </div>
            )}
          </ContextCard>
        )}

        {/* ── Execution Log ── */}
        {executionLog.length > 0 && (
          <ExecutionLog>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#1d5cc9',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 2,
              }}
            >
              Recent actions
            </div>
            {executionLog.slice(0, 3).map((entry, i) => (
              <LogEntry key={`${entry.actionId}-${i}`}>
                <LogTimestamp>{formatTime(entry.timestamp)}</LogTimestamp>
                <span>{entry.label} completed.</span>
              </LogEntry>
            ))}
          </ExecutionLog>
        )}

        {/* ── Action Rail ── */}
        <RailWrapper>
          <ActionRail
            cardType={cardType}
            userRoles={userRoles}
            executionHistory={executionHistory}
            currentUserIsAssignee={currentUserIsAssignee}
            onExecute={handleExecute}
          />
        </RailWrapper>
      </div>
    </Tearsheet>
  );
}
