/**
 * GVBH Driver App - Integrated with TRANSPORT-DEMO Backend
 * This is the main entry point for the driver mobile experience
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trip, TripStatus } from './types';
import { MOCK_TRIPS } from './constants';
import { gvbhApi } from './api/adapter';
import { useAuthStore } from '../store/auth';
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
import { realtimeService } from './services/RealtimeService';

interface GVBHAppProps {
  /** If true, skip auth check and use parent's auth state */
  embedded?: boolean;
}

const GVBHApp: React.FC<GVBHAppProps> = ({ embedded = false }) => {
  const { user, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState('home');
  const [isTripActive, setIsTripActive] = useState(false);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [viewingTrip, setViewingTrip] = useState<Trip | null>(null);
  const [viewingChat, setViewingChat] = useState<any>(null);
  const [overlay, setOverlay] = useState<string | null>(null);
  const [isAccountActive, setIsAccountActive] = useState(true); // Skip onboarding if embedded
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  
  const [notifications, setNotifications] = useState<any[]>([
    { id: '1', title: 'System Synced', body: 'Fleet audit logs uploaded.', time: '1h ago', read: true, type: 'system' }
  ]);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Fetch real trips from backend
  const { data: trips = [], refetch: refetchTrips } = useQuery({
    queryKey: ['gvbh-trips'],
    queryFn: gvbhApi.fetchTrips,
    staleTime: 30000, // 30 seconds
  });

  // Combine real trips with mock trips for display
  const allTrips = trips.length > 0 ? trips : MOCK_TRIPS;

  useEffect(() => {
    // Check onboarding status for non-embedded mode
    if (!embedded) {
      const onboardingStatus = localStorage.getItem('onboarding_complete');
      if (onboardingStatus === 'true') setIsAccountActive(true);
    }

    const events = [
      'open-chat', 'open-docs', 'open-vehicles', 'open-inspection', 
      'open-incident', 'open-expenses', 'open-earnings', 'open-help', 
      'open-settings', 'open-performance', 'open-history', 'open-sync', 
      'open-manual-report', 'open-initiate-trip', 'open-voice', 'open-notifications'
    ];

    const handlers = events.map(event => (e: any) => {
      if (event === 'open-chat') setViewingChat(e.detail);
      else setOverlay(event.replace('open-', ''));
    });

    events.forEach((event, i) => window.addEventListener(event, handlers[i]));
    
    const handleNewTrip = (e: any) => {
      const newNotif = {
        id: Date.now().toString(),
        title: 'New Dispatch Assignment',
        body: e.detail.clientName ? `Service for ${e.detail.clientName} confirmed.` : 'New active mission assigned.',
        time: 'Just now',
        read: false,
        type: 'trip',
        tripId: e.detail.tripId
      };
      setNotifications(prev => [newNotif, ...prev]);
      setToast({ message: 'New Mission Received', type: 'info' });
      refetchTrips(); // Refresh trips list
    };
    window.addEventListener('new-trip-submission', handleNewTrip);

    window.addEventListener('show-toast', (e: any) => setToast({ message: e.detail.message, type: e.detail.type || 'info' }));

    // Socket Events Integration
    realtimeService.on('SERVER_NEW_MESSAGE', (data) => {
      const newNotif = {
        id: data.id,
        title: 'Dispatch Alert',
        body: data.text,
        time: data.timestamp,
        read: false,
        type: 'system'
      };
      setNotifications(prev => [newNotif, ...prev]);
      setToast({ message: 'Incoming Dispatch Stream', type: 'info' });
    });

    realtimeService.on('TRIP_CANCELED', (data) => {
      const cancelNotif = {
        id: Date.now().toString(),
        title: 'Trip Canceled',
        body: `Trip ${data.tripId} removed from queue: ${data.reason}`,
        time: 'Just now',
        read: false,
        type: 'system'
      };
      setNotifications(prev => [cancelNotif, ...prev]);
      setToast({ message: `Trip ${data.tripId} canceled by dispatch.`, type: 'error' });
      refetchTrips();
    });

    realtimeService.on('DEMAND_SURGE', (data) => {
      setToast({ message: `High Demand in ${data.area} (${data.multiplier})`, type: 'info' });
    });

    // Connect realtime service
    if (token) {
      realtimeService.connect();
    }

    return () => {
      events.forEach((event, i) => window.removeEventListener(event, handlers[i]));
      window.removeEventListener('new-trip-submission', handleNewTrip);
    };
  }, [token, refetchTrips, embedded]);

  const handleLogin = () => {
    // In embedded mode, auth is handled by parent
    // In standalone mode, use the local auth screen
    localStorage.setItem('is_authenticated', 'true');
    realtimeService.connect();
  };

  const handleStartTrip = async (id: string) => {
    // First try to find in real trips
    let trip = trips.find(t => t.id === id);
    
    // Fallback to mock trips
    if (!trip) {
      trip = MOCK_TRIPS.find(t => t.id === id) as any;
    }
    
    if (trip) {
      // Update status in backend
      await gvbhApi.startTrip(id);
      
      setActiveTrip(trip);
      setViewingTrip(null);
      setIsTripActive(true);
    }
  };

  const handleViewTrip = (id: string) => {
    const trip = allTrips.find(t => t.id === id);
    if (trip) {
      setViewingTrip(trip as Trip);
    }
  };

  const handleCompleteTrip = async () => {
    if (activeTrip) {
      await gvbhApi.completeTrip(activeTrip.id);
      refetchTrips();
    }
    setIsTripActive(false);
    setActiveTrip(null);
    setToast({ message: 'Trip Completed Successfully', type: 'success' });
  };

  const handleInitiateAdHoc = (trip: Trip) => {
    setOverlay(null);
    if (trip.status === TripStatus.SCHEDULED) {
      setToast({ message: 'Deployment Scheduled', type: 'success' });
    } else {
      setActiveTrip(trip);
      setIsTripActive(true);
    }
    window.dispatchEvent(new CustomEvent('new-trip-submission', { detail: { clientName: trip.client.name, tripId: trip.id } }));
  };

  // In embedded mode, skip auth screen (parent handles auth)
  // In standalone mode, check local auth state
  if (!embedded && !token) {
    const localAuth = localStorage.getItem('is_authenticated');
    if (localAuth !== 'true') {
      return <AuthScreen onLogin={handleLogin} />;
    }
  }

  // Show onboarding if needed
  if (!isAccountActive && !embedded) {
    return <OnboardingScreen onComplete={() => { 
      localStorage.setItem('onboarding_complete', 'true'); 
      setIsAccountActive(true); 
    }} />;
  }

  return (
    <div className="fixed inset-0 bg-white overflow-hidden max-w-md mx-auto shadow-4xl font-sans">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        title={activeTab === 'home' ? 'Mission HUD' : activeTab.toUpperCase()}
        rightAction={
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-notifications'))}
            className="p-3.5 -mr-2 relative text-gray-400 active:scale-90 transition-all bg-gray-50 rounded-2xl"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-red-500 border-4 border-white rounded-full animate-pulse" />
            )}
          </button>
        }
      >
        {activeTab === 'home' && (
            <DashboardScreen 
                onStartTrip={handleStartTrip} 
                onViewTrip={handleViewTrip}
            />
        )}
        {activeTab === 'schedule' && <ScheduleScreen />}
        {activeTab === 'messages' && <MessagesScreen />}
        {activeTab === 'trips' && <AvailabilityScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </Layout>

      {/* Navigation Overlays */}
      {viewingTrip && <TripDetailScreen trip={viewingTrip} onBack={() => setViewingTrip(null)} onStart={handleStartTrip} />}
      {isTripActive && activeTrip && <ActiveTripScreen trip={activeTrip} onBack={() => setIsTripActive(false)} onComplete={handleCompleteTrip} />}
      
      {/* Functional Overlays */}
      {viewingChat && <ChatScreen thread={viewingChat} onBack={() => setViewingChat(null)} />}
      {overlay === 'docs' && <DocumentsScreen onBack={() => setOverlay(null)} />}
      {overlay === 'vehicles' && <VehicleManagementScreen onBack={() => setOverlay(null)} />}
      {overlay === 'inspection' && <VehicleInspectionScreen onBack={() => setOverlay(null)} />}
      {overlay === 'incident' && <IncidentReportScreen onBack={() => setOverlay(null)} />}
      {overlay === 'expenses' && <ExpenseLogScreen onBack={() => setOverlay(null)} />}
      {overlay === 'earnings' && <ReportingStatsScreen onBack={() => setOverlay(null)} />}
      {overlay === 'help' && <HelpSupportScreen onBack={() => setOverlay(null)} />}
      {overlay === 'settings' && <SettingsScreen onBack={() => setOverlay(null)} />}
      {overlay === 'performance' && <PerformanceScreen onBack={() => setOverlay(null)} />}
      {overlay === 'history' && <TripHistoryScreen onBack={() => setOverlay(null)} />}
      {overlay === 'sync' && <SyncStatusScreen onBack={() => setOverlay(null)} />}
      {overlay === 'manual-report' && <ManualReportScreen onBack={() => setOverlay(null)} />}
      {overlay === 'initiate-trip' && <InitiateTripScreen onBack={() => setOverlay(null)} onStart={handleInitiateAdHoc} />}
      {overlay === 'voice' && <VoiceAssistantScreen onBack={() => setOverlay(null)} />}
      
      {overlay === 'notifications' && (
        <div className="fixed inset-0 z-[100]">
          <NotificationCenter 
            items={notifications} 
            onClose={() => setOverlay(null)} 
            onMarkRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))} 
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

export default GVBHApp;
