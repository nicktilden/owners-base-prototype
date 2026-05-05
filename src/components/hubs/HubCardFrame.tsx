import React from "react";
import { Tooltip, Typography } from "@procore/core-react";
import { Info } from "@procore/core-icons";
import styled from "styled-components";

const Card = styled.div`
  background: var(--color-surface-card);
  border-radius: 8px;
  border: 1px solid var(--color-card-border);
  box-shadow: 0px 2px 6px 0px var(--color-shadow);
  display: flex;
  flex-direction: column;
  min-height: 200px;
  max-height: 440px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 16px 16px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  height: 44px;
  gap: 8px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

const Controls = styled.div`
  padding: 8px 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  min-width: 0;
`;

const Content = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 8px 16px 16px;
`;

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyStateWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 120px;
  padding: 24px 16px;
  text-align: center;
`;

const EmptyStateTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.35;
  color: var(--color-text-primary);
  max-width: 400px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const EmptyStateBody = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-secondary);
  max-width: 400px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const EmptyStateActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
`;

interface HubCardEmptyStateProps {
  title?: string;
  body?: string;
  actions?: React.ReactNode;
}

export function HubCardEmptyState({
  title = "No Data to Display Right Now",
  body = "There is nothing to show here yet. Data will appear once activity has been recorded for this project.",
  actions,
}: HubCardEmptyStateProps) {
  return (
    <EmptyStateWrap>
      <EmptyStateTitle>{title}</EmptyStateTitle>
      <EmptyStateBody>{body}</EmptyStateBody>
      {actions ? <EmptyStateActions>{actions}</EmptyStateActions> : null}
    </EmptyStateWrap>
  );
}

// ─── Frame ────────────────────────────────────────────────────────────────────

interface HubCardFrameProps {
  title: React.ReactNode;
  infoTooltip?: React.ReactNode;
  titlePrefix?: React.ReactNode;
  titleSuffix?: React.ReactNode;
  actions?: React.ReactNode;
  controls?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export default function HubCardFrame({
  title,
  infoTooltip,
  titlePrefix,
  titleSuffix,
  actions,
  controls,
  children,
  style,
}: HubCardFrameProps) {
  return (
    <Card className="card_container" style={style}>
      <Header>
        <HeaderLeft>
          {titlePrefix}
          <Typography intent="h3" style={{ fontWeight: 600, color: "var(--color-text-primary)", fontSize: 16, letterSpacing: "0.15px" }}>
            {title}
          </Typography>
          {infoTooltip ? (
            <Tooltip
              trigger="hover"
              placement="top"
              overlay={
                <Tooltip.Content>
                  <div
                    style={{
                      maxWidth: 280,
                      lineHeight: 1.45,
                      whiteSpace: "normal",
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                    }}
                  >
                    {infoTooltip}
                  </div>
                </Tooltip.Content>
              }
            >
              <span style={{ display: "inline-flex", color: "var(--color-text-primary)" }} aria-label="Card dataset info">
                <Info size="sm" />
              </span>
            </Tooltip>
          ) : null}
          {titleSuffix}
        </HeaderLeft>
        {actions}
      </Header>
      {controls ? <Controls>{controls}</Controls> : null}
      <Content>{children}</Content>
    </Card>
  );
}
