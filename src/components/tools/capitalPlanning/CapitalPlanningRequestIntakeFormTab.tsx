import React, { useCallback, useMemo, useState, type ChangeEvent } from "react";
import { Button, Modal, TextInput, Typography } from "@procore/core-react";
import { Plus, Trash } from "@procore/core-icons";
import {
  CAPITAL_CALL_INTAKE_PREVIEW_DRAFT_KEY,
  CapitalCallIntakeFormView,
} from "@/components/tools/capitalPlanning/CapitalCallIntakeFormView";
import {
  getDefaultIntakeFormConfig,
  sanitizeIntakeFormConfig,
  siteKeysFromConfig,
  type IntakeFormConfig,
} from "@/components/tools/capitalPlanning/capitalCallIntakeForm";

const INTAKE_BUILDER_STORAGE_KEY = "capital-call-intake-builder-config";

function readBuilderState(): IntakeFormConfig {
  if (typeof window === "undefined") return getDefaultIntakeFormConfig();
  try {
    const raw = localStorage.getItem(INTAKE_BUILDER_STORAGE_KEY);
    if (!raw) return getDefaultIntakeFormConfig();
    return sanitizeIntakeFormConfig(JSON.parse(raw));
  } catch {
    return getDefaultIntakeFormConfig();
  }
}

function persistBuilderState(config: IntakeFormConfig) {
  try {
    localStorage.setItem(INTAKE_BUILDER_STORAGE_KEY, JSON.stringify(config));
  } catch {
    /* ignore */
  }
}

const card: React.CSSProperties = {
  border: "1px solid var(--color-border-separator)",
  borderRadius: 8,
  padding: 16,
  marginBottom: 16,
  background: "var(--color-surface-primary)",
};

