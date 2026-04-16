/**
 * ActionRail — Two-tier action rail for the Hub AI panel.
 *
 * Primary rail:  up to 3 object-specific actions ranked by AI relevance.
 * Secondary rail: persistent common actions (Conversation, Reminder, Nudge, Open).
 */

import React, { useState, useCallback } from 'react';
import { Button, Tooltip, Typography } from '@procore/core-react';
import {
  Comments,
  Bell,
  Person,
  ExternalLink,
  Warning,
} from '@procore/core-icons';
import styled from 'styled-components';
import type {
  HubAction,
  ActionCardType,
  ActionRole,
  ActionExecutionStatus,
} from '@/types/actions';
import { getActionsForRail, isActionOnCooldown, getCooldownLabel } from '@/utils/actions';

// ─── Styled Components ────────────────────────────────────────────────────────

const RailContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 0;
`;

const RailSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #6a767c;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 0 4px;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e8eaec;
  margin: 4px 0;
`;

const ActionCard = styled.button<{ $destructive?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid ${(p) => (p.$destructive ? '#ffd4c2' : '#d6dadc')};
  border-radius: 6px;
  background: ${(p) => (p.$destructive ? '#fff8f5' : '#fff')};
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:hover:not(:disabled) {
    border-color: ${(p) => (p.$destructive ? '#ff5100' : '#1d5cc9')};
    box-shadow: 0 0 0 1px ${(p) => (p.$destructive ? '#ff510033' : '#1d5cc933')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ActionLabel = styled.span<{ $destructive?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${(p) => (p.$destructive ? '#d44800' : '#232729')};
  line-height: 20px;
`;

const ActionDescription = styled.span`
  font-size: 12px;
  font-weight: 400;
  color: #6a767c;
  line-height: 16px;
`;

const SecondaryRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ConfirmOverlay = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid #1d5cc9;
  border-radius: 6px;
  background: #f0f5ff;
`;

const ConfirmMessage = styled.p`
  margin: 0;
  font-size: 13px;
  color: #232729;
  line-height: 18px;
`;

const ConfirmButtons = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const ResultBanner = styled.div<{ $error?: boolean }>`
  padding: 10px 12px;
  border-radius: 6px;
  background: ${(p) => (p.$error ? '#fff1eb' : '#e6f7ed')};
  font-size: 13px;
  color: ${(p) => (p.$error ? '#d44800' : '#0d6e3a')};
  line-height: 18px;
`;

const CooldownBadge = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: #6a767c;
  margin-left: 4px;
`;

// ─── Icon Map ─────────────────────────────────────────────────────────────────

const COMMON_ACTION_ICONS: Record<string, React.ReactNode> = {
  'common-start-conversation': <Comments size="sm" />,
  'common-send-reminder': <Bell size="sm" />,
  'common-nudge-assignee': <Person size="sm" />,
  'common-open-in-system': <ExternalLink size="sm" />,
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ActionRailProps {
  cardType: ActionCardType;
  userRoles: ActionRole[];
  /** Map of action_id → last execution timestamp */
  executionHistory?: Record<string, Date>;
  /** True if the current user is the selected item's assignee */
  currentUserIsAssignee?: boolean;
  /** Called when an action is confirmed */
  onExecute?: (action: HubAction, paramValues?: Record<string, string>) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ActionRail({
  cardType,
  userRoles,
  executionHistory = {},
  currentUserIsAssignee = false,
  onExecute,
}: ActionRailProps) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{
    actionId: string;
    status: 'success' | 'error';
    message: string;
  } | null>(null);

  const { primary, secondary } = getActionsForRail({
    cardType,
    userRoles,
    executionHistory,
    currentUserIsAssignee,
  });

  const handleActionClick = useCallback(
    (action: HubAction) => {
      if (action.confirmation_required) {
        setConfirmingId(action.action_id);
        setLastResult(null);
      } else {
        onExecute?.(action);
        setLastResult({
          actionId: action.action_id,
          status: 'success',
          message: `${action.label} completed.`,
        });
      }
    },
    [onExecute]
  );

  const handleConfirm = useCallback(
    (action: HubAction) => {
      onExecute?.(action);
      setConfirmingId(null);
      setLastResult({
        actionId: action.action_id,
        status: 'success',
        message: `${action.label} completed.`,
      });
    },
    [onExecute]
  );

  const handleCancel = useCallback(() => {
    setConfirmingId(null);
  }, []);

  const isDestructive = (action: HubAction) =>
    !action.reversible && action.confirmation_required;

  return (
    <RailContainer>
      {/* ── Primary Rail: Object-Specific Actions ── */}
      {primary.length > 0 && (
        <RailSection>
          <SectionLabel>Suggested Actions</SectionLabel>
          {primary.map((action) => {
            if (confirmingId === action.action_id) {
              return (
                <ConfirmOverlay key={action.action_id}>
                  <ConfirmMessage>
                    <strong>{action.label}</strong> — {action.description}
                  </ConfirmMessage>
                  {isDestructive(action) && (
                    <ConfirmMessage style={{ color: '#d44800', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Warning size="sm" />
                      This action cannot be undone.
                    </ConfirmMessage>
                  )}
                  <ConfirmButtons>
                    <Button variant="tertiary" size="sm" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button
                      variant={isDestructive(action) ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => handleConfirm(action)}
                    >
                      Confirm
                    </Button>
                  </ConfirmButtons>
                </ConfirmOverlay>
              );
            }

            return (
              <ActionCard
                key={action.action_id}
                $destructive={isDestructive(action)}
                onClick={() => handleActionClick(action)}
              >
                <ActionLabel $destructive={isDestructive(action)}>
                  {action.label}
                </ActionLabel>
                <ActionDescription>{action.description}</ActionDescription>
              </ActionCard>
            );
          })}
        </RailSection>
      )}

      {/* ── Result Banner ── */}
      {lastResult && (
        <ResultBanner $error={lastResult.status === 'error'}>
          {lastResult.message}
        </ResultBanner>
      )}

      <Divider />

      {/* ── Secondary Rail: Common Actions ── */}
      <RailSection>
        <SecondaryRow>
          {secondary.map((action) => {
            const onCooldown = isActionOnCooldown(
              action,
              executionHistory[action.action_id]
            );
            const cooldownLabel = executionHistory[action.action_id]
              ? getCooldownLabel(executionHistory[action.action_id])
              : null;

            const icon = COMMON_ACTION_ICONS[action.action_id];

            return (
              <Tooltip
                key={action.action_id}
                trigger="hover"
                placement="top"
                overlay={
                  <Tooltip.Content>
                    <div style={{ maxWidth: 220 }}>{action.description}</div>
                  </Tooltip.Content>
                }
              >
                <Button
                  variant="tertiary"
                  size="sm"
                  icon={icon}
                  disabled={onCooldown}
                  onClick={() => handleActionClick(action)}
                  aria-label={action.label}
                >
                  {action.label}
                  {onCooldown && cooldownLabel && (
                    <CooldownBadge>{cooldownLabel}</CooldownBadge>
                  )}
                </Button>
              </Tooltip>
            );
          })}
        </SecondaryRow>
      </RailSection>
    </RailContainer>
  );
}
