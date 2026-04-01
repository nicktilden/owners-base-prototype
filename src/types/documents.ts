/**
 * DOCUMENTS TYPES
 */

export type DocumentType = 'DOC' | 'DR' | 'IMG';
export type DocumentFormat = 'pdf' | 'docx' | 'xlsx' | 'png' | 'jpg' | 'dwg' | 'other';
export type DocumentStatus = 'draft' | 'in_review' | 'approved' | 'rejected' | 'superseded';

export interface Document {
  id: string;
  accountId: string;
  projectId: string;
  type: DocumentType;
  format: DocumentFormat;
  status: DocumentStatus;
  title: string;
  description: string | null;
  fileUrl: string;
  fileSize: number;
  version: number;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}
