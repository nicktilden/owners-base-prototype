import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Banner,
  Box,
  Button,
  Card,
  Checkbox,
  Form,
  H2,
  Page,
  Pill,
  Select,
  Switch,
  Tabs,
  Tearsheet,
  TextArea,
  Tooltip,
  Typography,
} from "@procore/core-react";
import {
  Blueprint,
  Calendar,
  Camera,
  ClipboardCheck,
  Connect,
  Cube,
  Envelope,
  FileCurrencyUSA,
  FileChartLine,
  FileList,
  FileQuestionMark,
  Folder,
  Info,
  NotepadList,
  NotepadPencil,
  Payments,
  Stamp,
} from "@procore/core-icons";
import styled, { createGlobalStyle } from "styled-components";
import type { ProjectRow, ProjectStage } from "@/data/projects";
import { useConnection } from "@/context/ConnectionContext";
import type { ProjectConnection, ConnectFeatureIcon } from "@/data/procoreConnect";
import {
  UPSTREAM_COMPANIES,
  UPSTREAM_PROJECTS_BY_COMPANY,
  CONNECT_FEATURES,
} from "@/data/procoreConnect";
import {
  PROJECT_PROGRAMS,
  PROJECT_STAGES,
  PROJECT_REGIONS,
  sampleProjectRows,
  parseLocationCityState,
  getProjectPortfolioScheduleSummary,
} from "@/data/projects";
import type { ProjectStatus, ProjectType, DeliveryMethod, ProjectSector } from "@/types/project";

const ProjectEditTearsheetWidth = createGlobalStyle`
  [class*="StyledTearsheetBody"]:has(> .project-edit-tearsheet-root) {
    flex: 0 0 min(720px, 92vw) !important;
  }
`;

const SectionCard = styled(Card)`
  padding: 24px;
  background: var(--color-surface-primary);
  margin-bottom: 16px;
`;

const READ_ONLY_BOX = {
  padding: "10px 12px",
  borderRadius: 4,
  background: "var(--color-surface-secondary)",
  border: "1px solid var(--color-border-separator)",
} as const;

const TABS = ["General", "Financial", "Schedule", "Classification", "Connection"] as const;
type TabKey = (typeof TABS)[number];

// ─── Connection tab styled components ─────────────────────────────────────────

const ConnectBadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const ConnectBadgeBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 14px;
  border: 1.5px solid #ff5200;
  border-radius: 4px;
  background: var(--color-surface-primary);
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  transition: background 0.15s;
  &:hover { background: rgba(255, 82, 0, 0.07); }
`;

const ConnectDetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 24px;
`;

const ConnectDetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const ConnectDetailLabel = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ConnectDetailValue = styled.div`
  font-size: 14px;
  color: var(--color-text-primary);
`;

const FeatureTagsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
`;

/** Override the attention (yellow) Banner variant to match the Procore Connect orange brand. */
const OrangeConnectBanner = styled(Banner)`
  && {
    background: #fff8f5;
    border-color: #ffd4bd;
    border-left-color: #ff5200;
  }
  /* Icon slot */
  && svg {
    color: #ff5200;
  }
  /* Action button inherits orange text */
  && button[class*="tertiary"] {
    color: #ff5200;
    &:hover { color: #cc4200; }
  }
`;

const PM_OPTIONS = [...new Set(sampleProjectRows.map((p) => p.projectManager))].sort();
const REGION_OPTIONS = [...new Set(PROJECT_REGIONS as readonly string[])].sort();

/** Shown in Classification tab — matches common Figma “project admin” fields; not on {@link ProjectRow}. */
const STATUS_OPTIONS: { id: ProjectStatus; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
  { id: "on_hold", label: "On hold" },
  { id: "cancelled", label: "Cancelled" },
];

const TYPE_OPTIONS: ProjectType[] = [
  "Design-Build",
  "Design-Bid-Build",
  "CMAR",
  "Capital Improvements",
  "Transmission",
  "Sample Project",
];

const DELIVERY_OPTIONS: DeliveryMethod[] = [
  "Design-Build (DB)",
  "Design-Bid-Build (DBB)",
  "Construction Management at Risk (CMaR)",
  "Integrated Project Delivery",
];

const SECTOR_OPTIONS: ProjectSector[] = [
  "Institutional > Health Care > Hospital",
  "Institutional > Health Care > Outpatient Care",
  "Commercial > Office",
  "Civil & Infrastructure > Energy > Energy Production",
  "Residential > Multifamily",
];

// ─── Wizard types & data ──────────────────────────────────────────────────────

type WizardStep = 1 | 2 | 3;

const DATA_ICON_MAP: Record<ConnectFeatureIcon, React.ReactNode> = {
  rfis:           <FileQuestionMark size="sm" />,
  submittals:     <Stamp size="sm" />,
  punchList:      <NotepadList size="sm" />,
  observations:   <FileList size="sm" />,
  drawings:       <Blueprint size="sm" />,
  schedule:       <Calendar size="sm" />,
  cost:           <FileChartLine size="sm" />,
  dailyLogs:      <NotepadPencil size="sm" />,
  changeOrders:   <FileCurrencyUSA size="sm" />,
  invoicing:      <Payments size="sm" />,
  photos:         <Camera size="sm" />,
  documents:      <Folder size="sm" />,
  specifications: <FileList size="sm" />,
  correspondence: <Envelope size="sm" />,
  inspections:    <ClipboardCheck size="sm" />,
  bimModels:      <Cube size="sm" />,
};

const CONSIDERATIONS = [
  "Your project won't be able to connect to other projects",
  "Data copied into your project cannot be modified",
  "Files aren't synced instantly (most appear within minutes, but some changes may take longer)",
  "Project Connections can be disconnected by either you or the Upstream company",
];

const STEP_LABELS: Record<WizardStep, string> = {
  1: "Select Project",
  2: "Select Data",
  3: "Confirm",
};

// ─── Stepper styled components ────────────────────────────────────────────────

const StepperRow = styled.div`
  display: flex;
  align-items: flex-start;
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
  background: ${(p) => (p.$completed ? "#ff5200" : p.$active ? "#fff" : "var(--color-surface-secondary)")};
  border: 2px solid ${(p) => (p.$active || p.$completed ? "#ff5200" : "#c4cacc")};
  color: ${(p) => (p.$completed ? "#fff" : p.$active ? "#ff5200" : "#6a767c")};
  flex-shrink: 0;
`;

const StepLabel = styled.div<{ $active: boolean }>`
  font-size: 11px;
  font-weight: ${(p) => (p.$active ? 700 : 500)};
  color: ${(p) => (p.$active ? "#232729" : "#6a767c")};
  white-space: nowrap;
  text-align: center;
`;

const StepConnector = styled.div<{ $completed: boolean }>`
  flex: 1;
  height: 2px;
  background: ${(p) => (p.$completed ? "#ff5200" : "#eef0f1")};
  margin: 13px 8px 0;
`;

// ─── Wizard field styled components ──────────────────────────────────────────

const WizardFieldLabel = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #232729;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RequiredStar = styled.span`
  color: #ff5200;
`;

const RequiredNote = styled.div`
  font-size: 12px;
  color: #ff5200;
  font-style: italic;
  margin-top: 8px;
`;

const FeatureList = styled.div`
  border: 1px solid #eef0f1;
  border-radius: 4px;
  overflow: hidden;
`;

const FeatureRow = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid #eef0f1;
  cursor: pointer;
  font-size: 14px;
  color: #232729;
  background: #fff;
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: #f4f5f6;
  }
`;

const FeatureIcon = styled.span`
  display: flex;
  align-items: center;
  color: #464f53;
`;

const FeatureLabel = styled.span`
  flex: 1;
  font-size: 15px;
  font-weight: 500;
`;

const ConfirmProjectTile = styled.div`
  border: 1px solid #eef0f1;
  border-radius: 4px;
  padding: 16px;
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
`;

const ConfirmColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const ConfirmColumnLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #232729;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ConfirmProjectName = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #232729;
  margin-top: 2px;
`;

const ConfirmMeta = styled.div`
  font-size: 13px;
  color: #6a767c;
  line-height: 1.4;
`;

const ConfirmDivider = styled.div`
  width: 1px;
  align-self: stretch;
  background: #eef0f1;
`;

const FeatureChipsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
`;

const FeatureChip = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #232729;
`;

const ThingsToConsider = styled.ul`
  margin: 0;
  padding-left: 20px;
  font-size: 14px;
  color: #464f53;
  line-height: 1.7;
`;

// ─── Connect empty state ───────────────────────────────────────────────────────

const ConnectEmptyStateWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  gap: 12px;
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-separator);
  border-radius: 8px;
`;

// ─── Stepper component ────────────────────────────────────────────────────────

function ConnectStepper({ step }: { step: WizardStep }) {
  const steps: WizardStep[] = [1, 2, 3];
  return (
    <StepperRow>
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <StepItem>
            <StepCircle $active={step === s} $completed={step > s}>
              {step > s ? "✓" : s}
            </StepCircle>
            <StepLabel $active={step === s}>{STEP_LABELS[s]}</StepLabel>
          </StepItem>
          {i < steps.length - 1 && <StepConnector $completed={step > s} />}
        </React.Fragment>
      ))}
    </StepperRow>
  );
}

function moneyToInput(n: number): string {
  return String(n);
}

