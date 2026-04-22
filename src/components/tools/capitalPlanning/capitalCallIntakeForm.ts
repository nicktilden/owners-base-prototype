/** Serializable draft (blobs not stored; attachmentMeta holds file names for display only). */
export type CapitalCallIntakeDraftSnapshot = Omit<CapitalCallIntakeFormValues, "attachmentFiles"> & {
  attachmentMeta?: { name: string; size: number; type: string }[];
};

/** Default priority values; builder may use custom slugs. */
export type IntakePriorityLevel = "low" | "medium" | "high" | "critical";

export interface IntakePriorityOption {
  value: string;
  label: string;
}

export interface IntakeFormConfig {
  departments: string[];
  projectTypes: string[];
  budgetRom: string[];
  fiscalYearOptions: { value: string; label: string }[];
  buildingsBySite: Record<string, string[]>;
  priorityOptions: IntakePriorityOption[];
}

export interface CapitalCallIntakeFormValues {
  requestorName: string;
  requestorEmail: string;
  department: string;
  targetFiscalYear: string;
  siteCampus: string;
  building: string;
  floorWingArea: string;
  projectName: string;
  projectDescription: string;
  projectType: string;
  businessNeed: string;
  consequencesOfInaction: string;
  projectSponsor: string;
  priorityLevel: string;
  estimatedBudgetRom: string;
  attachmentFiles: File[];
}

export const INTAKE_DEPARTMENT_OPTIONS = [
  "Operations",
  "IT",
  "Facilities",
  "HR",
  "Finance",
] as const;

export const INTAKE_PROJECT_TYPE_OPTIONS = [
  "Major Capital Expansion",
  "Small Renovation",
  "Operational Maintenance",
  "Space Modification",
  "IT/Security Upgrade",
] as const;

export const INTAKE_BUDGET_ROM_OPTIONS = [
  "Under $10k",
  "$10k - $50k",
  "$50k - $250k",
  "$250k - $1M",
  "$1M+",
] as const;

export const INTAKE_PRIORITY_OPTIONS: IntakePriorityOption[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

/** Site → buildings for cascading location dropdowns. */
export const INTAKE_BUILDINGS_BY_SITE: Record<string, string[]> = {
  "": [],
  "North Campus": ["Administration", "Science Lab A", "Parking Structure 1"],
  "South Campus": ["Warehouse 2", "Training Center", "Field Office"],
  HQ: ["Tower A", "Tower B", "Annex"],
  Remote: ["N/A"],
};

export const INTAKE_SITE_OPTIONS = Object.keys(INTAKE_BUILDINGS_BY_SITE).filter((k) => k !== "");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getTargetFiscalYearOptions(): { value: string; label: string }[] {
  return [
    { value: "current_fy", label: "Current FY" },
    { value: "current_fy_plus_1", label: "Current FY +1" },
    { value: "current_fy_plus_2", label: "Current FY +2" },
    { value: "current_fy_plus_3", label: "Current FY +3" },
  ];
}

function cloneDefaultBuildingsBySite(): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(INTAKE_BUILDINGS_BY_SITE)) {
    if (!k) continue;
    out[k] = [...v];
  }
  return out;
}

export function getDefaultIntakeFormConfig(): IntakeFormConfig {
  return {
    departments: [...INTAKE_DEPARTMENT_OPTIONS],
    projectTypes: [...INTAKE_PROJECT_TYPE_OPTIONS],
    budgetRom: [...INTAKE_BUDGET_ROM_OPTIONS],
    fiscalYearOptions: getTargetFiscalYearOptions().map((o) => ({ ...o })),
    buildingsBySite: cloneDefaultBuildingsBySite(),
    priorityOptions: INTAKE_PRIORITY_OPTIONS.map((o) => ({ ...o })),
  };
}

export function siteKeysFromConfig(config: IntakeFormConfig): string[] {
  return Object.keys(config.buildingsBySite).filter((k) => k.trim().length > 0);
}

