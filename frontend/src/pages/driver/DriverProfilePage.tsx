import { Box, Typography, Paper, Avatar, Button, Container, Divider, IconButton } from '@mui/material';
import { Edit, CheckCircle, Warning, VerifiedUser, DriveEta, ArrowBack, Description, DirectionsCar } from '@mui/icons-material';
import { useAuthStore } from '../../store/auth';
import { useNavigate } from 'react-router-dom';

export default function DriverProfilePage() {
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();

    const licensePlate = "AZ BMT-4829";
    const vin = "X9922L01";

    return (
        <Box sx={{ bgcolor: '#F5F7FA', minHeight: '100vh', pb: 8 }}>
            {/* Header */}
            <Box sx={{ p: 2, pt: 6, display: 'flex', alignItems: 'center', bgcolor: 'white' }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h6" fontWeight={800} sx={{ flex: 1, textAlign: 'center', mr: 5 }}>
                    Driver Profile
                </Typography>
            </Box>

            <Container maxWidth="sm" sx={{ p: 3 }}>
                
                {/* Profile Card */}
                <Paper sx={{ p: 3, mb: 3, borderRadius: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <Box sx={{ position: 'relative' }}>
                        <Avatar 
                            sx={{ width: 80, height: 80, mb: 2, bgcolor: '#263238' }}
                            src={user?.profileImage}
                        >
                            {user?.firstName?.[0]}
                        </Avatar>
                        <IconButton 
                            size="small" 
                            onClick={() => navigate('/driver/profile/edit')}
                            sx={{ position: 'absolute', bottom: 10, right: -5, bgcolor: '#14B8A6', color: 'white', '&:hover': { bgcolor: '#0D9488' } }}
                        >
                            <Edit sx={{ fontSize: 14 }} />
                        </IconButton>
                    </Box>
                    
                    <Typography variant="h6" fontWeight={800}>
                        {user?.firstName} {user?.lastName}
                    </Typography>
                    <Typography variant="caption" color="primary.main" fontWeight={600}>
                        Certified NEMT Specialist
                    </Typography>
                    <ChipText label={`ID: ${user?.id?.slice(0, 8) || 'AHCCCS-883910'}`} />

                    {/* Stats Row */}
                    <Box sx={{ display: 'flex', gap: 4, mt: 3, mb: 1 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" fontWeight={800} lineHeight={1}>4.9</Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>RATING</Typography>
                        </Box>
                        <Box sx={{ width: 1, bgcolor: '#eee' }} />
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" fontWeight={800} lineHeight={1}>1.3k</Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>TRIPS</Typography>
                        </Box>
                        <Box sx={{ width: 1, bgcolor: '#eee' }} />
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" fontWeight={800} lineHeight={1}>3y</Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>EXP</Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ width: '100%', my: 2 }} />

                    <Box sx={{ width: '100%' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 1.5, display: 'block' }}>PERSONAL INFO</Typography>
                        
                        <InfoRow label="Full Name" value={`${user?.firstName} {user?.lastName}`} />
                        <InfoRow label="Email Address" value={user?.email || 'm.henderson@nemt.link'} />
                        <InfoRow label="Phone" value="+1 (602) 555-0100" />
                    </Box>
                </Paper>

                {/* Vehicle Info */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 1, display: 'block', ml: 1 }}>VEHICLE INFO</Typography>
                    <Paper sx={{ p: 2, borderRadius: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <DriveEta sx={{ color: '#90A4AE', mr: 2 }} />
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="text.secondary">License Plate</Typography>
                                <Typography variant="body2" fontWeight={600}>{licensePlate}</Typography>
                            </Box>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                            <VerifiedUser sx={{ color: '#90A4AE', mr: 2 }} />
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="text.secondary">VIN (Last 8)</Typography>
                                <Typography variant="body2" fontWeight={600}>{vin}</Typography>
                            </Box>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                            <DirectionsCar sx={{ color: '#90A4AE', mr: 2 }} />
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="text.secondary">Vehicle Class</Typography>
                                <Typography variant="body2" fontWeight={600}>WAV (Wheelchair Accessible)</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Box>

                {/* Compliance Status */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 1, display: 'block', ml: 1 }}>COMPLIANCE STATUS</Typography>
                    <Paper sx={{ p: 0, borderRadius: 1, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <ComplianceRow 
                            label="Driver License" 
                            subLabel="Expires Dec 12, 2026" 
                            status="VALID" 
                        />
                         <Divider />
                        <ComplianceRow 
                            label="Vehicle Insurance" 
                            subLabel="Expires in 14 days" 
                            status="WARNING" 
                        />
                         <Divider />
                        <ComplianceRow 
                            label="Medical Clearance" 
                            subLabel="Expires Oct 20, 2026" 
                            status="VALID" 
                        />
                    </Paper>

                    <Button 
                        fullWidth 
                        onClick={() => navigate('/driver/compliance')}
                        variant="contained" 
                        sx={{ 
                            mt: 3, 
                            bgcolor: '#14B8A6', 
                            color: 'white', 
                            fontWeight: 700, 
                            py: 1.5,
                            borderRadius: 1,
                            boxShadow: '0 4px 15px rgba(20, 184, 166, 0.3)',
                            '&:hover': { bgcolor: '#0D9488' }
                        }}
                    >
                        Update Document Status
                    </Button>
                </Box>

            </Container>
        </Box>
    );
}

function ChipText({ label }: { label: string }) {
    return (
        <Typography variant="caption" sx={{ 
            color: '#14B8A6', 
            bgcolor: '#E0F2F1', 
            px: 1.5, 
            py: 0.5, 
            borderRadius: 1, 
            fontWeight: 700, 
            mt: 0.5 
        }}>
            {label}
        </Typography>
    );
}

function InfoRow({ label, value }: { label: string, value: string }) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="body2" fontWeight={600}>{value}</Typography>
        </Box>
    );
}



function ComplianceRow({ label, subLabel, status }: { label: string, subLabel: string, status: 'VALID' | 'WARNING' | 'ERROR' }) {
    return (
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                    p: 1, 
                    borderRadius: 1, 
                    bgcolor: status === 'VALID' ? '#E8F5E9' : status === 'WARNING' ? '#FFF8E1' : '#FFEBEE' 
                }}>
                    <Description sx={{ fontSize: 20, color: status === 'VALID' ? '#2E7D32' : status === 'WARNING' ? '#F9A825' : '#C62828' }} />
                </Box>
                <Box>
                    <Typography variant="body2" fontWeight={700}>{label}</Typography>
                    <Typography variant="caption" color={status === 'WARNING' ? 'warning.main' : 'text.secondary'}>
                        {subLabel}
                    </Typography>
                </Box>
            </Box>
            
            {status === 'VALID' ? (
                <CheckCircle color="success" sx={{ fontSize: 20 }} />
            ) : (
                 <Button size="small" variant="contained" color="warning" sx={{ fontSize: '0.65rem', py: 0.2, minWidth: 60 }}>
                     Renew
                 </Button>
            )}
        </Box>
    );
}
