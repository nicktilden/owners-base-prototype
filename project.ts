import type { USState } from './shared';

/**
 * PROJECT
 * Represents a single construction project within a portfolio.
 * Projects belong to one Account and can be filtered by various project attributes such as program,
 * region, and stage. Visibility is determined by the user permissions for each project.
 */
interface Project {
  id: string;                  // Unique identifier - 7 character alphanumeric string
  number: ProjectNumber;       // Should be unique, auto-generated, and follow the composite key format below
  name: string;                // Display name
  stage: ProjectStage;         // Current stage of the project
  status: ProjectStatus;       // active | inactive | on_hold | cancelled
  program: null;                // Grouping attribute (not a navigation level) — reserved for future use
  estimatedbudget: number;     // High-level budget estimate in USD
  priority: ProjectPriority;    // User-set priority: low | medium | high
  scope: WorkScope;            // New Construction | Renovation | Maintenance | Other
  sector: ProjectSector;       // Tiered sector classification (e.g. Assembly > Entertainment > Casino)
  delivery: DeliveryMethod;     // e.g. Design-Build (DB) | Construction Management at Risk (CMaR) | Other
  type: ProjectType;            // Institutional | Commercial | Industrial | Residential | Other
  region: ProjectRegion;       // Northeast | Midwest | South | West | Southwest
  country: string;             // Defaults to 'United States'
  city: string;                // City of the project
  state: USState;              // US state of the project
  zip: string;                 // Zip code of the project
  address: string;             // Address of the project
  latitude: number;            // Latitude of the project
  longitude: number;           // Longitude of the project
  favorite: boolean;            // True or false if a project has been favorited by the user
  photo: string | null;         // null until the user uploads a photo
  startDate: Date;             // Start date of the project
  endDate: Date;                // End date of the project
  description: string;          // Description of the project
  // ...
}

/**
 * PROJECT NUMBER
 * Format: {RegionCode}{SequentialNumber}
 *
 * Segments:
 *   RegionCode      — 1–2 char uppercase abbreviation derived from project.region
 *                     NE = Northeast, MW = Midwest, S = South, W = West, SW = Southwest
 *   SequentialNumber — 4-digit zero-padded integer, auto-increments per account
 *                     Starts at 1001. Never reused, even if project is deleted.
 *
 * Examples: NE1001, MW1002, S1003, W1004, SW1005
 * Uniqueness: guaranteed within an Account
 * Generation: derived at create time, read-only after
 */
type ProjectNumber = string; // Validated against /^[A-Z]{1,2}\d{4}$/

/**
 * PROJECT STATUS
 * Drives status badge color and filtering in the ProjectListCard.
 * Displayed as a dropdown on create/edit.
 */
type ProjectStatus =
  | 'active'
  | 'inactive'
  | 'on_hold'
  | 'cancelled';

/**
 * PROJECT STAGE
 * Drives stage badge color and filtering in the ProjectListCard.
 * Displayed as a dropdown on create/edit.
 */
type ProjectStage =
  | 'conceptual'
  | 'feasibility'
  | 'final_design'
  | 'permitting'
  | 'bidding'
  | 'pre-construction'
  | 'course_of_construction'
  | 'post-construction'
  | 'handover'
  | 'closeout'
  | 'maintenance';


/**
 * PROJECT PRIORITY
 * A user set priority for the project.
 * Displayed as a dropdown on create/edit.
 */
type ProjectPriority =
  | 'low'
  | 'medium'
  | 'high';


/**
 * WORK SCOPE
 * Describes the nature of the construction work.
 * Displayed as a dropdown on create/edit.
 */
type WorkScope =
  | 'new_construction'
  | 'renovation'
  | 'maintenance'
  | 'other';

// USState is defined in shared.ts

