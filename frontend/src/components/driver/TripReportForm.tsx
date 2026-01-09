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
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import React from 'react';
import { Clear, CheckCircle, Description, Create, Edit, Warning } from '@mui/icons-material';

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
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

export default function TripReportForm({
    tripData,
    driverInfo,
    startOdometer,
    onSubmit,
    onCancel,
}: TripReportFormProps) {
    // Form state
    const [endOdometer, setEndOdometer] = useState<string>('');
    const [pickupTime, setPickupTime] = useState<string>('');
    const [dropoffTime, setDropoffTime] = useState<string>('');
    const [tripType, setTripType] = useState<'ONE_WAY' | 'ROUND_TRIP' | 'MULTIPLE_STOPS'>('ONE_WAY');
    const [reasonForVisit, setReasonForVisit] = useState('');
    const [escortName, setEscortName] = useState('');
    const [escortRelationship, setEscortRelationship] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [serviceVerified, setServiceVerified] = useState(true);
    const [clientArrived, setClientArrived] = useState(true);
    const [incidentReported, setIncidentReported] = useState(false);
    const [incidentDescription, setIncidentDescription] = useState('');
    const [multipleMembers, setMultipleMembers] = useState(false);
    const [differentLocations, setDifferentLocations] = useState(false);

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
    const [showDriverSignaturePad, setShowDriverSignaturePad] = useState(false);

    // Set default times to now
    useEffect(() => {
        const now = new Date();
        const timeString = now.toTimeString().slice(0, 5);
        if (!pickupTime) setPickupTime(timeString);
        if (!dropoffTime) setDropoffTime(timeString);
    }, []);

    // PDF Generation State - REMOVED (Moved to Backend)
    // const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    // const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);



    const startDrawing = (e: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
        const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e: any) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
        const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

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
            setSignatureData(null);
        }
    };

    // Driver Signature Drawing Functions
    const startDrawingDriver = (e: any) => {
        const canvas = driverCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
        const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawingDriver(true);
    };

    const drawDriver = (e: any) => {
        if (!isDrawingDriver) return;
        const canvas = driverCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
        const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
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
            setDriverSignatureData(null);
        }
    };

    // Submit Handler
    const handleSubmit = () => {
        if (!endOdometer || !pickupTime || !dropoffTime) {
            alert('Please fill in all required fields');
            return;
        }

        if (!signatureData && !memberUnableToSign) {
            alert('Please obtain client signature or indicate they are unable to sign');
            return;
        }

        if (!driverSignatureData) {
            alert('Driver signature is required to submit the trip report');
            return;
        }

        const totalMiles = parseFloat(endOdometer) - startOdometer;

        // Prepare Payload for submission
        const reportData = {
            id: tripData.id, // Ensure ID is passed if needed, or parent handles it
            driverId: driverInfo.id,
            startOdometer,
            endOdometer: parseFloat(endOdometer),
            totalMiles,
            pickupTime: new Date(`${new Date().toISOString().split('T')[0]}T${pickupTime}`).toISOString(),
            dropoffTime: new Date(`${new Date().toISOString().split('T')[0]}T${dropoffTime}`).toISOString(),
            tripType,
            reasonForVisit,
            escortName: escortName || null,
            escortRelationship: escortRelationship || null,
            additionalInfo: additionalInfo || null,
            serviceVerified,
            clientArrived,
            incidentReported,
            incidentDescription: incidentReported ? incidentDescription : null,
            multipleMembers,
            differentLocations: multipleMembers ? differentLocations : null,
            refusedSignature: memberUnableToSign,
            refusalReason: memberUnableToSign ? (proxySignerType || refusalReason) : null,
            notes: additionalInfo,
            // Pass flat data needed for PDF generation on backend
            driverName: driverInfo.name,
            vehicleId: tripData.vehicleId,
            vehicleColor: tripData.vehicleColor,
            vehicleMake: tripData.vehicleMake,
            vehicleType: tripData.vehicleType,
            memberAhcccsId: tripData.memberAhcccsId,
            memberDOB: tripData.memberDOB,
            memberName: tripData.memberName,
            memberAddress: tripData.memberAddress,
            pickupAddress: tripData.pickupAddress,
            dropoffAddress: tripData.dropoffAddress,
        };

        // Submit the trip report with both trip data and signatures
        onSubmit({
             tripData: reportData,
             signatureData: {
                 member: signatureData,
                 driver: driverSignatureData, // Now sending actual signature image
                 driverName: driverInfo.name // Include name for PDF text fallback
             }
        });
    };

    const totalMiles = endOdometer ? (parseFloat(endOdometer) - startOdometer).toFixed(1) : '0.0';

    return (
        <Box sx={{ pb: 12 }}>
            <Box sx={{ bgcolor: '#0096D6', color: 'white', p: 3, mb: 3 }}>
                <Typography variant="h5" fontWeight={700}>AHCCCS Daily Trip Report</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Driver: {driverInfo.name}
                </Typography>
                <Typography variant="body2">
                    Date: {new Date().toLocaleDateString()}
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

                {/* Trip Details */}
                <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '2px solid #0096D6' }}>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom color="primary">
                        TRIP DETAILS
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">Pickup Location</Typography>
                        <Typography variant="body2" fontWeight={500}>{tripData.pickupAddress}</Typography>
                    </Box>

                    <TextField
                        label="Pickup Time *"
                        type="time"
                        fullWidth
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        sx={{ mb: 2, bgcolor: 'white' }}
                        InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                        label="Pickup Odometer"
                        fullWidth
                        value={startOdometer}
                        disabled
                        sx={{ mb: 3, bgcolor: '#f5f5f5' }}
                    />

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">Dropoff Location</Typography>
                        <Typography variant="body2" fontWeight={500}>{tripData.dropoffAddress}</Typography>
                    </Box>

                    <TextField
                        label="Dropoff Time *"
                        type="time"
                        fullWidth
                        value={dropoffTime}
                        onChange={(e) => setDropoffTime(e.target.value)}
                        sx={{ mb: 2, bgcolor: 'white' }}
                        InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                        label="End Odometer *"
                        type="number"
                        fullWidth
                        value={endOdometer}
                        onChange={(e) => setEndOdometer(e.target.value)}
                        sx={{ mb: 2, bgcolor: 'white' }}
                        helperText={`Trip Miles: ${totalMiles}`}
                    />

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <FormLabel>Type of Trip</FormLabel>
                        <RadioGroup
                            value={tripType}
                            onChange={(e) => setTripType(e.target.value as any)}
                            row
                        >
                            <FormControlLabel value="ONE_WAY" control={<Radio />} label="One Way" />
                            <FormControlLabel value="ROUND_TRIP" control={<Radio />} label="Round Trip" />
                            <FormControlLabel value="MULTIPLE_STOPS" control={<Radio />} label="Multiple Stops" />
                        </RadioGroup>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Reason for Visit *</InputLabel>
                        <Select
                            value={reasonForVisit}
                            onChange={(e) => setReasonForVisit(e.target.value)}
                            label="Reason for Visit *"
                            sx={{ bgcolor: 'white' }}
                        >
                            <Box sx={{ px: 2, py: 1, bgcolor: '#f0f0f0' }}>
                                <Typography variant="caption" fontWeight={700}>COVERED MEDICAL</Typography>
                            </Box>
                            {REASONS_FOR_VISIT.map(r => (
                                <MenuItem key={r} value={r}>{r}</MenuItem>
                            ))}
                            <Box sx={{ px: 2, py: 1, bgcolor: '#fdf0f0' }}>
                                <Typography variant="caption" fontWeight={700} color="error">NON-COVERED (FLAGGED)</Typography>
                            </Box>
                            {NON_COVERED_REASONS.map(r => (
                                <MenuItem key={r} value={r}>{r}</MenuItem>
                            ))}
                        </Select>
                        {NON_COVERED_REASONS.includes(reasonForVisit) && (
                            <Alert severity="warning" icon={<Warning />} sx={{ mt: 1, py: 0 }}>
                                <Typography variant="caption" fontWeight={700}>
                                    This visit type is typically NOT covered by AHCCCS.
                                </Typography>
                            </Alert>
                        )}
                    </FormControl>

                    <TextField
                        label="Name of Escort (if applicable)"
                        fullWidth
                        value={escortName}
                        onChange={(e) => setEscortName(e.target.value)}
                        sx={{ mb: 2, bgcolor: 'white' }}
                    />

                    {escortName && (
                        <TextField
                            label="Relationship to Member"
                            fullWidth
                            value={escortRelationship}
                            onChange={(e) => setEscortRelationship(e.target.value)}
                            sx={{ mb: 2, bgcolor: 'white' }}
                            placeholder="Parent, Guardian, Caregiver, etc."
                        />
                    )}
                </Paper>

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
                                    variant="outlined"
                                    onClick={() => { setViewerOpen(true); setShowSignaturePad(true); }}
                                    startIcon={<Description />}
                                    sx={{ height: 60, borderRadius: 2, borderStyle: 'dashed', borderWidth: 2 }}
                                >
                                    Review & Sign Document
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
                                <Typography variant="h6" gutterBottom>Sign Below</Typography>
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
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button variant="outlined" onClick={clearSignature} fullWidth>Clear</Button>
                                    <Button 
                                        variant="contained" 
                                        fullWidth 
                                        onClick={() => { setShowSignaturePad(false); }}
                                        disabled={!signatureData}
                                    >
                                        Adopt Signature
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

            {/* Fixed Bottom Actions */}
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
                    onClick={handleSubmit}
                    disabled={!endOdometer || !pickupTime || !dropoffTime || (!signatureData && !memberUnableToSign) || !driverSignatureData}
                    startIcon={<CheckCircle />}
                    sx={{
                        borderRadius: 3,
                        height: 54,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        mb: 1,
                    }}
                >
                    Submit Trip Report
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
        </Box>
    );
}
