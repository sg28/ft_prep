import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Briefcase, MapPin, User } from 'lucide-react';
import { connectionApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface ProfileCardProps {
  id: string;
  name: string;
  graduationYear?: number;
  currentRole?: string;
  location?: string;
  profileImage?: string;
  isOnline?: boolean;
  username?: string;
  followingCount?: number;
  followersCount?: number;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  id,
  name,
  graduationYear,
  currentRole,
  location,
  profileImage,
  isOnline = false,
  username,
  followingCount = 0,
  followersCount: initialFollowersCount = 0,
}) => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [loadingFollow, setLoadingFollow] = useState(false);

  const isOwnCard = authUser?.id === id;

  useEffect(() => {
    if (isOwnCard || !authUser) return;
    connectionApi.getStatus(id).then((res) => {
      if (res.data) setIsFollowing(res.data.is_following);
    });
  }, [id, isOwnCard, authUser]);

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loadingFollow || isOwnCard) return;
    setLoadingFollow(true);
    if (isFollowing) {
      const res = await connectionApi.unfollow(id);
      if (res.status === 200) {
        setIsFollowing(false);
        setFollowersCount((c) => Math.max(0, c - 1));
      }
    } else {
      const res = await connectionApi.follow(id);
      if (res.status === 200) {
        setIsFollowing(true);
        setFollowersCount((c) => c + 1);
      }
    }
    setLoadingFollow(false);
  };

  const handleClick = () => navigate(`/member/${id}`);

  const getInitials = (name: string) =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-twitter-blue', 'bg-twitter-pink', 'bg-twitter-green',
      'bg-purple-600', 'bg-amber-600', 'bg-cyan-600', 'bg-rose-600', 'bg-emerald-600',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(name);
  const avatarColor = getAvatarColor(name);

  return (
    <div
      className="bg-background-secondary rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-border transition-colors hover:bg-background-tertiary/50 cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="relative w-14 h-14 sm:w-17 sm:h-17">
          {!profileImage ? (
            <div className={`w-full h-full rounded-full border-4 border-background-secondary ${avatarColor} flex items-center justify-center`}>
              <User className="text-white" size={24} />
            </div>
          ) : (
            <img
              src={profileImage}
              alt={`${name}'s profile`}
              className="w-full h-full rounded-full object-cover border-4 border-background-secondary"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.className = `w-full h-full rounded-full border-4 border-background-secondary ${avatarColor} flex items-center justify-center`;
                  fallback.innerHTML = `<span class="text-white font-bold text-sm">${initials}</span>`;
                  parent.appendChild(fallback);
                }
              }}
            />
          )}
          {isOnline && (
            <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-success-color rounded-full border-2 border-background-secondary"></div>
          )}
        </div>

        {!isOwnCard && authUser && (
          <button
            className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
              isFollowing
                ? 'border-border text-text-tertiary hover:border-red-400 hover:text-red-400'
                : 'border-twitter-blue text-twitter-blue hover:bg-twitter-blue hover:text-white'
            } disabled:opacity-50`}
            onClick={handleFollow}
            disabled={loadingFollow}
          >
            {loadingFollow ? '...' : isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
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
            <span className="text-text-primary"><GraduationCap size={16} /></span>
            <span>Class of {graduationYear}</span>
          </div>
        )}

        {currentRole && (
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 text-text-secondary text-xs sm:text-sm">
            <span className="text-text-primary"><Briefcase size={16} /></span>
            <span>{currentRole}</span>
          </div>
        )}

        {location && (
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 text-text-secondary text-xs sm:text-sm">
            <span className="text-text-primary"><MapPin size={16} /></span>
            <span>{location}</span>
          </div>
        )}

        <div className="flex gap-3 sm:gap-5 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
          <div className="flex items-center gap-1">
            <span className="font-bold text-text-primary text-xs sm:text-sm">{followingCount}</span>
            <span className="text-text-tertiary text-xs sm:text-sm">Following</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-text-primary text-xs sm:text-sm">{followersCount}</span>
            <span className="text-text-tertiary text-xs sm:text-sm">Followers</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
