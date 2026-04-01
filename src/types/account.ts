/**
 * ACCOUNT
 * Represents a top-level organization or company within the platform.
 */

import type { USState } from './shared';

export interface Account {
  id: string;
  companyName: string;
  logo: string | null;
  timeZone: string;
  office: Office;
}

export interface Office {
  name: string;
  address: string;
  city: string;
  state: USState;
  zip: string;
  country: string;
}
