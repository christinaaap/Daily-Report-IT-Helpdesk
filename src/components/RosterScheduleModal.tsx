import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TEAM_MEMBERS } from '../data/mockData';
import { getRosterForDate } from '../utils/rosterLogic';
import {
  X,
  Users,
  Building2,
  Clock,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';

export const RosterScheduleModal: React.FC = () => {
  const {
    closeModal,
    currentUser,
    dutyOverrideId,
    applyDutyOverride,
    setDutyOverrideId,
    selectedDate,
    showToast,
  } = useApp();

  const [overrideTargetId, setOverrideTargetId] = useState<string>(
    TEAM_MEMBERS.find(m => m.location === 'Site Luwuk')?.id || ''
  );
  const [overrideReasonInput, setOverrideReasonInput] = useState('');
  const [showOverrideForm, setShowOverrideForm] = useState(false);

  const roster = getRosterForDate(selectedDate, dutyOverrideId);
  const isSuperior = currentUser.role === 'ICT_MANAGER';

  const siteDutyEngineer = TEAM_MEMBERS.find(m => m.id === roster.siteDutyEngineerId);

  const handleApplyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideTargetId) return;
    if (!overrideReasonInput.trim()) {
      showToast('Please state reason for duty override (e.g. sick leave, emergency relief).', 'warning');
      return;
    }

    applyDutyOverride(overrideTargetId, overrideReasonInput);
    setShowOverrideForm(false);
  };

  const handleResetOverride = () => {
    setDutyOverrideId(null);
    showToast('Duty assignment reverted to standard automated weekly rotation.', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl my-auto shadow-2xl flex flex-col max-h-[92vh] text-slate-900">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/80 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-100 text-blue-800">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>ICT Helpdesk Shift Roster &amp; Reporting Accountability</span>
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                PT Donggi-Senoro LNG Standard Shift Policy · Effective Week 40, October 2026
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/40">
          {/* Rules Summary Card */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-blue-900 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-blue-700" />
              <span>Shift Structure &amp; Reporting Duty Logic (PRD Section 2)</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              • <strong>Site Luwuk (4 Engineers):</strong> The engineer scheduled to work on Sunday (07:00 - 18:00) automatically assumes the <strong>Early Shift (06:00 - 18:00)</strong> for Monday to Saturday. This early shift engineer is the <strong>mandatory Duty Engineer</strong> responsible for generating and submitting the Daily Report for that week.
            </p>
            <p className="text-slate-700 leading-relaxed">
              • <strong>HO Jakarta (2 Engineers):</strong> Mon-Fri standard office shifts (Engineer A: 07:00 - 17:00, Engineer B: 08:00 - 17:00).
            </p>
          </div>

          {/* Active Duty Engineer Card */}
          <div className="p-5 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono text-blue-800 uppercase tracking-wider font-semibold block">
                Designated Reporting Duty Engineer for Current Cycle
              </span>
              <div className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
                <span>{siteDutyEngineer?.name}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 font-semibold">
                  {siteDutyEngineer?.badgeNumber}
                </span>
                {roster.isOverridden && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 font-semibold">
                    Manager Override
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-600 font-mono mt-1">
                Assigned Shift: Early Shift (06:00 - 18:00) · Site Luwuk Admin Building
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isSuperior && (
                <button
                  type="button"
                  onClick={() => setShowOverrideForm(prev => !prev)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Override Duty Assignment
                </button>
              )}
            </div>
          </div>

          {/* Manager Override Form */}
          {showOverrideForm && isSuperior && (
            <form onSubmit={handleApplyOverride} className="p-5 rounded-xl bg-white border border-amber-300 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Superior Duty Override (PRD Section 4: Sick Leave / Relief Assignment)
              </h4>
              <p className="text-xs text-slate-600">
                Designate a different Site Luwuk engineer as the mandatory Duty Engineer with write permissions.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Select New Duty Engineer</label>
                  <select
                    value={overrideTargetId}
                    onChange={e => setOverrideTargetId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                  >
                    {TEAM_MEMBERS.filter(m => m.location === 'Site Luwuk').map(eng => (
                      <option key={eng.id} value={eng.id}>
                        {eng.name} ({eng.badgeNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Reason for Override</label>
                  <input
                    type="text"
                    value={overrideReasonInput}
                    onChange={e => setOverrideReasonInput(e.target.value)}
                    placeholder="e.g. Christina medical leave relief"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                {dutyOverrideId && (
                  <button
                    type="button"
                    onClick={handleResetOverride}
                    className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
                  >
                    Reset to Automated Roster
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowOverrideForm(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
                >
                  Confirm Override
                </button>
              </div>
            </form>
          )}

          {/* Section: Site Luwuk Team Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-700" />
              <span>Site Luwuk Roster (4 Engineers)</span>
            </h3>

            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Engineer Name</th>
                    <th className="py-3 px-4">Badge ID</th>
                    <th className="py-3 px-4">Weekly Shift Schedule</th>
                    <th className="py-3 px-4">Duty Role</th>
                    <th className="py-3 px-4 text-right">Report Rights</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {TEAM_MEMBERS.filter(m => m.location === 'Site Luwuk').map(member => {
                    const isDutyLeader = member.id === roster.siteDutyEngineerId;
                    return (
                      <tr
                        key={member.id}
                        className={`hover:bg-slate-50 ${isDutyLeader ? 'bg-blue-50/50' : ''}`}
                      >
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {member.name}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">{member.badgeNumber}</td>
                        <td className="py-3 px-4 text-slate-700">
                          {isDutyLeader ? (
                            <span className="text-blue-900 font-semibold">
                              Sun (07:00-18:00) + Mon-Sat (06:00-18:00 Early Shift)
                            </span>
                          ) : (
                            <span>Mon - Fri (07:00 - 18:00 Regular Shift)</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {isDutyLeader ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-blue-100 text-blue-900 font-bold border border-blue-200">
                              Mandatory Duty Engineer
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 text-slate-600">
                              Standard Support
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isDutyLeader ? (
                            <span className="text-emerald-700 font-bold flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Full Write/Submit
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">Read-Only</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Head Office Jakarta Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-700" />
              <span>HO Jakarta Roster (2 Engineers)</span>
            </h3>

            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Engineer Name</th>
                    <th className="py-3 px-4">Badge ID</th>
                    <th className="py-3 px-4">Weekly Shift Schedule</th>
                    <th className="py-3 px-4">Duty Role</th>
                    <th className="py-3 px-4 text-right">Report Rights</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {TEAM_MEMBERS.filter(m => m.location === 'HO Jakarta' && m.role !== 'ICT_MANAGER').map(
                    (member, i) => (
                      <tr key={member.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {member.name}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">{member.badgeNumber}</td>
                        <td className="py-3 px-4 text-slate-700">
                          Mon - Fri ({i === 0 ? '07:00 - 17:00 Shift A' : '08:00 - 17:00 Shift B'})
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 text-slate-600">
                            HO Support
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-slate-400 font-mono">Read-Only</span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-between bg-slate-50/90 rounded-b-2xl shrink-0">
          <span className="text-xs text-slate-500 font-mono">
            Roster governance managed by PT Donggi-Senoro LNG ICT Operations Command
          </span>
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
