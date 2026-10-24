import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  ShieldAlert,
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
  ShoppingCart,
  Clock,
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
  SoftwarePurchase,
} from '../types';
import {
  INITIAL_SERVERS,
  INITIAL_LICENSES,
} from '../data/mockData';
import { PhotoUploadField } from './PhotoUploadField';

interface ReportFormModalProps {
  date: string;
}

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

  // Active form section tab:
  // 1. Tickets & SLA | 2. Server Check | 3. MS365 dan Software Others | 4. VTC Physical Check | 5. Review & Lock
  const [activeSection, setActiveSection] = useState<'TICKETS' | 'SERVERS' | 'LICENSES' | 'VTC' | 'SUMMARY'>('TICKETS');

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
  const [newServerRole, setNewServerRole] = useState('');

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

  const [newPurchase, setNewPurchase] = useState<{
    softwareName: string;
    targetUser: string;
    department: string;
    quantity: number;
    poNumber: string;
    vendor: string;
    status: 'ACTIVE' | 'DEPLOYED' | 'PENDING_INSTALL';
    notes: string;
  }>({
    softwareName: '',
    targetUser: '',
    department: '',
    quantity: 1,
    poNumber: '',
    vendor: '',
    status: 'DEPLOYED',
    notes: '',
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

  // Section 4: Physical inspections
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

  // Section 5: Review & Handover
  const [executiveSummary, setExecutiveSummary] = useState(
    'Daily shift operations completed nominally. All VTC conference suites tested before 07:00 AM briefing. SCADA data diode firewall verified. Zero critical system downtime.'
  );
  const [shiftHandoverNotes, setShiftHandoverNotes] = useState(
    'Marine Jetty IP phone replacement confirmed resolved. AutoCAD license pool healthy. Handover to night on-call team completed.'
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
      role: newServerRole.trim() || 'Production Node',
      status: 'ONLINE' as const,
      latencyMs: 1,
      lastChecked: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes: 'Baru ditambahkan ke master server.',
    };
    addServer(newSrvData);
    setServers(prev => [...prev, { ...newSrvData, id: `srv-${Date.now()}` }]);
    setIsAddServerOpen(false);
    setNewServerName('');
    setNewServerRole('');
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

  const handleAddPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPurchase.softwareName.trim()) {
      showToast('Nama software yang dibeli wajib diisi.', 'error');
      return;
    }
    const purchaseItem: SoftwarePurchase = {
      id: `pur-${Date.now()}`,
      softwareName: newPurchase.softwareName.trim(),
      targetUser: newPurchase.targetUser.trim() || 'All Department Users',
      department: newPurchase.department.trim() || 'ICT Operations',
      quantity: Math.max(1, Number(newPurchase.quantity) || 1),
      poNumber: newPurchase.poNumber.trim() || `PO-${date.replace(/-/g, '')}-ICT`,
      vendor: newPurchase.vendor.trim() || 'Authorized Reseller',
      purchaseDate: date,
      status: newPurchase.status,
      notes: newPurchase.notes.trim(),
    };
    setLicenses(prev => ({
      ...prev,
      purchases: [purchaseItem, ...(prev.purchases || [])],
    }));
    setNewPurchase({
      softwareName: '',
      targetUser: '',
      department: '',
      quantity: 1,
      poNumber: '',
      vendor: '',
      status: 'DEPLOYED',
      notes: '',
    });
    showToast(`Data pembelian ${purchaseItem.softwareName} berhasil ditambahkan.`, 'success');
  };

  const handleDeletePurchase = (id: string) => {
    setLicenses(prev => ({
      ...prev,
      purchases: (prev.purchases || []).filter(p => p.id !== id),
    }));
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
    if (!isVtcComplete) {
      showToast(
        `Mandatory physical check requirement: Please attach photo proof for all ${physicalInspections.length} meeting rooms before submitting.`,
        'error'
      );
      setActiveSection('VTC');
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
        executiveSummary,
        shiftHandoverNotes,
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl my-auto shadow-2xl flex flex-col max-h-[92vh] text-slate-900">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/80 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              DR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Daily Shift Report Entry: {date}
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-200">
                  {currentUser.role === 'ADMINISTRATOR' ? 'Super Admin Mode' : 'Duty Engineer'}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                Submitter: {currentUser.name} ({currentUser.badgeNumber}) · {currentUser.shift}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={closeModal}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Navigation Tabs: 5 Sections */}
        <div className="px-6 pt-3 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto shrink-0">
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
            1. Tickets &amp; SLA
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
            2. Server Check ({servers.filter(s => s.status === 'ONLINE').length}/{servers.length})
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
            3. MS365 dan Software Others
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('VTC')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeSection === 'VTC'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            4. VTC Physical Check
            {!isVtcComplete ? (
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 rounded font-mono font-medium">
                Photo Required
              </span>
            ) : (
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
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
            <Layers className="w-3.5 h-3.5" />
            5. Review &amp; Lock
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {/* TAB 1: TICKETS & SLA */}
          {activeSection === 'TICKETS' && (
            <div className="space-y-6">
              {/* Status summary */}
              <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-2xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  Ticket Status Summary (Remedy / Jira Service Management)
                </h3>
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

          {/* TAB 2: SERVER CHECK */}
          {activeSection === 'SERVERS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-800 shrink-0">
                    <Server className="w-5 h-5" />
                  </div>
                  <div className="text-xs text-slate-700">
                    <strong className="text-blue-900 block font-bold text-sm mb-0.5">
                      Section 2: Server Check
                    </strong>
                    Daftar server master terdata oleh Administrator melalui tab "Infrastructure Fleet" (Server Check Management). Helpdesk / Duty Engineer yang bertugas hari ini melakukan inspeksi status (ONLINE / DEGRADED / OFFLINE), memeriksa latency (ms), serta mencatat kondisi server operasional.
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAddServerOpen(true)}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-300 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Tambah Server Node
                  </button>
                </div>
              </div>

              {/* Server Count Indicator */}
              <div className="flex items-center justify-between text-xs text-slate-600 px-1 font-mono">
                <span>
                  Total Server Terdaftar: <strong className="text-slate-900">{servers.length} Nodes</strong>
                </span>
                <span className="text-emerald-700 font-bold">
                  {servers.filter(s => s.status === 'ONLINE').length} Online · {servers.filter(s => s.status === 'DEGRADED').length} Degraded · {servers.filter(s => s.status === 'OFFLINE').length} Offline
                </span>
              </div>

              {/* Grid of Server Check items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {servers.length === 0 ? (
                  <div className="p-8 rounded-xl border border-dashed border-slate-300 bg-white text-center space-y-2 col-span-2">
                    <Server className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">
                      Belum ada node server yang terdaftar di sistem
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Admin dapat memasukkan list server secara manual melalui tab "Infrastructure Fleet", atau klik tombol di atas.
                    </p>
                  </div>
                ) : (
                  servers.map(server => (
                    <div
                      key={server.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-slate-900">{server.name}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{server.location}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{server.role}</div>
                        </div>

                        {/* Status Toggle Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleServerStatus(server.id, 'ONLINE')}
                            className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-colors ${
                              server.status === 'ONLINE'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-100 text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            ONLINE
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleServerStatus(server.id, 'DEGRADED')}
                            className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-colors ${
                              server.status === 'DEGRADED'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-slate-100 text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            DEGRADED
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleServerStatus(server.id, 'OFFLINE')}
                            className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-colors ${
                              server.status === 'OFFLINE'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-slate-100 text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            OFFLINE
                          </button>
                        </div>
                      </div>

                      {/* Ping and Notes */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="col-span-1">
                          <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Latency (Ping)</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={0}
                              value={server.latencyMs}
                              onChange={e => updateServerLatency(server.id, Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                            />
                            <span className="text-[10px] text-slate-500 font-mono">ms</span>
                          </div>
                        </div>

                        <div className="col-span-2">
                          <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Catatan / Kondisi Node</label>
                          <input
                            type="text"
                            placeholder="Status CPU, Memory, Disk..."
                            value={server.notes || ''}
                            onChange={e => updateServerNotes(server.id, e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-100">
                        <span>Pemeriksaan: {server.lastChecked || 'Shift awal'}</span>
                        <span className="text-slate-500">Node ID: {server.id}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MS365 DAN SOFTWARE OTHERS */}
          {activeSection === 'LICENSES' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-800 shrink-0">
                    <FileKey className="w-5 h-5" />
                  </div>
                  <div className="text-xs text-slate-700">
                    <strong className="text-purple-900 block font-bold text-sm mb-0.5">
                      Section 3: MS365 dan Software Others
                    </strong>
                    Manajemen ketersediaan lisensi cloud &amp; on-premise (Microsoft 365, AutoCAD, SAP, Adobe, dll). Update ketersediaan (available), penugasan lisensi ke pengguna baru (new user assignment), serta pencatatan pembelian lisensi baru.
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

                {/* Table of assignments */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
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
              </div>

              {/* SUBSECTION 3: NEW SOFTWARE PURCHASES */}
              <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-blue-700" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      3. Pembelian Software Baru kepada User (Software Procurement &amp; Purchases)
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {(licenses.purchases || []).length} Pembelian Tercatat
                  </span>
                </div>

                {/* Form to add purchase */}
                <form onSubmit={handleAddPurchase} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800">
                    Form Pencatatan Pembelian Software Baru
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nama Software *</label>
                      <input
                        type="text"
                        placeholder="Contoh: PowerBI Pro"
                        value={newPurchase.softwareName}
                        onChange={e => setNewPurchase({ ...newPurchase, softwareName: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">User / Pemohon *</label>
                      <input
                        type="text"
                        placeholder="Contoh: Tim Akuntansi"
                        value={newPurchase.targetUser}
                        onChange={e => setNewPurchase({ ...newPurchase, targetUser: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Jumlah Seats</label>
                      <input
                        type="number"
                        min={1}
                        value={newPurchase.quantity}
                        onChange={e => setNewPurchase({ ...newPurchase, quantity: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">No. PO / Ref Dokumen</label>
                      <input
                        type="text"
                        placeholder="PO-2026-ICT-105"
                        value={newPurchase.poNumber}
                        onChange={e => setNewPurchase({ ...newPurchase, poNumber: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Vendor / Partner</label>
                      <input
                        type="text"
                        placeholder="PT Astragraphia"
                        value={newPurchase.vendor}
                        onChange={e => setNewPurchase({ ...newPurchase, vendor: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Simpan Pembelian
                      </button>
                    </div>
                  </div>
                </form>

                {/* Table of purchases */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Software</th>
                        <th className="py-2.5 px-3">Pemohon / Departemen</th>
                        <th className="py-2.5 px-3">Jumlah Seats</th>
                        <th className="py-2.5 px-3">No. PO</th>
                        <th className="py-2.5 px-3">Vendor</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {(licenses.purchases || []).length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-4 text-center text-slate-400 font-mono text-xs">
                            Belum ada transaksi pembelian software baru pada shift ini.
                          </td>
                        </tr>
                      ) : (
                        (licenses.purchases || []).map(pur => (
                          <tr key={pur.id} className="hover:bg-slate-50 font-sans">
                            <td className="py-2.5 px-3 font-semibold text-slate-900">{pur.softwareName}</td>
                            <td className="py-2.5 px-3 text-slate-600">{pur.targetUser} ({pur.department})</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{pur.quantity} Seats</td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">{pur.poNumber}</td>
                            <td className="py-2.5 px-3 text-slate-600">{pur.vendor}</td>
                            <td className="py-2.5 px-3">
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {pur.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-sans">
                              <button
                                type="button"
                                onClick={() => handleDeletePurchase(pur.id)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded"
                                title="Hapus catatan"
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
              </div>
            </div>
          )}

          {/* TAB 4: VTC PHYSICAL INSPECTIONS (MANDATORY EVIDENCE REQUIREMENT) */}
          {activeSection === 'VTC' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
                  <Video className="w-5 h-5" />
                </div>
                <div className="text-xs text-slate-700">
                  <strong className="text-blue-900 block text-sm font-bold">
                    Mandatory Physical Inspection Policy
                  </strong>
                  Untuk inspeksi VTC / Ruang Meeting, Duty Engineer wajib berjalan langsung ke fasilitas pada awal shift (06:00 WITA), menguji audio, video, dan kabel display, serta <strong>wajib melampirkan foto bukti</strong> sebelum laporan dapat disubmit.
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

          {/* TAB 5: EXECUTIVE SUMMARY & IMMUTABLE SUBMISSION */}
          {activeSection === 'SUMMARY' && (
            <div className="space-y-5">
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <Info className="w-4 h-4 text-blue-700" />
                  <span>Executive Shift Notes &amp; Handover</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Daily Operations Executive Summary (for Superior &amp; Management)
                  </label>
                  <textarea
                    rows={3}
                    value={executiveSummary}
                    onChange={e => setExecutiveSummary(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-sans"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Shift Handover &amp; Night On-Call Briefing Notes
                  </label>
                  <textarea
                    rows={2}
                    value={shiftHandoverNotes}
                    onChange={e => setShiftHandoverNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-sans"
                  />
                </div>
              </div>

              {/* Pre-Submission Verification Checklist */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Submission Integrity Verification
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-700 font-medium">1. Tickets &amp; SLA Breakdown logged</span>
                    <span className="font-mono text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ready ({slaTickets.length} SLA Details)
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-700 font-medium">2. Server Check ({servers.length} nodes verified)</span>
                    <span className="font-mono text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {servers.filter(s => s.status === 'ONLINE').length}/{servers.length} Online
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-700 font-medium">3. MS365 &amp; Software Others status updated</span>
                    <span className="font-mono text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ready
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-700 font-medium">
                      4. Physical VTC Inspection Photos ({physicalInspections.filter(p => p.photoEvidenceUrl).length}/{physicalInspections.length} Attached)
                    </span>
                    {isVtcComplete ? (
                      <span className="font-mono text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> All Proofs Attached
                      </span>
                    ) : (
                      <span className="font-mono text-rose-700 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-rose-600" /> {missingPhotos.length} Photos Missing
                      </span>
                    )}
                  </div>
                </div>

                {/* Immutability Warning */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 mt-4">
                  <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700 leading-relaxed">
                    <strong className="text-amber-900 block font-bold mb-0.5">
                      Immutable Record Lock Policy
                    </strong>
                    Setelah menekan tombol Submit, laporan ini akan dikunci secara permanen dengan hash digital SHA-256. Notifikasi otomatis akan dikirimkan kepada Superior ICT Manager untuk verifikasi dan tanda tangan digital.
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
                <AlertTriangle className="w-4 h-4 text-amber-600" /> {missingPhotos.length} VTC inspection photos pending
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

            {activeSection !== 'SUMMARY' ? (
              <button
                type="button"
                onClick={() => {
                  if (activeSection === 'TICKETS') setActiveSection('SERVERS');
                  else if (activeSection === 'SERVERS') setActiveSection('LICENSES');
                  else if (activeSection === 'LICENSES') setActiveSection('VTC');
                  else if (activeSection === 'VTC') setActiveSection('SUMMARY');
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
                  <label className="text-slate-700 font-semibold block mb-1">Lokasi Server</label>
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
                  <label className="text-slate-700 font-semibold block mb-1">Role / Peran Server</label>
                  <input
                    type="text"
                    placeholder="Contoh: MES Realtime Ingestion & Historian"
                    value={newServerRole}
                    onChange={e => setNewServerRole(e.target.value)}
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
