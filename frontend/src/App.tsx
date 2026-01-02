import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useAuthStore } from './store/auth';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ArchivePage from './pages/ArchivePage';
import MembersPage from './pages/MembersPage';
import DriverPage from './pages/DriverPage';
import AppLayout from './components/AppLayout';

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
                        <Route
                            path="/*"
                            element={
                                <PrivateRoute>
                                    <AppLayout>
                                        <Routes>
                                            <Route path="/dashboard" element={<DashboardPage />} />
                                            <Route path="/archives" element={<ArchivePage />} />
                                            <Route path="/members" element={<MembersPage />} />
                                            <Route path="/driver" element={<DriverPage />} />
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
