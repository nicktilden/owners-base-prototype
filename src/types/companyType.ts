/**
 * COMPANY TYPE
 * Defines the 10 supported industry verticals for the company switcher.
 * The active type is stored in localStorage under 'owner_prototype_company_type'.
 */

export type CompanyType =
  | 'multiFamilyResidential'
  | 'retail'
  | 'office'
  | 'dataCenter'
  | 'healthcare'
  | 'utilities'
  | 'education'
  | 'renewables'
  | 'airports'
  | 'corporateRealEstate';

export const COMPANY_TYPE_KEYS: CompanyType[] = [
  'multiFamilyResidential',
  'retail',
  'office',
  'dataCenter',
  'healthcare',
  'utilities',
  'education',
  'renewables',
  'airports',
  'corporateRealEstate',
];

export interface CompanyTypeConfig {
  key: CompanyType;
  label: string;
  accountName: string;
  industry: string;
  sector: 'Public' | 'Private' | 'Public and Private';
  ownerType: string;
  timeZone: string;
  office: { city: string; state: string };
  primarySectors: string[];
  deliveryMethods: string[];
  projectTypes: string[];
  regions: string[];
  stageDistribution: string;
  budgetRange: { min: number; max: number };
  emailDomain: string;
}
