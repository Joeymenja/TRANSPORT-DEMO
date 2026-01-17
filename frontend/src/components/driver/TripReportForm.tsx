import { useState, useRef, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Checkbox,
    Divider,
    Alert,
    Select,
    MenuItem,
    InputLabel,
    IconButton,
    Dialog,
    Slide,
    Autocomplete,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import TimeWheelSelector from '../common/TimeWheelSelector';
import { TransitionProps } from '@mui/material/transitions';
import React from 'react';
import { generateTripReportPdf } from '../../utils/pdfGenerator';
import { Clear, CheckCircle, Description, Create, Edit, Warning } from '@mui/icons-material';
import { format, parse } from 'date-fns';

const REASONS_FOR_VISIT = [
    'Primary Care (PCP)',
    'Psychiatric Appointment',
    'Behavioral Health / Counseling',
    'Medication Pickup (RX)',
    'Dialysis',
    'Hospital / ER',
    'MyDrNow / Urgent Care',
    'Specialist Visit',
    'Other (Medical)',
];

const NON_COVERED_REASONS = [
    'Grocery Shopping',
    'Social Visit',
    'Job Interview',
    'Court / Legal',
    'Housing Appointment',
    'Bank / Personal Errand',
];

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

interface TripReportFormProps {
    tripData: {
        id: string;
        memberId: string;
        memberName: string;
        memberAhcccsId?: string;
        memberDOB?: string;
        memberAddress?: string;
        pickupAddress: string;
        dropoffAddress: string;
        vehicleId: string;
        vehicleMake?: string;
        vehicleColor?: string;
        vehicleType?: string;
    };
    driverInfo: {
        id: string;
        name: string;
    };
    startOdometer: number;
    preFill?: {
        pickupTime?: string;
        dropoffTime?: string;
        startOdometer?: string;
        endOdometer?: string;
        reasonForVisit?: string;
        legs?: any[];
    };
    onSubmit: (data: any) => void;
    onCancel: () => void;
    defaultReviewMode?: boolean;
    isSubmitting?: boolean;
    readOnly?: boolean;
}

export default function TripReportForm({
    tripData,
    driverInfo,
    startOdometer,
    preFill,
    onSubmit,
    onCancel,
    defaultReviewMode = false,
    isSubmitting = false,
    readOnly = false,
}: TripReportFormProps) {
    // Form state
    const [legs, setLegs] = useState<any[]>(preFill?.legs || [
        {
            pickupAddress: tripData.pickupAddress,
            dropoffAddress: tripData.dropoffAddress,
            pickupTime: preFill?.pickupTime || '08:00',
            dropoffTime: preFill?.dropoffTime || '09:00',
            startOdometer: preFill?.startOdometer || startOdometer.toString(),
            endOdometer: preFill?.endOdometer || '',
            reasonForVisit: preFill?.reasonForVisit || 'Behavioral Health / Counseling',
            tripType: 'ONE_WAY'
        }
    ]);

    const [escortName, setEscortName] = useState('');
    const [escortRelationship, setEscortRelationship] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [serviceVerified, setServiceVerified] = useState(true);
    const [clientArrived, setClientArrived] = useState(true);
    const [incidentReported, setIncidentReported] = useState(false);
    const [incidentDescription, setIncidentDescription] = useState('');
    const [multipleMembers, setMultipleMembers] = useState(false);
    const [differentLocations, setDifferentLocations] = useState(false);
    const [reportDate, setReportDate] = useState<Date | null>(new Date());

    const [signatureData, setSignatureData] = useState<string | null>(null);
    const [driverSignatureData, setDriverSignatureData] = useState<string | null>(null);
    const [memberUnableToSign, setMemberUnableToSign] = useState(false);
    const [proxySignerType, setProxySignerType] = useState('');
    const [refusalReason] = useState('');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const driverCanvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isDrawingDriver, setIsDrawingDriver] = useState(false);

    // Document Viewer State
    const [viewerOpen, setViewerOpen] = useState(false);
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
    const [isReviewing, setIsReviewing] = useState(defaultReviewMode);

    const [showDriverSignaturePad, setShowDriverSignaturePad] = useState(false);

    // Member Signature Drawing
    const startDrawing = (e: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000';
        setIsDrawing(true);
    };

    const draw = (e: any) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
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

    const usePrintedNameAsSignature = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = 'italic 32px "Dancing Script", "Cursive", "Apple Chancery", serif';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(tripData.memberName, canvas.width / 2, canvas.height / 2 + 10);
        
        // Add a subtle line under
        ctx.beginPath();
        ctx.moveTo(50, canvas.height / 2 + 25);
        ctx.lineTo(350, canvas.height / 2 + 25);
        ctx.strokeStyle = '#333';
        ctx.stroke();

        setSignatureData(canvas.toDataURL());
        setShowSignaturePad(false);
    };

    // Driver Signature Drawing
    const startDrawingDriver = (e: any) => {
        const canvas = driverCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000';
        setIsDrawingDriver(true);
    };

    const drawDriver = (e: any) => {
        if (!isDrawingDriver) return;
        const canvas = driverCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath(); // Reset path to avoid connecting lines
        ctx.moveTo(x, y);
    };

    const stopDrawingDriver = () => {
        if (!isDrawingDriver) return;
        setIsDrawingDriver(false);
        if (driverCanvasRef.current) {
            setDriverSignatureData(driverCanvasRef.current.toDataURL());
        }
    };

    const clearDriverSignature = () => {
        const canvas = driverCanvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
        setDriverSignatureData(null);
    };

    // Helper to construct report data
    const getReportData = () => {
        const processedLegs = legs.map(leg => ({
            ...leg,
            pickupTime: new Date(`${format(reportDate || new Date(), 'yyyy-MM-dd')}T${leg.pickupTime}`).toISOString(),
            dropoffTime: new Date(`${format(reportDate || new Date(), 'yyyy-MM-dd')}T${leg.dropoffTime}`).toISOString(),
            startOdometer: parseFloat(leg.startOdometer),
            endOdometer: parseFloat(leg.endOdometer),
            totalMiles: parseFloat(leg.endOdometer) - parseFloat(leg.startOdometer),
            patientEscort: !!escortName,
            escortName: escortName || null,
            escortRelationship: escortRelationship || null
        }));

        return {
            id: tripData.id,
            driverId: driverInfo.id,
            driverName: driverInfo.name,
            tripDate: format(reportDate || new Date(), 'yyyy-MM-dd'),
            vehicleId: tripData.vehicleId,
            vehicleColor: tripData.vehicleColor,
            vehicleMake: tripData.vehicleMake,
            vehicleType: tripData.vehicleType,
            memberAhcccsId: tripData.memberAhcccsId,
            memberDOB: tripData.memberDOB,
            memberName: tripData.memberName,
            memberAddress: tripData.memberAddress,
            legs: processedLegs,
            additionalInfo: additionalInfo || null,
            serviceVerified,
            clientArrived,
            incidentReported,
            incidentDescription: incidentReported ? incidentDescription : null,
            multipleMembers,
            differentLocations: multipleMembers ? differentLocations : null,
            refusedSignature: memberUnableToSign,
            refusalReason: memberUnableToSign ? (proxySignerType || refusalReason) : null,
            memberSignature: signatureData,
            driverSignature: driverSignatureData,
        };
    };

    const updatePdfPreview = async () => {
        try {
            const data = getReportData();
            const blob = await generateTripReportPdf(data);
            const url = URL.createObjectURL(blob);
            setPdfPreviewUrl(url);
        } catch (error) {
            console.error('Failed to generate preview', error);
        }
    };

    // Effect to update preview when Reviewing or Signatures change
    useEffect(() => {
        if (isReviewing) {
            updatePdfPreview();
        }
    }, [isReviewing, signatureData, driverSignatureData, memberUnableToSign]);

    // Submit Handler (First Step: Review)
    const handleReview = async () => {
        const incompleteLeg = legs.find(l => !l.endOdometer || !l.pickupTime || !l.dropoffTime);
        if (incompleteLeg) {
            alert('Please fill in times and end odometer for all legs');
            return;
        }

        // We just switch mode, the useEffect will handle the preview generation
        setIsReviewing(true);
    };

    // Final Submit
    const handleFinalSubmit = async () => {
        const reportData = getReportData();

        try {
            const pdfBlob = await generateTripReportPdf(reportData);

            onSubmit({
                 tripData: reportData,
                 signatureData: {
                     member: signatureData,
                     driver: driverSignatureData,
                     driverName: driverInfo.name
                 },
                 pdfBlob: pdfBlob
            });
        } catch (error) {
            console.error("PDF Prep Failed", error);
            alert("Failed to generate PDF report");
        }
    };



    const renderReviewView = () => (
        <Box sx={{ pb: 12, px: 2, pt: 2 }}>
             <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: '#0096D6', textAlign: 'center' }}>
                Review Trip Report
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                Please review the generated report below before signing and submitting.
            </Typography>

            {pdfPreviewUrl && (
                <Box sx={{ mb: 3, height: readOnly ? '700px' : '500px', border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                    <iframe 
                        src={pdfPreviewUrl} 
                        style={{ width: '100%', height: '100%', border: 'none' }} 
                        title="PDF Preview"
                    />
                </Box>
            )}

            {!readOnly && (
                <>
                <Paper elevation={0} sx={{ p: 3, mb: 2, borderRadius: 3, border: '1px solid #e0e0e0' }}>
                    <Typography variant="overline" color="text.secondary" fontWeight={700}>TRIP SUMMARY</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Date</Typography>
                        <Typography variant="body2" fontWeight={600}>{format(reportDate || new Date(), 'yyyy-MM-dd')}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Total Legs</Typography>
                        <Typography variant="body2" fontWeight={600}>{legs.length}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    {legs.map((leg, i) => (
                        <Box key={i} sx={{ mb: 2 }}>
                            <Typography variant="caption" fontWeight={700} color="primary">LEG {i+1}</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption">{leg.pickupTime} - {leg.dropoffTime}</Typography>
                                <Typography variant="caption" fontWeight={700}>
                                    {(leg.endOdometer && leg.startOdometer) 
                                        ? (parseFloat(leg.endOdometer) - parseFloat(leg.startOdometer)).toFixed(1) 
                                        : '0.0'} mi
                                </Typography>
                            </Box>
                            <Typography variant="caption" display="block" noWrap color="text.secondary">
                                {leg.pickupAddress.split(',')[0]} → {leg.dropoffAddress.split(',')[0]}
                            </Typography>
                        </Box>
                    ))}
                </Paper>

                <Paper elevation={0} sx={{ p: 3, mb: 2, borderRadius: 3, border: '1px solid #e0e0e0' }}>
                    <Typography variant="overline" color="text.secondary" fontWeight={700}>DETAILS</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">Reason for Visit</Typography>
                        <Typography variant="body2">{legs[0]?.reasonForVisit || 'N/A'}</Typography>
                    </Box>
                    {additionalInfo && (
                        <Box sx={{ mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">Notes</Typography>
                            <Typography variant="body2">{additionalInfo}</Typography>
                        </Box>
                    )}
                    {incidentReported && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                            <Typography variant="caption" fontWeight={700}>Incident Reported</Typography>
                            <Typography variant="body2">{incidentDescription}</Typography>
                        </Alert>
                    )}
                </Paper>
                </>
            )}

            {!readOnly && (
                <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #e0e0e0' }}>
                    <Typography variant="overline" color="text.secondary" fontWeight={700}>SIGNATURES</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <Box 
                            sx={{ flex: 1, textAlign: 'center', p: 1, bgcolor: '#f9f9f9', borderRadius: 2, cursor: 'pointer' }}
                            onClick={() => { if (!signatureData && !memberUnableToSign) { setViewerOpen(true); setShowSignaturePad(true); } }}
                        >
                            <Typography variant="caption" display="block">Member</Typography>
                            {signatureData ? (
                                <img src={signatureData} style={{ height: 30 }} alt="Member" />
                            ) : (
                                <Typography variant="caption" fontWeight={700} color={memberUnableToSign ? 'success.main' : 'error'}>
                                    {memberUnableToSign ? 'EXEMPT' : 'TAP TO SIGN'}
                                </Typography>
                            )}
                        </Box>
                        <Box 
                            sx={{ flex: 1, textAlign: 'center', p: 1, bgcolor: '#f9f9f9', borderRadius: 2, cursor: 'pointer' }}
                            onClick={() => { if (!driverSignatureData) { setViewerOpen(true); setShowDriverSignaturePad(true); } }}
                        >
                            <Typography variant="caption" display="block">Driver</Typography>
                            {driverSignatureData ? (
                                <img src={driverSignatureData} style={{ height: 30 }} alt="Driver" />
                            ) : (
                                <Typography variant="caption" fontWeight={700} color="error">TAP TO SIGN</Typography>
                            )}
                        </Box>
                    </Box>
                </Paper>
            )}

            {!readOnly && (
                <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={(!signatureData && !memberUnableToSign) || !driverSignatureData || isSubmitting}
                    onClick={handleFinalSubmit}
                    sx={{ height: 56, borderRadius: 3, fontSize: '1.1rem', mb: 2, boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)' }}
                >
                    {isSubmitting ? 'Submitting Report...' : (!signatureData && !memberUnableToSign ? 'Member Signature Required' : !driverSignatureData ? 'Driver Signature Required' : 'Confirm & Submit Report')}
                </Button>
            )}

            <Button
                variant={readOnly ? "contained" : "text"}
                fullWidth
                onClick={readOnly ? onCancel : () => setIsReviewing(false)}
                sx={{ color: readOnly ? 'white' : 'text.secondary', height: readOnly ? 56 : 'auto', borderRadius: readOnly ? 3 : 0 }}
            >
                {readOnly ? 'Close Report' : 'Back to Edit'}
            </Button>
        </Box>
    );

    return (
        <Box sx={{ pb: 12 }}>
            {isReviewing ? renderReviewView() : (
                <>
            <Box sx={{ p: 2, mb: 1, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={800}>Final Trip Report</Typography>
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                    {format(reportDate || new Date(), 'MMM d, yyyy')}
                </Typography>
            </Box>


            <Box sx={{ px: 2 }}>
                {/* Member Information */}
                <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa', borderRadius: 3 }}>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>MEMBER INFORMATION</Typography>
                    <Typography variant="body2">Name: {tripData.memberName}</Typography>
                    {tripData.memberAhcccsId && (
                        <Typography variant="body2">AHCCCS #: {tripData.memberAhcccsId}</Typography>
                    )}
                    {tripData.memberDOB && (
                        <Typography variant="body2">DOB: {tripData.memberDOB}</Typography>
                    )}
                </Paper>

                {/* Vehicle Information */}
                <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa', borderRadius: 3 }}>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>VEHICLE INFORMATION</Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary">Fleet ID</Typography>
                            <Typography variant="body2" fontWeight={700}>{tripData.vehicleId}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">Make/Color</Typography>
                            <Typography variant="body2">{tripData.vehicleColor} {tripData.vehicleMake}</Typography>
                        </Box>
                    </Box>
                    
                    <FormControl fullWidth size="small">
                        <InputLabel>Vehicle Type *</InputLabel>
                        <Select
                            value={tripData.vehicleType || 'Wheelchair Van'}
                            label="Vehicle Type *"
                            disabled // Driver selects vehicle, system knows type
                        >
                            <MenuItem value="Wheelchair Van">Wheelchair Van</MenuItem>
                            <MenuItem value="Taxi">Taxi</MenuItem>
                            <MenuItem value="Bus">Bus</MenuItem>
                            <MenuItem value="Stretcher Van">Stretcher Van</MenuItem>
                            <MenuItem value="Private Auto">Private Auto</MenuItem>
                        </Select>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                            Type is locked based on assigned vehicle profile.
                        </Typography>
                    </FormControl>
                </Paper>

                {/* Trip Legs */}
                <Typography variant="subtitle2" fontWeight={700} sx={{ px: 1, mb: 1 }}>TRIP LEGS ({legs.length}/6)</Typography>
                
                {legs.map((leg, index) => (
                    <Paper key={index} elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '2px solid #0096D6' }}>
                        <Typography variant="caption" fontWeight={700} color="primary">LEG {index + 1}</Typography>
                        
                        <Box sx={{ my: 1.5 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Pickup Location</Typography>
                            <Typography variant="body2" fontWeight={600}>{leg.pickupAddress}</Typography>
                            
                            <Box sx={{ mt: 1.5, mb: 1.5 }}>
                                <TimeWheelSelector
                                    label="Pickup Time *"
                                    value={leg.pickupTime}
                                    onChange={(newValue) => {
                                        const newLegs = [...legs];
                                        newLegs[index].pickupTime = newValue;
                                        setLegs(newLegs);
                                    }}
                                />
                            </Box>

                            <TextField
                                label="Pickup Odometer"
                                fullWidth
                                value={leg.startOdometer}
                                onChange={(e) => {
                                    const newLegs = [...legs];
                                    newLegs[index].startOdometer = e.target.value;
                                    setLegs(newLegs);
                                }}
                                sx={{ mb: 1.5, bgcolor: '#f5f5f5' }}
                                size="small"
                            />
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ mb: 1.5 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Dropoff Location</Typography>
                            <Typography variant="body2" fontWeight={600}>{leg.dropoffAddress}</Typography>

                            <Box sx={{ mt: 1.5, mb: 1.5 }}>
                                <TimeWheelSelector
                                    label="Dropoff Time *"
                                    value={leg.dropoffTime}
                                    onChange={(newValue) => {
                                        const newLegs = [...legs];
                                        newLegs[index].dropoffTime = newValue;
                                        setLegs(newLegs);
                                    }}
                                />
                            </Box>

                            <TextField
                                label="End Odometer *"
                                type="number"
                                fullWidth
                                value={leg.endOdometer}
                                onChange={(e) => {
                                    const newLegs = [...legs];
                                    newLegs[index].endOdometer = e.target.value;
                                    setLegs(newLegs);
                                }}
                                sx={{ mb: 1.5, bgcolor: 'white' }}
                                size="small"
                                helperText={leg.endOdometer && leg.startOdometer ? `Leg Miles: ${(parseFloat(leg.endOdometer) - parseFloat(leg.startOdometer)).toFixed(1)}` : ''}
                            />
                        </Box>

                        <Autocomplete
                            freeSolo
                            options={[...REASONS_FOR_VISIT, ...NON_COVERED_REASONS]}
                            value={leg.reasonForVisit}
                            onInputChange={(_, newValue) => {
                                const newLegs = [...legs];
                                newLegs[index].reasonForVisit = newValue;
                                setLegs(newLegs);
                            }}
                            renderInput={(params) => (
                                <TextField 
                                    {...params} 
                                    label="Reason for Visit *" 
                                    size="small" 
                                    sx={{ mt: 1, bgcolor: 'white' }} 
                                />
                            )}
                        />
                    </Paper>
                ))}

                {/* Service Verification */}
                <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>SERVICE VERIFICATION</Typography>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={serviceVerified}
                                onChange={(e) => setServiceVerified(e.target.checked)}
                            />
                        }
                        label="Service was provided as scheduled"
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={clientArrived}
                                onChange={(e) => setClientArrived(e.target.checked)}
                            />
                        }
                        label="Client arrived at destination"
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={multipleMembers}
                                onChange={(e) => setMultipleMembers(e.target.checked)}
                            />
                        }
                        label="Multiple members transported in same vehicle"
                    />

                    {multipleMembers && (
                        <Box sx={{ ml: 4, mt: 1 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={differentLocations}
                                        onChange={(e) => setDifferentLocations(e.target.checked)}
                                    />
                                }
                                label="Different pickup/dropoff locations for members"
                            />
                        </Box>
                    )}
                </Paper>

                {/* Incident Reporting */}
                <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: incidentReported ? '2px solid #d32f2f' : '1px solid #e0e0e0' }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={incidentReported}
                                onChange={(e) => setIncidentReported(e.target.checked)}
                                color="error"
                            />
                        }
                        label={
                            <Typography fontWeight={700} color={incidentReported ? 'error' : 'inherit'}>
                                Incident Occurred During Trip
                            </Typography>
                        }
                    />

                    {incidentReported && (
                        <TextField
                            label="Incident Description *"
                            fullWidth
                            multiline
                            rows={3}
                            value={incidentDescription}
                            onChange={(e) => setIncidentDescription(e.target.value)}
                            sx={{ mt: 2, bgcolor: 'white' }}
                            placeholder="Describe what happened in detail..."
                            required
                        />
                    )}
                </Paper>

                {/* Additional Information */}
                <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                    <TextField
                        label="Additional Information / Notes"
                        fullWidth
                        multiline
                        rows={3}
                        value={additionalInfo}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                        sx={{ bgcolor: 'white' }}
                        placeholder="Any other relevant information..."
                    />
                </Paper>

                {/* Member Signature - UPDATED workflow */}
                <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '2px solid #0096D6' }}>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom color="primary">
                        MEMBER SIGNATURE *
                    </Typography>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={memberUnableToSign}
                                onChange={(e) => {
                                    setMemberUnableToSign(e.target.checked);
                                    if (e.target.checked) clearSignature();
                                }}
                            />
                        }
                        label="Member is unable to sign"
                        sx={{ mb: 2 }}
                    />

                    {!memberUnableToSign && (
                        <>
                            {signatureData ? (
                                <Box sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2, bgcolor: '#f9f9f9', textAlign: 'center' }}>
                                    <img src={signatureData} alt="Client Signature" style={{ maxHeight: 60, maxWidth: '100%' }} />
                                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>Signed on {new Date().toLocaleDateString()}</Typography>
                                    <Button size="small" onClick={() => setViewerOpen(true)} startIcon={<Description />}>
                                        View Document & Signature
                                    </Button>
                                    <Button size="small" onClick={() => { setSignatureData(null); setViewerOpen(true); setShowSignaturePad(true); }} color="error" sx={{ ml: 1 }}>
                                        Re-Sign
                                    </Button>
                                </Box>
                            ) : (
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => { setViewerOpen(true); setShowSignaturePad(true); }}
                                    startIcon={<Create />}
                                    sx={{ height: 60, borderRadius: 3 }}
                                >
                                    Sign Report Now
                                </Button>
                            )}
                        </>
                    )}

                    {memberUnableToSign && (
                        <Box sx={{ mt: 2 }}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Person Signing for Member</InputLabel>
                                <Select
                                    value={proxySignerType}
                                    onChange={(e) => setProxySignerType(e.target.value)}
                                    label="Person Signing for Member"
                                >
                                    <MenuItem value="Attendant">Attendant</MenuItem>
                                    <MenuItem value="Escort">Escort</MenuItem>
                                    <MenuItem value="Guardian">Guardian</MenuItem>
                                    <MenuItem value="Parent">Parent</MenuItem>
                                    <MenuItem value="Provider">Provider</MenuItem>
                                    <MenuItem value="Fingerprint">Member Fingerprint</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    )}
                </Paper>

                {/* Document Viewer Modal */}
                <Dialog
                    fullScreen
                    open={viewerOpen}
                    onClose={() => setViewerOpen(false)}
                    TransitionComponent={Transition}
                >
                    <Box sx={{ bgcolor: '#525659', flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Box sx={{ p: 2, bgcolor: '#323639', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 3 }}>
                            <Typography variant="h6">Trip Report Packet</Typography>
                            <IconButton onClick={() => setViewerOpen(false)} sx={{ color: 'white' }}>
                                <Clear />
                            </IconButton>
                        </Box>
                        
                        <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative', bgcolor: '#f5f5f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                                Please obtain signatures below.
                            </Typography>
                            {/* Signature Status Overlay - Moved to Top */}
                            <Paper
                                elevation={2}
                                sx={{
                                    position: 'absolute',
                                    top: 10,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    p: 1.5,
                                    borderRadius: 3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(4px)',
                                    zIndex: 10,
                                    border: '1px solid #e0e0e0'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box>
                                        <Typography variant="caption" fontWeight={700} display="block">
                                            {signatureData || memberUnableToSign ? '✓ Member' : 'Member Pending'}
                                        </Typography>
                                        <Typography variant="caption" fontWeight={700} display="block">
                                            {driverSignatureData ? '✓ Driver' : 'Driver Pending'}
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" color={signatureData && driverSignatureData ? 'success.main' : 'error'}>
                                        {(signatureData || memberUnableToSign) && driverSignatureData ? 'Ready to Submit' : 'Signatures Required'}
                                    </Typography>
                                </Box>

                                {!driverSignatureData && (
                                     <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => setShowDriverSignaturePad(true)}
                                        startIcon={<Create />}
                                        size="small"
                                     >
                                         Sign as Driver
                                     </Button>
                                )}
                            </Paper>
                        </Box>
                        
                        {/* Signature Pad Bottom Sheet */}
                        {showSignaturePad && (
                           <Paper sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 3, borderTopLeftRadius: 24, borderTopRightRadius: 24, zIndex: 2000 }}>
                                <Typography variant="h6">Client Signature</Typography>
                                <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
                                    Signing as: {tripData.memberName}
                                </Typography>
                                 <Box
                                    sx={{
                                        border: '2px dashed #ccc',
                                        borderRadius: 2,
                                        bgcolor: '#f5f5f5',
                                        touchAction: 'none',
                                        mb: 2,
                                        height: 200
                                    }}
                                >
                                    <canvas
                                        ref={canvasRef}
                                        width={window.innerWidth - 60} // approximate
                                        height={200}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        onTouchStart={startDrawing}
                                        onTouchMove={draw}
                                        onTouchEnd={stopDrawing}
                                        style={{ display: 'block', width: '100%' }}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Button variant="outlined" onClick={clearSignature} fullWidth>Clear</Button>
                                        <Button 
                                            variant="contained" 
                                            fullWidth 
                                            onClick={() => { setShowSignaturePad(false); }}
                                            disabled={!signatureData}
                                        >
                                            Confirm
                                        </Button>
                                    </Box>
                                    <Button 
                                        variant="text" 
                                        color="primary"
                                        onClick={usePrintedNameAsSignature}
                                        fullWidth
                                        sx={{ fontWeight: 600 }}
                                    >
                                        Use Printed Name: {tripData.memberName}
                                    </Button>
                                </Box>
                           </Paper>
                        )}

                        {/* Driver Signature Pad Bottom Sheet */}
                        {showDriverSignaturePad && (
                           <Paper sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 3, borderTopLeftRadius: 24, borderTopRightRadius: 24, zIndex: 2000 }}>
                                <Typography variant="h6" gutterBottom>Driver Signature</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    I certify that the information provided is true and accurate.
                                </Typography>
                                 <Box
                                    sx={{
                                        border: '2px dashed #0096D6',
                                        borderRadius: 2,
                                        bgcolor: '#f5f5f5',
                                        touchAction: 'none',
                                        mb: 2,
                                        height: 200
                                    }}
                                >
                                    <canvas
                                        ref={driverCanvasRef}
                                        width={window.innerWidth - 60}
                                        height={200}
                                        onMouseDown={startDrawingDriver}
                                        onMouseMove={drawDriver}
                                        onMouseUp={stopDrawingDriver}
                                        onMouseLeave={stopDrawingDriver}
                                        onTouchStart={startDrawingDriver}
                                        onTouchMove={drawDriver}
                                        onTouchEnd={stopDrawingDriver}
                                        style={{ display: 'block', width: '100%' }}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button variant="outlined" onClick={clearDriverSignature} fullWidth>Clear</Button>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={() => { setShowDriverSignaturePad(false); }}
                                        disabled={!driverSignatureData}
                                    >
                                        Adopt Signature
                                    </Button>
                                </Box>
                           </Paper>
                        )}

                        {/* Footer Actions */}
                        {!showSignaturePad && !showDriverSignaturePad && (
                             <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #ddd' }}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button fullWidth variant="outlined" onClick={() => setViewerOpen(false)} startIcon={<Edit />}>
                                        Edit Report Details
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        disabled={(!signatureData && !memberUnableToSign) || !driverSignatureData}
                                        onClick={() => setViewerOpen(false)}
                                    >
                                        Complete
                                    </Button>
                                </Box>
                             </Box>
                        )}
                    </Box>
                </Dialog>

                {/* Attestation */}
                <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="caption">
                        <strong>Driver Attestation:</strong> I certify that the information provided is true, accurate,
                        and complete. I understand that payment will be from Federal and State funds, and that any
                        false claims may be prosecuted under applicable laws.
                    </Typography>
                </Alert>
            </Box>

                </>
            )}

            {/* Fixed Bottom Actions - Only show in Edit Mode */}
            {!isReviewing && (
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 2,
                    bgcolor: 'white',
                    borderTop: '2px solid #f0f0f0',
                    boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
                }}
            >
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleReview}
                    disabled={legs.some(l => !l.endOdometer || !l.pickupTime)}
                    startIcon={<CheckCircle />}
                    sx={{
                        borderRadius: 3,
                        height: 54,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        mb: 1,
                    }}
                >
                    Review & Submit
                </Button>
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={onCancel}
                    sx={{ borderRadius: 3 }}
                >
                    Cancel
                </Button>
            </Box>
            )}

            {/* Document Viewer Modal - Shared and Persistent */}
            <Dialog
                fullScreen
                open={viewerOpen}
                onClose={() => setViewerOpen(false)}
                TransitionComponent={Transition}
            >
                <Box sx={{ bgcolor: '#525659', flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ p: 2, bgcolor: '#323639', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 3 }}>
                        <Typography variant="h6">Trip Report Packet</Typography>
                        <IconButton onClick={() => setViewerOpen(false)} sx={{ color: 'white' }}>
                            <Clear />
                        </IconButton>
                    </Box>
                    
                    <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative', bgcolor: '#f5f5f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                            Please obtain signatures below.
                        </Typography>
                        {/* Signature Status Overlay */}
                        <Paper
                            elevation={2}
                            sx={{
                                position: 'absolute',
                                top: 10,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                p: 1.5,
                                borderRadius: 3,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                bgcolor: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(4px)',
                                zIndex: 10,
                                border: '1px solid #e0e0e0'
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box>
                                    <Typography variant="caption" fontWeight={700} display="block">
                                        {signatureData || memberUnableToSign ? '✓ Member' : 'Member Pending'}
                                    </Typography>
                                    <Typography variant="caption" fontWeight={700} display="block">
                                        {driverSignatureData ? '✓ Driver' : 'Driver Pending'}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" color={(signatureData || memberUnableToSign) && driverSignatureData ? 'success.main' : 'error'}>
                                    {(signatureData || memberUnableToSign) && driverSignatureData ? 'Ready to Submit' : 'Signatures Required'}
                                </Typography>
                            </Box>

                            {!driverSignatureData && (
                                    <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => setShowDriverSignaturePad(true)}
                                    startIcon={<Create />}
                                    size="small"
                                    >
                                        Sign as Driver
                                    </Button>
                            )}
                        </Paper>
                    </Box>
                    
                    {/* Signature Pad Bottom Sheet */}
                    {showSignaturePad && (
                        <Paper sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 3, borderTopLeftRadius: 24, borderTopRightRadius: 24, zIndex: 2000 }}>
                            <Typography variant="h6">Client Signature</Typography>
                            <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
                                Signing as: {tripData.memberName}
                            </Typography>
                                <Box
                                sx={{
                                    border: '2px dashed #ccc',
                                    borderRadius: 2,
                                    bgcolor: '#f5f5f5',
                                    touchAction: 'none',
                                    mb: 2,
                                    height: 200
                                }}
                            >
                                <canvas
                                    ref={canvasRef}
                                    width={window.innerWidth - 60} // approximate
                                    height={200}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                    style={{ display: 'block', width: '100%' }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button variant="outlined" onClick={clearSignature} fullWidth>Clear</Button>
                                    <Button 
                                        variant="contained" 
                                        fullWidth 
                                        onClick={() => { 
                                            setShowSignaturePad(false);
                                            // Auto-advance flow: If driver hasn't signed, open driver pad immediately
                                            if (!driverSignatureData) {
                                                setTimeout(() => setShowDriverSignaturePad(true), 200);
                                            }
                                        }}
                                        disabled={!signatureData}
                                    >
                                        Confirm & Next
                                    </Button>
                                </Box>
                                <Button 
                                    variant="text" 
                                    color="primary"
                                    onClick={usePrintedNameAsSignature}
                                    fullWidth
                                    sx={{ fontWeight: 600 }}
                                >
                                    Use Printed Name: {tripData.memberName}
                                </Button>
                            </Box>
                        </Paper>
                    )}

                    {/* Driver Signature Pad Bottom Sheet */}
                    {showDriverSignaturePad && (
                        <Paper sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 3, borderTopLeftRadius: 24, borderTopRightRadius: 24, zIndex: 2000 }}>
                            <Typography variant="h6" gutterBottom>Driver Signature</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                I certify that the information provided is true and accurate.
                            </Typography>
                                <Box
                                sx={{
                                    border: '2px dashed #0096D6',
                                    borderRadius: 2,
                                    bgcolor: '#f5f5f5',
                                    touchAction: 'none',
                                    mb: 2,
                                    height: 200
                                }}
                            >
                                <canvas
                                    ref={driverCanvasRef}
                                    width={window.innerWidth - 60}
                                    height={200}
                                    onMouseDown={startDrawingDriver}
                                    onMouseMove={drawDriver}
                                    onMouseUp={stopDrawingDriver}
                                    onMouseLeave={stopDrawingDriver}
                                    onTouchStart={startDrawingDriver}
                                    onTouchMove={drawDriver}
                                    onTouchEnd={stopDrawingDriver}
                                    style={{ display: 'block', width: '100%' }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button variant="outlined" onClick={clearDriverSignature} fullWidth>Clear</Button>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={() => { setShowDriverSignaturePad(false); }}
                                    disabled={!driverSignatureData}
                                >
                                    Adopt Signature
                                </Button>
                            </Box>
                        </Paper>
                    )}

                    {/* Footer Actions */}
                    {!showSignaturePad && !showDriverSignaturePad && (
                            <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #ddd' }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button fullWidth variant="outlined" onClick={() => setViewerOpen(false)} startIcon={<Edit />}>
                                    Edit Report Details
                                </Button>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    disabled={(!signatureData && !memberUnableToSign) || !driverSignatureData}
                                    onClick={() => setViewerOpen(false)}
                                >
                                    Complete
                                </Button>
                            </Box>
                            </Box>
                    )}
                </Box>
            </Dialog>

        </Box>
    );
}
