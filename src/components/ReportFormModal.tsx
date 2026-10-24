import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  Server,
  FileKey,
  Video,
  Ticket,
  CheckCircle2,
  AlertTriangle,
  Send,
  Lock,
  RefreshCw,
  Layers,
  Info,
  Plus,
  Trash2,
  UserCheck,
  Clock,
  Mail,
  MapPin,
  FileText,
  Package,
  Wrench,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import {
  TicketMetrics,
  SLATicketDetail,
  ServerCheck,
  LicenseStatus,
  PhysicalInspectionItem,
  TicketCategory,
  LicenseInventoryItem,
  LicenseAssignment,
  MailboxCrowdstrikeMetrics,
  MailboxCrowdstrikeDetailItem,
  OperationalSummaryExceptions,
} from '../types';
import {
  INITIAL_SERVERS,
  INITIAL_LICENSES,
} from '../data/mockData';
import { PhotoUploadField } from './PhotoUploadField';

interface ReportFormModalProps {
  date: string;
}

export type FormSection = 'TICKETS' | 'SERVERS' | 'LICENSES' | 'MEETING_ROOMS' | 'MAILBOX_CROWDSTRIKE' | 'SUMMARY';

export const ReportFormModal: React.FC<ReportFormModalProps> = ({ date }) => {
  const {
    closeModal,
    submitDailyReport,
    currentUser,
    showToast,
    servers: contextServers,
    addServer,
    meetingRooms: contextMeetingRooms,
  } = useApp();

  // Active form section tab (6 sections as requested):
  // 1. Tickets & SLA * | 2. Server Check * | 3. MS365 and Software Others | 4. Physical Check Meeting Room | 5. Mailbox and CrowdStrike | 6. Summary
  const [activeSection, setActiveSection] = useState<FormSection>('TICKETS');

  // Form State - Section 1
  const [tickets, setTickets] = useState<TicketMetrics>({
    open: 18,
    onHold: 3,
    pendingUser: 7,
    closedToday: 24,
    slaBreached: 0,
    slaAtRisk: 1,
    categoryBreakdown: {
      helpdesk: 14,
      mes: 3,
      erp: 9,
      networkTelecomRadio: 6,
    },
  });

  // Section 1: Detailed SLA Breached & At Risk Tickets
  const [slaTickets, setSlaTickets] = useState<SLATicketDetail[]>([
    {
      id: 'sla-init-1',
      ticketNumber: 'INC-202610-042',
      subject: 'SAP S/4HANA PO Release Workflow Delayed',
      requester: 'Supply Chain Desk Site Uso',
      category: 'ERP',
      overSlaTime: '1 Jam 40 Menit',
      slaStatus: 'SLA_AT_RISK',
      technician: currentUser.name,
      notes: 'Investigating background spool memory queue',
    },
  ]);
  const [slaFilter, setSlaFilter] = useState<'ALL' | 'SLA_BREACHED' | 'SLA_AT_RISK'>('ALL');

  // Auto-sync SLA tickets count when slaBreached or slaAtRisk changes
  useEffect(() => {
    const totalTarget = tickets.slaBreached + tickets.slaAtRisk;
    if (totalTarget === 0 && slaTickets.length > 0) {
      return;
    }
    if (totalTarget > slaTickets.length) {
      const diff = totalTarget - slaTickets.length;
      const newItems: SLATicketDetail[] = [];
      for (let i = 0; i < diff; i++) {
        const isBreach = tickets.slaBreached > slaTickets.filter(t => t.slaStatus === 'SLA_BREACHED').length;
        newItems.push({
          id: `sla-${Date.now()}-${i}`,
          ticketNumber: `INC-${date.replace(/-/g, '').slice(2)}-0${slaTickets.length + i + 1}`,
          subject: '',
          requester: '',
          category: 'Helpdesk',
          overSlaTime: isBreach ? '2 Jam' : '45 Menit',
          slaStatus: isBreach ? 'SLA_BREACHED' : 'SLA_AT_RISK',
          technician: currentUser.name,
          notes: '',
        });
      }
      setSlaTickets(prev => [...prev, ...newItems]);
    }
  }, [tickets.slaBreached, tickets.slaAtRisk, date, currentUser.name]);

  // Section 2: Server Check state (populated from Admin server master list)
  const [servers, setServers] = useState<ServerCheck[]>(() => {
    if (contextServers && contextServers.length > 0) {
      return contextServers.map(s => ({ ...s }));
    }
    return INITIAL_SERVERS.map(s => ({ ...s }));
  });

  const [isAddServerOpen, setIsAddServerOpen] = useState(false);
  const [newServerName, setNewServerName] = useState('');
  const [newServerLocation, setNewServerLocation] = useState('Site Uso Server Room');
  const [newServerNotes, setNewServerNotes] = useState('');

  // Section 3: MS365 dan Software Others state
  const [licenses, setLicenses] = useState<LicenseStatus>(() => ({
    ...INITIAL_LICENSES,
    items: INITIAL_LICENSES.items ? [...INITIAL_LICENSES.items] : [],
    userAssignments: INITIAL_LICENSES.userAssignments ? [...INITIAL_LICENSES.userAssignments] : [],
    purchases: INITIAL_LICENSES.purchases ? [...INITIAL_LICENSES.purchases] : [],
  }));

  const [newAssignment, setNewAssignment] = useState<{
    userName: string;
    department: string;
    softwareName: string;
    ticketRef: string;
    notes: string;
  }>({
    userName: '',
    department: 'Site Operations',
    softwareName: 'Microsoft 365 E3',
    ticketRef: '',
    notes: '',
  });

  // Section 5: Mailbox and CrowdStrike state
  const [mailboxMetrics, setMailboxMetrics] = useState<MailboxCrowdstrikeMetrics>({
    mailboxAlmostFull: 0,
    mailboxFull: 0,
    crowdstrikeMaliciousActivity: 0,
    crowdstrikeInactive30Days: 0,
    notes: '',
    details: [],
  });
  const [newMailboxDetail, setNewMailboxDetail] = useState<{
    type: 'MAILBOX_ALMOST_FULL' | 'MAILBOX_FULL' | 'CROWDSTRIKE_MALICIOUS' | 'CROWDSTRIKE_INACTIVE_30D';
    targetUserOrHost: string;
    departmentOrLocation: string;
    notes: string;
  }>({
    type: 'MAILBOX_ALMOST_FULL',
    targetUserOrHost: '',
    departmentOrLocation: 'Site Uso Operations',
    notes: '',
  });

  // Section 6: Summary & Catatan Operasional
  const [operationalExceptions, setOperationalExceptions] = useState<OperationalSummaryExceptions>({
    newUserRequests: '',
    poFollowUps: '',
    brokenAssets: '',
    generalNotes: '',
  });

  const [newInventorySoftware, setNewInventorySoftware] = useState<{
    softwareName: string;
    category: 'MS365' | 'OTHERS';
    total: number;
    assigned: number;
    vendor: string;
  }>({
    softwareName: '',
    category: 'OTHERS',
    total: 10,
    assigned: 5,
    vendor: '',
  });
  const [showAddInventoryModal, setShowAddInventoryModal] = useState(false);

  // Section 4: Physical inspections (Meeting Rooms)
  const [physicalInspections, setPhysicalInspections] = useState<PhysicalInspectionItem[]>(() =>
    contextMeetingRooms.map(r => ({
      ...r,
      audioStatus: 'PASS',
      videoStatus: 'PASS',
      sharingCablesStatus: 'PASS',
      photoEvidenceUrl: '',
      completed: false,
    }))
  );

  // Section 6: Handover Notes
  const [executiveSummary, setExecutiveSummary] = useState(
    'Daily shift operations completed nominally. All meeting rooms physically inspected and verified. Critical server nodes and services operating healthy.'
  );
  const [shiftHandoverNotes, setShiftHandoverNotes] = useState(
    'Handover to incoming shift completed with zero blocking priority-1 issues.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const missingPhotos = physicalInspections.filter(r => !r.photoEvidenceUrl);
  const isVtcComplete = missingPhotos.length === 0;

  // --- Handlers: SLA Tickets ---
  const handleAddSlaTicket = () => {
    const nextIdx = slaTickets.length + 1;
    const newItem: SLATicketDetail = {
      id: `sla-manual-${Date.now()}`,
      ticketNumber: `INC-${date.replace(/-/g, '').slice(2)}-0${nextIdx}`,
      subject: '',
      requester: '',
      category: 'Helpdesk',
      overSlaTime: '1 Jam',
      slaStatus: 'SLA_AT_RISK',
      technician: currentUser.name,
      notes: '',
    };
    setSlaTickets(prev => [...prev, newItem]);
  };

  const handleUpdateSlaTicket = (id: string, updates: Partial<SLATicketDetail>) => {
    setSlaTickets(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const handleDeleteSlaTicket = (id: string) => {
    setSlaTickets(prev => prev.filter(t => t.id !== id));
  };

  // --- Handlers: Servers ---
  const toggleServerStatus = (id: string, newStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE') => {
    setServers(prev =>
      prev.map(s =>
        s.id === id
          ? {
              ...s,
              status: newStatus,
              lastChecked: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : s
      )
    );
  };

  const handleSetAllServersOnline = () => {
    setServers(prev =>
      prev.map(s => ({
        ...s,
        status: 'ONLINE',
        lastChecked: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }))
    );
    showToast('Seluruh status server berhasil diset ke ONLINE (Normal).', 'success');
  };

  const updateServerNotes = (id: string, notes: string) => {
    setServers(prev => prev.map(s => (s.id === id ? { ...s, notes } : s)));
  };

  const updateServerLatency = (id: string, latencyMs: number) => {
    setServers(prev => prev.map(s => (s.id === id ? { ...s, latencyMs } : s)));
  };

  const handleQuickAddServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServerName.trim()) {
      showToast('Nama server wajib diisi.', 'error');
      return;
    }
    const newSrvData = {
      name: newServerName.trim(),
      location: newServerLocation.trim(),
      status: 'ONLINE' as const,
      notes: newServerNotes.trim() || 'Baru ditambahkan ke master server.',
    };
    addServer(newSrvData);
    setServers(prev => [...prev, { ...newSrvData, id: `srv-${Date.now()}` }]);
    setIsAddServerOpen(false);
    setNewServerName('');
    setNewServerNotes('');
    showToast('Server berhasil ditambahkan ke master server.', 'success');
  };

  // --- Handlers: Licenses ---
  const handleUpdateInventoryItem = (id: string, total: number, assigned: number) => {
    setLicenses(prev => {
      const items = (prev.items || []).map(item => {
        if (item.id === id) {
          const clampedTotal = Math.max(0, total);
          const clampedAssigned = Math.max(0, assigned);
          return {
            ...item,
            totalLicenses: clampedTotal,
            assignedLicenses: clampedAssigned,
            availableLicenses: Math.max(0, clampedTotal - clampedAssigned),
          };
        }
        return item;
      });
      return { ...prev, items };
    });
  };

  const handleAddInventorySoftware = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInventorySoftware.softwareName.trim()) {
      showToast('Nama software wajib diisi.', 'error');
      return;
    }
    const total = Math.max(0, Number(newInventorySoftware.total) || 0);
    const assigned = Math.max(0, Number(newInventorySoftware.assigned) || 0);
    const newItem: LicenseInventoryItem = {
      id: `lic-${Date.now()}`,
      softwareName: newInventorySoftware.softwareName.trim(),
      category: newInventorySoftware.category,
      totalLicenses: total,
      assignedLicenses: assigned,
      availableLicenses: Math.max(0, total - assigned),
      vendor: newInventorySoftware.vendor.trim() || 'Internal License',
      notes: 'Ditambahkan via Shift Report',
    };
    setLicenses(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem],
    }));
    setShowAddInventoryModal(false);
    setNewInventorySoftware({
      softwareName: '',
      category: 'OTHERS',
      total: 10,
      assigned: 5,
      vendor: '',
    });
    showToast('Software berhasil ditambahkan ke inventaris lisensi.', 'success');
  };

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.userName.trim()) {
      showToast('Nama user penerima lisensi wajib diisi.', 'error');
      return;
    }
    const item: LicenseAssignment = {
      id: `asg-${Date.now()}`,
      userName: newAssignment.userName.trim(),
      department: newAssignment.department.trim(),
      softwareName: newAssignment.softwareName,
      assignedDate: date,
      ticketRef: newAssignment.ticketRef.trim() || `REQ-${date.replace(/-/g, '')}-01`,
      assignedBy: currentUser.name,
      notes: newAssignment.notes.trim(),
    };
    setLicenses(prev => ({
      ...prev,
      userAssignments: [item, ...(prev.userAssignments || [])],
    }));
    setNewAssignment({
      userName: '',
      department: 'Site Operations',
      softwareName: 'Microsoft 365 E3',
      ticketRef: '',
      notes: '',
    });
    showToast(`Lisensi ${item.softwareName} berhasil diassign kepada ${item.userName}.`, 'success');
  };

  const handleDeleteAssignment = (id: string) => {
    setLicenses(prev => ({
      ...prev,
      userAssignments: (prev.userAssignments || []).filter(a => a.id !== id),
    }));
  };

  // --- Handlers: Mailbox and CrowdStrike (Synchronized with counters) ---
  const handleUpdateMetricCount = (
    category: 'MAILBOX_ALMOST_FULL' | 'MAILBOX_FULL' | 'CROWDSTRIKE_MALICIOUS' | 'CROWDSTRIKE_INACTIVE_30D',
    newCount: number
  ) => {
    const safeCount = Math.max(0, isNaN(newCount) ? 0 : newCount);
    setMailboxMetrics(prev => {
      const currentDetails = prev.details || [];
      const categoryDetails = currentDetails.filter(d => d.type === category);
      const otherDetails = currentDetails.filter(d => d.type !== category);

      let updatedCategoryDetails = [...categoryDetails];
      if (safeCount > categoryDetails.length) {
        const diff = safeCount - categoryDetails.length;
        const defaultDesc =
          category === 'MAILBOX_ALMOST_FULL'
            ? 'Status kuota > 90%, perlu pembersihan mailbox.'
            : category === 'MAILBOX_FULL'
            ? 'Status kuota 100% penuh, tidak dapat terima email.'
            : category === 'CROWDSTRIKE_MALICIOUS'
            ? 'Deteksi malware/malicious behavior pada endpoint.'
            : 'Sensor agent CrowdStrike offline > 30 hari.';

        for (let i = 0; i < diff; i++) {
          updatedCategoryDetails.push({
            id: `mb-cs-${category.toLowerCase()}-${Date.now()}-${i}`,
            type: category,
            targetUserOrHost: '',
            departmentOrLocation: 'Site Uso Operations',
            notes: defaultDesc,
          });
        }
      } else if (safeCount < categoryDetails.length) {
        updatedCategoryDetails = updatedCategoryDetails.slice(0, safeCount);
      }

      const newAllDetails = [...otherDetails, ...updatedCategoryDetails];

      return {
        ...prev,
        mailboxAlmostFull: category === 'MAILBOX_ALMOST_FULL' ? safeCount : prev.mailboxAlmostFull,
        mailboxFull: category === 'MAILBOX_FULL' ? safeCount : prev.mailboxFull,
        crowdstrikeMaliciousActivity:
          category === 'CROWDSTRIKE_MALICIOUS' ? safeCount : prev.crowdstrikeMaliciousActivity,
        crowdstrikeInactive30Days:
          category === 'CROWDSTRIKE_INACTIVE_30D' ? safeCount : prev.crowdstrikeInactive30Days,
        details: newAllDetails,
      };
    });
  };

  const handleUpdateMailboxDetail = (id: string, updates: Partial<MailboxCrowdstrikeDetailItem>) => {
    setMailboxMetrics(prev => ({
      ...prev,
      details: (prev.details || []).map(d => (d.id === id ? { ...d, ...updates } : d)),
    }));
  };

  const handleAddMailboxDetail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMailboxDetail.targetUserOrHost.trim()) {
      showToast('User email atau Hostname wajib diisi.', 'error');
      return;
    }
    const category = newMailboxDetail.type;
    const newDetail: MailboxCrowdstrikeDetailItem = {
      id: `mb-cs-${Date.now()}`,
      type: category,
      targetUserOrHost: newMailboxDetail.targetUserOrHost.trim(),
      departmentOrLocation: newMailboxDetail.departmentOrLocation.trim() || 'Site Uso Operations',
      notes: newMailboxDetail.notes.trim() || 'Status dipantau helpdesk.',
    };
    setMailboxMetrics(prev => ({
      ...prev,
      mailboxAlmostFull: category === 'MAILBOX_ALMOST_FULL' ? prev.mailboxAlmostFull + 1 : prev.mailboxAlmostFull,
      mailboxFull: category === 'MAILBOX_FULL' ? prev.mailboxFull + 1 : prev.mailboxFull,
      crowdstrikeMaliciousActivity:
        category === 'CROWDSTRIKE_MALICIOUS' ? prev.crowdstrikeMaliciousActivity + 1 : prev.crowdstrikeMaliciousActivity,
      crowdstrikeInactive30Days:
        category === 'CROWDSTRIKE_INACTIVE_30D' ? prev.crowdstrikeInactive30Days + 1 : prev.crowdstrikeInactive30Days,
      details: [...(prev.details || []), newDetail],
    }));
    setNewMailboxDetail({
      type: 'MAILBOX_ALMOST_FULL',
      targetUserOrHost: '',
      departmentOrLocation: 'Site Uso Operations',
      notes: '',
    });
    showToast('Detail rincian berhasil ditambahkan dan jumlah counter otomatis bertambah.', 'success');
  };

  const handleDeleteMailboxDetail = (id: string) => {
    setMailboxMetrics(prev => {
      const itemToDelete = (prev.details || []).find(d => d.id === id);
      const newDetails = (prev.details || []).filter(d => d.id !== id);
      if (!itemToDelete) return { ...prev, details: newDetails };

      return {
        ...prev,
        mailboxAlmostFull:
          itemToDelete.type === 'MAILBOX_ALMOST_FULL'
            ? Math.max(0, prev.mailboxAlmostFull - 1)
            : prev.mailboxAlmostFull,
        mailboxFull:
          itemToDelete.type === 'MAILBOX_FULL' ? Math.max(0, prev.mailboxFull - 1) : prev.mailboxFull,
        crowdstrikeMaliciousActivity:
          itemToDelete.type === 'CROWDSTRIKE_MALICIOUS'
            ? Math.max(0, prev.crowdstrikeMaliciousActivity - 1)
            : prev.crowdstrikeMaliciousActivity,
        crowdstrikeInactive30Days:
          itemToDelete.type === 'CROWDSTRIKE_INACTIVE_30D'
            ? Math.max(0, prev.crowdstrikeInactive30Days - 1)
            : prev.crowdstrikeInactive30Days,
        details: newDetails,
      };
    });
  };

  // --- Handlers: Physical Rooms ---
  const updateRoomInspection = (id: string, updates: Partial<PhysicalInspectionItem>) => {
    setPhysicalInspections(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        const updated = { ...r, ...updates };
        updated.completed = !!(
          updated.photoEvidenceUrl &&
          updated.audioStatus === 'PASS' &&
          updated.videoStatus === 'PASS' &&
          updated.sharingCablesStatus === 'PASS'
        );
        return updated;
      })
    );
  };

  const handleFinalSubmit = async () => {
    // Section 1 Validation (Required *)
    if (tickets.open < 0 || tickets.closedToday < 0) {
      showToast('Section 1 (Tickets & SLA *) wajib diisi dengan benar.', 'error');
      setActiveSection('TICKETS');
      setShowConfirmModal(false);
      return;
    }
    const uncompletedSlaTickets = slaTickets.filter(t => !t.ticketNumber.trim() || !t.technician.trim());
    if (totalSlaItemsCount > 0 && uncompletedSlaTickets.length > 0) {
      showToast('Section 1: Mohon lengkapi nomor tiket dan nama technician pada seluruh tiket over SLA.', 'error');
      setActiveSection('TICKETS');
      setShowConfirmModal(false);
      return;
    }

    // Section 2 Validation (Required *)
    if (servers.length === 0) {
      showToast('Section 2 (Server Check *): Minimal harus terdapat 1 node server yang terverifikasi.', 'error');
      setActiveSection('SERVERS');
      setShowConfirmModal(false);
      return;
    }

    // Section 4 Validation (Physical photos)
    if (!isVtcComplete) {
      showToast(
        `Physical Check Meeting Room: Mohon lampirkan foto bukti fisik untuk seluruh ${physicalInspections.length} ruang meeting sebelum submit.`,
        'error'
      );
      setActiveSection('MEETING_ROOMS');
      setShowConfirmModal(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await submitDailyReport({
        reportDate: date,
        location: currentUser.location,
        dutyEngineerId: currentUser.id,
        dutyEngineerName: currentUser.name,
        dutyEngineerShift: currentUser.shift,
        dutyEngineerBadge: currentUser.badgeNumber,
        tickets: {
          ...tickets,
          slaTickets,
        },
        slaTickets,
        slaReminders: [],
        servers,
        licenses,
        physicalInspections,
        mailboxCrowdstrike: mailboxMetrics,
        operationalExceptions,
        executiveSummary: [
          executiveSummary,
          operationalExceptions.newUserRequests ? `[Request Baru]: ${operationalExceptions.newUserRequests}` : '',
          operationalExceptions.poFollowUps ? `[Follow-up PO]: ${operationalExceptions.poFollowUps}` : '',
          operationalExceptions.brokenAssets ? `[Broken Asset]: ${operationalExceptions.brokenAssets}` : '',
        ].filter(Boolean).join('\n\n'),
        shiftHandoverNotes: [
          shiftHandoverNotes,
          operationalExceptions.generalNotes ? `[Catatan Operasional]: ${operationalExceptions.generalNotes}` : '',
        ].filter(Boolean).join('\n\n'),
      });
      setShowConfirmModal(false);
    } catch (e) {
      console.error(e);
      showToast('Submission failed. Please check form values.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSlaTickets = slaTickets.filter(t => {
    if (slaFilter === 'ALL') return true;
    return t.slaStatus === slaFilter;
  });

  const breachedCount = slaTickets.filter(t => t.slaStatus === 'SLA_BREACHED').length;
  const atRiskCount = slaTickets.filter(t => t.slaStatus === 'SLA_AT_RISK').length;
  const totalSlaItemsCount = tickets.slaBreached + tickets.slaAtRisk;

  const ms365Items = (licenses.items || []).filter(item => item.category === 'MS365');
  const otherLicenseItems = (licenses.items || []).filter(item => item.category === 'OTHERS');

  const SECTIONS: { id: FormSection; label: string; shortLabel: string; isRequired?: boolean }[] = [
    { id: 'TICKETS', label: '1. Tickets & SLA', shortLabel: 'Tiket', isRequired: true },
    { id: 'SERVERS', label: '2. Server Check', shortLabel: 'Server', isRequired: true },
    { id: 'LICENSES', label: '3. MS365 and Software Others', shortLabel: 'Lisensi' },
    { id: 'MEETING_ROOMS', label: '4. Physical Check Meeting Room', shortLabel: 'Meeting' },
    { id: 'MAILBOX_CROWDSTRIKE', label: '5. Mailbox and CrowdStrike', shortLabel: 'Mailbox' },
    { id: 'SUMMARY', label: '6. Summary', shortLabel: 'Summary' },
  ];

  const currentSectionIndex = SECTIONS.findIndex(s => s.id === activeSection);
  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setActiveSection(SECTIONS[currentSectionIndex - 1].id);
    }
  };
  const handleNextSection = () => {
    if (currentSectionIndex < SECTIONS.length - 1) {
      setActiveSection(SECTIONS[currentSectionIndex + 1].id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-1 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl w-full max-w-5xl my-auto shadow-2xl flex flex-col max-h-[96vh] sm:max-h-[92vh] text-slate-900 overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/80">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs shrink-0">
              DR
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 className="text-xs sm:text-base font-bold text-slate-900 truncate">
                  Daily Shift Report: {date}
                </h2>
                <span className="text-[10px] sm:text-[11px] font-mono px-2 py-0.2 rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-200 shrink-0">
                  {currentUser.role === 'ADMINISTRATOR' ? 'Super Admin Mode' : 'Duty Engineer'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                Submitter: {currentUser.name} ({currentUser.badgeNumber}) · {currentUser.shift}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={closeModal}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MOBILE STEPPER: 100% width, No Horizontal Scroll (md:hidden) */}
        <div className="md:hidden px-3 pt-2.5 pb-2 border-b border-slate-200 bg-slate-50/90 shrink-0 space-y-1.5">
          {/* 6 Step Segmented Buttons spanning 100% width */}
          <div className="grid grid-cols-6 gap-1">
            {SECTIONS.map((sec, idx) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  className={`py-1.5 px-0.5 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center relative ${
                    isActive
                      ? 'bg-blue-700 text-white shadow-xs ring-2 ring-blue-600/30'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-0.5 text-xs">
                    {idx + 1}
                    {sec.isRequired && (
                      <span className={`text-[11px] leading-none ${isActive ? 'text-amber-300' : 'text-rose-600'}`}>*</span>
                    )}
                  </span>
                  <span className={`text-[9px] font-medium truncate max-w-full leading-tight ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                    {sec.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Step Indicator & Dropdown Switcher */}
          <div className="flex items-center justify-between gap-1.5">
            <button
              type="button"
              disabled={currentSectionIndex === 0}
              onClick={handlePrevSection}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 shrink-0"
              title="Bagian Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Dropdown Section Selector */}
            <div className="relative flex-1 min-w-0">
              <select
                value={activeSection}
                onChange={e => setActiveSection(e.target.value as FormSection)}
                className="w-full bg-white border border-slate-300 rounded-lg py-1.5 pl-2.5 pr-7 text-xs font-bold text-slate-800 appearance-none focus:outline-none focus:border-blue-600 truncate"
              >
                {SECTIONS.map((sec, idx) => (
                  <option key={sec.id} value={sec.id}>
                    Langkah {idx + 1}/6: {sec.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>

            <button
              type="button"
              disabled={currentSectionIndex === SECTIONS.length - 1}
              onClick={handleNextSection}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 shrink-0"
              title="Bagian Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* DESKTOP TABS: Visible on md and up (hidden md:flex) */}
        <div className="hidden md:flex px-6 pt-3 border-b border-slate-200 bg-white items-center gap-1.5 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveSection('TICKETS')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeSection === 'TICKETS'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>1. Tickets &amp; SLA</span>
            <span className="text-rose-600 font-extrabold text-sm leading-none" title="Wajib Diisi">*</span>
            {(tickets.slaBreached > 0 || tickets.slaAtRisk > 0) && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-100 text-rose-800 font-bold border border-rose-200">
                {tickets.slaBreached + tickets.slaAtRisk}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('SERVERS')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeSection === 'SERVERS'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>2. Server Check</span>
            <span className="text-rose-600 font-extrabold text-sm leading-none" title="Wajib Diisi">*</span>
            <span className="text-[10px] font-mono text-slate-500 font-normal">
              ({servers.filter(s => s.status === 'ONLINE').length}/{servers.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('LICENSES')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeSection === 'LICENSES'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileKey className="w-3.5 h-3.5" />
            <span>3. MS365 and Software Others</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('MEETING_ROOMS')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeSection === 'MEETING_ROOMS'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>4. Physical Check Meeting Room</span>
            {!isVtcComplete ? (
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 rounded font-mono font-medium">
                Photo
              </span>
            ) : (
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('MAILBOX_CROWDSTRIKE')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeSection === 'MAILBOX_CROWDSTRIKE'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>5. Mailbox and CrowdStrike</span>
            {(mailboxMetrics.mailboxAlmostFull > 0 ||
              mailboxMetrics.mailboxFull > 0 ||
              mailboxMetrics.crowdstrikeMaliciousActivity > 0 ||
              mailboxMetrics.crowdstrikeInactive30Days > 0) && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-100 text-amber-800 font-bold border border-amber-200">
                {mailboxMetrics.mailboxAlmostFull +
                  mailboxMetrics.mailboxFull +
                  mailboxMetrics.crowdstrikeMaliciousActivity +
                  mailboxMetrics.crowdstrikeInactive30Days}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('SUMMARY')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeSection === 'SUMMARY'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>6. Summary</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {/* TAB 1: TICKETS & SLA */}
          {activeSection === 'TICKETS' && (
            <div className="space-y-6">
              {/* Status summary */}
              <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <span>Ticket Status Summary (Remedy / Jira Service Management)</span>
                    <span className="text-rose-600 font-extrabold text-sm" title="Wajib Diisi">*</span>
                  </h3>
                  <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span className="text-rose-600 font-bold">*</span> Wajib Diisi
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                    <label className="text-[11px] font-semibold text-slate-600 block">Open Tickets</label>
                    <input
                      type="number"
                      min={0}
                      value={tickets.open}
                      onChange={e => setTickets({ ...tickets, open: Number(e.target.value) })}
                      className="mt-1 w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-sm font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                    <label className="text-[11px] font-semibold text-slate-600 block">On-Hold</label>
                    <input
                      type="number"
                      min={0}
                      value={tickets.onHold}
                      onChange={e => setTickets({ ...tickets, onHold: Number(e.target.value) })}
                      className="mt-1 w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-sm font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                    <label className="text-[11px] font-semibold text-slate-600 block">Pending User</label>
                    <input
                      type="number"
                      min={0}
                      value={tickets.pendingUser}
                      onChange={e => setTickets({ ...tickets, pendingUser: Number(e.target.value) })}
                      className="mt-1 w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-sm font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200">
                    <label className="text-[11px] font-semibold text-emerald-800 block">Closed Today</label>
                    <input
                      type="number"
                      min={0}
                      value={tickets.closedToday}
                      onChange={e => setTickets({ ...tickets, closedToday: Number(e.target.value) })}
                      className="mt-1 w-full bg-white border border-emerald-300 rounded px-2.5 py-1 text-sm font-mono text-emerald-800 font-bold focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="p-3.5 rounded-lg bg-rose-50/60 border border-rose-200">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-rose-800 block">SLA Breached</label>
                      {tickets.slaBreached > 0 && (
                        <span className="text-[9px] bg-rose-200 text-rose-900 px-1 rounded font-bold">Rincian aktif</span>
                      )}
                    </div>
                    <input
                      type="number"
                      min={0}
                      value={tickets.slaBreached}
                      onChange={e => setTickets({ ...tickets, slaBreached: Number(e.target.value) })}
                      className="mt-1 w-full bg-white border border-rose-300 rounded px-2.5 py-1 text-sm font-mono text-rose-800 font-bold focus:outline-none focus:border-rose-600"
                    />
                  </div>

                  <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-amber-800 block">SLA At Risk</label>
                      {tickets.slaAtRisk > 0 && (
                        <span className="text-[9px] bg-amber-200 text-amber-900 px-1 rounded font-bold">Rincian aktif</span>
                      )}
                    </div>
                    <input
                      type="number"
                      min={0}
                      value={tickets.slaAtRisk}
                      onChange={e => setTickets({ ...tickets, slaAtRisk: Number(e.target.value) })}
                      className="mt-1 w-full bg-white border border-amber-300 rounded px-2.5 py-1 text-sm font-mono text-amber-800 font-bold focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-2xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  Service Request Breakdown by Operational Category
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div>
                    <label className="text-xs font-medium text-slate-600">Helpdesk</label>
                    <input
                      type="number"
                      min={0}
                      value={tickets.categoryBreakdown.helpdesk}
                      onChange={e =>
                        setTickets({
                          ...tickets,
                          categoryBreakdown: { ...tickets.categoryBreakdown, helpdesk: Number(e.target.value) },
                        })
                      }
                      className="mt-1 w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600">MES</label>
                    <input
                      type="number"
                      min={0}
                      value={tickets.categoryBreakdown.mes}
                      onChange={e =>
                        setTickets({
                          ...tickets,
                          categoryBreakdown: { ...tickets.categoryBreakdown, mes: Number(e.target.value) },
                        })
                      }
                      className="mt-1 w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600">ERP</label>
                    <input
                      type="number"
                      min={0}
                      value={tickets.categoryBreakdown.erp}
                      onChange={e =>
                        setTickets({
                          ...tickets,
                          categoryBreakdown: { ...tickets.categoryBreakdown, erp: Number(e.target.value) },
                        })
                      }
                      className="mt-1 w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600">Network/Telecom/Radio</label>
                    <input
                      type="number"
                      min={0}
                      value={tickets.categoryBreakdown.networkTelecomRadio}
                      onChange={e =>
                        setTickets({
                          ...tickets,
                          categoryBreakdown: { ...tickets.categoryBreakdown, networkTelecomRadio: Number(e.target.value) },
                        })
                      }
                      className="mt-1 w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* DYNAMIC SLA BREACHED & AT RISK FORM: rendered directly below Service Request Breakdown */}
              {totalSlaItemsCount > 0 ? (
                <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                          Rincian Tiket Over SLA &amp; SLA At Risk
                        </h3>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-200">
                          {slaTickets.length} Tiket
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Form otomatis diaktifkan berdasarkan isian SLA Breached ({tickets.slaBreached}) dan SLA At Risk ({tickets.slaAtRisk}). Mohon lengkapi detail tiket, waktu over SLA, dan teknisi yang bertugas.
                      </p>
                    </div>

                    {/* Filter buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSlaFilter('ALL')}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                          slaFilter === 'ALL'
                            ? 'bg-slate-900 text-white font-semibold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Semua ({slaTickets.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setSlaFilter('SLA_BREACHED')}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors flex items-center gap-1 ${
                          slaFilter === 'SLA_BREACHED'
                            ? 'bg-rose-700 text-white font-semibold'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Breached ({breachedCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setSlaFilter('SLA_AT_RISK')}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors flex items-center gap-1 ${
                          slaFilter === 'SLA_AT_RISK'
                            ? 'bg-amber-600 text-white font-semibold'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        At Risk ({atRiskCount})
                      </button>
                      <button
                        type="button"
                        onClick={handleAddSlaTicket}
                        className="px-2.5 py-1 text-xs rounded-lg font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center gap-1 ml-1 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Tambah Tiket
                      </button>
                    </div>
                  </div>

                  {/* List of ticket details */}
                  <div className="space-y-3">
                    {filteredSlaTickets.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200 font-mono">
                        Tidak ada tiket dengan filter: {slaFilter}
                      </div>
                    ) : (
                      filteredSlaTickets.map((t, idx) => (
                        <div
                          key={t.id}
                          className={`p-4 rounded-xl border transition-all ${
                            t.slaStatus === 'SLA_BREACHED'
                              ? 'border-rose-200 bg-rose-50/20'
                              : 'border-amber-200 bg-amber-50/20'
                          }`}
                        >
                          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200/60">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-slate-800">
                                #{idx + 1}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateSlaTicket(t.id, {
                                      slaStatus: t.slaStatus === 'SLA_BREACHED' ? 'SLA_AT_RISK' : 'SLA_BREACHED',
                                    })
                                  }
                                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold cursor-pointer transition-colors ${
                                    t.slaStatus === 'SLA_BREACHED'
                                      ? 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                                      : 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                                  }`}
                                  title="Klik untuk beralih status SLA"
                                >
                                  {t.slaStatus === 'SLA_BREACHED' ? '● SLA BREACHED' : '▲ SLA AT RISK'}
                                </button>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteSlaTicket(t.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                              title="Hapus baris tiket"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                            {/* Nomor Tiket */}
                            <div>
                              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                                Nomor Tiket *
                              </label>
                              <input
                                type="text"
                                placeholder="Contoh: INC-202610-042"
                                value={t.ticketNumber}
                                onChange={e => handleUpdateSlaTicket(t.id, { ticketNumber: e.target.value })}
                                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono text-slate-900 focus:outline-none focus:border-blue-600 text-xs"
                              />
                            </div>

                            {/* Subject */}
                            <div className="sm:col-span-1 lg:col-span-2">
                              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                                Subject Tiket / Kendala *
                              </label>
                              <input
                                type="text"
                                placeholder="Contoh: SAP Database Connection Timeout"
                                value={t.subject}
                                onChange={e => handleUpdateSlaTicket(t.id, { subject: e.target.value })}
                                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-600 text-xs"
                              />
                            </div>

                            {/* Requester */}
                            <div>
                              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                                Requester / Departemen *
                              </label>
                              <input
                                type="text"
                                placeholder="Contoh: Budi (Supply Chain)"
                                value={t.requester}
                                onChange={e => handleUpdateSlaTicket(t.id, { requester: e.target.value })}
                                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-600 text-xs"
                              />
                            </div>

                            {/* Category Dropdown */}
                            <div>
                              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                                Category *
                              </label>
                              <select
                                value={t.category}
                                onChange={e =>
                                  handleUpdateSlaTicket(t.id, {
                                    category: e.target.value as TicketCategory,
                                  })
                                }
                                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 font-medium focus:outline-none focus:border-blue-600 text-xs"
                              >
                                <option value="Helpdesk">Helpdesk</option>
                                <option value="MES">MES</option>
                                <option value="ERP">ERP</option>
                                <option value="Network/Telecom/Radio">Network/Telecom/Radio</option>
                              </select>
                            </div>

                            {/* Waktu yang Over SLA */}
                            <div>
                              <label className="text-[11px] font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-500" />
                                Waktu Over SLA *
                              </label>
                              <input
                                type="text"
                                placeholder="Contoh: 2 Jam 30 Mnt / +4h"
                                value={t.overSlaTime}
                                onChange={e => handleUpdateSlaTicket(t.id, { overSlaTime: e.target.value })}
                                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono text-slate-900 focus:outline-none focus:border-blue-600 text-xs"
                              />
                            </div>

                            {/* Status SLA */}
                            <div>
                              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                                Status SLA Filter *
                              </label>
                              <select
                                value={t.slaStatus}
                                onChange={e =>
                                  handleUpdateSlaTicket(t.id, {
                                    slaStatus: e.target.value as 'SLA_BREACHED' | 'SLA_AT_RISK',
                                  })
                                }
                                className={`w-full border rounded px-2.5 py-1.5 font-mono font-bold text-xs focus:outline-none ${
                                  t.slaStatus === 'SLA_BREACHED'
                                    ? 'bg-rose-50 border-rose-300 text-rose-800'
                                    : 'bg-amber-50 border-amber-300 text-amber-800'
                                }`}
                              >
                                <option value="SLA_BREACHED">SLA Breached (Melebihi SLA)</option>
                                <option value="SLA_AT_RISK">SLA At Risk (&lt;2 Jam)</option>
                              </select>
                            </div>

                            {/* Technician: diisi secara manual oleh Helpdesk yang bertugas */}
                            <div>
                              <label className="text-[11px] font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                                <UserCheck className="w-3 h-3 text-blue-600" />
                                Technician (Helpdesk Bertugas) *
                              </label>
                              <input
                                type="text"
                                placeholder="Nama teknisi / helpdesk bertugas"
                                value={t.technician}
                                onChange={e => handleUpdateSlaTicket(t.id, { technician: e.target.value })}
                                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700">
                    <strong className="text-emerald-900 font-bold block mb-0.5">
                      SLA Performance Nominal (100% On-Time)
                    </strong>
                    Saat ini nilai SLA Breached dan SLA At Risk bernilai 0. Jika ada tiket yang melewati target SLA atau berisiko over, masukkan jumlahnya pada kartu ringkasan di atas untuk memunculkan formulir detail tiket secara otomatis di sini.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SERVER CHECK (WAJIB DIISI *) */}
          {activeSection === 'SERVERS' && (
            <div className="space-y-5">
              {/* Header Banner & Stats */}
              <div className="p-4 rounded-xl bg-slate-900 text-white shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-blue-600/30 border border-blue-400/40 text-blue-400 shrink-0">
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white tracking-wide">
                          Section 2: Server Check
                        </h3>
                        <span className="text-rose-400 font-extrabold text-sm">*</span>
                        <span className="text-[10px] font-semibold text-rose-300 bg-rose-950/80 border border-rose-800 px-2 py-0.5 rounded-full">
                          Wajib Diisi (*)
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Verifikasi status ketersediaan node server produksi PT Donggi-Senoro LNG pada shift ini.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleSetAllServersOnline}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                      title="Set semua server berstatus ONLINE (Normal) dengan 1 klik"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Tandai Semua Online
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddServerOpen(true)}
                      className="px-3 py-1.5 text-xs font-semibold text-blue-200 bg-blue-900/60 hover:bg-blue-800 border border-blue-700/60 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      + Tambah Server
                    </button>
                  </div>
                </div>

                {/* KPI Status Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                    <span className="text-slate-400">Total Nodes:</span>
                    <strong className="text-white text-sm">{servers.length}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Online:
                    </span>
                    <strong className="text-emerald-300 text-sm">{servers.filter(s => s.status === 'ONLINE').length}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/50 flex items-center justify-between">
                    <span className="text-amber-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Degraded:
                    </span>
                    <strong className="text-amber-300 text-sm">{servers.filter(s => s.status === 'DEGRADED').length}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/50 flex items-center justify-between">
                    <span className="text-rose-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      Offline:
                    </span>
                    <strong className="text-rose-300 text-sm">{servers.filter(s => s.status === 'OFFLINE').length}</strong>
                  </div>
                </div>
              </div>

              {/* Grid of Server Check Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {servers.length === 0 ? (
                  <div className="p-10 rounded-xl border border-dashed border-slate-300 bg-white text-center space-y-2 col-span-2">
                    <Server className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">
                      Belum ada node server yang terdaftar di sistem
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Admin dapat memasukkan list server secara manual melalui tab "Infrastructure Fleet", atau klik tombol Tambah Server di atas.
                    </p>
                  </div>
                ) : (
                  servers.map(server => {
                    const isOnline = server.status === 'ONLINE';
                    const isDegraded = server.status === 'DEGRADED';
                    const isOffline = server.status === 'OFFLINE';

                    return (
                      <div
                        key={server.id}
                        className={`p-4 rounded-xl border bg-white shadow-xs hover:shadow-md transition-all space-y-3.5 border-l-4 ${
                          isOnline
                            ? 'border-slate-200 border-l-emerald-500'
                            : isDegraded
                            ? 'border-amber-200 border-l-amber-500 bg-amber-50/15'
                            : 'border-rose-200 border-l-rose-500 bg-rose-50/15'
                        }`}
                      >
                        {/* Top: Identity & Current Status Badge */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  isOnline ? 'bg-emerald-500 animate-pulse' : isDegraded ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                              />
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight font-sans truncate">
                                {server.name}
                              </h4>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{server.location}</span>
                            </div>
                          </div>

                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold shrink-0 border flex items-center gap-1.5 ${
                              isOnline
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : isDegraded
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isOnline ? 'bg-emerald-600' : isDegraded ? 'bg-amber-600' : 'bg-rose-600'
                              }`}
                            />
                            {isOnline
                              ? 'Online (Normal)'
                              : isDegraded
                              ? 'Degraded (Perhatian)'
                              : 'Offline (Gangguan)'}
                          </span>
                        </div>

                        {/* Interactive Full-Width 3-Segment Selector */}
                        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
                          <button
                            type="button"
                            onClick={() => toggleServerStatus(server.id, 'ONLINE')}
                            className={`py-1.5 px-1 sm:px-2 rounded-md text-[11px] sm:text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                              isOnline
                                ? 'bg-emerald-600 text-white shadow-xs font-bold ring-1 ring-emerald-700/30'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">
                              <span className="sm:hidden">Online</span>
                              <span className="hidden sm:inline">Online (Normal)</span>
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleServerStatus(server.id, 'DEGRADED')}
                            className={`py-1.5 px-1 sm:px-2 rounded-md text-[11px] sm:text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                              isDegraded
                                ? 'bg-amber-500 text-white shadow-xs font-bold ring-1 ring-amber-600/30'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                            }`}
                          >
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">
                              <span className="sm:hidden">Degraded</span>
                              <span className="hidden sm:inline">Degraded (Perhatian)</span>
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleServerStatus(server.id, 'OFFLINE')}
                            className={`py-1.5 px-1 sm:px-2 rounded-md text-[11px] sm:text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                              isOffline
                                ? 'bg-rose-600 text-white shadow-xs font-bold ring-1 ring-rose-700/30'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                            }`}
                          >
                            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">
                              <span className="sm:hidden">Offline</span>
                              <span className="hidden sm:inline">Offline (Gangguan)</span>
                            </span>
                          </button>
                        </div>

                        {/* Catatan Field */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <label className="font-semibold text-slate-700 flex items-center gap-1">
                              <FileText className="w-3 h-3 text-slate-400" />
                              Catatan Kondisi Server
                            </label>
                            {!isOnline && (
                              <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-0.5">
                                <AlertTriangle className="w-3 h-3" />
                                Wajib berikan keterangan kendala
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            placeholder="Ketik catatan kondisi operasional server..."
                            value={server.notes || ''}
                            onChange={e => updateServerNotes(server.id, e.target.value)}
                            className={`w-full border rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 transition-colors ${
                              !isOnline
                                ? 'bg-white border-amber-300 focus:ring-1 focus:ring-amber-400'
                                : 'bg-slate-50 focus:bg-white border-slate-300'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MS365 AND SOFTWARE OTHERS (OPSIONAL) */}
          {activeSection === 'LICENSES' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-800 shrink-0">
                    <FileKey className="w-5 h-5" />
                  </div>
                  <div className="text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <strong className="text-purple-900 block font-bold text-sm mb-0.5">
                        Section 3: MS365 and Software Others
                      </strong>
                      <span className="text-[10px] font-semibold text-purple-700 bg-purple-100/80 border border-purple-300 px-2 py-0.5 rounded-full">
                        Opsional / Tidak Wajib
                      </span>
                    </div>
                    Manajemen ketersediaan lisensi cloud &amp; on-premise (Microsoft 365, AutoCAD, SAP, Adobe, dll). Pemantauan ketersediaan (available pool) dan pencatatan penugasan lisensi ke pengguna baru (new user assignment).
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddInventoryModal(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-purple-800 bg-white hover:bg-purple-100 border border-purple-300 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Tambah Software Baru
                </button>
              </div>

              {/* SUBSECTION 1: INVENTORY AVAILABILITY */}
              <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    1. Status Ketersediaan Lisensi (Available Licenses Pool)
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Available = Total - Assigned
                  </span>
                </div>

                {/* Microsoft 365 Category */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block font-mono">
                    Microsoft 365 Subscriptions
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {ms365Items.map(item => {
                      const avail = item.totalLicenses - item.assignedLicenses;
                      return (
                        <div key={item.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 truncate">{item.softwareName}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                avail > 2
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : avail > 0
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {avail} Available
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                            <div>
                              <label className="text-slate-500 block text-[10px]">Total Terbeli</label>
                              <input
                                type="number"
                                min={0}
                                value={item.totalLicenses}
                                onChange={e => handleUpdateInventoryItem(item.id, Number(e.target.value), item.assignedLicenses)}
                                className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono text-slate-900 focus:outline-none focus:border-blue-600 text-xs mt-0.5"
                              />
                            </div>
                            <div>
                              <label className="text-slate-500 block text-[10px]">Assigned (Terpakai)</label>
                              <input
                                type="number"
                                min={0}
                                value={item.assignedLicenses}
                                onChange={e => handleUpdateInventoryItem(item.id, item.totalLicenses, Number(e.target.value))}
                                className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono text-slate-900 focus:outline-none focus:border-blue-600 text-xs mt-0.5"
                              />
                            </div>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">{item.notes}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Software Others Category */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block font-mono">
                    Software Others (Engineering &amp; Enterprise Applications)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {otherLicenseItems.map(item => {
                      const avail = item.totalLicenses - item.assignedLicenses;
                      return (
                        <div key={item.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 truncate">{item.softwareName}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-slate-500">Available:</span>
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold ${
                                avail > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {avail} Seats
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <label className="text-slate-500 block text-[10px]">Total</label>
                              <input
                                type="number"
                                min={0}
                                value={item.totalLicenses}
                                onChange={e => handleUpdateInventoryItem(item.id, Number(e.target.value), item.assignedLicenses)}
                                className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono text-slate-900 text-xs mt-0.5"
                              />
                            </div>
                            <div>
                              <label className="text-slate-500 block text-[10px]">In Use</label>
                              <input
                                type="number"
                                min={0}
                                value={item.assignedLicenses}
                                onChange={e => handleUpdateInventoryItem(item.id, item.totalLicenses, Number(e.target.value))}
                                className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono text-slate-900 text-xs mt-0.5"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SUBSECTION 2: LICENSE ASSIGNMENT TO NEW USER */}
              <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      2. Penugasan Lisensi ke User Baru (Assign License to New User)
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {(licenses.userAssignments || []).length} Penugasan Tercatat
                  </span>
                </div>

                {/* Form to assign license */}
                <form onSubmit={handleAddAssignment} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800">
                    Form Penugasan Lisensi User Baru
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nama User *</label>
                      <input
                        type="text"
                        placeholder="Contoh: Hendra Pratama"
                        value={newAssignment.userName}
                        onChange={e => setNewAssignment({ ...newAssignment, userName: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Departemen *</label>
                      <input
                        type="text"
                        placeholder="Contoh: Maintenance Electrical"
                        value={newAssignment.department}
                        onChange={e => setNewAssignment({ ...newAssignment, department: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Lisensi yang Ditugaskan *</label>
                      <select
                        value={newAssignment.softwareName}
                        onChange={e => setNewAssignment({ ...newAssignment, softwareName: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                      >
                        {(licenses.items || []).map(item => (
                          <option key={item.id} value={item.softwareName}>
                            {item.softwareName} ({item.totalLicenses - item.assignedLicenses} sisa)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">No. Tiket / Request Ref</label>
                      <input
                        type="text"
                        placeholder="Contoh: REQ-202610-044"
                        value={newAssignment.ticketRef}
                        onChange={e => setNewAssignment({ ...newAssignment, ticketRef: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Assign Lisensi
                      </button>
                    </div>
                  </div>
                </form>

                {/* DESKTOP: Table of assignments (hidden md:block) */}
                <div className="hidden md:block border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Nama User</th>
                        <th className="py-2.5 px-3">Departemen</th>
                        <th className="py-2.5 px-3">Lisensi yang Ditugaskan</th>
                        <th className="py-2.5 px-3">Ref Tiket</th>
                        <th className="py-2.5 px-3">Petugas</th>
                        <th className="py-2.5 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(licenses.userAssignments || []).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-slate-400 font-mono text-xs">
                            Belum ada penugasan lisensi baru pada shift hari ini.
                          </td>
                        </tr>
                      ) : (
                        (licenses.userAssignments || []).map(asg => (
                          <tr key={asg.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-semibold text-slate-900">{asg.userName}</td>
                            <td className="py-2.5 px-3 text-slate-600">{asg.department}</td>
                            <td className="py-2.5 px-3">
                              <span className="font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                {asg.softwareName}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-500">{asg.ticketRef}</td>
                            <td className="py-2.5 px-3 text-slate-500">{asg.assignedBy}</td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteAssignment(asg.id)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded"
                                title="Hapus penugasan"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE: Stacked Cards (block md:hidden, no horizontal scroll) */}
                <div className="md:hidden space-y-2.5">
                  {(licenses.userAssignments || []).length === 0 ? (
                    <div className="py-4 text-center text-slate-400 font-mono text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      Belum ada penugasan lisensi baru pada shift hari ini.
                    </div>
                  ) : (
                    (licenses.userAssignments || []).map(asg => (
                      <div key={asg.id} className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-slate-900 text-xs block">{asg.userName}</span>
                            <span className="text-[11px] text-slate-500">{asg.department}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteAssignment(asg.id)}
                            className="text-rose-600 hover:text-rose-700 p-1 px-2 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-1 text-[11px] font-semibold shrink-0"
                            title="Hapus penugasan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                        <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {asg.softwareName}
                          </span>
                          <span className="text-slate-500 font-mono">Ref: {asg.ticketRef}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PHYSICAL CHECK MEETING ROOM */}
          {activeSection === 'MEETING_ROOMS' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-800 shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div className="text-xs text-slate-700">
                  <strong className="text-blue-900 block text-sm font-bold">
                    Section 4: Physical Check Meeting Room (Inspeksi Fisik Ruang Rapat &amp; VTC)
                  </strong>
                  Untuk inspeksi fasilitas ruang meeting, Duty Engineer / Helpdesk wajib memeriksa audio pod, display video, kabel sharing, serta <strong>wajib melampirkan foto bukti fisik</strong> (Site Uso pukul 06.00 WITA &amp; HO Jkt pukul 07.00 WIB) sebelum laporan dapat disubmit.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {physicalInspections.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-slate-300 bg-white text-center space-y-2 col-span-2">
                    <Video className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">
                      Belum ada Ruang Meeting / VTC yang terdaftar dalam sistem
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Daftarkan ruang meeting operasional perusahaan melalui tab "Infrastructure Fleet".
                    </p>
                  </div>
                ) : (
                  physicalInspections.map((room, index) => (
                    <div
                      key={room.id}
                      className={`p-4 rounded-xl border bg-white shadow-2xs transition-all ${
                        room.photoEvidenceUrl
                          ? 'border-emerald-300 ring-1 ring-emerald-200'
                          : 'border-amber-300 ring-1 ring-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span>0{index + 1}. {room.roomName}</span>
                            <span className="text-[10px] font-mono text-slate-500">({room.location})</span>
                          </div>
                          <span className="text-[10px] text-blue-700 font-mono font-medium block mt-0.5">
                            {room.location === 'Site Uso' ? 'Wajib Cek Fisik 06.00 WITA' : 'Wajib Cek Fisik 07.00 WIB'}
                          </span>
                        </div>

                        {room.photoEvidenceUrl ? (
                          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Proof Attached
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                            <AlertTriangle className="w-3 h-3 text-amber-600" /> Photo Missing
                          </span>
                        )}
                      </div>

                      {/* Checklist toggles */}
                      <div className="grid grid-cols-3 gap-2 my-3">
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center">
                          <label className="text-[10px] font-semibold text-slate-600 block">Audio Pod</label>
                          <button
                            type="button"
                            onClick={() =>
                              updateRoomInspection(room.id, {
                                audioStatus: room.audioStatus === 'PASS' ? 'FAIL' : 'PASS',
                              })
                            }
                            className={`mt-1 text-xs font-mono font-bold px-2 py-0.5 rounded ${
                              room.audioStatus === 'PASS'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {room.audioStatus}
                          </button>
                        </div>

                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center">
                          <label className="text-[10px] font-semibold text-slate-600 block">4K Display</label>
                          <button
                            type="button"
                            onClick={() =>
                              updateRoomInspection(room.id, {
                                videoStatus: room.videoStatus === 'PASS' ? 'FAIL' : 'PASS',
                              })
                            }
                            className={`mt-1 text-xs font-mono font-bold px-2 py-0.5 rounded ${
                              room.videoStatus === 'PASS'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {room.videoStatus}
                          </button>
                        </div>

                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center">
                          <label className="text-[10px] font-semibold text-slate-600 block">Sharing Cables</label>
                          <button
                            type="button"
                            onClick={() =>
                              updateRoomInspection(room.id, {
                                sharingCablesStatus: room.sharingCablesStatus === 'PASS' ? 'FAIL' : 'PASS',
                              })
                            }
                            className={`mt-1 text-xs font-mono font-bold px-2 py-0.5 rounded ${
                              room.sharingCablesStatus === 'PASS'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {room.sharingCablesStatus}
                          </button>
                        </div>
                      </div>

                      {/* Photo evidence upload */}
                      <PhotoUploadField
                        roomKey={room.id}
                        roomName={room.roomName}
                        photoUrl={room.photoEvidenceUrl}
                        onPhotoUploaded={(url, timestamp) => {
                          updateRoomInspection(room.id, {
                            photoEvidenceUrl: url,
                            photoTimestamp: timestamp,
                          });
                        }}
                        onPhotoRemoved={() => {
                          updateRoomInspection(room.id, {
                            photoEvidenceUrl: '',
                            photoTimestamp: undefined,
                          });
                        }}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: MAILBOX AND CROWDSTRIKE */}
          {activeSection === 'MAILBOX_CROWDSTRIKE' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="p-4 rounded-xl bg-slate-900 text-white shadow-xs flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-600/30 border border-indigo-400/40 text-indigo-400 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-white block font-bold text-sm mb-0.5">
                      Section 5: Mailbox and CrowdStrike
                    </strong>
                    <p className="text-xs text-slate-400">
                      Pemantauan kesehatan kapasitas mailbox pengguna Microsoft 365 dan status proteksi endpoint EDR CrowdStrike Falcon.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 KPI Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* 1. Mailbox Almost Full */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-amber-600" />
                      Mailbox Almost Full
                    </span>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="number"
                      min={0}
                      value={mailboxMetrics.mailboxAlmostFull}
                      onChange={e =>
                        handleUpdateMetricCount('MAILBOX_ALMOST_FULL', Number(e.target.value))
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-lg font-bold font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-xs text-slate-500 font-mono">Akun</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Jumlah akun user yang kuota penyimpanannya mendekati batas penuh.
                  </p>
                </div>

                {/* 2. Mailbox Full */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-rose-600" />
                      Mailbox Full
                    </span>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="number"
                      min={0}
                      value={mailboxMetrics.mailboxFull}
                      onChange={e =>
                        handleUpdateMetricCount('MAILBOX_FULL', Number(e.target.value))
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-lg font-bold font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-rose-500"
                    />
                    <span className="text-xs text-slate-500 font-mono">Akun</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Jumlah akun user yang telah mencapai kuota 100% (tidak dapat terima email).
                  </p>
                </div>

                {/* 3. Crowdstrike Detection Malicious activity */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      Crowdstrike Detection
                    </span>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="number"
                      min={0}
                      value={mailboxMetrics.crowdstrikeMaliciousActivity}
                      onChange={e =>
                        handleUpdateMetricCount('CROWDSTRIKE_MALICIOUS', Number(e.target.value))
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-lg font-bold font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-rose-500"
                    />
                    <span className="text-xs text-slate-500 font-mono">Insiden</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Deteksi aktivitas malware atau malicious behavior pada endpoint.
                  </p>
                </div>

                {/* 4. Crowdstrike Inactive 30 days */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-600" />
                      Crowdstrike Inactive
                    </span>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="number"
                      min={0}
                      value={mailboxMetrics.crowdstrikeInactive30Days}
                      onChange={e =>
                        handleUpdateMetricCount('CROWDSTRIKE_INACTIVE_30D', Number(e.target.value))
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-lg font-bold font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-slate-500"
                    />
                    <span className="text-xs text-slate-500 font-mono">Host</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Jumlah sensor agent CrowdStrike yang tidak aktif / offline &gt; 30 hari.
                  </p>
                </div>
              </div>

              {/* Rincian Akun Mailbox / Host CrowdStrike (Sinkron Otomatis) */}
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-700" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Rincian Akun Mailbox &amp; Host Terdeteksi ({mailboxMetrics.details?.length || 0} Terdata)
                    </h4>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Sinkron Otomatis dengan Counter
                  </span>
                </div>

                {/* Form Quick Add Detail */}
                <form onSubmit={handleAddMailboxDetail} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800">
                    Tambah Rincian Akun / Host Terdampak
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Kategori Masalah *</label>
                      <select
                        value={newMailboxDetail.type}
                        onChange={e =>
                          setNewMailboxDetail({
                            ...newMailboxDetail,
                            type: e.target.value as any,
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                      >
                        <option value="MAILBOX_ALMOST_FULL">Mailbox Almost Full</option>
                        <option value="MAILBOX_FULL">Mailbox Full</option>
                        <option value="CROWDSTRIKE_MALICIOUS">Crowdstrike Malicious Activity</option>
                        <option value="CROWDSTRIKE_INACTIVE_30D">Crowdstrike Inactive 30 Days</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">User Email / Hostname *</label>
                      <input
                        type="text"
                        placeholder="Contoh: hendra.pratama@donggi-senoro.com / LT-USO-04"
                        value={newMailboxDetail.targetUserOrHost}
                        onChange={e => setNewMailboxDetail({ ...newMailboxDetail, targetUserOrHost: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Departemen / Lokasi</label>
                      <input
                        type="text"
                        placeholder="Contoh: Finance & Accounting / Site Uso"
                        value={newMailboxDetail.departmentOrLocation}
                        onChange={e => setNewMailboxDetail({ ...newMailboxDetail, departmentOrLocation: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah Rincian
                      </button>
                    </div>
                  </div>
                </form>

                {/* DESKTOP: Table Details with Inline Edit (hidden md:block) */}
                <div className="hidden md:block border border-slate-200 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[700px]">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-44">Kategori</th>
                        <th className="py-2.5 px-3">User Email / Hostname *</th>
                        <th className="py-2.5 px-3">Departemen / Lokasi</th>
                        <th className="py-2.5 px-3">Status / Keterangan</th>
                        <th className="py-2.5 px-3 text-right w-16">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {(mailboxMetrics.details || []).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400 font-sans">
                            Semua kuota mailbox dan agent CrowdStrike dalam kondisi nominal (0 insiden).<br />
                            <span className="text-[11px] text-slate-400 mt-1 inline-block">
                              Ubah nilai pada kartu di atas atau klik tombol Tambah Rincian untuk mencatat insiden.
                            </span>
                          </td>
                        </tr>
                      ) : (
                        (mailboxMetrics.details || []).map((item, index) => (
                          <tr key={item.id} className="hover:bg-slate-50/70 font-sans">
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold inline-block ${
                                  item.type === 'MAILBOX_FULL' || item.type === 'CROWDSTRIKE_MALICIOUS'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : item.type === 'MAILBOX_ALMOST_FULL'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                                }`}
                              >
                                {item.type === 'MAILBOX_ALMOST_FULL'
                                  ? 'Mailbox Almost Full'
                                  : item.type === 'MAILBOX_FULL'
                                  ? 'Mailbox Full'
                                  : item.type === 'CROWDSTRIKE_MALICIOUS'
                                  ? 'Crowdstrike Malicious'
                                  : 'Crowdstrike Inactive'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                placeholder={
                                  item.type.startsWith('MAILBOX')
                                    ? 'user@donggi-senoro.com'
                                    : 'Nama PC / Laptop (mis. LT-USO-04)'
                                }
                                value={item.targetUserOrHost}
                                onChange={e =>
                                  handleUpdateMailboxDetail(item.id, { targetUserOrHost: e.target.value })
                                }
                                className={`w-full bg-white border rounded px-2.5 py-1 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600 ${
                                  !item.targetUserOrHost.trim() ? 'border-amber-400 bg-amber-50/30' : 'border-slate-300'
                                }`}
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                placeholder="Departemen / Lokasi"
                                value={item.departmentOrLocation || ''}
                                onChange={e =>
                                  handleUpdateMailboxDetail(item.id, { departmentOrLocation: e.target.value })
                                }
                                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                placeholder="Keterangan tindakan..."
                                value={item.notes || ''}
                                onChange={e => handleUpdateMailboxDetail(item.id, { notes: e.target.value })}
                                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteMailboxDetail(item.id)}
                                className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition-colors inline-flex"
                                title="Hapus baris ini (juga otomatis mengurangi jumlah counter)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE: Stacked Cards (block md:hidden, 100% width, No Horizontal Scroll) */}
                <div className="md:hidden space-y-3">
                  {(mailboxMetrics.details || []).length === 0 ? (
                    <div className="py-5 px-4 text-center text-slate-400 font-sans bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      Semua kuota mailbox dan agent CrowdStrike dalam kondisi nominal (0 insiden).<br />
                      <span className="text-[11px] text-slate-400 mt-1 inline-block">
                        Ubah nilai pada kartu di atas atau klik tombol Tambah Rincian untuk mencatat insiden.
                      </span>
                    </div>
                  ) : (
                    (mailboxMetrics.details || []).map((item, index) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-slate-500">#{index + 1}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold inline-block ${
                                item.type === 'MAILBOX_FULL' || item.type === 'CROWDSTRIKE_MALICIOUS'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : item.type === 'MAILBOX_ALMOST_FULL'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-800 border border-slate-200'
                              }`}
                            >
                              {item.type === 'MAILBOX_ALMOST_FULL'
                                ? 'Mailbox Almost Full'
                                : item.type === 'MAILBOX_FULL'
                                ? 'Mailbox Full'
                                : item.type === 'CROWDSTRIKE_MALICIOUS'
                                ? 'Crowdstrike Malicious'
                                : 'Crowdstrike Inactive'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteMailboxDetail(item.id)}
                            className="text-rose-600 hover:text-rose-700 p-1 px-2 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-1 text-[11px] font-semibold"
                            title="Hapus baris ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                            User Email / Hostname *
                          </label>
                          <input
                            type="text"
                            placeholder={
                              item.type.startsWith('MAILBOX')
                                ? 'user@donggi-senoro.com'
                                : 'Nama PC / Laptop (mis. LT-USO-04)'
                            }
                            value={item.targetUserOrHost}
                            onChange={e =>
                              handleUpdateMailboxDetail(item.id, { targetUserOrHost: e.target.value })
                            }
                            className={`w-full bg-slate-50 border rounded-lg p-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-blue-600 ${
                              !item.targetUserOrHost.trim() ? 'border-amber-400 bg-amber-50/30' : 'border-slate-300'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                            Departemen / Lokasi
                          </label>
                          <input
                            type="text"
                            placeholder="Contoh: Site Uso Operations"
                            value={item.departmentOrLocation || ''}
                            onChange={e =>
                              handleUpdateMailboxDetail(item.id, { departmentOrLocation: e.target.value })
                            }
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                            Status / Keterangan Tindakan
                          </label>
                          <input
                            type="text"
                            placeholder="Keterangan tindakan pemantauan..."
                            value={item.notes || ''}
                            onChange={e => handleUpdateMailboxDetail(item.id, { notes: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Overall Notes */}
                <div className="space-y-1 pt-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Catatan Umum Mailbox &amp; CrowdStrike (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Seluruh user dengan mailbox mendekati kuota telah dikirimkan notifikasi pembersihan email. Insiden Crowdstrike terisolasi dengan baik..."
                    value={mailboxMetrics.notes || ''}
                    onChange={e => setMailboxMetrics({ ...mailboxMetrics, notes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SUMMARY (CATATAN KHUSUS MASALAH USER: REQUEST BARU, FOLLOWUP PO, BROKEN ASSET) */}
          {activeSection === 'SUMMARY' && (
            <div className="space-y-5">
              {/* Guidance Banner */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-800 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-xs text-slate-700">
                  <strong className="text-slate-900 block text-sm font-bold mb-0.5">
                    Section 6: Summary &amp; Catatan Khusus Shift
                  </strong>
                  Petugas Helpdesk <strong>hanya cukup mengisi kolom di bawah ini apabila ada masalah tertentu dari user</strong> pada shift hari ini (seperti adanya request baru, tindak lanjut PO pengadaan, ataupun kerusakan aset). Jika tidak ada kendala tertentu, kolom dapat dibiarkan kosong.
                </div>
              </div>

              {/* 3 User Issues Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Request Baru */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Request Baru</h4>
                      <span className="text-[10px] text-slate-400">Akun, Akses, atau Layanan Baru</span>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Contoh: Permintaan akun AD & email baru untuk staff HR, penambahan hak akses share folder Site Uso..."
                    value={operationalExceptions.newUserRequests || ''}
                    onChange={e =>
                      setOperationalExceptions({ ...operationalExceptions, newUserRequests: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* 2. Followup PO */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                    <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Follow-up PO</h4>
                      <span className="text-[10px] text-slate-400">Pengadaan, Vendor &amp; Lisensi</span>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Contoh: Koordinasi vendor PT Astragraphia untuk perpanjangan lisensi Adobe CC, status PO suku cadang switch..."
                    value={operationalExceptions.poFollowUps || ''}
                    onChange={e =>
                      setOperationalExceptions({ ...operationalExceptions, poFollowUps: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
                  />
                </div>

                {/* 3. Broken Asset */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                    <div className="p-1.5 rounded-lg bg-rose-50 text-rose-700">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Broken Asset</h4>
                      <span className="text-[10px] text-slate-400">Kerusakan Aset / Hardware</span>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Contoh: Monitor ruang meeting CCR blank, penggantian IP phone di Marine Jetty, kabel LAN port 14 bermasalah..."
                    value={operationalExceptions.brokenAssets || ''}
                    onChange={e =>
                      setOperationalExceptions({ ...operationalExceptions, brokenAssets: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-rose-600"
                  />
                </div>
              </div>

              {/* General Shift Handover Briefing */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-700" />
                  Catatan Tambahan Serah Terima Shift (Handover Notes)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ringkasan serah terima shift operasional (opsional)..."
                  value={shiftHandoverNotes}
                  onChange={e => setShiftHandoverNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-sans"
                />
              </div>

              {/* Pre-Submission Verification Checklist */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Submission Integrity Verification (Kelayakan Laporan)
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-700 font-medium">1. Tickets &amp; SLA Breakdown (Wajib *)</span>
                    <span className="font-mono text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ready ({tickets.open} Open · {tickets.closedToday} Closed)
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-700 font-medium">2. Server Check (Wajib *)</span>
                    <span className="font-mono text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {servers.filter(s => s.status === 'ONLINE').length}/{servers.length} Online
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-700 font-medium">3. MS365 and Software Others (Opsional)</span>
                    <span className="font-mono text-slate-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-slate-400" /> Terpantau
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-700 font-medium">
                      4. Physical Check Meeting Room ({physicalInspections.filter(p => p.photoEvidenceUrl).length}/{physicalInspections.length} Attached)
                    </span>
                    {isVtcComplete ? (
                      <span className="font-mono text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> All Proofs Attached
                      </span>
                    ) : (
                      <span className="font-mono text-rose-700 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-rose-600" /> {missingPhotos.length} Foto Belum Dilampirkan
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-700 font-medium">5. Mailbox and CrowdStrike</span>
                    <span className="font-mono text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ready ({mailboxMetrics.mailboxAlmostFull} Quota Warning · {mailboxMetrics.crowdstrikeMaliciousActivity} Detections)
                    </span>
                  </div>
                </div>

                {/* Immutability Warning */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 mt-4">
                  <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700 leading-relaxed">
                    <strong className="text-amber-900 block font-bold mb-0.5">
                      Immutable Record Lock Policy (ISO 27001)
                    </strong>
                    Setelah menekan tombol Submit, seluruh data laporan harian akan dikunci secara permanen dengan hash digital SHA-256. Notifikasi otomatis akan dikirimkan kepada Superior ICT Manager untuk verifikasi dan tanda tangan digital.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-between bg-slate-50/90 rounded-b-2xl shrink-0">
          <div className="text-xs text-slate-600 font-mono">
            {isVtcComplete ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> All criteria validated
              </span>
            ) : (
              <span className="text-amber-800 font-bold flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> {missingPhotos.length} foto inspeksi meeting room pending
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            {activeSection !== 'TICKETS' && (
              <button
                type="button"
                onClick={() => {
                  if (activeSection === 'SERVERS') setActiveSection('TICKETS');
                  else if (activeSection === 'LICENSES') setActiveSection('SERVERS');
                  else if (activeSection === 'MEETING_ROOMS') setActiveSection('LICENSES');
                  else if (activeSection === 'MAILBOX_CROWDSTRIKE') setActiveSection('MEETING_ROOMS');
                  else if (activeSection === 'SUMMARY') setActiveSection('MAILBOX_CROWDSTRIKE');
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors"
              >
                ← Back
              </button>
            )}

            {activeSection !== 'SUMMARY' ? (
              <button
                type="button"
                onClick={() => {
                  if (activeSection === 'TICKETS') setActiveSection('SERVERS');
                  else if (activeSection === 'SERVERS') setActiveSection('LICENSES');
                  else if (activeSection === 'LICENSES') setActiveSection('MEETING_ROOMS');
                  else if (activeSection === 'MEETING_ROOMS') setActiveSection('MAILBOX_CROWDSTRIKE');
                  else if (activeSection === 'MAILBOX_CROWDSTRIKE') setActiveSection('SUMMARY');
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
              >
                Next Section →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                disabled={!isVtcComplete || isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:pointer-events-none rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                Submit &amp; Permanently Lock
              </button>
            )}
          </div>
        </div>

        {/* Modal: Quick Add Server Node */}
        {isAddServerOpen && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl text-slate-900">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-700" />
                  Tambah Server Node ke Master List
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddServerOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleQuickAddServer} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Nama Server *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SRV-MES-DB02 (MES Backup)"
                    value={newServerName}
                    onChange={e => setNewServerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Lokasi Penempatan *</label>
                  <select
                    value={newServerLocation}
                    onChange={e => setNewServerLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                  >
                    <option value="Site Uso Server Room">Site Uso Server Room</option>
                    <option value="Site Uso Control Building">Site Uso Control Building</option>
                    <option value="Site Uso Telecom Tower">Site Uso Telecom Tower</option>
                    <option value="HO Jakarta Server Rack">HO Jakarta Server Rack</option>
                    <option value="Site Uso CCR Room">Site Uso CCR Room</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Catatan</label>
                  <input
                    type="text"
                    placeholder="Catatan kondisi operasional server..."
                    value={newServerNotes}
                    onChange={e => setNewServerNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddServerOpen(false)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
                  >
                    Simpan Server
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Quick Add Inventory Software */}
        {showAddInventoryModal && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl text-slate-900">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileKey className="w-4 h-4 text-purple-700" />
                  Tambah Software ke Inventaris
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddInventoryModal(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddInventorySoftware} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Nama Software *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Wonderware InTouch SCADA"
                    value={newInventorySoftware.softwareName}
                    onChange={e => setNewInventorySoftware({ ...newInventorySoftware, softwareName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Kategori</label>
                  <select
                    value={newInventorySoftware.category}
                    onChange={e =>
                      setNewInventorySoftware({
                        ...newInventorySoftware,
                        category: e.target.value as 'MS365' | 'OTHERS',
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                  >
                    <option value="MS365">Microsoft 365</option>
                    <option value="OTHERS">Software Others</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">Total Lisensi</label>
                    <input
                      type="number"
                      min={0}
                      value={newInventorySoftware.total}
                      onChange={e => setNewInventorySoftware({ ...newInventorySoftware, total: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">Assigned (In Use)</label>
                    <input
                      type="number"
                      min={0}
                      value={newInventorySoftware.assigned}
                      onChange={e => setNewInventorySoftware({ ...newInventorySoftware, assigned: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Vendor / Partner</label>
                  <input
                    type="text"
                    placeholder="Contoh: Schneider Electric"
                    value={newInventorySoftware.vendor}
                    onChange={e => setNewInventorySoftware({ ...newInventorySoftware, vendor: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddInventoryModal(false)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-xs"
                  >
                    Simpan ke Inventaris
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirmation Modal for Permanent Submission */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl text-slate-900">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-amber-100 text-amber-800">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Konfirmasi Penguncian &amp; Submission Laporan
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Apakah Anda yakin ingin memfinalisasi dan mengunci laporan shift harian untuk tanggal{' '}
                    <strong className="text-slate-900 font-bold">{date}</strong>?
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1 font-mono">
                <div>Submitter: {currentUser.name}</div>
                <div>Shift: {currentUser.shift}</div>
                <div>Server Check: {servers.filter(s => s.status === 'ONLINE').length}/{servers.length} Online</div>
                <div>SLA Details: {slaTickets.length} Tiket Dicatat</div>
                <div>VTC Room Photos: {physicalInspections.filter(p => p.photoEvidenceUrl).length}/{physicalInspections.length} Ruangan</div>
                <div className="text-amber-800 font-bold pt-1 text-[11px]">
                  Peringatan: Dokumen tidak dapat diubah kembali setelah dikunci.
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
                >
                  Batal &amp; Periksa Kembali
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  Kunci &amp; Kirim Laporan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
