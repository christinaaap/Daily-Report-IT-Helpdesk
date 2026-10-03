import { TeamMember, DailyReport, PhysicalInspectionItem, ServerCheck, LicenseStatus, SLAReminderItem } from '../types';

export const TEAM_MEMBERS: TeamMember[] = [
  // HO Jakarta (2 Engineers)
  {
    id: 'eng-ho-1',
    name: 'Budi Santoso',
    email: 'budi.santoso@donggi-senoro.com',
    badgeNumber: 'DSLNG-JKT-082',
    location: 'HO Jakarta',
    role: 'HELPDESK_ENGINEER',
    shift: 'HO Shift A (07:00 - 17:00)',
    isDutyEligible: false,
    phone: '+62 21 2997 0100',
  },
  {
    id: 'eng-ho-2',
    name: 'Reza Pratama',
    email: 'reza.pratama@donggi-senoro.com',
    badgeNumber: 'DSLNG-JKT-089',
    location: 'HO Jakarta',
    role: 'HELPDESK_ENGINEER',
    shift: 'HO Shift B (08:00 - 17:00)',
    isDutyEligible: false,
    phone: '+62 21 2997 0101',
  },

  // Site Luwuk (4 Engineers)
  {
    id: 'eng-site-1',
    name: 'Christina Angraeni Panellah',
    email: 'christina.angraeni@donggi-senoro.com',
    badgeNumber: 'DSLNG-LWK-104',
    location: 'Site Luwuk',
    role: 'DUTY_ENGINEER',
    shift: 'Site Early (06:00 - 18:00)', // Current Duty Engineer (working Sun duty + Mon-Sat early cycle)
    isDutyEligible: true,
    phone: '+62 453 312 8041',
  },
  {
    id: 'eng-site-2',
    name: 'Fajar Hidayat',
    email: 'fajar.hidayat@donggi-senoro.com',
    badgeNumber: 'DSLNG-LWK-112',
    location: 'Site Luwuk',
    role: 'HELPDESK_ENGINEER',
    shift: 'Site Regular (07:00 - 18:00)',
    isDutyEligible: false,
    phone: '+62 453 312 8042',
  },
  {
    id: 'eng-site-3',
    name: 'Dian Kusuma',
    email: 'dian.kusuma@donggi-senoro.com',
    badgeNumber: 'DSLNG-LWK-118',
    location: 'Site Luwuk',
    role: 'HELPDESK_ENGINEER',
    shift: 'Site Regular (07:00 - 18:00)',
    isDutyEligible: false,
    phone: '+62 453 312 8043',
  },
  {
    id: 'eng-site-4',
    name: 'Wahyu Setiawan',
    email: 'wahyu.setiawan@donggi-senoro.com',
    badgeNumber: 'DSLNG-LWK-125',
    location: 'Site Luwuk',
    role: 'HELPDESK_ENGINEER',
    shift: 'Site Regular (07:00 - 18:00)',
    isDutyEligible: false,
    phone: '+62 453 312 8044',
  },

  // Superior / ICT Manager
  {
    id: 'mgr-ict-1',
    name: 'Hendra Wijaya',
    email: 'hendra.wijaya@donggi-senoro.com',
    badgeNumber: 'DSLNG-MGR-004',
    location: 'HO Jakarta',
    role: 'ICT_MANAGER',
    shift: 'HO Shift A (07:00 - 17:00)',
    isDutyEligible: false,
    phone: '+62 21 2997 0004',
  },
];

