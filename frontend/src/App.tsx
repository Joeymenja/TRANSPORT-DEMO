import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useAuthStore } from './store/auth';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ArchivePage from './pages/ArchivePage';
import MembersPage from './pages/MembersPage';
import { DriversPage } from './pages/DriversPage';
import DriverLayout from './components/DriverLayout';
import DriverTripsPage from './pages/driver/DriverTripsPage';
import TripExecutionPage from './pages/driver/TripExecutionPage';
import ClientTripPage from './pages/ClientTripPage';
import AppLayout from './components/AppLayout';

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

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/client/:memberId" element={<ClientTripPage />} />
                        <Route
                            path="/driver/*"
                            element={
                                <PrivateRoute>
                                    <DriverLayout>
                                        <Routes>
                                            <Route path="/" element={<Navigate to="trips" />} />
                                            <Route path="trips" element={<DriverTripsPage />} />
                                            <Route path="trips/:tripId" element={<TripExecutionPage />} />
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
                                            <Route path="/drivers" element={<DriversPage />} />
                                            <Route path="/" element={<Navigate to="/dashboard" />} />
                                        </Routes>
                                    </AppLayout>
                                </PrivateRoute>
                            }
                        />
                    </Routes>
                </BrowserRouter>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export default App;
