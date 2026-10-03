import React, { useRef, useState } from 'react';
import { Camera, Upload, Trash2, Eye, CheckCircle2, AlertCircle } from 'lucide-react';
import { SAMPLE_INSPECTION_PROOFS } from '../data/mockData';

interface PhotoUploadFieldProps {
  roomKey: string;
  roomName: string;
  photoUrl: string;
  onPhotoUploaded: (url: string, timestamp: string) => void;
  onPhotoRemoved: () => void;
  disabled?: boolean;
}

export const PhotoUploadField: React.FC<PhotoUploadFieldProps> = ({
  roomKey,
  roomName,
  photoUrl,
  onPhotoUploaded,
  onPhotoRemoved,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' WITA';
      onPhotoUploaded(base64Data, now);
    };
    reader.readAsDataURL(file);
  };

  const handleUseSample = () => {
    let sampleKey = 'maleo';
    const lower = roomName.toLowerCase();
    if (lower.includes('tarsius')) sampleKey = 'tarsius';
    else if (lower.includes('cendrawasih')) sampleKey = 'cendrawasih';
    else if (lower.includes('nusantara')) sampleKey = 'nusantara';

    const sample = SAMPLE_INSPECTION_PROOFS[sampleKey] || SAMPLE_INSPECTION_PROOFS.maleo;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' WITA';
    onPhotoUploaded(sample, now);
  };

  return (
    <div className="space-y-2">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={disabled}
      />
      {/* Direct mobile camera trigger */}
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
        disabled={disabled}
      />

      {photoUrl ? (
        <div className="relative group rounded-lg overflow-hidden border border-slate-200 bg-white shadow-2xs">
          <div className="relative h-36 bg-slate-100 flex items-center justify-center overflow-hidden">
            <img
              src={photoUrl}
              alt={`Physical inspection proof for ${roomName}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 rounded-md flex items-center gap-1 shadow-sm"
              >
                <Eye className="w-3.5 h-3.5" />
                Inspect
              </button>
              {!disabled && (
                <button
                  type="button"
                  onClick={onPhotoRemoved}
                  className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md flex items-center gap-1 shadow-sm border border-rose-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              )}
            </div>

            <div className="absolute bottom-1.5 left-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono text-emerald-800 font-bold flex items-center gap-1 border border-emerald-200 shadow-2xs">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Mandatory Proof Attached</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-amber-300 hover:border-amber-400 bg-amber-50/40 p-3.5 text-center transition-colors">
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
              <AlertCircle className="w-4 h-4" />
            </div>

            <p className="text-xs font-bold text-slate-800">
              Mandatory Inspection Photo Required
            </p>
            <p className="text-[11px] text-slate-600 max-w-xs">
              Take a photo of room display, microphone pod, and sharing cables.
            </p>

            {!disabled && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Take Photo (Mobile)
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Browse File
                </button>

                <button
                  type="button"
                  onClick={handleUseSample}
                  className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors"
                >
                  Attach Live Proof
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* High-res modal preview */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-5 space-y-3 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Physical Evidence: {roomName}
                </span>
                <span className="text-[11px] text-emerald-700 font-mono font-bold">
                  Verified Inspection
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-xs text-slate-600 hover:text-slate-900 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 font-semibold"
              >
                Close
              </button>
            </div>

            <div className="relative rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center max-h-[70vh] border border-slate-200">
              <img
                src={photoUrl}
                alt={`Evidence proof ${roomName}`}
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span className="font-mono text-[11px]">
                PT Donggi-Senoro LNG ICT Operations - Physical Inspection Archive
              </span>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-semibold"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