export const INITIAL_SERVERS: ServerCheck[] = [
  {
    id: 'srv-01',
    name: 'DC-LWK-01 (Primary Domain Controller)',
    location: 'Site Luwuk Server Room (Bldg A)',
    role: 'Active Directory / DNS / DHCP',
    status: 'ONLINE',
    latencyMs: 2,
    lastChecked: '06:05 AM',
    notes: 'Replication sync nominal with HO-JKT-DC01',
  },
  {
    id: 'srv-02',
    name: 'DC-JKT-01 (Head Office Node)',
    location: 'HO Jakarta Data Center',
    role: 'Secondary DC & Azure AD Connect',
    status: 'ONLINE',
    latencyMs: 28,
    lastChecked: '06:05 AM',
    notes: 'MPLS link bandwidth utilization 34%',
  },
  {
    id: 'srv-03',
    name: 'GW-IND-01 (SCADA / DCS Secure Gateway)',
    location: 'Site Luwuk Plant Process Unit',
    role: 'Yokogawa Centum VP Data Diode Bridge',
    status: 'ONLINE',
    latencyMs: 1,
    lastChecked: '06:08 AM',
    notes: 'Redundant firewall failover test passed',
  },
  {
    id: 'srv-04',
    name: 'FS-LWK-01 (Site Technical File Cluster)',
    location: 'Site Luwuk Server Room (Bldg A)',
    role: 'Engineering CAD & P&ID Storage Repository',
    status: 'ONLINE',
    latencyMs: 3,
    lastChecked: '06:10 AM',
    notes: 'Volume E: 72% used, healthy deduplication',
  },
  {
    id: 'srv-05',
    name: 'MAIL-RELAY-02 (SMTP Hybrid Edge)',
    location: 'HO Jakarta Data Center',
    role: 'Exchange Hybrid Relay & Proofpoint Filter',
    status: 'ONLINE',
    latencyMs: 31,
    lastChecked: '06:12 AM',
    notes: 'No queued outbound alerts',
  },
  {
    id: 'srv-06',
    name: 'SW-CORE-01 (Cisco Catalyst 9500 Backbone)',
    location: 'Site Luwuk MDF Central Hub',
    role: 'Core Fiber Distribution for Plant & Camp',
    status: 'ONLINE',
    latencyMs: 1,
    lastChecked: '06:15 AM',
    notes: 'Optical power levels all within nominal dBm',
  },
  {
    id: 'srv-07',
    name: 'NVR-SITE-04 (Milestone CCTV Storage)',
    location: 'Site Luwuk Security Annex',
    role: 'Terminal Jetty & Perimeter Perimeter NVR',
    status: 'ONLINE',
    latencyMs: 4,
    lastChecked: '06:20 AM',
    notes: '48/48 IP Cameras recording at 25fps',
  },
];

export const INITIAL_LICENSES: LicenseStatus = {
  m365E3Total: 450,
  m365E3Assigned: 416,
  m365E5Total: 85,
  m365E5Assigned: 82, // Only 3 left
  autocadFloatingTotal: 35,
  autocadFloatingInUse: 29,
  expirations: [
    {
      software: 'AspenTech HYSYS Process Simulation Suite',
      seats: 12,
      daysRemaining: 24,
      vendor: 'Aspen Technology Inc.',
    },
    {
      software: 'Oracle Primavera P6 EPPM Enterprise',
      seats: 25,
      daysRemaining: 48,
      vendor: 'Oracle Indonesia',
    },
    {
      software: 'Fortinet FortiGate UTM Security Fabric',
      seats: 4,
      daysRemaining: 74,
      vendor: 'Fortinet Inc.',
    },
    {
      software: 'Bentley MicroStation Plant 3D',
      seats: 8,
      daysRemaining: 92,
      vendor: 'Bentley Systems',
    },
  ],
};

export const INITIAL_SLA_REMINDERS: SLAReminderItem[] = [
  {
    ticketId: 'INC-2026-0941',
    title: 'Replacement of faulty Cisco IP Phone 8841 at Marine Jetty Office',
    user: 'Capt. Teguh Wibowo',
    department: 'Marine Operations',
    status: 'Finished - Awaiting Confirmation',
    hoursOpen: 18,
    actionRequired: 'Call user extension to prompt ticket closure in portal.',
  },
  {
    ticketId: 'REQ-2026-1108',
    title: 'VPN & Multi-Factor Authentication token re-binding for traveling engineer',
    user: 'Dewi Lestari',
    department: 'Process Engineering',
    status: 'Finished - Awaiting Confirmation',
    hoursOpen: 14,
    actionRequired: 'Verify OTP push and close case before 12:00 PM SLA deadline.',
  },
  {
    ticketId: 'INC-2026-0955',
    title: 'Plotter HP DesignJet T1700 paper jam and printhead calibration',
    user: 'Aris Munandar',
    department: 'Maintenance Planning',
    status: 'In Progress',
    hoursOpen: 4,
    actionRequired: 'Maintenance technician dispatched; ETA 10:00 AM.',
  },
];

