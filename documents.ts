import type { ToolLevel, ToolCoreActions, ToolSubPages } from './index';

/**
 * DOCUMENTS
 * A file management tool available at both portfolio and project levels.
 * Supports typed document uploads, tagging, and version history.
 * Portfolio level aggregates documents across all projects.
 */

// =============================================================================
// DOCUMENT
// =============================================================================

/**
 * DOCUMENT
 * Represents a single uploaded file within the Documents tool.
 */
interface Document {
  id: string;                        // Unique identifier
  accountId: string;                 // Account this document belongs to
  projectId: string | null;          // Project the document was uploaded in; null if portfolio-level
  title: string;                     // File name / display title
  type: DocumentType;                // DOC | DR | IMG | MD | SP
  format: DocumentFormat;            // PDF | GIF | JPEG | PNG
  size: number;                      // File size in bytes
  status: DocumentStatus;            // Approved | In Review | Open | Rejected
  dateAuthored: Date;                // Date the document was authored
  authoredBy: string;                // User ID of the person who created the document
  assignees: string[];               // User IDs assigned to the document for review
  version: number;                   // Version number (1 = v1, 2 = v2, etc.)
  description: string | null;        // Optional short description of the document
  url: string;                       // Storage URL for the file
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// DOCUMENT TYPE
// =============================================================================

/**
 * DOCUMENT TYPE
 * Classifies the document by its content category.
 * Displayed as a dropdown on upload.
 */
type DocumentType =
  | 'DOC'    // Document
  | 'DR'     // Drawing
  | 'IMG'    // Image
  | 'MD'     // Model
  | 'SP';    // Specification

// =============================================================================
// DOCUMENT FORMAT
// =============================================================================

/**
 * DOCUMENT FORMAT
 * The file format of the uploaded document.
 */
type DocumentFormat =
  // Images
  | 'GIF'
  | 'JPEG'
  | 'PNG'
  // Documents
  | 'PDF'
  | 'DOCX'
  | 'XLSX'
  | 'PPTX'
  | 'TXT'
  // CAD / BIM
  | 'DWG'
  | 'DXF'
  | 'RVT'
  | 'IFC'
  | 'NWD'
  // Other
  | 'ZIP'
  | 'CSV';

// =============================================================================
// DOCUMENT STATUS
// =============================================================================

/**
 * DOCUMENT STATUS
 * The state of a document as it moves through the approval workflow.
 * Drives Open Items / Closed Items sub-page filtering.
 *
 * open       → newly uploaded, no action taken
 * in_review  → assigned and under review
 * approved   → reviewed and approved
 * rejected   → reviewed and rejected
 */
type DocumentStatus =
  | 'open'
  | 'in_review'
  | 'approved'
  | 'rejected';

// =============================================================================
// DOCUMENTS TOOL DEFINITION
// =============================================================================

/**
 * DOCUMENTS TOOL
 * The tool definition for Documents, implementing the shared Tool base interface.
 * Note: core action is Upload (not Create) — replaces the standard Create action.
 */
interface DocumentsTool {
  key: 'documents';
  name: 'Documents';
  level: Extract<ToolLevel, 'both'>;
  description: 'Centralized file management for storing, organizing, and versioning project and portfolio documents. Supports typed uploads with approval workflow and full version history.';
  coreActions: DocumentsCoreActions;
  subPages: ToolSubPages;
}

/**
 * DOCUMENTS CORE ACTIONS
 * Extends the base ToolCoreActions, replacing 'create' with 'upload'.
 */
interface DocumentsCoreActions extends Omit<ToolCoreActions, 'create'> {
  upload: {
    label: 'Upload';                 // Button label shown in the UI
    description: 'Upload one or more files to the Documents tool.';
  };
}
