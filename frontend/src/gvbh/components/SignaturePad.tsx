
import React, { useRef, useState, useEffect } from 'react';
// Added CheckCircle2 to the imports to fix the reference error on line 136
import { X, Check, PenTool, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface SignaturePadProps {
  onSave: (bundle: { data: string; metadata: any }) => void;
  onClear: () => void;
  saved?: boolean;
  label?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onClear, saved, label = "Sign Here" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [pointCount, setPointCount] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2; // High DPI scaling
      canvas.height = rect.height * 2;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(2, 2);
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#0f172a';
      }
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (saved) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      const { x, y } = getCoordinates(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      setPointCount(prev => prev + 1);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || saved) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      const { x, y } = getCoordinates(e);
      ctx.lineTo(x, y);
      ctx.stroke();
      setHasSignature(true);
      setPointCount(prev => prev + 1);
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas && hasSignature && pointCount > 3) {
        onSave({
          data: canvas.toDataURL('image/png'),
          metadata: {
            timestamp: new Date().toISOString(),
            deviceId: 'GVBH-AUDIT-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
            gps: { lat: 33.4484, lng: -112.0740 },
            resolution: 'High (2x)',
            points: pointCount
          }
        });
      }
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      setHasSignature(false);
      setPointCount(0);
      onClear();
    }
  };

  return (
    <div className={`relative w-full h-48 bg-white rounded-[32px] transition-all overflow-hidden touch-none ${saved ? 'bg-green-50/20' : 'hover:bg-white/80 shadow-inner'}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair touch-none"
        style={{ touchAction: 'none' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      {!hasSignature && !saved && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-gray-200">
          <PenTool size={32} className="mb-2 opacity-30" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
        </div>
      )}
      {hasSignature && !saved && (
        <button onClick={handleClear} className="absolute top-4 right-4 p-2.5 bg-white rounded-full text-gray-400 active:scale-90 shadow-lg border border-gray-100"><X size={16} /></button>
      )}
      {saved && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[0.5px] flex items-center justify-center pointer-events-none">
          <div className="bg-white p-5 rounded-[24px] shadow-xl border border-green-100 animate-in zoom-in">
             <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-green-500" />
                <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Attested</span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignaturePad;
