import React, { useRef } from "react";
import { Button, Modal, Title, Typography } from "@procore/core-react";
import { Connect, Calendar, FileChartLine, FileQuestionMark, Stamp, PencilErase } from "@procore/core-icons";
import styled from "styled-components";
import type { ProjectConnection, ConnectedDataConfig } from "@/data/procoreConnect";

const SectionHeading = styled.h3`
  font-size: 16px;
  line-height: 24px;
  font-weight: 600;
  letter-spacing: 0.15px;
  color: #232729;
  margin: 0;
`;

const ProjectTile = styled.div`
  border: 1px solid #eef0f1;
  border-radius: 4px;
  padding: 12px 20px;
  display: flex;
  gap: 16px;
`;

const ProjectColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ProjectLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  letter-spacing: 0.25px;
  color: #232729;
`;

const ProjectName = styled.div`
  font-size: 16px;
  line-height: 24px;
  font-weight: 600;
  color: #232729;
`;

const ProjectMeta = styled.div`
  font-size: 14px;
  line-height: 20px;
  color: #6a767c;
`;

const ConnectedDataBanner = styled.div`
  background: #f4f5f6;
  border-radius: 4px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DataRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  line-height: 20px;
  color: #232729;
`;

const DataLabel = styled.span`
  font-weight: 600;
`;

const Divider = styled.div`
  width: 1px;
  align-self: stretch;
  background: #eef0f1;
`;

const BodyContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DATA_ICON_MAP: Record<ConnectedDataConfig["icon"], React.ReactNode> = {
  changeEvents: <PencilErase size="sm" />,
  schedule: <Calendar size="sm" />,
  budget: <FileChartLine size="sm" />,
  rfis: <FileQuestionMark size="sm" />,
  submittals: <Stamp size="sm" />,
};

interface ConnectModalProps {
  connection: ProjectConnection;
  open: boolean;
  onClose: () => void;
}

export default function ConnectModal({ connection, open, onClose }: ConnectModalProps) {
  const { upstream, connectedDataConfig, lastSyncedLabel } = connection;

  return (
    <Modal
      open={open}
      onClose={onClose}
      howToClose={["x", "scrim"]}
      width="md"
      placement="center"
      aria-labelledby="connect-modal-heading"
    >
      <Modal.Header>
        <Title>
          <Title.Text>
            <Modal.Heading id="connect-modal-heading">Connected Project Data</Modal.Heading>
          </Title.Text>
        </Title>
      </Modal.Header>
      <Modal.Body>
        <BodyContent>
          <SectionHeading>Connection with {upstream.company}</SectionHeading>
          <ProjectTile>
            <ProjectColumn>
              <ProjectLabel>
                <Connect size="sm" style={{ color: "#FF5200" }} />
                Their Project (Upstream)
              </ProjectLabel>
              <ProjectName>{upstream.projectNumber} — {upstream.projectName}</ProjectName>
              <ProjectMeta>{upstream.address}</ProjectMeta>
              <ProjectMeta>{upstream.company}</ProjectMeta>
            </ProjectColumn>
            <Divider />
            <ProjectColumn>
              <ProjectLabel>Your Project (Downstream)</ProjectLabel>
              <ProjectName>{connection.localProjectNumber} — {connection.localProjectName}</ProjectName>
              <ProjectMeta>{connection.localAddress}</ProjectMeta>
              <ProjectMeta>{connection.localCompany}</ProjectMeta>
            </ProjectColumn>
          </ProjectTile>

          <SectionHeading>Connected Data</SectionHeading>
          <ConnectedDataBanner>
            {connectedDataConfig.map((cfg) => (
              <DataRow key={cfg.label}>
                {DATA_ICON_MAP[cfg.icon]}
                <DataLabel>{cfg.label}:</DataLabel>
                {cfg.description}
              </DataRow>
            ))}
          </ConnectedDataBanner>

          <SectionHeading>Summary</SectionHeading>
          <ConnectedDataBanner>
            <DataRow>
              <DataLabel>RFIs:</DataLabel>
              {connection.counts.rfis.open} open, {connection.counts.rfis.closed} closed
              &nbsp;·&nbsp;{connection.counts.rfis.costImpact} cost impact, {connection.counts.rfis.scheduleImpact} schedule impact
            </DataRow>
            <DataRow>
              <DataLabel>Punch List:</DataLabel>
              {connection.counts.punchList.open} open, {connection.counts.punchList.closed} closed ({connection.counts.punchList.total} total)
            </DataRow>
            <DataRow>
              <DataLabel>Observations:</DataLabel>
              {connection.counts.observations.open} open, {connection.counts.observations.closed} closed ({connection.counts.observations.total} total)
            </DataRow>
            <DataRow>
              <DataLabel>Submittals:</DataLabel>
              {connection.counts.submittals.approved} approved, {connection.counts.submittals.pending} pending, {connection.counts.submittals.rejected} rejected
            </DataRow>
            <DataRow>
              <DataLabel>Change Events:</DataLabel>
              {connection.counts.changeEvents.approved} approved, {connection.counts.changeEvents.pending} pending
              &nbsp;·&nbsp;${(connection.counts.changeEvents.totalCostImpact / 1_000_000).toFixed(1)}M cost impact
            </DataRow>
            <DataRow>
              <DataLabel>Schedule:</DataLabel>
              {connection.schedule.tasksCompleted}/{connection.schedule.totalTasks} tasks complete
              &nbsp;·&nbsp;{connection.schedule.milestonesCompleted}/{connection.schedule.milestonesTotal} milestones
              &nbsp;·&nbsp;
              <span style={{ color: connection.schedule.scheduleDaysVariance > 0 ? "#d92626" : connection.schedule.scheduleDaysVariance < 0 ? "#2e7d32" : "#232729" }}>
                {connection.schedule.scheduleDaysVariance > 0 ? "+" : ""}{connection.schedule.scheduleDaysVariance}d variance
              </span>
            </DataRow>
            <DataRow>
              <DataLabel>Budget:</DataLabel>
              {connection.budget.approvedBudgetChanges} approved changes
              &nbsp;·&nbsp;{connection.budget.contingencyUsedPercent}% contingency used
              &nbsp;·&nbsp;${(connection.budget.costVariance / 1_000_000).toFixed(1)}M variance
            </DataRow>
          </ConnectedDataBanner>
        </BodyContent>
      </Modal.Body>
      <Modal.Footer>
        <Modal.FooterSummary>
          <Typography intent="small" color="gray45">
            Last updated {lastSyncedLabel}
          </Typography>
        </Modal.FooterSummary>
        <Modal.FooterButtons>
          <Button variant="tertiary" onClick={onClose}>
            Close
          </Button>
        </Modal.FooterButtons>
      </Modal.Footer>
    </Modal>
  );
}

// ─── Inline Connect Icon Button ───────────────────────────────────────────────

const ConnectIconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  color: #ff5200;
  vertical-align: middle;
  &:hover {
    background: rgba(255, 82, 0, 0.08);
  }
  &:focus-visible {
    outline: 2px solid #ff5200;
    outline-offset: 1px;
  }
`;

interface ConnectIconWithPopoverProps {
  connection: ProjectConnection;
}

export function ConnectIconWithPopover({ connection }: ConnectIconWithPopoverProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <ConnectIconButton
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label={`View Procore Connect details for ${connection.upstream.company}`}
        title="Procore Connect"
      >
        <Connect size="sm" />
      </ConnectIconButton>
      <ConnectModal
        connection={connection}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
