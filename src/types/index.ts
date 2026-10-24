export type Location = 'Site Uso' | 'HO Jkt';

export type UserRole = 'DUTY_ENGINEER' | 'HELPDESK_ENGINEER' | 'ICT_MANAGER' | 'ADMINISTRATOR';

export type SiteUsoShift =
  | 'Shift A (06.00 - 18.00 WITA)'
  | 'Shift B (07.00 - 18.00 WITA)'
  | 'Off / Libur';

export type HOJktShift =
  | 'Shift A (07.00 - 17.00 WIB)'
  | 'Shift B (08.00 - 17.00 WIB)'
  | 'Off / Libur';

export type ShiftType = SiteUsoShift | HOJktShift | string;

export interface ManualShiftItem {
  engineerId: string;
  engineerName: string;
  badgeNumber: string;
  location: Location;
  shiftTime: string;
  isDutyEngineer: boolean;
  notes?: string;
}

export interface DayShiftSchedule {
  date: string; // YYYY-MM-DD
  siteUsoDutyEngineerId: string;
  shifts: Record<string, ManualShiftItem>; // engineerId -> ManualShiftItem
  updatedBy?: string;
  updatedAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  badgeNumber: string;
  location: Location;
  role: UserRole;
  shift: ShiftType;
  isDutyEligible: boolean;
  avatarUrl?: string;
  phone: string;
  password?: string;
}

export type ReportStatus = 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export type TicketCategory = 'Helpdesk' | 'MES' | 'ERP' | 'Network/Telecom/Radio';

export interface SLATicketDetail {
  id: string;
  ticketNumber: string;
  subject: string;
  requester: string;
  category: TicketCategory;
  overSlaTime: string; // e.g. "2 Jam 30 Menit", "+4 Jam"
  slaStatus: 'SLA_BREACHED' | 'SLA_AT_RISK';
  technician: string;
  notes?: string;
}

export interface TicketMetrics {
  open: number;
  onHold: number;
  pendingUser: number;
  closedToday: number;
  slaBreached: number;
  slaAtRisk: number;
  categoryBreakdown: {
    helpdesk: number;
    mes: number;
    erp: number;
    networkTelecomRadio: number;
  };
  slaTickets?: SLATicketDetail[];
}

export interface SLAReminderItem {
  ticketId: string;
  title: string;
  user: string;
  department: string;
  status: 'Finished - Awaiting Confirmation' | 'In Progress' | 'Escalated';
  hoursOpen: number;
  actionRequired: string;
}

export interface ServerCheck {
  id: string;
  name: string;
  location: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  notes?: string;
  role?: string;
  latencyMs?: number;
  lastChecked?: string;
}

export interface LicenseInventoryItem {
  id: string;
  softwareName: string;
  category: 'MS365' | 'OTHERS';
  totalLicenses: number;
  assignedLicenses: number;
  availableLicenses: number;
  vendor?: string;
  notes?: string;
}

export interface LicenseAssignment {
  id: string;
  userName: string;
  department: string;
  softwareName: string;
  assignedDate: string;
  ticketRef: string;
  assignedBy?: string;
  notes?: string;
}

export interface SoftwarePurchase {
  id: string;
  softwareName: string;
  targetUser: string;
  department: string;
  quantity: number;
  poNumber: string;
  vendor: string;
  purchaseDate: string;
  status: 'ACTIVE' | 'DEPLOYED' | 'PENDING_INSTALL';
  notes?: string;
}

export interface LicenseStatus {
  m365E3Total: number;
  m365E3Assigned: number;
  m365E5Total: number;
  m365E5Assigned: number;
  autocadFloatingTotal: number;
  autocadFloatingInUse: number;
  items?: LicenseInventoryItem[];
  userAssignments?: LicenseAssignment[];
  purchases?: SoftwarePurchase[];
  expirations: {
    software: string;
    seats: number;
    daysRemaining: number;
    vendor: string;
  }[];
}

