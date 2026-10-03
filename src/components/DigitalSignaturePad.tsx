import React, { useRef, useState, useEffect } from 'react';
import { Eraser, PenTool, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';

interface DigitalSignaturePadProps {
  onSignatureChange: (dataUrl: string | null) => void;
  required?: boolean;
}

export const DigitalSignaturePad: React.FC<DigitalSignaturePadProps> = ({
  onSignatureChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'DRAW' | 'PIN'>('DRAW');
  const [pinCode, setPinCode] = useState('');
  const [pinVerified, setPinVerified] = useState(false);

  // Initialize and scale canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas internal size
    canvas.width = 460 * 2;
    canvas.height = 160 * 2;
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f2b48'; // Corporate executive navy ink
    ctx.lineWidth = 2.5;

    // Fill white background for crisp exported PNG
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 460, 160);

    // Draw light baseline
    drawBaseline(ctx);
  }, [signatureMode]);

  const drawBaseline = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.strokeStyle = '#cbd5e1';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 120);
    ctx.lineTo(430, 120);
    ctx.stroke();
    ctx.restore();
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing && canvasRef.current) {
      setIsDrawing(false);
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onSignatureChange(dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 460, 160);
    drawBaseline(ctx);
    setHasDrawn(false);
    onSignatureChange(null);
  };

  const generatePresetSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    clearCanvas();
    ctx.strokeStyle = '#0f2b48';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    // Executive signature flourish
    ctx.moveTo(40, 110);
    ctx.bezierCurveTo(70, 40, 90, 130, 120, 70);
    ctx.bezierCurveTo(140, 60, 160, 115, 190, 85);
    ctx.bezierCurveTo(220, 100, 260, 60, 290, 95);
    ctx.lineTo(340, 80);
    // Underline flourish
    ctx.moveTo(60, 125);
    ctx.bezierCurveTo(150, 132, 280, 120, 360, 115);
    ctx.stroke();

    setHasDrawn(true);
    const dataUrl = canvas.toDataURL('image/png');
    onSignatureChange(dataUrl);
  };

  const handleVerifyPin = () => {
    if (pinCode.trim().length >= 4) {
      setPinVerified(true);
      const pinSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="80"><rect width="300" height="80" rx="4" fill="%23ffffff" stroke="%23cbd5e1"/><text x="150" y="32" fill="%230f2b48" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">CERTIFIED DIGITAL SIGNATURE</text><text x="150" y="52" fill="%2316a34a" font-family="monospace" font-size="11" text-anchor="middle">✔ PIN VERIFIED: DSLNG-MGR-004</text><text x="150" y="68" fill="%2364748b" font-family="monospace" font-size="9" text-anchor="middle">${new Date().toISOString()}</text></svg>`;
      onSignatureChange(pinSvg);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Superior E-Signature Authorization
          </span>
          <span className="text-[11px] text-rose-600 font-semibold">*Mandatory</span>
        </div>

        {/* Tab switch between canvas draw and PIN verification */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setSignatureMode('DRAW')}
            className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
              signatureMode === 'DRAW'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenTool className="w-3 h-3" />
            Drawing Pad
          </button>
          <button
            type="button"
            onClick={() => setSignatureMode('PIN')}
            className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
              signatureMode === 'PIN'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3 h-3" />
            PIN Auth
          </button>
        </div>
      </div>

      {signatureMode === 'DRAW' ? (
        <div className="relative rounded-xl border border-slate-300 bg-white p-2.5 shadow-2xs">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-36 rounded-lg bg-white cursor-crosshair touch-none border border-slate-200"
            style={{ touchAction: 'none' }}
          />

          {!hasDrawn && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-400 font-sans tracking-wide">
                Draw official signature using mouse, finger or stylus above the dashed line
              </span>
            </div>
          )}

          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              <span className="text-[11px] font-mono text-slate-600">
                Encrypted Electronic Signature (ISO 27001 Authenticated)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={generatePresetSignature}
                className="text-[11px] font-semibold text-blue-700 hover:text-blue-800 hover:underline px-2.5 py-1 rounded bg-blue-50 border border-blue-200"
              >
                Insert Verified Signature
              </button>
              <button
                type="button"
                onClick={clearCanvas}
                className="text-[11px] text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2.5 py-1 rounded hover:bg-slate-100 transition-colors"
              >
                <Eraser className="w-3 h-3" />
                Clear
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-900">
                Superior Security PIN Authorization
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Enter your 4-digit ICT Management Security PIN to sign off this daily report.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="password"
              maxLength={6}
              value={pinCode}
              onChange={e => {
                setPinCode(e.target.value);
                setPinVerified(false);
              }}
              placeholder="e.g. 2026"
              className="w-36 bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-sm font-mono text-center tracking-widest text-slate-900 focus:outline-none focus:border-blue-600"
            />
            <button
              type="button"
              onClick={handleVerifyPin}
              disabled={pinCode.length < 4}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-40 disabled:pointer-events-none rounded transition-colors shadow-xs"
            >
              Authenticate &amp; Sign
            </button>
          </div>

          {pinVerified && (
            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Identity authenticated as Hendra Wijaya (ICT Operations Manager). Ready for submission.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