function parseMoney(raw: string): number {
  const n = Number(String(raw).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export interface ProjectEditTearsheetProps {
  project: ProjectRow | null;
  open: boolean;
  defaultTab?: TabKey;
  onClose: () => void;
  onSave: (id: number, patch: Partial<ProjectRow>) => void;
}

export default function ProjectEditTearsheet({
  project,
  open,
  defaultTab = "General",
  onClose,
  onSave,
}: ProjectEditTearsheetProps) {
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);
  const [connectBannerDismissed, setConnectBannerDismissed] = useState(false);
  // Inline connection wizard state
  const [connectFlowStarted, setConnectFlowStarted] = useState(false);
  const [connectStep, setConnectStep] = useState<WizardStep>(1);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedProjectNum, setSelectedProjectNum] = useState("");
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>(["drawings", "rfis", "submittals"]);
  const { getConnection, addConnection } = useConnection();

  const programOptions = useMemo(
    () => PROJECT_PROGRAMS.map((p) => ({ id: p, label: p })),
    []
  );
  const stageOptions = useMemo(
    () => PROJECT_STAGES.map((s) => ({ id: s, label: s })),
    []
  );
  const regionOptions = useMemo(
    () => REGION_OPTIONS.map((r) => ({ id: r, label: r })),
    []
  );
  const pmOptions = useMemo(
    () => PM_OPTIONS.map((p) => ({ id: p, label: p })),
    []
  );

  const initialValues = useMemo(() => {
    if (!project) return {};
    // Form.Select requires full { id, label } objects as initial values to display
    // the current selection — a plain string id leaves the select visually empty.
    const toOpt = (opts: { id: string; label: string }[], val: string | undefined) =>
      opts.find((o) => o.id === val) ?? (val ? { id: val, label: val } : null);
    return {
      name: project.name,
      number: project.number,
      location: project.location,
      program: toOpt(programOptions, project.program),
      stage: toOpt(stageOptions, project.stage),
      region: toOpt(regionOptions, project.region),
      projectManager: toOpt(pmOptions, project.projectManager),
      priorities: project.priorities,
      startDate: project.startDate,
      endDate: project.endDate,
      originalBudget: moneyToInput(project.originalBudget),
      estimatedCost: moneyToInput(project.estimatedCost),
      jobToDateCost: moneyToInput(project.jobToDateCost),
      forecastToComplete: moneyToInput(project.forecastToComplete),
      estimatedCostAtCompletion: moneyToInput(project.estimatedCostAtCompletion),
    };
  }, [project, programOptions, stageOptions, regionOptions, pmOptions]);

  const [favorite, setFavorite] = useState(false);
  const [figmaStatus, setFigmaStatus] = useState<ProjectStatus>("active");
  const [figmaType, setFigmaType] = useState<ProjectType>("Design-Build");
  const [figmaDelivery, setFigmaDelivery] = useState<DeliveryMethod>("Design-Build (DB)");
  const [figmaSector, setFigmaSector] = useState<ProjectSector>(
    "Institutional > Health Care > Hospital"
  );
  const [figmaDescription, setFigmaDescription] = useState(
    "Prototype-only description field for Figma alignment."
  );

  useEffect(() => {
    if (!project) return;
    setFavorite(project.favorite);
    setActiveTab(defaultTab);
    setFigmaStatus("active");
    setFigmaType("Design-Build");
    setFigmaDelivery("Design-Build (DB)");
    setFigmaSector("Institutional > Health Care > Hospital");
    setFigmaDescription("Prototype-only description field for Figma alignment.");
    setConnectBannerDismissed(false);
    setConnectFlowStarted(false);
    setConnectStep(1);
    setSelectedCompany("");
    setSelectedProjectNum("");
    setSelectedFeatureIds(["drawings", "rfis", "submittals"]);
  }, [project?.id, open, defaultTab]);

  const handleSubmit = useCallback(
    (values: Record<string, unknown>) => {
      if (!project) return;
      const optId = (v: unknown, fallback: string) =>
        ((v as { id?: string } | null)?.id ?? String(v ?? "").trim()) || fallback;
      const patch: Partial<ProjectRow> = {
        name: String(values.name ?? "").trim() || project.name,
        number: String(values.number ?? "").trim() || project.number,
        location: String(values.location ?? "").trim() || project.location,
        program: optId(values.program, project.program),
        stage: optId(values.stage, project.stage) as ProjectStage,
        region: optId(values.region, project.region ?? "") as ProjectRow["region"],
        projectManager: optId(values.projectManager, project.projectManager),
        priorities: String(values.priorities ?? "").trim() || project.priorities,
        startDate: String(values.startDate ?? project.startDate).slice(0, 10),
        endDate: String(values.endDate ?? project.endDate).slice(0, 10),
        originalBudget: parseMoney(String(values.originalBudget ?? "")),
        estimatedCost: parseMoney(String(values.estimatedCost ?? "")),
        jobToDateCost: parseMoney(String(values.jobToDateCost ?? "")),
        forecastToComplete: parseMoney(String(values.forecastToComplete ?? "")),
        estimatedCostAtCompletion: parseMoney(String(values.estimatedCostAtCompletion ?? "")),
        favorite,
      };
      const loc = parseLocationCityState(patch.location ?? project.location);
      patch.city = loc.city;
      patch.state = loc.state;
      onSave(project.id, patch);
      onClose();
    },
    [favorite, onClose, onSave, project]
  );

  const connection = project ? getConnection(project.id) : undefined;
  const isConnected = !!connection;

  const handleAddConnection = useCallback(
    (conn: ProjectConnection) => {
      addConnection(conn);
    },
    [addConnection]
  );

  // Wizard derived state (kept above the early-return to satisfy Rules of Hooks)
  const upstreamProject = selectedCompany
    ? (UPSTREAM_PROJECTS_BY_COMPANY[selectedCompany] ?? []).find((p) => p.number === selectedProjectNum)
    : undefined;

  const companyOptions = useMemo(
    () => UPSTREAM_COMPANIES.map((c) => ({ id: c, label: c })),
    []
  );

  const projectOptions = useMemo(
    () =>
      selectedCompany
        ? (UPSTREAM_PROJECTS_BY_COMPANY[selectedCompany] ?? []).map((p) => ({
            id: p.number,
            label: `${p.number} - ${p.name}`,
          }))
        : [],
    [selectedCompany]
  );

  const enabledFeatures = useMemo(
    () => CONNECT_FEATURES.filter((f) => selectedFeatureIds.includes(f.id)),
    [selectedFeatureIds]
  );

  const step1Valid = !!selectedCompany && !!selectedProjectNum;
  const step2Valid = selectedFeatureIds.length > 0;

  const handleConfirm = useCallback(() => {
    if (!project || !selectedCompany || !upstreamProject) return;

    const now = new Date();
    const connectedDataConfig: ProjectConnection["connectedDataConfig"] = enabledFeatures.map((f) => ({
      label: f.label,
      icon: f.icon,
      description: "By status [Open / Closed]",
    }));

    const newConn: ProjectConnection = {
      localProjectId: project.id,
      upstream: {
        projectNumber: upstreamProject.number,
        projectName: upstreamProject.name,
        address: upstreamProject.address,
        company: selectedCompany,
      },
      localProjectNumber: project.number,
      localProjectName: project.name,
      localAddress: project.location,
      localCompany: "RivCloud Partners",
      connectedDataConfig,
      counts: {
        rfis:           { open: 0, closed: 0, costImpact: 0, scheduleImpact: 0, overdue: 0, avgDaysToClose: 0, avgOwnerResponseTimeDays: 0 },
        submittals:     { pending: 0, approved: 0, rejected: 0, total: 0, underReview: 0, overdue: 0, reviseResubmit: 0, awaitingOwner: 0, awaitingGC: 0, awaitingDesignTeam: 0, avgApprovalCycleDays: 0, firstPassApprovalRatePct: 0 },
        punchList:      { open: 0, closed: 0, total: 0, overdue: 0, addedThisWeek: 0, clearedThisWeek: 0, avgDaysToResolve: 0 },
        observations:   { open: 0, closed: 0, total: 0, overdue: 0, safety: 0, quality: 0, other: 0, awaitingGCResponse: 0, createdByOwnerThisMonth: 0 },
        dailyLogs:      { thisMonth: 0, lastSubmittedDate: "—", missingDays: 0, workersOnSiteThisWeek: 0, workersOnSiteAvg: 0, weatherDelayDaysThisMonth: 0, workStoppageEvents: 0 },
        drawings:       { latestRevisionDate: "—", markupsAddedThisWeek: 0, sheetsWithUnresolvedMarkups: 0 },
        changeOrders:   { approved: 0, pending: 0, totalApprovedValue: 0, totalPendingValue: 0, inReview: 0, overdueDisputed: 0, netChangeToContractPct: 0, contingencyRemaining: 0, avgDaysToOwnerApproval: 0 },
        invoicing:      { amountRequested: 0, totalBilledToDate: 0, contractValueBilledPct: 0, retainageHeld: 0, retainageReleased: 0, status: "Pending", overdueDays: 0 },
        photos:         { total: 0, thisWeek: 0, thisMonth: 0 },
        documents:      { received: 0, closeoutCompletePct: 0, outstanding: 0, asBuiltReceived: 0, asBuiltRequired: 0, warrantiesReceived: 0, warrantiesRequired: 0, OMmanualsReceived: 0, OMmanualsRequired: 0 },
        cost:           { originalContractValue: 0, approvedCOs: 0, revisedContractValue: 0, actualCostToDate: 0, forecastAtCompletion: 0, varianceToBudget: 0, contingencyRemaining: 0 },
        specifications: { total: 0, sections: 0, approvedSubstitutions: 0, sectionsLinkedToSubmittals: 0, sectionsWithOpenRFIs: 0 },
        correspondence: { sentThisMonth: 0, unansweredFormal: 0, activeEOTClaimsDays: 0, openRiskItems: 0, mitigatedRiskItems: 0 },
        inspections:    { scheduledThisWeek: 0, passed: 0, failed: 0, openCorrectiveActions: 0, permitCompleted: 0, permitOutstanding: 0, firstAttemptPassRatePct: 0 },
        bimModels:      { total: 0, active: 0, openClashes: 0, resolvedClashes: 0, highSeverityOpenClashes: 0 },
        schedule:       { lastMilestone: "—", nextMilestone: "—", daysVariance: 0, milestonesOnTime: 0, criticalPathFloatDays: 0, percentComplete: 0 },
      },
      lastSyncedIso: now.toISOString(),
      lastSyncedLabel: "just now",
    };

    handleAddConnection(newConn);
    // Reset wizard for next open
    setConnectFlowStarted(false);
    setConnectStep(1);
    setSelectedCompany("");
    setSelectedProjectNum("");
    setSelectedFeatureIds(["drawings", "rfis", "submittals"]);
  }, [project, selectedCompany, upstreamProject, enabledFeatures, handleAddConnection]);

  if (!project) return null;

  const sched = getProjectPortfolioScheduleSummary(project);

  return (
    <>
      <ProjectEditTearsheetWidth />
      <Tearsheet
        open={open}
        onClose={onClose}
        aria-labelledby="project-edit-tearsheet-title"
        placement="right"
      >
        <div
          className="project-edit-tearsheet-root"
          style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}
        >
          <Page
            style={{
              height: "100%",
              background: "var(--color-surface-primary)",
              color: "var(--color-text-primary)",
            }}
          >
            <Page.Main
              style={{
                height: "100%",
                overflow: "hidden",
                background: "var(--color-surface-primary)",
              }}
            >
              <Page.Header
                style={{
                  background: "var(--color-surface-primary)",
                  borderColor: "var(--color-border-separator)",
                }}
              >
                <Page.Title>
                  <Box
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <Box style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                      <Typography id="project-edit-tearsheet-title" intent="h2">
                        Project Details
                      </Typography>
                      <Typography intent="body" style={{ color: "var(--color-text-secondary)" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          {project.number} — {project.name}
                          {isConnected && (
                            <Connect
                              size="sm"
                              style={{ color: "#FF5200", flexShrink: 0 }}
                              aria-label="Connected project"
                            />
                          )}
                        </span>
                      </Typography>
                    </Box>
                    <Box style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <Button variant="tertiary" className="b_tertiary" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button variant="primary" className="b_primary" type="submit" form="project-edit-form">
                        Save
                      </Button>
                    </Box>
                  </Box>
                </Page.Title>
                <Page.Tabs>
                  <Tabs>
                    {TABS.map((tab) => (
                      <Tabs.Tab
                        key={tab}
                        role="button"
                        selected={activeTab === tab}
                        onPress={() => setActiveTab(tab)}
                      >
                        {tab}
                      </Tabs.Tab>
                    ))}
                  </Tabs>
                </Page.Tabs>
              </Page.Header>

              <Page.Body
                style={{
                  padding: 24,
                  overflowY: "auto",
                  background: "var(--color-surface-secondary)",
                }}
              >
                {!isConnected && !connectBannerDismissed && (
                  <div style={{ marginBottom: 16 }}>
                    <OrangeConnectBanner variant="attention">
                      <Banner.Icon icon={<Connect size="lg" />} />
                      <Banner.Content>
                        <Banner.Title>Connect this project to a GC project</Banner.Title>
                        <Banner.Body>
                          Get live RFIs, submittals, and punch list data from your GC.
                        </Banner.Body>
                      </Banner.Content>
                      <Banner.Action>
                        <Button
                          variant="tertiary"
                          className="b_tertiary"
                          onClick={() => {
                            setActiveTab("Connection");
                            setConnectFlowStarted(true);
                          }}
                        >
                          Connect
                        </Button>
                      </Banner.Action>
                      <Banner.Dismiss onClick={() => setConnectBannerDismissed(true)} />
                    </OrangeConnectBanner>
                  </div>
                )}

                <div style={{ display: activeTab === "Classification" ? "none" : "block" }}>
                  <Form
                    key={project.id}
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    enableReinitialize
                  >
                    <Form.Form id="project-edit-form" style={{ maxWidth: 960 }}>
                      <SectionCard style={{ display: activeTab === "General" ? "block" : "none" }}>
                        <H2 style={{ marginBottom: 16 }}>General</H2>
                        <Form.Row>
                          <Form.Text name="name" label="Project name" colStart={1} colWidth={12} required />
                        </Form.Row>
                        <Form.Row>
                          <Form.Text name="number" label="Project number" colStart={1} colWidth={6} required />
                          <Form.Text name="location" label="Address / location" colStart={7} colWidth={6} required />
                        </Form.Row>
                        <Form.Row>
                          <Form.Select
                            name="program"
                            label="Program"
                            colStart={1}
                            colWidth={6}
                            options={programOptions}
                          />
                          <Form.Select
                            name="stage"
                            label="Stage"
                            colStart={7}
                            colWidth={6}
                            options={stageOptions}
                          />
                        </Form.Row>
                        <Form.Row>
                          <Form.Select
                            name="region"
                            label="Region"
                            colStart={1}
                            colWidth={6}
                            options={regionOptions}
                          />
                          <Form.Select
                            name="projectManager"
                            label="Project manager"
                            colStart={7}
                            colWidth={6}
                            options={pmOptions}
                          />
                        </Form.Row>
                        <Form.Row>
                          <Form.Text name="priorities" label="Priorities" colStart={1} colWidth={12} />
                        </Form.Row>
                        <Form.Row>
                          <Form.Text name="startDate" label="Start date" colStart={1} colWidth={6} type="date" />
                          <Form.Text name="endDate" label="End date" colStart={7} colWidth={6} type="date" />
                        </Form.Row>
                        <Box style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
                          <Switch
                            aria-label="Favorite project"
                            checked={favorite}
                            onChange={(e) => setFavorite(e.currentTarget.checked)}
                          />
                          <Typography intent="body">Favorite project</Typography>
                        </Box>
                      </SectionCard>

                      <SectionCard style={{ display: activeTab === "Financial" ? "block" : "none" }}>
                        <H2 style={{ marginBottom: 16 }}>Financial</H2>
                        <Typography intent="small" style={{ marginBottom: 16, color: "var(--color-text-secondary)" }}>
                          Values are stored as whole dollars in the prototype dataset.
                        </Typography>
                        <Form.Row>
                          <Form.Text
                            name="originalBudget"
                            label="Original budget"
                            colStart={1}
                            colWidth={6}
                            type="number"
                          />
                          <Form.Text
                            name="estimatedCost"
                            label="Estimated cost"
                            colStart={7}
                            colWidth={6}
                            type="number"
                          />
                        </Form.Row>
                        <Form.Row>
                          <Form.Text
                            name="jobToDateCost"
                            label="Job to date cost"
                            colStart={1}
                            colWidth={6}
                            type="number"
                          />
                          <Form.Text
                            name="forecastToComplete"
                            label="Forecast to complete"
                            colStart={7}
                            colWidth={6}
                            type="number"
                          />
                        </Form.Row>
                        <Form.Row>
                          <Form.Text
                            name="estimatedCostAtCompletion"
                            label="Estimated cost at completion"
                            colStart={1}
                            colWidth={6}
                            type="number"
                          />
                        </Form.Row>
                      </SectionCard>

                      <SectionCard style={{ display: activeTab === "Schedule" ? "block" : "none" }}>
                        <H2 style={{ marginBottom: 16 }}>Schedule context</H2>
                        <Typography intent="body" style={{ marginBottom: 16, color: "var(--color-text-secondary)" }}>
                          Milestone labels and variance are derived from seed schedule data in code. Edit
                          start/end dates on the General tab to align timelines.
                        </Typography>
                        <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                          <Box>
                            <Typography intent="small" style={{ fontWeight: 600, marginBottom: 4 }}>
                              Last milestone
                            </Typography>
                            <div style={READ_ONLY_BOX}>
                              <Typography intent="body">{sched.lastMilestone}</Typography>
                            </div>
                          </Box>
                          <Box>
                            <Typography intent="small" style={{ fontWeight: 600, marginBottom: 4 }}>
                              Next milestone
                            </Typography>
                            <div style={READ_ONLY_BOX}>
                              <Typography intent="body">{sched.nextMilestone}</Typography>
                            </div>
                          </Box>
                          <Box style={{ gridColumn: "1 / -1" }}>
                            <Typography intent="small" style={{ fontWeight: 600, marginBottom: 4 }}>
                              Schedule variance (read only)
                            </Typography>
                            <div style={READ_ONLY_BOX}>
                              <Typography intent="body">{sched.scheduleVariance}d</Typography>
                            </div>
                          </Box>
                        </Box>
                      </SectionCard>
                    </Form.Form>
                  </Form>
                </div>

                {activeTab === "Connection" && (
                  <SectionCard>
                    <H2 style={{ marginBottom: 16 }}>Procore Connect</H2>

                    {isConnected && connection ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        {/* Header badge row */}
                        <ConnectBadgeRow>
                          <ConnectBadgeBtn aria-label="Connected" style={{ cursor: "default" }}>
                            <Connect size="sm" style={{ color: "#FF5200" }} />
                            {connection.upstream.company}
                          </ConnectBadgeBtn>
                          <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>
                            Last synced {connection.lastSyncedLabel}
                          </Typography>
                          <Typography intent="small" style={{ color: "#2e7d32", marginLeft: "auto" }}>
                            ✓ Active
                          </Typography>
                        </ConnectBadgeRow>

                        {/* Project tile — upstream vs downstream */}
                        <div style={{
                          border: "1px solid var(--color-border-separator)",
                          borderRadius: 4,
                          padding: "12px 20px",
                          display: "flex",
                          gap: 16,
                          background: "var(--color-surface-primary)",
                        }}>
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                            <Typography intent="small" style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                              <Connect size="sm" style={{ color: "#FF5200" }} /> Their Project (Upstream)
                            </Typography>
                            <Typography intent="body" style={{ fontWeight: 700 }}>
                              {connection.upstream.projectNumber} — {connection.upstream.projectName}
                            </Typography>
                            <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>
                              {connection.upstream.address}
                            </Typography>
                            <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>
                              {connection.upstream.company}
                            </Typography>
                          </div>
                          <div style={{ width: 1, alignSelf: "stretch", background: "var(--color-border-separator)" }} />
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                            <Typography intent="small" style={{ fontWeight: 700 }}>Your Project (Downstream)</Typography>
                            <Typography intent="body" style={{ fontWeight: 700 }}>
                              {connection.localProjectNumber} — {connection.localProjectName}
                            </Typography>
                            <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>
                              {connection.localAddress}
                            </Typography>
                            <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>
                              {connection.localCompany}
                            </Typography>
                          </div>
                        </div>

                        {/* Data summary */}
                        <div>
                          <Typography intent="small" style={{ fontWeight: 700, marginBottom: 16 }}>Connected Data</Typography>
                          <div style={{
                            background: "var(--color-surface-secondary)",
                            border: "1px solid var(--color-border-separator)",
                            borderRadius: 4,
                            padding: "16px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            marginTop: "8px",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--color-text-primary)" }}>
                              <span style={{ fontWeight: 600, flexShrink: 0 }}>RFIs:</span>
                              <span>{connection.counts.rfis.open} open | {connection.counts.rfis.closed} closed &nbsp;|&nbsp; {connection.counts.rfis.overdue} overdue</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--color-text-primary)" }}>
                              <span style={{ fontWeight: 600, flexShrink: 0 }}>Submittals:</span>
                              <span>{connection.counts.submittals.approved} approved | {connection.counts.submittals.pending} pending &nbsp;|&nbsp; {connection.counts.submittals.avgApprovalCycleDays}d avg approval cycle</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--color-text-primary)" }}>
                              <span style={{ fontWeight: 600, flexShrink: 0 }}>Punch List:</span>
                              <span>{connection.counts.punchList.open} open | {connection.counts.punchList.closed} closed &nbsp;|&nbsp; {connection.counts.punchList.avgDaysToResolve}d avg to resolve</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--color-text-primary)" }}>
                              <span style={{ fontWeight: 600, flexShrink: 0 }}>Observations:</span>
                              <span>{connection.counts.observations.open} open | {connection.counts.observations.closed} closed</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--color-text-primary)" }}>
                              <span style={{ fontWeight: 600, flexShrink: 0 }}>Daily Logs:</span>
                              <span>{connection.counts.dailyLogs.thisMonth} this month &nbsp;|&nbsp; last: {connection.counts.dailyLogs.lastSubmittedDate}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--color-text-primary)" }}>
                              <span style={{ fontWeight: 600, flexShrink: 0 }}>Drawings:</span>
                              <span>Rev. {connection.counts.drawings.latestRevisionDate} &nbsp;|&nbsp; {connection.counts.drawings.markupsAddedThisWeek} markups this week</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--color-text-primary)" }}>
                              <span style={{ fontWeight: 600, flexShrink: 0 }}>Change Orders:</span>
                              <span>{connection.counts.changeOrders.approved} approved | {connection.counts.changeOrders.pending} pending &nbsp;|&nbsp; ${(connection.counts.changeOrders.totalApprovedValue / 1_000_000).toFixed(1)}M approved value</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--color-text-primary)" }}>
                              <span style={{ fontWeight: 600, flexShrink: 0 }}>Invoicing:</span>
                              <span>${(connection.counts.invoicing.amountRequested / 1_000_000).toFixed(1)}M requested &nbsp;|&nbsp; ${(connection.counts.invoicing.totalBilledToDate / 1_000_000).toFixed(1)}M billed to date &nbsp;|&nbsp; {connection.counts.invoicing.status}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--color-text-primary)" }}>
                              <span style={{ fontWeight: 600, flexShrink: 0 }}>Photos:</span>
                              <span>{connection.counts.photos.total.toLocaleString()} total &nbsp;|&nbsp; {connection.counts.photos.thisMonth} this month</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--color-text-primary)" }}>
                              <span style={{ fontWeight: 600, flexShrink: 0 }}>Documents:</span>
                              <span>{connection.counts.documents.received} received &nbsp;|&nbsp; {connection.counts.documents.closeoutCompletePct}% closeout complete</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--color-text-primary)" }}>
                              <span style={{ fontWeight: 600, flexShrink: 0 }}>Budget / Cost:</span>
                              <span>${(connection.counts.cost.originalContractValue / 1_000_000).toFixed(1)}M contract &nbsp;|&nbsp; ${(connection.counts.cost.actualCostToDate / 1_000_000).toFixed(1)}M actual &nbsp;|&nbsp; ${(connection.counts.cost.varianceToBudget / 1_000_000).toFixed(1)}M variance</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--color-text-primary)" }}>
                              <span style={{ fontWeight: 600, flexShrink: 0 }}>Specifications:</span>
                              <span>{connection.counts.specifications.total} files | {connection.counts.specifications.sections} sections &nbsp;|&nbsp; {connection.counts.specifications.sectionsWithOpenRFIs} sections w/ open RFIs</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--color-text-primary)" }}>
                              <span style={{ fontWeight: 600, flexShrink: 0 }}>Correspondence:</span>
                              <span>{connection.counts.correspondence.sentThisMonth} sent this month &nbsp;|&nbsp; {connection.counts.correspondence.openRiskItems} open risk items</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--color-text-primary)" }}>
                              <span style={{ fontWeight: 600, flexShrink: 0 }}>Inspections:</span>
                              <span>{connection.counts.inspections.passed} passed | {connection.counts.inspections.failed} failed &nbsp;|&nbsp; {connection.counts.inspections.firstAttemptPassRatePct}% first-attempt pass rate</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--color-text-primary)" }}>
                              <span style={{ fontWeight: 600, flexShrink: 0 }}>BIM Models:</span>
                              <span>{connection.counts.bimModels.total} total | {connection.counts.bimModels.active} active &nbsp;|&nbsp; {connection.counts.bimModels.openClashes} open clashes</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--color-text-primary)" }}>
                              <span style={{ fontWeight: 600, flexShrink: 0 }}>Schedule:</span>
                              <span>
                                {connection.counts.schedule.percentComplete}% complete &nbsp;|&nbsp;{" "}
                                <span style={{ color: connection.counts.schedule.daysVariance > 0 ? "#d92626" : connection.counts.schedule.daysVariance < 0 ? "#2e7d32" : "inherit" }}>
                                  {connection.counts.schedule.daysVariance > 0 ? "+" : ""}{connection.counts.schedule.daysVariance}d variance
                                </span>
                                {" "}&nbsp;|&nbsp; Next: {connection.counts.schedule.nextMilestone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : connectFlowStarted ? (
                      <div>
                        {/* Stepper */}
                        <ConnectStepper step={connectStep} />

                        {/* Step 1 — Select upstream company & project */}
                        {connectStep === 1 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            <Typography intent="body">
                              Choose a company, then select a project belonging to that company as
                              the Upstream Project. Upstream projects send data, such as published
                              drawings, to your project.
                            </Typography>

                            <div>
                              <WizardFieldLabel>
                                Upstream Company <RequiredStar>*</RequiredStar>
                              </WizardFieldLabel>
                              <Select
                                placeholder="Select a company"
                                label={selectedCompany || undefined}
                                onSelect={(s) => {
                                  if (s.action !== "selected") return;
                                  setSelectedCompany(s.item as string);
                                  setSelectedProjectNum("");
                                }}
                                onClear={() => {
                                  setSelectedCompany("");
                                  setSelectedProjectNum("");
                                }}
                                block
                              >
                                {companyOptions.map((o) => (
                                  <Select.Option
                                    key={o.id}
                                    value={o.id}
                                    selected={selectedCompany === o.id}
                                  >
                                    {o.label}
                                  </Select.Option>
                                ))}
                              </Select>
                            </div>

                            <div>
                              <WizardFieldLabel>
                                Upstream Project <RequiredStar>*</RequiredStar>
                                <span style={{ fontSize: 13, color: "var(--color-text-primary)", fontWeight: 400 }}>
                                  <Info size="sm" aria-label="Upstream project info" />
                                </span>
                              </WizardFieldLabel>
                              <Select
                                placeholder={
                                  selectedCompany ? "Select a project" : "Select a company first"
                                }
                                label={
                                  upstreamProject
                                    ? `${upstreamProject.number} - ${upstreamProject.name}`
                                    : undefined
                                }
                                onSelect={(s) => {
                                  if (s.action !== "selected") return;
                                  setSelectedProjectNum(s.item as string);
                                }}
                                onClear={() => setSelectedProjectNum("")}
                                disabled={!selectedCompany}
                                block
                              >
                                {projectOptions.map((o) => (
                                  <Select.Option
                                    key={o.id}
                                    value={o.id}
                                    selected={selectedProjectNum === o.id}
                                  >
                                    {o.label}
                                  </Select.Option>
                                ))}
                              </Select>
                            </div>

                            <RequiredNote>* Required Field</RequiredNote>
                          </div>
                        )}

                        {/* Step 2 — Select Data */}
                        {connectStep === 2 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <Typography intent="body">
                              <strong>Select at least one of the following features</strong>{" "}
                              you'd like to use in this connection. Some features may become
                              available immediately, while others may require approval from the
                              Upstream project.
                            </Typography>
                            <Typography intent="body">
                              You can always request or enable more features later if you'd prefer.
                            </Typography>

                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                              <Button
                                variant="tertiary"
                                className="b_tertiary"
                                size="sm"
                                onClick={() =>
                                  setSelectedFeatureIds(
                                    selectedFeatureIds.length === CONNECT_FEATURES.length
                                      ? []
                                      : CONNECT_FEATURES.map((f) => f.id)
                                  )
                                }
                              >
                                {selectedFeatureIds.length === CONNECT_FEATURES.length
                                  ? "Deselect All"
                                  : "Select All"}
                              </Button>
                            </div>

                            <FeatureList>
                              {CONNECT_FEATURES.map((feat) => (
                                <FeatureRow key={feat.id}>
                                  <Checkbox
                                    checked={selectedFeatureIds.includes(feat.id)}
                                    onChange={() =>
                                      setSelectedFeatureIds((prev) =>
                                        prev.includes(feat.id)
                                          ? prev.filter((id) => id !== feat.id)
                                          : [...prev, feat.id]
                                      )
                                    }
                                    aria-label={feat.label}
                                  />
                                  <FeatureIcon>{DATA_ICON_MAP[feat.icon]}</FeatureIcon>
                                  <FeatureLabel>{feat.label}</FeatureLabel>
                                  {feat.isPilot && <Pill color="green">Pilot</Pill>}
                                  <Tooltip overlay={feat.description} placement="top">
                                    <Info
                                      size="sm"
                                      style={{ color: "var(--color-text-primary)", cursor: "default", flexShrink: 0 }}
                                      aria-label={`Learn more about ${feat.label}`}
                                    />
                                  </Tooltip>
                                </FeatureRow>
                              ))}
                            </FeatureList>
                          </div>
                        )}

                        {/* Step 3 — Confirm */}
                        {connectStep === 3 && upstreamProject && (
                          <div>
                            <ConfirmProjectTile>
                              <ConfirmColumn>
                                <ConfirmColumnLabel>
                                  <Connect size="sm" style={{ color: "#ff5200" }} />
                                  Their Project (Upstream)
                                </ConfirmColumnLabel>
                                <ConfirmProjectName>{selectedCompany}</ConfirmProjectName>
                                <ConfirmMeta>
                                  {upstreamProject.number} - {upstreamProject.name}
                                </ConfirmMeta>
                                <ConfirmMeta>{upstreamProject.address}</ConfirmMeta>
                              </ConfirmColumn>
                              <ConfirmDivider />
                              <ConfirmColumn>
                                <ConfirmColumnLabel>Your Project (Downstream)</ConfirmColumnLabel>
                                <ConfirmProjectName>RivCloud Partners</ConfirmProjectName>
                                <ConfirmMeta>
                                  {project.number} - {project.name}
                                </ConfirmMeta>
                                <ConfirmMeta>{project.location}</ConfirmMeta>
                              </ConfirmColumn>
                            </ConfirmProjectTile>

                            <Typography intent="body" style={{ marginBottom: 8 }}>
                              Requested Features:
                            </Typography>
                            <FeatureChipsRow>
                              {enabledFeatures.map((f) => (
                                <FeatureChip key={f.id}>
                                  {DATA_ICON_MAP[f.icon]}
                                  {f.label}
                                  {f.isPilot && <Pill color="green">Pilot</Pill>}
                                </FeatureChip>
                              ))}
                            </FeatureChipsRow>

                            <Typography
                              intent="body"
                              style={{ fontWeight: 700, marginBottom: 6 }}
                            >
                              Things to Consider:
                            </Typography>
                            <ThingsToConsider>
                              {CONSIDERATIONS.map((c) => (
                                <li key={c}>{c}</li>
                              ))}
                            </ThingsToConsider>
                          </div>
                        )}

                        {/* Wizard navigation */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 8,
                            marginTop: 28,
                            paddingTop: 20,
                            borderTop: "1px solid var(--color-border-separator)",
                          }}
                        >
                          {connectStep > 1 && (
                            <Button
                              variant="tertiary"
                              className="b_tertiary"
                              onClick={() =>
                                setConnectStep((prev) => (prev - 1) as WizardStep)
                              }
                            >
                              Previous
                            </Button>
                          )}
                          {connectStep < 3 && (
                            <Button
                              variant="primary"
                              className="b_primary"
                              disabled={connectStep === 1 ? !step1Valid : !step2Valid}
                              onClick={() =>
                                setConnectStep((prev) => (prev + 1) as WizardStep)
                              }
                              style={
                                (connectStep === 1 ? step1Valid : step2Valid)
                                  ? { background: "#FF5200", borderColor: "#FF5200" }
                                  : undefined
                              }
                            >
                              Next
                            </Button>
                          )}
                          {connectStep === 3 && (
                            <Button
                              variant="primary"
                              className="b_primary"
                              onClick={handleConfirm}
                              style={{ background: "#FF5200", borderColor: "#FF5200" }}
                            >
                              <Connect
                                size="sm"
                                style={{ marginRight: 6, verticalAlign: "middle" }}
                              />
                              Connect Projects
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Empty state — shown before the flow is started */
                      <ConnectEmptyStateWrap>
                        <Connect size="lg" style={{ width: 56, height: 56, color: "#FF5200" }} />
                        <Typography intent="h3" style={{ fontWeight: 700, color: "#232729" }}>
                          Connect to a Project to Get Started
                        </Typography>
                        <Typography intent="body" style={{ color: "#6a767c", maxWidth: 320 }}>
                          Connect with another Procore project to start receiving live data.
                        </Typography>
                        <Button
                          variant="primary"
                          className="b_primary"
                          style={{ marginTop: 8, background: "#FF5200", borderColor: "#FF5200" }}
                          onClick={() => setConnectFlowStarted(true)}
                        >
                          Connect
                        </Button>
                        <Button variant="tertiary" className="b_tertiary" style={{ fontWeight: 700 }}>
                          Learn More
                        </Button>
                      </ConnectEmptyStateWrap>
                    )}
                  </SectionCard>
                )}

                {activeTab === "Classification" && (
                  <SectionCard>
                    <H2 style={{ marginBottom: 8 }}>Classification (Figma-only)</H2>
                    <Typography intent="small" style={{ marginBottom: 20, color: "var(--color-text-secondary)" }}>
                      These controls mirror common project directory fields. They are not persisted to{" "}
                      <span style={{ fontFamily: "monospace" }}>ProjectRow</span> in this prototype — see the
                      design-vs-data list in the feature notes.
                    </Typography>
                    <Box style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 560 }}>
                      <Select
                        placeholder="Project status"
                        label={STATUS_OPTIONS.find((o) => o.id === figmaStatus)?.label}
                        onSelect={(s) => {
                          if (s.action !== "selected") return;
                          setFigmaStatus(s.item as ProjectStatus);
                        }}
                        block
                      >
                        {STATUS_OPTIONS.map((o) => (
                          <Select.Option key={o.id} value={o.id} selected={figmaStatus === o.id}>
                            {o.label}
                          </Select.Option>
                        ))}
                      </Select>
                      <Select
                        placeholder="Project type"
                        label={figmaType}
                        onSelect={(s) => {
                          if (s.action !== "selected") return;
                          setFigmaType(s.item as ProjectType);
                        }}
                        block
                      >
                        {TYPE_OPTIONS.map((t) => (
                          <Select.Option key={t} value={t} selected={figmaType === t}>
                            {t}
                          </Select.Option>
                        ))}
                      </Select>
                      <Select
                        placeholder="Delivery method"
                        label={figmaDelivery}
                        onSelect={(s) => {
                          if (s.action !== "selected") return;
                          setFigmaDelivery(s.item as DeliveryMethod);
                        }}
                        block
                      >
                        {DELIVERY_OPTIONS.map((d) => (
                          <Select.Option key={d} value={d} selected={figmaDelivery === d}>
                            {d}
                          </Select.Option>
                        ))}
                      </Select>
                      <Select
                        placeholder="Sector"
                        label={figmaSector}
                        onSelect={(s) => {
                          if (s.action !== "selected") return;
                          setFigmaSector(s.item as ProjectSector);
                        }}
                        block
                      >
                        {SECTOR_OPTIONS.map((s) => (
                          <Select.Option key={s} value={s} selected={figmaSector === s}>
                            {s}
                          </Select.Option>
                        ))}
                      </Select>
                      <Box>
                        <Typography intent="small" style={{ fontWeight: 600, marginBottom: 6 }}>
                          Description
                        </Typography>
                        <TextArea
                          aria-label="Project description"
                          value={figmaDescription}
                          onChange={(e) => setFigmaDescription(e.currentTarget.value)}
                          rows={4}
                          style={{ width: "100%" }}
                        />
                      </Box>
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
