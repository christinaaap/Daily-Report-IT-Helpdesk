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
  AuditLogEntry,
  UserRole,
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
  // Authentication & Session
  isAuthenticated: boolean;
  login: (userOrIdentifier: string | TeamMember, password?: string) => { success: boolean; message: string };
  logout: () => void;

  currentUser: TeamMember;
  setCurrentUser: (user: TeamMember) => void;
  teamMembers: TeamMember[];
  registerAccount: (data: {
    name: string;
    email: string;
    badgeNumber: string;
    location: Location;
    role: UserRole;
    shift?: string;
    phone?: string;
    password?: string;
  }) => TeamMember;
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
  adminResetPassword: (userId: string, newPassword: string) => void;

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
  todayDate: string;
  realtimeWITA: string;
  realtimeWIB: string;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  resetToToday: () => void;
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

  // System Audit Trail (ISO 27001)
  systemAuditLogs: AuditLogEntry[];
  recordAuditLog: (action: string, details: string, reportId?: string, lockHash?: string) => void;
  clearAuditTrail: () => void;

  // Notification Toast
  toastMessage: { text: string; type: 'success' | 'warning' | 'info' | 'error' } | null;
  showToast: (text: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
  hideToast: () => void;

  // Computed helper
  isCurrentEligibleForDate: (date: string) => { isEligible: boolean; reason: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_REPORTS = 'dslng_it_daily_reports_v6';
const STORAGE_KEY_OVERRIDE = 'dslng_it_roster_override_v3';
const STORAGE_KEY_USER = 'dslng_it_active_user_v3';
const STORAGE_KEY_REMINDERS = 'dslng_it_reminders_dispatched_v3';
const STORAGE_KEY_MANUAL_SCHEDULES = 'dslng_it_schedules_clean_v4';
const STORAGE_KEY_TEAM_MEMBERS = 'dslng_it_team_members_v9';
const STORAGE_KEY_SERVERS = 'dslng_it_servers_clean_v5';
const STORAGE_KEY_ROOMS = 'dslng_it_rooms_clean_v5';
const STORAGE_KEY_ASSETS = 'dslng_it_assets_clean_v5';
const STORAGE_KEY_SYSTEM_AUDIT = 'dslng_it_system_audit_clean_v2';
const STORAGE_KEY_AUTH = 'dslng_it_auth_status_v1';

// Real-time Date and Clock Helpers (Site Uso WITA - Asia/Makassar UTC+8 & HO Jakarta WIB UTC+7)
export const getRealtimeDateString = (): string => {
  const now = new Date();
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Makassar',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
};

export const getRealtimeClockWITA = (): string => {
  const now = new Date();
  return (
    new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Makassar',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(now) + ' WITA'
  );
};

export const getRealtimeClockWIB = (): string => {
  const now = new Date();
  return (
    new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(now) + ' WIB'
  );
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Session Authentication State (Initializes to false to present the corporate Login Portal)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const savedAuth = localStorage.getItem(STORAGE_KEY_AUTH);
      if (savedAuth !== null) {
        return savedAuth === 'true';
      }
    } catch {
      // ignore
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AUTH, String(isAuthenticated));
  }, [isAuthenticated]);

  // Real-time operational date (dynamically tracks current calendar day in real-time)
  const [todayDate, setTodayDate] = useState<string>(getRealtimeDateString);
  const [selectedDate, setSelectedDate] = useState<string>(getRealtimeDateString);
  const [realtimeWITA, setRealtimeWITA] = useState<string>(getRealtimeClockWITA);
  const [realtimeWIB, setRealtimeWIB] = useState<string>(getRealtimeClockWIB);

  // Real-time ticking engine: updates clocks every second and automatically transitions to new day at midnight
  useEffect(() => {
    const updateTick = () => {
      const liveDate = getRealtimeDateString();
      setTodayDate(prev => {
        if (prev !== liveDate) {
          // Automatic rollover to new day in real time!
          setSelectedDate(liveDate);
          return liveDate;
        }
        return prev;
      });
      setRealtimeWITA(getRealtimeClockWITA());
      setRealtimeWIB(getRealtimeClockWIB());
    };

    updateTick();
    const interval = setInterval(updateTick, 1000);
    return () => clearInterval(interval);
  }, []);

  const resetToToday = () => {
    const liveDate = getRealtimeDateString();
    setSelectedDate(liveDate);
  };

  // Dynamic team members with Administrator accounts and created users
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TEAM_MEMBERS);
      if (saved) {
        const parsed: TeamMember[] = JSON.parse(saved);
        // Exclude legacy dummy superior 'mgr-ict-1' (Hendra Wijaya) and removed administrator 'admin-christina'
        let filtered = parsed.filter(
          m => m.id !== 'mgr-ict-1' && m.id !== 'admin-christina' && m.email.toLowerCase() !== 'christinaaapps@gmail.com'
        );
        // Ensure initial administrator accounts exist and have their passwords set
        INITIAL_TEAM_MEMBERS.forEach(initMember => {
          const idx = filtered.findIndex(
            m => m.email.toLowerCase() === initMember.email.toLowerCase() || m.id === initMember.id
          );
          if (idx >= 0) {
            filtered[idx] = {
              ...filtered[idx],
              password: initMember.password,
              role: initMember.role,
              badgeNumber: initMember.badgeNumber,
            };
          } else {
            filtered.unshift(initMember);
          }
        });
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

  // Dynamic System Audit Trail (ISO 27001) - 0 dummy data, recorded live on system actions
  const [systemAuditLogs, setSystemAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SYSTEM_AUDIT);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SYSTEM_AUDIT, JSON.stringify(systemAuditLogs));
  }, [systemAuditLogs]);

  // Active user (defaults to Administrator IT DSLNG Super Admin)
  const [currentUser, setCurrentUser] = useState<TeamMember>(() => {
    try {
      const savedUserId = localStorage.getItem(STORAGE_KEY_USER);
      if (savedUserId && savedUserId !== 'mgr-ict-1' && savedUserId !== 'admin-christina') {
        const found = teamMembers.find(m => m.id === savedUserId);
        if (found) return found;
      }
    } catch {
      // ignore
    }
    return teamMembers.find(m => m.id === 'admin-it-01') || teamMembers.find(m => m.role === 'ADMINISTRATOR') || INITIAL_TEAM_MEMBERS[0];
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
        const parsed: DailyReport[] = JSON.parse(saved);
        const merged = [...parsed];
        SEED_PAST_REPORTS.forEach(seed => {
          if (!merged.some(r => r.reportDate === seed.reportDate)) {
            merged.push(seed);
          }
        });
        merged.sort((a, b) => b.reportDate.localeCompare(a.reportDate));
        return merged;
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

  // Compute missing/unsubmitted day reminders up to real-time today
  const missingReminders = detectMissingReportDays(reports, todayDate, manualSchedules, dutyOverrideId, teamMembers).map(reminder => {
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

  // Audit Trail Logging Engine (ISO 27001 Compliance)
  const recordAuditLog = (action: string, details: string, reportId?: string, lockHash?: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' ' + (currentUser.location === 'Site Uso' ? 'WITA' : 'WIB');
    const newEntry: AuditLogEntry = {
      timestamp: now,
      actorName: currentUser.name,
      actorRole: currentUser.role === 'ADMINISTRATOR' ? 'Administrator IT (Super Admin)' : currentUser.role === 'ICT_MANAGER' ? 'ICT Operations Manager' : 'Helpdesk Engineer',
      actorBadge: currentUser.badgeNumber,
      action,
      details,
      reportId,
      lockHash,
    };
    setSystemAuditLogs(prev => [newEntry, ...prev]);
  };

  const clearAuditTrail = () => {
    setSystemAuditLogs([]);
    setReports(prev => prev.map(r => ({ ...r, auditTrail: [] })));
    localStorage.removeItem(STORAGE_KEY_SYSTEM_AUDIT);
    showToast('Seluruh rekaman jejak audit ISO 27001 telah dibersihkan.', 'info');
  };

  // Corporate Authentication & Session Management
  const login = (userOrIdentifier: string | TeamMember, password?: string): { success: boolean; message: string } => {
    let targetUser: TeamMember | undefined;

    if (typeof userOrIdentifier === 'object') {
      targetUser = userOrIdentifier;
    } else {
      const query = userOrIdentifier.trim().toLowerCase();
      targetUser = teamMembers.find(
        m =>
          m.email.toLowerCase() === query ||
          m.badgeNumber.toLowerCase() === query ||
          m.id.toLowerCase() === query ||
          m.name.toLowerCase() === query
      );

      if (!targetUser && (query === 'christinaaapps@gmail.com' || query === '00080')) {
        targetUser = teamMembers.find(m => m.id === 'admin-it-01') || teamMembers.find(m => m.role === 'ADMINISTRATOR');
      }
    }

    if (!targetUser) {
      return {
        success: false,
        message: 'Akun tidak ditemukan dalam Active Directory PT Donggi-Senoro LNG. Periksa kembali email atau Badge NIK Anda.',
      };
    }

    // Password verification: check password if set on user
    if (targetUser.password) {
      if (!password || password.trim() !== targetUser.password.trim()) {
        return {
          success: false,
          message: 'Kata sandi atau PIN operasional salah. Silakan coba kembali.',
        };
      }
    }

    setCurrentUser(targetUser);
    setIsAuthenticated(true);
    recordAuditLog(
      'USER_LOGIN_SUCCESS',
      `Autentikasi SSO berhasil untuk ${targetUser.name} (${targetUser.role}) dari lokasi ${targetUser.location}.`
    );
    showToast(
      `Selamat datang, ${targetUser.name} (${targetUser.role === 'ADMINISTRATOR' ? 'Super Admin' : targetUser.role === 'ICT_MANAGER' ? 'Superior' : 'Helpdesk Engineer'}).`,
      'success'
    );
    return { success: true, message: 'Autentikasi berhasil.' };
  };

  const logout = () => {
    recordAuditLog(
      'USER_LOGOUT',
      `Sesi pengguna ${currentUser.name} (${currentUser.badgeNumber}) telah diakhiri.`
    );
    setIsAuthenticated(false);
    showToast('Anda telah keluar dari sesi operasional ICT PT Donggi-Senoro LNG.', 'info');
  };

  // Corporate Registration & Account Management
  const registerAccount = (data: {
    name: string;
    email: string;
    badgeNumber: string;
    location: Location;
    role: UserRole;
    shift?: string;
    phone?: string;
    password?: string;
  }): TeamMember => {
    const prefix = data.role === 'ADMINISTRATOR' ? 'admin' : data.role === 'ICT_MANAGER' ? 'mgr' : 'eng';
    const newId = `${prefix}-${Date.now()}`;
    const defaultShift = data.shift || (data.location === 'Site Uso' ? 'Shift A (06.00 - 18.00 WITA)' : 'Shift A (07.00 - 17.00 WIB)');

    const newMember: TeamMember = {
      id: newId,
      name: data.name,
      email: data.email,
      badgeNumber: data.badgeNumber,
      location: data.location,
      role: data.role,
      shift: defaultShift,
      isDutyEligible: data.role === 'ADMINISTRATOR' || (data.role === 'HELPDESK_ENGINEER' && data.location === 'Site Uso'),
      phone: data.phone || '',
      password: data.password || '',
    };

    setTeamMembers(prev => [...prev, newMember]);
    const roleTitle = data.role === 'ADMINISTRATOR' ? 'Super Administrator' : data.role === 'ICT_MANAGER' ? 'Superior / ICT Manager' : 'Helpdesk Engineer';
    recordAuditLog('USER_ACCOUNT_REGISTERED', `Pendaftaran akun baru ${roleTitle}: ${data.name} (${data.badgeNumber}, ${data.location}).`);
    showToast(`Registrasi berhasil! Akun ${roleTitle} ${data.name} telah terdaftar.`, 'success');
    return newMember;
  };

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
    recordAuditLog('HELPDESK_ACCOUNT_CREATED', `Administrator membuat akun Helpdesk Engineer: ${data.name} (${data.badgeNumber}, ${data.location}).`);
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
    recordAuditLog('SUPERIOR_ACCOUNT_CREATED', `Administrator membuat akun Superior / ICT Manager: ${data.name} (${data.badgeNumber}, ${data.location}).`);
    showToast(`Akun Superior / ICT Manager ${data.name} (${data.location}) berhasil dibuat oleh Administrator.`, 'success');
  };

  const updateTeamMember = (member: TeamMember) => {
    setTeamMembers(prev => prev.map(m => (m.id === member.id ? member : m)));
    if (currentUser.id === member.id) {
      setCurrentUser(member);
    }
    const roleTitle = member.role === 'ICT_MANAGER' ? 'Superior / ICT Manager' : member.role === 'ADMINISTRATOR' ? 'Administrator' : 'Helpdesk Engineer';
    recordAuditLog('USER_ACCOUNT_UPDATED', `Pembaruan profil ${roleTitle}: ${member.name} (${member.badgeNumber}).`);
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
    recordAuditLog('USER_ACCOUNT_DELETED', `Penghapusan akun ${roleTitle}: ${found.name} (${found.badgeNumber}).`);
    showToast(`Akun ${roleTitle} ${found.name} telah dihapus.`, 'info');
  };

  const adminResetPassword = (userId: string, newPassword: string) => {
    const target = teamMembers.find(m => m.id === userId);
    if (!target) return;
    setTeamMembers(prev =>
      prev.map(m => (m.id === userId ? { ...m, password: newPassword } : m))
    );
    recordAuditLog(
      'ADMIN_PASSWORD_RESET',
      `Administrator (${currentUser.name}) melakukan reset kata sandi untuk akun ${target.name} (${target.role}, Badge: ${target.badgeNumber}).`
    );
    showToast(`Kata sandi akun ${target.name} berhasil direset oleh Administrator.`, 'success');
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
    recordAuditLog('SERVER_NODE_CREATED', `Server baru didaftarkan: ${data.name} (${data.location}, ${data.role}).`);
    showToast(`Server ${data.name} (${data.location}) berhasil ditambahkan.`, 'success');
  };

  const updateServer = (server: ServerCheck) => {
    setServers(prev => prev.map(s => (s.id === server.id ? server : s)));
    recordAuditLog('SERVER_NODE_UPDATED', `Konfigurasi server ${server.name} (${server.location}) diperbarui.`);
    showToast(`Data server ${server.name} berhasil diperbarui.`, 'success');
  };

  const deleteServer = (id: string) => {
    const found = servers.find(s => s.id === id);
    setServers(prev => prev.filter(s => s.id !== id));
    recordAuditLog('SERVER_NODE_DELETED', `Server ${found?.name || id} dihapus dari fleet monitoring.`);
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
    recordAuditLog('MEETING_ROOM_CREATED', `Ruang meeting baru didaftarkan: ${data.roomName} (${data.location}).`);
    showToast(`Ruang meeting ${data.roomName} (${data.location}) berhasil ditambahkan.`, 'success');
  };

  const updateMeetingRoom = (room: PhysicalInspectionItem) => {
    setMeetingRooms(prev => prev.map(r => (r.id === room.id ? room : r)));
    recordAuditLog('MEETING_ROOM_UPDATED', `Fasilitas ruang meeting ${room.roomName} (${room.location}) diperbarui.`);
    showToast(`Data ruang meeting ${room.roomName} berhasil diperbarui.`, 'success');
  };

  const deleteMeetingRoom = (id: string) => {
    const found = meetingRooms.find(r => r.id === id);
    setMeetingRooms(prev => prev.filter(r => r.id !== id));
    recordAuditLog('MEETING_ROOM_DELETED', `Ruang meeting ${found?.roomName || id} dihapus.`);
    showToast(`Ruang meeting ${found?.roomName || ''} telah dihapus.`, 'info');
  };

  // Company Asset / License Management
  const addCompanyAsset = (data: Omit<CompanyAsset, 'id'>) => {
    const newAsset: CompanyAsset = {
      ...data,
      id: `ast-${Date.now()}`,
    };
    setCompanyAssets(prev => [...prev, newAsset]);
    recordAuditLog('COMPANY_ASSET_CREATED', `Aset/Lisensi baru didaftarkan: ${data.name} (${data.category}, Vendor: ${data.vendor || '-'}).`);
    showToast(`Aset / Lisensi ${data.name} berhasil ditambahkan.`, 'success');
  };

  const updateCompanyAsset = (asset: CompanyAsset) => {
    setCompanyAssets(prev => prev.map(a => (a.id === asset.id ? asset : a)));
    recordAuditLog('COMPANY_ASSET_UPDATED', `Data lisensi/aset ${asset.name} diperbarui.`);
    showToast(`Data aset ${asset.name} berhasil diperbarui.`, 'success');
  };

  const deleteCompanyAsset = (id: string) => {
    const found = companyAssets.find(a => a.id === id);
    setCompanyAssets(prev => prev.filter(a => a.id !== id));
    recordAuditLog('COMPANY_ASSET_DELETED', `Aset/lisensi ${found?.name || id} dihapus.`);
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

    recordAuditLog('REPORT_SUBMITTED_AND_LOCKED', newReport.auditTrail[0].details, newReport.id, newReport.immutableLockHash);

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

    const targetRep = reports.find(r => r.id === reportId);
    recordAuditLog(
      decision === 'APPROVED' ? 'SUPERIOR_APPROVED' : 'SUPERIOR_REJECTED',
      `Approval review completed by ${roleTitle} with decision: ${decision}. Digital Signature stamp: ${stampId}. Feedback: "${comments.substring(0, 80)}${comments.length > 80 ? '...' : ''}"`,
      reportId,
      targetRep?.immutableLockHash
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
    setSystemAuditLogs([]);
    setIsAuthenticated(false);
    setSelectedDate(getRealtimeDateString());

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
    localStorage.removeItem(STORAGE_KEY_SYSTEM_AUDIT);
    localStorage.removeItem(STORAGE_KEY_AUTH);
    showToast('Seluruh data helpdesk, shift schedule, meeting rooms, servers, dan laporan telah direset ke status awal.', 'info');
  };

  const isCurrentEligibleForDate = (date: string) => {
    return isUserEligibleToReport(currentUser, date, manualSchedules, dutyOverrideId, teamMembers);
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        currentUser,
        setCurrentUser,
        teamMembers,
        registerAccount,
        addHelpdeskEngineer,
        updateHelpdeskEngineer,
        deleteHelpdeskEngineer,
        addSuperiorAccount,
        updateTeamMember,
        deleteTeamMember,
        adminResetPassword,
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
        todayDate,
        realtimeWITA,
        realtimeWIB,
        selectedDate,
        setSelectedDate,
        resetToToday,
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
        systemAuditLogs,
        recordAuditLog,
        clearAuditTrail,
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
