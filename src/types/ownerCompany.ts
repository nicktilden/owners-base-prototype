/**
 * OWNER COMPANY TYPE
 * Lightweight representation of an owner/client company for demo switching.
 * Distinct from Account (which carries health config, office, etc.).
 */

export interface OwnerCompany {
  id: string;
  name: string;
  logo: string | null;
}
