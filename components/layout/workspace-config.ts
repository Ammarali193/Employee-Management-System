export type Tone = "teal" | "amber" | "slate";

export type Action = {
  label: string;
  href: string;
};

export type PageMetric = {
  label: string;
  value: string;
  detail: string;
  tone: Tone;
};

export type TableRow = {
  subject: string;
  owner: string;
  status: string;
  target: string;
};

export type Signal = {
  label: string;
  value: string;
  note: string;
};

export type WorkspacePage = {
  eyebrow: string;
  title: string;
  description: string;
  actions: Action[];
  focus: string[];
  metrics: PageMetric[];
  rows: TableRow[];
  signals: Signal[];
};

export type Breadcrumb = {
  label: string;
  href?: string;
};

export type NavItem = {
  href: string;
  label: string;
  description: string;
  cue: string;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

type PageSeed = {
  eyebrow: string;
  title: string;
  description: string;
  actions: [Action, Action];
  values: [string, string, string];
  notes: [string, string, string];
  targets: [string, string, string];
  signals: [string, string, string];
  focus?: [string, string, string];
  metrics?: [PageMetric, PageMetric, PageMetric];
  rows?: [TableRow, TableRow, TableRow];
  signalCards?: [Signal, Signal, Signal];
};

const action = (label: string, href: string): Action => ({ label, href });
const metric = (
  label: string,
  value: string,
  detail: string,
  tone: Tone,
): PageMetric => ({ label, value, detail, tone });
const row = (
  subject: string,
  owner: string,
  status: string,
  target: string,
): TableRow => ({ subject, owner, status, target });
const signal = (label: string, value: string, note: string): Signal => ({
  label,
  value,
  note,
});

export const navigationSections: NavSection[] = [
  {
    title: "Core operations",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        description: "Live health, approvals, and exceptions across the workforce.",
        cue: "DB",
      },
      {
        href: "/employees",
        label: "Employees",
        description: "Directory, contracts, and workforce records.",
        cue: "EM",
      },
      {
        href: "/attendance",
        label: "Attendance",
        description: "Daily presence, punctuality, and workforce coverage.",
        cue: "AT",
      },
      {
        href: "/attendance/reports",
        label: "Attendance Reports",
        description: "Variance trends, export packs, and shift analytics.",
        cue: "AR",
      },
      {
        href: "/attendance/shifts",
        label: "Shifts",
        description: "Roster design, handoffs, and capacity balancing.",
        cue: "SH",
      },
      {
        href: "/shifts",
        label: "Shift Management",
        description: "Create shifts and assign employees to rosters.",
        cue: "SM",
      },
    ],
  },
  {
    title: "Time and rewards",
    items: [
      {
        href: "/leave",
        label: "Leave",
        description: "Balances, approvals, and return-to-work planning.",
        cue: "LV",
      },
      {
        href: "/leaves",
        label: "Leaves",
        description: "Apply leave requests and approve or reject pending entries.",
        cue: "LM",
      },
      {
        href: "/leave/apply",
        label: "Apply Leave",
        description: "Submit absence requests with coverage context.",
        cue: "AL",
      },
      {
        href: "/leave/reports",
        label: "Leave Reports",
        description: "Balance usage, peak seasons, and entitlement drift.",
        cue: "LR",
      },
      {
        href: "/leave-balance",
        label: "Leave Balance",
        description: "Total, used, and remaining leave summaries.",
        cue: "LB",
      },
      {
        href: "/payroll",
        label: "Payroll List",
        description: "Cycle readiness, deductions, and release control.",
        cue: "PR",
      },
      {
        href: "/payroll/assign",
        label: "Assign Salary",
        description: "Set salary structure, allowances, and deductions.",
        cue: "AS",
      },
      {
        href: "/payroll/payslip",
        label: "💳 Payslip",
        description: "Generate and review employee salary slips.",
        cue: "PS",
      },
      {
        href: "/payroll/report",
        label: "Payroll Report",
        description: "Cost variance, tax summaries, and exports.",
        cue: "RP",
      },
      {
        href: "/reports",
        label: "Reports",
        description: "Attendance, payroll, and leave report snapshots.",
        cue: "RR",
      },
    ],
  },
  {
    title: "Assets and growth",
    items: [
      {
        href: "/assets",
        label: "Assets",
        description: "Inventory health, ownership, and renewal cycles.",
        cue: "AS",
      },
      {
        href: "/assets/assign",
        label: "Assign Assets",
        description: "Map devices and kits to incoming employees.",
        cue: "AA",
      },
      {
        href: "/assets/maintenance",
        label: "Maintenance",
        description: "Repair windows, service quality, and return dates.",
        cue: "MT",
      },
      {
        href: "/documents",
        label: "Documents",
        description: "Upload employee documents and track expiry alerts.",
        cue: "DC",
      },
      {
        href: "/performance",
        label: "Performance",
        description: "Goals, review health, and coaching cadence.",
        cue: "PF",
      },
      {
        href: "/performance/kpi",
        label: "KPI",
        description: "Targets, ownership, and score movement.",
        cue: "KP",
      },
      {
        href: "/performance/feedback",
        label: "Feedback",
        description: "Pulse comments, manager notes, and recognition.",
        cue: "FB",
      },
      {
        href: "/performance/appraisal",
        label: "Appraisal",
        description: "Review windows, calibrations, and outcomes.",
        cue: "AP",
      },
    ],
  },
  {
    title: "Governance and lifecycle",
    items: [
      {
        href: "/compliance",
        label: "Compliance",
        description: "Policy readiness, audit follow-ups, and control status.",
        cue: "CP",
      },
      {
        href: "/compliance/policies",
        label: "Policies",
        description: "Versioning, sign-off, and review schedules.",
        cue: "PL",
      },
      {
        href: "/compliance/audit",
        label: "Audit",
        description: "Exceptions, ownership, and closure dates.",
        cue: "AU",
      },
      {
        href: "/compliance/reports",
        label: "Compliance Reports",
        description: "Control performance, breach logs, and export packs.",
        cue: "CR",
      },
      {
        href: "/audit-logs",
        label: "Audit Logs",
        description: "Trace admin actions and module activity.",
        cue: "AL",
      },
      {
        href: "/holidays",
        label: "Holidays",
        description: "Create and manage organization holiday calendar.",
        cue: "HD",
      },
      {
        href: "/tenants",
        label: "Tenants",
        description: "Manage tenant plans and activation status.",
        cue: "TN",
      },
      {
        href: "/lifecycle",
        label: "Lifecycle",
        description: "Recruiting, onboarding, movement, and exits.",
        cue: "LC",
      },
      {
        href: "/lifecycle/jobs",
        label: "Jobs",
        description: "Open roles, approvals, and recruiter handoffs.",
        cue: "JB",
      },
      {
        href: "/lifecycle/candidates",
        label: "Candidates",
        description: "Pipeline quality, interview progress, and offers.",
        cue: "CD",
      },
      {
        href: "/lifecycle/onboarding",
        label: "Onboarding",
        description: "Pre-joining tasks, provisioning, and readiness checks.",
        cue: "OB",
      },
      {
        href: "/lifecycle/exit",
        label: "Exit",
        description: "Clearance tasks, recoveries, and final settlements.",
        cue: "EX",
      },
    ],
  },
];

