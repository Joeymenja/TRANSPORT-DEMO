import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuthStore } from './store/auth';
import { useAutoLogout } from './hooks/useAutoLogout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/admin/ReportsPage';
import ReportDetailPage from './pages/admin/ReportDetailPage';
import ArchivePage from './pages/ArchivePage';
import MembersPage from './pages/MembersPage';
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
import DriverMessagesPage from './pages/driver/DriverMessagesPage';
import DriverProfilePage from './pages/driver/DriverProfilePage';
import DriverSettingsPage from './pages/driver/DriverSettingsPage';
import AppLayout from './components/AppLayout';
import { KeyboardNavigation } from './components/KeyboardNavigation';
import { ErrorBoundary } from './components/ErrorBoundary';


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
    },
});

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
    useAutoLogout();

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
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
            <Route
                path="/driver/*"
                element={
                    <PrivateRoute>
                        <DriverLayout>
                            <Routes>
                                <Route path="/" element={<MobileDriverDashboard />} />
                                <Route path="dashboard" element={<MobileDriverDashboard />} />
                                <Route path="trips" element={<DriverTripsPage />} />
                                <Route path="trips/:tripId" element={<TripDetailScreen />} />
                                <Route path="trips/:tripId/execute" element={<TripExecutionPage />} />
                                <Route path="trips/:tripId/report" element={<TripReportPage />} />
                                <Route path="schedule" element={<DriverSchedulePage />} />
                                <Route path="messages" element={<DriverMessagesPage />} />
                                <Route path="profile" element={<DriverProfilePage />} />
                                <Route path="settings" element={<DriverSettingsPage />} />
                                <Route path="compliance" element={<CompliancePage />} />
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
                                <Route path="/" element={<Navigate to="/dashboard" />} />
                            </Routes>
                        </AppLayout>
                    </PrivateRoute>
                }
            />
        </Routes>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <CssBaseline />
                    <BrowserRouter>
                        <KeyboardNavigation />
                        <AppRoutes />
                    </BrowserRouter>
                </LocalizationProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export default App;
