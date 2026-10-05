import { TeamMember, DailyReport, PhysicalInspectionItem, ServerCheck, LicenseStatus, SLAReminderItem, CompanyAsset } from '../types';

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  // IT Administrator / Super Admin (Akses Penuh & Manajemen Akun Helpdesk / Superior)
  {
    id: 'admin-it-01',
    name: 'Administrator IT DSLNG (Super Admin)',
    email: 'admin.ict@donggi-senoro.com',
    badgeNumber: 'DSLNG-ADM-001',
    location: 'Site Uso',
    role: 'ADMINISTRATOR',
    shift: 'Shift A (06.00 - 18.00 WITA)',
    isDutyEligible: true,
    phone: '+62 453 312 8000',
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
  expirations: [],
};

export const INITIAL_COMPANY_ASSETS: CompanyAsset[] = [];

export const INITIAL_SLA_REMINDERS: SLAReminderItem[] = [];

// Meeting rooms for physical inspections (Clean baseline: ditambahkan oleh admin/user)
export const DEFAULT_PHYSICAL_ROOMS: PhysicalInspectionItem[] = [];

// Sample SVG inspection proof images to allow out-of-the-box demo without requiring external downloads
export const SAMPLE_INSPECTION_PROOFS: Record<string, string> = {
  maleo: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#bg)"/>
      <rect x="40" y="40" width="520" height="240" rx="8" fill="#020617" stroke="#334155" stroke-width="2"/>
      <rect x="60" y="60" width="230" height="150" rx="4" fill="#0f172a" stroke="#0ea5e9" stroke-width="1.5"/>
      <text x="175" y="145" fill="#38bdf8" font-family="monospace" font-size="14" text-anchor="middle">PT.DSLNG VTC 01</text>
      <text x="175" y="165" fill="#22c55e" font-family="monospace" font-size="11" text-anchor="middle">● CONNECTED (1080p 60fps)</text>
      <rect x="310" y="60" width="230" height="150" rx="4" fill="#0f172a" stroke="#0ea5e9" stroke-width="1.5"/>
      <text x="425" y="145" fill="#38bdf8" font-family="monospace" font-size="14" text-anchor="middle">DESKTOP SHARE</text>
      <text x="425" y="165" fill="#94a3b8" font-family="monospace" font-size="11" text-anchor="middle">HDMI INPUT READY</text>
      <rect x="220" y="220" width="160" height="20" rx="4" fill="#1e293b" stroke="#475569" stroke-width="1"/>
      <text x="300" y="234" fill="#cbd5e1" font-family="sans-serif" font-size="9" text-anchor="middle">POLYCOM 4K VIDEO BAR</text>
      <!-- Conference table -->
      <polygon points="20,380 580,380 500,280 100,280" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
      <!-- Mic pod -->
      <circle cx="300" cy="330" r="16" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
      <circle cx="300" cy="330" r="4" fill="#22c55e"/>
      <!-- Retractable cables box -->
      <rect x="180" y="320" width="60" height="30" rx="2" fill="#020617" stroke="#64748b"/>
      <text x="210" y="338" fill="#e2e8f0" font-family="monospace" font-size="8" text-anchor="middle">HDMI/USB</text>
      <!-- Watermark / timestamp overlay -->
      <rect x="20" y="350" width="320" height="36" rx="4" fill="rgba(0,0,0,0.7)"/>
      <text x="30" y="365" fill="#f8fafc" font-family="monospace" font-size="10">DSLNG INSPECTION PROOF: MALEO BOARDROOM</text>
      <text x="30" y="378" fill="#38bdf8" font-family="monospace" font-size="9">DATE: 2026-10-03 06:14:22 WITA (PHYSICAL PASS)</text>
    </svg>
  `),
  tarsius: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
      <rect width="600" height="400" fill="#0b132b"/>
      <rect x="80" y="40" width="440" height="220" rx="6" fill="#1c2541" stroke="#3a506b" stroke-width="2"/>
      <text x="300" y="140" fill="#5bc0be" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">TARSIUS OPERATIONS ROOM</text>
      <text x="300" y="165" fill="#6fffe9" font-family="monospace" font-size="12" text-anchor="middle">● TEAMS ROOMS SYSTEM READY</text>
      <!-- Table with cables -->
      <polygon points="50,380 550,380 480,260 120,260" fill="#1c2541" stroke="#3a506b"/>
      <rect x="250" y="300" width="100" height="40" rx="4" fill="#0b132b" stroke="#5bc0be" stroke-width="1.5"/>
      <text x="300" y="325" fill="#ffffff" font-family="sans-serif" font-size="10" text-anchor="middle">TOUCH CONSOLE</text>
      <path d="M 220,320 Q 200,340 180,335" stroke="#f59e0b" stroke-width="3" fill="none"/>
      <circle cx="180" cy="335" r="5" fill="#f59e0b"/>
      <!-- Timestamp overlay -->
      <rect x="20" y="350" width="340" height="36" rx="4" fill="rgba(0,0,0,0.7)"/>
      <text x="30" y="365" fill="#f8fafc" font-family="monospace" font-size="10">DSLNG INSPECTION PROOF: TARSIUS ROOM</text>
      <text x="30" y="378" fill="#6fffe9" font-family="monospace" font-size="9">DATE: 2026-10-03 06:18:45 WITA (PHYSICAL PASS)</text>
    </svg>
  `),
  cendrawasih: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
      <rect width="600" height="400" fill="#0f172a"/>
      <rect x="100" y="50" width="400" height="200" rx="4" fill="#1e293b" stroke="#475569" stroke-width="2"/>
      <text x="300" y="140" fill="#94a3b8" font-family="sans-serif" font-size="14" text-anchor="middle">CENDRAWASIH ENGINEERING ROOM</text>
      <text x="300" y="165" fill="#22c55e" font-family="monospace" font-size="12" text-anchor="middle">PROJECTOR &amp; AUDIO TEST OK</text>
      <polygon points="60,380 540,380 470,250 130,250" fill="#1e293b" stroke="#334155"/>
      <rect x="20" y="350" width="360" height="36" rx="4" fill="rgba(0,0,0,0.7)"/>
      <text x="30" y="365" fill="#f8fafc" font-family="monospace" font-size="10">DSLNG INSPECTION PROOF: CENDRAWASIH</text>
      <text x="30" y="378" fill="#38bdf8" font-family="monospace" font-size="9">DATE: 2026-10-03 06:23:10 WITA (PHYSICAL PASS)</text>
    </svg>
  `),
  nusantara: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
      <rect width="600" height="400" fill="#090d16"/>
      <rect x="60" y="40" width="480" height="220" rx="6" fill="#111827" stroke="#1f2937" stroke-width="2"/>
      <text x="300" y="130" fill="#e5e7eb" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">HO JAKARTA NUSANTARA BOARDROOM</text>
      <text x="300" y="155" fill="#10b981" font-family="monospace" font-size="12" text-anchor="middle">● SITE LUWUK TRUNK LINK ONLINE</text>
      <polygon points="40,380 560,380 490,260 110,260" fill="#111827" stroke="#1f2937"/>
      <rect x="20" y="350" width="360" height="36" rx="4" fill="rgba(0,0,0,0.7)"/>
      <text x="30" y="365" fill="#f8fafc" font-family="monospace" font-size="10">DSLNG INSPECTION PROOF: NUSANTARA HO</text>
      <text x="30" y="378" fill="#10b981" font-family="monospace" font-size="9">DATE: 2026-10-03 06:30:00 WIB (PHYSICAL PASS)</text>
    </svg>
  `),
};

