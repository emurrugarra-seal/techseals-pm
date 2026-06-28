export type UserRole = "admin" | "consultant";

export type JobRole =
  | "consultant"
  | "technical_lead"
  | "solution_architect"
  | "project_manager"
  | "business_analyst";

export type Seniority =
  | "junior"
  | "medior"
  | "senior"
  | "lead"
  | "principal";

export type ProjectStatus =
  | "planned"
  | "active"
  | "paused"
  | "completed"
  | "cancelled";

export type ProjectPriority = "low" | "medium" | "high";

export interface UserProfile {
  email: string;
  role: UserRole;
  consultantId?: string;
  displayName?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Consultant {
  id: string;
  name: string;
  email: string;
  jobRole: JobRole;
  seniority: Seniority;
  weeklyCapacityHours: number;
  active: boolean;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  actualEndDate?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  projectType?: string;
  leadConsultantId?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentSegment {
  id: string;
  startDate: string;
  endDate: string;
  hoursPerWeek?: number;
  totalHours?: number;
}

export interface Assignment {
  id: string;
  projectId: string;
  consultantId: string;
  segments: AssignmentSegment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateConsultantInput {
  name: string;
  email: string;
  password: string;
  jobRole: JobRole;
  seniority: Seniority;
  weeklyCapacityHours: number;
}
