/**
 * TASKS TYPES
 */

export type TaskStatus =
  | 'initiated'
  | 'in_progress'
  | 'ready_for_review'
  | 'closed'
  | 'void';

export type TaskCategory =
  | 'Administrative'
  | 'Closeout'
  | 'Contract'
  | 'Design'
  | 'Design - Drainage'
  | 'Design - Management'
  | 'Design - Roadway'
  | 'Design - Structures'
  | 'Design - Survey'
  | 'Design - Utilities'
  | 'Equipment'
  | 'Inspector'
  | 'Miscellaneous'
  | 'Preconstruction'
  | 'Utility Coordination';

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface Task {
  id: string;
  accountId: string;
  projectId: string | null;
  number: number;
  title: string;
  status: TaskStatus;
  category: TaskCategory | null;
  assignees: string[];
  dueDate: Date | null;
  distributionList: string[];
  private: boolean;
  description: string | null;
  attachments: TaskAttachment[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