export const navigationItems = navigationSections.flatMap((section) => section.items);

const pageSeeds = {
  dashboard: {
    eyebrow: "Northstar EMS",
    title: "Command center",
    description:
      "Run workforce operations from one surface with live headcount, queue health, and cross-functional blockers.",
    actions: [
      action("Open employee directory", "/employees"),
      action("Review attendance reports", "/attendance/reports"),
    ],
    values: ["248", "96.2%", "6"],
    notes: ["Active headcount across the network", "On-time arrival trend stays above target", "Unresolved blockers still need owner action"],
    targets: ["248 active staff", "14 late check-ins", "2 blockers left"],
    signals: ["14 open roles", "2 policies due", "11 devices"],
    focus: [
      "Approve pending time corrections before shift close.",
      "Resolve payroll blockers tied to missing bank details.",
      "Confirm policy sign-off plan for the revised travel handbook.",
    ],
    metrics: [
      metric("Headcount", "248", "+12 since last quarter", "teal"),
      metric("On-time arrivals", "96.2%", "Above target by 1.4%", "amber"),
      metric("Open blockers", "6", "Spread across payroll and compliance", "slate"),
    ],
    rows: [
      row("Karachi HQ", "HR operations", "Stable", "248 active staff"),
      row("Night shift", "Attendance desk", "Needs review", "14 late check-ins"),
      row("March payroll", "Finance control", "In progress", "2 blockers left"),
    ],
    signalCards: [
      signal("Hiring pipeline", "14 open roles", "Product and support hiring moved this week."),
      signal("Compliance", "2 policies due", "Annual review cycle closes on Friday."),
      signal("Asset refresh", "11 devices", "Field laptops need service this month."),
    ],
  },
  employees: {
    eyebrow: "People records",
    title: "Employee directory",
    description: "See the full workforce roster, role coverage, and record completeness before making staffing decisions.",
    actions: [action("Create employee", "/employees/create"), action("Open lifecycle", "/lifecycle")],
    values: ["91%", "17", "9"],
    notes: ["Profiles are complete enough for payroll and compliance", "Probation cases need timely manager notes", "Contracts expiring within the next 30 days"],
    targets: ["64 profiles", "3 missing contracts", "2 CNIC uploads"],
    signals: ["1:8.4", "6 transfers", "4 employees"],
  },
  "employees.create": {
    eyebrow: "Workforce intake",
    title: "Add employee",
    description: "Prepare a clean employee record with role, payroll profile, and provisioning tasks aligned.",
    actions: [action("Back to employees", "/employees"), action("Open onboarding", "/lifecycle/onboarding")],
    values: ["18", "34 mins", "94%"],
    notes: ["New joiners prepared this month", "Average setup time per profile", "Provisioning SLA when people and IT stay aligned"],
    targets: ["Offer accepted", "Awaiting salary code", "Docs verified"],
    signals: ["6 templates", "83% captured", "4 open requests"],
  },
  attendance: {
    eyebrow: "Workforce presence",
    title: "Attendance operations",
    description: "Track check-ins, late arrivals, overtime, and missed punches before they affect payroll.",
    actions: [action("Open reports", "/attendance/reports"), action("Plan shifts", "/attendance/shifts")],
    values: ["231", "14", "8"],
    notes: ["Present today across all active shifts", "Late arrivals tracked since shift open", "Correction requests still pending review"],
    targets: ["98% present", "5 missed punches", "11 overtime slots"],
    signals: ["Every 15 mins", "27 active", "92%"],
  },
  "attendance.reports": {
    eyebrow: "Attendance intelligence",
    title: "Attendance reports",
    description: "Review punctuality patterns, overtime drivers, and branch-level utilization to guide staffing decisions.",
    actions: [action("Back to attendance", "/attendance"), action("Open leave reports", "/leave/reports")],
    values: ["95.1%", "PKR 482k", "2.3%"],
    notes: ["Monthly punctuality score vs last month", "Overtime cost driven by support and warehousing", "Absence drift across the network remains controlled"],
    targets: ["4.8% late trend", "82 overtime hours", "2.1% absence rate"],
    signals: ["Weekly", "90 days", "2 units"],
  },
  "attendance.shifts": {
    eyebrow: "Coverage planning",
    title: "Shift planning",
    description: "Build rosters around demand, overtime control, and supervisor coverage through the week.",
    actions: [action("Back to attendance", "/attendance"), action("Open dashboard", "/dashboard")],
    values: ["93%", "7", "12"],
    notes: ["Coverage score for the published roster window", "Open slots still lacking confirmed owners", "Swap requests waiting for lead approval"],
    targets: ["2 agents needed", "Demand aligned", "5 swaps to clear"],
    signals: ["21 days", "87%", "96%"],
  },
  leave: {
    eyebrow: "Absence management",
    title: "Leave desk",
    description: "Manage planned and unplanned time off without losing coverage or pushing teams into overtime.",
    actions: [action("Apply leave", "/leave/apply"), action("Open leave reports", "/leave/reports")],
    values: ["19", "12", "4"],
    notes: ["Requests still waiting for action", "Employees currently on leave today", "Return-to-work reviews due this week"],
    targets: ["11 requests", "3 active cases", "2 floaters assigned"],
    signals: ["Late April", "27 balances", "0"],
  },
  "leave.apply": {
    eyebrow: "Employee self-service",
    title: "Apply for leave",
    description: "Capture dates, handoff details, and coverage notes so approvals move without back-and-forth.",
    actions: [action("Back to leave", "/leave"), action("Open attendance", "/attendance")],
    values: ["76%", "9 hrs", "3%"],
    notes: ["Share of requests submitted through self-service", "Average approval turnaround time", "Rejection rate caused by balance or coverage conflicts"],
    targets: ["Balance validated", "Coverage pending", "Certificate requested"],
    signals: ["4 leave types", "Mandatory", "Near real-time"],
  },
  "leave.reports": {
    eyebrow: "Leave analytics",
    title: "Leave reports",
    description: "Spot seasonal demand, balance burn-down, and department stress before trends disrupt delivery.",
    actions: [action("Back to leave", "/leave"), action("Open payroll reports", "/payroll/reports")],
    values: ["61%", "34 days", "5 cases"],
    notes: ["Leave utilization vs entitlement curve", "Unused balance risk concentrated in leadership", "Unpaid leave cases still active in the cycle"],
    targets: ["58% utilized", "71% utilized", "9 staff at risk"],
    signals: ["12 weeks", "5 carry-forward days", "Moderate"],
  },
  assets: {
    eyebrow: "Equipment control",
    title: "Asset inventory",
    description: "Track devices, ownership, warranty windows, and stock readiness across people operations.",
    actions: [action("Assign assets", "/assets/assign"), action("Open maintenance", "/assets/maintenance")],
    values: ["412", "9", "16"],
    notes: ["Assigned assets across all business units", "Low stock alerts on shared equipment pools", "Warranty expiries approaching in the next 45 days"],
    targets: ["5 spare units", "3 failing devices", "18 kits packed"],
    signals: ["97%", "94%", "6 tickets"],
  },
  "assets.assign": {
    eyebrow: "Provisioning",
    title: "Assign assets",
    description: "Prepare employee equipment packages with the right devices, accessories, and proof of custody.",
    actions: [action("Back to assets", "/assets"), action("Open onboarding", "/lifecycle/onboarding")],
    values: ["27", "8", "13"],
    notes: ["Items currently ready for assignment", "Assignments still waiting on signatures", "Starter packs staged for next week"],
    targets: ["4 kits packed", "2 headsets missing", "3 courier slips"],
    signals: ["6 hardware sets", "Digital first", "2 days"],
  },
  "assets.maintenance": {
    eyebrow: "Service planning",
    title: "Asset maintenance",
    description: "Keep equipment reliable with scheduled service, fault tracking, and return-date visibility.",
    actions: [action("Back to assets", "/assets"), action("Open dashboard", "/dashboard")],
    values: ["11", "3.4 days", "2"],
    notes: ["Open maintenance jobs in the current queue", "Average turnaround time for service completion", "Repeat faults tied to older stock"],
    targets: ["5 units", "3 devices", "12 completed"],
    signals: ["95%", "3 active", "14 items"],
  },
  payroll: {
    eyebrow: "Compensation operations",
    title: "Payroll desk",
    description: "Control the payroll cycle with visibility on inputs, exceptions, approvals, and release readiness.",
    actions: [action("Open payslip", "/payroll/payslip"), action("Open payroll report", "/payroll/report")],
    values: ["89%", "7", "3"],
    notes: ["Current cycle readiness before finance release", "Input exceptions still under review", "Final settlements waiting for approval"],
    targets: ["89% ready", "11 records", "3 employees"],
    signals: ["97%", "Applied", "Complete"],
  },
  "payroll.payslips": {
    eyebrow: "Employee payout records",
    title: "Payslips",
    description: "Track generation, delivery, and employee access so every payroll cycle closes with proof of issue.",
    actions: [action("Back to payroll", "/payroll"), action("Open employees", "/employees")],
    values: ["245", "98.4%", "81%"],
    notes: ["Payslips generated for the current cycle", "Delivery success across email and portal", "Employees who viewed slips within 24 hours"],
    targets: ["112 slips", "87 slips", "3 slips pending"],
    signals: ["Email and portal", "6 today", "12 months"],
  },
  "payroll.reports": {
    eyebrow: "Payroll analytics",
    title: "Payroll reports",
    description: "Break down payroll cost, deductions, and variance by team so finance and HR can steer spend precisely.",
    actions: [action("Back to payroll", "/payroll"), action("Open attendance reports", "/attendance/reports")],
    values: ["PKR 31.4M", "PKR 1.8M", "PKR 4.7M"],
    notes: ["Gross payroll for the current month", "Variable pay driven by overtime and incentives", "Deductions spanning tax, loans, and advances"],
    targets: ["PKR 620k overtime", "Within 1% of plan", "Awaiting final approvals"],
    signals: ["Monthly", "3%", "9"],
  },
  performance: {
    eyebrow: "Performance rhythm",
    title: "Performance overview",
    description: "Keep goals, feedback loops, and appraisal readiness visible so manager quality stays consistent.",
    actions: [action("Open KPI tracking", "/performance/kpi"), action("Open appraisals", "/performance/appraisal")],
    values: ["84%", "47", "6"],
    notes: ["Review completion rate across active teams", "Recognition notes captured this month", "Coaching flags needing HRBP attention"],
    targets: ["92% reviews done", "5 reviews pending", "11 coaching plans"],
    signals: ["88%", "Steady", "13 employees"],
  },
  "performance.kpi": {
    eyebrow: "Score tracking",
    title: "KPI tracker",
    description: "Watch target movement, ownership, and risk across operational and people metrics.",
    actions: [action("Back to performance", "/performance"), action("Open dashboard", "/dashboard")],
    values: ["37", "6", "2"],
    notes: ["KPIs on track out of the active set", "Measures currently at risk", "Metrics still lacking named ownership"],
    targets: ["88 target / 84 actual", "99.1%", "29 days"],
    signals: ["Bi-weekly", "Strong", "Enabled"],
  },
  "performance.feedback": {
    eyebrow: "Continuous feedback",
    title: "Feedback loop",
    description: "Capture manager notes, peer comments, and recognition moments while issues are still actionable.",
    actions: [action("Back to performance", "/performance"), action("Open employees", "/employees")],
    values: ["126", "72%", "4"],
    notes: ["Feedback items submitted in the last 30 days", "Pulse survey response rate", "Escalations that need confidential follow-up"],
    targets: ["48 notes", "31 outstanding", "4 flagged comments"],
    signals: ["Improving", "2 teams", "Up 18%"],
  },
  "performance.appraisal": {
    eyebrow: "Formal reviews",
    title: "Appraisal cycle",
    description: "Manage review windows, calibration sessions, and decision quality for compensation and growth outcomes.",
    actions: [action("Back to performance", "/performance"), action("Open payroll", "/payroll")],
    values: ["212", "5", "11"],
    notes: ["Appraisals started out of total employees", "Calibration sessions in the current cycle", "Promotion cases awaiting final approval"],
    targets: ["91% drafted", "2 sessions left", "Final pack prepared"],
    signals: ["Balanced", "High", "On plan"],
  },
  compliance: {
    eyebrow: "Risk and policy",
    title: "Compliance hub",
    description: "Monitor policies, acknowledgements, and audit closure work so growth does not outrun control discipline.",
    actions: [action("Open policies", "/compliance/policies"), action("Open audits", "/compliance/audit")],
    values: ["94%", "28", "6"],
    notes: ["Controls currently operating as designed", "Acknowledgements still due from employees", "Audit actions currently open"],
    targets: ["220 completed", "2 actions", "96% complete"],
    signals: ["Quarterly", "0 major", "Assigned"],
  },
  "compliance.policies": {
    eyebrow: "Policy governance",
    title: "Policies",
    description: "Manage policy versions, review deadlines, and sign-off campaigns with a clear approval trail.",
    actions: [action("Back to compliance", "/compliance"), action("Open reports", "/compliance/reports")],
    values: ["18", "28", "3"],
    notes: ["Active policies in the live library", "Pending sign-offs still needing reminders", "Policy reviews expiring this month"],
    targets: ["Finance sign-off", "97% acknowledged", "Renew by month end"],
    signals: ["Stable", "11 branch staff", "Moderate"],
  },
  "compliance.audit": {
    eyebrow: "Control assurance",
    title: "Audit tracker",
    description: "Run internal and external audit actions with clear ownership, evidence notes, and closure discipline.",
    actions: [action("Back to compliance", "/compliance"), action("Open lifecycle exit", "/lifecycle/exit")],
    values: ["4", "2", "83%"],
    notes: ["Audits active in the current period", "Overdue actions still without closure", "Evidence pack completion against plan"],
    targets: ["2 actions", "18 files", "All evidence ready"],
    signals: ["91%", "1", "Strong"],
  },
  "compliance.reports": {
    eyebrow: "Assurance reporting",
    title: "Compliance reports",
    description: "Prepare leadership-ready summaries on policy adherence, breaches, and closure quality.",
    actions: [action("Back to compliance", "/compliance"), action("Open dashboard", "/dashboard")],
    values: ["94%", "3 minor", "92%"],
    notes: ["Control score for the latest reporting period", "Breaches logged and under review", "Closure quality accepted on first pass"],
    targets: ["89% complete", "3 minor cases", "92% accepted"],
    signals: ["Monthly", "Enabled", "High"],
  },
  lifecycle: {
    eyebrow: "End-to-end workforce flow",
    title: "Lifecycle overview",
    description: "Track the full employee journey from hiring through onboarding, internal movement, and exit.",
    actions: [action("Open jobs", "/lifecycle/jobs"), action("Open onboarding", "/lifecycle/onboarding")],
    values: ["41", "92%", "87%"],
    notes: ["Open lifecycle cases across all stages", "Onboarding readiness for upcoming joiners", "Exit clearance rate before settlement release"],
    targets: ["14 roles", "9 employees", "2 delayed clearances"],
    signals: ["Improving", "6 employees", "8 days"],
  },
  "lifecycle.jobs": {
    eyebrow: "Talent demand",
    title: "Job openings",
    description: "Manage requisitions, approvals, and hiring pace with a clear view of where demand is growing fastest.",
    actions: [action("Back to lifecycle", "/lifecycle"), action("Open candidates", "/lifecycle/candidates")],
    values: ["14", "3", "27 days"],
    notes: ["Open roles across the organization", "Requisitions still waiting on approval", "Average time a role stays open"],
    targets: ["5 openings", "2 roles", "3 candidates shortlisted"],
    signals: ["Growth and backfill", "2", "5.2 days"],
  },
  "lifecycle.candidates": {
    eyebrow: "Talent pipeline",
    title: "Candidate pipeline",
    description: "Track interviews, offers, and conversion quality so hiring teams know where momentum is lost.",
    actions: [action("Back to lifecycle", "/lifecycle"), action("Open jobs", "/lifecycle/jobs")],
    values: ["63", "78%", "9"],
    notes: ["Candidates currently active in the funnel", "Offer acceptance rate across open roles", "Interview decisions still missing feedback"],
    targets: ["22 candidates", "3 declines", "8 final rounds"],
    signals: ["Healthy", "Panel feedback", "Mostly referrals"],
  },
  "lifecycle.onboarding": {
    eyebrow: "Day-one readiness",
    title: "Onboarding",
    description: "Coordinate documentation, equipment, training, and introductions so new joiners land smoothly.",
    actions: [action("Back to lifecycle", "/lifecycle"), action("Assign assets", "/assets/assign")],
    values: ["9", "92%", "100%"],
    notes: ["Upcoming joiners in the next 14 days", "Day-one readiness score", "Training packs prepared before start dates"],
    targets: ["All hardware assigned", "2 headset shortages", "Docs verified"],
    signals: ["Mostly digital", "Strong", "Assigned"],
  },
  "lifecycle.exit": {
    eyebrow: "Offboarding control",
    title: "Exit management",
    description: "Run resignations, recoveries, and final settlements with clean ownership so nothing leaks after departure.",
    actions: [action("Back to lifecycle", "/lifecycle"), action("Open assets", "/assets")],
    values: ["7", "86%", "5"],
    notes: ["Active exit cases in the current queue", "Asset recovery rate before settlement", "Settlement files ready for release"],
    targets: ["3 cases", "2 clearances", "Access to remove"],
    signals: ["Same day", "Low", "5 collected"],
  },
} satisfies Record<string, PageSeed>;

