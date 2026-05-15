import type { ActionPlan, ActionPlanItem, ActionPlanSection } from "@/types/action_plans";

function d(iso: string): Date { return new Date(iso); }

function closedItem(
  id: string, sectionId: string, order: number, title: string,
  assignees: string[], dueDate: string, completedAt: string,
  createdBy: string, createdAt: string, acceptanceCriteria: string | null = null
): ActionPlanItem {
  return {
    id, sectionId, order, title, description: null, acceptanceCriteria,
    status: "closed", assignees, dueDate: d(dueDate), references: [],
    completedAt: d(completedAt), createdBy, createdAt: d(createdAt), updatedAt: d(completedAt),
  };
}

function openItem(
  id: string, sectionId: string, order: number, title: string,
  assignees: string[], dueDate: string | null,
  createdBy: string, createdAt: string, acceptanceCriteria: string | null = null
): ActionPlanItem {
  return {
    id, sectionId, order, title, description: null, acceptanceCriteria,
    status: "open", assignees, dueDate: dueDate ? d(dueDate) : null, references: [],
    completedAt: null, createdBy, createdAt: d(createdAt), updatedAt: d(createdAt),
  };
}

function inProgressItem(
  id: string, sectionId: string, order: number, title: string,
  assignees: string[], dueDate: string,
  createdBy: string, createdAt: string, acceptanceCriteria: string | null = null
): ActionPlanItem {
  return {
    id, sectionId, order, title, description: null, acceptanceCriteria,
    status: "in_progress", assignees, dueDate: d(dueDate), references: [],
    completedAt: null, createdBy, createdAt: d(createdAt), updatedAt: d(createdAt),
  };
}

function delayedItem(
  id: string, sectionId: string, order: number, title: string,
  assignees: string[], dueDate: string,
  createdBy: string, createdAt: string
): ActionPlanItem {
  return {
    id, sectionId, order, title, description: null, acceptanceCriteria: null,
    status: "delayed", assignees, dueDate: d(dueDate), references: [],
    completedAt: null, createdBy, createdAt: d(createdAt), updatedAt: d(createdAt),
  };
}

// Action Plan 1: Denver Phase 3 Feasibility Gate (COMPLETE)
const ap001: ActionPlan = {
  id: "ap-001", accountId: "acc-001", projectId: "proj-001", number: 1,
  title: "Denver Phase 3 - Site Feasibility & Utility Gate",
  typeId: "apt-gate", status: "complete", private: false, locationId: null,
  description: "Site feasibility and utility reservation gate for the Denver Phase 3 data center campus.",
  planManager: "user-004", approvers: ["user-001", "user-007"],
  completedReceivers: ["user-001", "user-003", "user-004"],
  createdBy: "user-004", createdAt: d("2023-07-01"), updatedAt: d("2023-12-18"),
  sections: [
    {
      id: "ap-001-s1", planId: "ap-001", title: "Utility & Power Feasibility", order: 0,
      createdAt: d("2023-07-01"), updatedAt: d("2023-07-01"),
      items: [
        closedItem("ap-001-s1-i1", "ap-001-s1", 0, "Confirm Xcel Energy 115kV capacity reservation", ["user-006","user-004"], "2023-09-30", "2023-09-28", "user-004", "2023-07-01", "Executed power reservation agreement on file."),
        closedItem("ap-001-s1-i2", "ap-001-s1", 1, "Commission ERCOT load flow study", ["user-014"], "2023-10-31", "2023-10-25", "user-004", "2023-07-01"),
        closedItem("ap-001-s1-i3", "ap-001-s1", 2, "Obtain water rights for cooling tower makeup", ["user-006"], "2023-11-30", "2023-11-22", "user-004", "2023-07-01"),
      ],
    },
    {
      id: "ap-001-s2", planId: "ap-001", title: "Site Control & Entitlements", order: 1,
      createdAt: d("2023-07-01"), updatedAt: d("2023-07-01"),
      items: [
        closedItem("ap-001-s2-i1", "ap-001-s2", 0, "Site lease or purchase executed", ["user-006"], "2023-08-31", "2023-08-29", "user-004", "2023-07-01"),
        closedItem("ap-001-s2-i2", "ap-001-s2", 1, "Zoning and land-use confirmation obtained", ["user-014"], "2023-09-30", "2023-09-25", "user-004", "2023-07-01"),
        closedItem("ap-001-s2-i3", "ap-001-s2", 2, "Environmental Phase I assessment complete", ["user-014"], "2023-10-31", "2023-10-18", "user-004", "2023-07-01"),
      ],
    },
    {
      id: "ap-001-s3", planId: "ap-001", title: "Financial Authorization", order: 2,
      createdAt: d("2023-07-01"), updatedAt: d("2023-07-01"),
      items: [
        closedItem("ap-001-s3-i1", "ap-001-s3", 0, "Project budget approved", ["user-003","user-004"], "2023-11-30", "2023-11-20", "user-004", "2023-07-01", "Board investment approval memo on file."),
        closedItem("ap-001-s3-i2", "ap-001-s3", 1, "Customer LOI or anchor tenant confirmed", ["user-001","user-006"], "2023-12-15", "2023-12-10", "user-004", "2023-07-01"),
        closedItem("ap-001-s3-i3", "ap-001-s3", 2, "Board CapEx authorization obtained", ["user-001","user-007"], "2023-12-31", "2023-12-18", "user-004", "2023-07-01", "Board resolution on file."),
      ],
    },
  ],
};