export interface PhysicalInspectionItem {
  id: string;
  roomName: string;
  location: Location;
  audioStatus: 'PASS' | 'FAIL' | 'NOT_CHECKED';
  videoStatus: 'PASS' | 'FAIL' | 'NOT_CHECKED';
  sharingCablesStatus: 'PASS' | 'FAIL' | 'NOT_CHECKED';
  photoEvidenceUrl: string; // Base64 or URL (Mandatory)
  photoTimestamp?: string;
  notes: string;
  completed: boolean;
  facilities?: string;
}

export interface CompanyAsset {
  id: string;
  name: string;
  category: 'SOFTWARE_LICENSE' | 'OTHER' | string;
  customCategory?: string;
  capacityTotal: number;
  capacityUsed: number;
  unit?: string;
  vendor?: string;
  notes?: string;
}

export interface AuditLogEntry {
  timestamp: string;
  actorName: string;
  actorRole: string;
  actorBadge: string;
  action: string;
  details: string;
  reportId?: string;
  lockHash?: string;
}

export interface MailboxCrowdstrikeDetailItem {
  id: string;
  type: 'MAILBOX_ALMOST_FULL' | 'MAILBOX_FULL' | 'CROWDSTRIKE_MALICIOUS' | 'CROWDSTRIKE_INACTIVE_30D';
  targetUserOrHost: string;
  departmentOrLocation?: string;
  notes?: string;
}

export interface MailboxCrowdstrikeMetrics {
  mailboxAlmostFull: number;
  mailboxFull: number;
  crowdstrikeMaliciousActivity: number;
  crowdstrikeInactive30Days: number;
  notes?: string;
  details?: MailboxCrowdstrikeDetailItem[];
}

export interface OperationalSummaryExceptions {
  newUserRequests?: string;
  poFollowUps?: string;
  brokenAssets?: string;
  generalNotes?: string;
}

export interface DailyReport {
  id: string;
  reportDate: string; // YYYY-MM-DD
  location: Location;
  status: ReportStatus;
  
  // Submitter details (Mandatory accountability)
  dutyEngineerId: string;
  dutyEngineerName: string;
  dutyEngineerShift: string;
  dutyEngineerBadge: string;
  submittedAt?: string;
  immutableLockHash?: string;
  
  // Report sections
  tickets: TicketMetrics;
  slaTickets?: SLATicketDetail[];
  slaReminders: SLAReminderItem[];
  servers: ServerCheck[];
  licenses: LicenseStatus;
  physicalInspections: PhysicalInspectionItem[];
  mailboxCrowdstrike?: MailboxCrowdstrikeMetrics;
  operationalExceptions?: OperationalSummaryExceptions;
  
  // Executive notes
  executiveSummary: string;
  shiftHandoverNotes: string;
  
  // Superior Approval details
  superiorReview?: {
    managerId: string;
    managerName: string;
    reviewedAt: string;
    decision: 'APPROVED' | 'REJECTED';
    comments: string;
    signatureDataUrl: string; // Base64 signature image
    digitalStampId: string;
  };

  auditTrail: AuditLogEntry[];
}

export interface ShiftRosterSchedule {
  date: string;
  siteDutyEngineerId: string; // The one on early shift (06:00-18:00)
  siteEngineers: {
    engineerId: string;
    shift: ShiftType;
    isDutyLeader: boolean;
  }[];
  hoEngineers: {
    engineerId: string;
    shift: ShiftType;
  }[];
  isOverridden?: boolean;
  overrideReason?: string;
}

export interface MissingReportReminder {
  date: string;
  assignedDutyEngineerId: string;
  assignedDutyEngineerName: string;
  assignedDutyEngineerEmail: string;
  location: Location;
  shift: string;
  daysOverdue: number;
  status: 'PENDING_SUBMISSION' | 'REMINDER_DISPATCHED';
  dispatchedAt?: string;
}

