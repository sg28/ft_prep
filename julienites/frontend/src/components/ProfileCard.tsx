import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Briefcase, MapPin, User } from 'lucide-react';

interface ProfileCardProps {
  id: string;
  name: string;
  graduationYear?: number;
  currentRole?: string;
  location?: string;
  profileImage?: string;
  isOnline?: boolean;
  username?: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  id,
  name,
  graduationYear,
  currentRole,
  location,
  profileImage,
  isOnline = false,
  username
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/member/${id}`);
  };
  
  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  // Generate a consistent color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-twitter-blue',           // Blue
      'bg-twitter-pink',           // Pink
      'bg-twitter-green',          // Green
      'bg-purple-600',             // Purple
      'bg-amber-600',              // Amber
      'bg-cyan-600',               // Cyan
      'bg-rose-600',               // Rose
      'bg-emerald-600',            // Emerald
    ];
    
    // Simple hash function to get consistent color for each name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };
  
  // Check if we should show fallback avatar
  const showFallback = !profileImage;
  
  const initials = getInitials(name);
  const avatarColor = getAvatarColor(name);
  
  return (
    <div 
      className="bg-background-secondary rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-border transition-colors hover:bg-background-tertiary/50 cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="relative w-14 h-14 sm:w-17 sm:h-17">
          {showFallback ? (
            <div className={`w-full h-full rounded-full border-4 border-background-secondary ${avatarColor} flex items-center justify-center`}>
              <User className="text-white" size={24} />
            </div>
          ) : (
            <img 
              src={profileImage} 
              alt={`${name}'s profile`} 
              className="w-full h-full rounded-full object-cover border-4 border-background-secondary"
              onError={(e) => {
                // If image fails to load, show fallback
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const fallbackDiv = document.createElement('div');
                  fallbackDiv.className = `w-full h-full rounded-full border-4 border-background-secondary ${avatarColor} flex items-center justify-center`;
                  const userIcon = document.createElement('div');
                  userIcon.innerHTML = '<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                  fallbackDiv.appendChild(userIcon);
                  parent.appendChild(fallbackDiv);
                }
              }}
            />
          )}
          {isOnline && (
            <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-success-color rounded-full border-2 border-background-secondary"></div>
          )}
        </div>
        
        <button 
          className="text-text-primary font-medium text-xs hover:underline transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            // Handle follow button click
          }}
        >
          Follow
        </button>
      </div>
      
      <div className="mt-1">
        <div className="mb-2 sm:mb-3">
          <h3 className="text-lg sm:text-xl font-extrabold text-text-primary">{name}</h3>
          {username && (
            <span className="text-text-tertiary text-xs sm:text-sm block">@{username}</span>
          )}
        </div>
        
        {graduationYear && (
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 text-text-secondary text-xs sm:text-sm">
            <span className="text-text-primary">
              <GraduationCap size={16} />
            </span>
            <span>Class of {graduationYear}</span>
          </div>
        )}
        
        {currentRole && (
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 text-text-secondary text-xs sm:text-sm">
            <span className="text-text-primary">
              <Briefcase size={16} />
            </span>
            <span>{currentRole}</span>
          </div>
        )}
        
        {location && (
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 text-text-secondary text-xs sm:text-sm">
            <span className="text-text-primary">
              <MapPin size={16} />
            </span>
            <span>{location}</span>
          </div>
        )}
        
        <div className="flex gap-3 sm:gap-5 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
          <div className="flex items-center gap-1">
            <span className="font-bold text-text-primary text-xs sm:text-sm">342</span>
            <span className="text-text-tertiary text-xs sm:text-sm">Following</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-text-primary text-xs sm:text-sm">1.2K</span>
            <span className="text-text-tertiary text-xs sm:text-sm">Followers</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
