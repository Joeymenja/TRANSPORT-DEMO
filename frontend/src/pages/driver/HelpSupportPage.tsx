import React from 'react';
import { Box, Typography, Paper, IconButton, Button, Container, TextField, InputAdornment, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ArrowBack, Search, ExpandMore, Phone, Chat } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function HelpSupportPage() {
    const navigate = useNavigate();

    return (
        <Box sx={{ bgcolor: '#F5F7FA', minHeight: '100vh', pb: 8 }}>
            {/* Header */}
            <Box sx={{ p: 2, pt: 6, display: 'flex', alignItems: 'center', bgcolor: 'white', borderBottom: '1px solid #eee' }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h6" fontWeight={800} sx={{ flex: 1, textAlign: 'center', mr: 5 }}>
                    Help & Support
                </Typography>
            </Box>

            <Container maxWidth="sm" sx={{ p: 3 }}>
                
                {/* Search */}
                <TextField 
                    fullWidth 
                    placeholder="How can we help?" 
                    variant="outlined" 
                    sx={{ mb: 3, bgcolor: 'white' }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search color="action" />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: 3 }
                    }}
                />

                {/* Contact Dispatch */}
                <Paper sx={{ p: 3, mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)', color: 'white' }}>
                    <Typography variant="h6" fontWeight={800} gutterBottom>Contact Dispatch</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
                        Need immediate assistance with a trip or vehicle issue?
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button 
                            variant="contained" 
                            fullWidth 
                            component="a"
                            href="tel:5551234567"
                            startIcon={<Phone />}
                            sx={{ bgcolor: 'white', color: '#0D9488', fontWeight: 800, '&:hover': { bgcolor: '#f0fdfa' } }}
                        >
                            Call
                        </Button>
                        <Button 
                            variant="outlined" 
                            fullWidth 
                            startIcon={<Chat />}
                            sx={{ color: 'white', borderColor: 'white', fontWeight: 800, '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
                        >
                            Chat
                        </Button>
                    </Box>
                </Paper>

                {/* FAQ */}
                <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 1, display: 'block' }}>
                    FREQUENTLY ASKED
                </Typography>

                <FaqItem 
                    question="How do I update my vehicle documents?" 
                    answer="Go to Profile > Compliance Status and tap 'Update Document Status'. You can upload photos of your new insurance or registration directly."
                />
                <FaqItem 
                    question="What if a member is a no-show?" 
                    answer="Wait at least 5 minutes at the pickup location. Then tap 'Report No-Show' on the Arrival screen. You may be required to take a photo of the location."
                />
                <FaqItem 
                    question="When are weekly earnings processed?" 
                    answer="Earnings are calculated every Sunday at midnight and processed via direct deposit on Tuesdays."
                />
                <FaqItem 
                    question="How do I reset my password?" 
                    answer="Log out and tap 'Forgot Password' on the login screen. You'll receive an email with reset instructions."
                />

            </Container>
        </Box>
    );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
    return (
        <Accordion elevation={0} sx={{ mb: 1, borderRadius: '8px !important', '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle2" fontWeight={700}>{question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography variant="body2" color="text.secondary">{answer}</Typography>
            </AccordionDetails>
        </Accordion>
    );
}