// Seed sample past reports for the calendar
export const SEED_PAST_REPORTS: DailyReport[] = [
  {
    id: 'DSLNG-REP-20261001-01',
    reportDate: '2026-10-01',
    location: 'Site Uso',
    status: 'APPROVED',
    dutyEngineerId: 'admin-it-01',
    dutyEngineerName: 'Administrator IT DSLNG (Super Admin)',
    dutyEngineerShift: 'Shift A (06.00 - 18.00 WITA)',
    dutyEngineerBadge: 'DSLNG-ADM-001',
    submittedAt: '2026-10-01 17:45:10 WITA',
    immutableLockHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    tickets: {
      open: 14,
      onHold: 3,
      pendingUser: 6,
      closedToday: 22,
      slaBreached: 0,
      slaAtRisk: 1,
      categoryBreakdown: {
        network: 5,
        hardware: 4,
        sapErp: 8,
        m365Email: 12,
        scadaTerminal: 2,
        telephonyRadio: 4,
      },
    },
    slaReminders: [],
    servers: INITIAL_SERVERS,
    licenses: INITIAL_LICENSES,
    physicalInspections: DEFAULT_PHYSICAL_ROOMS.map((r, i) => ({
      ...r,
      completed: true,
      photoEvidenceUrl: i === 0 ? SAMPLE_INSPECTION_PROOFS.maleo : i === 1 ? SAMPLE_INSPECTION_PROOFS.tarsius : SAMPLE_INSPECTION_PROOFS.cendrawasih,
      photoTimestamp: '2026-10-01 06:22:00 WITA',
    })),
    executiveSummary: 'Nominal operational day. All meeting rooms inspected and functional before 07:00 AM plant briefing. SCADA gateway latency within threshold. Zero SLA breaches recorded.',
    shiftHandoverNotes: 'Handover to night on-call team completed. Focus on Marine jetty IP phone replacement.',
    superiorReview: {
      managerId: 'mgr-ict-history',
      managerName: 'Superior ICT Manager',
      reviewedAt: '2026-10-01 18:30:15 WIB',
      decision: 'APPROVED',
      comments: 'Well organized daily report. Physical inspection photos verified. Good ticket closure throughput.',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M 20 40 Q 60 10 90 35 T 140 25 T 180 30" fill="none" stroke="%230ea5e9" stroke-width="2.5"/></svg>',
      digitalStampId: 'DSLNG-CERT-APPROVAL-20261001-SUP01',
    },
    auditTrail: [],
  },
  {
    id: 'DSLNG-REP-20261002-01',
    reportDate: '2026-10-02',
    location: 'Site Uso',
    status: 'APPROVED',
    dutyEngineerId: 'admin-it-01',
    dutyEngineerName: 'Administrator IT DSLNG (Super Admin)',
    dutyEngineerShift: 'Shift A (06.00 - 18.00 WITA)',
    dutyEngineerBadge: 'DSLNG-ADM-001',
    submittedAt: '2026-10-02 17:50:40 WITA',
    immutableLockHash: 'f4b1c23398fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852c911',
    tickets: {
      open: 16,
      onHold: 2,
      pendingUser: 5,
      closedToday: 19,
      slaBreached: 0,
      slaAtRisk: 0,
      categoryBreakdown: {
        network: 4,
        hardware: 6,
        sapErp: 10,
        m365Email: 9,
        scadaTerminal: 1,
        telephonyRadio: 3,
      },
    },
    slaReminders: [],
    servers: INITIAL_SERVERS,
    licenses: INITIAL_LICENSES,
    physicalInspections: DEFAULT_PHYSICAL_ROOMS.map((r, i) => ({
      ...r,
      completed: true,
      photoEvidenceUrl: i === 0 ? SAMPLE_INSPECTION_PROOFS.maleo : i === 1 ? SAMPLE_INSPECTION_PROOFS.tarsius : SAMPLE_INSPECTION_PROOFS.cendrawasih,
      photoTimestamp: '2026-10-02 06:19:30 WITA',
    })),
    executiveSummary: 'Routine operations maintained. Fiber backbone switch SW-CORE-01 port transceiver replaced during maintenance window with zero downtime.',
    shiftHandoverNotes: 'All urgent SAP requests resolved. AutoCAD licenses monitored at 29/35 peak usage.',
    superiorReview: {
      managerId: 'mgr-ict-history',
      managerName: 'Superior ICT Manager',
      reviewedAt: '2026-10-02 18:15:20 WIB',
      decision: 'APPROVED',
      comments: 'Good job managing the fiber switch maintenance window without operational disruption.',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M 20 40 Q 60 10 90 35 T 140 25 T 180 30" fill="none" stroke="%230ea5e9" stroke-width="2.5"/></svg>',
      digitalStampId: 'DSLNG-CERT-APPROVAL-20261002-SUP01',
    },
    auditTrail: [],
  },
  {
    id: 'DSLNG-REP-20261003-01',
    reportDate: '2026-10-03',
    location: 'Site Uso',
    status: 'SUBMITTED',
    dutyEngineerId: 'admin-it-01',
    dutyEngineerName: 'Administrator IT DSLNG (Super Admin)',
    dutyEngineerShift: 'Shift A (06.00 - 18.00 WITA)',
    dutyEngineerBadge: 'DSLNG-ADM-001',
    submittedAt: '2026-10-03 17:42:00 WITA',
    immutableLockHash: 'd82fa10298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852de44',
    tickets: {
      open: 15,
      onHold: 2,
      pendingUser: 4,
      closedToday: 21,
      slaBreached: 0,
      slaAtRisk: 0,
      categoryBreakdown: {
        network: 5,
        hardware: 4,
        sapErp: 8,
        m365Email: 11,
        scadaTerminal: 2,
        telephonyRadio: 3,
      },
    },
    slaReminders: [],
    servers: INITIAL_SERVERS,
    licenses: INITIAL_LICENSES,
    physicalInspections: DEFAULT_PHYSICAL_ROOMS.map((r, i) => ({
      ...r,
      completed: true,
      photoEvidenceUrl: i === 0 ? SAMPLE_INSPECTION_PROOFS.maleo : i === 1 ? SAMPLE_INSPECTION_PROOFS.tarsius : SAMPLE_INSPECTION_PROOFS.cendrawasih,
      photoTimestamp: '2026-10-03 06:14:00 WITA',
    })),
    executiveSummary: 'All morning checks nominal. VTC conference suites tested before 07:00 AM briefing. SCADA data diode firewall verified. Zero critical system downtime.',
    shiftHandoverNotes: 'Shift handover briefing completed to night shift team.',
    auditTrail: [],
  },
  {
    id: 'DSLNG-REP-20260929-01',
    reportDate: '2026-09-29',
    location: 'Site Uso',
    status: 'REJECTED',
    dutyEngineerId: 'admin-it-01',
    dutyEngineerName: 'Administrator IT DSLNG (Super Admin)',
    dutyEngineerShift: 'Shift A (06.00 - 18.00 WITA)',
    dutyEngineerBadge: 'DSLNG-ADM-001',
    submittedAt: '2026-09-29 18:02:15 WITA',
    immutableLockHash: 'a718c23398fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852ab41',
    tickets: {
      open: 21,
      onHold: 4,
      pendingUser: 8,
      closedToday: 11,
      slaBreached: 2,
      slaAtRisk: 3,
      categoryBreakdown: {
        network: 6,
        hardware: 8,
        sapErp: 12,
        m365Email: 14,
        scadaTerminal: 3,
        telephonyRadio: 5,
      },
    },
    slaReminders: [],
    servers: INITIAL_SERVERS,
    licenses: INITIAL_LICENSES,
    physicalInspections: DEFAULT_PHYSICAL_ROOMS.map(r => ({
      ...r,
      completed: true,
      photoEvidenceUrl: SAMPLE_INSPECTION_PROOFS.maleo,
      photoTimestamp: '2026-09-29 06:40:00 WITA',
    })),
    executiveSummary: '2 SLA breaches encountered due to delayed user confirmation on Marine Jetty terminal network.',
    shiftHandoverNotes: 'Escalated to vendor.',
    superiorReview: {
      managerId: 'mgr-ict-history',
      managerName: 'Superior ICT Manager',
      reviewedAt: '2026-09-29 19:10:00 WIB',
      decision: 'REJECTED',
      comments: 'Rejected: RCA for SLA breach #INC-2026-0899 was missing required root cause documentation. Please revise details in maintenance log.',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M 20 40 Q 60 10 90 35 T 140 25 T 180 30" fill="none" stroke="%23ef4444" stroke-width="2.5"/></svg>',
      digitalStampId: 'DSLNG-CERT-REJECTION-20260929-SUP01',
    },
    auditTrail: [],
  },
];
