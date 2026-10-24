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

export const INITIAL_SERVERS: ServerCheck[] = [
  {
    id: 'srv-01',
    name: 'SRV-DC01-USO (Domain Controller)',
    location: 'Site Uso Server Room',
    role: 'Active Directory, DNS & DHCP Site Uso',
    status: 'ONLINE',
    latencyMs: 1,
    lastChecked: '06:05 WITA',
    notes: 'CPU 28%, Memory 44%, Disk C: 120GB Free. Replication healthy.',
  },
  {
    id: 'srv-02',
    name: 'SRV-DC02-HO (Secondary DC)',
    location: 'HO Jakarta Server Rack',
    role: 'Active Directory Replica & Corporate DNS',
    status: 'ONLINE',
    latencyMs: 26,
    lastChecked: '06:08 WITA',
    notes: 'IPSec VPN Tunnel latency nominal.',
  },
  {
    id: 'srv-03',
    name: 'SRV-ERP-SAP01 (SAP Production)',
    location: 'Site Uso Server Room',
    role: 'SAP ECC 6.0 Database & Application Server',
    status: 'ONLINE',
    latencyMs: 2,
    lastChecked: '06:10 WITA',
    notes: 'Oracle DB listener active. Buffer cache 98%.',
  },
  {
    id: 'srv-04',
    name: 'SRV-MES-APP01 (MES Telemetry)',
    location: 'Site Uso Control Building',
    role: 'MES Production Historian & Modbus Gateway',
    status: 'ONLINE',
    latencyMs: 1,
    lastChecked: '06:12 WITA',
    notes: 'Telemetry ingestion 12,400 tags/sec. Zero packet loss.',
  },
  {
    id: 'srv-05',
    name: 'SRV-NET-CORE01 (Core & Radio Trunking)',
    location: 'Site Uso Telecom Tower',
    role: 'Cisco Catalyst 9500 & Motorola TETRA Gateway',
    status: 'ONLINE',
    latencyMs: 1,
    lastChecked: '06:15 WITA',
    notes: 'Trunking channel 1-8 active, SNR nominal 34dB.',
  },
  {
    id: 'srv-06',
    name: 'SRV-SCADA-HIST01 (SCADA Data Diode)',
    location: 'Site Uso CCR Room',
    role: 'Plant SCADA Historian One-Way Diode Server',
    status: 'ONLINE',
    latencyMs: 2,
    lastChecked: '06:18 WITA',
    notes: 'Physical fiber rx diode active. Strict isolation verified.',
  },
];

