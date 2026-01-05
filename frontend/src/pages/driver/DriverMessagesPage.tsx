import { Box, Typography, Paper, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, Badge } from '@mui/material';
import { Circle } from '@mui/icons-material';

export default function DriverMessagesPage() {
    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>Messages</Typography>

            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee' }}>
                <List>
                    <ListItem button alignItems="flex-start">
                        <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'secondary.main' }}>D</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary="Dispatcher: Sarah"
                            secondary="Hey, can you take an extra stop on your way back?"
                            primaryTypographyProps={{ fontWeight: 600 }}
                            secondaryTypographyProps={{ noWrap: true }}
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Typography variant="caption" color="text.secondary">10:42 AM</Typography>
                            <Badge color="primary" variant="dot" />
                        </Box>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                    <ListItem button alignItems="flex-start">
                        <ListItemAvatar>
                            <Avatar src="https://i.pravatar.cc/150?u=3" />
                        </ListItemAvatar>
                        <ListItemText
                            primary="John Doe (Client)"
                            secondary="I'm waiting outside near the main entrance."
                            primaryTypographyProps={{ fontWeight: 600 }}
                            secondaryTypographyProps={{ noWrap: true }}
                        />
                        <Typography variant="caption" color="text.secondary">Yesterday</Typography>
                    </ListItem>
                </List>
            </Paper>
        </Box>
    );
}
