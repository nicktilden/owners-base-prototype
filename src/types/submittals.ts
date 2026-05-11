/**
 * SUBMITTAL TYPES
 */

export type SubmittalType =
  | 'As-Built'
  | 'Asset Management'
  | 'Certification'
  | 'Design'
  | 'Document'
  | 'Inspection'
  | 'Inventory'
  | 'Mix Design'
  | 'Other'
  | 'Plans'
  | 'Procurement'
  | 'Safety'
  | 'Shop Drawings'
  | 'Warranty';

export type SubmittalStatus =
  | 'Closed'
  | 'Draft'
  | 'Open'
  | 'Operations';

export interface Submittal {
  id: string;
  accountId: string;
  projectId: string;

  number: number;
  revision: number;               // sequential; starts at 0, increments on resubmission
  title: string;
  type: SubmittalType;
  status: SubmittalStatus;

  // Specs linkage
  specsSection: string | null;    // e.g. "033000 - Cast-In-Place Concrete"

  // Parties
  responsibleContractorId: string | null;   // company / GC name
  submitBy: string | null;        // user ID
  receivedFrom: string | null;    // user ID
  ballInCourt: string | null;     // user ID
  approvers: string[];            // array of user IDs

  // Dates
  receivedDate: string | null;    // ISO date
  sentDate: string | null;
  returnDate: string | null;
  finalDueDate: string | null;
  distributedDate: string | null;

  // Response / review
  response: string | null;        // reviewer response text

  // Location & logistics
  location: string | null;
  leadTimeDays: number | null;

  // Linked records
  scheduleTaskId: string | null;  // linked schedule item ID
  costCode: string | null;        // WBS cost code
  drawingIds: string[];           // linked drawing IDs

  // Content
  description: string;

  // Supply-chain fields (used by Health & Risk engine)
  criticalPath: boolean;
  fabricationStartDate: string | null;   // ISO date
  expectedDeliveryDate: string | null;   // ISO date

  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
