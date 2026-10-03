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
} from 'lucide-react';
import { DigitalSignaturePad } from './DigitalSignaturePad';

interface ReportDetailModalProps {
  reportId: string;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({ reportId }) => {
  const { reports, closeModal, currentUser, reviewDailyReport, showToast } = useApp();

  const report = reports.find(r => r.id === reportId);

  // Superior action state
  const [managerDecision, setManagerDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [managerComments, setManagerComments] = useState('');
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PHOTOS' | 'SERVERS' | 'AUDIT'>('OVERVIEW');
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);

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

  const isSuperior = currentUser.role === 'ICT_MANAGER';
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:text-black">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl my-auto shadow-2xl flex flex-col max-h-[94vh] text-slate-900 print:max-h-none print:border-none print:shadow-none print:bg-white">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/80 rounded-t-2xl print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-100 text-blue-800">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900">
                  PT Donggi-Senoro LNG Daily Operations Report: {report.reportDate}
                </h2>
                {report.status === 'APPROVED' && (
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Superior Approved
                  </span>
                )}
                {report.status === 'SUBMITTED' && (
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200 flex items-center gap-1 animate-pulse">
                    <Clock className="w-3 h-3 text-amber-600" /> Awaiting Superior E-Signature
                  </span>
                )}
                {report.status === 'REJECTED' && (
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-200 flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-rose-600" /> Revision Requested
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                Ref: {report.id} · Submitter: {report.dutyEngineerName} ({report.dutyEngineerBadge})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              aria-label="Print report"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Print / Save PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close modal"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Sub-navigation */}
        <div className="px-6 pt-3 border-b border-slate-200 bg-white flex items-center gap-4 overflow-x-auto shrink-0 print:hidden">
          <button
            type="button"
            onClick={() => setActiveTab('OVERVIEW')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'OVERVIEW'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Operational Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PHOTOS')}
            className={`pb-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'PHOTOS'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            VTC Physical Proof ({report.physicalInspections.filter(p => p.photoEvidenceUrl).length}/{report.physicalInspections.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SERVERS')}
            className={`pb-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'SERVERS'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Servers &amp; Licenses
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('AUDIT')}
            className={`pb-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'AUDIT'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Immutable Audit Trail
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/40 print:p-8 print:bg-white">
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
                    Ticket Operations &amp; SLA Metrics
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-600">
                  <div>Network: <strong className="text-slate-900">{report.tickets.categoryBreakdown.network}</strong></div>
                  <div>Hardware: <strong className="text-slate-900">{report.tickets.categoryBreakdown.hardware}</strong></div>
                  <div>SAP/ERP: <strong className="text-slate-900">{report.tickets.categoryBreakdown.sapErp}</strong></div>
                  <div>M365/Email: <strong className="text-slate-900">{report.tickets.categoryBreakdown.m365Email}</strong></div>
                  <div>SCADA Link: <strong className="text-slate-900">{report.tickets.categoryBreakdown.scadaTerminal}</strong></div>
                  <div>Radio/PAGA: <strong className="text-slate-900">{report.tickets.categoryBreakdown.telephonyRadio}</strong></div>
                </div>
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

              {/* Superior Review & E-Signature Display (if already reviewed) */}
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
                          Validated by {report.superiorReview.managerName} on {report.superiorReview.reviewedAt}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {report.superiorReview.decision}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-white border border-emerald-200 text-xs text-slate-800">
                    <strong className="text-slate-600 block mb-1">Superior Evaluation Comments:</strong>
                    "{report.superiorReview.comments}"
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-emerald-200/80">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-500 block">Certificate ID</span>
                      <span className="text-xs font-mono text-blue-900 font-bold">{report.superiorReview.digitalStampId}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">Authenticated Signature</span>
                      <div className="h-12 w-48 rounded bg-white p-1 border border-slate-300 flex items-center justify-center shadow-xs">
                        <img
                          src={report.superiorReview.signatureDataUrl}
                          alt="Superior E-Signature"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VTC PHYSICAL PROOF PHOTOS GALLERY */}
          {activeTab === 'PHOTOS' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-200">
                <span className="font-semibold">06:00 AM Physical Walkthrough Evidence Archive (PRD Mandatory Requirement)</span>
                <span className="font-mono text-emerald-700 font-bold">
                  {report.physicalInspections.filter(p => p.photoEvidenceUrl).length} Verified Photos
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

                    {/* High-res inspection image frame */}
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
                            {room.photoTimestamp || report.submittedAt || '06:15 WITA'}
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">No photo provided</span>
                      )}
                    </div>

                    {/* Room Checklist Results */}
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

                    <div className="text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <strong className="text-slate-500 font-semibold">Duty Note:</strong> {room.notes}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SERVERS & LICENSES */}
          {activeTab === 'SERVERS' && (
            <div className="space-y-6">
              {/* Server table */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Infrastructure Health Checklist (Luwuk DC &amp; Jakarta Node)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Node Name</th>
                        <th className="py-2.5 px-3">Location</th>
                        <th className="py-2.5 px-3">Role</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Ping</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {report.servers.map(server => (
                        <tr key={server.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-3 text-slate-900 font-sans font-semibold">
                            {server.name}
                          </td>
                          <td className="py-3 px-3 text-slate-600 font-sans">{server.location}</td>
                          <td className="py-3 px-3 text-slate-500 font-sans">{server.role}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                server.status === 'ONLINE'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {server.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right text-slate-600">{server.latencyMs}ms</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* License snapshot */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Software License Availability Snapshot
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 font-medium block">Microsoft 365 E3</span>
                    <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                      {report.licenses.m365E3Assigned} / {report.licenses.m365E3Total}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 font-medium block">Microsoft 365 E5</span>
                    <div className="text-lg font-bold font-mono text-amber-800 mt-1">
                      {report.licenses.m365E5Assigned} / {report.licenses.m365E5Total}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 font-medium block">AutoCAD Floating AEC</span>
                    <div className="text-lg font-bold font-mono text-blue-800 mt-1">
                      {report.licenses.autocadFloatingInUse} / {report.licenses.autocadFloatingTotal}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT TRAIL */}
          {activeTab === 'AUDIT' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-200">
                <span className="font-semibold">Cryptographic Audit Log &amp; Event Sequence (ISO 27001 Requirement)</span>
                <span className="font-mono text-blue-700 font-bold">Immutable Ledger</span>
              </div>

              <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 my-2">
                {report.auditTrail.map((entry, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-600 group-hover:bg-blue-600 transition-colors" />
                    <div className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{entry.action}</span>
                        <span className="text-[11px] font-mono text-slate-400">· {entry.timestamp}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Actor: {entry.actorName} ({entry.actorRole} · {entry.actorBadge})
                      </div>
                      <div className="text-xs text-slate-700 mt-1 bg-white p-2.5 rounded-lg border border-slate-200">
                        {entry.details}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Superior Review Section (Only shown when pending review) */}
          {isPendingSuperiorReview && (
            <div className="rounded-xl border border-amber-300 bg-amber-50/40 p-5 space-y-4 shadow-xs print:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-amber-700" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Superior Approval &amp; E-Signature Review (PRD Step 5)
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Review all ticket metrics, server health, and meeting room inspection proofs before applying digital validation.
                    </p>
                  </div>
                </div>
                {!isSuperior && (
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium border border-amber-200">
                    Switch to Superior Hendra Wijaya in Top Bar to Sign
                  </span>
                )}
              </div>

              {isSuperior ? (
                <form onSubmit={handleSuperiorAction} className="space-y-4 pt-2">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-slate-700">Decision:</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setManagerDecision('APPROVED')}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                          managerDecision === 'APPROVED'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-300'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve Report
                      </button>
                      <button
                        type="button"
                        onClick={() => setManagerDecision('REJECTED')}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                          managerDecision === 'REJECTED'
                            ? 'bg-rose-700 text-white shadow-xs'
                            : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-300'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject (Require Revision)
                      </button>
                    </div>
                  </div>

                  {/* Mandatory Feedback */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        Superior Feedback &amp; Operational Evaluation
                      </label>
                      <span className="text-[11px] text-rose-600 font-semibold">*Mandatory Field</span>
                    </div>
                    <textarea
                      rows={3}
                      value={managerComments}
                      onChange={e => setManagerComments(e.target.value)}
                      placeholder="e.g. Operations reviewed. All physical inspection proofs verified in Maleo and Tarsius rooms. Proceed with shift handover..."
                      className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-sans"
                      required
                    />
                  </div>

                  {/* Mandatory Digital Signature Canvas */}
                  <DigitalSignaturePad
                    onSignatureChange={dataUrl => setSignatureDataUrl(dataUrl)}
                    required
                  />

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className={`px-4 py-2 text-xs font-semibold text-white rounded-lg flex items-center gap-1.5 shadow-xs transition-colors ${
                        managerDecision === 'APPROVED'
                          ? 'bg-emerald-700 hover:bg-emerald-800'
                          : 'bg-rose-700 hover:bg-rose-800'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {managerDecision === 'APPROVED' ? 'Affix E-Signature & Approve' : 'Affix E-Signature & Reject'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-3.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <span>Currently logged in as Helpdesk Engineer ({currentUser.name}). E-Signature sign-off is restricted to ICT Manager Hendra Wijaya.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-between bg-slate-50/90 rounded-b-2xl shrink-0 print:hidden">
          <div className="text-xs text-slate-500 font-mono">
            Document ID: {report.id}
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>

      {/* Expanded Photo Lightbox */}
      {expandedPhoto && (
        <div
          className="fixed inset-0 z-70 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setExpandedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] bg-white rounded-xl overflow-hidden p-2 border border-slate-300 shadow-2xl">
            <img
              src={expandedPhoto}
              alt="Inspection enlarged"
              className="max-h-[80vh] w-auto object-contain mx-auto rounded"
            />
            <div className="text-center text-xs text-slate-600 pt-2 font-mono">
              PT Donggi-Senoro LNG High Resolution Physical Inspection Archive · Click to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
