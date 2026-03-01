import React from 'react';
import { 
  Home, 
  Users,
  DollarSign,
  Bookmark
} from 'lucide-react';
import RocketWithProgress from './RocketWithProgress';

interface NavigationItem {
  name: string;
  icon: React.ReactNode;
}

interface NavigationProps {
  items?: NavigationItem[];
  className?: string;
  onItemClick?: (itemName: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  items = [
    { name: 'Home', icon: <Home size={20} /> },
    { name: 'Julienties', icon: <Users size={20} /> },
    { name: 'Fund Raising', icon: <DollarSign size={20} /> },
    { name: 'Bookmark', icon: <Bookmark size={20} /> }
  ],
  className = '',
  onItemClick = () => {}
}) => {
  // Define which items should be disabled
  const disabledItems = ['Fund Raising', 'Bookmark'];
  
  return (
    <div className={`bg-background-secondary rounded-2xl p-4 border border-border ${className}`}>
      <h2 className="font-bold text-lg mb-4">Navigation</h2>
      <nav className="space-y-2">
        {items.map((item) => {
          const isDisabled = disabledItems.includes(item.name);
          
          return (
            <button
              key={item.name}
              onClick={() => !isDisabled && onItemClick(item.name)}
              disabled={isDisabled}
              className={`relative flex items-center gap-3 p-3 rounded-xl w-full text-left transition-colors ${
                isDisabled 
                  ? 'opacity-50 cursor-not-allowed text-text-tertiary' 
                  : 'hover:bg-background-tertiary text-text-primary'
              }`}
            >
              <span className={isDisabled ? 'text-text-tertiary' : 'text-text-primary'}>
                {item.icon}
              </span>
              <span className={`font-medium ${isDisabled ? 'text-text-tertiary' : ''}`}>
                {item.name}
              </span>
              
              {/* Rocket with progress indicator for upcoming features */}
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
