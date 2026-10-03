import React from 'react';
import { INITIAL_SERVERS, INITIAL_LICENSES, DEFAULT_PHYSICAL_ROOMS } from '../data/mockData';
import {
  Server,
  Activity,
  FileKey,
  Video,
  Cpu,
} from 'lucide-react';

export const InfrastructureFleetView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Infrastructure Top Overview */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-700" />
            <span>PT Donggi-Senoro LNG Operational Fleet &amp; Facilities</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Real-time monitoring telemetry for Site Luwuk LNG Plant Data Center, Head Office Jakarta MPLS Trunk, SCADA Process Firewall Gateway, and Executive VTC Meeting Suites.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg shrink-0 font-semibold">
          <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span>Fleet Health: 99.98% Nominal</span>
        </div>
      </div>

      {/* Grid: Server Nodes */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Primary Server Fleet (DC Luwuk &amp; Jakarta Node)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {INITIAL_SERVERS.length} Managed Production Nodes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {INITIAL_SERVERS.map(server => (
            <div
              key={server.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{server.name}</h4>
                  <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                    {server.location}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {server.status}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 font-sans">
                Role: {server.role}
              </p>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Latency: {server.latencyMs}ms</span>
                <span>Checked: {server.lastChecked}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Meeting Rooms & VTC Hardware Inspection Facilities */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-blue-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Executive Video Conference (VTC) Facilities &amp; Standards
            </h3>
          </div>
          <span className="text-[11px] font-mono text-blue-700 font-semibold">
            Mandatory Daily 06:00 AM Physical Verification
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DEFAULT_PHYSICAL_ROOMS.map((room, i) => (
            <div
              key={room.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  0{i + 1}. {room.roomName}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                  {room.location}
                </span>
              </div>

              <div className="space-y-1 text-[11px] text-slate-600 font-mono">
                <div className="flex items-center justify-between">
                  <span>Display System:</span>
                  <span className="text-slate-900 font-medium">Dual 85" 4K UHD</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Microphone Pods:</span>
                  <span className="text-slate-900 font-medium">Ceiling Array (Polycom)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sharing Cables:</span>
                  <span className="text-slate-900 font-medium">HDMI / USB-C / LAN</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                Physical check required every morning before executive briefing.
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Enterprise Licenses Pool */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileKey className="w-4 h-4 text-amber-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Software Licenses &amp; Compliance Monitor
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">ICT Asset Management</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-semibold text-slate-600">Microsoft 365 E3 (General Staff)</span>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {INITIAL_LICENSES.m365E3Assigned} / {INITIAL_LICENSES.m365E3Total}
            </div>
            <div className="text-[11px] text-emerald-700 mt-1 font-mono font-medium">
              34 Available Buffer Seats
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-semibold text-slate-600">Microsoft 365 E5 (Executives &amp; Security)</span>
            <div className="text-2xl font-bold font-mono text-amber-800 mt-1">
              {INITIAL_LICENSES.m365E5Assigned} / {INITIAL_LICENSES.m365E5Total}
            </div>
            <div className="text-[11px] text-amber-700 mt-1 font-mono font-medium">
              3 Available (Re-allocation advised)
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-semibold text-slate-600">Autodesk AutoCAD AEC Floating Licenses</span>
            <div className="text-2xl font-bold font-mono text-blue-800 mt-1">
              {INITIAL_LICENSES.autocadFloatingInUse} / {INITIAL_LICENSES.autocadFloatingTotal}
            </div>
            <div className="text-[11px] text-blue-700 mt-1 font-mono font-medium">
              6 Floating Network Seats Available
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
