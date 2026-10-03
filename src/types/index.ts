export type Location = 'Site Luwuk' | 'HO Jakarta';

export type UserRole = 'DUTY_ENGINEER' | 'HELPDESK_ENGINEER' | 'ICT_MANAGER';

export type ShiftType =
  | 'Site Early (06:00 - 18:00)'
  | 'Site Sunday Duty (07:00 - 18:00)'
  | 'Site Regular (07:00 - 18:00)'
  | 'HO Shift A (07:00 - 17:00)'
  | 'HO Shift B (08:00 - 17:00)';

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
}

export type ReportStatus = 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface TicketMetrics {
  open: number;
  onHold: number;
  pendingUser: number;
  closedToday: number;
  slaBreached: number;
  slaAtRisk: number;
  categoryBreakdown: {
    network: number;
    hardware: number;
    sapErp: number;
    m365Email: number;
    scadaTerminal: number;
    telephonyRadio: number;
  };
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
  role: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  latencyMs: number;
  lastChecked: string;
  notes?: string;
}

export interface LicenseStatus {
  m365E3Total: number;
  m365E3Assigned: number;
  m365E5Total: number;
  m365E5Assigned: number;
  autocadFloatingTotal: number;
  autocadFloatingInUse: number;
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
}

export interface AuditLogEntry {
  timestamp: string;
  actorName: string;
  actorRole: string;
  actorBadge: string;
  action: string;
  details: string;
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
  slaReminders: SLAReminderItem[];
  servers: ServerCheck[];
  licenses: LicenseStatus;
  physicalInspections: PhysicalInspectionItem[];
  
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
