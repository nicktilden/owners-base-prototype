import type { ToolLevel, ToolCoreActions, ToolSubPages } from './index';

/**
 * ASSETS
 * A tool for tracking physical assets across a project or portfolio.
 * Available at both portfolio and project levels.
 * Portfolio level aggregates assets across all projects.
 */

// =============================================================================
// ASSET
// =============================================================================

/**
 * ASSET
 * Represents a single physical asset tracked within the Assets tool.
 */
interface Asset {
  id: string;                          // Unique identifier
  accountId: string;                   // Account this asset belongs to
  projectId: string | null;            // Project this asset belongs to; null if portfolio-level
  photo: string | null;                // URL to asset photo; null until uploaded
  type: AssetType;                     // Tiered asset type classification
  trade: AssetTrade;                   // Trade associated with the asset
  name: string;                        // Display name of the asset
  code: string;                        // Unique alphanumeric asset code
  status: AssetStatus;                 // Current lifecycle status of the asset
  description: string | null;          // Optional short description
  federalAssetId: string;              // Federal Asset ID (required)
  warrantyExpirationDate: Date;        // Warranty expiration date (required)
  conditionAtInstall: AssetCondition | null; // Condition when the asset was installed
  createdBy: string;                   // User ID of the creator
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// ASSET TYPE
// =============================================================================

/**
 * ASSET TYPE
 * Tiered classification for the asset.
 * Stored as a path string: 'Tier1 > Tier2'
 *
 * Flow Control
 *   Magnetic Flow Meter (Digital)
 *
 * Generator
 *   Diesel Standby Generator
 *
 * Pumps
 *   Submersible Grinder Pump
 *
 * Elevators
 *   Service
 *   Passenger
 *
 * HVAC Systems
 *   Ducted
 *   Ductless
 */
type AssetType =
  // Flow Control
  | 'Flow Control > Magnetic Flow Meter (Digital)'
  // Generator
  | 'Generator > Diesel Standby Generator'
  // Pumps
  | 'Pumps > Submersible Grinder Pump'
  // Elevators
  | 'Elevators > Service'
  | 'Elevators > Passenger'
  // HVAC Systems
  | 'HVAC Systems > Ducted'
  | 'HVAC Systems > Ductless';

// =============================================================================
// ASSET TRADE
// =============================================================================

/**
 * ASSET TRADE
 * The trade or discipline associated with the asset.
 * Displayed as a searchable dropdown on create/edit.
 */
type AssetTrade =
  | 'ACT'
  | 'Architect'
  | 'Casework'
  | 'Casework/Paint'
  | 'Civil Drafters'
  | 'Civil Engineering Technologists and Technicians'
  | 'Cleaning'
  | 'Communications'
  | 'Concrete'
  | 'Consultant'
  | 'Cost Estimators'
  | 'Design'
  | 'Doors/Frames'
  | 'Drywall'
  | 'Earthwork'
  | 'Electrical'
  | 'Environmental Engineers'
  | 'Final Clean'
  | 'Fire Suppression'
  | 'Flooring'
  | 'Framing'
  | 'General Contractor'
  | 'Glass/Glazing'
  | 'Glazing'
  | 'Gypsum Board'
  | 'HVAC'
  | 'HVAC/Paint'
  | 'HVAC/Plumbing'
  | 'Industrial Engineers'
  | 'Material and Supplies Dealers'
  | 'Mechanical'
  | 'Mechanical Engineers'
  | 'Metal Plates'
  | 'Operations'
  | 'Paint'
  | 'Pile Driver Operators'
  | 'Plumbing'
  | 'Prequalified'
  | 'Security'
  | 'Signage'
  | 'Specialties'
  | 'Steel'
  | 'Structural'
  | 'Surveyors'
  | 'Temporary Services'
  | 'Utilities'
  | 'Wind. Trt.';

// =============================================================================
// ASSET STATUS
// =============================================================================

/**
 * ASSET STATUS
 * Lifecycle status of the asset from planning through decommission.
 * Drives Open Items / Closed Items sub-page filtering.
 *
 * Open:    planned | in_design | in_warehouse | arrived_on_site | installed
 *          pre_startup | commissioned | ready_for_handover | active | under_maintenance
 * Closed:  inactive_not_in_use | inactive_replaced
 */
type AssetStatus =
  | 'planned'                // Asset is planned but not yet in design
  | 'in_design'              // Asset is being designed
  | 'in_warehouse'           // Asset has been procured and is in a warehouse
  | 'arrived_on_site'        // Asset has arrived at the job site
  | 'installed'              // Asset has been physically installed
  | 'pre_startup'            // Asset is installed, awaiting startup checks
  | 'commissioned'           // Asset has been commissioned and tested
  | 'ready_for_handover'     // Asset is ready to be handed over to the owner
  | 'active'                 // Asset is in active use
  | 'under_maintenance'      // Asset is temporarily out of service for maintenance
  | 'inactive_not_in_use'    // Asset is no longer in use
  | 'inactive_replaced';     // Asset has been replaced by another asset

// =============================================================================
// ASSET CONDITION
// =============================================================================

/**
 * ASSET CONDITION
 * The physical condition of the asset at the time of installation.
 */
type AssetCondition =
  | 'Excellent'
  | 'Acceptable'
  | 'Deficiency Noted';

// =============================================================================
// ASSETS TOOL DEFINITION
// =============================================================================

/**
 * ASSETS TOOL
 * The tool definition for Assets, implementing the shared Tool base interface.
 */
interface AssetsTool {
  key: 'assets';
  name: 'Assets';
  level: Extract<ToolLevel, 'both'>;
  description: 'Physical asset tracking tool for managing the full lifecycle of equipment and systems across a project or portfolio. Tracks type, trade, status, warranty, and condition from planning through decommission.';
  coreActions: ToolCoreActions;
  subPages: ToolSubPages;
}
