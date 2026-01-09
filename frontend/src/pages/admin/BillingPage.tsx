import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Alert,
    CircularProgress
} from '@mui/material';
import axios from 'axios';

// Basic type for Claim (match backend entity)
interface Claim {
    id: string;
    claimNumber: string;
    status: string;
    billedAmount: number | string;
    procedureCode: string;
    tripId: string;
    trip?: {
        tripDate: string;
        organizationId: string;
    };
    createdAt: string;
}

const BillingPage: React.FC = () => {
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Fetch unbilled claims on mount
    useEffect(() => {
        fetchClaims();
    }, []);

    const fetchClaims = async () => {
        setLoading(true);
        setError(null);
        try {
            // Adjust API URL as needed (assumes proxy or CORS set up)
            const response = await axios.get('http://localhost:3003/billing/unbilled');
            setClaims(response.data);
        } catch (err) {
            console.error('Failed to fetch claims', err);
            setError('Failed to load unbilled claims.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateClaims = async () => {
        setGenerating(true);
        setSuccessMsg(null);
        setError(null);
        try {
            // For MVP, we might want to generate for specific trips, 
            // but the backend currently takes a list of tripIds.
            // A "Generate All" feature would need a backend endpoint that finds all eligible trips.
            // OR we can fetch eligible trips here and send them.
            // Let's assume for now the user wants to process "All Completed Trips".
            // Since we don't have that endpoint yet, let's create a temporary UI to just "Simulate" or 
            // maybe we DO need that endpoint.
            // Wait, the backend verification script generated a trip then claimed it.
            // We need a "Find Billable Trips" endpoint really.
            
            // Re-reading implementation: BillingController has `generateClaims(tripIds)`.
            // It does NOT have "findBillableTrips".
            // However, we can use the `GET /trips` endpoint to find COMPLETED trips without claims? No easy way to filter 'no claims' yet.
            
            // IMPROVEMENT: Let's fetch COMPLETED trips, and try to generate for them. 
            // This is heavy but works for MVP.
            const tripsResponse = await axios.get('http://localhost:3003/trips?status=COMPLETED');
            const completedTrips = tripsResponse.data;
            const tripIds = completedTrips.map((t: any) => t.id);

            if (tripIds.length === 0) {
                setSuccessMsg('No completed trips found to bill.');
                return;
            }

            const response = await axios.post('http://localhost:3003/billing/generate', { tripIds });
            const generatedCount = response.data.length;
            setSuccessMsg(`Successfully generated ${generatedCount} new claims.`);
            fetchClaims(); // Refresh list
        } catch (err) {
            console.error('Failed to generate claims', err);
            setError('Failed to generate claims.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Billing & Claims
            </Typography>

            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleGenerateClaims}
                    disabled={generating || loading}
                >
                    {generating ? 'Processing...' : 'Generate Claims for Completed Trips'}
                </Button>
                <Button variant="outlined" disabled>
                    Export Batch (Coming Soon)
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Unbilled Claims
                    </Typography>
                    
                    {loading ? (
                        <CircularProgress />
                    ) : claims.length === 0 ? (
                        <Typography color="textSecondary">No unbilled claims found.</Typography>
                    ) : (
                        <TableContainer component={Paper} elevation={0} variant="outlined">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Claim #</TableCell>
                                        <TableCell>Trip Date</TableCell>
                                        <TableCell>Amount</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {claims.map((claim) => (
                                        <TableRow key={claim.id}>
                                            <TableCell>{claim.claimNumber}</TableCell>
                                            <TableCell>
                                                {claim.trip?.tripDate ? new Date(claim.trip.tripDate).toLocaleDateString() : 'N/A'}
                                            </TableCell>
                                            <TableCell>${Number(claim.billedAmount).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Chip label={claim.status} color="default" size="small" />
                                            </TableCell>
                                            <TableCell>
                                                <Button size="small">View</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default BillingPage;
