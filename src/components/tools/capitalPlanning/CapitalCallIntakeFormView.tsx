import React, { useCallback, useId, useMemo, useRef, useState } from "react";
import {
  Button,
  ErrorBanner,
  InfoBanner,
  RadioButton,
  Select,
  TextArea,
  TextInput,
  Typography,
} from "@procore/core-react";
import { CaretDown, CaretRight, Trash } from "@procore/core-icons";
import { Form, Formik, type FormikErrors, type FormikProps, type FormikTouched } from "formik";
import {
  getDefaultIntakeValues,
  intakeValuesToSubmissionPayload,
  mergeDraftIntoValues,
  siteKeysFromConfig,
  validateCapitalCallIntakeForm,
  validateNewIntakeFiles,
  type CapitalCallIntakeDraftSnapshot,
  type CapitalCallIntakeFormValues,
  type IntakeFormConfig,
} from "@/components/tools/capitalPlanning/capitalCallIntakeForm";

export const CAPITAL_CALL_INTAKE_DEFAULT_DRAFT_KEY = "capital-call-project-intake-draft";
export const CAPITAL_CALL_INTAKE_PREVIEW_DRAFT_KEY = "capital-call-intake-preview-draft";

function draftFromValues(values: CapitalCallIntakeFormValues): CapitalCallIntakeDraftSnapshot {
  const { attachmentFiles, ...rest } = values;
  return {
    ...rest,
    attachmentMeta: attachmentFiles.map((f) => ({ name: f.name, size: f.size, type: f.type })),
  };
}

function persistDraft(values: CapitalCallIntakeFormValues, draftStorageKey: string) {
  try {
    localStorage.setItem(draftStorageKey, JSON.stringify(draftFromValues(values)));
  } catch {
    /* quota or private mode */
  }
}

function clearDraftStorage(draftStorageKey: string) {
  try {
    localStorage.removeItem(draftStorageKey);
  } catch {
    /* ignore */
  }
}

function readIntakeBootstrap(draftStorageKey: string): {
  initialValues: CapitalCallIntakeFormValues;
  draftRestored: boolean;
} {
  const base = getDefaultIntakeValues();
  if (typeof window === "undefined") return { initialValues: base, draftRestored: false };
  try {
    const raw = localStorage.getItem(draftStorageKey);
    if (!raw) return { initialValues: base, draftRestored: false };
    const parsed = JSON.parse(raw) as Partial<CapitalCallIntakeDraftSnapshot>;
    const merged = mergeDraftIntoValues(base, parsed);
    const hadFileNames = Boolean(parsed.attachmentMeta?.length);
    const hasMeaningfulDraft =
      merged.requestorName.trim() !== "" ||
      merged.requestorEmail.trim() !== "" ||
      merged.projectName.trim() !== "" ||
      merged.projectDescription.trim() !== "" ||
      merged.businessNeed.trim() !== "" ||
      hadFileNames;
    if (!hasMeaningfulDraft) return { initialValues: base, draftRestored: false };
    return { initialValues: merged, draftRestored: true };
  } catch {
    return { initialValues: base, draftRestored: false };
  }
}

function fieldError(
  errors: FormikErrors<CapitalCallIntakeFormValues>,
  touched: FormikTouched<CapitalCallIntakeFormValues>,
  submitCount: number,
  key: keyof CapitalCallIntakeFormValues
): string | undefined {
  const err = errors[key];
  if (typeof err !== "string") return undefined;
  const tv = touched[key];
  const isTouched =
    typeof tv === "boolean" ? tv : Array.isArray(tv) ? tv.some(Boolean) : Boolean(tv);
  if (isTouched || submitCount > 0) return err;
  return undefined;
}

