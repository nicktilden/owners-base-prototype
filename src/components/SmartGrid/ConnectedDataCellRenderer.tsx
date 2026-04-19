/**
 * CONNECTED DATA CELL RENDERER
 *
 * Generic AG Grid cell renderer for all 16 portfolio connected-data columns.
 * Uses a core-react Popover (hover-triggered) to show detailed data per the spec.
 *
 * - Connected project:   shows upstream GC counts + orange Connect icon + Popover on hover.
 * - Unconnected project: shows own-account counts (rfis/submittals/punchList only), no Popover.
 *
 * Parametrized via `cellRendererParams.dataKey: ConnectedDataKey`.
 */

import React from "react";
import styled from "styled-components";
import { Connect } from "@procore/core-icons";
import { Popover } from "@procore/core-react";
import type { ICellRendererParams } from "ag-grid-community";
import type { ProjectRow } from "@/data/projects";
import type { ConnectedDataCounts, ProjectConnection } from "@/data/procoreConnect";
import { getProjectOwnCounts } from "@/data/procoreConnect";
import { useConnection } from "@/context/ConnectionContext";
import type { PortfolioGridContext } from "./portfolioGridContext";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ConnectedDataKey =
  | "rfis"
  | "submittals"
  | "punchList"
  | "observations"
  | "dailyLogs"
  | "drawings"
  | "changeOrders"
  | "invoicing"
  | "photos"
  | "documents"
  | "cost"
  | "specifications"
  | "correspondence"
  | "inspections"
  | "bimModels"
  | "schedule";

export interface ConnectedDataCellRendererParams extends ICellRendererParams<ProjectRow> {
  dataKey: ConnectedDataKey;
}

// ─── Styled components ────────────────────────────────────────────────────────

const CellWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  height: 100%;
  font-size: 13px;
  color: var(--color-text-primary);
  cursor: default;
`;

const ConnectBtn = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: var(--color-orange-50, #f26925);
  flex-shrink: 0;
`;

const Dot = styled.span`
  color: var(--color-text-secondary);
  font-size: 11px;
`;

const PopoverWrap = styled.div`
  min-width: 220px;
  max-width: 300px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  font-size: 14px;
  color: var(--color-text-primary);
`;

const PopLabel = styled.span`
  color: var(--color-text-secondary);
  font-size: 14px;
  white-space: nowrap;
`;

const PopValue = styled.span`
  font-weight: 600;
  text-align: right;
  font-size: 14px;
`;

const PopDivider = styled.div`
  height: 1px;
  background: var(--color-border-separator);
  margin: 3px 0;
`;

