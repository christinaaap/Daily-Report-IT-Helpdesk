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

  // Active Tab: 'login' or 'register' (side-by-side)
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

    if (!loginPassword) {
      setLoginError('Silakan masukkan kata sandi Anda.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const result = login(loginIdentifier.trim(), loginPassword);
      if (!result.success) {
        setLoginError(result.message);
      }
    } catch {
      setLoginError('Terjadi kesalahan saat otentikasi. Silakan coba kembali.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim()) {
      setRegError('Nama lengkap personel wajib diisi.');
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

    // Check duplicate email or badge
    const emailExists = teamMembers.some(
      m => m.email.toLowerCase() === regEmail.trim().toLowerCase()
    );
    if (emailExists) {
      setRegError('Email ini sudah terdaftar dalam sistem. Gunakan email lain atau login.');
      return;
    }

    const badgeExists = teamMembers.some(
      m => m.badgeNumber.toLowerCase() === regBadge.trim().toLowerCase()
    );
    if (badgeExists) {
      setRegError('Nomor Badge NIK ini sudah digunakan oleh personel lain.');
      return;
    }

    setIsRegistering(true);
    try {
      const trimmedPassword = regPassword.trim();
      const newMember = registerAccount({
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        badgeNumber: regBadge.trim(),
        role: regRole,
        location: regLocation,
        shift: regShift.trim(),
        phone: regPhone.trim(),
        password: trimmedPassword || undefined,
      });

      // Langsung login dengan akun baru
      login(newMember, trimmedPassword || undefined);
    } catch {
      setRegError('Gagal mendaftarkan akun. Silakan periksa kembali data Anda.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Enterprise Corporate Header matching Top Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                PT.Donggi Senoro LNG
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                ICT Operations
              </span>
            </div>
          </div>

          {/* Real-time Timezone Clocks */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 text-slate-700">
              <Clock className="w-3.5 h-3.5 text-blue-700" />
              <span>
                Site Uso:{' '}
                <strong className="text-slate-900 font-bold">
                  {currentTimeWITA || '06:00:00 WITA'}
                </strong>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 text-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>
                HO Jakarta:{' '}
                <strong className="text-slate-900 font-bold">
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
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              <span>Sistem Informasi Operasional &amp; Pelaporan Harian ICT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Portal Operasional Terpadu
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Silakan masuk dengan kredensial perusahaan Anda untuk mengakses kalender laporan, manajemen fasilitas, dan jejak audit.
            </p>
          </div>

          {/* Corporate White Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            {/* Tab Switcher: Login & Register side-by-side */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setLoginError(null);
                  setRegError(null);
                }}
                className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk (Login)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setLoginError(null);
                  setRegError(null);
                }}
                className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Daftar (Register)</span>
              </button>
            </div>

            {/* TAB 1: LOGIN */}
            {activeTab === 'login' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {loginError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Email Perusahaan atau Nomor Badge NIK
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={loginIdentifier}
                        onChange={e => setLoginIdentifier(e.target.value)}
                        placeholder="contoh: nama@donggi-senoro.com atau 00001"
                        className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 font-mono transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">
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
                        className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 font-mono transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(p => !p)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title={showLoginPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-800">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-blue-700 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <span>Ingat sesi di peramban ini</span>
                    </label>

                    <span className="text-[11px] text-slate-500 font-mono">Site Uso &amp; HO Jkt SSO</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full mt-2 py-2.5 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isLoggingIn ? 'Memverifikasi kredensial...' : 'Masuk ke Sistem'}</span>
                  </button>
                </form>

                {/* Switch to Register tab prompt */}
                <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <span>Belum memiliki akun operasional? </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-blue-700 hover:text-blue-900 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Daftar akun di tab Register
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: REGISTER */}
            {activeTab === 'register' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-blue-700" />
                    <span>Pendaftaran Akun Personel ICT</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Daftarkan akun personel Helpdesk Engineer atau Superior ke Active Directory PT Donggi-Senoro LNG.
                  </p>
                </div>

                {regError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{regError}</span>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  {/* Nama Lengkap */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Lengkap Personel <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      placeholder="contoh: Rahmat Hidayat"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 font-semibold transition-colors"
                    />
                  </div>

                  {/* Email & Badge NIK */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Korporat <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="nama@donggi-senoro.com"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 font-mono transition-colors"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          Nomor Badge NIK <span className="text-rose-600">*</span>
                        </label>
                        <span className="text-[10px] text-slate-500 font-mono">Angka maks 5 digit</span>
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
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 font-mono tracking-wider transition-colors"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Hanya angka 0-9 ({regBadge.length}/5 digit)
                      </span>
                    </div>
                  </div>

                  {/* Role / Wewenang: Khusus Helpdesk & Superior */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Peran / Hak Akses Sistem <span className="text-rose-600">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setRegRole('HELPDESK_ENGINEER')}
                        className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                          regRole === 'HELPDESK_ENGINEER'
                            ? 'bg-blue-50/80 border-blue-600 text-blue-950 shadow-2xs ring-1 ring-blue-600'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-blue-900">
                          <Briefcase className="w-3.5 h-3.5 text-blue-700" />
                          <span>Helpdesk Engineer</span>
                        </div>
                        <div className="text-[10px] text-slate-600 mt-1 leading-normal">
                          Entri &amp; Pelaporan Operasional, Verifikasi Fisik VTC
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRegRole('ICT_MANAGER')}
                        className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                          regRole === 'ICT_MANAGER'
                            ? 'bg-amber-50/80 border-amber-600 text-amber-950 shadow-2xs ring-1 ring-amber-600'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900">
                          <Award className="w-3.5 h-3.5 text-amber-700" />
                          <span>Superior / ICT Manager</span>
                        </div>
                        <div className="text-[10px] text-slate-600 mt-1 leading-normal">
                          Review, Approval &amp; Tanda Tangan Digital E-Signature
                        </div>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1.5">
                      * Hak akses Administrator dikonfigurasi terpusat oleh Departemen ICT demi kepatuhan ISO 27001.
                    </p>
                  </div>

                  {/* Lokasi & Shift */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Lokasi Penempatan <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={regLocation}
                        onChange={e => setRegLocation(e.target.value as Location)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-700 font-medium cursor-pointer"
                      >
                        <option value="Site Uso">Site Uso (Plant Batui - WITA)</option>
                        <option value="HO Jakarta">HO Jakarta (Jakarta - WIB)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Shift / Jadwal Kerja
                      </label>
                      <input
                        type="text"
                        value={regShift}
                        onChange={e => setRegShift(e.target.value)}
                        placeholder="Shift A (06.00 - 18.00 WITA)"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700 font-mono"
                      />
                    </div>
                  </div>

                  {/* Nomor Kontak & Kata Sandi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nomor Telepon / Kontak
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={regPhone}
                          onChange={e => setRegPhone(e.target.value)}
                          placeholder="+62 812 xxxx xxxx"
                          className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Kata Sandi / PIN Akun
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          placeholder="Buat kata sandi..."
                          className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(p => !p)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
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
                    className="w-full mt-2 py-2.5 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isRegistering ? 'Mendaftarkan akun...' : 'Daftarkan Akun & Langsung Masuk'}</span>
                  </button>
                </form>

                {/* Back to Login prompt */}
                <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <span>Sudah memiliki akun terdaftar? </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="text-blue-700 hover:text-blue-900 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Beralih ke tab Login
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Security & Cryptographic Compliance Banner */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-center space-y-1 text-slate-500 text-xs shadow-2xs">
            <div className="flex items-center justify-center gap-1.5 text-slate-800 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Akses Terenkripsi &amp; Terotentikasi Penuh</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed max-w-md mx-auto">
              Sistem ini terlindungi dengan standar keamanan korporat. Setiap aktivitas login, registrasi, dan pelaporan operasional tercatat dalam audit log sistem.
            </p>
          </div>
        </div>
      </main>

      {/* Corporate Operations Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-8 relative z-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <span className="font-semibold text-slate-800">PT Donggi-Senoro LNG</span>
            <span>·</span>
            <span>Information &amp; Communication Technology (ICT) Department</span>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Plant Site Batui, Banggai · Site Uso (WITA) / HO Jkt (WIB)
          </div>
        </div>
      </footer>
    </div>
  );
};
