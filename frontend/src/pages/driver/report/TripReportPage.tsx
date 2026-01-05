import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Stepper,
    Step,
    StepLabel,
    Button,
    Paper,
    TextField,
    Grid,
    FormControlLabel,
    Checkbox,
    MenuItem,
    CircularProgress
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import SignatureCanvas from '../../../components/common/SignatureCanvas';
import { reportApi } from '../../../api/reports';
import { tripApi } from '../../../api/trips';

import { useAuthStore } from '../../../store/auth';

const steps = ['Time & Mileage', 'Trip Details', 'Signatures', 'Review'];

export default function TripReportPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [reportId, setReportId] = useState<string | null>(null);
    const [trip, setTrip] = useState<any>(null);

    // Signatures State
    const [clientSignature, setClientSignature] = useState<string | null>(null);
    const [driverSignature, setDriverSignature] = useState<string | null>(null);
    const [facilitySignature, setFacilitySignature] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            loadTripData(id);
        }
    }, [id]);

    const loadTripData = async (tripId: string) => {
        try {
            const data = await tripApi.getById(tripId);
            setTrip(data);
            // Check if report exists
            try {
                const report = await reportApi.getByTripId(tripId);
                if (report) {
                    setReportId(report.id);
                    // Load existing signatures if any
                }
            } catch (e) {
                // Report doesn't exist yet, that's fine
            }
        } catch (error) {
            console.error('Error loading trip:', error);
        }
    };

    const handleNext = () => setActiveStep((prev) => prev + 1);
    const handleBack = () => setActiveStep((prev) => prev - 1);

    const initialValues = {
        pickupTime: trip?.pickupTime || '09:00',
        dropoffTime: trip?.dropoffTime || '09:30',
        startOdometer: trip?.startOdometer || 0,
        endOdometer: trip?.endOdometer || 0,
        appointmentType: 'Primary Care',
        serviceVerified: false,
        clientArrived: false,
        clientCheckedIn: false,
        incidentReported: false,
        incidentDescription: '',
        driverNotes: ''
    };

    const validationSchema = [
        // Step 0: Time & Mileage
        Yup.object({
            startOdometer: Yup.number().required('Required').min(0),
            endOdometer: Yup.number().required('Required').min(Yup.ref('startOdometer'), 'Must be greater than start'),
            pickupTime: Yup.string().required('Required'),
            dropoffTime: Yup.string().required('Required'),
        }),
        // Step 1: Details
        Yup.object({
            appointmentType: Yup.string().required('Required'),
            clientArrived: Yup.boolean().oneOf([true], 'Must verify arrival'),
            clientCheckedIn: Yup.boolean().oneOf([true], 'Must verify check-in'),
            incidentDescription: Yup.string().when('incidentReported', {
                is: true,
                then: (schema) => schema.required('Description required'),
            }),
        }),
        // Step 2: Signatures (Manual validation)
        Yup.object({})
    ];

    const handleSubmitStep = async (values: any) => {
        setLoading(true);
        try {
            if (!reportId && id) {
                const newReport = await reportApi.create(id, values);
                setReportId(newReport.id);
            } else if (reportId) {
                // Update implementation would go here (using create or dedicated update endpoint)
                // For now assuming create handles upsert or we call create again
                await reportApi.create(id!, values);
            }
            handleNext();
        } catch (error) {
            console.error('Error saving step:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFinalSubmit = async () => {
        if (!reportId) return;
        setLoading(true);
        try {
            // Upload signatures
            if (clientSignature) {
                await reportApi.addSignature(reportId, {
                    type: 'CLIENT',
                    signerName: 'Client', // In real app get from Trip Member
                    signatureUrl: clientSignature
                });
            }
            if (driverSignature) {
                await reportApi.addSignature(reportId, {
                    type: 'DRIVER',
                    signerName: 'Driver',
                    signatureUrl: driverSignature
                });
            }
            if (facilitySignature) {
                await reportApi.addSignature(reportId, {
                    type: 'FACILITY',
                    signerName: 'Facility Staff',
                    signatureUrl: facilitySignature
                });
            }

            await reportApi.submit(reportId);
            navigate('/driver/schedule'); // Return to schedule
        } catch (error) {
            console.error('Error submitting report:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!trip) return <CircularProgress />;

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>Trip Report</Typography>
            <Typography color="text.secondary" paragraph>Trip #{trip.id.slice(0, 8)}</Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema[activeStep]}
                onSubmit={activeStep === steps.length - 1 ? handleFinalSubmit : handleSubmitStep}
                enableReinitialize
            >
                {({ values, errors, touched, handleChange, setFieldValue }) => (
                    <Form>
                        {activeStep === 0 && (
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>Time & Mileage</Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={6}>
                                        <Field as={TextField} name="pickupTime" label="Pickup Time" type="time" fullWidth InputLabelProps={{ shrink: true }} error={touched.pickupTime && !!errors.pickupTime} helperText={touched.pickupTime && errors.pickupTime} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Field as={TextField} name="dropoffTime" label="Dropoff Time" type="time" fullWidth InputLabelProps={{ shrink: true }} error={touched.dropoffTime && !!errors.dropoffTime} helperText={touched.dropoffTime && errors.dropoffTime} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Field as={TextField} name="startOdometer" label="Start Odometer" type="number" fullWidth error={touched.startOdometer && !!errors.startOdometer} helperText={touched.startOdometer && errors.startOdometer} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Field as={TextField} name="endOdometer" label="End Odometer" type="number" fullWidth error={touched.endOdometer && !!errors.endOdometer} helperText={touched.endOdometer && errors.endOdometer} />
                                    </Grid>
                                </Grid>
                            </Paper>
                        )}

                        {activeStep === 1 && (
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>Trip Details & Verification</Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Field as={TextField} select name="appointmentType" label="Appointment Type" fullWidth>
                                            {['Primary Care', 'Dialysis', 'Specialist', 'Therapy', 'Other'].map((option) => (
                                                <MenuItem key={option} value={option}>{option}</MenuItem>
                                            ))}
                                        </Field>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControlLabel control={<Checkbox checked={values.clientArrived} onChange={handleChange} name="clientArrived" />} label="Client arrived at facility safe and sound" />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControlLabel control={<Checkbox checked={values.clientCheckedIn} onChange={handleChange} name="clientCheckedIn" />} label="Client checked in for appointment" />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControlLabel control={<Checkbox checked={values.incidentReported} onChange={handleChange} name="incidentReported" />} label="Report an Incident?" />
                                    </Grid>
                                    {values.incidentReported && (
                                        <Grid item xs={12}>
                                            <Field as={TextField} name="incidentDescription" label="Describe Incident" multiline rows={3} fullWidth />
                                        </Grid>
                                    )}
                                    <Grid item xs={12}>
                                        <Field as={TextField} name="driverNotes" label="Driver Notes (Optional)" multiline rows={2} fullWidth />
                                    </Grid>
                                </Grid>
                            </Paper>
                        )}

                        {activeStep === 2 && (
                            <Box display="flex" flexDirection="column" gap={3}>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>Client Signature</Typography>
                                    {clientSignature ? (
                                        <Box textAlign="center">
                                            <img src={clientSignature} alt="Client Signature" style={{ maxWidth: '100%', maxHeight: 150 }} />
                                            <Button size="small" onClick={() => setClientSignature(null)}>Redo</Button>
                                        </Box>
                                    ) : (
                                        <SignatureCanvas onSave={setClientSignature} label="Client Sign Here" />
                                    )}
                                </Paper>

                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>Driver Signature</Typography>
                                    {driverSignature ? (
                                        <Box textAlign="center">
                                            <img src={driverSignature} alt="Driver Signature" style={{ maxWidth: '100%', maxHeight: 150 }} />
                                            <Button size="small" onClick={() => setDriverSignature(null)}>Redo</Button>
                                        </Box>
                                    ) : (
                                        <SignatureCanvas onSave={setDriverSignature} label="Driver Sign Here" />
                                    )}
                                    {(!driverSignature && user?.signatureUrl) && (
                                        <Box mt={1} textAlign="center">
                                            <Button size="small" onClick={() => setDriverSignature(user.signatureUrl || null)}>
                                                Use Saved Signature
                                            </Button>
                                        </Box>
                                    )}
                                </Paper>

                                {/* Facility Signature Section (Optional) */}
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>Facility Signature (Optional)</Typography>
                                    <Typography variant="caption" color="text.secondary" paragraph>
                                        Required for facility check-in verification if client cannot sign.
                                    </Typography>
                                    {facilitySignature ? (
                                        <Box textAlign="center">
                                            <img src={facilitySignature} alt="Facility Signature" style={{ maxWidth: '100%', maxHeight: 150 }} />
                                            <Button size="small" onClick={() => setFacilitySignature(null)}>Redo</Button>
                                        </Box>
                                    ) : (
                                        <SignatureCanvas onSave={setFacilitySignature} label="Facility Staff Sign Here" />
                                    )}
                                </Paper>
                            </Box>
                        )}

                        {activeStep === 3 && (
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>Review Report</Typography>
                                <Typography>Total Miles: {(values.endOdometer - values.startOdometer).toFixed(1)}</Typography>
                                <Typography>Signatures: {clientSignature ? 'Client Signed' : 'Missing Client Signature'} | {driverSignature ? 'Driver Signed' : 'Missing Driver Signature'}</Typography>
                                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        By submitting this report, I certify that the information provided is accurate and complete to the best of my knowledge.
                                    </Typography>
                                </Box>
                            </Paper>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                            <Button disabled={activeStep === 0 || loading} onClick={handleBack}>
                                Back
                            </Button>

                            {activeStep === steps.length - 1 ? (
                                <Button variant="contained" color="primary" onClick={handleFinalSubmit} disabled={loading}>
                                    {loading ? <CircularProgress size={24} /> : 'Submit Report'}
                                </Button>
                            ) : (
                                <Button type="submit" variant="contained" color="primary" disabled={loading}>
                                    Next
                                </Button>
                            )}
                        </Box>
                    </Form>
                )}
            </Formik>
        </Container>
    );
}
