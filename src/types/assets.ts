/**
 * ASSETS TYPES
 */

export type AssetType = 'equipment' | 'vehicle' | 'tool' | 'material' | 'fixture' | 'system' | 'other';
export type AssetTrade = 'general' | 'electrical' | 'mechanical' | 'plumbing' | 'hvac' | 'civil' | 'structural' | 'other';
export type AssetStatus = 'active' | 'inactive' | 'in_maintenance' | 'retired' | 'disposed';
export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

export interface Asset {
  id: string;
  assetCode: string;
  accountId: string;
  projectId: string;
  name: string;
  type: AssetType;
  trade: AssetTrade;
  status: AssetStatus;
  condition: AssetCondition;
  serialNumber: string | null;
  manufacturer: string | null;
  model: string | null;
  installDate: Date | null;
  warrantyExpiry: Date | null;
  description: string | null;
  imageUrl: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
