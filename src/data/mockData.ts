import { TeamMember, DailyReport, PhysicalInspectionItem, ServerCheck, LicenseStatus, SLAReminderItem, CompanyAsset } from '../types';

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  // IT Administrator / Super Admin DSLNG (Kredensial: admin.ict@donggi-senoro.com / Pac-tina80)
  {
    id: 'admin-it-01',
    name: 'Administrator IT DSLNG (Super Admin)',
    email: 'admin.ict@donggi-senoro.com',
    badgeNumber: '00001',
    location: 'Site Uso',
    role: 'ADMINISTRATOR',
    shift: 'Shift A (06.00 - 18.00 WITA)',
    isDutyEligible: true,
    phone: '+62 453 312 8000',
    password: 'Pac-tina80',
  },
];

export const TEAM_MEMBERS: TeamMember[] = INITIAL_TEAM_MEMBERS;

export const INITIAL_SERVERS: ServerCheck[] = [];

export const INITIAL_LICENSES: LicenseStatus = {
  m365E3Total: 0,
  m365E3Assigned: 0,
  m365E5Total: 0,
  m365E5Assigned: 0,
  autocadFloatingTotal: 0,
  autocadFloatingInUse: 0,
  items: [],
  userAssignments: [],
  purchases: [],
  expirations: [],
};

export const INITIAL_COMPANY_ASSETS: CompanyAsset[] = [];

export const INITIAL_SLA_REMINDERS: SLAReminderItem[] = [];

// Meeting rooms for physical inspections (Clean baseline: ditambahkan oleh admin/user)
export const DEFAULT_PHYSICAL_ROOMS: PhysicalInspectionItem[] = [];

// Sample inspection proof images (clean baseline)
export const SAMPLE_INSPECTION_PROOFS: Record<string, string> = {};

// Clean reports baseline (Tanpa data dummy: seluruh laporan dibuat langsung secara operasional)
export const SEED_PAST_REPORTS: DailyReport[] = [];

