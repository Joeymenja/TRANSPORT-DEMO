import { Box, Container, Typography, Card, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton } from '@mui/material';
import { Add, Edit, Delete, Groups } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { memberApi, MobilityRequirement } from '../api/members';

export default function MembersPage() {
    const { data: members, isLoading } = useQuery({
        queryKey: ['members'],
        queryFn: () => memberApi.getMembers(),
    });

    const getMobilityColor = (req: MobilityRequirement) => {
        switch (req) {
            case MobilityRequirement.AMBULATORY: return 'success';
            case MobilityRequirement.WHEELCHAIR: return 'warning';
            case MobilityRequirement.STRETCHER:
            case MobilityRequirement.BURIATRIC_WHEELCHAIR: return 'error';
            default: return 'default';
        }
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
                    onClick={() => { /* TODO: Open add dialog */ }}
                >
                    Add Member
                </Button>
            </Box>

            <Card>
                <TableContainer component={Paper} elevation={0}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Member ID</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Mobility</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Insurance</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                                <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">Loading members...</TableCell>
                                </TableRow>
                            ) : members?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">No members found.</TableCell>
                                </TableRow>
                            ) : (
                                members?.map((member) => (
                                    <TableRow key={member.id} hover>
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
                                                label={member.mobilityRequirement}
                                                size="small"
                                                color={getMobilityColor(member.mobilityRequirement) as any}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{member.insuranceProvider || 'N/A'}</Typography>
                                            <Typography variant="caption" color="textSecondary">{member.insuranceId}</Typography>
                                        </TableCell>
                                        <TableCell>{member.phone || 'N/A'}</TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" color="primary">
                                                <Edit fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" color="error">
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
        </Container>
    );
}
