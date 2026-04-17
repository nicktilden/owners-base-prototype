/**
 * RFI TYPES
 *
 * Mirrors the Procore RFI tool data model.
 * RFI Stage is derived from the parent project's stage.
 * Specification references the project's spec section catalog.
 */

import type { ProjectStage } from './project';

// ─── Status ──────────────────────────────────────────────────────────────────

export type RfiStatus = 'Draft' | 'Open' | 'Closed' | 'Closed - Revised' | 'Closed - Draft';

// ─── Impact fields ───────────────────────────────────────────────────────────

export interface RfiCostImpact {
  hasImpact: boolean;
  amount: number | null;
}

export interface RfiScheduleImpact {
  hasImpact: boolean;
  days: number | null;
}

// ─── Attachments & Responses ─────────────────────────────────────────────────

export interface RfiAttachment {
  id: string;
  filename: string;
  url: string;
}

export interface RfiResponse {
  id: string;
  author: string;
  date: string;
  body: string;
  attachments: RfiAttachment[];
  isOfficial: boolean;
}

// ─── RFI Record ──────────────────────────────────────────────────────────────

export interface Rfi {
  id: string;
  accountId: string;
  projectId: string;
  number: number;
  subject: string;
  status: RfiStatus;
  /** Derived from the parent project's stage at the time of display. */
  stage: ProjectStage | null;

  question: string;
  attachments: RfiAttachment[];
  responses: RfiResponse[];

  rfiManager: string | null;
  receivedFrom: string | null;
  assignees: string[];
  distributionList: string[];
  ballInCourt: string | null;
  responsibleContractor: string | null;

  /** CSI MasterFormat specification section code, e.g. "033000". */
  specificationSectionId: string | null;
  location: string | null;
  drawingNumber: string | null;
  costCode: string | null;
  subJob: string | null;
  reference: string | null;

  costImpact: RfiCostImpact;
  scheduleImpact: RfiScheduleImpact;

  private: boolean;

  dueDate: string | null;
  closedDate: string | null;
  dateInitiated: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
