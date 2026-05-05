import React, { useCallback, useEffect, useState } from "react";
import { Checkbox, Select, TextInput, Typography } from "@procore/core-react";
import {
  CAPITAL_PLANNING_LOOK_BACK_SETTINGS_CHANGED_EVENT,
  clampAmount,
  type CapitalPlanningLookBackUnit,
  readCapitalPlanningLookBackAmount,
  readCapitalPlanningLookBackEnabled,
  readCapitalPlanningLookBackUnit,
  writeCapitalPlanningLookBackAmount,
  writeCapitalPlanningLookBackEnabled,
  writeCapitalPlanningLookBackUnit,
} from "@/utils/capitalPlanningLookBackSettings";

const UNIT_OPTIONS: { value: CapitalPlanningLookBackUnit; label: string }[] = [
  { value: "months", label: "Months" },
  { value: "quarters", label: "Quarters" },
  { value: "years", label: "Years" },
];

/**
 * Capital Planning (Next) Settings — historical display window for the program tool.
 */
export default function CapitalPlanningHistoricalLookBackSection() {
  const [enabled, setEnabled] = useState(readCapitalPlanningLookBackEnabled);
  const [amount, setAmount] = useState(readCapitalPlanningLookBackAmount);
  const [unit, setUnit] = useState<CapitalPlanningLookBackUnit>(readCapitalPlanningLookBackUnit);

  useEffect(() => {
    const sync = () => {
      setEnabled(readCapitalPlanningLookBackEnabled());
      setAmount(readCapitalPlanningLookBackAmount());
      setUnit(readCapitalPlanningLookBackUnit());
    };
    window.addEventListener(CAPITAL_PLANNING_LOOK_BACK_SETTINGS_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CAPITAL_PLANNING_LOOK_BACK_SETTINGS_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const onAmountNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "" || raw === "-") {
      return;
    }
    const n = parseInt(raw, 10);
    if (Number.isNaN(n)) return;
    const next = clampAmount(n);
    setAmount(next);
    writeCapitalPlanningLookBackAmount(next);
  }, []);

  const onToggleEnabled = useCallback((next: boolean) => {
    setEnabled(next);
    writeCapitalPlanningLookBackEnabled(next);
  }, []);

  const onSelectUnit = useCallback((u: CapitalPlanningLookBackUnit) => {
    setUnit(u);
    writeCapitalPlanningLookBackUnit(u);
  }, []);

  const selectedUnitLabel = UNIT_OPTIONS.find((o) => o.value === unit)?.label ?? "Months";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: "100%" }}>
      <Typography intent="small" style={{ margin: 0, color: "var(--color-text-secondary)" }}>
        Configure how much historical data displays in Capital Planning.
      </Typography>

      <Checkbox checked={enabled} onChange={() => onToggleEnabled(!enabled)}>
        Enable Look Back Limits
      </Checkbox>

      {enabled ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 560 }}>
          <Typography id="capital-planning-look-back-limit-label" intent="small" weight="semibold">
            Look Back Limit
          </Typography>
          <div
            className="capital-planning-settings-lookback-row"
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-end",
              gap: 12,
            }}
          >
            <div style={{ width: 120, maxWidth: "100%" }}>
              <TextInput
                aria-labelledby="capital-planning-look-back-limit-label"
                type="number"
                min={1}
                max={999}
                step={1}
                value={amount}
                onChange={onAmountNumberChange}
                onBlur={(e) => {
                  if (e.target.value === "") {
                    const next = clampAmount(1);
                    setAmount(next);
                    writeCapitalPlanningLookBackAmount(next);
                  }
                }}
              />
            </div>

            <div style={{ flex: "0 1 200px", minWidth: 160 }}>
              <Select
                block
                aria-label="Look back time unit"
                className="capital-planning-group-by-select"
                label={selectedUnitLabel}
                onClear={
                  unit !== "months"
                    ? () => {
                        setUnit("months");
                        writeCapitalPlanningLookBackUnit("months");
                      }
                    : undefined
                }
                onSelect={(s) => {
                  if (s.action !== "selected") return;
                  const opt = s.item as (typeof UNIT_OPTIONS)[number];
                  onSelectUnit(opt.value);
                }}
              >
                {UNIT_OPTIONS.map((o) => (
                  <Select.Option key={o.value} value={o} selected={unit === o.value}>
                    {o.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