/**
 * PROJECT SECTOR
 * Tiered sector classification for the project.
 * Displayed as a cascading three-tier select on create/edit.
 *
 * Tier 1 → Tier 2 → Tier 3 (leaf values stored)
 *
 * Assembly
 *   Convention Center
 *   Entertainment → Amusement Park | Bowling Alley | Casino | Entertainment Production
 *                   Movie Theater | Performing Arts | Race Track | Zoo / Aquarium
 *   Event Space
 *   Stadium / Arena
 *
 * Civil & Infrastructure
 *   Energy       → Energy Distribution | Energy Production | Energy Storage
 *   Telecommunication → Telecommunication Lines
 *   Transportation → Aviation | Bridges | Miscellaneous Pavement | Parking Garage
 *                    Parking Lot | Railways | Roads / Highways | Transportation Terminals | Tunnel
 *   Waste + Water → Waste Infrastructure | Water Infrastructure
 *
 * Commercial
 *   Hospitality  → Alcohol Establishment | Lodging | Restaurant
 *   Office
 *   Retail       → Automobile Retail | Bank | Big Box Store | Convenience Store
 *                  Department Store | Grocery Store | Personal Service
 *                  Shopping Center / Mall | Specialty Store
 *
 * Industrial
 *   Business Park
 *   Data Center
 *   Distribution Warehouse
 *   Production   → Agriculture | Manufacturing | Oil, Gas, Mining
 *   Research + Development
 *   Storage      → Dry Storage | Environmentally Controlled | Hazardous Storage | Self Storage
 *
 * Institutional
 *   Cultural     → Death | Library | Museum | Religious Institution
 *   Educational  → College / University | Daycare / Pre-K | K-12
 *   Government   → Government Buildings | Military / Naval | Public Safety
 *   Health Care  → Animal Health / Veterinary | Behavioral Health | Dental | Hospital
 *                  Medical Center | Medical Office Building (MOB) | Outpatient Care | Specialist Office
 *
 * Mixed-Use
 *   Office / Retail
 *   Residential / Office / Retail
 *   Residential / Retail
 *
 * Recreation
 *   Indoor       → Gym / Athletic Studio | Pool / Swim Facility | Sports Courts
 *   Outdoor      → Golf | Park | Playground | Pool / Swim Facility
 *                  Sports Courts | Sports Fields | Winter Sports
 *
 * Residential
 *   Multifamily
 *   Senior Housing
 *   Single Family
 *   Student Housing
 *   Trailer Park
 */
type ProjectSector =
  // Assembly
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
  // Civil & Infrastructure
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
  // Commercial
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
  // Industrial
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
  // Institutional
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
  // Mixed-Use
  | 'Mixed-Use > Office / Retail'
  | 'Mixed-Use > Residential / Office / Retail'
  | 'Mixed-Use > Residential / Retail'
  // Recreation
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
  // Residential
  | 'Residential > Multifamily'
  | 'Residential > Senior Housing'
  | 'Residential > Single Family'
  | 'Residential > Student Housing'
  | 'Residential > Trailer Park';

/**
 * DELIVERY METHOD
 * The contractual method used to deliver the project.
 * Displayed as a dropdown on create/edit.
 */
type DeliveryMethod =
  | 'Construction Management at Risk (CMaR)'   // A single construction manager assumes financial liability for the project
  | 'Construction Manager as Agent (Owners Rep)' // The construction manager, hired by the owner, secures vendors for the actual construction work
  | 'Design-Bid-Build (DBB)'                   // The design team and general contractor have separate contracts directly with the owner
  | 'Design-Build (DB)'                        // A single entity is responsible for both the design and build under one contract
  | 'Indefinite Delivery, Indefinite Quantity (IDIQ)' // A contract of specified duration, with exact delivery costs not finalized
  | 'Integrated Project Delivery'              // All entities in the design and build phases share one multi-party contract
  | 'Multi-Prime'                              // Owner contracts with project vendors directly
  | 'Public-Private-Partnership (P3)'          // Project involves both public and private entities
  | 'Other';

/**
 * PROJECT TYPE
 * Classifies the project by procurement or program type.
 * Displayed as a dropdown on create/edit.
 */
type ProjectType =
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

/**
 * PROJECT REGION
 * Geographic region of the project within the portfolio.
 * Drives the RegionCode prefix in ProjectNumber.
 * Displayed as a dropdown on create/edit.
 */
type ProjectRegion =
  | 'Northeast'
  | 'Midwest'
  | 'South'
  | 'West'
  | 'Southwest';