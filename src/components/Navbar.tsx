import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TEAM_MEMBERS } from '../data/mockData';
import { PlusCircle, CheckCircle, ChevronDown, Lock } from 'lucide-react';

interface NavbarProps {
  activeTab: 'calendar' | 'roster' | 'fleet' | 'audit';
  setActiveTab: (tab: 'calendar' | 'roster' | 'fleet' | 'audit') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const {
    currentUser,
    setCurrentUser,
    openCreateModal,
    openRosterModal,
    selectedDate,
    isCurrentEligibleForDate,
    reports,
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const eligibility = isCurrentEligibleForDate(selectedDate);
  const todaysReport = reports.find(r => r.reportDate === selectedDate);
  const isSubmittedToday = !!todaysReport;

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
              onClick={() => {
                setActiveTab('roster');
                openRosterModal();
              }}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap py-1 ${
                activeTab === 'roster' ? 'text-blue-700 font-semibold border-b-2 border-blue-700' : ''
              }`}
            >
              Shift Roster &amp; Duty
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
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap py-1 ${
                activeTab === 'audit' ? 'text-blue-700 font-semibold border-b-2 border-blue-700' : ''
              }`}
            >
              Audit Trail
            </button>
          </nav>

          {/* Zone 3: Primary Actions & User Identity Roster Switcher */}
          <div className="flex items-center gap-3">
            {/* Create Daily Report Button with strictly enforced eligibility */}
            {eligibility.isEligible && !isSubmittedToday ? (
              <button
                type="button"
                onClick={() => openCreateModal(selectedDate)}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Create Daily Report
              </button>
            ) : isSubmittedToday ? (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-700">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Today's Report Logged</span>
              </div>
            ) : (
              <div
                title={eligibility.reason}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-500 cursor-not-allowed"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Create Locked (Non-Duty)</span>
              </div>
            )}

            {/* User Profile & Role Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserDropdown(prev => !prev)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-left"
              >
                <div className="w-6 h-6 rounded bg-blue-100 border border-blue-200 flex items-center justify-center text-xs font-bold text-blue-800">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[130px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <span>{currentUser.location}</span>
                    <span>·</span>
                    <span className={currentUser.role === 'DUTY_ENGINEER' ? 'text-blue-700 font-medium' : currentUser.role === 'ICT_MANAGER' ? 'text-amber-700 font-medium' : 'text-slate-500'}>
                      {currentUser.role === 'DUTY_ENGINEER' ? 'Duty Eng' : currentUser.role === 'ICT_MANAGER' ? 'Superior' : 'Helpdesk'}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* User switcher dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Active Directory / SSO Switcher
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Switch between Helpdesk engineers and Superior to test RBAC workflows.
                    </p>
                  </div>

                  <div className="space-y-1 max-h-72 overflow-y-auto">
                    {TEAM_MEMBERS.map(member => {
                      const isCurrent = member.id === currentUser.id;
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
                              ? 'bg-blue-50 border border-blue-200 text-blue-900'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="font-semibold flex items-center gap-1.5 text-slate-900">
                              <span>{member.name}</span>
                              {member.id === 'eng-site-1' && (
                                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-mono">
                                  Current Duty
                                </span>
                              )}
                              {member.role === 'ICT_MANAGER' && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono">
                                  Superior
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                              {member.badgeNumber} · {member.location}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {member.shift}
                            </div>
                          </div>
                          {isCurrent && (
                            <span className="text-blue-700 text-xs font-semibold">Active</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