export function sanitizeIntakeFormConfig(raw: unknown): IntakeFormConfig {
  const d = getDefaultIntakeFormConfig();
  if (!raw || typeof raw !== "object") return d;
  const o = raw as Partial<IntakeFormConfig>;
  const strList = (v: unknown, fallback: string[]) =>
    Array.isArray(v)
      ? v.map((x) => String(x).trim()).filter(Boolean)
      : fallback;
  const fy = Array.isArray(o.fiscalYearOptions)
    ? o.fiscalYearOptions
        .filter((x) => x && typeof x === "object")
        .map((x) => {
          const r = x as { value?: unknown; label?: unknown };
          return {
            value: String(r.value ?? "").trim(),
            label: String(r.label ?? "").trim(),
          };
        })
        .filter((x) => x.value && x.label)
    : d.fiscalYearOptions;
  const prio = Array.isArray(o.priorityOptions)
    ? o.priorityOptions
        .filter((x) => x && typeof x === "object")
        .map((x) => {
          const r = x as { value?: unknown; label?: unknown };
          return {
            value: String(r.value ?? "").trim(),
            label: String(r.label ?? "").trim(),
          };
        })
        .filter((x) => x.value && x.label)
    : d.priorityOptions;
  let buildings: Record<string, string[]> = cloneDefaultBuildingsBySite();
  if (o.buildingsBySite && typeof o.buildingsBySite === "object") {
    const next: Record<string, string[]> = {};
    for (const [site, arr] of Object.entries(o.buildingsBySite)) {
      const sk = site.trim();
      if (!sk) continue;
      next[sk] = Array.isArray(arr)
        ? arr.map((b) => String(b).trim()).filter(Boolean)
        : [];
    }
    if (Object.keys(next).length > 0) buildings = next;
  }
  return {
    departments: strList(o.departments, d.departments).length ? strList(o.departments, d.departments) : d.departments,
    projectTypes: strList(o.projectTypes, d.projectTypes).length ? strList(o.projectTypes, d.projectTypes) : d.projectTypes,
    budgetRom: strList(o.budgetRom, d.budgetRom).length ? strList(o.budgetRom, d.budgetRom) : d.budgetRom,
    fiscalYearOptions: fy.length ? fy : d.fiscalYearOptions,
    buildingsBySite: Object.keys(buildings).length ? buildings : d.buildingsBySite,
    priorityOptions: prio.length ? prio : d.priorityOptions,
  };
}

export function getDefaultIntakeValues(): CapitalCallIntakeFormValues {
  return {
    requestorName: "",
    requestorEmail: "",
    department: "",
    targetFiscalYear: "",
    siteCampus: "",
    building: "",
    floorWingArea: "",
    projectName: "",
    projectDescription: "",
    projectType: "",
    businessNeed: "",
    consequencesOfInaction: "",
    projectSponsor: "",
    priorityLevel: "",
    estimatedBudgetRom: "",
    attachmentFiles: [],
  };
}

export function mergeDraftIntoValues(
  base: CapitalCallIntakeFormValues,
  draft: Partial<CapitalCallIntakeDraftSnapshot> | null
): CapitalCallIntakeFormValues {
  if (!draft) return base;
  const { attachmentMeta, ...rest } = draft;
  void attachmentMeta;
  return {
    ...base,
    ...rest,
    attachmentFiles: [],
  };
}

