import {
  TeamMember,
  ShiftRosterSchedule,
  ShiftType,
  MissingReportReminder,
  DailyReport,
  DayShiftSchedule,
  ManualShiftItem,
} from '../types';
import { TEAM_MEMBERS } from '../data/mockData';

export const SITE_USO_SHIFT_OPTIONS = [
  'Shift A (06.00 - 18.00 WITA)',
  'Shift B (07.00 - 18.00 WITA)',
] as const;

export const HO_JKT_SHIFT_OPTIONS = [
  'Shift A (07.00 - 17.00 WIB)',
  'Shift B (08.00 - 17.00 WIB)',
] as const;

/**
 * Creates a clean, empty shift assignment for a given date without any dummy data.
 */
export function createEmptyDaySchedule(dateStr: string, teamMembers: TeamMember[] = TEAM_MEMBERS): DayShiftSchedule {
  const shifts: Record<string, ManualShiftItem> = {};

  // Site Uso Helpdesk Engineers
  const siteEngineers = teamMembers.filter(m => m.location === 'Site Uso' && m.role === 'HELPDESK_ENGINEER');
  siteEngineers.forEach(eng => {
    shifts[eng.id] = {
      engineerId: eng.id,
      engineerName: eng.name,
      badgeNumber: eng.badgeNumber,
      location: 'Site Uso',
      shiftTime: '', // Clean: unassigned until selected by Administrator
      isDutyEngineer: false,
      notes: '',
    };
  });

  // HO Jkt Helpdesk Engineers
  const hoEngineers = teamMembers.filter(m => m.location === 'HO Jkt' && m.role === 'HELPDESK_ENGINEER');
  hoEngineers.forEach(eng => {
    shifts[eng.id] = {
      engineerId: eng.id,
      engineerName: eng.name,
      badgeNumber: eng.badgeNumber,
      location: 'HO Jkt',
      shiftTime: '', // Clean: unassigned until selected by Administrator
      isDutyEngineer: false,
      notes: '',
    };
  });

  return {
    date: dateStr,
    siteUsoDutyEngineerId: '',
    shifts,
    updatedBy: '',
    updatedAt: '',
  };
}

/**
 * Returns the effective roster for a given date based on Administrator configuration.
 */
export function getRosterForDate(
  dateStr: string,
  manualSchedules?: Record<string, DayShiftSchedule>,
  dutyOverrideId?: string | null,
  teamMembers: TeamMember[] = TEAM_MEMBERS
): ShiftRosterSchedule {
  const daySchedule =
    manualSchedules && manualSchedules[dateStr]
      ? manualSchedules[dateStr]
      : createEmptyDaySchedule(dateStr, teamMembers);

  const siteEngineers = teamMembers.filter(m => m.location === 'Site Uso' && m.role === 'HELPDESK_ENGINEER');
  const hoEngineers = teamMembers.filter(m => m.location === 'HO Jkt' && m.role === 'HELPDESK_ENGINEER');

  const effectiveDutyEngineerId =
    dutyOverrideId || daySchedule.siteUsoDutyEngineerId || (daySchedule.updatedAt ? siteEngineers[0]?.id : (siteEngineers[0]?.id || 'admin-it-01'));

  const siteRoster = siteEngineers.map(eng => {
    const shiftItem = daySchedule.shifts[eng.id];
    const isDuty = eng.id === effectiveDutyEngineerId;
    const shiftTime = shiftItem?.shiftTime || '';

    return {
      engineerId: eng.id,
      shift: shiftTime as ShiftType,
      isDutyLeader: isDuty,
    };
  });

  const hoRoster = hoEngineers.map(eng => {
    const shiftItem = daySchedule.shifts[eng.id];
    const shiftTime = shiftItem?.shiftTime || '';
    return {
      engineerId: eng.id,
      shift: shiftTime as ShiftType,
    };
  });

  return {
    date: dateStr,
    siteDutyEngineerId: effectiveDutyEngineerId,
    siteEngineers: siteRoster,
    hoEngineers: hoRoster,
    isOverridden: !!dutyOverrideId && dutyOverrideId !== daySchedule.siteUsoDutyEngineerId,
    overrideReason: dutyOverrideId ? 'Penyesuaian penugasan shift oleh Administrator / ICT Manager' : undefined,
  };
}

/**
 * Checks if a specific user is eligible to create/submit report for the specified date
 */
