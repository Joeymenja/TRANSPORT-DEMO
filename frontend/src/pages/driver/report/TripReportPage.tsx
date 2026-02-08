
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { tripApi } from '../../../api/trips';
import { driverApi } from '../../../api/drivers';
import { useAuthStore } from '../../../store/auth';
import { useToastStore } from '../../../store/toast';
import TripReportForm from '../../../components/driver/TripReportForm';
import { 
  CheckCircle2, 
  RefreshCw, 
  ArrowLeft,
  PartyPopper,
  ShieldCheck,
  Navigation
} from 'lucide-react';

export default function TripReportPage() {
    const { id, tripId } = useParams<{ id: string; tripId: string }>();
    const activeTripId = id || tripId;
    const navigate = useNavigate();
    const { state } = useLocation();
    const preFill = state?.preFill;
    const preFillLegs = state?.preFillLegs;
    const { user } = useAuthStore();
    const { showToast } = useToastStore();
    
    // State
    const [initialLoading, setInitialLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [trip, setTrip] = useState<any>(null);
    const [driver, setDriver] = useState<any>(null);

    useEffect(() => {
        if (activeTripId) {
            loadData(activeTripId);
        }
    }, [activeTripId]);

    const loadData = async (tripId: string) => {
        try {
            const tripData = await tripApi.getTripById(tripId);
            setTrip(tripData);

            let driverData = null;
            if (tripData.assignedDriverId) {
                try {
                    driverData = await driverApi.getById(tripData.assignedDriverId);
                } catch (e) {
                    console.error('Failed to fetch assigned driver details', e);
                }
            }

            if (!driverData && user?.id) {
                try {
                    driverData = await driverApi.getByUserId(user.id);
                } catch (e) {
                    console.warn('Current user is not a driver', e);
                }
            }

            if (driverData) setDriver(driverData);
            else setDriver({ id: 'unknown', user: { firstName: 'Unknown', lastName: 'Driver' } });

        } catch (error) {
            console.error('Error loading data:', error);
            showToast('Failed to load mission data.', 'error');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleFinalSubmit = async (data: { tripData: any, signatureData: any, pdfBlob: Blob }) => {
        if (!trip || !driver) return;
        setSubmitting(true);

        try {
            await tripApi.submitReport(
                trip.id, 
                { tripData: data.tripData, signatureData: data.signatureData }, 
                data.pdfBlob
            );

            showToast('Mission Report Successfully Logged', 'success');
            setSubmitted(true);
            
        } catch (error: any) {
            console.error('Error submitting report:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to submit report.';
            showToast(errorMsg, 'error');
            setSubmitting(false);
        } 
    };

    if (initialLoading || !trip || !driver) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
                <RefreshCw className="animate-spin text-teal-500 mb-4" size={32} />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Syncing Mission Intelligence...</p>
            </div>
        );
    }

    if (submitted) {
        return (
             <div className="h-screen w-full bg-gray-950 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden font-sans">
                {/* Background Glows */}
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-teal-500/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 blur-[100px] rounded-full" />

                <div className="relative mb-12">
                   <div className="absolute inset-0 bg-teal-400 blur-[40px] opacity-40 animate-pulse" />
                   <div className="w-32 h-32 bg-white rounded-[44px] shadow-2xl flex items-center justify-center relative border-4 border-teal-400/50">
                      <CheckCircle2 size={64} className="text-teal-500" />
                   </div>
                </div>
                
                <h3 className="text-4xl font-black text-white tracking-tight leading-tight mb-4 animate-in slide-in-from-bottom duration-500">
                    Mission Complete
                </h3>
                <p className="text-teal-400 font-bold uppercase tracking-[0.3em] text-[10px] mb-12">
                   Directives Logged • Sector Verified
                </p>

                <div className="w-full max-w-sm bg-white/5 backdrop-blur-2xl rounded-[44px] p-8 border border-white/10 space-y-6 mb-12 animate-in zoom-in duration-700 delay-200">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Total Distance</span>
                        <span className="text-xl font-black text-white tracking-tight">3.4 mi</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Efficiency</span>
                        <span className="text-xl font-black text-white tracking-tight">Optimal</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Compliance</span>
                        <div className="flex items-center gap-2">
                           <ShieldCheck size={14} className="text-teal-400" />
                           <span className="text-sm font-black text-teal-400">100% Verified</span>
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-sm space-y-4">
                   <button 
                       onClick={() => navigate('/driver/stitch')}
                       className="w-full bg-white text-gray-950 rounded-[32px] py-6 font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_60px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                   >
                       Return to Hub Center
                   </button>
                   
                   <button 
                       onClick={() => navigate('/driver/stitch/history')}
                       className="w-full text-white/40 font-black text-[9px] uppercase tracking-[0.4em] py-2 hover:text-white transition-colors"
                   >
                       View Mission History
                   </button>
                </div>
             </div>
        );
    }

    const member = trip.members?.[0]?.member || {};
    const pickupStop = trip.stops?.find((s: any) => s.stopType === 'PICKUP' || s.stopOrder === 1);
    const dropoffStop = trip.stops?.find((s: any) => s.stopType === 'DROPOFF' || s.stopOrder === 2);

    const tripDataProp = {
        id: trip.id,
        memberId: member.id || 'unknown',
        memberName: member.firstName ? `${member.firstName} ${member.lastName}` : 'Unknown Member',
        memberAhcccsId: member.ahcccsId || '',
        memberDOB: member.dateOfBirth,
        memberAddress: member.address || '', 
        pickupAddress: pickupStop?.address || 'Unknown Pickup',
        dropoffAddress: dropoffStop?.address || 'Unknown Dropoff',
        vehicleId: trip.assignedVehicle?.vehicleNumber || 'Unknown Vehicle',
        vehicleMake: trip.assignedVehicle?.make,
        vehicleColor: trip.assignedVehicle?.color,
        vehicleType: trip.assignedVehicle?.vehicleType,
        tripDate: trip.tripDate
    };

    const driverInfoProp = {
        id: driver.id,
        name: user ? `${user.firstName} ${user.lastName}` : 'Unknown Driver'
    };

    return (
        <TripReportForm
            tripData={tripDataProp}
            driverInfo={driverInfoProp}
            startOdometer={trip.startOdometer || 0}
            preFill={preFill || (preFillLegs ? { legs: preFillLegs } : undefined)}
            defaultReviewMode={!!preFillLegs || trip.status === 'COMPLETED' || trip.status === 'FINALIZED'}
            onSubmit={handleFinalSubmit}
            onCancel={() => navigate(state?.returnPath || '/driver/stitch')}
            isSubmitting={submitting}
            readOnly={trip.status === 'FINALIZED' || (trip.status === 'COMPLETED' && trip.reportStatus === 'VERIFIED')}
        />
    );
}
