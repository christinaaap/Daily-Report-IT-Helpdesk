import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TeamMember } from '../types';
import {
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  KeyRound,
  Users,
  Award,
  Radio,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { teamMembers, login, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'sso' | 'roles'>('sso');
  const [identifier, setIdentifier] = useState('admin.ict@donggi-senoro.com');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time clock for WITA (Site Uso) and WIB (Jakarta)
  const [currentTimeWITA, setCurrentTimeWITA] = useState('');
  const [currentTimeWIB, setCurrentTimeWIB] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // WITA: UTC+8
      const witaStr = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Makassar',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now);

      // WIB: UTC+7
      const wibStr = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now);

      setCurrentTimeWITA(witaStr + ' WITA');
      setCurrentTimeWIB(wibStr + ' WIB');
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSSOSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!identifier.trim()) {
      setErrorMsg('Silakan masukkan email perusahaan atau Badge NIK.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = login(identifier.trim(), password);
      setIsSubmitting(false);
      if (!result.success) {
        setErrorMsg(result.message);
      }
    }, 400);
  };

  const handleDirectRoleLogin = (member: TeamMember) => {
    setErrorMsg(null);
    login(member);
  };

  const adminUser = teamMembers.find(m => m.role === 'ADMINISTRATOR');
  const superiorUsers = teamMembers.filter(m => m.role === 'ICT_MANAGER');
  const helpdeskUsers = teamMembers.filter(m => m.role === 'HELPDESK_ENGINEER' || m.role === 'DUTY_ENGINEER');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Corporate Top Security Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 sm:px-8 py-3 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-emerald-400 font-semibold tracking-wider text-[11px]">
                SECURE GATEWAY ACTIVE
              </span>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 font-mono text-[11px]">ISO/IEC 27001 ISMS &amp; NIST CSF Compliant</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1 rounded border border-slate-700/60">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Site Uso: <strong className="text-slate-200">{currentTimeWITA || '06:00:00 WITA'}</strong></span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1 rounded border border-slate-700/60">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>HO Jakarta: <strong className="text-slate-200">{currentTimeWIB || '05:00:00 WIB'}</strong></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Login Body */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10 my-4">
        <div className="w-full max-w-xl space-y-6">
          {/* Corporate Brand Identity */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-700 text-white shadow-xl shadow-blue-900/30 border border-blue-400/30 ring-4 ring-blue-500/10 mb-1">
              <Building2 className="w-9 h-9" />
            </div>

            <div>
              <div className="inline-block px-3 py-0.5 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 text-[11px] font-mono font-bold tracking-wider uppercase mb-1">
                PT DONGGI-SENORO LNG
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                ICT Operations &amp; Daily Reporting
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
                Portal Pelaporan Operasional, Verifikasi Fisik VTC, &amp; Otorisasi Digital E-Signature Kepatuhan ISO 27001
              </p>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('sso');
                  setErrorMsg(null);
                }}
                className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'sso'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Single Sign-On (SSO)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('roles');
                  setErrorMsg(null);
                }}
                className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'roles'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Pilih Akun Terdaftar</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Tab 1: Single Sign-On (SSO) Form */}
            {activeTab === 'sso' && (
              <form onSubmit={handleSSOSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Perusahaan atau Badge NIK
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      placeholder="contoh: admin.ict@donggi-senoro.com atau DSLNG-ADM-001"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Kata Sandi / PIN Operasional
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">Demo: sembarang kata sandi</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi..."
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span>Ingat sesi di peramban ini</span>
                  </label>

                  <span className="text-[11px] text-blue-400 font-medium">Site Uso / HO Jkt SSO</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isSubmitting ? 'Mengautentikasi ke Active Directory...' : 'Masuk ke Sistem Operasional'}</span>
                </button>

                {/* Quick Hint Box */}
                <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-400" />
                    <span>Petunjuk Masuk Akun:</span>
                  </div>
                  <p>
                    Anda dapat masuk menggunakan akun default Administrator: <code className="text-blue-300 font-mono">admin.ict@donggi-senoro.com</code>, atau berpindah ke tab <strong>"Pilih Akun Terdaftar"</strong> untuk memilih akun dengan satu klik.
                  </p>
                </div>
              </form>
            )}

            {/* Tab 2: Pilih Akun Terdaftar (One-click role portal) */}
            {activeTab === 'roles' && (
              <div className="space-y-4">
                <div className="text-xs text-slate-400 mb-2">
                  Pilih akun di bawah untuk langsung menguji wewenang peran masing-masing:
                </div>

                {/* 1. Super Admin Account */}
                {adminUser && (
                  <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-950/20 hover:bg-purple-950/40 transition-colors flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-purple-200">{adminUser.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Super Admin
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {adminUser.email} · {adminUser.location}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Akses Penuh: Manajemen Akun, Kalender, Fleet, &amp; Audit Trail
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDirectRoleLogin(adminUser)}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shrink-0 flex items-center gap-1"
                    >
                      <span>Masuk</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* 2. Superior Accounts */}
                {superiorUsers.length > 0 ? (
                  <div className="space-y-2">
                    {superiorUsers.map(user => (
                      <div
                        key={user.id}
                        className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 hover:bg-amber-950/40 transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-amber-200">{user.name}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Superior
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {user.badgeNumber} · {user.location}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Wewenang: Penelaahan Laporan, Tanda Tangan E-Signature, &amp; Audit Trail
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDirectRoleLogin(user)}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-md shrink-0 flex items-center gap-1"
                        >
                          <span>Masuk</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-300 block">Akun Superior: Belum Dibuat</span>
                      <span className="text-[10px] text-slate-500">
                        Masuk sebagai Super Admin untuk membuat akun Superior / ICT Manager.
                      </span>
                    </div>
                  </div>
                )}

                {/* 3. Helpdesk Engineer Accounts */}
                {helpdeskUsers.length > 0 ? (
                  <div className="space-y-2">
                    {helpdeskUsers.map(user => (
                      <div
                        key={user.id}
                        className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-950/20 hover:bg-blue-950/40 transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-blue-200">{user.name}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              Helpdesk
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {user.badgeNumber} · {user.location} ({user.shift})
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Wewenang: Input Tiket, Cek Fasilitas VTC, Penguncian Laporan Harian
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDirectRoleLogin(user)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shrink-0 flex items-center gap-1"
                        >
                          <span>Masuk</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-300 block">Akun Helpdesk Engineer: Belum Dibuat</span>
                      <span className="text-[10px] text-slate-500">
                        Masuk sebagai Super Admin untuk mendaftarkan akun Helpdesk Site Uso atau HO Jakarta.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Security & Cryptographic Compliance Banner */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 text-center space-y-1 text-slate-400 text-xs">
            <div className="flex items-center justify-center gap-1.5 text-slate-300 font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Akses Terenkripsi &amp; Terotentikasi Penuh</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed max-w-md mx-auto">
              Sistem ini dilindungi dengan enkripsi SHA-256. Setiap tindakan login, pengisian laporan, dan otorisasi dicatat secara otomatis dalam ISO 27001 Cryptographic Audit Trail.
            </p>
          </div>
        </div>
      </main>

      {/* Corporate Operations Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 sm:px-8 py-4 relative z-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-semibold text-slate-400">PT Donggi-Senoro LNG</span> · Information &amp; Communication Technology (ICT) Department
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Plant Site: Desa Uso, Kec. Batui, Kab. Banggai, Sulawesi Tengah · Helpdesk Ext: 8110
          </div>
        </div>
      </footer>
    </div>
  );
};