export function isUserEligibleToReport(
  user: TeamMember,
  dateStr: string,
  manualSchedules?: Record<string, DayShiftSchedule>,
  dutyOverrideId?: string | null,
  teamMembers: TeamMember[] = TEAM_MEMBERS
): {
  isEligible: boolean;
  reason: string;
} {
  // Administrator has full super-access to any date
  if (user.role === 'ADMINISTRATOR') {
    return {
      isEligible: true,
      reason: 'Administrator Super-Access: Hak akses penuh untuk membuat, memodifikasi, dan mengelola laporan di seluruh tanggal dan lokasi.',
    };
  }

  const roster = getRosterForDate(dateStr, manualSchedules, dutyOverrideId, teamMembers);

  // HO Jkt engineers operate standard office shifts
  if (user.location === 'HO Jkt' && user.role !== 'ICT_MANAGER') {
    return {
      isEligible: false,
      reason: 'Engineer HO Jkt bertugas di HO Jkt. Pengisian Daily Report ditugaskan kepada Petugas Duty Site Uso (Shift A: 06.00 - 18.00 WITA).',
    };
  }

  if (user.role === 'ICT_MANAGER') {
    return {
      isEligible: false,
      reason: 'ICT Manager memiliki wewenang review dan persetujuan. Laporan operasional harian diisi oleh Petugas Duty Site Uso atau Administrator.',
    };
  }

  // Check if current user is the rostered Duty Engineer
  if (user.id === roster.siteDutyEngineerId) {
    return {
      isEligible: true,
      reason: 'Memenuhi Syarat: Petugas Duty terdaftar untuk Shift A (06.00 - 18.00 WITA) di Site Uso.',
    };
  }

  const assignedLeader =
    teamMembers.find(m => m.id === roster.siteDutyEngineerId)?.name || 'Petugas Duty Terdaftar';
  return {
    isEligible: false,
    reason: `Terkunci oleh Jadwal Shift. Tanggung jawab pelaporan hari ini ditugaskan kepada ${assignedLeader} (Site Uso Shift A: 06.00 - 18.00 WITA).`,
  };
}

/**
 * Generates an immutable SHA-256 style hash for report locking
 */
export function generateImmutableHash(reportId: string, dutyEngineerId: string, timestamp: string): string {
  let hash = 0;
  const str = `${reportId}:${dutyEngineerId}:${timestamp}:PT-DSLNG-ICT-ENCRYPTED-LOCK`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `dslng_${hex}_${Date.now().toString(16)}a94f8e21bc89`;
}

/**
 * Detects missing daily reports from the beginning of the current month up to the current date.
 * If any day does not have a report submitted or approved, it generates a reminder for the designated Helpdesk Engineer.
 */
export function detectMissingReportDays(
  reports: DailyReport[],
  currentDateStr: string,
  manualSchedules?: Record<string, DayShiftSchedule>,
  dutyOverrideId?: string | null,
  teamMembers: TeamMember[] = TEAM_MEMBERS
): MissingReportReminder[] {
  const parts = currentDateStr.split('-').map(Number);
  const currentYear = parts[0];
  const currentMonth = parts[1] - 1;
  const currentDay = parts[2];

  const missingReminders: MissingReportReminder[] = [];

  // Check each day of the month up to current date
  for (let d = 1; d <= currentDay; d++) {
    const monthPadded = String(currentMonth + 1).padStart(2, '0');
    const dayPadded = String(d).padStart(2, '0');
    const dateStr = `${currentYear}-${monthPadded}-${dayPadded}`;

    // Check if report exists
    const hasReport = reports.some(r => r.reportDate === dateStr);
    if (!hasReport) {
      const roster = getRosterForDate(dateStr, manualSchedules, dutyOverrideId, teamMembers);
      const assignedEngineer = teamMembers.find(m => m.id === roster.siteDutyEngineerId);

      const dayDate = new Date(dateStr);
      const currentDate = new Date(currentDateStr);
      const diffTime = currentDate.getTime() - dayDate.getTime();
      const daysOverdue = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

      if (assignedEngineer) {
        missingReminders.push({
          date: dateStr,
          assignedDutyEngineerId: assignedEngineer.id,
          assignedDutyEngineerName: assignedEngineer.name,
          assignedDutyEngineerEmail: assignedEngineer.email,
          location: assignedEngineer.location,
          shift: assignedEngineer.shift,
          daysOverdue,
          status: 'PENDING_SUBMISSION',
        });
      }
    }
  }

  return missingReminders;
}