// Action Plan 2: Dallas Campus Permitting Gate
const ap002: ActionPlan = {
  id: "ap-002", accountId: "acc-001", projectId: "proj-006", number: 2,
  title: "Dallas Campus - Permitting & ERCOT Interconnect Gate",
  typeId: "apt-gate", status: "in_progress", private: false, locationId: null,
  description: "Permitting and ERCOT interconnect readiness gate for the Dallas Garland campus.",
  planManager: "user-010", approvers: ["user-004", "user-006"],
  completedReceivers: ["user-001", "user-004", "user-006"],
  createdBy: "user-004", createdAt: d("2025-01-01"), updatedAt: d("2026-03-15"),
  sections: [
    {
      id: "ap-002-s1", planId: "ap-002", title: "Building Permits", order: 0,
      createdAt: d("2025-01-01"), updatedAt: d("2025-01-01"),
      items: [
        closedItem("ap-002-s1-i1", "ap-002-s1", 0, "Pre-application meeting with Garland Building Services", ["user-010"], "2025-04-30", "2025-04-25", "user-010", "2025-01-01"),
        inProgressItem("ap-002-s1-i2", "ap-002-s1", 1, "Submit building permit application package", ["user-010","user-014"], "2026-04-30", "user-010", "2025-01-01", "Complete application including structural, MEP, and civil drawings."),
        openItem("ap-002-s1-i3", "ap-002-s1", 2, "Respond to plan check corrections", ["user-014"], "2026-06-30", "user-010", "2025-01-01"),
        openItem("ap-002-s1-i4", "ap-002-s1", 3, "Building permits issued", ["user-010"], "2026-08-01", "user-010", "2025-01-01", "Permits on file with PM team."),
      ],
    },
    {
      id: "ap-002-s2", planId: "ap-002", title: "ERCOT Transmission Interconnect", order: 1,
      createdAt: d("2025-01-01"), updatedAt: d("2025-01-01"),
      items: [
        closedItem("ap-002-s2-i1", "ap-002-s2", 0, "File ERCOT large load interconnect application", ["user-006"], "2025-06-30", "2025-06-28", "user-006", "2025-01-01"),
        inProgressItem("ap-002-s2-i2", "ap-002-s2", 1, "Oncor transmission network upgrade study", ["user-006","user-014"], "2026-05-31", "user-006", "2025-01-01", "ERCOT-approved study report with cost allocation."),
        delayedItem("ap-002-s2-i3", "ap-002-s2", 2, "Execute Oncor transmission cost allocation agreement", ["user-006","user-003"], "2026-04-30", "user-006", "2025-01-01"),
        openItem("ap-002-s2-i4", "ap-002-s2", 3, "Power delivery agreement executed with Oncor", ["user-006"], "2026-09-30", "user-006", "2025-01-01"),
      ],
    },
    {
      id: "ap-002-s3", planId: "ap-002", title: "Environmental & Air Permits", order: 2,
      createdAt: d("2025-01-01"), updatedAt: d("2025-01-01"),
      items: [
        closedItem("ap-002-s3-i1", "ap-002-s3", 0, "TCEQ air quality pre-application consultation", ["user-014"], "2025-08-31", "2025-08-20", "user-010", "2025-01-01"),
        inProgressItem("ap-002-s3-i2", "ap-002-s3", 1, "Submit EPA Title V permit application for generators", ["user-014","user-016"], "2026-05-31", "user-010", "2025-01-01"),
        openItem("ap-002-s3-i3", "ap-002-s3", 2, "Receive Title V permit authorization", ["user-006"], "2026-09-01", "user-010", "2025-01-01", "Permit must be in hand before generator installation begins."),
      ],
    },
  ],
};

