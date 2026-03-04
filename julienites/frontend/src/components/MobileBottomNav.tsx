import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Search, Bell, User } from 'lucide-react';

const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Home', icon: <Home size={24} />, path: '/' },
    { name: 'Search', icon: <Search size={24} />, path: '/search' },
    { name: 'Julienties', icon: <Users size={24} />, path: '/julienties' },
    { name: 'Notifications', icon: <Bell size={24} />, path: '/notifications' },
    { name: 'Profile', icon: <User size={24} />, path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background-primary border-t border-border z-50 lg:hidden safe-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center p-2 ${
              location.pathname === item.path 
                ? 'text-twitter-blue' 
                : 'text-text-tertiary'
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileBottomNav;