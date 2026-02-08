import { Box, Typography, Paper, Container, IconButton, Button, Chip } from '@mui/material';
import { CalendarToday, History, ChevronRight, Info, Circle } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DriverLogsPage() {
    const navigate = useNavigate();
    const [tab, setTab] = useState<'TRIPS' | 'COMPLIANCE'>('TRIPS');

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F2F2F7', pb: 12 }}>
            
            {/* Header (Sticky / Blur) */}
            <Box sx={{ 
                position: 'sticky', 
                top: 0, 
                zIndex: 50, 
                bgcolor: 'rgba(242, 242, 247, 0.8)', 
                backdropFilter: 'blur(20px)',
                px: 3,
                pb: 2
            }}>
                <Box sx={{ height: 48 }} /> {/* Status bar spacer */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" fontWeight={800} letterSpacing={-0.5}>Logs</Typography>
                    <IconButton sx={{ bgcolor: 'rgba(226, 232, 240, 0.5)' }}>
                        <CalendarToday sx={{ color: '#475569' }} />
                    </IconButton>
                </Box>

                {/* Segmented Control */}
                <Box sx={{ 
                    bgcolor: 'rgba(226, 232, 240, 0.6)', 
                    p: 0.5, 
                    borderRadius: 3, 
                    display: 'flex' 
                }}>
                    <Button 
                        fullWidth 
                        onClick={() => setTab('TRIPS')}
                        sx={{ 
                            borderRadius: 2, 
                            bgcolor: tab === 'TRIPS' ? 'white' : 'transparent', 
                            color: tab === 'TRIPS' ? 'text.primary' : 'text.secondary',
                            boxShadow: tab === 'TRIPS' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                            fontWeight: 600,
                            textTransform: 'none',
                            py: 0.8
                        }}
                    >
                        Past Trips
                    </Button>
                    <Button 
                        fullWidth 
                        onClick={() => setTab('COMPLIANCE')}
                        sx={{ 
                            borderRadius: 2, 
                            bgcolor: tab === 'COMPLIANCE' ? 'white' : 'transparent', 
                            color: tab === 'COMPLIANCE' ? 'text.primary' : 'text.secondary',
                            boxShadow: tab === 'COMPLIANCE' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                            fontWeight: 600,
                            textTransform: 'none',
                             py: 0.8
                        }}
                    >
                        Compliance
                    </Button>
                </Box>
            </Box>

            <Container sx={{ px: 3, py: 2 }}>
                
                {/* Month Component */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 0.5 }}>
                    <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', color: '#94a3b8', letterSpacing: 1 }}>
                        FEBRUARY 2026
                    </Typography>
                    <Typography variant="caption" fontWeight={600} sx={{ color: '#94a3b8' }}>
                        12 Completed
                    </Typography>
                </Box>

                {/* Card 1: Signed */}
                <LogCard 
                    name="Marcus J. Henderson"
                    time="Today • 09:30 AM"
                    addresses={['1200 N 7th St, Phoenix, AZ', 'Desert Valley Clinic, Scottsdale']}
                    status="SIGNED"
                    duration="24m"
                    onClick={() => navigate('/driver/logs/8422')}
                />

                {/* Card 2: Action Required */}
                <LogCard 
                    name="Sarah Jenkins"
                    time="Yesterday • 02:15 PM"
                    addresses={['445 W San Jose Ave, Mesa, AZ', 'St. Joseph Medical Center']}
                    status="ACTION_REQUIRED"
                    issue="Missing Member Signature"
                    onClick={() => navigate('/driver/logs/8423')}
                />

                 {/* Card 3: Signed */}
                 <LogCard 
                    name="Robert Brown"
                    time="Feb 3 • 11:00 AM"
                    addresses={['9201 W Peoria Ave, Peoria, AZ', 'West Side Hospital']}
                    status="SIGNED"
                    duration="42m"
                    onClick={() => navigate('/driver/logs/8424')}
                />

                <Box sx={{ mt: 3, mb: 1, px: 0.5 }}>
                    <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', color: '#94a3b8', letterSpacing: 1 }}>
                        JANUARY 2026
                    </Typography>
                </Box>

                {/* Compact Void Card */}
                <Paper 
                    elevation={0}
                    sx={{ p: 2.5, borderRadius: 4, bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #f1f5f9' }}
                >
                    <Box>
                         <Typography variant="caption" fontWeight={700} sx={{ display: 'block', color: '#94a3b8', letterSpacing: 1, fontSize: '0.65rem', mb: 0.5 }}>JAN 30</Typography>
                         <Typography fontWeight={600}>Elena Rodriguez</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label="VOID" size="small" sx={{ borderRadius: 1, bgcolor: '#f1f5f9', color: '#64748b', fontWeight: 700, fontSize: '0.65rem', height: 20 }} />
                        <ChevronRight sx={{ color: '#cbd5e1' }} />
                    </Box>
                </Paper>

            </Container>
        </Box>
    );
}

function LogCard({ name, time, addresses, status, duration, issue, onClick }: { name: string, time: string, addresses: string[], status: string, duration?: string, issue?: string, onClick?: () => void }) {
    const isError = status === 'ACTION_REQUIRED';
    
    return (
        <Paper 
            elevation={0}
            onClick={onClick}
            sx={{ 
                p: 3, 
                mb: 2, 
                borderRadius: 4, 
                bgcolor: 'white', 
                border: '1px solid',
                borderColor: isError ? 'rgba(239, 68, 68, 0.1)' : '#f1f5f9',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                cursor: onClick ? 'pointer' : 'default',
                '&:active': { transform: 'scale(0.98)', transition: 'transform 0.1s' }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                    <Typography variant="caption" fontWeight={700} sx={{ display: 'block', color: '#94a3b8', letterSpacing: 1, fontSize: '0.65rem', mb: 0.5 }}>
                        {time.toUpperCase()}
                    </Typography>
                    <Typography variant="h6" fontWeight={600} letterSpacing={-0.5}>
                        {name}
                    </Typography>
                </Box>
                <Chip 
                    label={isError ? 'ACTION REQUIRED' : 'SIGNED'} 
                    size="small"
                    sx={{ 
                        bgcolor: isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(20, 184, 166, 0.1)', 
                        color: isError ? '#ef4444' : '#14B8A6', 
                        fontWeight: 700, 
                        fontSize: '0.65rem',
                        height: 24,
                        borderRadius: 4
                    }} 
                />
            </Box>

            {/* Timeline */}
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 0.5 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid #14B8A6', bgcolor: 'white' }} />
                    <Box sx={{ width: 1, height: 32, bgcolor: '#e2e8f0' }} />
                    <Box sx={{ width: 10, height: 10, borderRadius: 2, bgcolor: '#14B8A6' }} />
                </Box>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {addresses.map((addr, i) => (
                        <Typography key={i} variant="body2" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                            {addr}
                        </Typography>
                    ))}
                </Box>
            </Box>

            {/* Footer / Action */}
            {isError ? (
                <Box sx={{ mt: 3, p: 1.5, bgcolor: 'rgba(239, 68, 68, 0.05)', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Info sx={{ color: '#ef4444', fontSize: 20 }} />
                    <Typography variant="caption" fontWeight={600} sx={{ color: '#ef4444', flex: 1 }}>
                        {issue}
                    </Typography>
                    <Button 
                        size="small" 
                        sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#ef4444', textDecoration: 'underline', minWidth: 0, p: 0 }}
                    >
                        Resolve
                    </Button>
                </Box>
            ) : (
                <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <History sx={{ color: '#cbd5e1', fontSize: 20 }} />
                         <Typography variant="caption" fontWeight={600} sx={{ color: '#94a3b8' }}>
                            Duration: {duration}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                         <Typography variant="caption" fontWeight={700} sx={{ color: '#475569' }}>
                            Details
                        </Typography>
                        <ChevronRight sx={{ color: '#cbd5e1', fontSize: 18 }} />
                    </Box>
                </Box>
            )}

        </Paper>
    );
}
