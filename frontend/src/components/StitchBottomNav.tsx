/**
 * Stitch Bottom Navigation - Shared navigation component for all Stitch pages
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, MessageSquare, Car, User } from 'lucide-react';

const StitchBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const NAV_ITEMS = [
    { id: 'home', label: 'Home', icon: Home, route: '/driver/stitch' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, route: '/driver/stitch/schedule' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, route: '/driver/updates' },
    { id: 'trips', label: 'Logs', icon: Car, route: '/driver/logs' },
    { id: 'profile', label: 'Profile', icon: User, route: '/driver/stitch/profile' },
  ];

  const getActiveTab = () => {
    if (location.pathname.includes('/stitch/schedule')) return 'schedule';
    if (location.pathname.includes('/stitch/profile')) return 'profile';
    if (location.pathname.includes('/updates')) return 'messages';
    if (location.pathname.includes('/logs')) return 'trips';
    if (location.pathname.includes('/stitch')) return 'home';
    return 'home';
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 pb-16 z-50">
      <div className="max-w-md mx-auto flex justify-around">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.route)}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${
              getActiveTab() === item.id ? 'text-teal-500' : 'text-gray-400'
            }`}
          >
            <item.icon size={24} />
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default StitchBottomNav;