export type PageId = keyof typeof pageSeeds | "employees.detail";

export function getWorkspacePage(pageId: PageId, employeeId?: string): WorkspacePage {
  if (pageId === "employees.detail") {
    const cleanId = (employeeId ?? "emp-241").toUpperCase();

    return {
      eyebrow: "Employee profile",
      title: `Employee ${cleanId}`,
      description: "Inspect identity, reporting line, attendance context, assets, and performance notes for the selected employee.",
      actions: [action("Return to employees", "/employees"), action("Open performance", "/performance")],
      focus: [
        "Validate personal details against the latest HR master record.",
        "Review leave balance and attendance variance before appraisals.",
        "Check issued assets and pending policy acknowledgements.",
      ],
      metrics: [
        metric("Profile ID", cleanId, "Primary workforce record", "teal"),
        metric("Open actions", "3", "Needs approvals this week", "amber"),
        metric("Performance cycle", "On track", "Mid-year review scheduled", "slate"),
      ],
      rows: [
        row("Profile verification", "People ops", "Complete", "All core fields locked"),
        row("Attendance review", "Line manager", "Pending", "2 anomalies this month"),
        row("Asset ownership", "IT support", "Healthy", "Laptop and badge assigned"),
      ],
      signals: [
        signal("Current role", "Senior associate", `Record ${cleanId} is tied to the current department structure.`),
        signal("Leave balance", "11.5 days", "No unusual burn detected in the current cycle."),
        signal("Policy status", "2 pending", "Travel policy and code of conduct await sign-off."),
      ],
    };
  }

  const seed = pageSeeds[pageId];
  return buildPage(seed);
}

