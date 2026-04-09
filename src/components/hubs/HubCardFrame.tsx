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
  max-height: 420px;
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

interface HubCardFrameProps {
  title: React.ReactNode;
  infoTooltip?: React.ReactNode;
  titlePrefix?: React.ReactNode;
  titleSuffix?: React.ReactNode;
  actions?: React.ReactNode;
  controls?: React.ReactNode;
  children: React.ReactNode;
}

export default function HubCardFrame({
  title,
  infoTooltip,
  titlePrefix,
  titleSuffix,
  actions,
  controls,
  children,
}: HubCardFrameProps) {
  return (
    <Card className="card_container">
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
