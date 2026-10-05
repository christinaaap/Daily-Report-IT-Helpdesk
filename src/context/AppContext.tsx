import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DailyReport,
  TeamMember,
  MissingReportReminder,
  DayShiftSchedule,
  Location,
  ServerCheck,
  PhysicalInspectionItem,
  CompanyAsset,
} from '../types';
import {
  INITIAL_TEAM_MEMBERS,
  SEED_PAST_REPORTS,
  INITIAL_SERVERS,
  DEFAULT_PHYSICAL_ROOMS,
  INITIAL_COMPANY_ASSETS,
} from '../data/mockData';
import {
  isUserEligibleToReport,
  getRosterForDate,
  detectMissingReportDays,
  createEmptyDaySchedule,
} from '../utils/rosterLogic';

interface AppContextType {
  currentUser: TeamMember;
  setCurrentUser: (user: TeamMember) => void;
  teamMembers: TeamMember[];
  addHelpdeskEngineer: (data: {
    name: string;
    email: string;
    badgeNumber: string;
    location: Location;
    phone?: string;
  }) => void;
  updateHelpdeskEngineer: (engineer: TeamMember) => void;
  deleteHelpdeskEngineer: (id: string) => void;
  addSuperiorAccount: (data: {
    name: string;
    email: string;
    badgeNumber: string;
    location: Location;
    phone?: string;
  }) => void;
  updateTeamMember: (member: TeamMember) => void;
  deleteTeamMember: (id: string) => void;

  // Fleet Infrastructure & Facilities Management
  servers: ServerCheck[];
  addServer: (data: Omit<ServerCheck, 'id'>) => void;
  updateServer: (server: ServerCheck) => void;
  deleteServer: (id: string) => void;

  meetingRooms: PhysicalInspectionItem[];
  addMeetingRoom: (data: { roomName: string; location: Location; facilities?: string; notes?: string }) => void;
  updateMeetingRoom: (room: PhysicalInspectionItem) => void;
  deleteMeetingRoom: (id: string) => void;

  companyAssets: CompanyAsset[];
  addCompanyAsset: (data: Omit<CompanyAsset, 'id'>) => void;
  updateCompanyAsset: (asset: CompanyAsset) => void;
  deleteCompanyAsset: (id: string) => void;

  reports: DailyReport[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  dutyOverrideId: string | null;
  setDutyOverrideId: (id: string | null) => void;
  overrideReason: string;
  setOverrideReason: (reason: string) => void;

  // Shift Schedules
  manualSchedules: Record<string, DayShiftSchedule>;
  saveDaySchedule: (schedule: DayShiftSchedule) => void;
  batchApplySchedule: (sourceDate: string, targetDates: string[]) => void;
  
  // Missing reports & reminders
  missingReminders: MissingReportReminder[];
  dispatchedReminderDates: Record<string, string>; // date -> timestamp
  dispatchReminder: (date: string) => void;
  dispatchAllReminders: () => void;

  // Modals & Navigation
  activeModal: {
    type: 'CREATE' | 'VIEW' | 'ROSTER' | 'REMINDERS' | 'MANAGE_ENGINEERS';
    reportId?: string;
    date?: string;
  } | null;
  openCreateModal: (date?: string) => void;
  openViewModal: (reportId: string) => void;
  openRosterModal: () => void;
  openRemindersModal: () => void;
  openManageEngineersModal: () => void;
  closeModal: () => void;

  // Actions
  submitDailyReport: (report: Omit<DailyReport, 'id' | 'status' | 'auditTrail'>) => Promise<DailyReport>;
  reviewDailyReport: (
    reportId: string,
    decision: 'APPROVED' | 'REJECTED',
    comments: string,
    signatureDataUrl: string
  ) => void;
  applyDutyOverride: (engineerId: string, reason: string) => void;
  resetAllData: () => void;

  // Notification Toast
  toastMessage: { text: string; type: 'success' | 'warning' | 'info' | 'error' } | null;
  showToast: (text: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
  hideToast: () => void;

  // Computed helper
  isCurrentEligibleForDate: (date: string) => { isEligible: boolean; reason: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_REPORTS = 'dslng_it_daily_reports_v2';
const STORAGE_KEY_OVERRIDE = 'dslng_it_roster_override_v2';
const STORAGE_KEY_USER = 'dslng_it_active_user_v2';
const STORAGE_KEY_REMINDERS = 'dslng_it_reminders_dispatched_v2';
const STORAGE_KEY_MANUAL_SCHEDULES = 'dslng_it_schedules_clean_v3';
const STORAGE_KEY_TEAM_MEMBERS = 'dslng_it_team_members_v6';
const STORAGE_KEY_SERVERS = 'dslng_it_servers_clean_v3';
const STORAGE_KEY_ROOMS = 'dslng_it_rooms_clean_v3';
const STORAGE_KEY_ASSETS = 'dslng_it_assets_clean_v3';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current operational date: 2026-10-04 (October 4, 2026)
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-04');

  // Dynamic team members (0 dummy helpdesk/superior, created by Administrator)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TEAM_MEMBERS);
      if (saved) {
        const parsed: TeamMember[] = JSON.parse(saved);
        // Exclude legacy dummy superior 'mgr-ict-1' (Hendra Wijaya)
        const filtered = parsed.filter(m => m.id !== 'mgr-ict-1');
        if (filtered.length > 0) return filtered;
      }
    } catch {
      // ignore
    }
    return INITIAL_TEAM_MEMBERS;
  });