// Meeting rooms for physical inspections
export const DEFAULT_PHYSICAL_ROOMS: PhysicalInspectionItem[] = [
  {
    id: 'room-1',
    roomName: 'Maleo Executive Boardroom',
    location: 'Site Luwuk',
    audioStatus: 'PASS',
    videoStatus: 'PASS',
    sharingCablesStatus: 'PASS',
    photoEvidenceUrl: '',
    notes: 'Dual 85" display functional; Polycom ceiling mic array tested clear; HDMI/USB-C cubby retracted neatly.',
    completed: false,
  },
  {
    id: 'room-2',
    roomName: 'Tarsius Operations Room',
    location: 'Site Luwuk',
    audioStatus: 'PASS',
    videoStatus: 'PASS',
    sharingCablesStatus: 'PASS',
    photoEvidenceUrl: '',
    notes: 'Teams Room Console operational; HDMI cable tested with Dell Latitude laptop without flicker.',
    completed: false,
  },
  {
    id: 'room-3',
    roomName: 'Cendrawasih Engineering Room',
    location: 'Site Luwuk',
    audioStatus: 'PASS',
    videoStatus: 'PASS',
    sharingCablesStatus: 'PASS',
    photoEvidenceUrl: '',
    notes: 'Projector lamp hours normal; wireless presentation clicker batteries tested OK.',
    completed: false,
  },
  {
    id: 'room-4',
    roomName: 'Nusantara Boardroom',
    location: 'HO Jakarta',
    audioStatus: 'PASS',
    videoStatus: 'PASS',
    sharingCablesStatus: 'PASS',
    photoEvidenceUrl: '',
    notes: 'Jakarta HO primary hybrid VTC tested with Site Luwuk link; zero packet loss; audio clear.',
    completed: false,
  },
];

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
    location: 'Site Luwuk',
    status: 'APPROVED',
    dutyEngineerId: 'eng-site-1',
    dutyEngineerName: 'Christina Angraeni Panellah',
    dutyEngineerShift: 'Site Early (06:00 - 18:00)',
    dutyEngineerBadge: 'DSLNG-LWK-104',
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
      managerId: 'mgr-ict-1',
      managerName: 'Hendra Wijaya',
      reviewedAt: '2026-10-01 18:30:15 WIB',
      decision: 'APPROVED',
      comments: 'Well organized daily report. Physical inspection photos verified. Good ticket closure throughput.',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M 20 40 Q 60 10 90 35 T 140 25 T 180 30" fill="none" stroke="%230ea5e9" stroke-width="2.5"/></svg>',
      digitalStampId: 'DSLNG-CERT-APPROVAL-20261001-HW01',
    },
    auditTrail: [
      {
        timestamp: '2026-10-01 06:02:10 WITA',
        actorName: 'Christina Angraeni Panellah',
        actorRole: 'Duty Engineer',
        actorBadge: 'DSLNG-LWK-104',
        action: 'REPORT_INITIALIZED',
        details: 'Duty early shift check-in and draft initialized.',
      },
      {
        timestamp: '2026-10-01 06:30:45 WITA',
        actorName: 'Christina Angraeni Panellah',
        actorRole: 'Duty Engineer',
        actorBadge: 'DSLNG-LWK-104',
        action: 'PHYSICAL_INSPECTIONS_COMPLETED',
        details: 'Mandatory photo proof uploaded for 4/4 meeting rooms.',
      },
      {
        timestamp: '2026-10-01 17:45:10 WITA',
        actorName: 'Christina Angraeni Panellah',
        actorRole: 'Duty Engineer',
        actorBadge: 'DSLNG-LWK-104',
        action: 'REPORT_SUBMITTED_AND_LOCKED',
        details: 'Report permanently locked with SHA-256 hash e3b0c442...',
      },
      {
        timestamp: '2026-10-01 18:30:15 WIB',
        actorName: 'Hendra Wijaya',
        actorRole: 'ICT Operations Manager',
        actorBadge: 'DSLNG-MGR-004',
        action: 'SUPERIOR_APPROVED',
        details: 'Report formally approved with digital e-signature DSLNG-CERT-APPROVAL-20261001-HW01.',
      },
    ],
  },
  {
    id: 'DSLNG-REP-20261002-01',
    reportDate: '2026-10-02',
    location: 'Site Luwuk',
    status: 'APPROVED',
    dutyEngineerId: 'eng-site-1',
    dutyEngineerName: 'Christina Angraeni Panellah',
    dutyEngineerShift: 'Site Early (06:00 - 18:00)',
    dutyEngineerBadge: 'DSLNG-LWK-104',
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
      managerId: 'mgr-ict-1',
      managerName: 'Hendra Wijaya',
      reviewedAt: '2026-10-02 18:15:20 WIB',
      decision: 'APPROVED',
      comments: 'Good job managing the fiber switch maintenance window without operational disruption.',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M 20 40 Q 60 10 90 35 T 140 25 T 180 30" fill="none" stroke="%230ea5e9" stroke-width="2.5"/></svg>',
      digitalStampId: 'DSLNG-CERT-APPROVAL-20261002-HW01',
    },
    auditTrail: [
      {
        timestamp: '2026-10-02 06:05:00 WITA',
        actorName: 'Christina Angraeni Panellah',
        actorRole: 'Duty Engineer',
        actorBadge: 'DSLNG-LWK-104',
        action: 'REPORT_INITIALIZED',
        details: 'Duty early shift check-in and draft initialized.',
      },
      {
        timestamp: '2026-10-02 17:50:40 WITA',
        actorName: 'Christina Angraeni Panellah',
        actorRole: 'Duty Engineer',
        actorBadge: 'DSLNG-LWK-104',
        action: 'REPORT_SUBMITTED_AND_LOCKED',
        details: 'Report permanently locked with SHA-256 hash f4b1c233...',
      },
      {
        timestamp: '2026-10-02 18:15:20 WIB',
        actorName: 'Hendra Wijaya',
        actorRole: 'ICT Operations Manager',
        actorBadge: 'DSLNG-MGR-004',
        action: 'SUPERIOR_APPROVED',
        details: 'Report formally approved with digital e-signature.',
      },
    ],
  },
  {
    id: 'DSLNG-REP-20260929-01',
    reportDate: '2026-09-29',
    location: 'Site Luwuk',
    status: 'REJECTED',
    dutyEngineerId: 'eng-site-2',
    dutyEngineerName: 'Fajar Hidayat',
    dutyEngineerShift: 'Site Early (06:00 - 18:00)',
    dutyEngineerBadge: 'DSLNG-LWK-112',
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
      managerId: 'mgr-ict-1',
      managerName: 'Hendra Wijaya',
      reviewedAt: '2026-09-29 19:10:00 WIB',
      decision: 'REJECTED',
      comments: 'Rejected: RCA for SLA breach #INC-2026-0899 was missing required root cause documentation. Please revise details in maintenance log.',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M 20 40 Q 60 10 90 35 T 140 25 T 180 30" fill="none" stroke="%23ef4444" stroke-width="2.5"/></svg>',
      digitalStampId: 'DSLNG-CERT-REJECTION-20260929-HW01',
    },
    auditTrail: [
      {
        timestamp: '2026-09-29 18:02:15 WITA',
        actorName: 'Fajar Hidayat',
        actorRole: 'Duty Engineer',
        actorBadge: 'DSLNG-LWK-112',
        action: 'REPORT_SUBMITTED_AND_LOCKED',
        details: 'Report submitted and locked.',
      },
      {
        timestamp: '2026-09-29 19:10:00 WIB',
        actorName: 'Hendra Wijaya',
        actorRole: 'ICT Operations Manager',
        actorBadge: 'DSLNG-MGR-004',
        action: 'SUPERIOR_REJECTED',
        details: 'Rejected with revision request by ICT Manager.',
      },
    ],
  },
];
