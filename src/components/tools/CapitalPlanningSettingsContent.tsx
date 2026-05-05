import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  ErrorBanner,
  Select,
  SplitViewCard,
  Tabs,
  Typography,
} from "@procore/core-react";
import { CurrencyUSA as CapitalPlanningIcon } from "@procore/core-icons";
import styled from "styled-components";
import ToolPageLayout from "@/components/tools/ToolPageLayout";
import {
  CriteriaBuilderDataTable,
  type CriteriaBuilderDataTableHandle,
  type CriteriaBuilderRow,
} from "@/components/tools/capitalPlanning/CriteriaBuilderDataTable";
import { CapitalPlanningRequestIntakeFormTab } from "@/components/tools/capitalPlanning/CapitalPlanningRequestIntakeFormTab";
import {
  readCapitalPlanningFiscalYearStartMonth,
  writeCapitalPlanningFiscalYearStartMonth,
} from "@/utils/capitalPlanningFiscalSettings";
import {
  readPersistedCriteriaBuilderRows,
  writePersistedCriteriaBuilderRows,
} from "@/utils/capitalPlanningCriteriaBuilderPersistence";
import CapitalPlanningColumnsSettingsCard from "@/components/tools/CapitalPlanningColumnsSettingsCard";
import CapitalPlanningHistoricalLookBackSection from "@/components/tools/CapitalPlanningHistoricalLookBackSection";
import CapitalPlanningUserPermissionsCard from "@/components/tools/CapitalPlanningUserPermissionsCard";

/** Matches {@link CapitalPlanningContent} portfolio routes (Now / Next / Target Budget / Future). */
export type CapitalPlanningSettingsPageVariant = "default" | "next" | "target_budget" | "future";

const MONTH_OPTIONS = [
  { value: 0, label: "January" },
  { value: 1, label: "February" },
  { value: 2, label: "March" },
  { value: 3, label: "April" },
  { value: 4, label: "May" },
  { value: 5, label: "June" },
  { value: 6, label: "July" },
  { value: 7, label: "August" },
  { value: 8, label: "September" },
  { value: 9, label: "October" },
  { value: 10, label: "November" },
  { value: 11, label: "December" },
] as const;

/** Criteria Builder on Future settings — scroll area + fixed footer (matches {@link CapitalPlanningContent} pattern). */
const CriteriaBuilderTabRoot = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  flex: 1;
  min-height: 0;
  padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px));
`;

const CriteriaBuilderPageFooter = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
  padding: 12px 16px;
  padding-bottom: max(12px, env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--color-border-separator);
  background: var(--color-surface-primary);
  box-shadow: 0 -4px 12px hsla(200, 10%, 15%, 0.06);
  box-sizing: border-box;
`;

