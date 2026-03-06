import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  DollarSign,
  Microscope
} from 'lucide-react';
import RocketWithProgress from './RocketWithProgress';

interface NavigationItem {
  name: string;
  icon: React.ReactNode;
  path: string;
}

interface NavigationProps {
  className?: string;
}

const navItems: NavigationItem[] = [
  { name: 'Home', icon: <Home size={20} />, path: '/' },
  { name: 'Research', icon: <Microscope size={20} />, path: '/research' },
  { name: 'Julienties', icon: <Users size={20} />, path: '/julienties' },
  { name: 'Fund Raising', icon: <DollarSign size={20} />, path: '/fund-raising' },
];

const disabledItems = ['Fund Raising'];

const Navigation: React.FC<NavigationProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className={`bg-background-secondary rounded-2xl p-3 border border-border ${className}`}>
      <h2 className="font-bold text-sm mb-2">Navigation</h2>
      <nav className="space-y-0.5">
        {navItems.map((item) => {
          const isDisabled = disabledItems.includes(item.name);
          const isActive = !isDisabled && location.pathname === item.path;

          return (
            <button
              key={item.name}
              onClick={() => !isDisabled && navigate(item.path)}
              disabled={isDisabled}
              className={`relative flex items-center gap-2 px-2 py-2 rounded-lg w-full text-left transition-colors text-sm ${
                isDisabled
                  ? 'opacity-50 cursor-not-allowed text-text-tertiary'
                  : isActive
                  ? 'bg-twitter-blue/10 text-twitter-blue'
                  : 'hover:bg-background-tertiary text-text-primary'
              }`}
            >
              <span className={isDisabled ? 'text-text-tertiary' : isActive ? 'text-twitter-blue' : 'text-text-primary'}>
                {item.icon}
              </span>
              <span className={`font-medium ${isDisabled ? 'text-text-tertiary' : isActive ? 'text-twitter-blue font-bold' : ''}`}>
                {item.name}
              </span>

              {isDisabled && (
                <span className="ml-2">
                  <RocketWithProgress
                    progress={10}
                    size={20}
                    progressColor="#22c55e"
                    remainingColor="#ef4444"
                    rocketColor="#eab308"
                  />
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Navigation;
