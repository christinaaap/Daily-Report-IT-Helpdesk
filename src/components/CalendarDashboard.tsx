import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getRosterForDate } from '../utils/rosterLogic';
import { TEAM_MEMBERS } from '../data/mockData';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Lock,
  Camera,
  Calendar as CalendarIcon,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { ReportStatus } from '../types';

export const CalendarDashboard: React.FC = () => {
  const {
    reports,
    selectedDate,
    setSelectedDate,
    openCreateModal,
    openViewModal,
    openRosterModal,
    currentUser,
    dutyOverrideId,
    isCurrentEligibleForDate,
  } = useApp();

  // Current calendar view state (Default to October 2026 based on metadata)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 0-indexed: 9 = October

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Calendar math
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  // Aggregate metrics
  const totalApproved = reports.filter(r => r.status === 'APPROVED').length;
  const totalSubmitted = reports.filter(r => r.status === 'SUBMITTED').length;
  const totalRejected = reports.filter(r => r.status === 'REJECTED').length;
  const currentWeekRoster = getRosterForDate(selectedDate, dutyOverrideId);
  const scheduledDutyUser = TEAM_MEMBERS.find(m => m.id === currentWeekRoster.siteDutyEngineerId);

  return (
    <div className="space-y-6">
      {/* Top Banner: Shift Accountability & Role Status */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900">
                Site Luwuk &amp; HO Jakarta Shift Roster
              </h2>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-medium">
                Cycle: Week 40, Oct 2026
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Standard operating procedure: Mandatory Duty Engineer for this cycle is{' '}
              <strong className="text-slate-900 font-semibold">{scheduledDutyUser?.name}</strong> (Site Early Shift: 06:00 - 18:00).
              Only the assigned early-shift duty engineer has authorization to submit the locked daily operational report.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={openRosterModal}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
          >
            Inspect Shift Schedule
          </button>
          {isCurrentEligibleForDate(selectedDate).isEligible && (
            <button
              type="button"
              onClick={() => openCreateModal(selectedDate)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-700 hover:bg-blue-800 text-white flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Today's Report
            </button>
          )}
        </div>
      </div>

      {/* Corporate Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Approved Reports</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {totalApproved}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-mono">
            Validated by Superior
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Awaiting Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-700 tabular-nums">
            {totalSubmitted}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-mono">
            Pending ICT Manager E-Signature
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Revision / Rejected</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-700 tabular-nums">
            {totalRejected}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-mono">
            Supervisor feedback logged
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Physical VTC Compliance</span>
            <Camera className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-blue-700 tabular-nums">
            100%
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-mono">
            Mandatory photo evidence verified
          </div>
        </div>
      </div>

      {/* Calendar Header & Status Legend */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-700" />
              <span>
                {monthNames[currentMonth]} {currentYear}
              </span>
            </h3>
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Status Color Indicators Legend per PRD Step 2 */}
          <div className="flex items-center gap-4 text-xs flex-wrap">
            <span className="text-slate-500 font-medium">Indicator Statuses:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
              <span className="text-slate-600">Gray: Pending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="text-amber-800 font-medium">Yellow: Awaiting Review</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span className="text-emerald-800 font-medium">Green: Approved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span className="text-rose-800 font-medium">Red: Rejected</span>
            </div>
          </div>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <div className="py-1 text-rose-600">Sun (Duty)</div>
          <div className="py-1">Mon</div>
          <div className="py-1">Tue</div>
          <div className="py-1">Wed</div>
          <div className="py-1">Thu</div>
          <div className="py-1">Fri</div>
          <div className="py-1 text-blue-700">Sat</div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {daysArray.map((dayNum, index) => {
            if (!dayNum) {
              return (
                <div
                  key={`empty-${index}`}
                  className="min-h-[100px] sm:min-h-[115px] rounded-lg bg-slate-50/50 border border-slate-100"
                />
              );
            }

            const monthPadded = String(currentMonth + 1).padStart(2, '0');
            const dayPadded = String(dayNum).padStart(2, '0');
            const dateStr = `${currentYear}-${monthPadded}-${dayPadded}`;
            const report = reports.find(r => r.reportDate === dateStr);
            const isToday = dateStr === selectedDate;
            const isSunday = new Date(currentYear, currentMonth, dayNum).getDay() === 0;

            const eligibility = isCurrentEligibleForDate(dateStr);

            // Determine status color indicator for corporate look
            let statusColor = 'border-slate-200 bg-white text-slate-700 hover:border-slate-300';
            let indicatorBg = 'bg-slate-300';
            let indicatorText = 'Pending (No Report)';

            if (report) {
              if (report.status === 'APPROVED') {
                statusColor = 'border-emerald-300 bg-emerald-50/50 text-emerald-950 hover:border-emerald-400';
                indicatorBg = 'bg-emerald-500';
                indicatorText = 'Approved';
              } else if (report.status === 'SUBMITTED') {
                statusColor = 'border-amber-300 bg-amber-50/50 text-amber-950 hover:border-amber-400';
                indicatorBg = 'bg-amber-500 animate-pulse';
                indicatorText = 'Awaiting Approval';
              } else if (report.status === 'REJECTED') {
                statusColor = 'border-rose-300 bg-rose-50/50 text-rose-950 hover:border-rose-400';
                indicatorBg = 'bg-rose-500';
                indicatorText = 'Rejected / Needs Revision';
              }
            }

            return (
              <div
                key={dateStr}
                onClick={() => {
                  if (report) {
                    openViewModal(report.id);
                  } else if (eligibility.isEligible) {
                    openCreateModal(dateStr);
                  } else {
                    setSelectedDate(dateStr);
                  }
                }}
                className={`min-h-[100px] sm:min-h-[115px] p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between group shadow-2xs ${statusColor} ${
                  isToday ? 'ring-2 ring-blue-600 shadow-xs' : ''
                }`}
              >
                {/* Header of day cell */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-sm font-bold font-mono ${
                        isSunday ? 'text-rose-600' : isToday ? 'text-blue-700' : 'text-slate-800'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {isToday && (
                      <span className="text-[10px] font-semibold uppercase bg-blue-100 text-blue-800 px-1 rounded font-mono">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Indicator Dot */}
                  <div
                    title={indicatorText}
                    className={`w-2.5 h-2.5 rounded-full ${indicatorBg}`}
                  />
                </div>

                {/* Body Content of Day Cell */}
                <div className="my-1.5">
                  {report ? (
                    <div className="space-y-0.5">
                      <div className="text-[11px] font-semibold truncate text-slate-800">
                        {report.dutyEngineerName.split(' ')[0]}
                      </div>
                      <div className="text-[10px] font-medium flex items-center gap-1 mt-0.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${indicatorBg}`} />
                        <span
                          className={
                            report.status === 'APPROVED'
                              ? 'text-emerald-700 font-semibold'
                              : report.status === 'SUBMITTED'
                              ? 'text-amber-700 font-semibold'
                              : 'text-rose-700 font-semibold'
                          }
                        >
                          {report.status === 'APPROVED'
                            ? 'Approved'
                            : report.status === 'SUBMITTED'
                            ? 'Submitted'
                            : 'Rejected'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                      <span>Pending</span>
                    </div>
                  )}
                </div>

                {/* Footer / Action Affordance */}
                <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  {report ? (
                    <span className="font-mono text-slate-500 group-hover:text-blue-700 font-medium transition-colors">
                      View Audit →
                    </span>
                  ) : eligibility.isEligible ? (
                    <span className="text-blue-700 font-semibold group-hover:underline flex items-center gap-0.5">
                      <Plus className="w-3 h-3" /> Create
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" /> Locked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
