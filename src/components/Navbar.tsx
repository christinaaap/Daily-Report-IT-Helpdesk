import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronDown, Bell, Shield, Award } from 'lucide-react';

interface NavbarProps {
  activeTab: 'calendar' | 'fleet' | 'audit';
  setActiveTab: (tab: 'calendar' | 'fleet' | 'audit') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const {
    currentUser,
    setCurrentUser,
    teamMembers,
    openRemindersModal,
    openManageEngineersModal,
    missingReminders,
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const hasMissingReports = missingReminders.length > 0;
  const isAdmin = currentUser.role === 'ADMINISTRATOR';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Brand Wordmark (Single text element per Top Bar Contract) */}
          <a
            href="/"
            onClick={e => {
              e.preventDefault();
              setActiveTab('calendar');
            }}
            className="text-base sm:text-lg font-bold tracking-tight text-slate-900 shrink-0 hover:text-blue-700 transition-colors"
          >
            PT.Donggi Senoro LNG
          </a>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap py-1 ${
                activeTab === 'calendar' ? 'text-blue-700 font-semibold border-b-2 border-blue-700' : ''
              }`}
            >
              Calendar Dashboard
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('fleet')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap py-1 ${
                activeTab === 'fleet' ? 'text-blue-700 font-semibold border-b-2 border-blue-700' : ''
              }`}
            >
              Infrastructure Fleet
            </button>
            {/* Audit Trail: Hanya dapat diakses oleh Superior & Administrator */}
            {(currentUser.role === 'ADMINISTRATOR' || currentUser.role === 'ICT_MANAGER') && (
              <button
                type="button"
                onClick={() => setActiveTab('audit')}
                className={`hover:text-slate-900 transition-colors whitespace-nowrap py-1 ${
                  activeTab === 'audit' ? 'text-blue-700 font-semibold border-b-2 border-blue-700' : ''
                }`}
              >
                Audit Trail
              </button>
            )}
          </nav>

          {/* Zone 3: Primary Actions & User Identity Roster Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Automated Reminder Notification Bell (PRD & User Request) */}
            <button
              type="button"
              onClick={openRemindersModal}
              title={
                hasMissingReports
                  ? `${missingReminders.length} Laporan Belum Diisi - Buka Pengingat`
                  : 'Seluruh Laporan Terisi Lengkap'
              }
              className={`relative p-2 rounded-lg border transition-colors flex items-center justify-center ${
                hasMissingReports
                  ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Bell className={`w-4 h-4 ${hasMissingReports ? 'animate-bounce text-amber-600' : ''}`} />
              {hasMissingReports && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white font-mono text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {missingReminders.length}
                </span>
              )}
            </button>

            {/* Administrator: Kelola Akun Helpdesk & Superior Button */}
            {isAdmin && (
              <button
                type="button"
                onClick={openManageEngineersModal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors shadow-2xs"
              >
                <Shield className="w-3.5 h-3.5 text-purple-700" />
                <span>Kelola Akun (Helpdesk &amp; Superior)</span>
              </button>
            )}

            {/* User Profile & Role Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserDropdown(prev => !prev)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-colors text-left ${
                  currentUser.role === 'ADMINISTRATOR'
                    ? 'bg-purple-50/80 hover:bg-purple-100 border-purple-200'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                    currentUser.role === 'ADMINISTRATOR'
                      ? 'bg-purple-700 text-white'
                      : 'bg-blue-100 border border-blue-200 text-blue-800'
                  }`}
                >
                  {currentUser.role === 'ADMINISTRATOR' ? 'A' : currentUser.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[140px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <span>{currentUser.location}</span>
                    <span>·</span>
                    <span
                      className={
                        currentUser.role === 'ADMINISTRATOR'
                          ? 'text-purple-700 font-bold'
                          : currentUser.role === 'DUTY_ENGINEER'
                          ? 'text-blue-700 font-medium'
                          : currentUser.role === 'ICT_MANAGER'
                          ? 'text-amber-700 font-medium'
                          : 'text-slate-500'
                      }
                    >
                      {currentUser.role === 'ADMINISTRATOR'
                        ? 'Super Admin'
                        : currentUser.role === 'DUTY_ENGINEER'
                        ? 'Duty Eng'
                        : currentUser.role === 'ICT_MANAGER'
                        ? 'Superior'
                        : 'Helpdesk'}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* User switcher dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-84 rounded-xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Active Directory / SSO Switcher
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pilih akun untuk menguji wewenang Helpdesk, Superior, atau Administrator.
                    </p>
                  </div>

                  <div className="space-y-1 max-h-80 overflow-y-auto">
                    {teamMembers.map(member => {
                      const isCurrent = member.id === currentUser.id;
                      const isMemberAdmin = member.role === 'ADMINISTRATOR';
                      return (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => {
                            setCurrentUser(member);
                            setShowUserDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-start justify-between ${
                            isCurrent
                              ? isMemberAdmin
                                ? 'bg-purple-50 border border-purple-300 text-purple-900'
                                : 'bg-blue-50 border border-blue-200 text-blue-900'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="font-semibold flex items-center gap-1.5 text-slate-900">
                              <span>{member.name}</span>
                              {isMemberAdmin && (
                                <span className="text-[10px] bg-purple-100 text-purple-800 border border-purple-300 px-1.5 py-0.2 rounded font-mono font-bold">
                                  Akses Keseluruhan
                                </span>
                              )}
                              {member.role === 'ICT_MANAGER' && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono">
                                  Superior
                                </span>
                              )}
                              {member.role === 'HELPDESK_ENGINEER' && (
                                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-mono">
                                  Helpdesk
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                              {member.badgeNumber} · {member.location}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {isMemberAdmin ? 'Full Access Super Admin (All Permissions)' : member.shift}
                            </div>
                          </div>
                          {isCurrent && (
                            <span className={isMemberAdmin ? 'text-purple-700 font-bold' : 'text-blue-700 font-semibold'}>
                              Active
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {teamMembers.filter(m => m.role === 'ICT_MANAGER').length === 0 && (
                    <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-900 text-xs mt-1 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-[11px] text-amber-950">
                        <Award className="w-3.5 h-3.5 text-amber-700" />
                        <span>Akun Superior: Belum Dibuat</span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-tight">
                        Data akun superior sebelumnya telah dihapus. Administrator IT dapat membuat akun Superior melalui menu Kelola Akun.
                      </p>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="pt-2 mt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserDropdown(false);
                          openManageEngineersModal();
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900 hover:bg-purple-50 rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        + Tambah / Kelola Akun (Helpdesk &amp; Superior)
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
