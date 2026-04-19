/**
 * PROJECT TYPES
 */

import type { USState } from './shared';
import type { ProjectConnection } from '@/data/procoreConnect';

export type ProjectNumber = string; // /^[A-Z]{1,2}\d{4}$/

export type ProjectStatus = 'active' | 'inactive' | 'on_hold' | 'cancelled';

export type ProjectStage =
  | 'conceptual'
  | 'feasibility'
  | 'final_design'
  | 'permitting'
  | 'bidding'
  | 'Pre-Construction'
  | 'course_of_construction'
  | 'Post-Construction'
  | 'handover'
  | 'closeout'
  | 'maintenance';

export type ProjectPriority = 'low' | 'medium' | 'high';

export type WorkScope = 'new_construction' | 'renovation' | 'maintenance' | 'other';

export type ProjectRegion = 'Northeast' | 'Midwest' | 'South' | 'West' | 'Southwest';

export type DeliveryMethod =
  | 'Construction Management at Risk (CMaR)'
  | 'Construction Manager as Agent (Owners Rep)'
  | 'Design-Bid-Build (DBB)'
  | 'Design-Build (DB)'
  | 'Indefinite Delivery, Indefinite Quantity (IDIQ)'
  | 'Integrated Project Delivery'
  | 'Multi-Prime'
  | 'Public-Private-Partnership (P3)'
  | 'Other';

export type ProjectType =
  | 'Capital Improvements'
  | 'CM/GC'
  | 'CMAR'
  | 'Demolition'
  | 'Design-Bid-Build'
  | 'Design-Build'
  | 'DOT'
  | 'EDC'
  | 'Facility (Non-Project)'
  | 'Facility Improvements'
  | 'Flood Hazard Mitigation'
  | 'H.A.'
  | 'JOC'
  | 'Liquid Waste Services'
  | 'N/A'
  | 'P3'
  | 'Renewal'
  | 'Renewal of Existing Buildings and Facilities'
  | 'Repair'
  | 'Sample Project'
  | 'TBD.'
  | 'Transmission'
  | 'Utilities';

export type ProjectSector =
  | 'Assembly > Convention Center'
  | 'Assembly > Entertainment > Amusement Park'
  | 'Assembly > Entertainment > Bowling Alley'
  | 'Assembly > Entertainment > Casino'
  | 'Assembly > Entertainment > Entertainment Production'
  | 'Assembly > Entertainment > Movie Theater'
  | 'Assembly > Entertainment > Performing Arts'
  | 'Assembly > Entertainment > Race Track'
  | 'Assembly > Entertainment > Zoo / Aquarium'
  | 'Assembly > Event Space'
  | 'Assembly > Stadium / Arena'
  | 'Civil & Infrastructure > Energy > Energy Distribution'
  | 'Civil & Infrastructure > Energy > Energy Production'
  | 'Civil & Infrastructure > Energy > Energy Storage'
  | 'Civil & Infrastructure > Telecommunication > Telecommunication Lines'
  | 'Civil & Infrastructure > Transportation > Aviation'
  | 'Civil & Infrastructure > Transportation > Bridges'
  | 'Civil & Infrastructure > Transportation > Miscellaneous Pavement'
  | 'Civil & Infrastructure > Transportation > Parking Garage'
  | 'Civil & Infrastructure > Transportation > Parking Lot'
  | 'Civil & Infrastructure > Transportation > Railways'
  | 'Civil & Infrastructure > Transportation > Roads / Highways'
  | 'Civil & Infrastructure > Transportation > Transportation Terminals'
  | 'Civil & Infrastructure > Transportation > Tunnel'
  | 'Civil & Infrastructure > Waste + Water > Waste Infrastructure'
  | 'Civil & Infrastructure > Waste + Water > Water Infrastructure'
  | 'Commercial > Hospitality > Alcohol Establishment'
  | 'Commercial > Hospitality > Lodging'
  | 'Commercial > Hospitality > Restaurant'
  | 'Commercial > Office'
  | 'Commercial > Retail > Automobile Retail'
  | 'Commercial > Retail > Bank'
  | 'Commercial > Retail > Big Box Store'
  | 'Commercial > Retail > Convenience Store'
  | 'Commercial > Retail > Department Store'
  | 'Commercial > Retail > Grocery Store'
  | 'Commercial > Retail > Personal Service'
  | 'Commercial > Retail > Shopping Center / Mall'
  | 'Commercial > Retail > Specialty Store'
  | 'Industrial > Business Park'
  | 'Industrial > Data Center'
  | 'Industrial > Distribution Warehouse'
  | 'Industrial > Production > Agriculture'
  | 'Industrial > Production > Manufacturing'
  | 'Industrial > Production > Oil, Gas, Mining'
  | 'Industrial > Research + Development'
  | 'Industrial > Storage > Dry Storage'
  | 'Industrial > Storage > Environmentally Controlled'
  | 'Industrial > Storage > Hazardous Storage'
  | 'Industrial > Storage > Self Storage'
  | 'Institutional > Cultural > Death'
  | 'Institutional > Cultural > Library'
  | 'Institutional > Cultural > Museum'
  | 'Institutional > Cultural > Religious Institution'
  | 'Institutional > Educational > College / University'
  | 'Institutional > Educational > Daycare / Pre-K'
  | 'Institutional > Educational > K-12'
  | 'Institutional > Government > Government Buildings'
  | 'Institutional > Government > Military / Naval'
  | 'Institutional > Government > Public Safety'
  | 'Institutional > Health Care > Animal Health / Veterinary'
  | 'Institutional > Health Care > Behavioral Health'
  | 'Institutional > Health Care > Dental'
  | 'Institutional > Health Care > Hospital'
  | 'Institutional > Health Care > Medical Center'
  | 'Institutional > Health Care > Medical Office Building (MOB)'
  | 'Institutional > Health Care > Outpatient Care'
  | 'Institutional > Health Care > Specialist Office'
  | 'Mixed-Use > Office / Retail'
  | 'Mixed-Use > Residential / Office / Retail'
  | 'Mixed-Use > Residential / Retail'
  | 'Recreation > Indoor > Gym / Athletic Studio'
  | 'Recreation > Indoor > Pool / Swim Facility'
  | 'Recreation > Indoor > Sports Courts'
  | 'Recreation > Outdoor > Golf'
  | 'Recreation > Outdoor > Park'
  | 'Recreation > Outdoor > Playground'
  | 'Recreation > Outdoor > Pool / Swim Facility'
  | 'Recreation > Outdoor > Sports Courts'
  | 'Recreation > Outdoor > Sports Fields'
  | 'Recreation > Outdoor > Winter Sports'
  | 'Residential > Multifamily'
  | 'Residential > Senior Housing'
  | 'Residential > Single Family'
  | 'Residential > Student Housing'
  | 'Residential > Trailer Park';

export interface Project {
  id: string;
  number: ProjectNumber;
  name: string;
  stage: ProjectStage;
  status: ProjectStatus;
  program: null;
  estimatedBudget: number;
  priority: ProjectPriority;
  scope: WorkScope;
  sector: ProjectSector;
  delivery: DeliveryMethod;
  type: ProjectType;
  region: ProjectRegion;
  country: string;
  city: string;
  state: USState;
  zip: string;
  address: string;
  latitude: number;
  longitude: number;
  favorite: boolean;
  photo: string | null;
  startDate: Date;
  endDate: Date;
  description: string;
  /** Procore Connect — populated when this project is linked to an upstream GC project. */
  procoreConnect?: ProjectConnection;
}
