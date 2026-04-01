import type { USState } from './shared';

/**
 * ACCOUNT
 * Represents a top-level organization or company within the platform.
 * Accounts own Projects and Users. All data is scoped to an Account.
 */
interface Account {
  id: string;                  // Unique identifier
  companyName: string;         // Legal or display name of the company
  logo: string | null;         // URL to company logo image; null until uploaded
  timeZone: string;            // IANA time zone identifier (e.g. 'America/New_York')
  office: Office;              // Primary office location
}

/**
 * OFFICE
 * The primary office location associated with an Account.
 */
interface Office {
  name: string;                // Office name (e.g. 'Headquarters', 'Main Office')
  address: string;             // Street address
  city: string;                // City
  state: USState;              // US state — from shared.ts
  zip: string;                 // ZIP code
  country: string;             // Country; defaults to 'United States'
}