// Action Plan 3: Northern Virginia Pod 7 Commissioning Gate
const ap003: ActionPlan = {
  id: "ap-003", accountId: "acc-001", projectId: "proj-003", number: 3,
  title: "Northern Virginia Pod 7 - Tier III Commissioning Gate",
  typeId: "apt-gate", status: "in_progress", private: false, locationId: null,
  description: "Tier III commissioning readiness gate for Northern Virginia Pod 7 data hall.",
  planManager: "user-009", approvers: ["user-004", "user-013"],
  completedReceivers: ["user-001", "user-004", "user-009"],
  createdBy: "user-009", createdAt: d("2025-04-01"), updatedAt: d("2026-03-15"),
  sections: [
    {
      id: "ap-003-s1", planId: "ap-003", title: "Power Systems Verification", order: 0,
      createdAt: d("2025-04-01"), updatedAt: d("2025-04-01"),
      items: [
        closedItem("ap-003-s1-i1", "ap-003-s1", 0, "UPS factory acceptance tests complete", ["user-013"], "2025-05-31", "2025-05-28", "user-009", "2025-04-01", "FAT reports signed by Vantage witness engineer."),
        inProgressItem("ap-003-s1-i2", "ap-003-s1", 1, "Generator load bank tests all 8 units", ["user-013","user-015"], "2025-08-31", "user-009", "2025-04-01", "100% load test for 2 hours minimum."),
        openItem("ap-003-s1-i3", "ap-003-s1", 2, "Concurrent maintainability test (CMT)", ["user-013"], "2025-09-15", "user-009", "2025-04-01", "Uptime Institute Tier III CMT witnessed test."),
      ],
    },
    {
      id: "ap-003-s2", planId: "ap-003", title: "Cooling Systems Verification", order: 1,
      createdAt: d("2025-04-01"), updatedAt: d("2025-04-01"),
      items: [
        closedItem("ap-003-s2-i1", "ap-003-s2", 0, "Chilled water loop pressure tests", ["user-013"], "2025-06-30", "2025-06-25", "user-009", "2025-04-01"),
        inProgressItem("ap-003-s2-i2", "ap-003-s2", 1, "CRAC unit and cooling tower performance verification", ["user-013","user-016"], "2025-08-31", "user-009", "2025-04-01", "Design-day heat rejection capacity confirmed at 100% IT load."),
        openItem("ap-003-s2-i3", "ap-003-s2", 2, "PUE verification at 40% and 100% IT load", ["user-013"], "2025-09-20", "user-009", "2025-04-01"),
      ],
    },
    {
      id: "ap-003-s3", planId: "ap-003", title: "Customer Readiness", order: 2,
      createdAt: d("2025-04-01"), updatedAt: d("2025-04-01"),
      items: [
        inProgressItem("ap-003-s3-i1", "ap-003-s3", 0, "DCIM platform integrated and operational", ["user-017"], "2025-09-01", "user-009", "2025-04-01", "All BMS/EPMS data feeds visible in customer portal."),
        openItem("ap-003-s3-i2", "ap-003-s3", 1, "Customer acceptance test sign-off", ["user-009","user-013"], "2025-09-30", "user-009", "2025-04-01", "Signed customer acceptance test certificate on file."),
        openItem("ap-003-s3-i3", "ap-003-s3", 2, "Uptime Institute Tier III certification received", ["user-009"], "2025-09-30", "user-009", "2025-04-01", "Uptime Institute Tier III Operations certificate on file."),
      ],
    },
  ],
};

