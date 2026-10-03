import React, { createContext, useContext, useState, useEffect } from 'react';
import { DailyReport, TeamMember } from '../types';
import { TEAM_MEMBERS, SEED_PAST_REPORTS } from '../data/mockData';
import { isUserEligibleToReport, getRosterForDate } from '../utils/rosterLogic';

interface AppContextType {
  currentUser: TeamMember;
  setCurrentUser: (user: TeamMember) => void;
  reports: DailyReport[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  dutyOverrideId: string | null;
  setDutyOverrideId: (id: string | null) => void;
  overrideReason: string;
  setOverrideReason: (reason: string) => void;
  
  // Modals & Navigation
  activeModal: {
    type: 'CREATE' | 'VIEW' | 'ROSTER';
    reportId?: string;
    date?: string;
  } | null;
  openCreateModal: (date?: string) => void;
  openViewModal: (reportId: string) => void;
  openRosterModal: () => void;
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current date per mock environment
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-03');

  // Active user (default to Christina, who is the designated Duty Engineer)
  const [currentUser, setCurrentUser] = useState<TeamMember>(() => {
    try {
      const savedUserId = localStorage.getItem(STORAGE_KEY_USER);
      if (savedUserId) {
        const found = TEAM_MEMBERS.find(m => m.id === savedUserId);
        if (found) return found;
      }
    } catch {
      // ignore
    }
    return TEAM_MEMBERS.find(m => m.id === 'eng-site-1') || TEAM_MEMBERS[0];
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

  const [activeModal, setActiveModal] = useState<{
    type: 'CREATE' | 'VIEW' | 'ROSTER';
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

  const showToast = (text: string, type: 'success' | 'warning' | 'info' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(prev => (prev?.text === text ? null : prev));
    }, 6000);
  };

  const hideToast = () => setToastMessage(null);

  const openCreateModal = (date?: string) => {
    const targetDate = date || selectedDate;
    const eligibility = isUserEligibleToReport(currentUser, targetDate, dutyOverrideId);
    
    // Check if report already exists for this date
    const existing = reports.find(r => r.reportDate === targetDate);
    if (existing) {
      setActiveModal({ type: 'VIEW', reportId: existing.id, date: targetDate });
      showToast(`A daily report has already been logged for ${targetDate}. Viewing in audit mode.`, 'info');
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

  const closeModal = () => {
    setActiveModal(null);
  };

  const submitDailyReport = async (data: Omit<DailyReport, 'id' | 'status' | 'auditTrail'>): Promise<DailyReport> => {
    const targetDate = data.reportDate;
    const dateFormatted = targetDate.replace(/-/g, '');
    const reportId = `DSLNG-REP-${dateFormatted}-01`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' WITA';
    
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
          actorRole: 'Duty Engineer',
          actorBadge: currentUser.badgeNumber,
          action: 'REPORT_SUBMITTED_AND_LOCKED',
          details: `Report permanently locked and encrypted. Submitted for operational date ${targetDate}. All VTC physical inspection proofs validated.`,
        },
      ],
    };

    setReports(prev => [newReport, ...prev.filter(r => r.reportDate !== targetDate)]);
    setActiveModal({ type: 'VIEW', reportId: newReport.id, date: targetDate });

    showToast(
      `Daily report for ${targetDate} has been locked & submitted. Automated notification sent to ICT Manager Hendra Wijaya.`,
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
    const stampId = `DSLNG-CERT-${decision}-${Date.now().toString().substring(5, 13)}-HW01`;

    setReports(prev =>
      prev.map(r => {
        if (r.id !== reportId) return r;

        const auditEntry = {
          timestamp: now,
          actorName: currentUser.name,
          actorRole: 'ICT Operations Manager',
          actorBadge: currentUser.badgeNumber,
          action: decision === 'APPROVED' ? 'SUPERIOR_APPROVED' : 'SUPERIOR_REJECTED',
          details: `Superior review completed with decision: ${decision}. Digital Signature stamp: ${stampId}. Feedback: "${comments.substring(0, 80)}${comments.length > 80 ? '...' : ''}"`,
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
        ? `Report ${reportId} officially APPROVED with Superior E-Signature stamp ${stampId}.`
        : `Report ${reportId} REJECTED with revision feedback and signed audit stamp.`,
      decision === 'APPROVED' ? 'success' : 'warning'
    );
  };

  const applyDutyOverride = (engineerId: string, reason: string) => {
    const engineer = TEAM_MEMBERS.find(m => m.id === engineerId);
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
    setCurrentUser(TEAM_MEMBERS.find(m => m.id === 'eng-site-1') || TEAM_MEMBERS[0]);
    localStorage.removeItem(STORAGE_KEY_REPORTS);
    localStorage.removeItem(STORAGE_KEY_OVERRIDE);
    localStorage.removeItem(STORAGE_KEY_USER);
    showToast('Application state reset to standard baseline rosters and seed reports.', 'info');
  };

  const isCurrentEligibleForDate = (date: string) => {
    return isUserEligibleToReport(currentUser, date, dutyOverrideId);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        reports,
        selectedDate,
        setSelectedDate,
        dutyOverrideId,
        setDutyOverrideId,
        overrideReason,
        setOverrideReason,
        activeModal,
        openCreateModal,
        openViewModal,
        openRosterModal,
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
