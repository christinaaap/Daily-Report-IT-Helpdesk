import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { History, Search, ArrowUpRight } from 'lucide-react';

export const AuditTrailView: React.FC = () => {
  const { reports, openViewModal } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Collect all audit logs from all reports
  const allAuditEntries = reports.flatMap(report =>
    report.auditTrail.map(entry => ({
      ...entry,
      reportId: report.id,
      reportDate: report.reportDate,
      reportStatus: report.status,
      lockHash: report.immutableLockHash,
    }))
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredLogs = allAuditEntries.filter(log => {
    const q = searchTerm.toLowerCase();
    return (
      log.reportId.toLowerCase().includes(q) ||
      log.actorName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-700" />
            <span>Cryptographic Operational Audit Trail (ISO 27001)</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Immutable log of all report creations, SHA-256 locking events, VTC physical inspection proofs, and Superior E-Signature authorizations.
          </p>
        </div>

        {/* Live Search */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by actor, ticket, hash..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-mono"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Event Timestamp</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Responsible Actor</th>
                <th className="py-3 px-4">Audit Details &amp; Digital Hash</th>
                <th className="py-3 px-4 text-right">Associated Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                        log.action.includes('APPROVED')
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : log.action.includes('REJECTED')
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : log.action.includes('LOCKED')
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{log.actorName}</div>
                    <div className="text-[10px] font-mono text-slate-500">
                      {log.actorRole} ({log.actorBadge})
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 max-w-md">
                    <div>{log.details}</div>
                    {log.lockHash && (
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                        Hash: {log.lockHash}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => openViewModal(log.reportId)}
                      className="font-mono text-blue-700 hover:text-blue-900 font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <span>{log.reportId}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
