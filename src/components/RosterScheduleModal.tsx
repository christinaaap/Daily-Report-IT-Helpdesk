import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  SITE_USO_SHIFT_OPTIONS,
  HO_JKT_SHIFT_OPTIONS,
  createEmptyDaySchedule,
} from '../utils/rosterLogic';
import { DayShiftSchedule } from '../types';
import {
  X,
  Building2,
  Clock,
  Shield,
  Calendar,
  Save,
  RotateCcw,
  Copy,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Trash2,
} from 'lucide-react';

export const RosterScheduleModal: React.FC = () => {
  const {
    closeModal,
    currentUser,
    setCurrentUser,
    selectedDate,
    teamMembers,
    manualSchedules,
    saveDaySchedule,
    batchApplySchedule,
    openManageEngineersModal,
    showToast,
  } = useApp();

  const [activeDate, setActiveDate] = useState<string>(selectedDate);

  // Load existing schedule or clean empty schedule for activeDate (zero dummy data)
  const currentSchedule: DayShiftSchedule =
    manualSchedules[activeDate] || createEmptyDaySchedule(activeDate, teamMembers);

  // Local draft state for editing
  const [draftSchedule, setDraftSchedule] = useState<DayShiftSchedule>(currentSchedule);

  // Sync draft when activeDate changes
  const handleDateChange = (newDate: string) => {
    setActiveDate(newDate);
    const schedule = manualSchedules[newDate] || createEmptyDaySchedule(newDate, teamMembers);
    setDraftSchedule(schedule);
  };

  const isAdmin = currentUser.role === 'ADMINISTRATOR';
  const isConfigured = !!draftSchedule.updatedAt;

  const siteUsoEngineers = teamMembers.filter(
    m => m.location === 'Site Uso' && m.role === 'HELPDESK_ENGINEER'
  );
  const hoJktEngineers = teamMembers.filter(
    m => m.location === 'HO Jkt' && m.role === 'HELPDESK_ENGINEER'
  );

  // Handle engineer shift change
  const handleShiftTimeChange = (engineerId: string, newShiftTime: string) => {
    setDraftSchedule(prev => {
      const existingItem = prev.shifts[engineerId];
      if (!existingItem) {
        const eng = teamMembers.find(m => m.id === engineerId);
        if (!eng) return prev;
        return {
          ...prev,
          shifts: {
            ...prev.shifts,
            [engineerId]: {
              engineerId: eng.id,
              engineerName: eng.name,
              badgeNumber: eng.badgeNumber,
              location: eng.location,
              shiftTime: newShiftTime,
              isDutyEngineer: false,
            },
          },
        };
      }
      return {
        ...prev,
        shifts: {
          ...prev.shifts,
          [engineerId]: {
            ...existingItem,
            shiftTime: newShiftTime,
          },
        },
      };
    });
  };

  // Handle designating duty engineer
  const handleSetDutyEngineer = (engineerId: string) => {
    setDraftSchedule(prev => {
      const updatedShifts = { ...prev.shifts };
      siteUsoEngineers.forEach(eng => {
        const id = eng.id;
        const isTarget = id === engineerId;
        const currentItem = updatedShifts[id] || {
          engineerId: eng.id,
          engineerName: eng.name,
          badgeNumber: eng.badgeNumber,
          location: eng.location,
          shiftTime: '',
          isDutyEngineer: false,
        };

        updatedShifts[id] = {
          ...currentItem,
          isDutyEngineer: isTarget,
          shiftTime: isTarget ? 'Shift A (06.00 - 18.00 WITA)' : currentItem.shiftTime,
        };
      });

      return {
        ...prev,
        siteUsoDutyEngineerId: engineerId,
        shifts: updatedShifts,
      };
    });
  };

  // Quick fill recommendation: Shift A for duty, Shift B for regular
  const handleFillStandardRecommendation = () => {
    if (siteUsoEngineers.length === 0 && hoJktEngineers.length === 0) {
      showToast('Belum ada akun Helpdesk Engineer terdaftar. Silakan buat akun terlebih dahulu.', 'warning');
      openManageEngineersModal();
      return;
    }

    setDraftSchedule(prev => {
      const updatedShifts = { ...prev.shifts };
      siteUsoEngineers.forEach((eng, idx) => {
        const isDuty = idx === 0;
        updatedShifts[eng.id] = {
          engineerId: eng.id,
          engineerName: eng.name,
          badgeNumber: eng.badgeNumber,
          location: 'Site Uso',
          shiftTime: isDuty ? 'Shift A (06.00 - 18.00 WITA)' : 'Shift B (07.00 - 18.00 WITA)',
          isDutyEngineer: isDuty,
        };
      });

      hoJktEngineers.forEach((eng, idx) => {
        updatedShifts[eng.id] = {
          engineerId: eng.id,
          engineerName: eng.name,
          badgeNumber: eng.badgeNumber,
          location: 'HO Jkt',
          shiftTime: idx === 0 ? 'Shift A (07.00 - 17.00 WIB)' : 'Shift B (08.00 - 17.00 WIB)',
          isDutyEngineer: false,
        };
      });

      return {
        ...prev,
        siteUsoDutyEngineerId: siteUsoEngineers[0]?.id || '',
        shifts: updatedShifts,
      };
    });
    showToast('Pilihan formal Shift A & Shift B telah dimuat ke formulir. Silakan klik Simpan.', 'info');
  };

  // Clear all shifts for current date
  const handleClearCurrentDate = () => {
    const empty = createEmptyDaySchedule(activeDate, teamMembers);
    setDraftSchedule(empty);
    showToast('Formulir shift tanggal terpilih telah dikosongkan.', 'info');
  };

  // Save changes
  const handleSaveCurrentDate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSchedule: DayShiftSchedule = {
      ...draftSchedule,
      date: activeDate,
      updatedBy: currentUser.name,
      updatedAt: new Date().toLocaleTimeString(),
    };
    saveDaySchedule(finalSchedule);
  };

  // Batch apply to next 7 days
  const handleApplyNext7Days = () => {
    const dates: string[] = [];
    const base = new Date(activeDate);
    for (let i = 1; i <= 6; i++) {
      const nextD = new Date(base);
      nextD.setDate(base.getDate() + i);
      const y = nextD.getFullYear();
      const m = String(nextD.getMonth() + 1).padStart(2, '0');
      const d = String(nextD.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${d}`);
    }
    batchApplySchedule(activeDate, dates);
  };

  // Batch apply to all days in month
  const handleApplyAllMonth = () => {
    const dates: string[] = [];
    const base = new Date(activeDate);
    const y = base.getFullYear();
    const m = base.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (dateStr !== activeDate) {
        dates.push(dateStr);
      }
    }
    batchApplySchedule(activeDate, dates);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl my-auto shadow-2xl flex flex-col max-h-[92vh] text-slate-900">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/80 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-100 text-blue-800">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Pengaturan Shift Schedule Operasional
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-200">
                  Site Uso &amp; HO Jkt
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Pengelolaan Penugasan Jam Masuk Shift A &amp; Shift B
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/40">
          {/* Formal Policy Box on Shift A & Shift B */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-blue-700" />
              <span>Standar Formal Penamaan Shift Operasional</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700">
              <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200 space-y-1">
                <strong className="text-blue-900 font-bold block">1. Site Uso (Zona WITA):</strong>
                <ul className="space-y-1 font-mono text-[11px] text-slate-700">
                  <li className="flex items-start gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-700 mt-1 shrink-0" />
                    <span><strong>Shift A:</strong> 06.00 - 18.00 WITA</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400 mt-1 shrink-0" />
                    <span><strong>Shift B:</strong> 07.00 - 18.00 WITA</span>
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 space-y-1">
                <strong className="text-slate-900 font-bold block">2. HO Jkt (Zona WIB):</strong>
                <ul className="space-y-1 font-mono text-[11px] text-slate-700">
                  <li className="flex items-start gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-700 mt-1 shrink-0" />
                    <span><strong>Shift A:</strong> 07.00 - 17.00 WIB</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400 mt-1 shrink-0" />
                    <span><strong>Shift B:</strong> 08.00 - 17.00 WIB</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Date Picker Bar & Status Indicator */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                Pilih Tanggal:
              </label>
              <input
                type="date"
                value={activeDate}
                onChange={e => handleDateChange(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
              />

              {isConfigured ? (
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Jadwal Ditetapkan
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  Belum Ditentukan
                </span>
              )}
            </div>

            <div>
              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleFillStandardRecommendation}
                    className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    Muat Pilihan Shift A &amp; B
                  </button>
                  <button
                    type="button"
                    onClick={handleClearCurrentDate}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Kosongkan jadwal tanggal ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-mono">
                    Mode Pengguna ({currentUser.role}): Hanya Administrator yang dapat mengubah jadwal.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const adminUser = teamMembers.find(m => m.role === 'ADMINISTRATOR');
                      if (adminUser) setCurrentUser(adminUser);
                    }}
                    className="text-xs font-semibold text-purple-700 hover:underline"
                  >
                    Beralih ke Administrator →
                  </button>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSaveCurrentDate} className="space-y-6">
            {/* Section 1: Site Uso */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-700" />
                  <span>1. Lokasi: Site Uso ({siteUsoEngineers.length} Helpdesk Engineers - Zona WITA)</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-500">
                  Pilihan: Shift A atau Shift B
                </span>
              </div>

              {siteUsoEngineers.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-300 bg-white text-center space-y-2">
                  <p className="text-xs font-semibold text-slate-700">
                    Belum ada akun Helpdesk Engineer untuk Site Uso
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Akun helpdesk belum didaftarkan. Administrator dapat membuat akun engineer baru terlebih dahulu.
                  </p>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={openManageEngineersModal}
                      className="mt-1 px-3.5 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg inline-flex items-center gap-1.5 transition-colors"
                    >
                      + Tambah Akun Helpdesk Site Uso
                    </button>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                      <tr>
                        <th className="py-3 px-4">Nama Engineer</th>
                        <th className="py-3 px-4">Badge ID</th>
                        <th className="py-3 px-4">Penugasan Shift (WITA)</th>
                        <th className="py-3 px-4 text-center">Status Petugas Duty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {siteUsoEngineers.map(member => {
                        const shiftData = draftSchedule.shifts[member.id];
                        const currentShiftTime = shiftData?.shiftTime || '';
                        const isDuty = draftSchedule.siteUsoDutyEngineerId === member.id;

                        return (
                          <tr
                            key={member.id}
                            className={`hover:bg-slate-50 transition-colors ${
                              isDuty ? 'bg-blue-50/40' : ''
                            }`}
                          >
                            <td className="py-3.5 px-4 font-semibold text-slate-900">
                              {member.name}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-500">
                              {member.badgeNumber}
                            </td>
                            <td className="py-3.5 px-4">
                              {isAdmin ? (
                                <select
                                  value={currentShiftTime}
                                  onChange={e => handleShiftTimeChange(member.id, e.target.value)}
                                  className={`border rounded px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-blue-600 font-semibold ${
                                    currentShiftTime
                                      ? 'bg-white border-slate-300 text-slate-900'
                                      : 'bg-amber-50/50 border-amber-300 text-amber-900'
                                  }`}
                                >
                                  <option value="">-- Pilih Shift --</option>
                                  {SITE_USO_SHIFT_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                  <option value="Off / Libur">Off / Libur</option>
                                </select>
                              ) : (
                                <span
                                  className={`font-mono font-semibold ${
                                    currentShiftTime ? 'text-slate-800' : 'text-slate-400 italic'
                                  }`}
                                >
                                  {currentShiftTime || 'Belum Ditetapkan'}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {isAdmin ? (
                                <button
                                  type="button"
                                  onClick={() => handleSetDutyEngineer(member.id)}
                                  className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold transition-colors ${
                                    isDuty
                                      ? 'bg-blue-700 text-white shadow-2xs'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  {isDuty ? '✓ Petugas Duty (Shift A)' : 'Pilih Duty'}
                                </button>
                              ) : isDuty ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-blue-100 text-blue-900 font-bold border border-blue-200">
                                  Petugas Duty
                                </span>
                              ) : (
                                <span className="text-slate-400 font-mono text-[11px]">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Section 2: HO Jkt */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-700" />
                  <span>2. Lokasi: HO Jkt ({hoJktEngineers.length} Helpdesk Engineers - Zona WIB)</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-500">
                  Pilihan: Shift A atau Shift B
                </span>
              </div>

              {hoJktEngineers.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-300 bg-white text-center space-y-2">
                  <p className="text-xs font-semibold text-slate-700">
                    Belum ada akun Helpdesk Engineer untuk HO Jkt
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Akun helpdesk belum didaftarkan. Administrator dapat membuat akun engineer baru terlebih dahulu.
                  </p>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={openManageEngineersModal}
                      className="mt-1 px-3.5 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg inline-flex items-center gap-1.5 transition-colors"
                    >
                      + Tambah Akun Helpdesk HO Jkt
                    </button>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                      <tr>
                        <th className="py-3 px-4">Nama Engineer</th>
                        <th className="py-3 px-4">Badge ID</th>
                        <th className="py-3 px-4">Penugasan Shift (WIB)</th>
                        <th className="py-3 px-4 text-center">Lokasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {hoJktEngineers.map(member => {
                        const shiftData = draftSchedule.shifts[member.id];
                        const currentShiftTime = shiftData?.shiftTime || '';

                        return (
                          <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-slate-900">
                              {member.name}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-500">
                              {member.badgeNumber}
                            </td>
                            <td className="py-3.5 px-4">
                              {isAdmin ? (
                                <select
                                  value={currentShiftTime}
                                  onChange={e => handleShiftTimeChange(member.id, e.target.value)}
                                  className={`border rounded px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-blue-600 font-semibold ${
                                    currentShiftTime
                                      ? 'bg-white border-slate-300 text-slate-900'
                                      : 'bg-amber-50/50 border-amber-300 text-amber-900'
                                  }`}
                                >
                                  <option value="">-- Pilih Shift --</option>
                                  {HO_JKT_SHIFT_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                  <option value="Off / Libur">Off / Libur</option>
                                </select>
                              ) : (
                                <span
                                  className={`font-mono font-semibold ${
                                    currentShiftTime ? 'text-slate-800' : 'text-slate-400 italic'
                                  }`}
                                >
                                  {currentShiftTime || 'Belum Ditetapkan'}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 text-slate-700">
                                HO Jkt
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Administrator Controls */}
            {isAdmin && (
              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-950 uppercase tracking-wider">
                  <Shield className="w-4 h-4 text-purple-700" />
                  <span>Aksi Penyimpanan &amp; Duplikasi Shift Schedule</span>
                </div>
                <p className="text-xs text-purple-900">
                  Simpan jadwal untuk tanggal <strong>{activeDate}</strong> atau terapkan langsung ke tanggal berikutnya:
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Simpan Jadwal Tanggal {activeDate}
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyNext7Days}
                    className="px-3.5 py-2 text-xs font-semibold text-purple-900 bg-white hover:bg-purple-100 border border-purple-300 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Terapkan ke 7 Hari ke Depan
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyAllMonth}
                    className="px-3.5 py-2 text-xs font-semibold text-purple-900 bg-white hover:bg-purple-100 border border-purple-300 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Terapkan ke Seluruh Bulan
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-between bg-slate-50/90 rounded-b-2xl shrink-0">
          <div className="text-xs text-slate-500 font-mono">
            {draftSchedule.updatedAt
              ? `Terakhir diperbarui: ${draftSchedule.updatedAt} (${draftSchedule.updatedBy || 'Administrator'})`
              : 'Status: Belum ada jadwal yang disimpan untuk tanggal ini'}
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
