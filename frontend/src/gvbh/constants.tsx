
import { 
  Home, 
  Calendar, 
  MessageSquare, 
  Car, 
  User, 
  FileText,
  Clock,
  MapPin,
  ShieldCheck,
  Award,
  Settings,
  Bell
} from 'lucide-react';

export const COLORS = {
  primary: '#0ea5e9', // Sky 500
  secondary: '#14b8a6', // Teal 500
  accent: '#f59e0b', // Amber 500
  danger: '#ef4444', // Red 500
  success: '#22c55e', // Green 500
  neutral: '#64748b', // Slate 500
  dark: '#0f172a',    // Slate 900
};

export const SHADOWS = {
  soft: 'shadow-[0_10px_30px_rgba(0,0,0,0.02)]',
  medium: 'shadow-[0_20px_40px_rgba(0,0,0,0.04)]',
  heavy: 'shadow-[0_30px_60px_rgba(0,0,0,0.08)]',
  primary: 'shadow-2xl shadow-teal-100',
  inner: 'shadow-inner',
};

export const RADII = {
  card: 'rounded-[44px]',
  button: 'rounded-[32px]',
  pill: 'rounded-full',
  icon: 'rounded-[20px]',
};

export const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'messages', label: 'Chat', icon: MessageSquare },
  { id: 'trips', label: 'Fleet', icon: Car },
  { id: 'profile', label: 'Me', icon: User },
];

export const MOCK_TRIPS = [
  {
    id: 'TRP-1024',
    client: {
      id: 'CL-1',
      name: 'John Doe',
      memberId: 'INS-123456789',
      phone: '555-0101',
      mobilityNeeds: ['Wheelchair', 'Curb Assist'],
      specialInstructions: 'Client requires front door pickup.',
    },
    scheduledTime: '10:45 AM',
    appointmentTime: '11:15 AM',
    pickupAddress: '450 Stanyan St, San Francisco, CA',
    dropoffAddress: '124 Willow Lane, South San Francisco, CA',
    pickupFacility: 'UCSF Medical Center',
    dropoffFacility: 'Dialysis Center West',
    status: 'SCHEDULED',
    estimatedDistance: 4.2,
    estimatedDuration: 18,
    type: 'SINGLE',
    equipmentRequired: ['Wheelchair Ramp', 'Oxygen Compatible'],
  },
  {
    id: 'TRP-8821',
    client: {
      id: 'CL-MULTI',
      name: 'Carpool Group A',
      memberId: 'GRP-001',
      phone: '555-0000',
      mobilityNeeds: ['Ambulatory'],
    },
    passengers: [
      { id: 'CL-5', name: 'Alice Smith', memberId: 'INS-555', phone: '555-1111', mobilityNeeds: [] },
      { id: 'CL-6', name: 'Bob Jones', memberId: 'INS-666', phone: '555-2222', mobilityNeeds: ['Walker'] }
    ],
    scheduledTime: '08:00 AM',
    appointmentTime: '09:00 AM',
    pickupAddress: 'Community Center, Phoenix',
    dropoffAddress: 'Rehab Clinic South',
    status: 'SCHEDULED',
    estimatedDistance: 12.5,
    estimatedDuration: 45,
    type: 'CARPOOL',
    equipmentRequired: ['Walker Storage'],
  },
  {
    id: 'TRP-1025',
    client: {
      id: 'CL-2',
      name: 'Eleanor Pena',
      memberId: 'INS-987654321',
      phone: '555-0202',
      mobilityNeeds: ['Ambulatory'],
    },
    scheduledTime: '1:00 PM',
    appointmentTime: '1:30 PM',
    pickupAddress: '123 Medical Center Dr, Suite 400',
    dropoffAddress: '789 Residential Ave',
    status: 'SCHEDULED',
    estimatedDistance: 6.8,
    estimatedDuration: 25,
    type: 'SINGLE',
  }
];

export const ONBOARDING_STEPS = [
  { id: 1, label: 'Identity', icon: User },
  { id: 2, label: 'Licensing', icon: FileText },
  { id: 3, label: 'Asset', icon: Car },
  { id: 4, label: 'Vetting', icon: ShieldCheck },
  { id: 5, label: 'Training', icon: Award },
];