export function getActiveHref(pathname: string): string {
  const match = [...navigationItems]
    .sort((left, right) => right.href.length - left.href.length)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  return match?.href ?? "/dashboard";
}

export function getRouteSummary(pathname: string): { label: string; description: string } {
  if (/^\/employees\/[^/]+$/.test(pathname) && !pathname.endsWith("/create")) {
    return {
      label: "Employee profile",
      description: "Review personal records, attendance context, assets, and performance notes for an individual employee.",
    };
  }

  const activeItem = navigationItems.find((item) => item.href === getActiveHref(pathname));

  return (
    activeItem ?? {
      label: "Workspace",
      description: "Operate the full employee management stack from one place.",
    }
  );
}

export function getBreadcrumbs(pathname: string): Breadcrumb[] {
  const orderedMatches = [...navigationItems]
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((left, right) => left.href.length - right.href.length)
    .map((item) => ({ label: item.label, href: item.href }));

  const breadcrumbs: Breadcrumb[] = [];

  for (const crumb of orderedMatches) {
    if (!breadcrumbs.some((entry) => entry.href === crumb.href)) {
      breadcrumbs.push(crumb);
    }
  }

  if (/^\/employees\/[^/]+$/.test(pathname) && !pathname.endsWith("/create")) {
    const employeeId = pathname.split("/")[2]?.toUpperCase() ?? "EMP";
    breadcrumbs.push({ label: `Employee ${employeeId}` });
  }

  if (!breadcrumbs.length) {
    return [{ label: titleCase(pathname.split("/").filter(Boolean).at(-1) ?? "workspace") }];
  }

  return breadcrumbs.map((crumb, index) =>
    index === breadcrumbs.length - 1 ? { label: crumb.label } : crumb,
  );
}

