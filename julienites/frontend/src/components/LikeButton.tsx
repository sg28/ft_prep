import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { postApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';

interface LikeButtonProps {
  postId: string;
  initialCount: number;
  initiallyLiked?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 16,
  md: 18,
  lg: 20,
} as const;

const LikeButton: React.FC<LikeButtonProps> = ({
  postId,
  initialCount,
  initiallyLiked = false,
  size = 'sm',
  className = '',
}) => {
  const [liked, setLiked] = useState<boolean>(initiallyLiked);
  const [count, setCount] = useState<number>(initialCount || 0);
  const [loading, setLoading] = useState<boolean>(false);
  const { error } = useToast();

  const onToggle = async () => {
    if (loading) return;
    const token = localStorage.getItem('julienites-token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    // Optimistic update
    const prevLiked = liked;
    const prevCount = count;
    setLiked(!prevLiked);
    setCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    const apiCall = prevLiked ? postApi.unlikePost : postApi.likePost;
    const res = await apiCall(token, postId);
    if (!res || res.status < 200 || res.status >= 300) {
      // Revert on failure
      setLiked(prevLiked);
      setCount(prevCount);
      error(res?.error || 'Failed to update like');
    } else if (res.data) {
      // Sync with server counts/state if provided
      if (typeof (res.data as any).likes_count === 'number') {
        setCount((res.data as any).likes_count);
      }
      if (typeof (res.data as any).liked_by_me === 'boolean') {
        setLiked((res.data as any).liked_by_me);
      }
    }
    setLoading(false);
  };

  const sizePx = sizeMap[size];

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={loading}
      aria-pressed={liked}
      aria-label={liked ? 'Unlike' : 'Like'}
      title={liked ? 'Unlike' : 'Like'}
      className={`flex items-center gap-1 transition-colors ${liked ? 'text-red-500' : 'text-text-tertiary hover:text-red-500'} disabled:opacity-50 ${className}`}
    >
      <Heart
        size={sizePx}
        fill={liked ? 'currentColor' : 'none'}
      />
      <span className="text-xs sm:text-sm">{count}</span>
    </button>
  );
};

export default LikeButton;