// Action Plan 4: Chicago Campus UPS Cutover Safety Protocol
const ap004: ActionPlan = {
  id: "ap-004", accountId: "acc-001", projectId: "proj-004", number: 4,
  title: "Chicago Campus - Phase A UPS Live Cutover Protocol",
  typeId: "apt-gate", status: "in_progress", private: false, locationId: null,
  description: "Safety protocol and execution checklist for the Phase A UPS live cutover at Chicago Campus.",
  planManager: "user-016", approvers: ["user-009", "user-013"],
  completedReceivers: ["user-001", "user-009", "user-016"],
  createdBy: "user-016", createdAt: d("2025-10-01"), updatedAt: d("2026-03-10"),
  sections: [
    {
      id: "ap-004-s1", planId: "ap-004", title: "Pre-Cutover Requirements", order: 0,
      createdAt: d("2025-10-01"), updatedAt: d("2025-10-01"),
      items: [
        closedItem("ap-004-s1-i1", "ap-004-s1", 0, "LOTO procedure reviewed and approved by Safety Manager", ["user-016"], "2025-12-31", "2025-12-20", "user-016", "2025-10-01"),
        closedItem("ap-004-s1-i2", "ap-004-s1", 1, "Electrical hot-work permit obtained from ComEd", ["user-013"], "2026-01-31", "2026-01-28", "user-016", "2025-10-01"),
        inProgressItem("ap-004-s1-i3", "ap-004-s1", 2, "Customer maintenance window notification sent", ["user-012","user-009"], "2026-03-31", "user-016", "2025-10-01", "Minimum 30-day advance notice to all colocation customers."),
      ],
    },
    {
      id: "ap-004-s2", planId: "ap-004", title: "Cutover Execution", order: 1,
      createdAt: d("2025-10-01"), updatedAt: d("2025-10-01"),
      items: [
        openItem("ap-004-s2-i1", "ap-004-s2", 0, "Transfer load to new UPS modules (Phase A)", ["user-013","user-012"], "2026-05-15", "user-016", "2025-10-01", "No customer IT load interruption during transfer."),
        openItem("ap-004-s2-i2", "ap-004-s2", 1, "Verify all alarms clear and EPMS readings nominal", ["user-013","user-017"], "2026-05-16", "user-016", "2025-10-01"),
        openItem("ap-004-s2-i3", "ap-004-s2", 2, "Retire legacy UPS modules and close work order", ["user-013"], "2026-06-30", "user-016", "2025-10-01"),
      ],
    },
  ],
};

// Action Plan 5: Portland Campus Pre-Construction Readiness
const ap005: ActionPlan = {
  id: "ap-005", accountId: "acc-001", projectId: "proj-010", number: 5,
  title: "Portland Campus - Pre-Construction Readiness Checklist",
  typeId: "apt-gate", status: "in_progress", private: false, locationId: null,
  description: "Pre-construction readiness checklist for the Portland Campus data center development.",
  planManager: "user-010", approvers: ["user-004", "user-006"],
  completedReceivers: ["user-001", "user-004", "user-010"],
  createdBy: "user-010", createdAt: d("2025-02-01"), updatedAt: d("2026-03-01"),
  sections: [
    {
      id: "ap-005-s1", planId: "ap-005", title: "Land & Site Control", order: 0,
      createdAt: d("2025-02-01"), updatedAt: d("2025-02-01"),
      items: [
        closedItem("ap-005-s1-i1", "ap-005-s1", 0, "Ground lease executed with Intel REIT", ["user-006"], "2025-04-30", "2025-04-22", "user-010", "2025-02-01"),
        closedItem("ap-005-s1-i2", "ap-005-s1", 1, "Geotechnical report approved", ["user-014"], "2025-05-31", "2025-05-28", "user-010", "2025-02-01"),
        inProgressItem("ap-005-s1-i3", "ap-005-s1", 2, "Oregon DSA wetlands delineation complete", ["user-014"], "2026-06-30", "user-010", "2025-02-01"),
      ],
    },
    {
      id: "ap-005-s2", planId: "ap-005", title: "Utility & Power", order: 1,
      createdAt: d("2025-02-01"), updatedAt: d("2025-02-01"),
      items: [
        inProgressItem("ap-005-s2-i1", "ap-005-s2", 0, "PGE 230kV power reservation confirmed", ["user-006"], "2026-06-30", "user-010", "2025-02-01", "Signed power reservation agreement on file."),
        openItem("ap-005-s2-i2", "ap-005-s2", 1, "ERCOT load flow interconnect study submitted", ["user-014"], "2026-09-30", "user-010", "2025-02-01"),
        openItem("ap-005-s2-i3", "ap-005-s2", 2, "Water right application for cooling towers filed", ["user-006"], "2026-12-31", "user-010", "2025-02-01", "Oregon WRD water right certificate on file."),
      ],
    },
    {
      id: "ap-005-s3", planId: "ap-005", title: "Contractor Procurement", order: 2,
      createdAt: d("2025-02-01"), updatedAt: d("2025-02-01"),
      items: [
        inProgressItem("ap-005-s3-i1", "ap-005-s3", 0, "Civil contractor prequalification complete", ["user-010","user-011"], "2026-08-31", "user-010", "2025-02-01"),
        openItem("ap-005-s3-i2", "ap-005-s3", 1, "GMP bid package issued to CMaR shortlist", ["user-010","user-008"], "2026-10-31", "user-010", "2025-02-01"),
        openItem("ap-005-s3-i3", "ap-005-s3", 2, "CMaR contract executed", ["user-008","user-006"], "2027-01-31", "user-010", "2025-02-01", "Executed CMaR contract with GMP on file."),
      ],
    },
  ],
};

export const actionPlans: ActionPlan[] = [ap001, ap002, ap003, ap004, ap005];