function buildPage(seed: PageSeed): WorkspacePage {
  const baseName = seed.title.toLowerCase();

  return {
    eyebrow: seed.eyebrow,
    title: seed.title,
    description: seed.description,
    actions: seed.actions,
    focus:
      seed.focus ??
      [
        `Review today's ${baseName} queue before noon.`,
        `Confirm ownership on every outstanding ${baseName} item.`,
        `Prepare an end-of-day summary for unresolved ${baseName} blockers.`,
      ],
    metrics:
      seed.metrics ??
      [
        metric("Live workload", seed.values[0], seed.notes[0], "teal"),
        metric("Service level", seed.values[1], seed.notes[1], "amber"),
        metric("Exceptions", seed.values[2], seed.notes[2], "slate"),
      ],
    rows:
      seed.rows ??
      [
        row(`${seed.title} intake`, "Module owner", "In progress", seed.targets[0]),
        row(`${seed.title} review`, "Operations lead", "Scheduled", seed.targets[1]),
        row(`${seed.title} escalation`, "Control desk", "Watch", seed.targets[2]),
      ],
    signals:
      seed.signalCards ??
      [
        signal("Visibility", seed.signals[0], `${seed.title} data is flowing into the shared workspace.`),
        signal("Coverage", seed.signals[1], `Owners can step in without leaving the ${baseName} module.`),
        signal("Readiness", seed.signals[2], `Queue health is visible before the end-of-day handoff.`),
      ],
  };
}

function titleCase(value: string): string {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
