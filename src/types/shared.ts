/**
 * SHARED TYPES
 */

export type USState =
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

export type WBSSegmentType = 'cost_code' | 'cost_type' | 'program';

export interface WBSItem {
  id: string;
  accountId: string;
  segment: WBSSegmentType;
  code: string;
  description: string;
  status: WBSStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type WBSStatus = 'active' | 'inactive';
export type WBSCostCode = WBSItem & { segment: 'cost_code' };
export type WBSCostType = WBSItem & { segment: 'cost_type' };
export type WBSProgram = WBSItem & { segment: 'program' };
