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
} from '@mui/material';
import { Clear, CheckCircle, Save } from '@mui/icons-material';

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

    // Signature state
    const [signatureData, setSignatureData] = useState<string | null>(null);
    const [memberUnableToSign, setMemberUnableToSign] = useState(false);
    const [proxySignerType, setProxySignerType] = useState('');
    const [refusalReason, setRefusalReason] = useState('');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    // Set default times to now
    useEffect(() => {
        const now = new Date();
        const timeString = now.toTimeString().slice(0, 5);
        if (!pickupTime) setPickupTime(timeString);
        if (!dropoffTime) setDropoffTime(timeString);
    }, []);

    // Signature Pad Logic
    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.strokeStyle = '#000';
            }
        }
    }, []);

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

    const handleSubmit = () => {
        if (!endOdometer || !pickupTime || !dropoffTime) {
            alert('Please fill in all required fields');
            return;
        }

        if (!signatureData && !memberUnableToSign) {
            alert('Please obtain client signature or indicate they are unable to sign');
            return;
        }

        const totalMiles = parseFloat(endOdometer) - startOdometer;

        onSubmit({
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
            clientSignature: signatureData,
            refusedSignature: memberUnableToSign,
            refusalReason: memberUnableToSign ? (proxySignerType || refusalReason) : null,
            notes: additionalInfo,
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
                    <Typography variant="body2">Fleet ID: {tripData.vehicleId}</Typography>
                    {tripData.vehicleMake && (
                        <Typography variant="body2">
                            {tripData.vehicleColor} {tripData.vehicleMake}
                        </Typography>
                    )}
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

                    <TextField
                        label="Reason for Visit"
                        fullWidth
                        value={reasonForVisit}
                        onChange={(e) => setReasonForVisit(e.target.value)}
                        sx={{ mb: 2, bgcolor: 'white' }}
                        placeholder="Medical appointment, therapy, etc."
                    />

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

                {/* Member Signature */}
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
                    />

                    {memberUnableToSign ? (
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

                            {proxySignerType && proxySignerType !== 'Fingerprint' && (
                                <Alert severity="info">
                                    {proxySignerType} signature will be recorded on behalf of member.
                                </Alert>
                            )}
                        </Box>
                    ) : (
                        <Box sx={{ mt: 2 }}>
                            <Box
                                sx={{
                                    border: '2px dashed #ccc',
                                    borderRadius: 2,
                                    bgcolor: '#fff',
                                    touchAction: 'none',
                                    mb: 1,
                                }}
                            >
                                <canvas
                                    ref={canvasRef}
                                    width={340}
                                    height={180}
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
                            <Button
                                size="small"
                                onClick={clearSignature}
                                startIcon={<Clear />}
                            >
                                Clear Signature
                            </Button>
                        </Box>
                    )}
                </Paper>

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
                    disabled={!endOdometer || !pickupTime || !dropoffTime || (!signatureData && !memberUnableToSign)}
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
