/**
 * ACCOUNT
 * Represents a top-level organization or company within the platform.
 */

import type { USState } from './shared';
import type { AccountHealthConfig, RiskType } from './health';

export interface ConnectedAccount {
  id: string;
  companyName: string;
  contactEmail: string;
  shareLevel: 'summary' | 'detail';
  connectedAt: Date;
  lastSyncedAt: Date | null;
  status: 'active' | 'pending' | 'disconnected';
}

export interface Account {
  id: string;
  companyName: string;
  logo: string | null;
  timeZone: string;
  office: Office;
  hasGovernmentContracts: boolean;
  healthConfig: AccountHealthConfig;
  /** Account-level Risk Type templates. Procore ships defaults; customers can add/edit. */
  riskTypes: RiskType[];
  /** Procore Connect — GC accounts sharing health data with this owner account */
  connectedAccounts: ConnectedAccount[];
}

export interface Office {
  name: string;
  address: string;
  city: string;
  state: USState;
  zip: string;
  country: string;
}