function ordinalSuffix(day: number): string {
  const j = day % 10;
  const k = day % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

/**
 * Fiscal year display labels for the selected start month (e.g. April → April 1st / March 31st).
 * Uses a fixed leap year for February end-of-month.
 */
function getFiscalYearBookends(fiscalYearStartMonth: number): { startLabel: string; endLabel: string } {
  const startName = MONTH_OPTIONS.find((m) => m.value === fiscalYearStartMonth)?.label ?? "January";
  const endMonthIndex = (fiscalYearStartMonth + 11) % 12;
  const endName = MONTH_OPTIONS.find((m) => m.value === endMonthIndex)?.label ?? "December";
  const endDay = new Date(2024, endMonthIndex + 1, 0).getDate();
  return {
    startLabel: `${startName} 1${ordinalSuffix(1)}`,
    endLabel: `${endName} ${endDay}${ordinalSuffix(endDay)}`,
  };
}

type CapitalPlanningSettingsTab =
  | "settings"
  | "permissions"
  | "columns"
  | "criteria_builder"
  | "request_intake_form";

export interface CapitalPlanningSettingsContentProps {
  /** When `next` or `target_budget`, the Fiscal Year card includes Historical Look Back. */
  capitalPlanningPageVariant?: CapitalPlanningSettingsPageVariant;
}

export default function CapitalPlanningSettingsContent({
  capitalPlanningPageVariant = "default",
}: CapitalPlanningSettingsContentProps) {
  const [activeTab, setActiveTab] = useState<CapitalPlanningSettingsTab>("settings");
  const [fiscalYearStartMonth, setFiscalYearStartMonth] = useState<number | null>(() =>
    readCapitalPlanningFiscalYearStartMonth()
  );

  const criteriaBuilderTableRef = useRef<CriteriaBuilderDataTableHandle>(null);
  const [criteriaBuilderSaveError, setCriteriaBuilderSaveError] = useState<string | null>(null);
  const [criteriaBuilderRows, setCriteriaBuilderRows] = useState<CriteriaBuilderRow[]>(() =>
    readPersistedCriteriaBuilderRows()
  );

  useEffect(() => {
    setFiscalYearStartMonth(readCapitalPlanningFiscalYearStartMonth());
  }, []);

  useEffect(() => {
    if (
      capitalPlanningPageVariant !== "next" &&
      capitalPlanningPageVariant !== "target_budget" &&
      capitalPlanningPageVariant !== "future" &&
      activeTab === "columns"
    ) {
      setActiveTab("settings");
      return;
    }
    if (
      capitalPlanningPageVariant !== "future" &&
      (activeTab === "criteria_builder" || activeTab === "request_intake_form")
    ) {
      setActiveTab("settings");
    }
  }, [capitalPlanningPageVariant, activeTab]);

  const clearCriteriaBuilderSaveError = useCallback(() => {
    setCriteriaBuilderSaveError(null);
  }, []);

  const onCriteriaBuilderCancel = useCallback(() => {
    setCriteriaBuilderSaveError(null);
    setActiveTab("settings");
  }, []);

  const onCriteriaBuilderSave = useCallback(() => {
    const validation = criteriaBuilderTableRef.current?.validateForSave();
    if (validation && !validation.ok) {
      setCriteriaBuilderSaveError(validation.message);
      return;
    }
    setCriteriaBuilderSaveError(null);
    writePersistedCriteriaBuilderRows(criteriaBuilderRows);
  }, [criteriaBuilderRows]);

  const fiscalBounds = useMemo(() => {
    if (fiscalYearStartMonth === null) {
      return { startLabel: "—", endLabel: "—" };
    }
    return getFiscalYearBookends(fiscalYearStartMonth);
  }, [fiscalYearStartMonth]);

  const capitalPlanningToolHref =
    capitalPlanningPageVariant === "next"
      ? "/portfolio/capital-planning-next"
      : capitalPlanningPageVariant === "target_budget"
        ? "/portfolio/capital-planning-target-budget"
        : capitalPlanningPageVariant === "future"
          ? "/portfolio/capital-planning-future"
          : "/portfolio/capital-planning";

  const breadcrumbs = [
    { label: "Portfolio", href: "/portfolio" },
    { label: "Capital Planning", href: capitalPlanningToolHref },
  ];

  const fiscalMonthSelectLabelId = "capital-planning-fiscal-year-start-month";

  const hideDefaultSettingsFooter =
    capitalPlanningPageVariant === "future" &&
    (activeTab === "criteria_builder" || activeTab === "request_intake_form");

  return (
    <>
      <ToolPageLayout
        title="Capital Planning Settings"
        icon={<CapitalPlanningIcon size="md" />}
        breadcrumbs={breadcrumbs}
        tabs={
          <Tabs>
            <Tabs.Tab
              selected={activeTab === "settings"}
              onPress={() => setActiveTab("settings")}
              role="button"
            >
              <Tabs.Link>Settings</Tabs.Link>
            </Tabs.Tab>
            <Tabs.Tab
              selected={activeTab === "permissions"}
              onPress={() => setActiveTab("permissions")}
              role="button"
            >
              <Tabs.Link>Permissions</Tabs.Link>
            </Tabs.Tab>
            {capitalPlanningPageVariant === "next" ||
            capitalPlanningPageVariant === "target_budget" ||
            capitalPlanningPageVariant === "future" ? (
              <Tabs.Tab
                selected={activeTab === "columns"}
                onPress={() => setActiveTab("columns")}
                role="button"
              >
                <Tabs.Link>Columns</Tabs.Link>
              </Tabs.Tab>
            ) : null}
            {capitalPlanningPageVariant === "future" ? (
              <Tabs.Tab
                selected={activeTab === "criteria_builder"}
                onPress={() => setActiveTab("criteria_builder")}
                role="button"
              >
                <Tabs.Link>Criteria Builder</Tabs.Link>
              </Tabs.Tab>
            ) : null}
            {capitalPlanningPageVariant === "future" ? (
              <Tabs.Tab
                selected={activeTab === "request_intake_form"}
                onPress={() => setActiveTab("request_intake_form")}
                role="button"
              >
                <Tabs.Link>Intake Form Builder</Tabs.Link>
              </Tabs.Tab>
            ) : null}
          </Tabs>
        }
      >
        <div
          className="capital-planning-settings-page-body"
          style={{ paddingBottom: "calc(72px + env(safe-area-inset-bottom, 0px))" }}
        >
          {activeTab === "columns" &&
          (capitalPlanningPageVariant === "next" ||
            capitalPlanningPageVariant === "target_budget" ||
            capitalPlanningPageVariant === "future") ? (
            <SplitViewCard className="capital-planning-settings-fiscal-card">
              <SplitViewCard.Main>
                <SplitViewCard.Section heading="Columns">
                  <CapitalPlanningColumnsSettingsCard />
                </SplitViewCard.Section>
              </SplitViewCard.Main>
            </SplitViewCard>
          ) : activeTab === "criteria_builder" && capitalPlanningPageVariant === "future" ? (
            <CriteriaBuilderTabRoot>
              <SplitViewCard className="capital-planning-settings-fiscal-card">
                <SplitViewCard.Main>
                  <SplitViewCard.Section heading="Criteria Builder">
                    <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
                      <Typography intent="small" style={{ margin: 0, maxWidth: 720, color: "var(--color-text-secondary)" }}>
                        Add custom scoring criteria to accurately score projects when capital planning.
                      </Typography>
                      {criteriaBuilderSaveError ? (
                        <ErrorBanner role="alert">
                          <Typography intent="body">{criteriaBuilderSaveError}</Typography>
                        </ErrorBanner>
                      ) : null}
                      <CriteriaBuilderDataTable
                        ref={criteriaBuilderTableRef}
                        onRowsChange={clearCriteriaBuilderSaveError}
                        rows={criteriaBuilderRows}
                        onRowsCommit={setCriteriaBuilderRows}
                      />
                    </div>
                  </SplitViewCard.Section>
                </SplitViewCard.Main>
              </SplitViewCard>
              <CriteriaBuilderPageFooter>
                <Button type="button" variant="tertiary" className="b_tertiary" onClick={onCriteriaBuilderCancel}>
                  Cancel
                </Button>
                <Button type="button" variant="primary" onClick={onCriteriaBuilderSave}>
                  Save
                </Button>
              </CriteriaBuilderPageFooter>
            </CriteriaBuilderTabRoot>
          ) : activeTab === "request_intake_form" && capitalPlanningPageVariant === "future" ? (
            <SplitViewCard className="capital-planning-settings-fiscal-card">
              <SplitViewCard.Main>
                <SplitViewCard.Section heading="Intake form builder">
                  <CapitalPlanningRequestIntakeFormTab />
                </SplitViewCard.Section>
              </SplitViewCard.Main>
            </SplitViewCard>
          ) : activeTab === "settings" ? (
            <SplitViewCard className="capital-planning-settings-fiscal-card">
              <SplitViewCard.Main>
                <SplitViewCard.Section heading="Fiscal Year">
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: "100%" }}>
                    <Typography intent="small" style={{ margin: 0, color: "var(--color-text-secondary)" }}>
                      Configure how fiscal years are displayed in Capital Planning. Select the month your company&apos;s
                      fiscal year begins.
                    </Typography>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                        gap: 24,
                        alignItems: "start",
                        width: "100%",
                      }}
                      className="capital-planning-settings-fiscal-grid"
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
                        <Typography id={fiscalMonthSelectLabelId} intent="small" weight="semibold">
                          Fiscal Year Start Month
                        </Typography>
                        <Select
                          aria-labelledby={fiscalMonthSelectLabelId}
                          className="capital-planning-group-by-select"
                          block
                          placeholder="Month"
                          label={
                            fiscalYearStartMonth !== null
                              ? MONTH_OPTIONS.find((m) => m.value === fiscalYearStartMonth)?.label
                              : undefined
                          }
                          onClear={
                            fiscalYearStartMonth !== null ? () => setFiscalYearStartMonth(null) : undefined
                          }
                          onSelect={(s) => {
                            if (s.action !== "selected") return;
                            const opt = s.item as (typeof MONTH_OPTIONS)[number];
                            setFiscalYearStartMonth(opt.value);
                            writeCapitalPlanningFiscalYearStartMonth(opt.value);
                          }}
                        >
                          {MONTH_OPTIONS.map((m) => (
                            <Select.Option
                              key={m.value}
                              value={m}
                              selected={fiscalYearStartMonth !== null && fiscalYearStartMonth === m.value}
                            >
                              {m.label}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                        <Typography intent="small" weight="semibold">
                          Start of Fiscal Year
                        </Typography>
                        <Typography intent="small" style={{ margin: 0, color: "var(--color-text-primary)" }}>
                          {fiscalBounds.startLabel}
                        </Typography>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                        <Typography intent="small" weight="semibold">
                          End of Fiscal Year
                        </Typography>
                        <Typography intent="small" style={{ margin: 0, color: "var(--color-text-primary)" }}>
                          {fiscalBounds.endLabel}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </SplitViewCard.Section>
                {capitalPlanningPageVariant === "next" || capitalPlanningPageVariant === "target_budget" ? (
                  <SplitViewCard.Section heading="Historical Look Back">
                    <CapitalPlanningHistoricalLookBackSection />
                  </SplitViewCard.Section>
                ) : null}
              </SplitViewCard.Main>
            </SplitViewCard>
          ) : activeTab === "permissions" ? (
            <SplitViewCard className="capital-planning-settings-fiscal-card">
              <SplitViewCard.Main>
                <SplitViewCard.Section heading="User Permissions">
                  <CapitalPlanningUserPermissionsCard />
                </SplitViewCard.Section>
              </SplitViewCard.Main>
            </SplitViewCard>
          ) : null}
        </div>
      </ToolPageLayout>
      {!hideDefaultSettingsFooter ? (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 900,
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            padding: "12px 16px",
            paddingBottom: "max(12px, env(safe-area-inset-bottom, 0px))",
            borderTop: "1px solid var(--color-border-separator)",
            background: "var(--color-surface-primary)",
            boxShadow: "0 -4px 12px hsla(200, 10%, 15%, 0.06)",
          }}
        >
          <Button type="button" variant="tertiary" className="b_tertiary">
            Cancel
          </Button>
          <Button type="button" variant="primary">
            Save
          </Button>
        </div>
      ) : null}
    </>
  );
}