export const INITIAL_LICENSES: LicenseStatus = {
  m365E3Total: 150,
  m365E3Assigned: 142,
  m365E5Total: 40,
  m365E5Assigned: 38,
  autocadFloatingTotal: 25,
  autocadFloatingInUse: 22,
  items: [
    {
      id: 'lic-01',
      softwareName: 'Microsoft 365 E3',
      category: 'MS365',
      totalLicenses: 150,
      assignedLicenses: 142,
      availableLicenses: 8,
      vendor: 'Microsoft Corp',
      notes: 'Standard enterprise mail, SharePoint, Teams & Office apps',
    },
    {
      id: 'lic-02',
      softwareName: 'Microsoft 365 E5',
      category: 'MS365',
      totalLicenses: 40,
      assignedLicenses: 38,
      availableLicenses: 2,
      vendor: 'Microsoft Corp',
      notes: 'Advanced Compliance, Defender for Endpoint & Power BI Pro',
    },
    {
      id: 'lic-03',
      softwareName: 'Microsoft 365 Business Standard',
      category: 'MS365',
      totalLicenses: 60,
      assignedLicenses: 55,
      availableLicenses: 5,
      vendor: 'Microsoft Corp',
      notes: 'Site contractor & partner access pool',
    },
    {
      id: 'lic-04',
      softwareName: 'AutoCAD AEC Collection (Floating)',
      category: 'OTHERS',
      totalLicenses: 25,
      assignedLicenses: 22,
      availableLicenses: 3,
      vendor: 'Autodesk',
      notes: 'Network license server on SRV-LIC-01',
    },
    {
      id: 'lic-05',
      softwareName: 'SAP GUI Professional / Named User',
      category: 'OTHERS',
      totalLicenses: 85,
      assignedLicenses: 80,
      availableLicenses: 5,
      vendor: 'SAP AG',
      notes: 'Finance, MM, PM & Production users',
    },
    {
      id: 'lic-06',
      softwareName: 'Adobe Creative Cloud All Apps',
      category: 'OTHERS',
      totalLicenses: 15,
      assignedLicenses: 13,
      availableLicenses: 2,
      vendor: 'Adobe',
      notes: 'Corporate Communications & Technical Documentation',
    },
    {
      id: 'lic-07',
      softwareName: 'Primavera P6 EPPM',
      category: 'OTHERS',
      totalLicenses: 10,
      assignedLicenses: 8,
      availableLicenses: 2,
      vendor: 'Oracle',
      notes: 'Plant Shutdown & Turnaround Project Planning',
    },
  ],
  userAssignments: [
    {
      id: 'asg-01',
      userName: 'Ahmad Fauzi',
      department: 'Process Engineering Site Uso',
      softwareName: 'Microsoft 365 E3',
      assignedDate: '2026-10-01',
      ticketRef: 'REQ-202610-019',
      assignedBy: 'Administrator IT DSLNG',
      notes: 'New Process Specialist onboarding',
    },
    {
      id: 'asg-02',
      userName: 'Rian Hidayat',
      department: 'Maintenance & Reliability',
      softwareName: 'AutoCAD AEC Collection (Floating)',
      assignedDate: '2026-10-02',
      ticketRef: 'REQ-202610-025',
      assignedBy: 'Administrator IT DSLNG',
      notes: 'P&ID drafting terminal assignment',
    },
  ],
  purchases: [
    {
      id: 'pur-01',
      softwareName: 'Microsoft 365 Copilot Add-on',
      targetUser: 'Executive & Department Heads (5 Users)',
      department: 'Management & Operations',
      quantity: 5,
      poNumber: 'PO-2026-ICT-088',
      vendor: 'PT Astragraphia Information Technology',
      purchaseDate: '2026-09-28',
      status: 'DEPLOYED',
      notes: 'Pilot implementation batch 1 approved by ICT Manager',
    },
    {
      id: 'pur-02',
      softwareName: 'JetBrains All Products Pack',
      targetUser: 'MES Automation Developer',
      department: 'ICT MES & Automation',
      quantity: 2,
      poNumber: 'PO-2026-ICT-091',
      vendor: 'JetBrains s.r.o.',
      purchaseDate: '2026-10-01',
      status: 'ACTIVE',
      notes: 'For internal telemetry integration API scripts',
    },
  ],
  expirations: [
    {
      software: 'Microsoft 365 Enterprise EA',
      seats: 190,
      daysRemaining: 184,
      vendor: 'Microsoft Singapore / PT Astragraphia',
    },
    {
      software: 'AutoCAD AEC Multi-User Floating',
      seats: 25,
      daysRemaining: 72,
      vendor: 'Autodesk Authorized Partner',
    },
    {
      software: 'SAP Enterprise Support Maintenance',
      seats: 85,
      daysRemaining: 215,
      vendor: 'SAP Indonesia',
    },
  ],
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
        helpdesk: 8,
        mes: 3,
        erp: 8,
        networkTelecomRadio: 7,
      },
    },
    slaTickets: [
      {
        id: 'sla-t-01',
        ticketNumber: 'INC-202610-014',
        subject: 'SAP S/4HANA PO Release Workflow Delayed',
        requester: 'Supply Chain Desk Site Uso',
        category: 'ERP',
        overSlaTime: '1 Jam 45 Menit',
        slaStatus: 'SLA_AT_RISK',
        technician: 'Administrator IT DSLNG',
        notes: 'SAP Gateway queue depth observed high. Cleared background job lock.',
      },
    ],
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
        helpdesk: 10,
        mes: 2,
        erp: 10,
        networkTelecomRadio: 5,
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
        helpdesk: 9,
        mes: 2,
        erp: 8,
        networkTelecomRadio: 6,
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
    superiorReview: {
      managerId: 'mgr-ict-history',
      managerName: 'Superior ICT Manager',
      reviewedAt: '2026-10-03 18:20:10 WIB',
      decision: 'APPROVED',
      comments: 'All meeting rooms inspected and functional before morning briefing. SCADA and server checks verified.',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M 20 40 Q 60 10 90 35 T 140 25 T 180 30" fill="none" stroke="%230ea5e9" stroke-width="2.5"/></svg>',
      digitalStampId: 'DSLNG-CERT-APPROVAL-20261003-SUP01',
    },
    auditTrail: [],
  },
  {
    id: 'DSLNG-REP-20261004-01',
    reportDate: '2026-10-04',
    location: 'Site Uso',
    status: 'APPROVED',
    dutyEngineerId: 'admin-it-01',
    dutyEngineerName: 'Administrator IT DSLNG (Super Admin)',
    dutyEngineerShift: 'Shift A (06.00 - 18.00 WITA)',
    dutyEngineerBadge: 'DSLNG-ADM-001',
    submittedAt: '2026-10-04 17:48:30 WITA',
    immutableLockHash: 'e71a40998fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852ba44',
    tickets: {
      open: 11,
      onHold: 1,
      pendingUser: 3,
      closedToday: 15,
      slaBreached: 0,
      slaAtRisk: 0,
      categoryBreakdown: {
        helpdesk: 5,
        mes: 1,
        erp: 5,
        networkTelecomRadio: 4,
      },
    },
    slaReminders: [],
    servers: INITIAL_SERVERS,
    licenses: INITIAL_LICENSES,
    physicalInspections: DEFAULT_PHYSICAL_ROOMS.map((r, i) => ({
      ...r,
      completed: true,
      photoEvidenceUrl: i === 0 ? SAMPLE_INSPECTION_PROOFS.maleo : i === 1 ? SAMPLE_INSPECTION_PROOFS.tarsius : SAMPLE_INSPECTION_PROOFS.cendrawasih,
      photoTimestamp: '2026-10-04 06:18:00 WITA',
    })),
    executiveSummary: 'Sunday duty shift completed with zero operational issues. Backup generation verification completed. Telephony and microwave link to Luwuk tested nominal.',
    shiftHandoverNotes: 'Handover to Monday morning roster team complete. Ready for plant management briefing.',
    superiorReview: {
      managerId: 'mgr-ict-history',
      managerName: 'Superior ICT Manager',
      reviewedAt: '2026-10-04 18:35:00 WIB',
      decision: 'APPROVED',
      comments: 'Weekend shift duty report verified. All physical facilities ready for Monday operations.',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M 20 40 Q 60 10 90 35 T 140 25 T 180 30" fill="none" stroke="%230ea5e9" stroke-width="2.5"/></svg>',
      digitalStampId: 'DSLNG-CERT-APPROVAL-20261004-SUP01',
    },
    auditTrail: [],
  },
  {
    id: 'DSLNG-REP-20261005-01',
    reportDate: '2026-10-05',
    location: 'Site Uso',
    status: 'APPROVED',
    dutyEngineerId: 'admin-it-01',
    dutyEngineerName: 'Administrator IT DSLNG (Super Admin)',
    dutyEngineerShift: 'Shift A (06.00 - 18.00 WITA)',
    dutyEngineerBadge: 'DSLNG-ADM-001',
    submittedAt: '2026-10-05 17:52:10 WITA',
    immutableLockHash: 'c93b11098fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852de91',
    tickets: {
      open: 18,
      onHold: 2,
      pendingUser: 5,
      closedToday: 24,
      slaBreached: 0,
      slaAtRisk: 1,
      categoryBreakdown: {
        helpdesk: 11,
        mes: 3,
        erp: 11,
        networkTelecomRadio: 8,
      },
    },
    slaReminders: [],
    servers: INITIAL_SERVERS,
    licenses: INITIAL_LICENSES,
    physicalInspections: DEFAULT_PHYSICAL_ROOMS.map((r, i) => ({
      ...r,
      completed: true,
      photoEvidenceUrl: i === 0 ? SAMPLE_INSPECTION_PROOFS.maleo : i === 1 ? SAMPLE_INSPECTION_PROOFS.tarsius : SAMPLE_INSPECTION_PROOFS.cendrawasih,
      photoTimestamp: '2026-10-05 06:12:00 WITA',
    })),
    executiveSummary: 'Full Monday operational cycle executed smoothly. VTC setup for Board of Directors hybrid meeting successfully hosted in Maleo Conference Room. SCADA real-time data flow 100% available.',
    shiftHandoverNotes: 'Shift handover briefing completed with evening on-call personnel. Monitored AutoCAD license peaks.',
    superiorReview: {
      managerId: 'mgr-ict-history',
      managerName: 'Superior ICT Manager',
      reviewedAt: '2026-10-05 18:25:40 WIB',
      decision: 'APPROVED',
      comments: 'Excellent support for Board meeting VTC. High ticket resolution rate today. Approved.',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M 20 40 Q 60 10 90 35 T 140 25 T 180 30" fill="none" stroke="%230ea5e9" stroke-width="2.5"/></svg>',
      digitalStampId: 'DSLNG-CERT-APPROVAL-20261005-SUP01',
    },
    auditTrail: [],
  },
  {
    id: 'DSLNG-REP-20261006-01',
    reportDate: '2026-10-06',
    location: 'Site Uso',
    status: 'APPROVED',
    dutyEngineerId: 'admin-it-01',
    dutyEngineerName: 'Administrator IT DSLNG (Super Admin)',
    dutyEngineerShift: 'Shift A (06.00 - 18.00 WITA)',
    dutyEngineerBadge: 'DSLNG-ADM-001',
    submittedAt: '2026-10-06 17:45:00 WITA',
    immutableLockHash: 'b48e22098fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852cc55',
    tickets: {
      open: 13,
      onHold: 2,
      pendingUser: 4,
      closedToday: 20,
      slaBreached: 0,
      slaAtRisk: 0,
      categoryBreakdown: {
        helpdesk: 7,
        mes: 2,
        erp: 9,
        networkTelecomRadio: 5,
      },
    },
    slaReminders: [],
    servers: INITIAL_SERVERS,
    licenses: INITIAL_LICENSES,
    physicalInspections: DEFAULT_PHYSICAL_ROOMS.map((r, i) => ({
      ...r,
      completed: true,
      photoEvidenceUrl: i === 0 ? SAMPLE_INSPECTION_PROOFS.maleo : i === 1 ? SAMPLE_INSPECTION_PROOFS.tarsius : SAMPLE_INSPECTION_PROOFS.cendrawasih,
      photoTimestamp: '2026-10-06 06:15:00 WITA',
    })),
    executiveSummary: 'Routine operations maintained. Fiber optic link testing completed between CCR and Administration Building. Network throughput and packet loss within strict thresholds (<0.01%).',
    shiftHandoverNotes: 'All urgent helpdesk tickets closed. Shift handover completed.',
    superiorReview: {
      managerId: 'mgr-ict-history',
      managerName: 'Superior ICT Manager',
      reviewedAt: '2026-10-06 18:18:00 WIB',
      decision: 'APPROVED',
      comments: 'Network latency checks verified. Great job on fiber optic link maintenance.',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M 20 40 Q 60 10 90 35 T 140 25 T 180 30" fill="none" stroke="%230ea5e9" stroke-width="2.5"/></svg>',
      digitalStampId: 'DSLNG-CERT-APPROVAL-20261006-SUP01',
    },
    auditTrail: [],
  },
  {
    id: 'DSLNG-REP-20261007-01',
    reportDate: '2026-10-07',
    location: 'Site Uso',
    status: 'SUBMITTED',
    dutyEngineerId: 'admin-it-01',
    dutyEngineerName: 'Administrator IT DSLNG (Super Admin)',
    dutyEngineerShift: 'Shift A (06.00 - 18.00 WITA)',
    dutyEngineerBadge: '00001',
    submittedAt: '2026-10-07 07:15:00 WITA',
    immutableLockHash: 'f72a91098fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852ff88',
    tickets: {
      open: 12,
      onHold: 1,
      pendingUser: 3,
      closedToday: 18,
      slaBreached: 0,
      slaAtRisk: 0,
      categoryBreakdown: {
        helpdesk: 6,
        mes: 2,
        erp: 7,
        networkTelecomRadio: 4,
      },
    },
    slaReminders: [],
    servers: INITIAL_SERVERS,
    licenses: INITIAL_LICENSES,
    physicalInspections: DEFAULT_PHYSICAL_ROOMS.map((r, i) => ({
      ...r,
      completed: true,
      photoEvidenceUrl: i === 0 ? SAMPLE_INSPECTION_PROOFS.maleo : i === 1 ? SAMPLE_INSPECTION_PROOFS.tarsius : SAMPLE_INSPECTION_PROOFS.cendrawasih,
      photoTimestamp: '2026-10-07 06:10:00 WITA',
    })),
    executiveSummary: 'Laporan shift harian terkini (Real-time). Pemeriksaan fasilitas Maleo, Tarsius, dan Cendrawasih selesai sebelum briefing pukul 07.00. Server CCR, ERP, dan SCADA 100% ONLINE.',
    shiftHandoverNotes: 'Shift pagi sedang berjalan secara live real-time.',
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
        helpdesk: 14,
        mes: 4,
        erp: 12,
        networkTelecomRadio: 9,
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
