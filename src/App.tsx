import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { CalendarDashboard } from './components/CalendarDashboard';
import { InfrastructureFleetView } from './components/InfrastructureFleetView';
import { AuditTrailView } from './components/AuditTrailView';
import { ReportFormModal } from './components/ReportFormModal';
import { ReportDetailModal } from './components/ReportDetailModal';
import { RosterScheduleModal } from './components/RosterScheduleModal';
import { MissingReportsModal } from './components/MissingReportsModal';
import { ManageEngineersModal } from './components/ManageEngineersModal';
import { Toast } from './components/Toast';
import { RotateCcw, Building2 } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'fleet' | 'audit'>('calendar');
  const { activeModal, selectedDate, resetAllData, currentUser } = useApp();

  const canAccessAudit = currentUser.role === 'ADMINISTRATOR' || currentUser.role === 'ICT_MANAGER';

  // Role guard: if activeTab is audit and current user is not authorized, redirect to calendar
  React.useEffect(() => {
    if (activeTab === 'audit' && !canAccessAudit) {
      setActiveTab('calendar');
    }
  }, [activeTab, canAccessAudit]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar Navigation adhering to Top Bar Contract */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'calendar' && <CalendarDashboard />}
        {activeTab === 'fleet' && <InfrastructureFleetView />}
        {activeTab === 'audit' && (canAccessAudit ? <AuditTrailView /> : <CalendarDashboard />)}
      </main>

      {/* Corporate Operations Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">PT Donggi-Senoro LNG</span>
            <span>·</span>
            <span>Information &amp; Communication Technology (ICT)</span>
            <span>·</span>
            <span className="font-mono">PRD v2.0 Operational System</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <button
              type="button"
              onClick={resetAllData}
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
              title="Reset state to default baseline"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Demo Baseline
            </button>
            <span>Site Uso (WITA) / HO Jkt (WIB)</span>
          </div>
        </div>
      </footer>

      {/* Active Modals */}
      {activeModal?.type === 'CREATE' && (
        <ReportFormModal date={activeModal.date || selectedDate} />
      )}

      {activeModal?.type === 'VIEW' && activeModal.reportId && (
        <ReportDetailModal reportId={activeModal.reportId} />
      )}

      {activeModal?.type === 'ROSTER' && <RosterScheduleModal />}

      {activeModal?.type === 'REMINDERS' && <MissingReportsModal />}

      {activeModal?.type === 'MANAGE_ENGINEERS' && <ManageEngineersModal />}

      {/* Notification Toast */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
