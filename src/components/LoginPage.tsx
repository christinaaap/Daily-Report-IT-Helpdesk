import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Location } from '../types';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  AlertCircle,
  Building2,
  Clock,
  Phone,
  Briefcase,
  Award,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { teamMembers, login, registerAccount } = useApp();

  // Active Tab: 'login' or 'register' (sebelahan)
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // --- Login State ---
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // --- Register State ---
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regBadge, setRegBadge] = useState('');
  // Role administrator tidak ditampilkan di register - hanya Helpdesk atau Superior
  const [regRole, setRegRole] = useState<'HELPDESK_ENGINEER' | 'ICT_MANAGER'>('HELPDESK_ENGINEER');
  const [regLocation, setRegLocation] = useState<Location>('Site Uso');
  const [regShift, setRegShift] = useState('Shift A (06.00 - 18.00 WITA)');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

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

  // Update default shift when location changes
  useEffect(() => {
    if (regLocation === 'Site Uso') {
      setRegShift('Shift A (06.00 - 18.00 WITA)');
    } else {
      setRegShift('Shift Normal (07.00 - 17.00 WIB)');
    }
  }, [regLocation]);

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginIdentifier.trim()) {
      setLoginError('Silakan masukkan email perusahaan atau Badge NIK.');
      return;
    }

    if (!loginPassword.trim()) {
      setLoginError('Silakan masukkan kata sandi Anda.');
      return;
    }

    setIsLoggingIn(true);
    setTimeout(() => {
      const result = login(loginIdentifier.trim(), loginPassword.trim());
      setIsLoggingIn(false);
      if (!result.success) {
        setLoginError(result.message);
      }
    }, 350);
  };

  // Handle Register (khusus role Helpdesk & Superior)
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim()) {
      setRegError('Nama lengkap wajib diisi.');
      return;
    }
    if (!regEmail.trim()) {
      setRegError('Email korporat wajib diisi.');
      return;
    }
    if (!regBadge.trim()) {
      setRegError('Nomor Badge NIK wajib diisi.');
      return;
    }
    if (!/^\d{1,5}$/.test(regBadge.trim())) {
      setRegError('Nomor Badge NIK hanya boleh berisi angka saja (maksimal 5 digit, contoh: 10420).');
      return;
    }

    // Check email or badge duplication
    const emailExists = teamMembers.some(
      m => m.email.toLowerCase() === regEmail.trim().toLowerCase()
    );
    if (emailExists) {
      setRegError(`Email ${regEmail.trim()} telah terdaftar.`);
      return;
    }

    const badgeExists = teamMembers.some(
      m => m.badgeNumber.toLowerCase() === regBadge.trim().toLowerCase()
    );
    if (badgeExists) {
      setRegError(`Nomor Badge NIK ${regBadge.trim()} sudah digunakan.`);
      return;
    }

    setIsRegistering(true);
    setTimeout(() => {
      const newMember = registerAccount({
        name: regName.trim(),
        email: regEmail.trim(),
        badgeNumber: regBadge.trim(),
        location: regLocation,
        role: regRole,
        shift: regShift,
        phone: regPhone.trim(),
        password: regPassword.trim() || undefined,
      });
      setIsRegistering(false);

      // Otomatis login dengan akun yang baru didaftarkan
      login(newMember, regPassword.trim());
    }, 450);
  };

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
            <span className="text-slate-400 font-mono text-[11px]">
              ISO/IEC 27001 ISMS &amp; NIST CSF Compliant
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1 rounded border border-slate-700/60">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>
                Site Uso:{' '}
                <strong className="text-slate-200">
                  {currentTimeWITA || '06:00:00 WITA'}
                </strong>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1 rounded border border-slate-700/60">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                HO Jakarta:{' '}
                <strong className="text-slate-200">
                  {currentTimeWIB || '05:00:00 WIB'}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
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

          {/* Login & Register Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
            {/* Tab Switcher: Login & Register Sebelahan */}
            <div className="grid grid-cols-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setLoginError(null);
                  setRegError(null);
                }}
                className={`py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-blue-600 text-white shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setLoginError(null);
                  setRegError(null);
                }}
                className={`py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-blue-600 text-white shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </button>
            </div>

            {/* TAB 1: LOGIN */}
            {activeTab === 'login' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email Perusahaan atau Badge NIK
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={loginIdentifier}
                        onChange={e => setLoginIdentifier(e.target.value)}
                        placeholder="contoh: nama@donggi-senoro.com atau 00080"
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Kata Sandi / PIN Operasional
                      </label>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="Masukkan kata sandi..."
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(p => !p)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                        title={showLoginPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                    disabled={isLoggingIn}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isLoggingIn ? 'Mengautentikasi ke Active Directory...' : 'Masuk ke Sistem'}</span>
                  </button>
                </form>

                {/* Switch to Register tab prompt */}
                <div className="text-center pt-3 border-t border-slate-800 text-xs text-slate-400">
                  <span>Belum memiliki akun terdaftar? </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Daftar akun baru di tab Register
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: REGISTER */}
            {activeTab === 'register' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-blue-400" />
                    <span>Form Pendaftaran Personel ICT Baru</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Daftarkan akun baru personel Helpdesk Engineer atau Superior ke Active Directory PT Donggi-Senoro LNG.
                  </p>
                </div>

                {regError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <span>{regError}</span>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  {/* Nama Lengkap */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nama Lengkap Personel <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      placeholder="contoh: Rahmat Hidayat"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* Email & Badge NIK */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Email Korporat <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="nama@donggi-senoro.com"
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-300">
                          Nomor Badge NIK <span className="text-rose-400">*</span>
                        </label>
                        <span className="text-[10px] text-slate-500 font-mono">Angka maks. 5 digit</span>
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={5}
                        required
                        value={regBadge}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                          setRegBadge(val);
                        }}
                        placeholder="contoh: 10420"
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono tracking-wider"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Hanya angka 0-9 ({regBadge.length}/5 digit)
                      </span>
                    </div>
                  </div>

                  {/* Role / Wewenang: Khusus Helpdesk & Superior (Role Administrator tidak ditampilkan) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Peran / Hak Akses Sistem <span className="text-rose-400">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setRegRole('HELPDESK_ENGINEER')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          regRole === 'HELPDESK_ENGINEER'
                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/50'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                          <span>Helpdesk Engineer</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Entri &amp; Pelaporan Operasional, Verifikasi Fisik VTC
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRegRole('ICT_MANAGER')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          regRole === 'ICT_MANAGER'
                            ? 'bg-amber-600/20 border-amber-500 text-white shadow-sm ring-1 ring-amber-500/50'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-amber-200">
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          <span>Superior / ICT Manager</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Review, Approval &amp; Tanda Tangan Digital E-Signature
                        </div>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1.5 italic">
                      * Catatan: Hak akses Administrator (Super Admin) dikonfigurasi terpusat oleh Departemen ICT untuk memenuhi standar keamanan ISO 27001.
                    </p>
                  </div>

                  {/* Lokasi & Shift */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Lokasi Penempatan <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={regLocation}
                        onChange={e => setRegLocation(e.target.value as Location)}
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                      >
                        <option value="Site Uso">Site Uso (Plant Batui - WITA)</option>
                        <option value="HO Jakarta">HO Jakarta (Jakarta - WIB)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Shift / Jadwal Kerja
                      </label>
                      <input
                        type="text"
                        value={regShift}
                        onChange={e => setRegShift(e.target.value)}
                        placeholder="Shift A (06.00 - 18.00 WITA)"
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Nomor Kontak & Kata Sandi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Nomor Telepon / Kontak
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={regPhone}
                          onChange={e => setRegPhone(e.target.value)}
                          placeholder="+62 812 xxxx xxxx"
                          className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Kata Sandi / PIN Akun
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          placeholder="Buat kata sandi..."
                          className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-8 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(p => !p)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                          title={showRegPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isRegistering ? 'Mendaftarkan Akun ke Active Directory...' : 'Daftarkan Akun & Langsung Masuk'}</span>
                  </button>
                </form>

                {/* Back to Login prompt */}
                <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
                  <span>Sudah memiliki akun terdaftar? </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Beralih ke tab Login
                  </button>
                </div>
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
              Sistem ini dilindungi dengan enkripsi SHA-256. Setiap tindakan login, registrasi, pengisian laporan, dan otorisasi dicatat secara otomatis dalam ISO 27001 Cryptographic Audit Trail.
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