const PopHeader = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary);
  margin-bottom: 2px;
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt$(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function pRow(label: string, value: string | number) {
  return (
    <PopRow key={label}>
      <PopLabel>{label}</PopLabel>
      <PopValue>{value}</PopValue>
    </PopRow>
  );
}

// ─── Per-module cell content ──────────────────────────────────────────────────

function getCellContent(counts: ConnectedDataCounts, key: ConnectedDataKey): React.ReactNode {
  switch (key) {
    case "rfis":
      return <><span>{counts.rfis.open} open</span><Dot>·</Dot><span>{counts.rfis.closed} closed</span></>;
    case "submittals":
      return <span>{counts.submittals.avgApprovalCycleDays}d avg approval</span>;
    case "punchList":
      return <span>{counts.punchList.avgDaysToResolve}d avg to resolve</span>;
    case "observations":
      return <><span>{counts.observations.open} open</span><Dot>·</Dot><span>{counts.observations.closed} closed</span></>;
    case "dailyLogs":
      return <span>{counts.dailyLogs.thisMonth} logs this month</span>;
    case "drawings":
      return <span style={{ color: "var(--color-orange-50, #f26925)", textDecoration: "underline", cursor: "pointer" }}>Latest Drawings</span>;
    case "changeOrders":
      return <><span>{counts.changeOrders.pending} pending</span><Dot>·</Dot><span>{counts.changeOrders.approved} approved</span></>;
    case "invoicing":
      return <><span>{fmt$(counts.invoicing.amountRequested)} requested</span><Dot>·</Dot><span>{fmt$(counts.invoicing.totalBilledToDate)} billed</span></>;
    case "photos":
      return <><span>{counts.photos.thisMonth} this month</span><Dot>·</Dot><span>{counts.photos.total.toLocaleString()} total</span></>;
    case "documents":
      return <span>{counts.documents.received} received</span>;
    case "cost":
      return <><span>{fmt$(counts.cost.originalContractValue)}</span><Dot>·</Dot><span>{fmt$(counts.cost.actualCostToDate)} actual</span></>;
    case "specifications":
      return <span style={{ color: "var(--color-orange-50, #f26925)", textDecoration: "underline", cursor: "pointer" }}>Latest Specs</span>;
    case "correspondence":
      return <span>{counts.correspondence.sentThisMonth} sent this month</span>;
    case "inspections":
      return <><span>{counts.inspections.passed} passed</span><Dot>·</Dot><span>{counts.inspections.failed} failed</span></>;
    case "bimModels":
      return <span style={{ color: "var(--color-orange-50, #f26925)", textDecoration: "underline", cursor: "pointer" }}>Latest Model</span>;
    case "schedule":
      return <><span>Last: {counts.schedule.lastMilestone}</span><Dot>·</Dot><span>Next: {counts.schedule.nextMilestone}</span></>;
    default:
      return null;
  }
}

// ─── Per-module popover content ───────────────────────────────────────────────

function getPopoverContent(counts: ConnectedDataCounts, key: ConnectedDataKey): React.ReactNode {
  switch (key) {
    case "rfis":
      return (
        <PopoverWrap>
          {pRow("Open", counts.rfis.open)}
          {pRow("Closed", counts.rfis.closed)}
          {pRow("Overdue", counts.rfis.overdue)}
          <PopDivider />
          {pRow("Avg. days to close", `${counts.rfis.avgDaysToClose}d`)}
          {pRow("Avg. owner response time", `${counts.rfis.avgOwnerResponseTimeDays}d`)}
        </PopoverWrap>
      );
    case "submittals":
      return (
        <PopoverWrap>
          {pRow("Open", counts.submittals.pending)}
          {pRow("Approved", counts.submittals.approved)}
          {pRow("Under review", counts.submittals.underReview)}
          {pRow("Overdue", counts.submittals.overdue)}
          {pRow("Revise & resubmit", counts.submittals.reviseResubmit)}
          <PopDivider />
          <PopHeader>Awaiting</PopHeader>
          {pRow("Owner", counts.submittals.awaitingOwner)}
          {pRow("GC", counts.submittals.awaitingGC)}
          {pRow("Design team", counts.submittals.awaitingDesignTeam)}
          <PopDivider />
          {pRow("Avg. approval cycle time", `${counts.submittals.avgApprovalCycleDays}d`)}
          {pRow("First-pass approval rate", `${counts.submittals.firstPassApprovalRatePct}%`)}
        </PopoverWrap>
      );
    case "punchList":
      return (
        <PopoverWrap>
          {pRow("Open items", counts.punchList.open)}
          {pRow("Closed items", counts.punchList.closed)}
          {pRow("Overdue items", counts.punchList.overdue)}
          {pRow("Total items", counts.punchList.total)}
          <PopDivider />
          {pRow("Added this week", counts.punchList.addedThisWeek)}
          {pRow("Cleared this week", counts.punchList.clearedThisWeek)}
          {pRow("% complete", `${Math.round((counts.punchList.closed / counts.punchList.total) * 100)}%`)}
          {pRow("Avg. days to resolve", `${counts.punchList.avgDaysToResolve}d`)}
        </PopoverWrap>
      );
    case "observations":
      return (
        <PopoverWrap>
          {pRow("Open", counts.observations.open)}
          {pRow("Closed", counts.observations.closed)}
          {pRow("Overdue", counts.observations.overdue)}
          <PopDivider />
          <PopHeader>By type</PopHeader>
          {pRow("Safety", counts.observations.safety)}
          {pRow("Quality", counts.observations.quality)}
          {pRow("Other", counts.observations.other)}
          <PopDivider />
          {pRow("Awaiting GC response", counts.observations.awaitingGCResponse)}
          {pRow("Created by owner this month", counts.observations.createdByOwnerThisMonth)}
        </PopoverWrap>
      );
    case "dailyLogs":
      return (
        <PopoverWrap>
          {pRow("Last log submitted", counts.dailyLogs.lastSubmittedDate)}
          {pRow("Logs submitted this month", counts.dailyLogs.thisMonth)}
          {pRow("Missing log days", counts.dailyLogs.missingDays)}
          <PopDivider />
          {pRow("Workers on site this week", counts.dailyLogs.workersOnSiteThisWeek)}
          {pRow("Workers on site (avg.)", counts.dailyLogs.workersOnSiteAvg)}
          {pRow("Weather delay days", counts.dailyLogs.weatherDelayDaysThisMonth)}
          {pRow("Work stoppage events", counts.dailyLogs.workStoppageEvents)}
        </PopoverWrap>
      );
    case "drawings":
      return (
        <PopoverWrap>
          {pRow("Latest revision date", counts.drawings.latestRevisionDate)}
          {pRow("Markups added this week", counts.drawings.markupsAddedThisWeek)}
          {pRow("Sheets w/ unresolved markups", counts.drawings.sheetsWithUnresolvedMarkups)}
        </PopoverWrap>
      );
    case "changeOrders":
      return (
        <PopoverWrap>
          {pRow("Total approved CO value", fmt$(counts.changeOrders.totalApprovedValue))}
          {pRow("Total pending CO value", fmt$(counts.changeOrders.totalPendingValue))}
          <PopDivider />
          {pRow("Pending owner approval", counts.changeOrders.pending)}
          {pRow("Approved", counts.changeOrders.approved)}
          {pRow("In review", counts.changeOrders.inReview)}
          {pRow("Overdue / disputed", counts.changeOrders.overdueDisputed)}
          <PopDivider />
          {pRow("Net change to contract", `${counts.changeOrders.netChangeToContractPct}%`)}
          {pRow("Contingency remaining", fmt$(counts.changeOrders.contingencyRemaining))}
          {pRow("Avg. days to owner approval", `${counts.changeOrders.avgDaysToOwnerApproval}d`)}
        </PopoverWrap>
      );
    case "invoicing":
      return (
        <PopoverWrap>
          {pRow("Amount requested", fmt$(counts.invoicing.amountRequested))}
          {pRow("Total billed to date", fmt$(counts.invoicing.totalBilledToDate))}
          {pRow("% contract value billed", `${counts.invoicing.contractValueBilledPct}%`)}
          <PopDivider />
          {pRow("Retainage held", fmt$(counts.invoicing.retainageHeld))}
          {pRow("Retainage released", fmt$(counts.invoicing.retainageReleased))}
          {pRow("Status", counts.invoicing.status)}
          {counts.invoicing.overdueDays > 0 && pRow("Overdue by", `${counts.invoicing.overdueDays}d`)}
        </PopoverWrap>
      );
    case "photos":
      return (
        <PopoverWrap>
          {pRow("Total photos", counts.photos.total.toLocaleString())}
          {pRow("Uploaded this week", counts.photos.thisWeek)}
          {pRow("Uploaded this month", counts.photos.thisMonth)}
        </PopoverWrap>
      );
    case "documents":
      return (
        <PopoverWrap>
          {pRow("Documents received", counts.documents.received)}
          {pRow("% closeout package complete", `${counts.documents.closeoutCompletePct}%`)}
          {pRow("Documents outstanding", counts.documents.outstanding)}
          <PopDivider />
          <PopHeader>Closeout docs</PopHeader>
          {pRow("As-builts", `${counts.documents.asBuiltReceived} / ${counts.documents.asBuiltRequired}`)}
          {pRow("Warranties", `${counts.documents.warrantiesReceived} / ${counts.documents.warrantiesRequired}`)}
          {pRow("O&M manuals", `${counts.documents.OMmanualsReceived} / ${counts.documents.OMmanualsRequired}`)}
        </PopoverWrap>
      );
    case "cost":
      return (
        <PopoverWrap>
          {pRow("Original contract value", fmt$(counts.cost.originalContractValue))}
          {pRow("Approved COs", fmt$(counts.cost.approvedCOs))}
          {pRow("Revised contract value", fmt$(counts.cost.revisedContractValue))}
          <PopDivider />
          {pRow("Actual cost to date", fmt$(counts.cost.actualCostToDate))}
          {pRow("Forecast at completion", fmt$(counts.cost.forecastAtCompletion))}
          {pRow("Variance to budget", fmt$(counts.cost.varianceToBudget))}
          {pRow("Contingency remaining", fmt$(counts.cost.contingencyRemaining))}
        </PopoverWrap>
      );
    case "specifications":
      return (
        <PopoverWrap>
          {pRow("Approved substitutions", counts.specifications.approvedSubstitutions)}
          {pRow("Sections linked to submittals", counts.specifications.sectionsLinkedToSubmittals)}
          {pRow("Sections with open RFIs", counts.specifications.sectionsWithOpenRFIs)}
        </PopoverWrap>
      );
    case "correspondence":
      return (
        <PopoverWrap>
          {pRow("Sent this month", counts.correspondence.sentThisMonth)}
          {pRow("Unanswered formal", counts.correspondence.unansweredFormal)}
          <PopDivider />
          {pRow("Active EOT claims (days)", counts.correspondence.activeEOTClaimsDays)}
          {pRow("Open risk register items", counts.correspondence.openRiskItems)}
          {pRow("Mitigated / closed items", counts.correspondence.mitigatedRiskItems)}
        </PopoverWrap>
      );
    case "inspections":
      return (
        <PopoverWrap>
          {pRow("Scheduled this week", counts.inspections.scheduledThisWeek)}
          {pRow("Passed", counts.inspections.passed)}
          {pRow("Failed", counts.inspections.failed)}
          {pRow("Open corrective actions", counts.inspections.openCorrectiveActions)}
          <PopDivider />
          {pRow("Permit inspections completed", counts.inspections.permitCompleted)}
          {pRow("Permit inspections outstanding", counts.inspections.permitOutstanding)}
          {pRow("First-attempt pass rate", `${counts.inspections.firstAttemptPassRatePct}%`)}
        </PopoverWrap>
      );
    case "bimModels":
      return (
        <PopoverWrap>
          {pRow("Open clashes (total)", counts.bimModels.openClashes)}
          {pRow("Resolved clashes", counts.bimModels.resolvedClashes)}
          {pRow("High-severity open clashes", counts.bimModels.highSeverityOpenClashes)}
        </PopoverWrap>
      );
    case "schedule":
      return (
        <PopoverWrap>
          {pRow("Last milestone", counts.schedule.lastMilestone)}
          {pRow("Next milestone", counts.schedule.nextMilestone)}
          <PopDivider />
          {pRow("Days ahead / behind", counts.schedule.daysVariance > 0 ? `+${counts.schedule.daysVariance}d (behind)` : `${Math.abs(counts.schedule.daysVariance)}d ahead`)}
          {pRow("Milestones completed on time", counts.schedule.milestonesOnTime)}
          {pRow("Critical path float", `${counts.schedule.criticalPathFloatDays}d`)}
          {pRow("% complete", `${counts.schedule.percentComplete}%`)}
        </PopoverWrap>
      );
    default:
      return null;
  }
}

// ─── Own-account cell content (unconnected projects) ─────────────────────────

type OwnKey = "rfis" | "submittals" | "punchList";
const OWN_KEYS: Set<string> = new Set(["rfis", "submittals", "punchList"]);

function getOwnCellContent(projectId: number, key: OwnKey): React.ReactNode {
  const own = getProjectOwnCounts(projectId);
  if (!own) return null;
  if (key === "rfis")
    return <><span>{own.rfis.open} open</span><Dot>·</Dot><span>{own.rfis.closed} closed</span></>;
  if (key === "submittals")
    return <><span>{own.submittals.pending} pending</span><Dot>·</Dot><span>{own.submittals.approved} approved</span></>;
  if (key === "punchList")
    return <><span>{own.punchList.open} open</span><Dot>·</Dot><span>{own.punchList.total} total</span></>;
  return null;
}

// ─── Renderer ─────────────────────────────────────────────────────────────────

export default function ConnectedDataCellRenderer(params: ConnectedDataCellRendererParams) {
  const { dataKey } = params;
  const row = params.data;
  const context = params.context as PortfolioGridContext | undefined;

  const { getConnection } = useConnection();
  const connection: ProjectConnection | undefined = row ? getConnection(row.id) : undefined;

  if (!row) return null;

  // Unconnected: only show own-account data for the 3 base columns
  if (!connection) {
    if (!OWN_KEYS.has(dataKey)) return null;
    return (
      <CellWrap>
        {getOwnCellContent(row.id, dataKey as OwnKey)}
      </CellWrap>
    );
  }

  // Connected: full cell content + hover Popover
  const cellContent = getCellContent(connection.counts, dataKey);
  const popoverContent = getPopoverContent(connection.counts, dataKey);

  return (
    <CellWrap>
      <ConnectBtn
        title="View connection"
        onClick={(e) => { e.stopPropagation(); context?.onOpenConnectionTab?.(row); }}
      >
        <Connect size="sm" />
      </ConnectBtn>
      <Popover
        overlay={
          <Popover.Content>
            {popoverContent}
          </Popover.Content>
        }
        trigger={["hover"]}
        placement="bottom-left"
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {cellContent}
        </span>
      </Popover>
    </CellWrap>
  );
}