  // Dynamic Server Fleet (0 dummy, created via Infrastructure Fleet)
  const [servers, setServers] = useState<ServerCheck[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SERVERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_SERVERS;
  });

  // Dynamic Meeting Rooms (0 dummy, created via Infrastructure Fleet)
  const [meetingRooms, setMeetingRooms] = useState<PhysicalInspectionItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROOMS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_PHYSICAL_ROOMS;
  });

  // Dynamic Company Assets & Licenses
  const [companyAssets, setCompanyAssets] = useState<CompanyAsset[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ASSETS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_COMPANY_ASSETS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SERVERS, JSON.stringify(servers));
  }, [servers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(meetingRooms));
  }, [meetingRooms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(companyAssets));
  }, [companyAssets]);

  // Active user (defaults to Administrator IT DSLNG)
  const [currentUser, setCurrentUser] = useState<TeamMember>(() => {
    try {
      const savedUserId = localStorage.getItem(STORAGE_KEY_USER);
      if (savedUserId && savedUserId !== 'mgr-ict-1') {
        const found = teamMembers.find(m => m.id === savedUserId);
        if (found) return found;
      }
    } catch {
      // ignore
    }
    return teamMembers.find(m => m.id === 'admin-it-01') || INITIAL_TEAM_MEMBERS[0];
  });

  const [dutyOverrideId, setDutyOverrideId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_OVERRIDE) || null;
    } catch {
      return null;
    }
  });

  const [overrideReason, setOverrideReason] = useState<string>('');

  const [reports, setReports] = useState<DailyReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REPORTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load local reports', e);
    }
    return SEED_PAST_REPORTS;
  });

  // Shift schedules: completely clean without dummy prefilled data
  const [manualSchedules, setManualSchedules] = useState<Record<string, DayShiftSchedule>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MANUAL_SCHEDULES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });

  const [dispatchedReminderDates, setDispatchedReminderDates] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REMINDERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });

  const [activeModal, setActiveModal] = useState<{
    type: 'CREATE' | 'VIEW' | 'ROSTER' | 'REMINDERS' | 'MANAGE_ENGINEERS';
    reportId?: string;
    date?: string;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'warning' | 'info' | 'error';
  } | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
    } catch (e) {
      console.error('Failed to sync reports to localStorage', e);
    }
  }, [reports]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TEAM_MEMBERS, JSON.stringify(teamMembers));
    } catch (e) {
      console.error('Failed to sync team members to localStorage', e);
    }
  }, [teamMembers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MANUAL_SCHEDULES, JSON.stringify(manualSchedules));
    } catch (e) {
      console.error('Failed to sync shift schedules to localStorage', e);
    }
  }, [manualSchedules]);

  useEffect(() => {
    try {
      if (dutyOverrideId) {
        localStorage.setItem(STORAGE_KEY_OVERRIDE, dutyOverrideId);
      } else {
        localStorage.removeItem(STORAGE_KEY_OVERRIDE);
      }
    } catch {
      // ignore
    }
  }, [dutyOverrideId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER, currentUser.id);
    } catch {
      // ignore
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REMINDERS, JSON.stringify(dispatchedReminderDates));
    } catch {
      // ignore
    }
  }, [dispatchedReminderDates]);

  // Compute missing/unsubmitted day reminders up to current date
  const missingReminders = detectMissingReportDays(reports, selectedDate, manualSchedules, dutyOverrideId, teamMembers).map(reminder => {
    const isDispatched = !!dispatchedReminderDates[reminder.date];
    return {
      ...reminder,
      status: isDispatched ? ('REMINDER_DISPATCHED' as const) : ('PENDING_SUBMISSION' as const),
      dispatchedAt: dispatchedReminderDates[reminder.date],
    };
  });

  const showToast = (text: string, type: 'success' | 'warning' | 'info' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(prev => (prev?.text === text ? null : prev));
    }, 6000);
  };

  const hideToast = () => setToastMessage(null);

  // Helpdesk & Superior Account Management
  const addHelpdeskEngineer = (data: {
    name: string;
    email: string;
    badgeNumber: string;
    location: Location;
    phone?: string;
  }) => {
    const newId = `eng-${Date.now()}`;
    const defaultShift = data.location === 'Site Uso' ? 'Shift A (06.00 - 18.00 WITA)' : 'Shift A (07.00 - 17.00 WIB)';
    const newEngineer: TeamMember = {
      id: newId,
      name: data.name,
      email: data.email,
      badgeNumber: data.badgeNumber,
      location: data.location,
      role: 'HELPDESK_ENGINEER',
      shift: defaultShift,
      isDutyEligible: data.location === 'Site Uso',
      phone: data.phone || '',
    };

    setTeamMembers(prev => [...prev, newEngineer]);
    showToast(`Akun Helpdesk Engineer ${data.name} (${data.location}) berhasil dibuat oleh Administrator.`, 'success');
  };

  const addSuperiorAccount = (data: {
    name: string;
    email: string;
    badgeNumber: string;
    location: Location;
    phone?: string;
  }) => {
    const newId = `mgr-ict-${Date.now()}`;
    const defaultShift = data.location === 'Site Uso' ? 'Shift A (06.00 - 18.00 WITA)' : 'Shift A (07.00 - 17.00 WIB)';
    const newSuperior: TeamMember = {
      id: newId,
      name: data.name,
      email: data.email,
      badgeNumber: data.badgeNumber,
      location: data.location,
      role: 'ICT_MANAGER',
      shift: defaultShift,
      isDutyEligible: false,
      phone: data.phone || '',
    };

    setTeamMembers(prev => [...prev, newSuperior]);
    showToast(`Akun Superior / ICT Manager ${data.name} (${data.location}) berhasil dibuat oleh Administrator.`, 'success');
  };

  const updateTeamMember = (member: TeamMember) => {
    setTeamMembers(prev => prev.map(m => (m.id === member.id ? member : m)));
    if (currentUser.id === member.id) {
      setCurrentUser(member);
    }
    const roleTitle = member.role === 'ICT_MANAGER' ? 'Superior / ICT Manager' : member.role === 'ADMINISTRATOR' ? 'Administrator' : 'Helpdesk Engineer';
    showToast(`Data akun ${roleTitle} ${member.name} berhasil diperbarui.`, 'success');
  };

  const updateHelpdeskEngineer = (engineer: TeamMember) => {
    updateTeamMember(engineer);
  };

  const deleteTeamMember = (id: string) => {
    const found = teamMembers.find(m => m.id === id);
    if (!found) return;
    if (found.role === 'ADMINISTRATOR') {
      showToast('Akun Super Administrator IT tidak dapat dihapus.', 'error');
      return;
    }
    setTeamMembers(prev => prev.filter(m => m.id !== id));
    if (currentUser.id === id) {
      const admin = teamMembers.find(m => m.id === 'admin-it-01') || INITIAL_TEAM_MEMBERS[0];
      setCurrentUser(admin);
    }
    const roleTitle = found.role === 'ICT_MANAGER' ? 'Superior / ICT Manager' : 'Helpdesk Engineer';
    showToast(`Akun ${roleTitle} ${found.name} telah dihapus.`, 'info');
  };

  const deleteHelpdeskEngineer = (id: string) => {
    deleteTeamMember(id);
  };

  // Server Fleet Management
  const addServer = (data: Omit<ServerCheck, 'id'>) => {
    const newServer: ServerCheck = {
      ...data,
      id: `srv-${Date.now()}`,
    };
    setServers(prev => [...prev, newServer]);
    showToast(`Server ${data.name} (${data.location}) berhasil ditambahkan.`, 'success');
  };

  const updateServer = (server: ServerCheck) => {
    setServers(prev => prev.map(s => (s.id === server.id ? server : s)));
    showToast(`Data server ${server.name} berhasil diperbarui.`, 'success');
  };

  const deleteServer = (id: string) => {
    const found = servers.find(s => s.id === id);
    setServers(prev => prev.filter(s => s.id !== id));
    showToast(`Server ${found?.name || ''} telah dihapus.`, 'info');
  };

  // Meeting Room Management
  const addMeetingRoom = (data: { roomName: string; location: Location; facilities?: string; notes?: string }) => {
    const newRoom: PhysicalInspectionItem = {
      id: `room-${Date.now()}`,
      roomName: data.roomName,
      location: data.location,
      audioStatus: 'PASS',
      videoStatus: 'PASS',
      sharingCablesStatus: 'PASS',
      photoEvidenceUrl: '',
      completed: false,
      notes: data.notes || '',
      facilities: data.facilities || 'Display UHD, Mic Array, HDMI/USB-C',
    };
    setMeetingRooms(prev => [...prev, newRoom]);
    showToast(`Ruang meeting ${data.roomName} (${data.location}) berhasil ditambahkan.`, 'success');
  };

  const updateMeetingRoom = (room: PhysicalInspectionItem) => {
    setMeetingRooms(prev => prev.map(r => (r.id === room.id ? room : r)));
    showToast(`Data ruang meeting ${room.roomName} berhasil diperbarui.`, 'success');
  };

  const deleteMeetingRoom = (id: string) => {
    const found = meetingRooms.find(r => r.id === id);
    setMeetingRooms(prev => prev.filter(r => r.id !== id));
    showToast(`Ruang meeting ${found?.roomName || ''} telah dihapus.`, 'info');
  };

  // Company Asset / License Management
  const addCompanyAsset = (data: Omit<CompanyAsset, 'id'>) => {
    const newAsset: CompanyAsset = {
      ...data,
      id: `ast-${Date.now()}`,
    };
    setCompanyAssets(prev => [...prev, newAsset]);
    showToast(`Aset / Lisensi ${data.name} berhasil ditambahkan.`, 'success');
  };

  const updateCompanyAsset = (asset: CompanyAsset) => {
    setCompanyAssets(prev => prev.map(a => (a.id === asset.id ? asset : a)));
    showToast(`Data aset ${asset.name} berhasil diperbarui.`, 'success');
  };

  const deleteCompanyAsset = (id: string) => {
    const found = companyAssets.find(a => a.id === id);
    setCompanyAssets(prev => prev.filter(a => a.id !== id));
    showToast(`Aset ${found?.name || ''} telah dihapus.`, 'info');
  };

  const saveDaySchedule = (schedule: DayShiftSchedule) => {
    setManualSchedules(prev => ({
      ...prev,
      [schedule.date]: schedule,
    }));
    showToast(`Pengaturan shift schedule untuk tanggal ${schedule.date} berhasil disimpan.`, 'success');
  };

  const batchApplySchedule = (sourceDate: string, targetDates: string[]) => {
    const sourceSchedule = manualSchedules[sourceDate] || createEmptyDaySchedule(sourceDate, teamMembers);
    setManualSchedules(prev => {
      const updated = { ...prev };
      targetDates.forEach(date => {
        updated[date] = {
          ...sourceSchedule,
          date,
          updatedAt: new Date().toLocaleTimeString(),
        };
      });
      return updated;
    });
    showToast(`Pengaturan shift schedule tanggal ${sourceDate} berhasil diterapkan ke ${targetDates.length} tanggal lainnya.`, 'success');
  };

  const dispatchReminder = (dateStr: string) => {
    const reminder = missingReminders.find(r => r.date === dateStr);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' WITA';
    
    setDispatchedReminderDates(prev => ({
      ...prev,
      [dateStr]: now,
    }));

    const engineerName = reminder?.assignedDutyEngineerName || 'Helpdesk Engineer';
    const email = reminder?.assignedDutyEngineerEmail || 'helpdesk@donggi-senoro.com';

    showToast(
      `Pengingat Terkirim: Notifikasi email & push darurat telah dikirimkan kepada ${engineerName} (${email}) untuk segera mengisi Laporan Harian tanggal ${dateStr}.`,
      'warning'
    );
  };

  const dispatchAllReminders = () => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' WITA';
    const updates: Record<string, string> = {};
    missingReminders.forEach(r => {
      updates[r.date] = now;
    });

    setDispatchedReminderDates(prev => ({
      ...prev,
      ...updates,
    }));

    showToast(
      `Notifikasi Massal Terkirim: Peringatan telah dikirimkan ke seluruh Helpdesk Engineer yang bertugas untuk ${missingReminders.length} hari yang belum diisi.`,
      'warning'
    );
  };

  const openCreateModal = (date?: string) => {
    const targetDate = date || selectedDate;
    const eligibility = isUserEligibleToReport(currentUser, targetDate, manualSchedules, dutyOverrideId, teamMembers);
    
    // Check if report already exists for this date
    const existing = reports.find(r => r.reportDate === targetDate);
    if (existing) {
      setActiveModal({ type: 'VIEW', reportId: existing.id, date: targetDate });
      showToast(`Laporan harian untuk ${targetDate} telah dibuat sebelumnya. Menampilkan dalam mode audit.`, 'info');
      return;
    }

    if (!eligibility.isEligible) {
      showToast(eligibility.reason, 'warning');
      return;
    }

    setActiveModal({ type: 'CREATE', date: targetDate });
  };

  const openViewModal = (reportId: string) => {
    const rep = reports.find(r => r.id === reportId);
    setActiveModal({ type: 'VIEW', reportId, date: rep?.reportDate });
  };

  const openRosterModal = () => {
    setActiveModal({ type: 'ROSTER' });
  };

  const openRemindersModal = () => {
    setActiveModal({ type: 'REMINDERS' });
  };

  const openManageEngineersModal = () => {
    setActiveModal({ type: 'MANAGE_ENGINEERS' });
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const submitDailyReport = async (data: Omit<DailyReport, 'id' | 'status' | 'auditTrail'>): Promise<DailyReport> => {
    const targetDate = data.reportDate;
    const dateFormatted = targetDate.replace(/-/g, '');
    const reportId = `DSLNG-REP-${dateFormatted}-01`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' WITA';
    
    const roleTitle = currentUser.role === 'ADMINISTRATOR' ? 'IT Administrator (Super Admin)' : 'Duty Engineer';

    const newReport: DailyReport = {
      ...data,
      id: reportId,
      status: 'SUBMITTED',
      submittedAt: now,
      immutableLockHash: `dslng_sha256_${Date.now().toString(16)}_${Math.random().toString(36).substring(2, 10)}`,
      auditTrail: [
        {
          timestamp: now,
          actorName: currentUser.name,
          actorRole: roleTitle,
          actorBadge: currentUser.badgeNumber,
          action: 'REPORT_SUBMITTED_AND_LOCKED',
          details: `Report permanently locked and encrypted. Submitted for operational date ${targetDate}. Submitter authorized as ${roleTitle}. All VTC physical inspection proofs validated.`,
        },
      ],
    };

    setReports(prev => [newReport, ...prev.filter(r => r.reportDate !== targetDate)]);
    setActiveModal({ type: 'VIEW', reportId: newReport.id, date: targetDate });

    const superiorUser = teamMembers.find(m => m.role === 'ICT_MANAGER');
    const superiorNotifyLabel = superiorUser ? `Superior ICT Manager (${superiorUser.name})` : 'Superior / ICT Manager';

    showToast(
      `Laporan harian tanggal ${targetDate} berhasil dikunci & disubmit. Notifikasi otomatis telah dikirimkan ke ${superiorNotifyLabel}.`,
      'success'
    );

    return newReport;
  };

  const reviewDailyReport = (
    reportId: string,
    decision: 'APPROVED' | 'REJECTED',
    comments: string,
    signatureDataUrl: string
  ) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' WIB';
    const stampPrefix = currentUser.role === 'ADMINISTRATOR'
      ? 'ADMIN'
      : (currentUser.badgeNumber.replace(/[^A-Za-z0-9]/g, '').slice(-4).toUpperCase() || 'MGR1');
    const stampId = `DSLNG-CERT-${decision}-${Date.now().toString().substring(5, 13)}-${stampPrefix}`;
    const roleTitle = currentUser.role === 'ADMINISTRATOR' ? 'IT Administrator (Super Admin)' : 'ICT Operations Manager';

    setReports(prev =>
      prev.map(r => {
        if (r.id !== reportId) return r;

        const auditEntry = {
          timestamp: now,
          actorName: currentUser.name,
          actorRole: roleTitle,
          actorBadge: currentUser.badgeNumber,
          action: decision === 'APPROVED' ? 'SUPERIOR_APPROVED' : 'SUPERIOR_REJECTED',
          details: `Approval review completed by ${roleTitle} with decision: ${decision}. Digital Signature stamp: ${stampId}. Feedback: "${comments.substring(0, 80)}${comments.length > 80 ? '...' : ''}"`,
        };

        return {
          ...r,
          status: decision === 'APPROVED' ? 'APPROVED' : 'REJECTED',
          superiorReview: {
            managerId: currentUser.id,
            managerName: currentUser.name,
            reviewedAt: now,
            decision,
            comments,
            signatureDataUrl,
            digitalStampId: stampId,
          },
          auditTrail: [...r.auditTrail, auditEntry],
        };
      })
    );

    showToast(
      decision === 'APPROVED'
        ? `Report ${reportId} officially APPROVED with E-Signature stamp ${stampId}.`
        : `Report ${reportId} REJECTED with revision feedback and signed audit stamp.`,
      decision === 'APPROVED' ? 'success' : 'warning'
    );
  };

  const applyDutyOverride = (engineerId: string, reason: string) => {
    const engineer = teamMembers.find(m => m.id === engineerId);
    if (!engineer) return;

    setDutyOverrideId(engineerId);
    setOverrideReason(reason);

    showToast(
      `Roster Duty Override active: ${engineer.name} has been designated as the active Duty Engineer (${reason}).`,
      'info'
    );
  };

  const resetAllData = () => {
    setReports(SEED_PAST_REPORTS);
    setDutyOverrideId(null);
    setOverrideReason('');
    setDispatchedReminderDates({});
    setManualSchedules({});
    setTeamMembers(INITIAL_TEAM_MEMBERS);
    setServers([]);
    setMeetingRooms([]);
    setCompanyAssets([]);

    setCurrentUser(INITIAL_TEAM_MEMBERS[0]);
    localStorage.removeItem(STORAGE_KEY_REPORTS);
    localStorage.removeItem(STORAGE_KEY_OVERRIDE);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_REMINDERS);
    localStorage.removeItem(STORAGE_KEY_MANUAL_SCHEDULES);
    localStorage.removeItem(STORAGE_KEY_TEAM_MEMBERS);
    localStorage.removeItem(STORAGE_KEY_SERVERS);
    localStorage.removeItem(STORAGE_KEY_ROOMS);
    localStorage.removeItem(STORAGE_KEY_ASSETS);
    showToast('Seluruh data helpdesk, shift schedule, meeting rooms, servers, dan laporan telah direset ke status awal.', 'info');
  };

  const isCurrentEligibleForDate = (date: string) => {
    return isUserEligibleToReport(currentUser, date, manualSchedules, dutyOverrideId, teamMembers);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        teamMembers,
        addHelpdeskEngineer,
        updateHelpdeskEngineer,
        deleteHelpdeskEngineer,
        addSuperiorAccount,
        updateTeamMember,
        deleteTeamMember,
        servers,
        addServer,
        updateServer,
        deleteServer,
        meetingRooms,
        addMeetingRoom,
        updateMeetingRoom,
        deleteMeetingRoom,
        companyAssets,
        addCompanyAsset,
        updateCompanyAsset,
        deleteCompanyAsset,
        reports,
        selectedDate,
        setSelectedDate,
        dutyOverrideId,
        setDutyOverrideId,
        overrideReason,
        setOverrideReason,
        manualSchedules,
        saveDaySchedule,
        batchApplySchedule,
        missingReminders,
        dispatchedReminderDates,
        dispatchReminder,
        dispatchAllReminders,
        activeModal,
        openCreateModal,
        openViewModal,
        openRosterModal,
        openRemindersModal,
        openManageEngineersModal,
        closeModal,
        submitDailyReport,
        reviewDailyReport,
        applyDutyOverride,
        resetAllData,
        toastMessage,
        showToast,
        hideToast,
        isCurrentEligibleForDate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
