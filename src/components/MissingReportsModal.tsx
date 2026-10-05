import React from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Bell,
  AlertTriangle,
  Send,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  PlusCircle,
  Mail,
  ShieldCheck,
} from 'lucide-react';

export const MissingReportsModal: React.FC = () => {
  const {
    closeModal,
    missingReminders,
    dispatchReminder,
    dispatchAllReminders,
    openCreateModal,
    currentUser,
    setSelectedDate,
  } = useApp();

  const isHelpdeskOrAdmin =
    currentUser.role === 'ADMINISTRATOR' || currentUser.role === 'DUTY_ENGINEER';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl my-auto shadow-2xl flex flex-col max-h-[90vh] text-slate-900">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-amber-50/80 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-100 text-amber-800">
              <Bell className="w-5 h-5 text-amber-700 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Notifikasi Pengingat Laporan Belum Diisi
                </h2>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  {missingReminders.length} Hari Tertunda
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Sistem mendeteksi jadwal operasional harian yang belum disubmit oleh Engineer Helpdesk.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/40">
          {missingReminders.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Seluruh Laporan Harian Lengkap &amp; Terisi
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tidak ada hari yang terlewat. Semua shift helpdesk telah menyelesaikan dan mengunci laporan operasional.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Daftar Hari &amp; Petugas Helpdesk Yang Bertanggung Jawab
                </span>
                <button
                  type="button"
                  onClick={dispatchAllReminders}
                  className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  Kirim Notifikasi ke Semua Petugas
                </button>
              </div>

              <div className="space-y-3">
                {missingReminders.map(item => (
                  <div
                    key={item.date}
                    className="p-4 rounded-xl border border-amber-300 bg-white shadow-2xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-700" />
                        <span className="text-sm font-bold text-slate-900">
                          {item.date}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold border border-rose-200">
                          {item.daysOverdue === 0
                            ? 'Jatuh Tempo Hari Ini'
                            : `Terlambat ${item.daysOverdue} Hari`}
                        </span>
                      </div>

                      {item.status === 'REMINDER_DISPATCHED' ? (
                        <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Notifikasi Terkirim ({item.dispatchedAt?.split(' ')[1]})
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Menunggu Pengisian
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Petugas Shift Duty:</span>
                        <strong className="text-slate-900">{item.assignedDutyEngineerName}</strong>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>Email:</span>
                        <span className="font-mono text-slate-700">{item.assignedDutyEngineerEmail}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono sm:col-span-2">
                        Lokasi: {item.location} · Shift: {item.shift}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => dispatchReminder(item.date)}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Send className="w-3 h-3" />
                        {item.status === 'REMINDER_DISPATCHED'
                          ? 'Kirim Ulang Notifikasi Reminder'
                          : 'Kirim Notifikasi Reminder ke Engineer'}
                      </button>

                      {isHelpdeskOrAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDate(item.date);
                            closeModal();
                            openCreateModal(item.date);
                          }}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          Isi Laporan Tanggal Ini
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Policy Information */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Kebijakan Kepatuhan Pelaporan Operasional PT.DSLNG</span>
            </div>
            <p className="leading-relaxed">
              Sesuai PRD Bab 2 &amp; 3, seluruh pemeriksaan fisik ruang rapat (VTC) pada pukul 06:00 WITA serta metrik tiket dan server harus dilaporkan secara harian. Jika ada tanggal yang belum diisi, pengingat otomatis akan dikirimkan ke engineer bertugas dan Administrator/Superior akan menerima alert eskalasi.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-between bg-slate-50/90 rounded-b-2xl shrink-0">
          <span className="text-xs text-slate-500 font-mono">
            Sistem Pemantauan Otomatis &amp; Notifikasi Helpdesk
          </span>
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
