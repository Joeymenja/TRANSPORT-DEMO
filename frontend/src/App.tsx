import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuthStore } from './store/auth';
import { useAutoLogout } from './hooks/useAutoLogout';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
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
import DriverLogsPage from './pages/driver/DriverLogsPage';
import HeadingToPickupPage from './pages/driver/HeadingToPickupPage';
import ArrivedAtPickupPage from './pages/driver/ArrivedAtPickupPage';
import MemberVerificationPage from './pages/driver/MemberVerificationPage';
import MemberBoardingPage from './pages/driver/MemberBoardingPage';
import DropoffConfirmationPage from './pages/driver/DropoffConfirmationPage';
import TripExecutionPage from './pages/driver/TripExecutionPage';
import TripReportPage from './pages/driver/report/TripReportPage';
import TripDetailScreen from './pages/driver/TripDetailScreen';
import MobileDriverDashboard from './components/dashboard/MobileDriverDashboard';
import DesktopDriverDashboard from './components/dashboard/DesktopDriverDashboard';
import ClientTripPage from './pages/ClientTripPage';
import DriverRegistrationPage from './pages/driver/DriverRegistrationPage';
import DriverWelcomePage from './pages/driver/DriverWelcomePage';
import DriverOnboardingPage from './pages/driver/DriverOnboardingPage';
import CompliancePage from './pages/driver/CompliancePage';
import DriverSchedulePage from './pages/driver/DriverSchedulePage';

import DriverProfilePage from './pages/driver/DriverProfilePage';
import DriverSignaturePage from './pages/driver/DriverSignaturePage';
import EditDriverProfilePage from './pages/driver/EditDriverProfilePage';
import DriverSettingsPage from './pages/driver/DriverSettingsPage';
import HelpSupportPage from './pages/driver/HelpSupportPage';
import IncidentReportPage from './pages/driver/IncidentReportPage';
import TripLogDetailPage from './pages/driver/TripLogDetailPage';
import VehicleStatusPage from './pages/driver/VehicleStatusPage';
import DriverCreateTripPage from './pages/driver/DriverCreateTripPage';
import BackfillTripPage from './pages/driver/BackfillTripPage';
import StitchDriverDashboard from './pages/driver/StitchDriverDashboard';
import StitchSchedulePage from './pages/driver/StitchSchedulePage';
import StitchMessagesPage from './pages/driver/StitchMessagesPage';
import StitchProfilePage from './pages/driver/StitchProfilePage';
import StitchVehiclePage from './pages/driver/StitchVehiclePage';
import StitchHistoryPage from './pages/driver/StitchHistoryPage';
import StitchPerformancePage from './pages/driver/StitchPerformancePage';
import StitchSettingsPage from './pages/driver/StitchSettingsPage';
import StitchHelpPage from './pages/driver/StitchHelpPage';
import StitchDocumentsPage from './pages/driver/StitchDocumentsPage';
// GVBH Driver App - Complete integrated module
import { GVBHApp } from './gvbh';
import AppLayout from './components/AppLayout';
import GlobalToast from './components/GlobalToast';
import { KeyboardNavigation } from './components/KeyboardNavigation';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';


const queryClient = new QueryClient();

// HP-inspired theme
// Stitch-inspired theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#14B8A6', // Stitch Teal
            light: '#5EEAD4',
            dark: '#0F766E',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#64748B', // Slate
        },
        success: {
            main: '#10B981', // Emerald
        },
        warning: {
            main: '#F59E0B', // Amber
        },
        error: {
            main: '#EF4444', // Red
        },
        background: {
            default: '#F5F7FA', // Light Grey/Blue
            paper: '#ffffff',
        },
        text: {
            primary: '#1F2937', // Grey 900
            secondary: '#6B7280', // Grey 500
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 700,
            letterSpacing: '-0.02em',
        },
        h6: {
            fontWeight: 600,
            letterSpacing: '-0.01em',
        },
        subtitle1: {
            fontWeight: 600,
        },
        button: {
            fontWeight: 600,
            textTransform: 'none',
        },
    },
    shape: {
        borderRadius: 4, // Sharp corners as requested
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                    padding: '10px 24px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)', // Teal glow
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)', // Subtler shadow
                    border: '1px solid rgba(229, 231, 235, 0.5)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    borderRadius: 4,
                },
                elevation1: {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }
            }
        },
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarColor: '#14B8A6 #F5F7FA',
                    '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                        backgroundColor: 'transparent',
                        width: '8px',
                        height: '8px',
                    },
                    '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                        borderRadius: 8,
                        backgroundColor: '#14B8A6',
                        minHeight: 24,
                        border: '2px solid transparent',
                        backgroundClip: 'content-box'
                    },
                    '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
                        backgroundColor: '#0F766E',
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
    if (user?.role === 'DRIVER' || user?.role === 'HOUSE_MANAGER') {
        return <Navigate to="/driver/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
}

function AdminGuard({ children }: { children: React.ReactNode }) {
    const user = useAuthStore((state) => state.user);
    if (user?.role === 'DRIVER' || user?.role === 'HOUSE_MANAGER') {
        return <Navigate to="/driver/dashboard" replace />;
    }
    return <>{children}</>;
}

