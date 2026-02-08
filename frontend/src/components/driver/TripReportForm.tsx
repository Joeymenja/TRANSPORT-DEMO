
import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Edit3, 
  ShieldCheck, 
  Calendar, 
  Gauge,
  User,
  MapPin,
  Clock,
  ArrowLeft,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

interface TripReportFormProps {
    tripData: any;
    driverInfo: any;
    startOdometer: number;
    preFill?: any;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    defaultReviewMode?: boolean;
    isSubmitting?: boolean;
    initialSignatures?: any;
    readOnly?: boolean;
}

export default function TripReportForm({
    tripData,
    driverInfo,
    startOdometer,
    preFill,
    onSubmit,
    onCancel,
    isSubmitting = false,
    readOnly = false,
}: TripReportFormProps) {
    
    const [pickupTime, setPickupTime] = useState(preFill?.pickupTime || '08:00');
    const [dropoffTime, setDropoffTime] = useState(preFill?.dropoffTime || '09:00');
    const [endOdometer, setEndOdometer] = useState(preFill?.endOdometer || '');
    const [startOdo, setStartOdo] = useState(preFill?.startOdometer || startOdometer.toString());
    
    const totalMiles = (parseFloat(endOdometer) - parseFloat(startOdo)).toFixed(1);
    const isValidMiles = !isNaN(parseFloat(totalMiles)) && parseFloat(totalMiles) >= 0;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [signatureData, setSignatureData] = useState<string | null>(null);
    const [certifyChecked, setCertifyChecked] = useState(false);

    const startDrawing = (e: any) => {
        if (readOnly) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX || e.touches?.[0]?.clientX;
        const clientY = e.clientY || e.touches?.[0]?.clientY;
        
        const x = (clientX - rect.left) * (canvas.width / rect.width);
        const y = (clientY - rect.top) * (canvas.height / rect.height);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';
        setIsDrawing(true);
    };

    const draw = (e: any) => {
        if (!isDrawing || readOnly) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX || e.touches?.[0]?.clientX;
        const clientY = e.clientY || e.touches?.[0]?.clientY;

        const x = (clientX - rect.left) * (canvas.width / rect.width);
        const y = (clientY - rect.top) * (canvas.height / rect.height);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        if (canvasRef.current) {
            setSignatureData(canvasRef.current.toDataURL());
        }
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
        setSignatureData(null);
    };

    const handleSubmit = async () => {
        if (!certifyChecked) {
            alert("Please certify the truth of this log protocol.");
            return;
        }
        if (!signatureData) {
            alert("Manual signature authorization required.");
            return;
        }
        
        const reportData = {
             tripId: tripData.id,
             legs: [{
                 pickupTime,
                 dropoffTime,
                 startOdometer: startOdo,
                 endOdometer,
                 pickupAddress: tripData.pickupAddress,
                 dropoffAddress: tripData.dropoffAddress
             }],
             signature: signatureData
        };

        const pdfBlob = new Blob([''], { type: 'application/pdf' }); 

        onSubmit({
            tripData: reportData,
            signatureData: { member: signatureData, driver: signatureData },
            pdfBlob
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            
            {/* Header HUD */}
            <div className="bg-white px-8 py-8 border-b border-gray-100 shadow-sm flex items-center justify-between sticky top-0 z-50">
               <div className="flex items-center gap-4">
                  <button onClick={onCancel} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
                     <ArrowLeft size={32}/>
                  </button>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Mission Log</h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">AHCCCS Compliance • Secure Sector</p>
                  </div>
               </div>
               <div className="flex items-center gap-2 bg-teal-50 px-4 py-2 rounded-full border border-teal-100">
                  <ShieldCheck size={16} className="text-teal-600" />
                  <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Audit Ready</span>
               </div>
            </div>

            <div className="flex-1 p-8 space-y-10 pb-40">
               
               {/* Member Identification Card */}
               <div className="bg-white p-8 rounded-[44px] border border-gray-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                     <User size={100} />
                  </div>
                  
                  <div className="flex items-center gap-6 relative z-10">
                     <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center text-3xl font-black text-teal-500 border-4 border-white shadow-xl">
                        {tripData.memberName?.[0]}
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-2">{tripData.memberName}</h3>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg">ID: {tripData.memberAhcccsId || 'PENDING'}</span>
                           <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-lg">Compliant</span>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-8">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                           <Clock size={12} className="text-teal-500"/> Pickup Cycle
                        </label>
                        <input 
                          type="time" 
                          value={pickupTime}
                          readOnly={readOnly}
                          onChange={(e) => setPickupTime(e.target.value)}
                          className="w-full bg-gray-50 border-none rounded-2xl p-4 font-black text-gray-900 focus:ring-2 focus:ring-teal-500"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                           <Clock size={12} className="text-blue-500"/> Dropoff Cycle
                        </label>
                        <input 
                          type="time" 
                          value={dropoffTime}
                          readOnly={readOnly}
                          onChange={(e) => setDropoffTime(e.target.value)}
                          className="w-full bg-gray-50 border-none rounded-2xl p-4 font-black text-gray-900 focus:ring-2 focus:ring-teal-500"
                        />
                     </div>
                  </div>
               </div>

               {/* Tactical Odometer Data */}
               <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">Telemetry Verification</h4>
                  <div className="bg-white p-8 rounded-[44px] border border-gray-100 shadow-sm space-y-6">
                     <div className="flex items-center gap-6">
                        <div className="flex-1 space-y-2">
                           <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                              <ArrowRight size={12} className="text-teal-500"/> Start Point
                           </label>
                           <input 
                             type="number" 
                             value={startOdo}
                             readOnly={readOnly}
                             onChange={(e) => setStartOdo(e.target.value)}
                             placeholder="Start Odo"
                             className="w-full bg-gray-50 border-none rounded-2xl p-5 font-black text-gray-900 text-lg placeholder-gray-300"
                           />
                        </div>
                        <div className="flex-1 space-y-2">
                           <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                              <CheckCircle2 size={12} className="text-teal-500"/> End Point
                           </label>
                           <input 
                             type="number" 
                             value={endOdometer}
                             readOnly={readOnly}
                             onChange={(e) => setEndOdometer(e.target.value)}
                             placeholder="End Odo"
                             className="w-full bg-gray-50 border-none rounded-2xl p-5 font-black text-gray-900 text-lg placeholder-gray-300"
                           />
                        </div>
                     </div>
                     
                     <div className="bg-gray-950 p-6 rounded-[32px] flex items-center justify-between shadow-2xl">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-white/10 rounded-2xl text-teal-400">
                              <Gauge size={24} />
                           </div>
                           <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Displacement</span>
                        </div>
                        <div className="text-right">
                           <span className="text-2xl font-black text-teal-400 tracking-tight">
                              {isValidMiles ? `${totalMiles} mi` : '--'}
                           </span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Authorized Sign-off */}
               <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">Authorized Certification</h4>
                  <div className="bg-white p-8 rounded-[44px] border border-gray-100 shadow-sm space-y-6">
                     <p className="text-[11px] font-bold text-gray-500 italic px-2">
                        "I hereby certify that this mission was executed in accordance with AHCCCS NEMT regulations and sector safety protocols."
                     </p>
                     
                     <div className="relative aspect-video bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 overflow-hidden touch-none group">
                        <canvas
                           ref={canvasRef}
                           width={800}
                           height={450}
                           style={{ width: '100%', height: '100%', cursor: 'crosshair' }}
                           onMouseDown={startDrawing}
                           onMouseMove={draw}
                           onMouseUp={stopDrawing}
                           onMouseLeave={stopDrawing}
                           onTouchStart={startDrawing}
                           onTouchMove={draw}
                           onTouchEnd={stopDrawing}
                           className="relative z-10"
                        />
                        {!signatureData && !isDrawing && (
                           <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-gray-300 gap-2">
                              <Edit3 size={40} className="opacity-20 translate-y-2 group-hover:translate-y-0 transition-transform" />
                              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Apply Signature Here</span>
                           </div>
                        )}
                        {signatureData && !readOnly && (
                           <button 
                             onClick={clearSignature}
                             className="absolute top-4 right-4 z-20 p-2 bg-white rounded-xl shadow-lg text-gray-400 hover:text-red-500 transition-colors"
                           >
                              <X size={18} />
                           </button>
                        )}
                     </div>

                     <button 
                       disabled={readOnly}
                       onClick={() => setCertifyChecked(!certifyChecked)}
                       className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all ${certifyChecked ? 'bg-teal-50' : 'bg-gray-50'}`}
                     >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${certifyChecked ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white border-gray-200'}`}>
                           {certifyChecked && <CheckCircle2 size={14} />}
                        </div>
                        <span className={`text-[11px] font-black uppercase tracking-wide text-left ${certifyChecked ? 'text-teal-900' : 'text-gray-500'}`}>
                           Certify Truth & Integrity of Data
                        </span>
                     </button>
                  </div>
               </div>

            </div>

            {/* Global Action Footer */}
            {!readOnly && (
               <div className="fixed bottom-0 left-0 right-0 p-8 pt-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-50 flex gap-4">
                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || !certifyChecked || !signatureData}
                    className="flex-1 bg-gray-900 text-white rounded-[28px] py-6 font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-20 disabled:grayscale"
                  >
                    <CheckCircle2 size={24} className="text-teal-400" />
                    {isSubmitting ? 'Syncing...' : 'Log & Execute Archive'}
                  </button>
               </div>
            )}

        </div>
    );
}
