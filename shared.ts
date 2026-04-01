/**
 * SHARED TYPES
 * Common types shared across multiple data models.
 */

/**
 * US STATE
 * Full list of US states and DC.
 * Used by Project and Office.
 */
type USState =
  | 'Alabama' | 'Alaska' | 'Arizona' | 'Arkansas' | 'California'
  | 'Colorado' | 'Connecticut' | 'Delaware' | 'Florida' | 'Georgia'
  | 'Hawaii' | 'Idaho' | 'Illinois' | 'Indiana' | 'Iowa'
  | 'Kansas' | 'Kentucky' | 'Louisiana' | 'Maine' | 'Maryland'
  | 'Massachusetts' | 'Michigan' | 'Minnesota' | 'Mississippi' | 'Missouri'
  | 'Montana' | 'Nebraska' | 'Nevada' | 'New Hampshire' | 'New Jersey'
  | 'New Mexico' | 'New York' | 'North Carolina' | 'North Dakota' | 'Ohio'
  | 'Oklahoma' | 'Oregon' | 'Pennsylvania' | 'Rhode Island' | 'South Carolina'
  | 'South Dakota' | 'Tennessee' | 'Texas' | 'Utah' | 'Vermont'
  | 'Virginia' | 'Washington' | 'West Virginia' | 'Wisconsin' | 'Wyoming'
  | 'District of Columbia';

// =============================================================================
// WORK BREAKDOWN STRUCTURE (WBS)
// =============================================================================

/**
 * WBS SEGMENT TYPE
 * The three segments of the WBS classification system.
 * Each segment shares the same structure but serves a different purpose.
 *
 * Cost Code  — categorizes work by type of construction activity.
 *              Used by: Budget, Schedule
 * Cost Type  — categorizes costs by financial classification (e.g. labor, materials).
 *              Used by: Budget only
 * Program    — categorizes costs by program or funding source grouping.
 *              Used by: Budget only
 */
type WBSSegmentType = 'cost_code' | 'cost_type' | 'program';

/**
 * WBS ITEM
 * A single node in a WBS segment hierarchy.
 * All three segments (Cost Code, Cost Type, Program) share this same structure.
 *
 * The code is hierarchical — its structure reflects the level of the item:
 *   1.0     → Phase        (e.g. PRE-DEVELOPMENT & SOFT COSTS)
 *   1.1     → Category     (e.g. HARD COSTS)
 *   1.1.1   → Sub-category (e.g. Site Work)
 *
 * Codes are unique within an account + segment type combination.
 */
interface WBSItem {
  id: string;                  // Unique identifier
  accountId: string;           // Account this WBS item belongs to
  segment: WBSSegmentType;     // Which WBS segment this item belongs to
  code: string;                // Hierarchical alphanumeric code (e.g. '1.0', '1.1', '1.1.1')
  description: string;         // Human-readable label (e.g. 'PRE-DEVELOPMENT & SOFT COSTS')
  status: WBSStatus;           // active | inactive — active by default
  createdAt: Date;
  updatedAt: Date;
}

/**
 * WBS STATUS
 * Indicates whether a WBS code is available for use.
 * Inactive codes are hidden from dropdowns but retained for historical data.
 */
type WBSStatus = 'active' | 'inactive';

/**
 * WBS COST CODE
 * Convenience type — a WBSItem scoped to the cost_code segment.
 * Used by both Budget and Schedule.
 */
type WBSCostCode = WBSItem & { segment: 'cost_code' };

/**
 * WBS COST TYPE
 * Convenience type — a WBSItem scoped to the cost_type segment.
 * Used by Budget only.
 */
type WBSCostType = WBSItem & { segment: 'cost_type' };

/**
 * WBS PROGRAM
 * Convenience type — a WBSItem scoped to the program segment.
 * Used by Budget only.
 */
type WBSProgram = WBSItem & { segment: 'program' };
