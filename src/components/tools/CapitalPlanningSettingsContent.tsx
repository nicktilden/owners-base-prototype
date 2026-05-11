/**
 * Capital Planning Settings panel.
 *
 * Houses configuration options specific to the Capital Planning tool —
 * fiscal year start month, default view, and similar system-level settings.
 */

import React, { useCallback, useState } from "react";
import { Button, Card, Select, Typography } from "@procore/core-react";
import ToolPageLayout from "@/components/tools/ToolPageLayout";
import { Cog as SettingsIcon } from "@procore/core-icons";
import {
  readCapitalPlanningFiscalYearStartMonth,
  writeCapitalPlanningFiscalYearStartMonth,
} from "@/utils/capitalPlanningFiscalSettings";

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

export interface CapitalPlanningSettingsContentProps {
  /** Which Capital Planning page variant these settings apply to. */
  capitalPlanningPageVariant?: string;
}

export default function CapitalPlanningSettingsContent({
  capitalPlanningPageVariant,
}: CapitalPlanningSettingsContentProps) {
  const [fiscalYearStartMonth, setFiscalYearStartMonth] = useState(
    readCapitalPlanningFiscalYearStartMonth
  );
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(() => {
    writeCapitalPlanningFiscalYearStartMonth(fiscalYearStartMonth);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [fiscalYearStartMonth]);

  const variantLabel = capitalPlanningPageVariant
    ? ` (${capitalPlanningPageVariant})`
    : "";

  return (
    <ToolPageLayout
      title={`Capital Planning Settings${variantLabel}`}
      icon={<SettingsIcon size="md" />}
    >
      <Card style={{ padding: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 480 }}>
          <div>
            <Typography intent="h3" weight="semibold" style={{ marginBottom: 4 }}>
              Fiscal Year Start Month
            </Typography>
            <Typography intent="small" color="gray45" style={{ marginBottom: 12 }}>
              Sets the first month of each fiscal year for the forecast grid columns (FQ1 start).
            </Typography>
            <Select
              placeholder="Select month"
              label={MONTH_OPTIONS[fiscalYearStartMonth]?.label}
              onSelect={(s) => {
                if (s.action !== "selected") return;
                setFiscalYearStartMonth(s.item as number);
                setSaved(false);
              }}
              block
            >
              {MONTH_OPTIONS.map((opt) => (
                <Select.Option
                  key={opt.value}
                  value={opt.value}
                  selected={fiscalYearStartMonth === opt.value}
                >
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Button variant="primary" onClick={handleSave}>
              Save Settings
            </Button>
            {saved && (
              <Typography intent="small" color="gray45">
                Settings saved.
              </Typography>
            )}
          </div>
        </div>
      </Card>
    </ToolPageLayout>
  );
}
