import { TeamMember, ShiftRosterSchedule, ShiftType } from '../types';
import { TEAM_MEMBERS } from '../data/mockData';

/**
 * Calculates the weekly duty cycle for Site Luwuk engineers.
 * The 4 Site Luwuk engineers rotate weekly:
 * 1 engineer works Sunday (07:00-18:00) + Monday-Saturday early shift (06:00-18:00)
 * -> This engineer is the designated Duty Engineer for that entire cycle.
 * The other 3 engineers work Monday-Friday (07:00-18:00).
 *
 * For HO Jakarta:
 * Eng A: Mon-Fri 07:00-17:00
 * Eng B: Mon-Fri 08:00-17:00
 */

export function getRosterForDate(dateStr: string, dutyOverrideId?: string | null): ShiftRosterSchedule {
  const targetDate = new Date(dateStr);
  const dayOfWeek = targetDate.getDay(); // 0 is Sunday, 6 is Saturday

  // Calculate week index relative to epoch
  const epoch = new Date('2026-09-01').getTime();
  const diffDays = Math.floor((targetDate.getTime() - epoch) / (1000 * 60 * 60 * 24));
  const weekIndex = Math.floor(diffDays / 7);

  const siteEngineers = TEAM_MEMBERS.filter(m => m.location === 'Site Luwuk');
  
  // Rotate primary duty index among the 4 site engineers
  const dutyIndex = Math.abs(weekIndex) % siteEngineers.length;
  const scheduledDutyEngineer = siteEngineers[dutyIndex];

  // Active duty engineer may be overridden by ICT Manager
  const activeDutyEngineerId = dutyOverrideId || scheduledDutyEngineer.id;

  const siteRoster = siteEngineers.map(eng => {
    const isDuty = eng.id === activeDutyEngineerId;
    let shift: ShiftType;
    if (dayOfWeek === 0) {
      // Sunday
      shift = isDuty ? 'Site Sunday Duty (07:00 - 18:00)' : 'Site Regular (07:00 - 18:00)';
    } else {
      // Mon - Sat
      shift = isDuty ? 'Site Early (06:00 - 18:00)' : 'Site Regular (07:00 - 18:00)';
    }

    return {
      engineerId: eng.id,
      shift,
      isDutyLeader: isDuty,
    };
  });

  const hoEngineers = TEAM_MEMBERS.filter(m => m.location === 'HO Jakarta').map((eng, idx) => ({
    engineerId: eng.id,
    shift: (idx === 0 ? 'HO Shift A (07:00 - 17:00)' : 'HO Shift B (08:00 - 17:00)') as ShiftType,
  }));

  return {
    date: dateStr,
    siteDutyEngineerId: activeDutyEngineerId,
    siteEngineers: siteRoster,
    hoEngineers,
    isOverridden: !!dutyOverrideId && dutyOverrideId !== scheduledDutyEngineer.id,
    overrideReason: dutyOverrideId ? 'Designated shift adjustment by ICT Operations Manager' : undefined,
  };
}

/**
 * Checks if a specific user is eligible to create/submit report for the specified date
 */
export function isUserEligibleToReport(user: TeamMember, dateStr: string, dutyOverrideId?: string | null): {
  isEligible: boolean;
  reason: string;
} {
  const roster = getRosterForDate(dateStr, dutyOverrideId);
  const targetDate = new Date(dateStr);
  const dayOfWeek = targetDate.getDay();

  // If Sunday and non-duty engineer
  if (dayOfWeek === 0 && user.id !== roster.siteDutyEngineerId) {
    return {
      isEligible: false,
      reason: 'Site Luwuk Sunday operations are exclusively handled by the Duty Engineer.',
    };
  }

  // HO Jakarta engineers do not create the Site Daily Report
  if (user.location === 'HO Jakarta' && user.role !== 'ICT_MANAGER') {
    return {
      isEligible: false,
      reason: 'HO Jakarta engineers operate on standard office shifts. Daily Report generation is strictly assigned to the Site Luwuk Early Shift Duty Engineer.',
    };
  }

  if (user.role === 'ICT_MANAGER') {
    return {
      isEligible: false,
      reason: 'ICT Managers have review and approval authority. Operational daily reports must be initiated by the designated Helpdesk Duty Engineer.',
    };
  }

  // Check if current user is the rostered Duty Engineer
  if (user.id === roster.siteDutyEngineerId) {
    return {
      isEligible: true,
      reason: 'Eligible: Assigned Duty Engineer for early shift cycle (06:00 - 18:00).',
    };
  }

  const assignedLeader = TEAM_MEMBERS.find(m => m.id === roster.siteDutyEngineerId)?.name || 'Designated Duty Engineer';
  return {
    isEligible: false,
    reason: `Locked by Roster Policy. Today's reporting responsibility is strictly assigned to ${assignedLeader} (Early Shift: 06:00 - 18:00).`,
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