export function validateCapitalCallIntakeForm(
  values: CapitalCallIntakeFormValues,
  config: IntakeFormConfig
): Partial<Record<keyof CapitalCallIntakeFormValues, string>> {
  const e: Partial<Record<keyof CapitalCallIntakeFormValues, string>> = {};
  if (!values.requestorName.trim()) e.requestorName = "Required";
  const em = values.requestorEmail.trim();
  if (!em) e.requestorEmail = "Required";
  else if (!EMAIL_RE.test(em)) e.requestorEmail = "Enter a valid email address";
  if (!values.projectName.trim()) e.projectName = "Required";
  else if (values.projectName.length > 100) e.projectName = "Maximum 100 characters";
  const desc = values.projectDescription.trim();
  if (!desc) e.projectDescription = "Required";
  else if (desc.length < 50) e.projectDescription = "Enter at least 50 characters";
  if (!values.projectType) e.projectType = "Required";
  else if (!config.projectTypes.includes(values.projectType)) e.projectType = "Select a valid project type";
  if (!values.businessNeed.trim()) e.businessNeed = "Required";
  if (!values.consequencesOfInaction.trim()) e.consequencesOfInaction = "Required";
  if (!values.priorityLevel) e.priorityLevel = "Required";
  else if (!config.priorityOptions.some((p) => p.value === values.priorityLevel)) {
    e.priorityLevel = "Select a valid priority";
  }
  if (!values.estimatedBudgetRom) e.estimatedBudgetRom = "Required";
  else if (!config.budgetRom.includes(values.estimatedBudgetRom)) e.estimatedBudgetRom = "Select a valid budget range";
  if (values.department && config.departments.length > 0 && !config.departments.includes(values.department)) {
    e.department = "Select a valid department";
  }
  if (values.targetFiscalYear && !config.fiscalYearOptions.some((o) => o.value === values.targetFiscalYear)) {
    e.targetFiscalYear = "Select a valid fiscal year";
  }
  const sites = siteKeysFromConfig(config);
  if (values.siteCampus && sites.length > 0 && !sites.includes(values.siteCampus)) {
    e.siteCampus = "Select a valid site";
  }
  const bList = values.siteCampus ? config.buildingsBySite[values.siteCampus] ?? [] : [];
  if (values.building && bList.length > 0 && !bList.includes(values.building)) {
    e.building = "Select a valid building";
  }
  return e;
}

export function intakeValuesToSubmissionPayload(values: CapitalCallIntakeFormValues) {
  return {
    section1_basicIdentifiers: {
      requestorName: values.requestorName.trim(),
      requestorEmail: values.requestorEmail.trim(),
      department: values.department || null,
      targetFiscalYear: values.targetFiscalYear || null,
      location: {
        siteCampus: values.siteCampus || null,
        building: values.building || null,
        floorWingArea: values.floorWingArea.trim() || null,
      },
    },
    section2_scope: {
      projectName: values.projectName.trim(),
      projectDescription: values.projectDescription.trim(),
      projectType: values.projectType,
    },
    section3_businessCase: {
      businessNeed: values.businessNeed.trim(),
      consequencesOfInaction: values.consequencesOfInaction.trim(),
      projectSponsor: values.projectSponsor.trim() || null,
      priorityLevel: values.priorityLevel,
    },
    section4_financials: {
      estimatedBudgetRom: values.estimatedBudgetRom,
      attachments: values.attachmentFiles.map((f) => ({
        name: f.name,
        sizeBytes: f.size,
        mimeType: f.type,
      })),
    },
  };
}

const ACCEPT_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
]);
const ACCEPT_EXT = /\.(pdf|docx|jpe?g|png)$/i;
const MAX_BYTES = 10 * 1024 * 1024;

export function validateNewIntakeFiles(
  existing: File[],
  incoming: File[]
): { next: File[]; error?: string } {
  const combined = [...existing];
  for (const file of incoming) {
    if (file.size > MAX_BYTES) {
      return {
        next: existing,
        error: `"${file.name}" exceeds 10 MB per file.`,
      };
    }
    const okMime = file.type && ACCEPT_MIME.has(file.type);
    const okExt = ACCEPT_EXT.test(file.name);
    if (!okMime && !okExt) {
      return {
        next: existing,
        error: `"${file.name}" must be PDF, DOCX, JPG, or PNG.`,
      };
    }
    combined.push(file);
  }
  return { next: combined };
}
