/**
 * PRIME CONTRACT TYPES
 */

export type PrimeContractStatus =
  | 'Draft'
  | 'Out for Bid'
  | 'Out for Signature'
  | 'Approved'
  | 'Complete'
  | 'Terminated';

export interface ScheduleOfValuesLineItem {
  id: string;
  primeContractId: string;
  budgetCode: string;              // links to WBS / budget code
  description: string;
  amount: number;                  // dollars
  billedToDate: number;            // dollars — sourced from invoices
  // amountRemaining = amount - billedToDate (computed at runtime)
}

export interface PrimeContract {
  id: string;
  accountId: string;
  projectId: string;

  // Core fields
  contractNumber: string;
  title: string;
  status: PrimeContractStatus;
  description: string;

  // Parties
  client: string;                  // company name
  contractor: string;              // company name
  architectEngineer: string | null; // user name / company

  // Flags
  signedWithDocuSign: boolean;
  executed: boolean;
  contractPrivacy: boolean;

  // Financial
  defaultRetainagePercent: number; // e.g. 10 for 10%

  // Dates
  startDate: string | null;               // ISO date
  estimatedCompletionDate: string | null;
  substantialCompletionDate: string | null;
  actualCompletionDate: string | null;
  signedContractReceivedDate: string | null;
  contractTerminationDate: string | null;

  // Access control
  accessForNonAdminUsers: string[];        // array of user IDs

  // Related records
  scheduleOfValues: ScheduleOfValuesLineItem[];
  fundingSourceIds: string[];              // links to FundingSource records

  // Rich text
  inclusions: string;
  exclusions: string;

  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