function IntakeSectionAccordion({
  id,
  title,
  description,
  defaultOpen,
  errorCount,
  children,
}: {
  id: string;
  title: string;
  description: string;
  defaultOpen: boolean;
  errorCount: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `${id}-panel`;
  const headingId = `${id}-heading`;

  return (
    <div
      style={{
        border: "1px solid var(--color-border-separator)",
        borderRadius: 8,
        marginBottom: 12,
        overflow: "hidden",
        background: "var(--color-surface-primary)",
      }}
    >
      <button
        type="button"
        id={headingId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "12px 16px",
          background: "var(--color-surface-secondary)",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "inherit",
        }}
      >
        <span style={{ display: "flex", alignItems: "flex-start", gap: 8, minWidth: 0 }}>
          <span style={{ flexShrink: 0, marginTop: 2, color: "var(--color-text-secondary)" }}>
            {open ? <CaretDown size="sm" /> : <CaretRight size="sm" />}
          </span>
          <span style={{ minWidth: 0 }}>
            <Typography intent="body" weight="semibold" style={{ display: "block", marginBottom: 2 }}>
              {title}
            </Typography>
            <Typography intent="small" style={{ color: "var(--color-text-secondary)", margin: 0 }}>
              {description}
            </Typography>
          </span>
        </span>
        {errorCount > 0 ? (
          <Typography
            intent="small"
            weight="semibold"
            style={{ flexShrink: 0, color: "var(--color-text-error)" }}
          >
            {errorCount} to fix
          </Typography>
        ) : null}
      </button>
      {open ? (
        <div id={panelId} role="region" aria-labelledby={headingId} style={{ padding: "16px 16px 20px" }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

const fieldStack: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 20 };
const labelBlock: React.CSSProperties = { display: "block", marginBottom: 6, cursor: "pointer" };
const requiredStar = (
  <span aria-hidden style={{ color: "#c7482d", marginLeft: 2 }}>
    *
  </span>
);

function IntakeFormFields({
  config,
  formik,
  fileInputRef,
  fileDropError,
  setFileDropError,
  idPrefix,
}: {
  config: IntakeFormConfig;
  formik: FormikProps<CapitalCallIntakeFormValues>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  fileDropError: string | null;
  setFileDropError: (msg: string | null) => void;
  idPrefix: string;
}) {
  const pid = (s: string) => (idPrefix ? `${idPrefix}-${s}` : s);
  const { values, errors, touched, submitCount, setFieldValue, handleChange, handleBlur } = formik;

  const siteOptions = useMemo(() => siteKeysFromConfig(config), [config]);
  const departmentOptions = useMemo(
    () => config.departments.map((d) => d.trim()).filter(Boolean),
    [config.departments]
  );
  const projectTypeOptions = useMemo(
    () => config.projectTypes.map((t) => t.trim()).filter(Boolean),
    [config.projectTypes]
  );
  const budgetRomOptions = useMemo(
    () => config.budgetRom.map((b) => b.trim()).filter(Boolean),
    [config.budgetRom]
  );
  const fiscalOptions = useMemo(
    () => config.fiscalYearOptions.filter((o) => o.value.trim() && o.label.trim()),
    [config.fiscalYearOptions]
  );
  const priorityOptions = useMemo(
    () => config.priorityOptions.filter((o) => o.value.trim() && o.label.trim()),
    [config.priorityOptions]
  );
  const buildingOptions = useMemo(() => {
    const raw = values.siteCampus ? config.buildingsBySite[values.siteCampus] ?? [] : [];
    return raw.map((b) => b.trim()).filter(Boolean);
  }, [config.buildingsBySite, values.siteCampus]);

  const section1Errors = useMemo(() => {
    const keys: (keyof CapitalCallIntakeFormValues)[] = [
      "requestorName",
      "requestorEmail",
      "department",
      "targetFiscalYear",
      "siteCampus",
      "building",
      "floorWingArea",
    ];
    return keys.filter((k) => fieldError(errors, touched, submitCount, k)).length;
  }, [errors, touched, submitCount]);

  const section2Errors = useMemo(() => {
    const keys: (keyof CapitalCallIntakeFormValues)[] = ["projectName", "projectDescription", "projectType"];
    return keys.filter((k) => fieldError(errors, touched, submitCount, k)).length;
  }, [errors, touched, submitCount]);

  const section3Errors = useMemo(() => {
    const keys: (keyof CapitalCallIntakeFormValues)[] = [
      "businessNeed",
      "consequencesOfInaction",
      "projectSponsor",
      "priorityLevel",
    ];
    return keys.filter((k) => fieldError(errors, touched, submitCount, k)).length;
  }, [errors, touched, submitCount]);

  const section4Errors = useMemo(() => {
    return fieldError(errors, touched, submitCount, "estimatedBudgetRom") ? 1 : 0;
  }, [errors, touched, submitCount]);

  const onFilesPicked = useCallback(
    (list: FileList | null) => {
      if (!list?.length) return;
      setFileDropError(null);
      const incoming = Array.from(list);
      const { next, error } = validateNewIntakeFiles(values.attachmentFiles, incoming);
      if (error) {
        setFileDropError(error);
        return;
      }
      void setFieldValue("attachmentFiles", next);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [fileInputRef, setFieldValue, setFileDropError, values.attachmentFiles]
  );

  return (
    <div style={fieldStack}>
      <IntakeSectionAccordion
        id={pid("intake-s1")}
        title="Section 1: Basic identifiers & location"
        description="Who is asking, timing, and where work takes place."
        defaultOpen
        errorCount={section1Errors}
      >
        <div style={fieldStack}>
          <div>
            <label htmlFor={pid("intake-requestor-name")} style={labelBlock}>
              <Typography intent="small" weight="bold" as="span">
                Requestor name
                {requiredStar}
              </Typography>
            </label>
            <TextInput
              id={pid("intake-requestor-name")}
              name="requestorName"
              value={values.requestorName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Full name"
              autoComplete="name"
              aria-invalid={Boolean(fieldError(errors, touched, submitCount, "requestorName"))}
              style={{ width: "100%" }}
            />
            {fieldError(errors, touched, submitCount, "requestorName") ? (
              <Typography intent="small" style={{ color: "var(--color-text-error)", marginTop: 4 }}>
                {fieldError(errors, touched, submitCount, "requestorName")}
              </Typography>
            ) : null}
          </div>
          <div>
            <label htmlFor={pid("intake-requestor-email")} style={labelBlock}>
              <Typography intent="small" weight="bold" as="span">
                Requestor email
                {requiredStar}
              </Typography>
            </label>
            <TextInput
              id={pid("intake-requestor-email")}
              name="requestorEmail"
              type="email"
              inputMode="email"
              value={values.requestorEmail}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="name@company.com"
              autoComplete="email"
              aria-invalid={Boolean(fieldError(errors, touched, submitCount, "requestorEmail"))}
              style={{ width: "100%" }}
            />
            {fieldError(errors, touched, submitCount, "requestorEmail") ? (
              <Typography intent="small" style={{ color: "var(--color-text-error)", marginTop: 4 }}>
                {fieldError(errors, touched, submitCount, "requestorEmail")}
              </Typography>
            ) : null}
          </div>
          <div>
            <Typography id={pid("intake-dept-label")} intent="small" weight="bold" style={{ ...labelBlock, cursor: "default" }}>
              Department / organizational unit
            </Typography>
            <Select
              aria-labelledby={pid("intake-dept-label")}
              block
              placeholder="Select department"
              label={values.department || undefined}
              onClear={values.department ? () => void setFieldValue("department", "") : undefined}
              onSelect={(s) => {
                if (s.action !== "selected") return;
                void setFieldValue("department", String(s.item));
              }}
            >
              {departmentOptions.map((d) => (
                <Select.Option key={d} value={d} selected={values.department === d}>
                  {d}
                </Select.Option>
              ))}
            </Select>
            {fieldError(errors, touched, submitCount, "department") ? (
              <Typography intent="small" style={{ color: "var(--color-text-error)", marginTop: 4 }}>
                {fieldError(errors, touched, submitCount, "department")}
              </Typography>
            ) : null}
          </div>
          <div>
            <Typography id={pid("intake-fy-label")} intent="small" weight="bold" style={{ ...labelBlock, cursor: "default" }}>
              Target fiscal year
            </Typography>
            <Select
              aria-labelledby={pid("intake-fy-label")}
              block
              placeholder="Select fiscal year"
              label={fiscalOptions.find((o) => o.value === values.targetFiscalYear)?.label}
              onClear={() => void setFieldValue("targetFiscalYear", "")}
              onSelect={(s) => {
                if (s.action !== "selected") return;
                void setFieldValue("targetFiscalYear", String(s.item));
              }}
            >
              {fiscalOptions.map((o) => (
                <Select.Option key={o.value} value={o.value} selected={values.targetFiscalYear === o.value}>
                  {o.label}
                </Select.Option>
              ))}
            </Select>
            {fieldError(errors, touched, submitCount, "targetFiscalYear") ? (
              <Typography intent="small" style={{ color: "var(--color-text-error)", marginTop: 4 }}>
                {fieldError(errors, touched, submitCount, "targetFiscalYear")}
              </Typography>
            ) : null}
          </div>
          <div>
            <Typography intent="small" weight="bold" style={{ marginBottom: 8, display: "block" }}>
              Location details
            </Typography>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 16,
              }}
            >
              <div>
                <Typography id={pid("intake-site-label")} intent="small" weight="semibold" style={{ ...labelBlock, cursor: "default" }}>
                  Site / campus
                </Typography>
                <Select
                  aria-labelledby={pid("intake-site-label")}
                  block
                  placeholder="Select site"
                  label={values.siteCampus || undefined}
                  onClear={() => {
                    void setFieldValue("siteCampus", "");
                    void setFieldValue("building", "");
                  }}
                  onSelect={(s) => {
                    if (s.action !== "selected") return;
                    void setFieldValue("siteCampus", String(s.item));
                    void setFieldValue("building", "");
                  }}
                >
                  {siteOptions.map((site) => (
                    <Select.Option key={site} value={site} selected={values.siteCampus === site}>
                      {site}
                    </Select.Option>
                  ))}
                </Select>
                {fieldError(errors, touched, submitCount, "siteCampus") ? (
                  <Typography intent="small" style={{ color: "var(--color-text-error)", marginTop: 4 }}>
                    {fieldError(errors, touched, submitCount, "siteCampus")}
                  </Typography>
                ) : null}
              </div>
              <div>
                <Typography id={pid("intake-building-label")} intent="small" weight="semibold" style={{ ...labelBlock, cursor: "default" }}>
                  Building
                </Typography>
                <Select
                  aria-labelledby={pid("intake-building-label")}
                  block
                  placeholder={values.siteCampus ? "Select building" : "Select site first"}
                  label={values.building || undefined}
                  disabled={!values.siteCampus}
                  onClear={() => void setFieldValue("building", "")}
                  onSelect={(s) => {
                    if (s.action !== "selected") return;
                    void setFieldValue("building", String(s.item));
                  }}
                >
                  {buildingOptions.map((b) => (
                    <Select.Option key={b} value={b} selected={values.building === b}>
                      {b}
                    </Select.Option>
                  ))}
                </Select>
                {fieldError(errors, touched, submitCount, "building") ? (
                  <Typography intent="small" style={{ color: "var(--color-text-error)", marginTop: 4 }}>
                    {fieldError(errors, touched, submitCount, "building")}
                  </Typography>
                ) : null}
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label htmlFor={pid("intake-floor")} style={labelBlock}>
                  <Typography intent="small" weight="semibold">
                    Floor / wing / specific area
                  </Typography>
                </label>
                <TextInput
                  id={pid("intake-floor")}
                  name="floorWingArea"
                  value={values.floorWingArea}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. 3rd floor, east wing"
                  style={{ width: "100%", maxWidth: 480 }}
                />
              </div>
            </div>
          </div>
        </div>
      </IntakeSectionAccordion>

      <IntakeSectionAccordion
        id={pid("intake-s2")}
        title="Section 2: Project scope & categorization"
        description="What the project is and how it should be routed."
        defaultOpen={false}
        errorCount={section2Errors}
      >
        <div style={fieldStack}>
          <div>
            <label htmlFor={pid("intake-project-name")} style={labelBlock}>
              <Typography intent="small" weight="bold" as="span">
                Project name
                {requiredStar}
              </Typography>
            </label>
            <TextInput
              id={pid("intake-project-name")}
              name="projectName"
              value={values.projectName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Short title (max 100 characters)"
              maxLength={100}
              aria-invalid={Boolean(fieldError(errors, touched, submitCount, "projectName"))}
              style={{ width: "100%" }}
            />
            <Typography intent="small" style={{ color: "var(--color-text-secondary)", marginTop: 4 }}>
              {values.projectName.length}/100
            </Typography>
            {fieldError(errors, touched, submitCount, "projectName") ? (
              <Typography intent="small" style={{ color: "var(--color-text-error)", marginTop: 4 }}>
                {fieldError(errors, touched, submitCount, "projectName")}
              </Typography>
            ) : null}
          </div>
          <div>
            <label htmlFor={pid("intake-project-desc")} style={labelBlock}>
              <Typography intent="small" weight="bold" as="span">
                Project description / scope statement
                {requiredStar}
              </Typography>
            </label>
            <TextArea
              id={pid("intake-project-desc")}
              name="projectDescription"
              value={values.projectDescription}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Summarize scope, deliverables, and boundaries (minimum 50 characters)."
              rows={5}
              resize="vertical"
              aria-invalid={Boolean(fieldError(errors, touched, submitCount, "projectDescription"))}
              style={{ width: "100%", minHeight: 120 }}
            />
            <Typography intent="small" style={{ color: "var(--color-text-secondary)", marginTop: 4 }}>
              {values.projectDescription.trim().length} characters (min 50)
            </Typography>
            {fieldError(errors, touched, submitCount, "projectDescription") ? (
              <Typography intent="small" style={{ color: "var(--color-text-error)", marginTop: 4 }}>
                {fieldError(errors, touched, submitCount, "projectDescription")}
              </Typography>
            ) : null}
          </div>
          <div>
            <Typography id={pid("intake-project-type-label")} intent="small" weight="bold" style={{ ...labelBlock, cursor: "default" }}>
              Project type / category
              {requiredStar}
            </Typography>
            <Select
              aria-labelledby={pid("intake-project-type-label")}
              block
              placeholder="Select project type"
              label={values.projectType || undefined}
              onClear={() => void setFieldValue("projectType", "")}
              onSelect={(s) => {
                if (s.action !== "selected") return;
                void setFieldValue("projectType", String(s.item));
              }}
            >
              {projectTypeOptions.map((t) => (
                <Select.Option key={t} value={t} selected={values.projectType === t}>
                  {t}
                </Select.Option>
              ))}
            </Select>
            {fieldError(errors, touched, submitCount, "projectType") ? (
              <Typography intent="small" style={{ color: "var(--color-text-error)", marginTop: 4 }}>
                {fieldError(errors, touched, submitCount, "projectType")}
              </Typography>
            ) : null}
          </div>
        </div>
      </IntakeSectionAccordion>

      <IntakeSectionAccordion
        id={pid("intake-s3")}
        title="Section 3: Business case & strategic value"
        description="Justification and risk context used for scoring and committee review."
        defaultOpen={false}
        errorCount={section3Errors}
      >
        <div style={fieldStack}>
          <div>
            <label htmlFor={pid("intake-business-need")} style={labelBlock}>
              <Typography intent="small" weight="bold" as="span">
                Business need / justification
                {requiredStar}
              </Typography>
            </label>
            <TextArea
              id={pid("intake-business-need")}
              name="businessNeed"
              value={values.businessNeed}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Core drivers, outcomes, and expected return or efficiency gains."
              rows={4}
              resize="vertical"
              aria-invalid={Boolean(fieldError(errors, touched, submitCount, "businessNeed"))}
              style={{ width: "100%", minHeight: 100 }}
            />
            {fieldError(errors, touched, submitCount, "businessNeed") ? (
              <Typography intent="small" style={{ color: "var(--color-text-error)", marginTop: 4 }}>
                {fieldError(errors, touched, submitCount, "businessNeed")}
              </Typography>
            ) : null}
          </div>
          <div>
            <label htmlFor={pid("intake-consequences")} style={labelBlock}>
              <Typography intent="small" weight="bold" as="span">
                Consequences of inaction
                {requiredStar}
              </Typography>
            </label>
            <TextArea
              id={pid("intake-consequences")}
              name="consequencesOfInaction"
              value={values.consequencesOfInaction}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Safety, compliance, cost, or operational risks if this work is deferred."
              rows={4}
              resize="vertical"
              aria-invalid={Boolean(fieldError(errors, touched, submitCount, "consequencesOfInaction"))}
              style={{ width: "100%", minHeight: 100 }}
            />
            {fieldError(errors, touched, submitCount, "consequencesOfInaction") ? (
              <Typography intent="small" style={{ color: "var(--color-text-error)", marginTop: 4 }}>
                {fieldError(errors, touched, submitCount, "consequencesOfInaction")}
              </Typography>
            ) : null}
          </div>
          <div>
            <label htmlFor={pid("intake-sponsor")} style={labelBlock}>
              <Typography intent="small" weight="bold">
                Project sponsor
              </Typography>
            </label>
            <TextInput
              id={pid("intake-sponsor")}
              name="projectSponsor"
              value={values.projectSponsor}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Executive champion (name)"
              style={{ width: "100%", maxWidth: 480 }}
            />
          </div>
          <fieldset style={{ border: "none", margin: 0, padding: 0, minWidth: 0 }}>
            <legend style={{ ...labelBlock, padding: 0 }}>
              <Typography intent="small" weight="bold" as="span">
                Priority level
                {requiredStar}
              </Typography>
            </legend>
            <div
              role="radiogroup"
              aria-required
              style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}
            >
              {priorityOptions.map((opt) => (
                <RadioButton
                  key={opt.value}
                  name={`${idPrefix || "intake"}-priorityLevel`}
                  value={opt.value}
                  checked={values.priorityLevel === opt.value}
                  error={Boolean(fieldError(errors, touched, submitCount, "priorityLevel"))}
                  onChange={() => {
                    void setFieldValue("priorityLevel", opt.value);
                    void formik.setFieldTouched("priorityLevel", true, false);
                  }}
                >
                  {opt.label}
                </RadioButton>
              ))}
            </div>
            {fieldError(errors, touched, submitCount, "priorityLevel") ? (
              <Typography intent="small" style={{ color: "var(--color-text-error)", marginTop: 4 }}>
                {fieldError(errors, touched, submitCount, "priorityLevel")}
              </Typography>
            ) : null}
          </fieldset>
        </div>
      </IntakeSectionAccordion>

      <IntakeSectionAccordion
        id={pid("intake-s4")}
        title="Section 4: Financials & supporting data"
        description="Rough order of magnitude and supporting materials."
        defaultOpen={false}
        errorCount={section4Errors}
      >
        <div style={fieldStack}>
          <div>
            <Typography id={pid("intake-rom-label")} intent="small" weight="bold" style={{ ...labelBlock, cursor: "default" }}>
              Estimated budget (ROM)
              {requiredStar}
            </Typography>
            <Select
              aria-labelledby={pid("intake-rom-label")}
              block
              placeholder="Select range"
              label={values.estimatedBudgetRom || undefined}
              onClear={() => void setFieldValue("estimatedBudgetRom", "")}
              onSelect={(s) => {
                if (s.action !== "selected") return;
                void setFieldValue("estimatedBudgetRom", String(s.item));
              }}
            >
              {budgetRomOptions.map((b) => (
                <Select.Option key={b} value={b} selected={values.estimatedBudgetRom === b}>
                  {b}
                </Select.Option>
              ))}
            </Select>
            {fieldError(errors, touched, submitCount, "estimatedBudgetRom") ? (
              <Typography intent="small" style={{ color: "var(--color-text-error)", marginTop: 4 }}>
                {fieldError(errors, touched, submitCount, "estimatedBudgetRom")}
              </Typography>
            ) : null}
          </div>
          <div>
            <Typography intent="small" weight="bold" style={{ ...labelBlock, cursor: "default" }}>
              Supporting attachments
            </Typography>
            <Typography intent="small" style={{ color: "var(--color-text-secondary)", margin: "0 0 8px" }}>
              PDF, DOCX, JPG, or PNG. Multiple files allowed. Max 10 MB per file.
            </Typography>
            <input
              ref={fileInputRef as React.RefObject<HTMLInputElement>}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg"
              style={{ display: "none" }}
              onChange={(e) => onFilesPicked(e.target.files)}
            />
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "copy";
              }}
              onDrop={(e) => {
                e.preventDefault();
                onFilesPicked(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: "2px dashed var(--color-border-default)",
                borderRadius: 8,
                padding: "24px 16px",
                textAlign: "center",
                cursor: "pointer",
                background: "var(--color-surface-tertiary)",
              }}
            >
              <Typography intent="small" style={{ margin: 0 }}>
                Drag files here or click to browse
              </Typography>
            </div>
            {fileDropError ? (
              <Typography intent="small" style={{ color: "var(--color-text-error)", marginTop: 8 }}>
                {fileDropError}
              </Typography>
            ) : null}
            {values.attachmentFiles.length > 0 ? (
              <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0 }}>
                {values.attachmentFiles.map((file, idx) => (
                  <li
                    key={`${file.name}-${file.size}-${idx}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      padding: "8px 0",
                      borderBottom: "1px solid var(--color-border-separator)",
                    }}
                  >
                    <Typography intent="small" style={{ margin: 0, wordBreak: "break-word" }}>
                      {file.name}{" "}
                      <span style={{ color: "var(--color-text-secondary)" }}>
                        ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </Typography>
                    <Button
                      type="button"
                      variant="tertiary"
                      className="b_tertiary"
                      size="sm"
                      icon={<Trash size="sm" />}
                      aria-label={`Remove ${file.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = values.attachmentFiles.filter((_, i) => i !== idx);
                        void setFieldValue("attachmentFiles", next);
                      }}
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </IntakeSectionAccordion>
    </div>
  );
}

export interface CapitalCallIntakeFormViewProps {
  /** Dropdown / radio options shown on the intake form. */
  config: IntakeFormConfig;
  /** localStorage key for Save draft / restore (preview uses a separate key from any future live form). */
  draftStorageKey?: string;
  /** Prefix for field ids (e.g. preview modal). */
  idPrefix?: string;
  /** Narrow outer width (main tab); modal passes false via style on parent. */
  narrow?: boolean;
}

/**
 * Full Capital Call intake form (sections, validation, draft, submit). Options come from {@link config}.
 */
export function CapitalCallIntakeFormView({
  config,
  draftStorageKey = CAPITAL_CALL_INTAKE_DEFAULT_DRAFT_KEY,
  idPrefix = "",
  narrow = true,
}: CapitalCallIntakeFormViewProps) {
  const reactId = useId();
  const stableIdPrefix = idPrefix || reactId.replace(/:/g, "");
  const formId = `${stableIdPrefix}-intake-form`;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileDropError, setFileDropError] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [bootstrap, setBootstrap] = useState(() => readIntakeBootstrap(draftStorageKey));

  return (
    <section
      aria-label="Capital call project intake form"
      style={{ minWidth: 0, width: "100%", maxWidth: narrow ? 920 : "none" }}
    >
      <Typography intent="small" style={{ margin: "0 0 16px", color: "var(--color-text-secondary)" }}>
        Submit a capital project request for triage, scoring, and prioritization. Required fields are marked with an
        asterisk. Use Save draft to persist progress in this browser; Submit request runs full validation and logs a
        JSON payload to the developer console (prototype).
      </Typography>

      {bootstrap.draftRestored ? (
        <InfoBanner style={{ marginBottom: 16 }}>
          <Typography intent="small">
            A saved draft was restored. Attachment files are not stored in the draft; re-upload if needed.
          </Typography>
        </InfoBanner>
      ) : null}

      {submitSuccess ? (
        <InfoBanner style={{ marginBottom: 16 }}>
          <Typography intent="small">Request submitted. Form has been reset.</Typography>
        </InfoBanner>
      ) : null}

      {draftMessage ? (
        <InfoBanner style={{ marginBottom: 16 }}>
          <Typography intent="small">{draftMessage}</Typography>
        </InfoBanner>
      ) : null}

      <Formik<CapitalCallIntakeFormValues>
        enableReinitialize
        initialValues={bootstrap.initialValues}
        validate={(values) => validateCapitalCallIntakeForm(values, config)}
        onSubmit={(values, helpers) => {
          const payload = intakeValuesToSubmissionPayload(values);
          console.log("[Capital Call Intake] submission payload:", JSON.stringify(payload, null, 2));
          clearDraftStorage(draftStorageKey);
          helpers.resetForm({ values: getDefaultIntakeValues() });
          setBootstrap({ initialValues: getDefaultIntakeValues(), draftRestored: false });
          setSubmitSuccess(true);
          setDraftMessage(null);
          setFileDropError(null);
        }}
      >
        {(formik) => (
          <Form id={formId} noValidate>
            <IntakeFormFields
              config={config}
              formik={formik}
              fileInputRef={fileInputRef}
              fileDropError={fileDropError}
              setFileDropError={setFileDropError}
              idPrefix={stableIdPrefix}
            />

            {formik.submitCount > 0 && Object.keys(formik.errors).length > 0 ? (
              <ErrorBanner role="alert" style={{ marginTop: 16 }}>
                <Typography intent="body">Fix the highlighted fields, then submit again.</Typography>
              </ErrorBanner>
            ) : null}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 24 }}>
              <Button
                type="button"
                variant="secondary"
                className="b_secondary"
                onClick={() => {
                  persistDraft(formik.values, draftStorageKey);
                  setDraftMessage("Draft saved in this browser (attachments stored as names only).");
                  setSubmitSuccess(false);
                }}
              >
                Save draft
              </Button>
              <Button type="submit" variant="primary">
                Submit request
              </Button>
              <Button
                type="button"
                variant="tertiary"
                className="b_tertiary"
                onClick={() => {
                  formik.resetForm({ values: getDefaultIntakeValues() });
                  setBootstrap({ initialValues: getDefaultIntakeValues(), draftRestored: false });
                  clearDraftStorage(draftStorageKey);
                  setDraftMessage(null);
                  setSubmitSuccess(false);
                  setFileDropError(null);
                }}
              >
                Clear form
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </section>
  );
}
