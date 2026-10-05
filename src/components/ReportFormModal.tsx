import React, { useState } from 'react';
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
  BellRing,
  Layers,
  Info,
} from 'lucide-react';
import {
  TicketMetrics,
  SLAReminderItem,
  ServerCheck,
  LicenseStatus,
  PhysicalInspectionItem,
} from '../types';
import {
  INITIAL_SERVERS,
  INITIAL_LICENSES,
  INITIAL_SLA_REMINDERS,
  DEFAULT_PHYSICAL_ROOMS,
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
    meetingRooms: contextMeetingRooms,
  } = useApp();

  // Active form section tab
  const [activeSection, setActiveSection] = useState<'TICKETS' | 'SLA' | 'SERVERS' | 'LICENSES' | 'VTC' | 'SUMMARY'>('TICKETS');

  // Form State
  const [tickets, setTickets] = useState<TicketMetrics>({
    open: 18,
    onHold: 3,
    pendingUser: 7,
    closedToday: 24,
    slaBreached: 0,
    slaAtRisk: 1,
    categoryBreakdown: {
      network: 6,
      hardware: 5,
      sapErp: 9,
      m365Email: 14,
      scadaTerminal: 2,
      telephonyRadio: 4,
    },
  });

  const [slaReminders, setSlaReminders] = useState<SLAReminderItem[]>(INITIAL_SLA_REMINDERS);
  const [servers, setServers] = useState<ServerCheck[]>(() => contextServers);
  const [licenses, setLicenses] = useState<LicenseStatus>(INITIAL_LICENSES);
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
  
  const [executiveSummary, setExecutiveSummary] = useState(
    'Daily shift operations completed nominally. All VTC conference suites tested before 07:00 AM briefing. SCADA data diode firewall verified. Zero critical system downtime.'
  );
  const [shiftHandoverNotes, setShiftHandoverNotes] = useState(
    'Marine Jetty IP phone replacement confirmed resolved. AutoCAD license pool healthy. Handover to night on-call team completed.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Validation: Check if all physical room inspections have mandatory photo proof attached
  const missingPhotos = physicalInspections.filter(r => !r.photoEvidenceUrl);
  const isVtcComplete = missingPhotos.length === 0;

  // Handle server status toggle
  const toggleServerStatus = (id: string, newStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE') => {
    setServers(prev =>
      prev.map(s => (s.id === id ? { ...s, status: newStatus, lastChecked: new Date().toLocaleTimeString() } : s))
    );
  };

  // Handle physical room update
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

  // Quick action on SLA reminders
  const handleActionSlaItem = (ticketId: string) => {
    setSlaReminders(prev =>
      prev.map(item =>
        item.ticketId === ticketId
          ? { ...item, status: 'Finished - Awaiting Confirmation', actionRequired: 'Closed & verified with user.' }
          : item
      )
    );
    showToast(`Action taken on ${ticketId}. Reminder resolved.`, 'success');
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
        tickets,
        slaReminders,
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

        {/* Section Navigation Tabs */}
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
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('SLA')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeSection === 'SLA'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            2. SLA Action Prompts
            {slaReminders.some(s => s.status === 'Finished - Awaiting Confirmation') && (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
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
            3. Server Nodes ({servers.filter(s => s.status === 'ONLINE').length}/{servers.length})
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
            4. Software Licenses
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
            5. VTC Physical Check
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
            6. Review &amp; Lock
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {/* TAB 1: TICKETS */}
          {activeSection === 'TICKETS' && (
            <div className="space-y-6">
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
                    <label className="text-[11px] font-semibold text-rose-800 block">SLA Breached</label>
                    <input
                      type="number"
                      min={0}
                      value={tickets.slaBreached}
                      onChange={e => setTickets({ ...tickets, slaBreached: Number(e.target.value) })}
                      className="mt-1 w-full bg-white border border-rose-300 rounded px-2.5 py-1 text-sm font-mono text-rose-800 font-bold focus:outline-none focus:border-rose-600"
                    />
                  </div>

                  <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200">
                    <label className="text-[11px] font-semibold text-amber-800 block">SLA At Risk (&lt;2h)</label>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600">Network &amp; Telecom</label>
                    <input
                      type="number"
                      min={0}
                      value={tickets.categoryBreakdown.network}
                      onChange={e =>
                        setTickets({
                          ...tickets,
                          categoryBreakdown: { ...tickets.categoryBreakdown, network: Number(e.target.value) },
                        })
                      }
                      className="mt-1 w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600">Hardware &amp; Workstations</label>
                    <input
                      type="number"
                      min={0}
                      value={tickets.categoryBreakdown.hardware}
                      onChange={e =>
                        setTickets({
                          ...tickets,
                          categoryBreakdown: { ...tickets.categoryBreakdown, hardware: Number(e.target.value) },
                        })
                      }
                      className="mt-1 w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600">SAP ERP &amp; Plant Apps</label>
                    <input
                      type="number"
                      min={0}
                      value={tickets.categoryBreakdown.sapErp}
                      onChange={e =>
                        setTickets({
                          ...tickets,
                          categoryBreakdown: { ...tickets.categoryBreakdown, sapErp: Number(e.target.value) },
                        })
                      }
                      className="mt-1 w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600">M365 &amp; Email Flow</label>
                    <input
                      type="number"
                      min={0}
                      value={tickets.categoryBreakdown.m365Email}
                      onChange={e =>
                        setTickets({
                          ...tickets,
                          categoryBreakdown: { ...tickets.categoryBreakdown, m365Email: Number(e.target.value) },
                        })
                      }
                      className="mt-1 w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600">SCADA / DCS Terminal Access</label>
                    <input
                      type="number"
                      min={0}
                      value={tickets.categoryBreakdown.scadaTerminal}
                      onChange={e =>
                        setTickets({
                          ...tickets,
                          categoryBreakdown: { ...tickets.categoryBreakdown, scadaTerminal: Number(e.target.value) },
                        })
                      }
                      className="mt-1 w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600">Radio VHF/UHF &amp; PAGA</label>
                    <input
                      type="number"
                      min={0}
                      value={tickets.categoryBreakdown.telephonyRadio}
                      onChange={e =>
                        setTickets({
                          ...tickets,
                          categoryBreakdown: { ...tickets.categoryBreakdown, telephonyRadio: Number(e.target.value) },
                        })
                      }
                      className="mt-1 w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs font-mono text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SLA REMINDERS */}
          {activeSection === 'SLA' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700">
                  <strong className="text-amber-900 block font-semibold">SLA Closure Enforcement Rule</strong>
                  The system scans open work orders where engineering work is marked complete but pending user sign-off.
                  Prompt users or confirm resolution to maintain PT.DSLNG 98.5% Helpdesk SLA compliance.
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Ticket ID</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Requester / Dept</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {slaReminders.map(item => (
                      <tr key={item.ticketId} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-mono text-blue-700 font-semibold">
                          {item.ticketId}
                        </td>
                        <td className="py-3 px-4 text-slate-900">
                          {item.title}
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Open: {item.hoursOpen}h · {item.actionRequired}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {item.user}
                          <div className="text-[10px] text-slate-400 font-mono">{item.department}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                              item.status === 'Finished - Awaiting Confirmation'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleActionSlaItem(item.ticketId)}
                            className="px-3 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                          >
                            Action &amp; Confirm
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SERVERS */}
          {activeSection === 'SERVERS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold">Infrastructure Health Checklist (Site Uso Plant DC &amp; HO Jkt Link)</span>
                <span className="font-mono text-emerald-700 font-bold">
                  {servers.filter(s => s.status === 'ONLINE').length} / {servers.length} Operational
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {servers.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-slate-300 bg-white text-center space-y-2 col-span-2">
                    <p className="text-xs font-semibold text-slate-700">
                      Belum ada Server yang terdaftar dalam sistem
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Daftarkan server operasional perusahaan melalui tab "Infrastructure Fleet".
                    </p>
                  </div>
                ) : (
                  servers.map(server => (
                    <div
                      key={server.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5"
                    >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-slate-900">{server.name}</div>
                        <div className="text-[11px] text-slate-500">{server.location}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{server.role}</div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleServerStatus(server.id, 'ONLINE')}
                          className={`px-2 py-1 rounded text-[11px] font-mono font-medium transition-colors ${
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
                          className={`px-2 py-1 rounded text-[11px] font-mono font-medium transition-colors ${
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
                          className={`px-2 py-1 rounded text-[11px] font-mono font-medium transition-colors ${
                            server.status === 'OFFLINE'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-slate-100 text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          OFFLINE
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
                      <span>Note: {server.notes || 'Status nominal.'}</span>
                      <span className="font-mono text-slate-500 font-medium">{server.latencyMs}ms ping</span>
                    </div>
                  </div>
                ))
              )}
              </div>
            </div>
          )}

          {/* TAB 4: LICENSES */}
          {activeSection === 'LICENSES' && (
            <div className="space-y-5">
              <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Enterprise Cloud &amp; Engineering License Counts
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-600 block">Microsoft 365 E3 Pool</span>
                    <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                      {licenses.m365E3Assigned} / {licenses.m365E3Total}
                    </div>
                    <div className="text-[11px] text-emerald-700 mt-1 font-medium">
                      {licenses.m365E3Total - licenses.m365E3Assigned} Available buffer
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-600 block">Microsoft 365 E5 (Executive)</span>
                    <div className="text-xl font-bold font-mono text-amber-800 mt-1">
                      {licenses.m365E5Assigned} / {licenses.m365E5Total}
                    </div>
                    <div className="text-[11px] text-amber-700 mt-1 font-medium">
                      {licenses.m365E5Total - licenses.m365E5Assigned} Available (Attention required)
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-600 block">AutoCAD AEC Floating Seats</span>
                    <div className="text-xl font-bold font-mono text-blue-800 mt-1">
                      {licenses.autocadFloatingInUse} / {licenses.autocadFloatingTotal}
                    </div>
                    <div className="text-[11px] text-blue-700 mt-1 font-medium">
                      {licenses.autocadFloatingTotal - licenses.autocadFloatingInUse} Floating seats free
                    </div>
                  </div>
                </div>
              </div>

              {/* Expiration warning alerts */}
              <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Upcoming License Renewals (&lt;90 Days)
                </h4>
                <div className="space-y-2">
                  {licenses.expirations.map(exp => (
                    <div
                      key={exp.software}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{exp.software}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Vendor: {exp.vendor} · {exp.seats} Seats Licensed
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-mono text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            exp.daysRemaining <= 30
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {exp.daysRemaining} Days Left
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: VTC PHYSICAL INSPECTIONS (MANDATORY EVIDENCE REQUIREMENT) */}
          {activeSection === 'VTC' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
                  <Video className="w-5 h-5" />
                </div>
                <div className="text-xs text-slate-700">
                  <strong className="text-blue-900 block text-sm font-bold">
                    Mandatory Physical Inspection Policy (PRD Section 3.3)
                  </strong>
                  For VTC/Meeting Room inspections, the Duty Engineer must physically walk through the facility at 06:00 AM, inspect audio, video, and sharing cables, and <strong>strictly upload an image</strong> (taken from mobile device camera or photo file) as proof before this section can be submitted.
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

                    {/* Inspection Checklist Switches */}
                    <div className="grid grid-cols-3 gap-2 my-3 text-xs">
                      <div className="p-2 rounded bg-slate-50 border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-500 block mb-1">Audio / Mic</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateRoomInspection(room.id, {
                              audioStatus: room.audioStatus === 'PASS' ? 'FAIL' : 'PASS',
                            })
                          }
                          className={`w-full py-1 text-[11px] font-mono font-semibold rounded ${
                            room.audioStatus === 'PASS'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {room.audioStatus}
                        </button>
                      </div>

                      <div className="p-2 rounded bg-slate-50 border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-500 block mb-1">Display / Cam</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateRoomInspection(room.id, {
                              videoStatus: room.videoStatus === 'PASS' ? 'FAIL' : 'PASS',
                            })
                          }
                          className={`w-full py-1 text-[11px] font-mono font-semibold rounded ${
                            room.videoStatus === 'PASS'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {room.videoStatus}
                        </button>
                      </div>

                      <div className="p-2 rounded bg-slate-50 border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-500 block mb-1">Cables</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateRoomInspection(room.id, {
                              sharingCablesStatus: room.sharingCablesStatus === 'PASS' ? 'FAIL' : 'PASS',
                            })
                          }
                          className={`w-full py-1 text-[11px] font-mono font-semibold rounded ${
                            room.sharingCablesStatus === 'PASS'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {room.sharingCablesStatus}
                        </button>
                      </div>
                    </div>

                    {/* Room Notes */}
                    <div className="mb-3">
                      <input
                        type="text"
                        value={room.notes}
                        onChange={e => updateRoomInspection(room.id, { notes: e.target.value })}
                        placeholder="Inspection observations / cable condition..."
                        className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    {/* Mandatory Photo Proof Upload Component */}
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

          {/* TAB 6: EXECUTIVE SUMMARY & IMMUTABLE SUBMISSION */}
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
                    <span className="text-slate-700 font-medium">Ticket Operations Metrics logged</span>
                    <span className="font-mono text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ready
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-700 font-medium">Infrastructure Server Status ({servers.length} nodes verified)</span>
                    <span className="font-mono text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ready
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-700 font-medium">
                      Physical VTC Inspection Photos ({physicalInspections.filter(p => p.photoEvidenceUrl).length}/{physicalInspections.length} Attached)
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

                {/* Immutability Warning per PRD Step 4 */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 mt-4">
                  <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700 leading-relaxed">
                    <strong className="text-amber-900 block font-bold mb-0.5">
                      PRD Step 4: Immutable Record Lock Rule
                    </strong>
                    Upon clicking Submit, this report will be permanently locked with a digital hash.
                    Neither you nor any other Helpdesk Engineer will be able to modify, delete, or overwrite it.
                    Automated push notification will be sent to Superior ICT Manager for formal review &amp; E-Signature.
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
                  if (activeSection === 'TICKETS') setActiveSection('SLA');
                  else if (activeSection === 'SLA') setActiveSection('SERVERS');
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

        {/* Confirmation Modal for Immutability */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl text-slate-900">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-amber-100 text-amber-800">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Confirm Permanent Report Submission
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Are you sure you want to finalize and lock the daily report for{' '}
                    <strong className="text-slate-900 font-bold">{date}</strong>?
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1 font-mono">
                <div>Submitter: {currentUser.name}</div>
                <div>Duty Shift: {currentUser.shift}</div>
                <div>Photos Verified: 4/4 Meeting Rooms</div>
                <div className="text-amber-800 font-bold pt-1 text-[11px]">
                  Warning: Action is irreversible. Document cannot be altered post-submission.
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
                >
                  Cancel &amp; Review
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
                  Confirm Submission
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
