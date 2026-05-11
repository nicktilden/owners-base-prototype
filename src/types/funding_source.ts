/**
 * FUNDING SOURCE TYPES
 */

export interface FundingSource {
  id: string;
  accountId: string;
  projectId: string;

  name: string;
  number: string;          // formatted funding number, e.g. "FS-001"
  totalAmount: number;     // dollars
  description: string;

  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