function StringOptionEditor({
  title,
  description,
  values,
  onChange,
  addLabel,
  placeholder,
}: {
  title: string;
  description: string;
  values: string[];
  onChange: (next: string[]) => void;
  addLabel: string;
  placeholder: string;
}) {
  return (
    <div style={card}>
      <Typography intent="body" weight="semibold" style={{ marginBottom: 4 }}>
        {title}
      </Typography>
      <Typography intent="small" style={{ color: "var(--color-text-secondary)", margin: "0 0 12px" }}>
        {description}
      </Typography>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {values.map((v, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <TextInput
              aria-label={`${title} option ${i + 1}`}
              value={v}
              placeholder={placeholder}
              style={{ flex: 1, minWidth: 0 }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const next = [...values];
                next[i] = e.currentTarget.value;
                onChange(next);
              }}
            />
            <Button
              type="button"
              variant="tertiary"
              className="b_tertiary"
              size="sm"
              icon={<Trash size="sm" />}
              aria-label={`Remove ${title} option`}
              disabled={values.length <= 1}
              onClick={() => onChange(values.filter((_, j) => j !== i))}
            />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <Button
          type="button"
          variant="secondary"
          className="b_secondary"
          size="sm"
          icon={<Plus size="sm" />}
          onClick={() => onChange([...values, ""])}
        >
          {addLabel}
        </Button>
      </div>
    </div>
  );
}

function FiscalYearEditor({
  rows,
  onChange,
}: {
  rows: { value: string; label: string }[];
  onChange: (next: { value: string; label: string }[]) => void;
}) {
  return (
    <div style={card}>
      <Typography intent="body" weight="semibold" style={{ marginBottom: 4 }}>
        Target fiscal year options
      </Typography>
      <Typography intent="small" style={{ color: "var(--color-text-secondary)", margin: "0 0 12px" }}>
        Value is stored on submissions; label is shown in the intake dropdown.
      </Typography>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((row, i) => (
          <div key={i} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <TextInput
              aria-label={`Fiscal year value ${i + 1}`}
              value={row.value}
              placeholder="value_slug"
              style={{ width: 160 }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const next = [...rows];
                next[i] = { ...next[i], value: e.currentTarget.value };
                onChange(next);
              }}
            />
            <TextInput
              aria-label={`Fiscal year label ${i + 1}`}
              value={row.label}
              placeholder="Display label"
              style={{ flex: "1 1 200px", minWidth: 0 }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const next = [...rows];
                next[i] = { ...next[i], label: e.currentTarget.value };
                onChange(next);
              }}
            />
            <Button
              type="button"
              variant="tertiary"
              className="b_tertiary"
              size="sm"
              icon={<Trash size="sm" />}
              disabled={rows.length <= 1}
              onClick={() => onChange(rows.filter((_, j) => j !== i))}
            />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <Button
          type="button"
          variant="secondary"
          className="b_secondary"
          size="sm"
          icon={<Plus size="sm" />}
          onClick={() => onChange([...rows, { value: "", label: "" }])}
        >
          Add fiscal year
        </Button>
      </div>
    </div>
  );
}

function PriorityEditor({
  rows,
  onChange,
}: {
  rows: { value: string; label: string }[];
  onChange: (next: { value: string; label: string }[]) => void;
}) {
  return (
    <div style={card}>
      <Typography intent="body" weight="semibold" style={{ marginBottom: 4 }}>
        Priority levels
      </Typography>
      <Typography intent="small" style={{ color: "var(--color-text-secondary)", margin: "0 0 12px" }}>
        Value should be a short slug (e.g. high); label is shown to requestors.
      </Typography>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((row, i) => (
          <div key={i} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <TextInput
              aria-label={`Priority value ${i + 1}`}
              value={row.value}
              placeholder="slug"
              style={{ width: 140 }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const next = [...rows];
                next[i] = { ...next[i], value: e.currentTarget.value };
                onChange(next);
              }}
            />
            <TextInput
              aria-label={`Priority label ${i + 1}`}
              value={row.label}
              placeholder="Display label"
              style={{ flex: "1 1 200px", minWidth: 0 }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const next = [...rows];
                next[i] = { ...next[i], label: e.currentTarget.value };
                onChange(next);
              }}
            />
            <Button
              type="button"
              variant="tertiary"
              className="b_tertiary"
              size="sm"
              icon={<Trash size="sm" />}
              disabled={rows.length <= 1}
              onClick={() => onChange(rows.filter((_, j) => j !== i))}
            />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <Button
          type="button"
          variant="secondary"
          className="b_secondary"
          size="sm"
          icon={<Plus size="sm" />}
          onClick={() => onChange([...rows, { value: "", label: "" }])}
        >
          Add priority
        </Button>
      </div>
    </div>
  );
}

function SitesEditor({
  config,
  onChange,
}: {
  config: IntakeFormConfig;
  onChange: (next: IntakeFormConfig) => void;
}) {
  const sites = siteKeysFromConfig(config);

  const updateBuildings = useCallback(
    (site: string, buildings: string[]) => {
      onChange({
        ...config,
        buildingsBySite: { ...config.buildingsBySite, [site]: buildings },
      });
    },
    [config, onChange]
  );

  const renameSite = useCallback(
    (oldSite: string, newSite: string) => {
      const trimmed = newSite.trim();
      if (!trimmed || trimmed === oldSite) return;
      if (trimmed !== oldSite && Object.prototype.hasOwnProperty.call(config.buildingsBySite, trimmed)) return;
      const { [oldSite]: buildings, ...rest } = config.buildingsBySite;
      onChange({
        ...config,
        buildingsBySite: { ...rest, [trimmed]: buildings ?? [] },
      });
    },
    [config, onChange]
  );

  const removeSite = useCallback(
    (site: string) => {
      const nextSites = { ...config.buildingsBySite };
      delete nextSites[site];
      onChange({ ...config, buildingsBySite: nextSites });
    },
    [config, onChange]
  );

  const addSite = useCallback(() => {
    const label = `New site ${Object.keys(config.buildingsBySite).length + 1}`;
    onChange({
      ...config,
      buildingsBySite: { ...config.buildingsBySite, [label]: ["Building 1"] },
    });
  }, [config, onChange]);

  return (
    <div style={card}>
      <Typography intent="body" weight="semibold" style={{ marginBottom: 4 }}>
        Sites & buildings
      </Typography>
      <Typography intent="small" style={{ color: "var(--color-text-secondary)", margin: "0 0 12px" }}>
        Site / campus drives the Building dropdown on the intake form. Add at least one site with one building.
      </Typography>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {sites.map((site) => {
          const buildings = config.buildingsBySite[site] ?? [];
          return (
            <div
              key={site}
              style={{
                border: "1px solid var(--color-border-separator)",
                borderRadius: 6,
                padding: 12,
                background: "var(--color-surface-secondary)",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 10 }}>
                <TextInput
                  aria-label="Site name"
                  defaultValue={site}
                  key={site}
                  style={{ flex: "1 1 220px", minWidth: 0 }}
                  onBlur={(e: React.FocusEvent<HTMLInputElement>) => renameSite(site, e.currentTarget.value)}
                />
                <Button
                  type="button"
                  variant="tertiary"
                  className="b_tertiary"
                  size="sm"
                  icon={<Trash size="sm" />}
                  disabled={sites.length <= 1}
                  onClick={() => removeSite(site)}
                >
                  Remove site
                </Button>
              </div>
              <Typography intent="small" weight="semibold" style={{ marginBottom: 6 }}>
                Buildings
              </Typography>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {buildings.map((b, bi) => (
                  <div key={`${site}-${bi}`} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <TextInput
                      aria-label={`Building ${bi + 1} for ${site}`}
                      value={b}
                      style={{ flex: 1, minWidth: 0 }}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const next = [...buildings];
                        next[bi] = e.currentTarget.value;
                        updateBuildings(site, next);
                      }}
                    />
                    <Button
                      type="button"
                      variant="tertiary"
                      className="b_tertiary"
                      size="sm"
                      icon={<Trash size="sm" />}
                      disabled={buildings.length <= 1}
                      onClick={() => updateBuildings(site, buildings.filter((_, j) => j !== bi))}
                    />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 8 }}>
                <Button
                  type="button"
                  variant="secondary"
                  className="b_secondary"
                  size="sm"
                  icon={<Plus size="sm" />}
                  onClick={() => updateBuildings(site, [...buildings, ""])}
                >
                  Add building
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 12 }}>
        <Button type="button" variant="secondary" className="b_secondary" size="sm" icon={<Plus size="sm" />} onClick={addSite}>
          Add site
        </Button>
      </div>
    </div>
  );
}

/**
 * Configure dropdown / location options for the Capital Call intake form; preview opens the live form in a modal.
 */
export function CapitalPlanningRequestIntakeFormTab() {
  const [formConfig, setFormConfig] = useState<IntakeFormConfig>(() => readBuilderState());
  const [previewOpen, setPreviewOpen] = useState(false);
  const [definitionSaved, setDefinitionSaved] = useState(false);

  const previewFormKey = useMemo(() => JSON.stringify(formConfig), [formConfig]);

  const setDepartments = useCallback((departments: string[]) => setFormConfig((c) => ({ ...c, departments })), []);
  const setProjectTypes = useCallback((projectTypes: string[]) => setFormConfig((c) => ({ ...c, projectTypes })), []);
  const setBudgetRom = useCallback((budgetRom: string[]) => setFormConfig((c) => ({ ...c, budgetRom })), []);
  const setFiscal = useCallback(
    (fiscalYearOptions: { value: string; label: string }[]) => setFormConfig((c) => ({ ...c, fiscalYearOptions })),
    []
  );
  const setPriorities = useCallback(
    (priorityOptions: { value: string; label: string }[]) => setFormConfig((c) => ({ ...c, priorityOptions })),
    []
  );

  return (
    <section aria-label="Intake form builder" style={{ minWidth: 0, width: "100%", maxWidth: 960 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <Typography intent="small" style={{ margin: 0, color: "var(--color-text-secondary)", flex: "1 1 280px" }}>
          Define the choices requestors see on the Capital Call intake form. Use Preview to try the form with your
          current definition. Save form definition stores this configuration in the browser for the next visit.
        </Typography>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, flexShrink: 0 }}>
          <Button type="button" variant="primary" onClick={() => setPreviewOpen(true)}>
            Preview
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="b_secondary"
            onClick={() => {
              persistBuilderState(formConfig);
              setDefinitionSaved(true);
            }}
          >
            Save form definition
          </Button>
          <Button
            type="button"
            variant="tertiary"
            className="b_tertiary"
            onClick={() => {
              const next = getDefaultIntakeFormConfig();
              setFormConfig(next);
              persistBuilderState(next);
              setDefinitionSaved(false);
            }}
          >
            Reset to defaults
          </Button>
        </div>
      </div>

      {definitionSaved ? (
        <Typography intent="small" style={{ color: "var(--color-text-secondary)", marginBottom: 12 }}>
          Form definition saved to this browser.
        </Typography>
      ) : null}

      <StringOptionEditor
        title="Departments / organizational units"
        description="Shown in the Department dropdown on the intake form."
        values={formConfig.departments}
        onChange={setDepartments}
        addLabel="Add department"
        placeholder="Department name"
      />
      <StringOptionEditor
        title="Project types / categories"
        description="Shown in the Project type dropdown."
        values={formConfig.projectTypes}
        onChange={setProjectTypes}
        addLabel="Add project type"
        placeholder="Category name"
      />
      <StringOptionEditor
        title="Estimated budget (ROM) ranges"
        description="Shown in the ROM dropdown."
        values={formConfig.budgetRom}
        onChange={setBudgetRom}
        addLabel="Add budget range"
        placeholder="e.g. $50k - $250k"
      />
      <FiscalYearEditor rows={formConfig.fiscalYearOptions} onChange={setFiscal} />
      <PriorityEditor rows={formConfig.priorityOptions} onChange={setPriorities} />
      <SitesEditor config={formConfig} onChange={setFormConfig} />

      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        howToClose={["x", "scrim", "footer-button"]}
        role="dialog"
        width="xl"
        placement="center"
        aria-label="Intake form preview"
      >
        <Modal.Header>
          <Modal.Heading level={2}>Intake form preview</Modal.Heading>
        </Modal.Header>
        <Modal.Body>
          <div style={{ maxHeight: "min(72vh, 900px)", overflowY: "auto", paddingRight: 4 }}>
            <CapitalCallIntakeFormView
              key={previewFormKey}
              config={formConfig}
              draftStorageKey={CAPITAL_CALL_INTAKE_PREVIEW_DRAFT_KEY}
              idPrefix="intake-preview"
              narrow={false}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Modal.FooterButtons>
            <Button type="button" variant="secondary" className="b_secondary" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
          </Modal.FooterButtons>
        </Modal.Footer>
      </Modal>
    </section>
  );
}
