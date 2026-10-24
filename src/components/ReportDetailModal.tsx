import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Lock,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  ShieldCheck,
  Server,
  Ticket,
  Video,
  FileKey,
  Layers,
  Building2,
  PenTool,
  AlertTriangle,
  History,
  FileCheck,
  UserCheck,
  Filter,
  Mail,
  ShieldAlert,
  FileText,
  AlertCircle,
  Package,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { DigitalSignaturePad } from './DigitalSignaturePad';

interface ReportDetailModalProps {
  reportId: string;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({ reportId }) => {
  const { reports, closeModal, currentUser, teamMembers, reviewDailyReport, showToast } = useApp();

  const report = reports.find(r => r.id === reportId);

  // Superior action state
  const [managerDecision, setManagerDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [managerComments, setManagerComments] = useState('');
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SERVERS' | 'LICENSES' | 'PHOTOS' | 'SECURITY' | 'AUDIT'>('OVERVIEW');
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);
  const [slaFilter, setSlaFilter] = useState<'ALL' | 'SLA_BREACHED' | 'SLA_AT_RISK'>('ALL');

  if (!report) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 p-6 rounded-xl max-w-md text-center text-slate-900">
          <p className="text-slate-600 text-sm">Report not found or has been archived.</p>
          <button
            type="button"
            onClick={closeModal}
            className="mt-4 px-4 py-2 bg-slate-100 text-slate-800 rounded text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const isSuperior = currentUser.role === 'ICT_MANAGER' || currentUser.role === 'ADMINISTRATOR';
  const isPendingSuperiorReview = report.status === 'SUBMITTED';

  const handleSuperiorAction = (e: React.FormEvent) => {
    e.preventDefault();

    if (!managerComments.trim()) {
      showToast('Mandatory: Superior must provide written feedback or evaluation comments.', 'error');
      return;
    }

    if (!signatureDataUrl) {
      showToast('Mandatory: Superior E-Signature or PIN authorization is required to validate the report.', 'error');
      return;
    }

    setIsSubmittingReview(true);
    try {
      reviewDailyReport(report.id, managerDecision, managerComments, signatureDataUrl);
      closeModal();
    } catch (e) {
      console.error(e);
      showToast('Failed to sign and process approval.', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Extract SLA ticket details
  const reportSlaTickets = report.slaTickets || report.tickets.slaTickets || [];
  const filteredSlaTickets = reportSlaTickets.filter(t => {
    if (slaFilter === 'ALL') return true;
    return t.slaStatus === slaFilter;
  });

  const ms365Items = (report.licenses?.items || []).filter(item => item.category === 'MS365');
  const otherItems = (report.licenses?.items || []).filter(item => item.category === 'OTHERS');
  const userAssignments = report.licenses?.userAssignments || [];

  const DETAIL_TABS: { id: 'OVERVIEW' | 'SERVERS' | 'LICENSES' | 'PHOTOS' | 'SECURITY' | 'AUDIT'; label: string; shortLabel: string }[] = [
    { id: 'OVERVIEW', label: '1. Tickets & SLA', shortLabel: 'Tiket' },
    { id: 'SERVERS', label: '2. Server Check', shortLabel: 'Server' },
    { id: 'LICENSES', label: '3. MS365 and Software Others', shortLabel: 'Lisensi' },
    { id: 'PHOTOS', label: '4. Physical Check Meeting Room', shortLabel: 'Meeting' },
    { id: 'SECURITY', label: '5. Mailbox and CrowdStrike', shortLabel: 'Mailbox' },
    { id: 'AUDIT', label: '6. Summary & Audit Trail', shortLabel: 'Summary' },
  ];

  const currentTabIndex = DETAIL_TABS.findIndex(t => t.id === activeTab);
  const handlePrevTab = () => {
    if (currentTabIndex > 0) setActiveTab(DETAIL_TABS[currentTabIndex - 1].id);
  };
  const handleNextTab = () => {
    if (currentTabIndex < DETAIL_TABS.length - 1) setActiveTab(DETAIL_TABS[currentTabIndex + 1].id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-1 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:text-black">
      <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl w-full max-w-5xl my-auto shadow-2xl flex flex-col max-h-[96vh] sm:max-h-[94vh] text-slate-900 overflow-hidden print:max-h-none print:border-none print:shadow-none print:bg-white">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/80 print:hidden">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-lg bg-blue-100 text-blue-800 shrink-0">
              <FileCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 className="text-xs sm:text-base font-bold text-slate-900 truncate">
                  PT Donggi-Senoro LNG Daily Report: {report.reportDate}
                </h2>
                {report.status === 'APPROVED' && (
                  <span className="text-[10px] sm:text-[11px] font-mono px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Superior Approved
                  </span>
                )}
                {report.status === 'SUBMITTED' && (
                  <span className="text-[10px] sm:text-[11px] font-mono px-2 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200 flex items-center gap-1 animate-pulse shrink-0">
                    <Clock className="w-3 h-3 text-amber-600" /> Awaiting Superior E-Signature
                  </span>
                )}
                {report.status === 'REJECTED' && (
                  <span className="text-[10px] sm:text-[11px] font-mono px-2 py-0.2 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-200 flex items-center gap-1 shrink-0">
                    <XCircle className="w-3 h-3 text-rose-600" /> Revision Requested
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                Ref: {report.id} · Submitter: {report.dutyEngineerName} ({report.dutyEngineerBadge})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              aria-label="Print report"
              className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Print / Save PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close modal"
              className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MOBILE STEPPER: 100% width, No Horizontal Scroll (md:hidden, print:hidden) */}
        <div className="md:hidden px-3 pt-2.5 pb-2 border-b border-slate-200 bg-slate-50/90 shrink-0 space-y-1.5 print:hidden">
          {/* 6 Step Segmented Buttons spanning 100% width */}
          <div className="grid grid-cols-6 gap-1">
            {DETAIL_TABS.map((tab, idx) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-1.5 px-0.5 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center relative ${
                    isActive
                      ? 'bg-blue-700 text-white shadow-xs ring-2 ring-blue-600/30'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs">{idx + 1}</span>
                  <span className={`text-[9px] font-medium truncate max-w-full leading-tight ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                    {tab.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Step Indicator & Dropdown Switcher */}
          <div className="flex items-center justify-between gap-1.5">
            <button
              type="button"
              disabled={currentTabIndex === 0}
              onClick={handlePrevTab}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 shrink-0"
              title="Bagian Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Dropdown Section Selector */}
            <div className="relative flex-1 min-w-0">
              <select
                value={activeTab}
                onChange={e => setActiveTab(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-lg py-1.5 pl-2.5 pr-7 text-xs font-bold text-slate-800 appearance-none focus:outline-none focus:border-blue-600 truncate"
              >
                {DETAIL_TABS.map((tab, idx) => (
                  <option key={tab.id} value={tab.id}>
                    Bagian {idx + 1}/6: {tab.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>

            <button
              type="button"
              disabled={currentTabIndex === DETAIL_TABS.length - 1}
              onClick={handleNextTab}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 shrink-0"
              title="Bagian Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* DESKTOP TABS: Visible on md and up (hidden md:flex print:hidden) */}
        <div className="hidden md:flex px-6 pt-3 border-b border-slate-200 bg-white items-center gap-2 overflow-x-auto shrink-0 print:hidden">
          <button
            type="button"
            onClick={() => setActiveTab('OVERVIEW')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'OVERVIEW'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            1. Tickets &amp; SLA
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SERVERS')}
            className={`pb-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'SERVERS'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            2. Server Check ({report.servers.filter(s => s.status === 'ONLINE').length}/{report.servers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('LICENSES')}
            className={`pb-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'LICENSES'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileKey className="w-3.5 h-3.5" />
            3. MS365 and Software Others
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PHOTOS')}
            className={`pb-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'PHOTOS'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            4. Physical Check Meeting Room ({report.physicalInspections.filter(p => p.photoEvidenceUrl).length}/{report.physicalInspections.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SECURITY')}
            className={`pb-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'SECURITY'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            5. Mailbox and CrowdStrike
            {report.mailboxCrowdstrike && ((report.mailboxCrowdstrike.crowdstrikeMaliciousActivity || 0) > 0 || (report.mailboxCrowdstrike.mailboxFull || 0) > 0) && (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('AUDIT')}
            className={`pb-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'AUDIT'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            6. Summary &amp; Audit Trail
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/40 print:p-8 print:bg-white">
          {/* Printable Official Header */}
          <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold uppercase text-slate-900">PT Donggi-Senoro LNG</h1>
                <h2 className="text-sm font-semibold text-slate-700">Information &amp; Communication Technology (ICT) Operations</h2>
                <div className="text-xs text-slate-500">Daily Operations &amp; Shift Accountability Record</div>
              </div>
              <div className="text-right text-xs font-mono text-slate-700">
                <div>Date: {report.reportDate}</div>
                <div>Status: {report.status}</div>
                <div>Document ID: {report.id}</div>
              </div>
            </div>
          </div>

          {/* Immutability Banner */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 block">
                  Immutable Record Protected by Digital Roster Hash
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Hash: {report.immutableLockHash || 'dslng_sha256_locked_e3b0c44298fc'} · Submitted: {report.submittedAt || 'N/A'}
                </span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 font-mono text-right shrink-0">
              Station: {report.location}
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {(activeTab === 'OVERVIEW' || window.matchMedia?.('print').matches) && (
            <div className="space-y-6">
              {/* Executive Summary */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Duty Engineer Executive Summary
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  {report.executiveSummary || 'Operations executed according to standard operating procedures. All critical systems online.'}
                </p>
                {report.shiftHandoverNotes && (
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                    <strong className="text-slate-800 font-semibold">Handover Briefing:</strong> {report.shiftHandoverNotes}
                  </div>
                )}
              </div>

              {/* Ticket Metrics Grid */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-blue-700" />
                    Section 1: Ticket Operations &amp; SLA Metrics
                  </span>
                  <span className="font-mono text-emerald-800 font-semibold text-[11px]">
                    SLA Compliance: {report.tickets.slaBreached === 0 ? '100% Nominal' : `${report.tickets.slaBreached} Breaches Logged`}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 font-medium block">Open</span>
                    <span className="text-xl font-bold font-mono text-slate-900 mt-0.5 block tabular-nums">
                      {report.tickets.open}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 font-medium block">On-Hold</span>
                    <span className="text-xl font-bold font-mono text-slate-700 mt-0.5 block tabular-nums">
                      {report.tickets.onHold}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 font-medium block">Pending User</span>
                    <span className="text-xl font-bold font-mono text-slate-700 mt-0.5 block tabular-nums">
                      {report.tickets.pendingUser}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                    <span className="text-[10px] text-emerald-800 font-semibold block">Closed Today</span>
                    <span className="text-xl font-bold font-mono text-emerald-800 mt-0.5 block tabular-nums">
                      {report.tickets.closedToday}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-center">
                    <span className="text-[10px] text-rose-800 font-semibold block">SLA Breached</span>
                    <span className="text-xl font-bold font-mono text-rose-800 mt-0.5 block tabular-nums">
                      {report.tickets.slaBreached}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-center">
                    <span className="text-[10px] text-amber-800 font-semibold block">SLA At Risk</span>
                    <span className="text-xl font-bold font-mono text-amber-800 mt-0.5 block tabular-nums">
                      {report.tickets.slaAtRisk}
                    </span>
                  </div>
                </div>

                {/* Category breakdown table */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Service Request Breakdown by Operational Category
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-slate-700">
                    <div className="p-2 rounded bg-slate-50 border border-slate-200">
                      Helpdesk: <strong className="text-slate-900">{report.tickets.categoryBreakdown.helpdesk}</strong>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-200">
                      MES: <strong className="text-slate-900">{report.tickets.categoryBreakdown.mes}</strong>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-200">
                      ERP: <strong className="text-slate-900">{report.tickets.categoryBreakdown.erp}</strong>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-200">
                      Network/Telecom/Radio: <strong className="text-slate-900">{report.tickets.categoryBreakdown.networkTelecomRadio}</strong>
                    </div>
                  </div>
                </div>

                {/* Detailed SLA Breached & SLA At Risk Section (User Request #1) */}
                {reportSlaTickets.length > 0 && (
                  <div className="pt-3 border-t border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                          Rincian Tiket Over SLA &amp; SLA At Risk ({reportSlaTickets.length} Tiket)
                        </h4>
                      </div>

                      {/* Filter tabs */}
                      <div className="flex items-center gap-1.5 text-xs font-mono">
                        <button
                          type="button"
                          onClick={() => setSlaFilter('ALL')}
                          className={`px-2 py-0.5 rounded text-[11px] ${
                            slaFilter === 'ALL'
                              ? 'bg-slate-900 text-white font-bold'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Semua ({reportSlaTickets.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setSlaFilter('SLA_BREACHED')}
                          className={`px-2 py-0.5 rounded text-[11px] flex items-center gap-1 ${
                            slaFilter === 'SLA_BREACHED'
                              ? 'bg-rose-700 text-white font-bold'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          }`}
                        >
                          Breached ({reportSlaTickets.filter(t => t.slaStatus === 'SLA_BREACHED').length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setSlaFilter('SLA_AT_RISK')}
                          className={`px-2 py-0.5 rounded text-[11px] flex items-center gap-1 ${
                            slaFilter === 'SLA_AT_RISK'
                              ? 'bg-amber-600 text-white font-bold'
                              : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                          }`}
                        >
                          At Risk ({reportSlaTickets.filter(t => t.slaStatus === 'SLA_AT_RISK').length})
                        </button>
                      </div>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block border border-slate-200 rounded-xl overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">No. Tiket</th>
                            <th className="py-2.5 px-3">Subject</th>
                            <th className="py-2.5 px-3">Requester</th>
                            <th className="py-2.5 px-3">Category</th>
                            <th className="py-2.5 px-3">Over SLA</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3">Technician Bertugas</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                          {filteredSlaTickets.map(t => (
                            <tr key={t.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-bold text-blue-700">{t.ticketNumber}</td>
                              <td className="py-2.5 px-3 font-sans text-slate-900 font-medium">{t.subject}</td>
                              <td className="py-2.5 px-3 font-sans text-slate-600">{t.requester}</td>
                              <td className="py-2.5 px-3">
                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-sans text-[11px]">
                                  {t.category}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-rose-700 font-bold">{t.overSlaTime}</td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    t.slaStatus === 'SLA_BREACHED'
                                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                                  }`}
                                >
                                  {t.slaStatus === 'SLA_BREACHED' ? 'BREACHED' : 'AT RISK'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">
                                {t.technician}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Stacked Card View (No horizontal scrolling) */}
                    <div className="block md:hidden space-y-2.5">
                      {filteredSlaTickets.map(t => (
                        <div
                          key={t.id}
                          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
                            <span className="font-mono font-bold text-blue-700 text-xs">{t.ticketNumber}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                t.slaStatus === 'SLA_BREACHED'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {t.slaStatus === 'SLA_BREACHED' ? 'BREACHED' : 'AT RISK'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Subject</span>
                            <div className="font-semibold text-slate-900 mt-0.5">{t.subject}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                            <div>
                              <span className="text-[10px] text-slate-500 block">Requester:</span>
                              <span className="font-medium text-slate-800 truncate block">{t.requester}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block">Category:</span>
                              <span className="font-medium text-slate-800">{t.category}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block">Over SLA:</span>
                              <span className="font-mono font-bold text-rose-700">{t.overSlaTime}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block">Technician:</span>
                              <span className="font-semibold text-slate-800">{t.technician}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Physical Check Summary Teaser */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-blue-700" />
                    Physical VTC Inspection Verification
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('PHOTOS')}
                    className="text-blue-700 hover:underline font-mono text-xs font-semibold"
                  >
                    View All Photos ({report.physicalInspections.length}) →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {report.physicalInspections.map(room => (
                    <div
                      key={room.id}
                      className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-2 cursor-pointer hover:border-blue-400 transition-colors"
                      onClick={() => setActiveTab('PHOTOS')}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 truncate">{room.roomName}</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      </div>
                      <div className="h-24 rounded-lg bg-slate-200 overflow-hidden relative border border-slate-200">
                        {room.photoEvidenceUrl ? (
                          <img
                            src={room.photoEvidenceUrl}
                            alt={room.roomName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">
                            No photo attached
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-slate-900/80 text-white px-1.5 py-0.5 rounded">
                          Inspect
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-600 font-mono flex justify-between">
                        <span>Audio: {room.audioStatus}</span>
                        <span>Video: {room.videoStatus}</span>
                        <span>Cables: {room.sharingCablesStatus}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Superior Review & E-Signature Display */}
              {report.superiorReview && (
                <div className="rounded-xl border border-emerald-300 bg-emerald-50/60 p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-700" />
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                          Formal Superior Approval &amp; E-Signature Stamp
                        </h4>
                        <span className="text-[11px] text-slate-600 font-mono">
                          Reviewer: {report.superiorReview.managerName} · {report.superiorReview.reviewedAt}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-emerald-700 text-white shadow-2xs">
                      {report.superiorReview.decision}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-emerald-200 text-xs text-slate-800">
                    <strong className="text-emerald-900 block font-semibold mb-1">
                      Superior Feedback &amp; Verification Remarks:
                    </strong>
                    "{report.superiorReview.comments}"
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60">
                    <div className="text-[11px] font-mono text-slate-500">
                      Digital Audit Stamp: {report.superiorReview.digitalStampId}
                    </div>
                    {report.superiorReview.signatureDataUrl && (
                      <div className="border border-slate-300 rounded bg-white p-1">
                        <img
                          src={report.superiorReview.signatureDataUrl}
                          alt="Superior Digital Signature"
                          className="h-10 object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PHOTOS */}
          {activeTab === 'PHOTOS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                <span className="font-semibold text-slate-700">
                  Mandatory Conference Room &amp; VTC Physical Walkthrough Photos
                </span>
                <span className="font-mono text-emerald-700 font-bold">
                  {report.physicalInspections.filter(p => p.photoEvidenceUrl).length}/{report.physicalInspections.length} Rooms Verified
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.physicalInspections.map((room, index) => (
                  <div
                    key={room.id}
                    className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          0{index + 1}. {room.roomName}
                        </h4>
                        <span className="text-[11px] text-slate-500 font-mono">{room.location}</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
                        Physical Pass
                      </span>
                    </div>

                    <div
                      onClick={() => room.photoEvidenceUrl && setExpandedPhoto(room.photoEvidenceUrl)}
                      className="relative h-60 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 cursor-pointer group flex items-center justify-center shadow-2xs"
                    >
                      {room.photoEvidenceUrl ? (
                        <>
                          <img
                            src={room.photoEvidenceUrl}
                            alt={room.roomName}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-xs font-semibold text-slate-900 bg-white/95 px-3 py-1.5 rounded-lg border border-slate-300 shadow-sm">
                              Enlarge Fullscreen
                            </span>
                          </div>
                          <div className="absolute bottom-2 left-2 bg-slate-900/85 backdrop-blur-xs px-2.5 py-0.5 rounded text-[10px] font-mono text-white">
                            {room.photoTimestamp || report.submittedAt || (room.location === 'Site Uso' ? '06:15 WITA' : '07:15 WIB')}
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">No photo provided</span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center">
                      <div className="p-2 rounded bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Audio Pod</span>
                        <span className="text-emerald-700 font-bold">{room.audioStatus}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">4K Display</span>
                        <span className="text-emerald-700 font-bold">{room.videoStatus}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Sharing Cables</span>
                        <span className="text-emerald-700 font-bold">{room.sharingCablesStatus}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SERVER CHECK (REVISED SECTION 2) */}
          {activeTab === 'SERVERS' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Section 2: Server Check (Infrastructure Health Checklist)
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Daftar server terdata oleh Admin dan diverifikasi ketersediaannya oleh Helpdesk pada shift ini.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                    {report.servers.filter(s => s.status === 'ONLINE').length} / {report.servers.length} Operational
                  </span>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Nama Server</th>
                        <th className="py-2.5 px-3">Lokasi Penempatan</th>
                        <th className="py-2.5 px-3">Status Operasional</th>
                        <th className="py-2.5 px-3">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {report.servers.map(server => (
                        <tr key={server.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-3 text-slate-900 font-sans font-semibold">
                            {server.name}
                          </td>
                          <td className="py-3 px-3 text-slate-600 font-sans">{server.location}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold border inline-flex items-center gap-1.5 ${
                                server.status === 'ONLINE'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : server.status === 'DEGRADED'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  server.status === 'ONLINE'
                                    ? 'bg-emerald-600'
                                    : server.status === 'DEGRADED'
                                    ? 'bg-amber-600'
                                    : 'bg-rose-600'
                                }`}
                              />
                              {server.status === 'ONLINE'
                                ? 'Online (Normal)'
                                : server.status === 'DEGRADED'
                                ? 'Degraded (Perhatian)'
                                : 'Offline (Gangguan)'}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-sans text-slate-600 text-xs">
                            {server.notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Stacked Card View (No horizontal scrolling) */}
                <div className="block md:hidden space-y-2.5">
                  {report.servers.map(server => (
                    <div
                      key={server.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-900 text-xs">{server.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border inline-flex items-center gap-1 ${
                            server.status === 'ONLINE'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : server.status === 'DEGRADED'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              server.status === 'ONLINE'
                                ? 'bg-emerald-600'
                                : server.status === 'DEGRADED'
                                ? 'bg-amber-600'
                                : 'bg-rose-600'
                            }`}
                          />
                          {server.status === 'ONLINE'
                            ? 'Online'
                            : server.status === 'DEGRADED'
                            ? 'Degraded'
                            : 'Offline'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        <span className="text-[10px] text-slate-500 block">Lokasi Penempatan:</span>
                        <span className="font-medium text-slate-800">{server.location}</span>
                      </div>
                      {server.notes && (
                        <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                          <span className="text-[10px] text-slate-500 block">Catatan:</span>
                          <span className="italic text-slate-700">{server.notes}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MS365 DAN SOFTWARE OTHERS (REVISED SECTION 3) */}
          {activeTab === 'LICENSES' && (
            <div className="space-y-6">
              {/* License snapshot */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    1. Status Ketersediaan Lisensi (MS365 &amp; Software Others)
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">Available = Total - Assigned</span>
                </div>

                {/* Microsoft 365 Section */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono inline-block">
                    Microsoft 365 Subscriptions
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {(ms365Items.length > 0 ? ms365Items : [
                      { id: '1', softwareName: 'Microsoft 365 E3', totalLicenses: report.licenses.m365E3Total, assignedLicenses: report.licenses.m365E3Assigned },
                      { id: '2', softwareName: 'Microsoft 365 E5', totalLicenses: report.licenses.m365E5Total, assignedLicenses: report.licenses.m365E5Assigned },
                    ]).map(item => {
                      const avail = item.totalLicenses - item.assignedLicenses;
                      return (
                        <div key={item.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-slate-600 font-bold block">{item.softwareName}</span>
                          <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                            {item.assignedLicenses} / {item.totalLicenses} Assigned
                          </div>
                          <div className="text-[11px] text-emerald-700 font-semibold font-mono mt-1">
                            {avail} Available Seats
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Software Others Section */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono inline-block">
                    Software Others (Engineering &amp; Enterprise Apps)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {(otherItems.length > 0 ? otherItems : [
                      { id: '3', softwareName: 'AutoCAD Floating AEC', totalLicenses: report.licenses.autocadFloatingTotal, assignedLicenses: report.licenses.autocadFloatingInUse },
                    ]).map(item => {
                      const avail = item.totalLicenses - item.assignedLicenses;
                      return (
                        <div key={item.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-slate-600 font-bold block">{item.softwareName}</span>
                          <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                            {item.assignedLicenses} / {item.totalLicenses} In Use
                          </div>
                          <div className="text-[11px] text-blue-700 font-semibold font-mono mt-1">
                            {avail} Floating Free
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* User Assignments */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      2. Penugasan Lisensi ke User Baru ({userAssignments.length} Penugasan)
                    </h3>
                  </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block border border-slate-200 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Nama User</th>
                        <th className="py-2.5 px-3">Departemen</th>
                        <th className="py-2.5 px-3">Lisensi yang Ditugaskan</th>
                        <th className="py-2.5 px-3">Tanggal Penugasan</th>
                        <th className="py-2.5 px-3">Ref Tiket</th>
                        <th className="py-2.5 px-3">Petugas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {userAssignments.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-slate-400 font-mono">
                            Tidak ada penugasan lisensi baru pada shift ini.
                          </td>
                        </tr>
                      ) : (
                        userAssignments.map(asg => (
                          <tr key={asg.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-semibold text-slate-900">{asg.userName}</td>
                            <td className="py-2.5 px-3 text-slate-600">{asg.department}</td>
                            <td className="py-2.5 px-3">
                              <span className="font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                {asg.softwareName}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-500">{asg.assignedDate}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-500">{asg.ticketRef}</td>
                            <td className="py-2.5 px-3 text-slate-600">{asg.assignedBy}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Stacked Card View (No horizontal scrolling) */}
                <div className="block md:hidden space-y-2.5">
                  {userAssignments.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 font-mono bg-slate-50 rounded-xl border border-slate-200">
                      Tidak ada penugasan lisensi baru pada shift ini.
                    </div>
                  ) : (
                    userAssignments.map(asg => (
                      <div
                        key={asg.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
                          <span className="font-semibold text-slate-900 text-xs">{asg.userName}</span>
                          <span className="font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded text-[10px] border border-blue-200">
                            {asg.softwareName}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-[10px] text-slate-500 block">Departemen:</span>
                            <span className="font-medium text-slate-800">{asg.department}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">Ref Tiket:</span>
                            <span className="font-mono text-slate-700 font-semibold">{asg.ticketRef}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">Tanggal:</span>
                            <span className="font-mono text-slate-600">{asg.assignedDate}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">Petugas:</span>
                            <span className="font-medium text-slate-700">{asg.assignedBy}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MAILBOX AND CROWDSTRIKE (SECTION 5) */}
          {activeTab === 'SECURITY' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Section 5: Mailbox and CrowdStrike Monitoring
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Pemantauan kapasitas mailbox email user dan status endpoint protection CrowdStrike Falcon.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                    Shift Security &amp; Messaging Status
                  </span>
                </div>

                {/* 4 Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-900">Mailbox Almost Full</span>
                      <Mail className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-amber-950 mt-2">
                      {report.mailboxCrowdstrike?.mailboxAlmostFull ?? 0}
                    </div>
                    <span className="text-[10px] text-amber-700 font-medium mt-0.5 block">
                      Kuota penyimpanan mendekati penuh
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/60">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-rose-900">Mailbox Full</span>
                      <Mail className="w-4 h-4 text-rose-600" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-rose-950 mt-2">
                      {report.mailboxCrowdstrike?.mailboxFull ?? 0}
                    </div>
                    <span className="text-[10px] text-rose-700 font-medium mt-0.5 block">
                      Kuota penyimpanan 100% penuh
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-red-300 bg-red-100/60">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-red-950">Crowdstrike Detection</span>
                      <ShieldAlert className="w-4 h-4 text-red-700" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-red-950 mt-2">
                      {report.mailboxCrowdstrike?.crowdstrikeMaliciousActivity ?? 0}
                    </div>
                    <span className="text-[10px] text-red-800 font-semibold mt-0.5 block">
                      Aktivitas mencurigakan / malware
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800">Crowdstrike Inactive</span>
                      <Clock className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-slate-900 mt-2">
                      {report.mailboxCrowdstrike?.crowdstrikeInactive30Days ?? 0}
                    </div>
                    <span className="text-[10px] text-slate-600 font-medium mt-0.5 block">
                      Sensor agent tidak aktif &gt; 30 hari
                    </span>
                  </div>
                </div>

                {/* Details Table */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Detail Insiden / Tindakan Terkait
                  </h4>
                  {/* Desktop Table View */}
                  <div className="hidden md:block border border-slate-200 rounded-xl overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Tipe Peringatan</th>
                          <th className="py-2.5 px-3">Target (User / Host)</th>
                          <th className="py-2.5 px-3">Departemen / Lokasi</th>
                          <th className="py-2.5 px-3">Catatan / Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(!report.mailboxCrowdstrike?.details || report.mailboxCrowdstrike.details.length === 0) ? (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-slate-400 font-mono">
                              Tidak ada rincian peringatan mailbox atau CrowdStrike yang perlu ditindaklanjuti.
                            </td>
                          </tr>
                        ) : (
                          report.mailboxCrowdstrike.details.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3">
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                                  item.type === 'CROWDSTRIKE_MALICIOUS'
                                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                                    : item.type === 'MAILBOX_FULL'
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}>
                                  {item.type === 'MAILBOX_ALMOST_FULL'
                                    ? 'Mailbox Almost Full'
                                    : item.type === 'MAILBOX_FULL'
                                    ? 'Mailbox Full'
                                    : item.type === 'CROWDSTRIKE_MALICIOUS'
                                    ? 'Crowdstrike Malicious'
                                    : 'Crowdstrike Inactive'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-slate-900">{item.targetUserOrHost}</td>
                              <td className="py-2.5 px-3 text-slate-600">{item.departmentOrLocation || '-'}</td>
                              <td className="py-2.5 px-3 text-slate-600">{item.notes || '-'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Stacked Card View (No horizontal scrolling) */}
                  <div className="block md:hidden space-y-2.5">
                    {(!report.mailboxCrowdstrike?.details || report.mailboxCrowdstrike.details.length === 0) ? (
                      <div className="p-4 text-center text-xs text-slate-400 font-mono bg-slate-50 rounded-xl border border-slate-200">
                        Tidak ada rincian peringatan mailbox atau CrowdStrike yang perlu ditindaklanjuti.
                      </div>
                    ) : (
                      report.mailboxCrowdstrike.details.map(item => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
                            <span className="font-semibold text-slate-900 text-xs">{item.targetUserOrHost}</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                              item.type === 'CROWDSTRIKE_MALICIOUS'
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : item.type === 'MAILBOX_FULL'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}>
                              {item.type === 'MAILBOX_ALMOST_FULL'
                                ? 'Almost Full'
                                : item.type === 'MAILBOX_FULL'
                                ? 'Mailbox Full'
                                : item.type === 'CROWDSTRIKE_MALICIOUS'
                                ? 'CS Malicious'
                                : 'CS Inactive'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-[10px] text-slate-500 block">Departemen/Lokasi:</span>
                              <span className="font-medium text-slate-800">{item.departmentOrLocation || '-'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block">Catatan/Tindakan:</span>
                              <span className="text-slate-700">{item.notes || '-'}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {report.mailboxCrowdstrike?.notes && (
                  <div className="pt-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <strong className="text-slate-800 font-semibold block mb-0.5">Catatan Keamanan &amp; Mailbox:</strong>
                    {report.mailboxCrowdstrike.notes}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: SUMMARY & AUDIT TRAIL */}
          {activeTab === 'AUDIT' && (
            <div className="space-y-6">
              {/* Section 6 Summary Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-700" />
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Section 6: Summary (User Requests, Follow-up PO &amp; Broken Asset)
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Ringkasan khusus kendala atau kebutuhan user yang perlu diteruskan ke shift berikutnya atau manajemen.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Request Baru */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Ticket className="w-3.5 h-3.5 text-blue-600" />
                      1. Request Baru dari User
                    </span>
                    <p className="text-xs text-slate-600 font-sans whitespace-pre-wrap leading-relaxed">
                      {report.operationalExceptions?.newUserRequests?.trim()
                        ? report.operationalExceptions.newUserRequests
                        : 'Tidak ada permintaan baru yang tertunda.'}
                    </p>
                  </div>

                  {/* Follow-up PO */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      2. Follow-up Purchase Order (PO)
                    </span>
                    <p className="text-xs text-slate-600 font-sans whitespace-pre-wrap leading-relaxed">
                      {report.operationalExceptions?.poFollowUps?.trim()
                        ? report.operationalExceptions.poFollowUps
                        : 'Tidak ada follow-up pengadaan/PO aktif.'}
                    </p>
                  </div>

                  {/* Broken Asset */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      3. Broken Asset / Kerusakan
                    </span>
                    <p className="text-xs text-slate-600 font-sans whitespace-pre-wrap leading-relaxed">
                      {report.operationalExceptions?.brokenAssets?.trim()
                        ? report.operationalExceptions.brokenAssets
                        : 'Tidak ada laporan kerusakan aset hardware.'}
                    </p>
                  </div>
                </div>

                {report.operationalExceptions?.generalNotes && (
                  <div className="text-xs text-slate-600 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                    <strong className="text-blue-900 font-semibold block mb-0.5">Catatan Tambahan:</strong>
                    {report.operationalExceptions.generalNotes}
                  </div>
                )}
              </div>

              {/* Cryptographic Audit Log */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-200">
                  <span className="font-semibold flex items-center gap-1.5">
                    <History className="w-4 h-4 text-slate-500" />
                    Cryptographic Audit Log &amp; Event Sequence
                  </span>
                  <span className="font-mono text-blue-700 font-bold">Immutable Ledger</span>
                </div>

                <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 my-2">
                  {report.auditTrail.map((entry, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                      <div className="text-[11px] font-mono text-slate-500 mb-0.5">{entry.timestamp}</div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>{entry.action}</span>
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 font-normal">
                          by {entry.actorName} ({entry.actorRole})
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono">
                        {entry.details}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Superior E-Signature & Approval Section (Interactive if pending review) */}
          {isPendingSuperiorReview && isSuperior && (
            <div className="rounded-xl border border-blue-300 bg-blue-50/50 p-5 space-y-4 shadow-sm print:hidden">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
                <PenTool className="w-4 h-4 text-blue-700" />
                <span>Superior Formal Approval &amp; E-Signature Validation</span>
              </div>

              <form onSubmit={handleSuperiorAction} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-800 block mb-1">
                      Approval Decision *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setManagerDecision('APPROVED')}
                        className={`p-2.5 text-xs font-semibold rounded-lg border transition-all ${
                          managerDecision === 'APPROVED'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs font-bold'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        ✓ APPROVE Report
                      </button>
                      <button
                        type="button"
                        onClick={() => setManagerDecision('REJECTED')}
                        className={`p-2.5 text-xs font-semibold rounded-lg border transition-all ${
                          managerDecision === 'REJECTED'
                            ? 'bg-rose-600 text-white border-rose-700 shadow-2xs font-bold'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        ✕ Request Revision
                      </button>
                    </div>

                    <div className="mt-3">
                      <label className="text-xs font-semibold text-slate-800 block mb-1">
                        Reviewer Feedback &amp; Directives (Mandatory) *
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Provide directives or comments regarding shift operational quality..."
                        value={managerComments}
                        onChange={e => setManagerComments(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-800 block mb-1">
                      Digital Signature Authorization (Mandatory) *
                    </label>
                    <DigitalSignaturePad onSignatureChange={(dataUrl: string | null) => setSignatureDataUrl(dataUrl)} />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-blue-200">
                  <button
                    type="submit"
                    disabled={isSubmittingReview || !signatureDataUrl}
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:pointer-events-none rounded-lg shadow-sm transition-colors flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Process &amp; Certify Signature
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-between bg-slate-50/80 rounded-b-2xl shrink-0 print:hidden">
          <div className="text-xs font-mono text-slate-500">
            Document Record ID: <span className="text-slate-800 font-semibold">{report.id}</span>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>

        {/* Fullscreen Photo Modal */}
        {expandedPhoto && (
          <div
            className="fixed inset-0 z-70 bg-black/85 flex items-center justify-center p-4"
            onClick={() => setExpandedPhoto(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-xl overflow-hidden border border-slate-700 p-2 shadow-2xl">
              <button
                type="button"
                onClick={() => setExpandedPhoto(null)}
                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={expandedPhoto}
                alt="Enlarged inspection proof"
                className="max-h-[85vh] max-w-full object-contain rounded"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
