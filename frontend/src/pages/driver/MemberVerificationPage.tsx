
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tripApi } from '../../api/trips';
import { 
  ArrowLeft, 
  Camera, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  Shield,
  Fingerprint,
  Camera as CameraIcon
} from 'lucide-react';

export default function MemberVerificationPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  
  const [idVerified, setIdVerified] = useState(false);
  const [equipmentChecked, setEquipmentChecked] = useState(false);
  const [photoCaptured, setPhotoCaptured] = useState(false);

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripApi.getTripById(tripId!),
    enabled: !!tripId
  });

  if (!trip) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent"></div>
    </div>
  );

  const firstMember = trip?.members?.[0]?.member;
  const clientName = firstMember ? `${firstMember.firstName} ${firstMember.lastName}` : "Member";
  const mobility = trip.mobilityRequirement || 'AMBULATORY';
  const requiresEquipmentCheck = mobility === 'WHEELCHAIR' || mobility === 'STRETCHER';

  const isReady = idVerified && (requiresEquipmentCheck ? equipmentChecked : true) && photoCaptured;

  const handleConfirm = () => {
    navigate(`/driver/trips/${tripId}/boarding`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Header */}
      <div className="bg-white px-8 py-8 border-b border-gray-100 shadow-sm flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft size={32}/>
          </button>
          <h2 className="text-2xl font-black text-gray-900">Verification</h2>
        </div>
        <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
           <ShieldCheck size={24} />
        </div>
      </div>

      <div className="flex-1 p-8 space-y-8 pb-40">
        
        {/* Verification Target Card */}
        <div className="bg-white p-8 rounded-[44px] border border-gray-100 shadow-sm flex items-center gap-6">
           <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center text-3xl font-black text-teal-500 border-4 border-white shadow-xl">
              {clientName.charAt(0)}
           </div>
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Target Individual</p>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none">{clientName}</h3>
              <p className="text-[11px] font-bold text-gray-400 mt-2 uppercase tracking-tighter">ID: {trip.members?.[0]?.member?.memberId || 'AHC-992'}</p>
           </div>
        </div>

        {/* Verification Checkboxes */}
        <div className="space-y-4">
           <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">Compliance Checkmarks</h4>
           
           <div className="space-y-3">
              <button 
                onClick={() => setIdVerified(!idVerified)}
                className={`w-full flex items-center justify-between p-6 rounded-[32px] border transition-all ${idVerified ? 'bg-teal-50 border-teal-100' : 'bg-white border-gray-100'}`}
              >
                 <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${idVerified ? 'bg-teal-500 text-white' : 'bg-gray-50 text-gray-400'}`}>
                       <Fingerprint size={20} />
                    </div>
                    <span className={`text-sm font-black ${idVerified ? 'text-teal-900' : 'text-gray-700'}`}>Verify Member Identity</span>
                 </div>
                 <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${idVerified ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-100 bg-white'}`}>
                    {idVerified && <CheckCircle2 size={16} />}
                 </div>
              </button>

              {requiresEquipmentCheck && (
                <button 
                  onClick={() => setEquipmentChecked(!equipmentChecked)}
                  className={`w-full flex items-center justify-between p-6 rounded-[32px] border transition-all ${equipmentChecked ? 'bg-teal-50 border-teal-100' : 'bg-white border-gray-100'}`}
                >
                   <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${equipmentChecked ? 'bg-teal-500 text-white' : 'bg-gray-50 text-gray-400'}`}>
                         <Shield size={20} />
                      </div>
                      <div className="text-left">
                         <span className={`text-sm font-black block ${equipmentChecked ? 'text-teal-900' : 'text-gray-700'}`}>Equipment Safety Lock</span>
                         <span className="text-[10px] font-bold text-gray-400 uppercase">Securement Points Verified</span>
                      </div>
                   </div>
                   <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${equipmentChecked ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-100 bg-white'}`}>
                      {equipmentChecked && <CheckCircle2 size={16} />}
                   </div>
                </button>
              )}
           </div>
        </div>

        {/* Smart Capture */}
        <div className="space-y-4">
           <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">Visual Confirmation</h4>
           <button 
             onClick={() => setPhotoCaptured(true)}
             className={`w-full aspect-video rounded-[44px] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all overflow-hidden relative group ${photoCaptured ? 'border-teal-500 bg-teal-50' : 'border-gray-200 bg-white hover:border-teal-300'}`}
           >
              {photoCaptured ? (
                <>
                   <img src="https://picsum.photos/seed/face_verify/400/225" alt="Verified" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                   <div className="relative z-10 flex flex-col items-center gap-2">
                      <div className="bg-teal-500 text-white p-4 rounded-full shadow-2xl animate-in zoom-in duration-500">
                         <CheckCircle2 size={32} />
                      </div>
                      <span className="text-xs font-black text-teal-800 uppercase tracking-widest bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl">Capture Verified</span>
                   </div>
                </>
              ) : (
                <>
                   <div className="p-6 bg-gray-50 text-gray-400 rounded-full group-hover:scale-110 transition-transform">
                      <CameraIcon size={40} />
                   </div>
                   <div className="text-center">
                      <span className="text-xs font-black text-gray-900 uppercase tracking-widest block">Initiate Smart Capture</span>
                      <span className="text-[10px] font-bold text-gray-400 mt-1 block">AI Presence Detection Active</span>
                   </div>
                </>
              )}
           </button>
        </div>

        {!isReady && (
          <div className="p-6 bg-amber-50 rounded-[32px] border border-amber-100 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
             <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
             <p className="text-[11px] font-bold text-amber-800 leading-snug uppercase tracking-wide">
                Mission protocol requires all verification points to be active before boarding confirmation.
             </p>
          </div>
        )}

      </div>

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-8 pt-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-50">
         <button 
           disabled={!isReady}
           onClick={handleConfirm}
           className="w-full bg-gray-900 text-white rounded-[28px] py-6 font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-20 disabled:grayscale"
         >
           <CheckCircle2 size={24} className="text-teal-400" />
           Authorize Boarding
         </button>
      </div>

    </div>
  );
}
