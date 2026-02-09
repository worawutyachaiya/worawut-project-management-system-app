// User types
export interface User {
  ID: number;
  UUID: string;
  EMPLOYEE_CODE: string;
  EMAIL: string;
  FIRST_NAME: string;
  LAST_NAME: string;
  PHONE?: string;
  AVATAR_URL?: string;
  DEPARTMENT_ID?: number;
  STATUS: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  roles?: Role[];
  DEPARTMENT_NAME?: string;
  ROLE_NAME?: string;
}

export interface Role {
  ID: number;
  CODE: string;
  NAME: string;
  LEVEL: number;
}

// Department types
export interface Department {
  ID: number;
  CODE: string;
  NAME: string;
  DESCRIPTION?: string;
  PARENT_ID?: number;
}

// Project types
export interface Project {
  ID: number;
  UUID: string;
  CODE: string;
  NAME: string;
  DESCRIPTION?: string;
  DEPARTMENT_ID: number;
  OWNER_ID: number;
  STATUS: "DRAFT" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
  PRIORITY: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  START_DATE?: string;
  END_DATE?: string;
  PROGRESS: number;
  TASK_COUNT?: number;
  COMPLETED_TASK_COUNT?: number;
  CALCULATED_PROGRESS?: number;
  members?: ProjectMember[];
}

export interface Comment {
  ID: number;
  UUID: string;
  TASK_ID: number;
  PARENT_ID?: number;
  USER_ID: number;
  CONTENT: string;
  IS_SYSTEM: number | boolean;
  CREATE_DATE: string;
  UPDATE_DATE?: string;
  USER_NAME: string;
  USER_AVATAR?: string;
  user?: User;
  replies?: Comment[];
}

export interface TaskFile {
  ID: number;
  UUID: string;
  TASK_ID: number;
  FILE_NAME: string;
  ORIGINAL_NAME?: string;
  FILE_TYPE: string;
  FILE_SIZE?: number;
  MIME_TYPE?: string;
  STORAGE_URL: string;
  THUMBNAIL_URL?: string;
  CATEGORY?: string;
  UPLOADED_BY_NAME?: string;
  CREATE_DATE: string;
}

export interface ProjectMember {
  ID: number;
  USER_ID: number;
  ROLE: "OWNER" | "MANAGER" | "MEMBER" | "VIEWER";
  user?: User;
}

// Task types
export interface Task {
  ID: number;
  UUID: string;
  CODE: string;
  PROJECT_ID: number;
  PARENT_TASK_ID?: number;
  TITLE: string;
  DESCRIPTION?: string;
  STATUS: TaskStatus;
  PRIORITY: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  TASK_TYPE: "TASK" | "BUG" | "FEATURE" | "IMPROVEMENT";
  ESTIMATED_HOURS?: number;
  ACTUAL_HOURS?: number;
  DUE_DATE?: string;
  COMPLETED_DATE?: string;
  TASK_URL?: string;
  assignees?: TaskAssignee[];
  project?: Project;
  approvals?: TaskApproval[];
}

export interface TaskApproval {
  ID: number;
  TASK_ID: number;
  APPROVER_ID: number;
  STATUS: "PENDING" | "APPROVED" | "REJECTED" | "REVISION_REQUESTED";
  COMMENTS?: string;
  DECISION_DATE?: string;
  APPROVER_NAME?: string;
  APPROVER_EMAIL?: string;
}

export type TaskStatus =
  | "DRAFT"
  | "IN_PROGRESS"
  | "PENDING_REVIEW"
  | "REVISION_REQUESTED"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED";

export interface TaskAssignee {
  ID: number;
  USER_ID: number;
  IS_PRIMARY: boolean;
  user?: User;
}

// Approval types
export interface Approval {
  ID: number;
  TASK_ID: number;
  APPROVER_ID: number;
  STATUS: "PENDING" | "APPROVED" | "REJECTED" | "REVISION_REQUESTED";
  COMMENTS?: string;
  DECISION_DATE?: string;
  task?: Task;
  approver?: User;
  TASK_TITLE: string;
  TASK_CODE: string;
  TASK_URL?: string;
  CREATE_DATE: string;
}

// Completion Log types
export interface TaskCompletionLog {
  ID: number;
  TASK_ID: number;
  COMPLETED_DATE: string;
  COMPLETED_BY_ID: number;
  COMPLETED_BY_NAME: string;
  COMPLETED_BY_AVATAR?: string;
  DURATION_HOURS: number;
  SNAPSHOT_DATA: {
    description?: string;
    comments: Comment[];
    files: TaskFile[];
  };
  CREATE_DATE: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  Status: boolean;
  Message: string;
  ResultOnDb: T;
  MethodOnDb: string;
  TotalCountOnDb: number;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  userId: number;
  uuid: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}
