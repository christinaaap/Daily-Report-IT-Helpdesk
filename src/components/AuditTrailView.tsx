import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { History, Search, ArrowUpRight, ShieldAlert, ShieldCheck, Download, Trash2 } from 'lucide-react';

export const AuditTrailView: React.FC = () => {
  const { reports, openViewModal, currentUser, systemAuditLogs, clearAuditTrail, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const isAuthorized = currentUser.role === 'ADMINISTRATOR' || currentUser.role === 'ICT_MANAGER';

  if (!isAuthorized) {
    return (
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Akses Terbatas: Khusus Superior &amp; Administrator</h2>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Halaman Audit Trail hanya dapat diakses oleh Pejabat <strong>Superior / ICT Manager</strong> dan <strong>Administrator IT</strong>.
            Akun Helpdesk Engineer ({currentUser.name}) tidak memiliki otorisasi untuk mengakses rekaman jejak audit ISO 27001.
          </p>
        </div>
      </div>
    );
  }

  // Combine report-level audit logs and system-wide action logs
  const reportAuditEntries = reports.flatMap(report =>
    (report.auditTrail || []).map(entry => ({
      ...entry,
      reportId: report.id,
      reportDate: report.reportDate,
      reportStatus: report.status,
      lockHash: report.immutableLockHash,
    }))
  );

  const combinedLogs = [...(systemAuditLogs || []), ...reportAuditEntries];

  // Deduplicate by timestamp + action + details
  const uniqueMap = new Map<string, typeof combinedLogs[0]>();
  combinedLogs.forEach(entry => {
    const key = `${entry.timestamp}_${entry.action}_${entry.details.substring(0, 30)}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, entry);
    }
  });

  const allAuditEntries = Array.from(uniqueMap.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const filteredLogs = allAuditEntries.filter(log => {
    const q = searchTerm.toLowerCase();
    return (
      (log.reportId && log.reportId.toLowerCase().includes(q)) ||
      log.actorName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q)
    );
  });

  const handleExportCSV = () => {
    if (allAuditEntries.length === 0) {
      showToast('Tidak ada data audit log untuk diekspor.', 'warning');
      return;
    }

    const headers = ['Timestamp', 'Action', 'Actor Name', 'Actor Role', 'Actor Badge', 'Details', 'Report ID', 'Lock Hash'];
    const rows = allAuditEntries.map(e => [
      `"${e.timestamp}"`,
      `"${e.action}"`,
      `"${e.actorName}"`,
      `"${e.actorRole}"`,
      `"${e.actorBadge}"`,
      `"${e.details.replace(/"/g, '""')}"`,
      `"${e.reportId || '-'}"`,
      `"${e.lockHash || '-'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DSLNG_AuditTrail_ISO27001_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Berkas Audit Trail CSV berhasil diunduh.', 'success');
  };

  const handleClearAudit = () => {
    if (window.confirm('Apakah Anda yakin ingin mengosongkan seluruh riwayat jejak audit ISO 27001?')) {
      clearAuditTrail();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-700" />
            <h2 className="text-base font-bold text-slate-900">
              Riwayat Aktivitas &amp; Log Operasional
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Khusus Superior &amp; Admin</span>
            </span>
          </div>
        </div>

        {/* Live Search & Export Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari aktor, aksi, hash..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-mono"
            />
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            title="Ekspor CSV Jejak Audit"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Ekspor CSV</span>
          </button>

          {currentUser.role === 'ADMINISTRATOR' && allAuditEntries.length > 0 && (
            <button
              type="button"
              onClick={handleClearAudit}
              className="px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center justify-center gap-1 transition-colors"
              title="Bersihkan Semua Log Audit"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan</span>
            </button>
          )}
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
                          : log.action.includes('LOCKED') || log.action.includes('SUBMITTED')
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                          : log.action.includes('CREATED') || log.action.includes('ADDED')
                          ? 'bg-purple-100 text-purple-900 border border-purple-200'
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
                    {log.reportId ? (
                      <button
                        type="button"
                        onClick={() => openViewModal(log.reportId!)}
                        className="font-mono text-blue-700 hover:text-blue-900 font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <span>{log.reportId}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">System Event</span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 px-4 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <History className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-bold text-slate-800">
                        {searchTerm ? 'Tidak Ada Catatan Audit yang Cocok' : 'Belum Ada Catatan Audit Trail (0 Record)'}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {searchTerm
                          ? `Tidak ditemukan catatan audit trail yang cocok dengan kata kunci "${searchTerm}". Silakan periksa kembali kata kunci pencarian Anda.`
                          : 'Seluruh data dummy audit trail telah dibersihkan. Jejak audit ISO 27001 akan dicatat secara otomatis dan permanen setiap kali Helpdesk Engineer mengunci laporan harian, Superior menyetujui laporan, ataupun Administrator mengonfigurasi aset/pengguna.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
