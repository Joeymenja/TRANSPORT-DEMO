import { useState } from 'react';
import { Box, Container, Typography, Card, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Grid, FormControlLabel, Checkbox, Tooltip } from '@mui/material';
import { Add, Edit, Delete, Groups, AutoFixHigh, Assignment, AssignmentTurnedIn } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { memberApi, MobilityRequirement, CreateMemberData } from '../api/members';

export default function MembersPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateMemberData>({
        firstName: '',
        lastName: '',
        dateOfBirth: new Date().toISOString().split('T')[0],
        memberId: '',
        mobilityRequirement: MobilityRequirement.AMBULATORY,
        insuranceProvider: '',
        insuranceId: '',
        phone: '',
        address: '',
        consentOnFile: false,
        reportType: 'NATIVE',
        gender: '',
        consentDate: '',
        medicalNotes: '',
        specialNotes: ''
    });

    const { data: members, isLoading } = useQuery({
        queryKey: ['members'],
        queryFn: () => memberApi.getMembers(),
    });

    const createMutation = useMutation({
        mutationFn: (newMember: CreateMemberData) => memberApi.createMember(newMember),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: (error: any) => {
            console.error('Failed to create member:', error);
            const msg = error.response?.data?.message;
            alert(`Failed to create member: ${Array.isArray(msg) ? msg.join(', ') : msg || error.message}`);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => memberApi.deleteMember(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
        },
    });

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            dateOfBirth: new Date().toISOString().split('T')[0],
            memberId: '',
            mobilityRequirement: MobilityRequirement.AMBULATORY,
            insuranceProvider: '',
            insuranceId: '',
            phone: '',
            address: '',
            consentOnFile: false,
            reportType: 'NATIVE',
            gender: '',
            consentDate: '',
            medicalNotes: '',
            specialNotes: ''
        });
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setMemberToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (memberToDelete) {
            deleteMutation.mutate(memberToDelete);
            setDeleteDialogOpen(false);
            setMemberToDelete(null);
        }
    };

    const getMobilityColor = (req: MobilityRequirement) => {
        switch (req) {
            case MobilityRequirement.AMBULATORY: return 'success';
            case MobilityRequirement.WHEELCHAIR: return 'warning';
            case MobilityRequirement.STRETCHER:
            case MobilityRequirement.BURIATRIC_WHEELCHAIR: return 'error';
            default: return 'default';
        }
    };

    const handleFillPseudoData = () => {
        const randomId = Math.floor(Math.random() * 10000);
        setFormData({
            firstName: ['John', 'Jane', 'Michael', 'Sarah'][randomId % 4],
            lastName: ['Smith', 'Johnson', 'Williams', 'Brown'][randomId % 4],
            dateOfBirth: new Date(1950 + (randomId % 50), 0, 1).toISOString().split('T')[0],
            memberId: `AHCCCS-${randomId}`,
            mobilityRequirement: [MobilityRequirement.AMBULATORY, MobilityRequirement.WHEELCHAIR][randomId % 2],
            insuranceProvider: 'Health Choice',
            insuranceId: `INS-${randomId * 2}`,
            phone: '555-0123',
            address: '123 Fake St, Phoenix, AZ',
            consentOnFile: Math.random() > 0.5,
            reportType: Math.random() > 0.5 ? 'NATIVE' : 'NON_NATIVE',
            gender: ['Male', 'Female', 'Other'][randomId % 3],
            consentDate: new Date().toISOString().split('T')[0],
            medicalNotes: 'Standard transport requirements.',
            specialNotes: 'Door-to-door service required.'
        });
    };

    const handleSubmit = () => {
        // Sanitize data: remove empty strings for optional fields to avoid backend validation errors
        const sanitizedData = { ...formData };

        if (!sanitizedData.consentDate) delete sanitizedData.consentDate;
        if (!sanitizedData.gender) delete sanitizedData.gender;
        if (!sanitizedData.medicalNotes) delete sanitizedData.medicalNotes;
        if (!sanitizedData.specialNotes) delete sanitizedData.specialNotes;
        if (!sanitizedData.insuranceProvider) delete sanitizedData.insuranceProvider;
        if (!sanitizedData.insuranceId) delete sanitizedData.insuranceId;
        if (!sanitizedData.phone) delete sanitizedData.phone;
        if (!sanitizedData.address) delete sanitizedData.address;

        createMutation.mutate(sanitizedData);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Groups color="primary" sx={{ fontSize: 32 }} />
                    <Typography variant="h4">Members</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setIsDialogOpen(true)}
                    sx={{ bgcolor: '#0096D6' }}
                >
                    Add Member
                </Button>
            </Box>

            <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <TableContainer component={Paper} elevation={0}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Member ID</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Report Type</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Consent</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Mobility</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Insurance</TableCell>
                                <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>Loading members...</TableCell>
                                </TableRow>
                            ) : members?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>No members found.</TableCell>
                                </TableRow>
                            ) : (
                                members?.map((member) => (
                                    <TableRow
                                        key={member.id}
                                        hover
                                        onClick={() => navigate(`/members/${member.id}`)}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {member.lastName}, {member.firstName}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                DOB: {new Date(member.dateOfBirth).toLocaleDateString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{member.memberId}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={member.reportType === 'NON_NATIVE' ? 'Non-Native' : 'Native'}
                                                size="small"
                                                variant="outlined"
                                                color="default"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {member.consentOnFile ? (
                                                <Tooltip title="Consent on file">
                                                    <AssignmentTurnedIn color="success" fontSize="small" />
                                                </Tooltip>
                                            ) : (
                                                <Tooltip title="Missing consent">
                                                    <Assignment color="disabled" fontSize="small" />
                                                </Tooltip>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={member.mobilityRequirement}
                                                size="small"
                                                color={getMobilityColor(member.mobilityRequirement) as any}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{member.phone || '-'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{member.insuranceProvider || 'N/A'}</Typography>
                                            <Typography variant="caption" color="textSecondary">{member.insuranceId}</Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // TODO: Implement quick edit or navigate to edit tab
                                                    navigate(`/members/${member.id}`);
                                                }}
                                            >
                                                <Edit fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={(e) => handleDelete(e, member.id)}
                                                disabled={deleteMutation.isPending}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Add New Member
                    <Button
                        startIcon={<AutoFixHigh />}
                        size="small"
                        color="secondary"
                        onClick={handleFillPseudoData}
                    >
                        Fill Pseudo Data
                    </Button>
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="First Name"
                                fullWidth
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Last Name"
                                fullWidth
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                select
                                label="Gender"
                                fullWidth
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <MenuItem value="Male">Male</MenuItem>
                                <MenuItem value="Female">Female</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Date of Birth"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={formData.dateOfBirth}
                                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Member ID (AHCCCS)"
                                fullWidth
                                value={formData.memberId}
                                onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Phone"
                                fullWidth
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                label="Report Type"
                                fullWidth
                                value={formData.reportType}
                                onChange={(e) => setFormData({ ...formData, reportType: e.target.value as any })}
                            >
                                <MenuItem value="NATIVE">Native</MenuItem>
                                <MenuItem value="NON_NATIVE">Non-Native</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                label="Mobility Requirement"
                                fullWidth
                                value={formData.mobilityRequirement}
                                onChange={(e) => setFormData({ ...formData, mobilityRequirement: e.target.value as MobilityRequirement })}
                            >
                                {Object.values(MobilityRequirement).map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Date of Consent"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={formData.consentDate}
                                onChange={(e) => setFormData({ ...formData, consentDate: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} display="flex" alignItems="center">
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.consentOnFile}
                                        onChange={(e) => setFormData({ ...formData, consentOnFile: e.target.checked })}
                                    />
                                }
                                label="Consent Form On File"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Insurance Provider"
                                fullWidth
                                value={formData.insuranceProvider}
                                onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Insurance ID"
                                fullWidth
                                value={formData.insuranceId}
                                onChange={(e) => setFormData({ ...formData, insuranceId: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Medical Notes"
                                fullWidth
                                multiline
                                rows={2}
                                value={formData.medicalNotes}
                                onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Special Notes"
                                fullWidth
                                multiline
                                rows={2}
                                value={formData.specialNotes}
                                onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Address"
                                fullWidth
                                multiline
                                rows={2}
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={createMutation.isPending}>
                        {createMutation.isPending ? 'Saving...' : 'Save Member'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Delete Member?"}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this member? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
