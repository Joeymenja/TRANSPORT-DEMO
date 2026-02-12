
import React, { useState, useEffect } from 'react';
import { Trip, TripStatus } from './types';
import { MOCK_TRIPS } from './constants';
import { api } from './services/api';
import Layout from './components/Layout';
import DashboardScreen from './screens/DashboardScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import MessagesScreen from './screens/MessagesScreen';
import ProfileScreen from './screens/ProfileScreen';
import ActiveTripScreen from './screens/ActiveTripScreen';
import TripDetailScreen from './screens/TripDetailScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import AvailabilityScreen from './screens/AvailabilityScreen';
import AuthScreen from './screens/AuthScreen';
import ChatScreen from './screens/ChatScreen';
import DocumentsScreen from './screens/DocumentsScreen';
import VehicleManagementScreen from './screens/VehicleManagementScreen';
import VehicleInspectionScreen from './screens/VehicleInspectionScreen';
import IncidentReportScreen from './screens/IncidentReportScreen';
import ExpenseLogScreen from './screens/ExpenseLogScreen';
import ReportingStatsScreen from './screens/ReportingStatsScreen';
import HelpSupportScreen from './screens/HelpSupportScreen';
import SettingsScreen from './screens/SettingsScreen';
import PerformanceScreen from './screens/PerformanceScreen';
import TripHistoryScreen from './screens/TripHistoryScreen';
import SyncStatusScreen from './screens/SyncStatusScreen';
import ManualReportScreen from './screens/ManualReportScreen';
import InitiateTripScreen from './screens/InitiateTripScreen';
import VoiceAssistantScreen from './screens/VoiceAssistantScreen';
import NotificationCenter from './screens/NotificationCenter';
import Toast, { ToastType } from './components/Toast';
import { Bell } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isTripActive, setIsTripActive] = useState(false);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [viewingTrip, setViewingTrip] = useState<Trip | null>(null);
  const [viewingChat, setViewingChat] = useState<any>(null);
  const [overlay, setOverlay] = useState<string | null>(null);
  const [isAccountActive, setIsAccountActive] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Notification State
  const [notifications, setNotifications] = useState<any[]>([
    { id: '1', title: 'System Synced', body: 'Report audit logs uploaded.', time: '1h ago', read: true, type: 'system' }
  ]);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await api.getMe();
        if (user && user.id) {
          setIsAuthenticated(true);
        }
      } catch (e) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();

    // ... rest of useEffect
    const onboardingStatus = localStorage.getItem('onboarding_complete');
    if (onboardingStatus === 'true') setIsAccountActive(true);

    const events = [
      'open-chat', 'open-docs', 'open-vehicles', 'open-inspection',
      'open-incident', 'open-expenses', 'open-earnings', 'open-help',
      'open-settings', 'open-performance', 'open-history', 'open-sync',
      'open-manual-report', 'open-initiate-trip', 'open-voice', 'open-notifications'
    ];
    // ... (continue matching for replacement context) 


    const handlers = events.map(event => (e: any) => {
      if (event === 'open-chat') setViewingChat(e.detail);
      else setOverlay(event.replace('open-', ''));
    });

    events.forEach((event, i) => window.addEventListener(event, handlers[i]));

    // Listen for new trip submissions (Ad-hoc or Dispatched)
    const handleNewTrip = (e: any) => {
      const newNotif = {
        id: Date.now().toString(),
        title: 'New Trip Request',
        body: e.detail.clientName ? `Service for ${e.detail.clientName} submitted.` : 'A new trip has been assigned to your fleet.',
        time: 'Just now',
        read: false,
        type: 'trip',
        tripId: e.detail.tripId
      };
      setNotifications(prev => [newNotif, ...prev]);
      setToast({ message: 'New Trip Request Received', type: 'info' });
    };
    window.addEventListener('new-trip-submission', handleNewTrip);

    window.addEventListener('show-toast', (e: any) => setToast({ message: e.detail.message, type: e.detail.type || 'info' }));

    // Mock Dispatcher: Randomly submit a trip request every 60 seconds
    const mockDispatcher = setInterval(() => {
      if (isAuthenticated && isAccountActive && !isTripActive) {
        window.dispatchEvent(new CustomEvent('new-trip-submission', { detail: { tripId: 'MOCK-' + Math.random().toString(36).substr(2, 5).toUpperCase() } }));
      }
    }, 60000);

    return () => {
      events.forEach((event, i) => window.removeEventListener(event, handlers[i]));
      window.removeEventListener('new-trip-submission', handleNewTrip);
      clearInterval(mockDispatcher);
    };
  }, [isAuthenticated, isAccountActive, isTripActive]);

  const handleLogin = async (credentials: any) => {
    await api.login(credentials.email, credentials.password);
    setIsAuthenticated(true);
  };

  const handleStartTrip = (id: string) => {
    const trip = MOCK_TRIPS.find(t => t.id === id);
    if (trip) {
      setActiveTrip(trip as any);
      setViewingTrip(null);
      setIsTripActive(true);
    }
  };

  const handleInitiateAdHoc = (trip: Trip) => {
    setOverlay(null);

    if (trip.status === TripStatus.SCHEDULED) {
      // It's a future trip, just show success toast and add to notification log
      setToast({ message: 'Trip Scheduled Successfully', type: 'success' });
    } else {
      // It's an immediate trip, start it
      setActiveTrip(trip);
      setIsTripActive(true);
    }

    // Notify system of the manual submission
    window.dispatchEvent(new CustomEvent('new-trip-submission', { detail: { clientName: trip.client.name, tripId: trip.id } }));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (!isAuthenticated) return <AuthScreen onLogin={handleLogin} />;
  if (!isAccountActive) return <OnboardingScreen onComplete={() => { localStorage.setItem('onboarding_complete', 'true'); setIsAccountActive(true); }} />;

  return (
    <div className="fixed inset-0 bg-white overflow-hidden max-w-md mx-auto shadow-2xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <Layout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        title={activeTab.toUpperCase()}
        rightAction={
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-notifications'))}
            className="p-2 -mr-2 relative text-gray-400 active:scale-90 transition-all"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full animate-pulse" />
            )}
          </button>
        }
      >
        {activeTab === 'home' && <DashboardScreen onStartTrip={handleStartTrip} onViewTrip={(id) => setViewingTrip(MOCK_TRIPS.find(t => t.id === id) as any)} />}
        {activeTab === 'schedule' && <ScheduleScreen />}
        {activeTab === 'messages' && <MessagesScreen />}
        {activeTab === 'trips' && <AvailabilityScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </Layout>

      {/* Primary Layers */}
      {viewingTrip && <div className="fixed inset-0 z-20"><TripDetailScreen trip={viewingTrip} onBack={() => setViewingTrip(null)} onStart={handleStartTrip} /></div>}
      {isTripActive && activeTrip && <div className="fixed inset-0 z-30"><ActiveTripScreen trip={activeTrip} onBack={() => setIsTripActive(false)} onComplete={() => { setIsTripActive(false); setActiveTrip(null); }} /></div>}

      {/* Dynamic Overlays */}
      {viewingChat && <div className="fixed inset-0 z-40"><ChatScreen thread={viewingChat} onBack={() => setViewingChat(null)} /></div>}
      {overlay === 'docs' && <div className="fixed inset-0 z-40"><DocumentsScreen onBack={() => setOverlay(null)} /></div>}
      {overlay === 'vehicles' && <div className="fixed inset-0 z-40"><VehicleManagementScreen onBack={() => setOverlay(null)} /></div>}
      {overlay === 'inspection' && <div className="fixed inset-0 z-40"><VehicleInspectionScreen onBack={() => setOverlay(null)} /></div>}
      {overlay === 'incident' && <div className="fixed inset-0 z-40"><IncidentReportScreen onBack={() => setOverlay(null)} /></div>}
      {overlay === 'expenses' && <div className="fixed inset-0 z-40"><ExpenseLogScreen onBack={() => setOverlay(null)} /></div>}
      {overlay === 'earnings' && <div className="fixed inset-0 z-40"><ReportingStatsScreen onBack={() => setOverlay(null)} /></div>}
      {overlay === 'help' && <div className="fixed inset-0 z-40"><HelpSupportScreen onBack={() => setOverlay(null)} /></div>}
      {overlay === 'settings' && <div className="fixed inset-0 z-40"><SettingsScreen onBack={() => setOverlay(null)} /></div>}
      {overlay === 'performance' && <div className="fixed inset-0 z-40"><PerformanceScreen onBack={() => setOverlay(null)} /></div>}
      {overlay === 'history' && <div className="fixed inset-0 z-40"><TripHistoryScreen onBack={() => setOverlay(null)} /></div>}
      {overlay === 'sync' && <div className="fixed inset-0 z-40"><SyncStatusScreen onBack={() => setOverlay(null)} /></div>}
      {overlay === 'manual-report' && <div className="fixed inset-0 z-40"><ManualReportScreen onBack={() => setOverlay(null)} /></div>}
      {overlay === 'initiate-trip' && <div className="fixed inset-0 z-[95]"><InitiateTripScreen onBack={() => setOverlay(null)} onStart={handleInitiateAdHoc} /></div>}
      {overlay === 'voice' && <div className="fixed inset-0 z-50"><VoiceAssistantScreen onBack={() => setOverlay(null)} /></div>}

      {/* Notification Center Overlay */}
      {overlay === 'notifications' && (
        <div className="fixed inset-0 z-[100]">
          <NotificationCenter
            items={notifications}
            onClose={() => setOverlay(null)}
            onMarkRead={markAllRead}
            onAction={(id) => {
              const notif = notifications.find(n => n.id === id);
              if (notif?.tripId) handleStartTrip(notif.tripId);
              setOverlay(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default App;
