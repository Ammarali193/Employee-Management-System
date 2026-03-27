/**
 * Asset-related constants and enums
 */

export const ASSET_STATUS = {
  AVAILABLE: "Available",
  ASSIGNED: "Assigned",
} as const;

export type AssetStatus = (typeof ASSET_STATUS)[keyof typeof ASSET_STATUS];

/**
 * Maintenance-related constants and enums
 */

export const MAINTENANCE_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
};

export const MAINTENANCE_STATUS_COLORS = {
  pending: "bg-yellow-500 text-white",
  in_progress: "bg-blue-500 text-white",
  completed: "bg-green-500 text-white",
};

/**
 * Payroll-related constants
 */

export const PAYROLL_PERIOD = {
  MONTHLY: "monthly",
  QUARTERLY: "quarterly",
  YEARLY: "yearly",
} as const;

export type PayrollPeriod =
  (typeof PAYROLL_PERIOD)[keyof typeof PAYROLL_PERIOD];

export const SALARY_COMPONENTS = {
  BASIC: "Basic Salary",
  ALLOWANCE: "Allowance",
  BONUS: "Bonus",
  DEDUCTION: "Deduction",
  TAX: "Tax",
} as const;

export type SalaryComponent =
  (typeof SALARY_COMPONENTS)[keyof typeof SALARY_COMPONENTS];

