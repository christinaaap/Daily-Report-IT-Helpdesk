import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Location, TeamMember, UserRole } from '../types';
import {
  X,
  UserPlus,
  Users,
  Building2,
  Trash2,
  Edit2,
  CheckCircle,
  LogIn,
  Mail,
  Phone,
  ShieldCheck,
  Award,
  ShieldAlert,
  Shield,
  KeyRound,
  Lock,
} from 'lucide-react';

export const ManageEngineersModal: React.FC = () => {
  const {
    closeModal,
    teamMembers,
    addHelpdeskEngineer,
    addSuperiorAccount,
    updateTeamMember,
    deleteTeamMember,
    adminResetPassword,
    setCurrentUser,
    showToast,
  } = useApp();

  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [resettingUser, setResettingUser] = useState<TeamMember | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    badgeNumber: string;
    location: Location;
    phone: string;
    role: 'HELPDESK_ENGINEER' | 'ICT_MANAGER';
    password?: string;
  }>({
    name: '',
    email: '',
    badgeNumber: '',
    location: 'Site Uso',
    phone: '',
    role: 'HELPDESK_ENGINEER',
    password: '',
  });

  const superiorMembers = teamMembers.filter(m => m.role === 'ICT_MANAGER');
  const helpdeskEngineers = teamMembers.filter(m => m.role === 'HELPDESK_ENGINEER');
  const siteUsoEngineers = helpdeskEngineers.filter(m => m.location === 'Site Uso');
  const hoJktEngineers = helpdeskEngineers.filter(m => m.location === 'HO Jkt');

  const handleOpenAddForm = (defaultRole: 'HELPDESK_ENGINEER' | 'ICT_MANAGER' = 'HELPDESK_ENGINEER', defaultLocation: Location = 'Site Uso') => {
    setEditingMemberId(null);
    setFormData({
      name: '',
      email: '',
      badgeNumber: '',
      location: defaultLocation,
      phone: '',
      role: defaultRole,
      password: '',
    });
    setIsAddingNew(true);
  };

  const handleStartEdit = (member: TeamMember) => {
    setEditingMemberId(member.id);
    setFormData({
      name: member.name,
      email: member.email,
      badgeNumber: member.badgeNumber,
      location: member.location,
      phone: member.phone || '',
      role: member.role === 'ICT_MANAGER' ? 'ICT_MANAGER' : 'HELPDESK_ENGINEER',
      password: '',
    });
    setIsAddingNew(true);
  };

  const handleCancelForm = () => {
    setIsAddingNew(false);
    setEditingMemberId(null);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('Nama lengkap pengguna wajib diisi.', 'error');
      return;
    }
    if (!formData.badgeNumber.trim()) {
      showToast('Badge ID / NIK wajib diisi.', 'error');
      return;
    }
    if (!/^\d{1,5}$/.test(formData.badgeNumber.trim())) {
      showToast('Badge ID / NIK harus berupa angka saja (maksimal 5 digit, contoh: 10420).', 'error');
      return;
    }
    if (!formData.email.trim()) {
      showToast('Email wajib diisi.', 'error');
      return;
    }

    if (editingMemberId) {
      const existing = teamMembers.find(m => m.id === editingMemberId);
      if (existing) {
        updateTeamMember({
          ...existing,
          name: formData.name.trim(),
          email: formData.email.trim(),
          badgeNumber: formData.badgeNumber.trim(),
          location: formData.location,
          role: formData.role as UserRole,
          phone: formData.phone.trim(),
          password: formData.password?.trim() ? formData.password.trim() : existing.password,
          isDutyEligible: formData.role === 'HELPDESK_ENGINEER' && formData.location === 'Site Uso',
        });
      }
    } else {
      if (formData.role === 'ICT_MANAGER') {
        addSuperiorAccount({
          name: formData.name.trim(),
          email: formData.email.trim(),
          badgeNumber: formData.badgeNumber.trim(),
          location: formData.location,
          phone: formData.phone.trim(),
        });
      } else {
        addHelpdeskEngineer({
          name: formData.name.trim(),
          email: formData.email.trim(),
          badgeNumber: formData.badgeNumber.trim(),
          location: formData.location,
          phone: formData.phone.trim(),
        });
      }
    }

    setIsAddingNew(false);
    setEditingMemberId(null);
  };

  const handleDelete = (id: string, name: string, role: string) => {
    const roleLabel = role === 'ICT_MANAGER' ? 'Superior / ICT Manager' : 'Helpdesk Engineer';
    if (window.confirm(`Apakah Anda yakin ingin menghapus akun ${roleLabel}: ${name}?`)) {
      deleteTeamMember(id);
    }
  };

  const handleSwitchUser = (member: TeamMember) => {
    setCurrentUser(member);
    const roleLabel = member.role === 'ICT_MANAGER' ? 'Superior' : 'Helpdesk Engineer';
    showToast(`Beralih ke akun ${member.name} (${roleLabel} - ${member.location}).`, 'info');
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl my-auto shadow-2xl flex flex-col max-h-[92vh] text-slate-900">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/80 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-100 text-purple-800">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Manajemen Akun Pengguna (Helpdesk &amp; Superior)
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold border border-purple-200">
                  Administrator IT Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Daftarkan dan kelola akun Helpdesk Engineer serta akun Superior / ICT Manager
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/40">
          {/* Top Bar with Add Buttons & Summary Counters */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
              {/* Superior Counter Badge */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-semibold ${
                superiorMembers.length > 0 
                  ? 'bg-amber-50 text-amber-900 border-amber-300' 
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                <Award className="w-4 h-4 text-amber-700" />
                <span>
                  Superior / ICT Manager: <strong>{superiorMembers.length}</strong> Akun
                  {superiorMembers.length === 0 && ' (Perlu Dibuat)'}
                </span>
              </div>

              {/* Site Uso Helpdesk Badge */}
              <div className="flex items-center gap-2 bg-blue-50 text-blue-900 px-3 py-1.5 rounded-lg border border-blue-200">
                <Building2 className="w-4 h-4 text-blue-700" />
                <span>Helpdesk Site Uso: <strong>{siteUsoEngineers.length}</strong> Akun</span>
              </div>

              {/* HO Jkt Helpdesk Badge */}
              <div className="flex items-center gap-2 bg-slate-100 text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200">
                <Building2 className="w-4 h-4 text-slate-600" />
                <span>Helpdesk HO Jkt: <strong>{hoJktEngineers.length}</strong> Akun</span>
              </div>
            </div>

            {!isAddingNew && (
              <div className="flex items-center gap-2 self-start lg:self-auto">
                <button
                  type="button"
                  onClick={() => handleOpenAddForm('ICT_MANAGER', 'HO Jkt')}
                  className="px-3.5 py-2 text-xs font-semibold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
                >
                  <Award className="w-4 h-4 text-amber-800" />
                  + Buat Akun Superior
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAddForm('HELPDESK_ENGINEER', 'Site Uso')}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  + Tambah Akun Helpdesk
                </button>
              </div>
            )}
          </div>

          {/* Form Create / Edit Member */}
          {isAddingNew && (
            <div className={`p-5 rounded-xl border shadow-sm space-y-4 ${
              formData.role === 'ICT_MANAGER'
                ? 'bg-amber-50/70 border-amber-300'
                : 'bg-purple-50/60 border-purple-200'
            }`}>
              <div className="flex items-center justify-between border-b pb-2.5 border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-slate-900">
                  {formData.role === 'ICT_MANAGER' ? (
                    <Award className="w-4 h-4 text-amber-700" />
                  ) : (
                    <UserPlus className="w-4 h-4 text-purple-700" />
                  )}
                  <span>
                    {editingMemberId
                      ? `Edit Data Akun: ${formData.role === 'ICT_MANAGER' ? 'Superior / ICT Manager' : 'Helpdesk Engineer'}`
                      : `Pendaftaran Akun Baru: ${formData.role === 'ICT_MANAGER' ? 'Superior / ICT Manager' : 'Helpdesk Engineer'}`}
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold hover:underline"
                >
                  Batal
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-4">
                {/* Role Selector Radio */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Peran &amp; Wewenang Akun (Role) *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.role === 'ICT_MANAGER'
                          ? 'bg-amber-100/80 border-amber-500 shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="accountRole"
                        value="ICT_MANAGER"
                        checked={formData.role === 'ICT_MANAGER'}
                        onChange={() => setFormData({ ...formData, role: 'ICT_MANAGER' })}
                        className="mt-0.5 text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-amber-700" />
                          <span>Superior / ICT Manager</span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          Wewenang review laporan, inspeksi validasi, dan pembubuhan E-Signature persetujuan (Approval) dokumen harian.
                        </div>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.role === 'HELPDESK_ENGINEER'
                          ? 'bg-purple-100/70 border-purple-500 shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="accountRole"
                        value="HELPDESK_ENGINEER"
                        checked={formData.role === 'HELPDESK_ENGINEER'}
                        onChange={() => setFormData({ ...formData, role: 'HELPDESK_ENGINEER' })}
                        className="mt-0.5 text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-purple-700" />
                          <span>Helpdesk Engineer</span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          Petugas helpdesk operasional harian. Melakukan checklist server, inspeksi VTC, dan submit laporan (Duty Engineer Site Uso).
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nama Lengkap */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nama Lengkap Pejabat / Pengguna *</label>
                    <input
                      type="text"
                      required
                      placeholder={
                        formData.role === 'ICT_MANAGER'
                          ? 'Contoh: Hendra Wijaya atau Bpk. Rudi Hartono'
                          : 'Contoh: Budi Prasetyo'
                      }
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-600 font-semibold"
                    />
                  </div>

                  {/* Badge ID / NIK */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">Badge ID / NIK *</label>
                      <span className="text-[10px] text-slate-500 font-mono">Angka maks. 5 digit</span>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={5}
                      required
                      placeholder="Contoh: 10420"
                      value={formData.badgeNumber}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                        setFormData({ ...formData, badgeNumber: val });
                      }}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-600 font-semibold tracking-wider"
                    />
                    <span className="text-[10px] text-slate-500 font-mono block">
                      Hanya angka 0-9 ({formData.badgeNumber.length}/5 digit)
                    </span>
                  </div>

                  {/* Email Perusahaan */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Email Perusahaan DSLNG *</label>
                    <input
                      type="email"
                      required
                      placeholder="nama.user@donggi-senoro.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  {/* Kata Sandi Akun (Reset Password oleh Administrator) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">
                        {editingMemberId ? 'Reset Kata Sandi Akun (Opsional)' : 'Kata Sandi Awal Akun (Opsional)'}
                      </label>
                      <span className="text-[10px] text-purple-700 font-semibold flex items-center gap-1">
                        <KeyRound className="w-3 h-3" />
                        Otoritas Admin
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder={
                          editingMemberId
                            ? 'Kosongkan bila tidak ingin mengubah kata sandi'
                            : 'Tentukan kata sandi awal akun'
                        }
                        value={formData.password || ''}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>

                  {/* Nomor Telepon / Extension */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nomor Telepon / Ext Kantor</label>
                    <input
                      type="text"
                      placeholder="Contoh: +62 21 2997 0004 atau +62 453 312 8000"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                {/* Lokasi Penugasan */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-slate-700">Lokasi Penempatan Kantor / Site *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.location === 'Site Uso'
                          ? 'bg-blue-50/80 border-blue-500 shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="location"
                        value="Site Uso"
                        checked={formData.location === 'Site Uso'}
                        onChange={() => setFormData({ ...formData, location: 'Site Uso' })}
                        className="mt-0.5 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">1. Site Uso (Zona WITA)</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Luwuk Plant · Zona Waktu WITA
                        </div>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.location === 'HO Jkt'
                          ? 'bg-blue-50/80 border-blue-500 shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="location"
                        value="HO Jkt"
                        checked={formData.location === 'HO Jkt'}
                        onChange={() => setFormData({ ...formData, location: 'HO Jkt' })}
                        className="mt-0.5 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">2. HO Jkt (Zona WIB)</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Head Office Jakarta · Zona Waktu WIB
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5 ${
                      formData.role === 'ICT_MANAGER'
                        ? 'bg-amber-700 hover:bg-amber-800'
                        : 'bg-purple-700 hover:bg-purple-800'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {editingMemberId
                      ? 'Simpan Perubahan Akun'
                      : formData.role === 'ICT_MANAGER'
                      ? 'Daftarkan Akun Superior'
                      : 'Daftarkan Akun Helpdesk'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Section 1: Akun Superior / ICT Manager */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-700" />
                <span>Akun Superior / ICT Manager ({superiorMembers.length} Terdaftar)</span>
              </h3>
              {superiorMembers.length > 0 && !isAddingNew && (
                <button
                  type="button"
                  onClick={() => handleOpenAddForm('ICT_MANAGER', 'HO Jkt')}
                  className="text-xs font-semibold text-amber-800 hover:text-amber-900 hover:underline flex items-center gap-1"
                >
                  + Tambah Akun Superior Lainnya
                </button>
              )}
            </div>

            {superiorMembers.length === 0 ? (
              <div className="p-5 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-950">
                    Belum Ada Akun Superior / ICT Manager Terdaftar
                  </h4>
                  <p className="text-[11px] text-slate-600 max-w-xl mx-auto mt-1 leading-relaxed">
                    Seluruh data akun superior sebelumnya telah dihapus. Administrator IT dapat mendaftarkan akun Superior resmi untuk melakukan E-Signature validasi &amp; persetujuan (Approval) Daily Report.
                  </p>
                </div>
                {!isAddingNew && (
                  <button
                    type="button"
                    onClick={() => handleOpenAddForm('ICT_MANAGER', 'HO Jkt')}
                    className="px-4 py-2 text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 border border-amber-400 rounded-lg shadow-2xs inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Award className="w-4 h-4 text-amber-900" />
                    + Buat Akun Superior Sekarang
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-white overflow-hidden shadow-2xs divide-y divide-amber-100">
                {superiorMembers.map(member => (
                  <div
                    key={member.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-amber-50/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-300">
                        {member.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <strong className="text-xs text-slate-900 font-bold">{member.name}</strong>
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 font-semibold">
                            Superior / ICT Manager
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {member.badgeNumber}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-blue-50 text-blue-800 border border-blue-200">
                            {member.location}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {member.email}
                          </span>
                          {member.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {member.phone}
                            </span>
                          )}
                          <span className="text-emerald-700 font-medium">
                            ✓ Wewenang Approval &amp; E-Signature
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSwitchUser(member)}
                        className="px-2.5 py-1 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded border border-amber-300 flex items-center gap-1 transition-colors"
                        title="Masuk sebagai Superior untuk uji review & E-Signature"
                      >
                        <LogIn className="w-3 h-3" />
                        Login Superior
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setResettingUser(member);
                          setNewPasswordValue('');
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Reset Kata Sandi Akun"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(member)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
                        title="Edit data akun"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(member.id, member.name, member.role)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Hapus akun superior"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Site Uso Helpdesk Engineers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-700" />
                <span>Akun Helpdesk Site Uso ({siteUsoEngineers.length} Terdaftar)</span>
              </h3>
              {siteUsoEngineers.length > 0 && !isAddingNew && (
                <button
                  type="button"
                  onClick={() => handleOpenAddForm('HELPDESK_ENGINEER', 'Site Uso')}
                  className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1"
                >
                  + Tambah Helpdesk Site Uso
                </button>
              )}
            </div>

            {siteUsoEngineers.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-slate-300 bg-white text-center space-y-2">
                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">
                  Belum ada akun Helpdesk Engineer untuk Site Uso
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  Klik tombol "+ Tambah Akun Helpdesk" untuk mendaftarkan engineer pertama Site Uso.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs divide-y divide-slate-100">
                {siteUsoEngineers.map(engineer => (
                  <div
                    key={engineer.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
                        {engineer.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs text-slate-900 font-bold">{engineer.name}</strong>
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-blue-50 text-blue-800 border border-blue-200">
                            {engineer.badgeNumber}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {engineer.email}
                          </span>
                          {engineer.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {engineer.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSwitchUser(engineer)}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 flex items-center gap-1 transition-colors"
                        title="Masuk sebagai user ini"
                      >
                        <LogIn className="w-3 h-3" />
                        Login Akun
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setResettingUser(engineer);
                          setNewPasswordValue('');
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Reset Kata Sandi Akun"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(engineer)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
                        title="Edit data engineer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(engineer.id, engineer.name, engineer.role)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Hapus akun"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: HO Jkt Helpdesk Engineers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-700" />
                <span>Akun Helpdesk HO Jkt ({hoJktEngineers.length} Terdaftar)</span>
              </h3>
              {hoJktEngineers.length > 0 && !isAddingNew && (
                <button
                  type="button"
                  onClick={() => handleOpenAddForm('HELPDESK_ENGINEER', 'HO Jkt')}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline flex items-center gap-1"
                >
                  + Tambah Helpdesk HO Jkt
                </button>
              )}
            </div>

            {hoJktEngineers.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-slate-300 bg-white text-center space-y-2">
                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">
                  Belum ada akun Helpdesk Engineer untuk HO Jkt
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  Klik tombol "+ Tambah Akun Helpdesk" untuk mendaftarkan engineer pertama HO Jkt.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs divide-y divide-slate-100">
                {hoJktEngineers.map(engineer => (
                  <div
                    key={engineer.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0">
                        {engineer.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs text-slate-900 font-bold">{engineer.name}</strong>
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-100 text-slate-800 border border-slate-200">
                            {engineer.badgeNumber}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {engineer.email}
                          </span>
                          {engineer.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {engineer.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSwitchUser(engineer)}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 flex items-center gap-1 transition-colors"
                        title="Masuk sebagai user ini"
                      >
                        <LogIn className="w-3 h-3" />
                        Login Akun
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setResettingUser(engineer);
                          setNewPasswordValue('');
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Reset Kata Sandi Akun"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(engineer)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
                        title="Edit data engineer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(engineer.id, engineer.name, engineer.role)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Hapus akun"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-between bg-slate-50/90 rounded-b-2xl shrink-0">
          <div className="text-xs text-slate-500 font-mono flex items-center gap-3">
            <span>Superior: <strong>{superiorMembers.length}</strong></span>
            <span>·</span>
            <span>Helpdesk: <strong>{helpdeskEngineers.length}</strong></span>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>

      {/* Modal Dialog: Administrator Password Reset */}
      {resettingUser && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Reset Kata Sandi Pengguna</h3>
                  <p className="text-[11px] text-slate-500">Otoritas Eksklusif Administrator IT (ISO 27001)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResettingUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4 space-y-1">
              <div className="text-xs font-semibold text-slate-800">{resettingUser.name}</div>
              <div className="text-[11px] font-mono text-slate-500">
                Badge NIK: {resettingUser.badgeNumber} · {resettingUser.email}
              </div>
              <div className="text-[10px] text-indigo-700 font-semibold">
                Peran: {resettingUser.role === 'ICT_MANAGER' ? 'Superior / ICT Manager' : 'Helpdesk Engineer'} · {resettingUser.location}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newPasswordValue.trim()) {
                  showToast('Kata sandi baru tidak boleh kosong.', 'error');
                  return;
                }
                adminResetPassword(resettingUser.id, newPasswordValue.trim());
                setResettingUser(null);
                setNewPasswordValue('');
              }}
            >
              <div className="space-y-2 mb-4">
                <label className="text-xs font-bold text-slate-700 block">
                  Masukkan Kata Sandi Baru *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={newPasswordValue}
                    onChange={(e) => setNewPasswordValue(e.target.value)}
                    placeholder="Contoh: Dslng2026! atau SandiBaru88"
                    className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Pengguna bersangkutan dapat login menggunakan kata sandi baru ini. Tindakan ini dicatat ke dalam audit trail ISO 27001.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  Simpan &amp; Reset Kata Sandi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
