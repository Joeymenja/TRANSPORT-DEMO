import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, CircularProgress, Typography, Snackbar, Alert } from '@mui/material';
import TripReportForm from '../../../components/driver/TripReportForm';
import { tripApi } from '../../../api/trips';
import { driverApi } from '../../../api/drivers';
import { useAuthStore } from '../../../store/auth';

export default function TripReportPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { state } = useLocation();
    const preFill = state?.preFill;
    const preFillLegs = state?.preFillLegs;
    const { user } = useAuthStore();
    
    // State
    const [initialLoading, setInitialLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [trip, setTrip] = useState<any>(null);
    const [driver, setDriver] = useState<any>(null);
    
    // Notification State
    const [notification, setNotification] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        if (id && user) {
            loadData(id);
        }
    }, [id, user]);

    const loadData = async (tripId: string) => {
        try {
            const [tripData, driverData] = await Promise.all([
                tripApi.getTripById(tripId),
                driverApi.getByUserId(user!.id)
            ]);
            setTrip(tripData);
            setDriver(driverData);
        } catch (error) {
            console.error('Error loading data:', error);
            setNotification({ open: true, message: 'Failed to load trip data.', severity: 'error' });
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

            setNotification({ open: true, message: 'Report submitted successfully!', severity: 'success' });
            
            // Navigate after a short delay to let user see success message
            const returnPath = state?.returnPath || '/driver/schedule';
            setTimeout(() => {
                navigate(returnPath);
            }, 1500);

        } catch (error: any) {
            console.error('Error submitting report:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to submit report. Please try again.';
            setNotification({ open: true, message: errorMsg, severity: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    if (initialLoading || !trip || !driver) {
        return (
            <Container sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Loading Trip Data...</Typography>
            </Container>
        );
    }

    // Map trip data to form props
    const member = trip.members?.[0]?.member || {};
    // Extract location from stops
    const pickupStop = trip.stops?.find((s: any) => s.stopType === 'PICKUP' || s.stopOrder === 1);
    const dropoffStop = trip.stops?.find((s: any) => s.stopType === 'DROPOFF' || s.stopOrder === 2);

    const tripDataProp = {
        id: trip.id,
        memberId: member.id,
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
        <>
            <TripReportForm
                tripData={tripDataProp}
                driverInfo={driverInfoProp}
                startOdometer={trip.startOdometer || 0}
                preFill={preFill || (preFillLegs ? { legs: preFillLegs } : undefined)}
                defaultReviewMode={!!preFillLegs || trip.status === 'COMPLETED' || trip.status === 'FINALIZED'}
                onSubmit={handleFinalSubmit}
                onCancel={() => navigate(state?.returnPath || '/driver/schedule')}
                isSubmitting={submitting}
                readOnly={trip.status === 'COMPLETED' || trip.status === 'FINALIZED'}
            />

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseNotification} 
                    severity={notification.severity} 
                    variant="filled" 
                    sx={{ width: '100%', borderRadius: 2, fontWeight: 500 }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </>
    );
}

