import type { JobRole, ProjectPriority, ProjectStatus, Seniority } from "./types";

export const JOB_ROLES: JobRole[] = [
  "consultant",
  "technical_lead",
  "solution_architect",
  "project_manager",
  "business_analyst",
];

export const SENIORITIES: Seniority[] = [
  "junior",
  "medior",
  "senior",
  "lead",
  "principal",
];

export const PROJECT_STATUSES: ProjectStatus[] = [
  "planned",
  "active",
  "paused",
  "completed",
  "cancelled",
];

export const PROJECT_PRIORITIES: ProjectPriority[] = [
  "low",
  "medium",
  "high",
];

export const DEFAULT_WEEKLY_CAPACITY = 40;

export const PROJECT_TYPES = [
  "audit",
  "implementation",
  "advisory",
  "support",
  "other",
] as const;
