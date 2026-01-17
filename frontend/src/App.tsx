import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuthStore } from './store/auth';
import { useAutoLogout } from './hooks/useAutoLogout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/admin/ReportsPage';
import ReportDetailPage from './pages/admin/ReportDetailPage';
import BillingPage from './pages/admin/BillingPage';
import ArchivePage from './pages/ArchivePage';
import MembersPage from './pages/MembersPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/admin/SettingsPage';
import MemberDetailsPage from './pages/MemberDetailsPage';
import VehiclesPage from './pages/VehiclesPage';
import VehicleDetailsPage from './pages/VehicleDetailsPage';
import { DriversPage } from './pages/DriversPage';
import { DriverDetailsPage } from './pages/DriverDetailsPage';
import { DriverTripHistoryPage } from './pages/DriverTripHistoryPage';
import TripsPage from './pages/TripsPage';
import CreateTripPage from './pages/CreateTripPage';
import TripDetailsPage from './pages/TripDetailsPage';
import DriverLayout from './components/DriverLayout';
// import AdminLayout from './components/layout/AdminLayout'; // Not used in this iteration
import DriverTripsPage from './pages/driver/DriverTripsPage';
import DriverUpdatesPage from './pages/driver/DriverUpdatesPage';
import TripExecutionPage from './pages/driver/TripExecutionPage';
import TripReportPage from './pages/driver/report/TripReportPage';
import TripDetailScreen from './pages/driver/TripDetailScreen';
import MobileDriverDashboard from './components/dashboard/MobileDriverDashboard';
import ClientTripPage from './pages/ClientTripPage';
import DriverRegistrationPage from './pages/driver/DriverRegistrationPage';
import DriverWelcomePage from './pages/driver/DriverWelcomePage';
import DriverOnboardingPage from './pages/driver/DriverOnboardingPage';
import CompliancePage from './pages/driver/CompliancePage';
import DriverSchedulePage from './pages/driver/DriverSchedulePage';
import BackfillTripPage from './pages/driver/BackfillTripPage';
import ScheduleTripPage from './pages/driver/ScheduleTripPage';

import DriverProfilePage from './pages/driver/DriverProfilePage';
import DriverSettingsPage from './pages/driver/DriverSettingsPage';
import DriverCreateTripPage from './pages/driver/DriverCreateTripPage';
import MobileComingSoonPage from './pages/driver/MobileComingSoonPage';
import AppLayout from './components/AppLayout';
import { KeyboardNavigation } from './components/KeyboardNavigation';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';


const queryClient = new QueryClient();

// HP-inspired theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#0096D6', // HP Blue
        },
        success: {
            main: '#00C853',
        },
        warning: {
            main: '#FF9800',
        },
        background: {
            default: '#f8f9fa',
            paper: '#ffffff',
        },
        text: {
            primary: '#212121',
            secondary: '#757575',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 500,
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                    fontWeight: 500,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    borderRadius: 12,
                },
            },
        },
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarColor: '#0096D6 #f5f5f5',
                    '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                        backgroundColor: 'transparent',
                        width: '8px',
                        height: '8px',
                    },
                    '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                        borderRadius: 8,
                        backgroundColor: '#0096D6',
                        minHeight: 24,
                        border: '2px solid transparent',
                        backgroundClip: 'content-box'
                    },
                    '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
                        backgroundColor: '#007bb0', // Darker shade
                    },
                    '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
                        backgroundColor: 'transparent',
                    },
                },
            },
        },
    },
});

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function RootRedirect() {
    const user = useAuthStore((state) => state.user);
    if (user?.role === 'DRIVER') {
        return <Navigate to="/driver/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
}

function AdminGuard({ children }: { children: React.ReactNode }) {
    const user = useAuthStore((state) => state.user);
    if (user?.role === 'DRIVER') {
        return <Navigate to="/driver/dashboard" replace />;
    }
    return <>{children}</>;
}

const DebugPage = ({ title }: { title: string }) => (
    <div style={{ padding: 20, paddingTop: 100 }}>
        <h3>DEBUG PLACEHOLDER: {title}</h3>
        <p>The real page crashed, so we are showing this safe version to keep the app running.</p>
    </div>
);

// ... imports at top ...
import DesktopDriverDashboard from './components/dashboard/DesktopDriverDashboard';
import { useMediaQuery, useTheme } from '@mui/material';

// ... existing components ...

function ResponsiveDriverDashboard() {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
    
    return isDesktop ? <DesktopDriverDashboard /> : <MobileDriverDashboard />;
}

function AppRoutes() {
    // useAutoLogout();

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register-driver" element={<DriverRegistrationPage />} />
            
            <Route path="/driver/*" element={
                <PrivateRoute>
                    <DriverLayout>
                        <Routes>
                            <Route path="/" element={<ResponsiveDriverDashboard />} />
                            <Route path="dashboard" element={<ResponsiveDriverDashboard />} />
                            <Route path="schedule" element={<DriverSchedulePage />} />
                            <Route path="profile" element={<DriverProfilePage />} />
                            <Route path="trips" element={<DriverTripsPage />} />
                            <Route path="trips/:tripId" element={<TripDetailScreen />} />
                            <Route path="trips/:tripId/execute" element={<TripExecutionPage />} />
                            <Route path="backfill" element={<BackfillTripPage />} />
                            <Route path="schedule-new" element={<ScheduleTripPage />} />
                            <Route path="report/:id" element={<TripReportPage />} />
                            <Route path="compliance" element={<CompliancePage />} />
                            <Route path="updates" element={<DriverUpdatesPage />} />
                            <Route path="create-trip" element={<DebugPage title="Create Trip" />} />
                            {/* Fallback */}
                            <Route path="*" element={<MobileDriverDashboard />} />
                        </Routes>
                    </DriverLayout>
                </PrivateRoute>
            } />

            {/* Admin/Dispatcher Layout */}
            <Route
                path="/*"
                element={
                    <PrivateRoute>
                        <AdminGuard>
                            <AppLayout>
                                <Routes>
                                    <Route path="/dashboard" element={
                                        <ErrorBoundary>
                                            <DashboardPage />
                                        </ErrorBoundary>
                                    } />
                                    <Route path="/" element={<RootRedirect />} />
                                </Routes>
                            </AppLayout>
                        </AdminGuard>
                    </PrivateRoute>
                }
            />
            <Route path="/test" element={<div>Pure React Test Page - No MUI</div>} />
            <Route path="*" element={<Box sx={{ p: 4 }}>Route Not Found (Post-Safemode)</Box>} />
        </Routes>
    );
}

function App() {
    console.log('App.tsx rendering (Simplified)');
    return (
        <QueryClientProvider client={queryClient}>
            <SocketProvider>
                <NotificationProvider>
                    <ThemeProvider theme={theme}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <CssBaseline />
                            <BrowserRouter>
                                {/* <KeyboardNavigation /> */}
                                <AppRoutes />
                            </BrowserRouter>
                        </LocalizationProvider>
                    </ThemeProvider>
                </NotificationProvider>
            </SocketProvider>
        </QueryClientProvider>
    );
}

export default App;
