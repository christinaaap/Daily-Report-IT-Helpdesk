import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Location, ServerCheck, PhysicalInspectionItem, CompanyAsset } from '../types';
import {
  Server,
  Activity,
  FileKey,
  Video,
  Cpu,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  Building2,
  HardDrive,
  Layers,
  Sparkles,
} from 'lucide-react';

export const InfrastructureFleetView: React.FC = () => {
  const {
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
    showToast,
  } = useApp();

  // Modals state
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [roomFormData, setRoomFormData] = useState<{
    roomName: string;
    location: Location;
    facilities: string;
    notes: string;
  }>({
    roomName: '',
    location: 'Site Uso',
    facilities: '',
    notes: '',
  });

  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [editingServerId, setEditingServerId] = useState<string | null>(null);
  const [serverFormData, setServerFormData] = useState<{
    name: string;
    location: string;
    role: string;
    status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
    latencyMs: number;
    notes: string;
  }>({
    name: '',
    location: 'Site Uso Server Room',
    role: '',
    status: 'ONLINE',
    latencyMs: 2,
    notes: '',
  });

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [assetFormData, setAssetFormData] = useState<{
    name: string;
    category: 'SOFTWARE_LICENSE' | 'NETWORK_HARDWARE' | 'TELEPHONY' | 'SCADA' | 'OTHER';
    capacityTotal: number;
    capacityUsed: number;
    unit: string;
    vendor: string;
    notes: string;
  }>({
    name: '',
    category: 'SOFTWARE_LICENSE',
    capacityTotal: 100,
    capacityUsed: 10,
    unit: 'Seats',
    vendor: '',
    notes: '',
  });

  // --- Room Handlers ---
  const handleOpenAddRoom = () => {
    setEditingRoomId(null);
    setRoomFormData({
      roomName: '',
      location: 'Site Uso',
      facilities: 'Dual 85" 4K UHD, Polycom Mic Array, HDMI/USB-C',
      notes: '',
    });
    setIsRoomModalOpen(true);
  };

  const handleStartEditRoom = (room: PhysicalInspectionItem) => {
    setEditingRoomId(room.id);
    setRoomFormData({
      roomName: room.roomName,
      location: room.location,
      facilities: room.facilities || '',
      notes: room.notes || '',
    });
    setIsRoomModalOpen(true);
  };

  const handleSubmitRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomFormData.roomName.trim()) {
      showToast('Nama ruang meeting wajib diisi.', 'error');
      return;
    }

    if (editingRoomId) {
      const existing = meetingRooms.find(r => r.id === editingRoomId);
      if (existing) {
        updateMeetingRoom({
          ...existing,
          roomName: roomFormData.roomName.trim(),
          location: roomFormData.location,
          facilities: roomFormData.facilities.trim(),
          notes: roomFormData.notes.trim(),
        });
      }
    } else {
      addMeetingRoom({
        roomName: roomFormData.roomName.trim(),
        location: roomFormData.location,
        facilities: roomFormData.facilities.trim(),
        notes: roomFormData.notes.trim(),
      });
    }

    setIsRoomModalOpen(false);
    setEditingRoomId(null);
  };

  const handleDeleteRoom = (id: string, name: string) => {
    if (window.confirm(`Hapus ruang meeting: ${name}?`)) {
      deleteMeetingRoom(id);
    }
  };

  // --- Server Handlers ---
  const handleOpenAddServer = () => {
    setEditingServerId(null);
    setServerFormData({
      name: '',
      location: 'Site Uso Server Room',
      role: '',
      status: 'ONLINE',
      latencyMs: 2,
      notes: '',
    });
    setIsServerModalOpen(true);
  };

  const handleStartEditServer = (server: ServerCheck) => {
    setEditingServerId(server.id);
    setServerFormData({
      name: server.name,
      location: server.location,
      role: server.role,
      status: server.status,
      latencyMs: server.latencyMs,
      notes: server.notes || '',
    });
    setIsServerModalOpen(true);
  };

  const handleSubmitServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverFormData.name.trim()) {
      showToast('Nama server wajib diisi.', 'error');
      return;
    }

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (editingServerId) {
      const existing = servers.find(s => s.id === editingServerId);
      if (existing) {
        updateServer({
          ...existing,
          name: serverFormData.name.trim(),
          location: serverFormData.location.trim(),
          role: serverFormData.role.trim(),
          status: serverFormData.status,
          latencyMs: Number(serverFormData.latencyMs) || 1,
          notes: serverFormData.notes.trim(),
          lastChecked: nowTime,
        });
      }
    } else {
      addServer({
        name: serverFormData.name.trim(),
        location: serverFormData.location.trim(),
        role: serverFormData.role.trim() || 'General Production Node',
        status: serverFormData.status,
        latencyMs: Number(serverFormData.latencyMs) || 1,
        lastChecked: nowTime,
        notes: serverFormData.notes.trim(),
      });
    }

    setIsServerModalOpen(false);
    setEditingServerId(null);
  };

  const handleDeleteServer = (id: string, name: string) => {
    if (window.confirm(`Hapus server node: ${name}?`)) {
      deleteServer(id);
    }
  };

  // --- Asset / License Handlers ---
  const handleOpenAddAsset = () => {
    setEditingAssetId(null);
    setAssetFormData({
      name: '',
      category: 'SOFTWARE_LICENSE',
      capacityTotal: 100,
      capacityUsed: 10,
      unit: 'Seats',
      vendor: '',
      notes: '',
    });
    setIsAssetModalOpen(true);
  };

  const handleStartEditAsset = (asset: CompanyAsset) => {
    setEditingAssetId(asset.id);
    setAssetFormData({
      name: asset.name,
      category: asset.category,
      capacityTotal: asset.capacityTotal,
      capacityUsed: asset.capacityUsed,
      unit: asset.unit,
      vendor: asset.vendor || '',
      notes: asset.notes || '',
    });
    setIsAssetModalOpen(true);
  };

  const handleSubmitAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetFormData.name.trim()) {
      showToast('Nama aset / lisensi wajib diisi.', 'error');
      return;
    }

    if (editingAssetId) {
      const existing = companyAssets.find(a => a.id === editingAssetId);
      if (existing) {
        updateCompanyAsset({
          ...existing,
          name: assetFormData.name.trim(),
          category: assetFormData.category,
          capacityTotal: Number(assetFormData.capacityTotal) || 0,
          capacityUsed: Number(assetFormData.capacityUsed) || 0,
          unit: assetFormData.unit.trim() || 'Unit',
          vendor: assetFormData.vendor.trim(),
          notes: assetFormData.notes.trim(),
        });
      }
    } else {
      addCompanyAsset({
        name: assetFormData.name.trim(),
        category: assetFormData.category,
        capacityTotal: Number(assetFormData.capacityTotal) || 0,
        capacityUsed: Number(assetFormData.capacityUsed) || 0,
        unit: assetFormData.unit.trim() || 'Unit',
        vendor: assetFormData.vendor.trim(),
        notes: assetFormData.notes.trim(),
      });
    }

    setIsAssetModalOpen(false);
    setEditingAssetId(null);
  };

  const handleDeleteAsset = (id: string, name: string) => {
    if (window.confirm(`Hapus aset / lisensi: ${name}?`)) {
      deleteCompanyAsset(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Infrastructure Top Overview */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-700" />
            <span>PT Donggi-Senoro LNG Infrastructure Fleet &amp; Facilities</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Pusat manajemen dan konfigurasi fasilitas Ruang Rapat (VTC), Infrastruktur Server Node, dan Lisensi Perangkat Lunak Operasional Perusahaan.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleOpenAddRoom}
            className="px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Video className="w-3.5 h-3.5 text-blue-700" />
            <span>+ Tambah Ruang Meeting</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddServer}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-700" />
            <span>+ Tambah Server</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddAsset}
            className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <FileKey className="w-3.5 h-3.5 text-amber-700" />
            <span>+ Tambah Aset / Lisensi</span>
          </button>
        </div>
      </div>

      {/* Counters Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Ruang Meeting (VTC)</div>
            <div className="text-lg font-bold font-mono text-slate-900">
              {meetingRooms.length} Ruangan
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Server Nodes Produksi</div>
            <div className="text-lg font-bold font-mono text-slate-900">
              {servers.length} Managed Nodes
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
            <FileKey className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Lisensi &amp; Aset ICT</div>
            <div className="text-lg font-bold font-mono text-slate-900">
              {companyAssets.length} Aset Terdaftar
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Meeting Rooms & VTC Facilities */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-blue-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Executive Video Conference (VTC) &amp; Meeting Rooms ({meetingRooms.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={handleOpenAddRoom}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Ruang Meeting
          </button>
        </div>

        {meetingRooms.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 text-center space-y-2">
            <Video className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-xs font-bold text-slate-700">Belum Ada Ruang Meeting Terdaftar</h4>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              Seluruh data dummy telah dihapus. Klik tombol di bawah untuk menambahkan ruang rapat di Site Uso atau HO Jkt.
            </p>
            <button
              type="button"
              onClick={handleOpenAddRoom}
              className="mt-2 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              + Daftarkan Ruang Meeting Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {meetingRooms.map((room, i) => (
              <div
                key={room.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5 hover:border-blue-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {room.roomName}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                        room.location === 'Site Uso'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-slate-200 text-slate-800 border border-slate-300'
                      }`}
                    >
                      {room.location}
                    </span>
                  </div>

                  {room.facilities && (
                    <div className="text-[11px] text-slate-600 mt-2 font-mono bg-white p-2 rounded border border-slate-100">
                      <span className="font-semibold text-slate-700 block text-[10px]">Fasilitas:</span>
                      {room.facilities}
                    </div>
                  )}

                  {room.notes && (
                    <div className="text-[10px] text-slate-500 mt-1 italic">
                      "{room.notes}"
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Wajib Cek Fisik 06.00 WITA
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStartEditRoom(room)}
                      className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
                      title="Edit Ruang Meeting"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRoom(room.id, room.roomName)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Hapus Ruang Meeting"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Primary Server Fleet */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Primary Server Fleet ({servers.length} Production Nodes)
            </h3>
          </div>
          <button
            type="button"
            onClick={handleOpenAddServer}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Server Node
          </button>
        </div>

        {servers.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 text-center space-y-2">
            <Server className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-xs font-bold text-slate-700">Belum Ada Server Node Terdaftar</h4>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              Seluruh data dummy server telah dibersihkan. Daftarkan server Domain Controller, SCADA, Mail Relay, atau Storage NAS perusahaan.
            </p>
            <button
              type="button"
              onClick={handleOpenAddServer}
              className="mt-2 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              + Daftarkan Server Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {servers.map(server => (
              <div
                key={server.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 hover:border-emerald-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{server.name}</h4>
                      <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                        {server.location}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        server.status === 'ONLINE'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : server.status === 'DEGRADED'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}
                    >
                      {server.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 font-sans mt-2">
                    Peran: {server.role}
                  </p>

                  {server.notes && (
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                      Catatan: {server.notes}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Latency: {server.latencyMs}ms</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStartEditServer(server)}
                      className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
                      title="Edit Server"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteServer(server.id, server.name)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Hapus Server"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Company Assets & Software Licenses */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2">
            <FileKey className="w-4 h-4 text-amber-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Sistem Perangkat Lunak, Lisensi &amp; Aset ICT Perusahaan ({companyAssets.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={handleOpenAddAsset}
            className="text-xs font-semibold text-amber-800 hover:text-amber-900 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Aset / Lisensi
          </button>
        </div>

        {companyAssets.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 text-center space-y-2">
            <FileKey className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-xs font-bold text-slate-700">Belum Ada Aset / Lisensi Perusahaan Terdaftar</h4>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              Seluruh data dummy telah dihapus. Daftarkan lisensi software enterprise (M365, AutoCAD, SAP, HYSYS) atau aset perangkat keras lainnya.
            </p>
            <button
              type="button"
              onClick={handleOpenAddAsset}
              className="mt-2 px-3 py-1.5 text-xs font-semibold text-amber-950 bg-amber-200 hover:bg-amber-300 border border-amber-300 rounded-lg shadow-xs inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              + Daftarkan Aset / Lisensi Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {companyAssets.map(asset => {
              const pct = asset.capacityTotal > 0 ? Math.min(100, Math.round((asset.capacityUsed / asset.capacityTotal) * 100)) : 0;
              const remaining = Math.max(0, asset.capacityTotal - asset.capacityUsed);
              return (
                <div
                  key={asset.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{asset.name}</h4>
                        {asset.vendor && (
                          <span className="text-[10px] text-slate-500 font-mono block">
                            Vendor: {asset.vendor}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {asset.category.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-600 font-semibold">
                          {asset.capacityUsed} / {asset.capacityTotal} {asset.unit}
                        </span>
                        <span className={`font-bold ${pct > 90 ? 'text-rose-700' : 'text-slate-700'}`}>
                          {pct}%
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct > 90 ? 'bg-rose-600' : pct > 75 ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="text-[10px] text-emerald-700 font-mono mt-1">
                        Sisa Kapasitas: {remaining} {asset.unit}
                      </div>
                    </div>

                    {asset.notes && (
                      <p className="text-[10px] text-slate-500 mt-2 italic">
                        "{asset.notes}"
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => handleStartEditAsset(asset)}
                      className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
                      title="Edit Aset"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAsset(asset.id, asset.name)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Hapus Aset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- MODAL: TAMBAH / EDIT RUANG MEETING --- */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-auto text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Video className="w-4 h-4 text-blue-700" />
                <span>{editingRoomId ? 'Edit Ruang Meeting' : 'Tambah Ruang Meeting (VTC)'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsRoomModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitRoom} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nama Ruangan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Maleo Executive Boardroom, Ruang Cendrawasih"
                  value={roomFormData.roomName}
                  onChange={e => setRoomFormData({ ...roomFormData, roomName: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Lokasi Penempatan *</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-xs ${
                      roomFormData.location === 'Site Uso'
                        ? 'bg-blue-50 border-blue-500 font-semibold text-blue-900'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="roomLocation"
                      value="Site Uso"
                      checked={roomFormData.location === 'Site Uso'}
                      onChange={() => setRoomFormData({ ...roomFormData, location: 'Site Uso' })}
                    />
                    <span>Site Uso (WITA)</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-xs ${
                      roomFormData.location === 'HO Jkt'
                        ? 'bg-blue-50 border-blue-500 font-semibold text-blue-900'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="roomLocation"
                      value="HO Jkt"
                      checked={roomFormData.location === 'HO Jkt'}
                      onChange={() => setRoomFormData({ ...roomFormData, location: 'HO Jkt' })}
                    />
                    <span>HO Jkt (WIB)</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Fasilitas / Spesifikasi VTC</label>
                <input
                  type="text"
                  placeholder="Contoh: Dual 85 inch 4K UHD, Polycom Mic, HDMI & Type-C"
                  value={roomFormData.facilities}
                  onChange={e => setRoomFormData({ ...roomFormData, facilities: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Catatan Operasional</label>
                <textarea
                  rows={2}
                  placeholder="Catatan tambahan seputar ruangan..."
                  value={roomFormData.notes}
                  onChange={e => setRoomFormData({ ...roomFormData, notes: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {editingRoomId ? 'Simpan Perubahan' : 'Daftarkan Ruangan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: TAMBAH / EDIT SERVER NODE --- */}
      {isServerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-auto text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-700" />
                <span>{editingServerId ? 'Edit Server Node' : 'Tambah Server Node Baru'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsServerModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitServer} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nama Server / Hostname *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: DC-USO-01, GW-SCADA-01, FS-LWK-01"
                  value={serverFormData.name}
                  onChange={e => setServerFormData({ ...serverFormData, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Lokasi Penempatan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Site Uso Server Room / HO Jkt DC"
                    value={serverFormData.location}
                    onChange={e => setServerFormData({ ...serverFormData, location: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Status Operasional *</label>
                  <select
                    value={serverFormData.status}
                    onChange={e =>
                      setServerFormData({
                        ...serverFormData,
                        status: e.target.value as 'ONLINE' | 'DEGRADED' | 'OFFLINE',
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-mono"
                  >
                    <option value="ONLINE">ONLINE (Normal)</option>
                    <option value="DEGRADED">DEGRADED (Perhatian)</option>
                    <option value="OFFLINE">OFFLINE (Gangguan)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Peran / Service *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Active Directory / SCADA Gateway"
                    value={serverFormData.role}
                    onChange={e => setServerFormData({ ...serverFormData, role: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Latency Rata-rata (ms)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Contoh: 2"
                    value={serverFormData.latencyMs}
                    onChange={e => setServerFormData({ ...serverFormData, latencyMs: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Catatan Pemantauan</label>
                <textarea
                  rows={2}
                  placeholder="Catatan telemetry, port switch, dsb..."
                  value={serverFormData.notes}
                  onChange={e => setServerFormData({ ...serverFormData, notes: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsServerModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {editingServerId ? 'Simpan Perubahan' : 'Daftarkan Server'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: TAMBAH / EDIT ASET & LISENSI --- */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-auto text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileKey className="w-4 h-4 text-amber-700" />
                <span>{editingAssetId ? 'Edit Aset / Lisensi' : 'Tambah Aset / Lisensi Perusahaan'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAssetModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAsset} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nama Perangkat Lunak / Aset *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Microsoft 365 E3, Autodesk AutoCAD, SAP ERP"
                  value={assetFormData.name}
                  onChange={e => setAssetFormData({ ...assetFormData, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-600 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Kategori Aset *</label>
                  <select
                    value={assetFormData.category}
                    onChange={e =>
                      setAssetFormData({
                        ...assetFormData,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                  >
                    <option value="SOFTWARE_LICENSE">Software License</option>
                    <option value="NETWORK_HARDWARE">Network Hardware</option>
                    <option value="TELEPHONY">Telephony / Radio</option>
                    <option value="SCADA">SCADA System</option>
                    <option value="OTHER">Lainnya</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Vendor / Penyedia</label>
                  <input
                    type="text"
                    placeholder="Contoh: Microsoft, Autodesk, Cisco"
                    value={assetFormData.vendor}
                    onChange={e => setAssetFormData({ ...assetFormData, vendor: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Kapasitas Total *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="450"
                    value={assetFormData.capacityTotal}
                    onChange={e => setAssetFormData({ ...assetFormData, capacityTotal: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-600 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Digunakan *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="416"
                    value={assetFormData.capacityUsed}
                    onChange={e => setAssetFormData({ ...assetFormData, capacityUsed: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-600 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Satuan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Seats / User"
                    value={assetFormData.unit}
                    onChange={e => setAssetFormData({ ...assetFormData, unit: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Catatan</label>
                <textarea
                  rows={2}
                  placeholder="Catatan masa aktif, peruntukan, dsb..."
                  value={assetFormData.notes}
                  onChange={e => setAssetFormData({ ...assetFormData, notes: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAssetModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {editingAssetId ? 'Simpan Perubahan' : 'Daftarkan Aset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