function AppRoutes() {
    useAutoLogout();

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/register-driver" element={<DriverRegistrationPage />} />
            <Route path="/driver/welcome" element={
                <PrivateRoute>
                    <DriverWelcomePage />
                </PrivateRoute>
            } />
            <Route path="/driver/documents" element={<Navigate to="/driver/onboarding" />} />
            <Route path="/driver/onboarding" element={
                <PrivateRoute>
                    <DriverOnboardingPage />
                </PrivateRoute>
            } />
            <Route path="/client/:memberId" element={<ClientTripPage />} />
            
            {/* GVBH Driver App - Full-screen mobile experience (outside DriverLayout) */}
            <Route
                path="/driver/gvbh/*"
                element={
                    <PrivateRoute>
                        <GVBHApp embedded />
                    </PrivateRoute>
                }
            />
            
            <Route
                path="/driver/*"
                element={
                    <PrivateRoute>
                        <DriverLayout>
                            <Routes>
                                <Route path="/" element={<DashboardPage />} />
                                <Route path="dashboard" element={<DashboardPage />} />
                                <Route path="updates" element={<DriverUpdatesPage />} />
                                <Route path="logs" element={<DriverLogsPage />} />
                                <Route path="logs/:id" element={<TripLogDetailPage />} />
                                <Route path="trips" element={<DriverTripsPage />} />
                                <Route path="trips/:tripId" element={<TripDetailScreen />} />
                                <Route path="trips/:tripId/navigate" element={<HeadingToPickupPage />} />
                                <Route path="trips/:tripId/arrived" element={<ArrivedAtPickupPage />} />
                                <Route path="trips/:tripId/verification" element={<MemberVerificationPage />} />
                                <Route path="trips/:tripId/boarding" element={<MemberBoardingPage />} />
                                <Route path="trips/:tripId/execute" element={<TripExecutionPage />} />
                                <Route path="trips/:tripId/dropoff" element={<DropoffConfirmationPage />} />
                                <Route path="trips/:tripId/report" element={<TripReportPage />} />
                                <Route path="report/:id" element={<TripReportPage />} />
                                <Route path="schedule" element={<DriverSchedulePage />} />

                                <Route path="profile" element={<DriverProfilePage />} />
                                <Route path="profile/edit" element={<EditDriverProfilePage />} />
                                <Route path="profile/signature" element={<DriverSignaturePage />} />
                                <Route path="settings" element={<DriverSettingsPage />} />
                                <Route path="help" element={<HelpSupportPage />} />
                                <Route path="incident" element={<IncidentReportPage />} />
                                <Route path="vehicle" element={<VehicleStatusPage />} />
                                <Route path="compliance" element={<CompliancePage />} />
                                <Route path="create-trip" element={<DriverCreateTripPage />} />
                                <Route path="backfill" element={<BackfillTripPage />} />
                                
                                {/* Stitch Sub-routes */}
                                <Route path="stitch" element={<StitchDriverDashboard />} />
                                <Route path="stitch/schedule" element={<StitchSchedulePage />} />
                                <Route path="stitch/messages" element={<StitchMessagesPage />} />
                                <Route path="stitch/profile" element={<StitchProfilePage />} />
                                <Route path="stitch/vehicle" element={<StitchVehiclePage />} />
                                <Route path="stitch/history" element={<StitchHistoryPage />} />
                                <Route path="stitch/performance" element={<StitchPerformancePage />} />
                                <Route path="stitch/settings" element={<StitchSettingsPage />} />
                                <Route path="stitch/help" element={<StitchHelpPage />} />
                                <Route path="stitch/documents" element={<StitchDocumentsPage />} />
                            </Routes>
                        </DriverLayout>
                    </PrivateRoute>
                }
            />

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
                                    <Route path="/archives" element={<ArchivePage />} />
                                    <Route path="/members" element={<MembersPage />} />
                                    <Route path="/members/:id" element={<MemberDetailsPage />} />
                                    <Route path="/drivers" element={<DriversPage />} />
                                    <Route path="/drivers/:id" element={<DriverDetailsPage />} />
                                    <Route path="/drivers/:id/trips" element={<DriverTripHistoryPage />} />
                                    <Route path="/vehicles" element={<VehiclesPage />} />
                                    <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
                                    <Route path="/trips" element={<TripsPage />} />
                                    <Route path="/trips/new" element={<CreateTripPage />} />
                                    <Route path="/trips/:id" element={<TripDetailsPage />} />
                                    <Route path="/reports" element={<ReportsPage />} />
                                    <Route path="/billing" element={<BillingPage />} />
                                    <Route path="/notifications" element={<NotificationsPage />} />
                                    <Route path="/settings" element={<SettingsPage />} />
                                    <Route path="/" element={<RootRedirect />} />
                                </Routes>
                            </AppLayout>
                        </AdminGuard>
                    </PrivateRoute>
                }
            />
        </Routes>
    );
}

function App() {
    console.log('App.tsx rendering');
    return (
        <QueryClientProvider client={queryClient}>
            <SocketProvider>
                <NotificationProvider>
                    <ThemeProvider theme={theme}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <CssBaseline />
                            <GlobalToast />
                            <BrowserRouter>
                                <KeyboardNavigation />
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
