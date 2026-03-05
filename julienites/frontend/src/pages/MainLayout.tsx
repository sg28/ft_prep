import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import ProfileCard from '../components/ProfileCard';
import AdCard from '../components/AdCard';
import Navigation from '../components/Navigation';
import MobileBottomNav from '../components/MobileBottomNav';
import { postApi, userApi, POST_TAGS, PostTag } from '../services/api';
import {
  Moon,
  Sun,
  Search,
  Users,
  Flame,
  Calendar,
  User,
  Settings,
  LogOut
} from 'lucide-react';
import { getVersionDisplay, getCopyrightText } from '../config/version';

const TAG_STYLES: Record<string, string> = {
  'Questions':   'bg-blue-500/20 text-blue-400',
  'Celebration': 'bg-yellow-500/20 text-yellow-400',
  'Alert':       'bg-red-500/20 text-red-400',
  'Social':      'bg-green-500/20 text-green-400',
  'Post Truth':  'bg-purple-500/20 text-purple-400',
};


const mockAds = [
  {
    title: 'Join Our Alumni Network',
    description: 'Connect with fellow Julienites worldwide and unlock exclusive career opportunities.',
    ctaText: 'Learn More',
    sponsor: 'Julienites Alumni Association'
  },
  {
    title: 'Career Coaching Sessions',
    description: 'Book 1:1 sessions with industry experts from top tech companies.',
    ctaText: 'Book Now',
    sponsor: 'Julienites Career Services'
  }
];

const MainLayout: React.FC = () => {
  const { toggleTheme, isDark } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [feedPosts, setFeedPosts] = useState<any[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [activeTagFilter, setActiveTagFilter] = useState<PostTag | null>(null);
  const [activeDaysFilter, setActiveDaysFilter] = useState<number | null>(null);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [openCommentPostId, setOpenCommentPostId] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<Record<string, any[]>>({});
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  // Derive active nav item from current URL path
  const activeNavItem = location.pathname === '/julienties' ? 'Julienties' : 'Home';

  // Load all members on initial Julienties mount
  useEffect(() => {
    if (activeNavItem !== 'Julienties') return;
    const token = localStorage.getItem('julienites-token');
    if (!token) return;

    const fetchMembers = async () => {
      setMembersLoading(true);
      const response = await userApi.getUsers(0, 100);
      if (response.data) setMembers(response.data);
      setMembersLoading(false);
    };

    fetchMembers();
  }, [activeNavItem]);

  // Debounced API search when query changes
  useEffect(() => {
    if (activeNavItem !== 'Julienties') return;
    if (searchDebounce.current) clearTimeout(searchDebounce.current);

    if (!memberSearch.trim()) {
      // Re-fetch full list when search is cleared
      const token = localStorage.getItem('julienites-token');
      if (!token) return;
      setMembersLoading(true);
      userApi.getUsers(0, 100).then((res) => {
        if (res.data) setMembers(res.data);
        setMembersLoading(false);
      });
      return;
    }

    searchDebounce.current = setTimeout(async () => {
      setMembersLoading(true);
      const response = await userApi.searchUsers(memberSearch.trim());
      if (response.data) setMembers(response.data);
      setMembersLoading(false);
    }, 350);

    return () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
    };
  }, [memberSearch, activeNavItem]);

  useEffect(() => {
    if (activeNavItem !== 'Home') return;
    const token = localStorage.getItem('julienites-token');
    if (!token) return;

    const fetchFeed = async () => {
      setFeedLoading(true);
      const response = await postApi.getFeedPosts(token, 0, 100, activeTagFilter, activeDaysFilter);
      if (response.data) setFeedPosts(response.data);
      setFeedLoading(false);
    };

    fetchFeed();
  }, [activeNavItem, activeTagFilter, activeDaysFilter]);

  const toggleComments = async (postId: string) => {
    if (openCommentPostId === postId) {
      setOpenCommentPostId(null);
      return;
    }
    setOpenCommentPostId(postId);
    if (postComments[postId]) return; // already loaded

    const token = localStorage.getItem('julienites-token');
    if (!token) return;
    setCommentLoading((prev) => ({ ...prev, [postId]: true }));
    const response = await postApi.getPostComments(token, postId);
    if (response.data) setPostComments((prev) => ({ ...prev, [postId]: response.data as any[] }));
    setCommentLoading((prev) => ({ ...prev, [postId]: false }));
  };

  const submitComment = async (postId: string) => {
    const text = commentTexts[postId]?.trim();
    if (!text) return;
    const token = localStorage.getItem('julienites-token');
    if (!token) return;
    setSubmittingComment((prev) => ({ ...prev, [postId]: true }));
    const response = await postApi.createComment(token, postId, { content: text });
    if (response.data) {
      setPostComments((prev) => ({
        ...prev,
        [postId]: [response.data, ...(prev[postId] || [])],
      }));
      setCommentTexts((prev) => ({ ...prev, [postId]: '' }));
      // Increment comment count in feed
      setFeedPosts((prev) =>
        prev.map((p) => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p)
      );
    }
    setSubmittingComment((prev) => ({ ...prev, [postId]: false }));
  };

  // Get initials from user name
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };


  const renderMainContent = () => {
    // Welcome banner is shown for both Home and Julienties
    const welcomeBanner = (
      <div className="bg-gradient-to-r from-twitter-blue/20 to-twitter-pink/20 rounded-2xl p-6 border border-border">
        <h1 className="text-2xl font-bold mb-2">
          {user ? `Welcome back, ${user.name.split(' ')[0]}!` : 'Welcome to Julienites Network'}
        </h1>
        <p className="text-text-secondary mb-4">
          Connect with fellow alumni, discover career opportunities, and stay updated with community events.
        </p>
        <div className="flex gap-3">
                  <button
          onClick={() => window.location.href = `/profile/${user?.id}`}
          className="bg-twitter-blue text-white px-4 py-2 rounded-full font-bold hover:bg-twitter-blueHover transition-colors"
        >
          Complete Profile
        </button>
          <button className="bg-transparent border border-border text-text-primary px-4 py-2 rounded-full font-bold hover:bg-background-tertiary transition-colors">
            Explore Features
          </button>
        </div>
      </div>
    );

    // Members section is shown for Julienties
    const membersSection = (
      <>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Julienties Members</h2>
        </div>

        {membersLoading ? (
          <div className="text-text-tertiary text-center py-8">Loading members...</div>
        ) : members.length === 0 ? (
          <div className="text-text-tertiary text-center py-8">
            {memberSearch.trim() ? 'No members match your search.' : 'No members found.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => (
              <ProfileCard
                key={member.id}
                id={member.id}
                name={member.name}
                username={member.username}
                graduationYear={member.graduation_year}
                currentRole={member.current_role}
                location={member.location}
                profileImage={member.profile_image_url ? `http://localhost:8000${member.profile_image_url}` : undefined}
                followingCount={member.following_count ?? 0}
                followersCount={member.followers_count ?? 0}
              />
            ))}
          </div>
        )}
      </>
    );

    if (activeNavItem === 'Julienties') {
      return (
        <>
          {welcomeBanner}
          <div className="relative">
            <input
              type="text"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="Search members by name, role, location..."
              className="w-full bg-background-secondary border border-border rounded-full py-2 px-4 pl-9 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-twitter-blue text-sm"
            />
            <span className="absolute left-3 top-2.5 text-text-tertiary">
              <Search size={16} />
            </span>
          </div>
          {membersSection}
        </>
      );
    }

    // Home (default)
    const DAYS_OPTIONS = [
      { label: 'All time', value: null },
      { label: 'Today', value: 1 },
      { label: 'This week', value: 7 },
      { label: 'This month', value: 30 },
      { label: 'Last 3 months', value: 90 },
    ];

    return (
      <>
        {welcomeBanner}

        {/* Tag filter pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTagFilter(null)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
              activeTagFilter === null
                ? 'bg-twitter-blue text-white border-twitter-blue'
                : 'border-border text-text-tertiary hover:border-text-secondary'
            }`}
          >
            All
          </button>
          {POST_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTagFilter(activeTagFilter === tag ? null : tag)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                activeTagFilter === tag
                  ? TAG_STYLES[tag] + ' border-transparent'
                  : 'border-border text-text-tertiary hover:border-text-secondary'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Date range pills */}
        <div className="flex flex-wrap gap-2">
          {DAYS_OPTIONS.map(({ label, value }) => (
            <button
              key={label}
              onClick={() => setActiveDaysFilter(value)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                activeDaysFilter === value
                  ? 'bg-twitter-blue/20 text-twitter-blue border-twitter-blue/50'
                  : 'border-border text-text-tertiary hover:border-text-secondary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Feed posts */}
        {feedLoading ? (
          <div className="text-text-tertiary text-center py-8">Loading posts...</div>
        ) : feedPosts.length === 0 ? (
          <div className="text-text-tertiary text-center py-8">
            {activeTagFilter ? `No ${activeTagFilter} posts yet.` : 'No posts yet. Be the first to post!'}
          </div>
        ) : (
          <div className="space-y-4">
            {feedPosts.map((post) => {
              const author = post.user;
              const initials = author?.name
                ? author.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
                : '?';
              const postDate = new Date(post.created_at);
              const now = new Date();
              const diffMs = now.getTime() - postDate.getTime();
              const diffMins = Math.floor(diffMs / 60000);
              const diffHours = Math.floor(diffMins / 60);
              const diffDays = Math.floor(diffHours / 24);
              const timeAgo = diffMins < 1 ? 'just now'
                : diffMins < 60 ? `${diffMins}m ago`
                : diffHours < 24 ? `${diffHours}h ago`
                : diffDays < 7 ? `${diffDays}d ago`
                : postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

              return (
                <div key={post.id} className="bg-background-secondary rounded-2xl p-4 border border-border">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-twitter-blue flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {post.is_anonymous ? (
                        <span className="text-white font-bold text-sm">?</span>
                      ) : author?.profile_image_url ? (
                        <img src={`http://localhost:8000${author.profile_image_url}`} alt={author.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-sm">{initials}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold">{post.is_anonymous ? 'Anonymous' : (author?.name || 'Unknown')}</span>
                        {!post.is_anonymous && <span className="text-text-tertiary text-sm">@{author?.username || ''}</span>}
                        <span className="text-text-tertiary text-sm">•</span>
                        <span className="text-text-tertiary text-sm">{timeAgo}</span>
                      </div>
                      {!post.is_anonymous && author?.current_role && (
                        <div className="text-text-tertiary text-sm">{author.current_role}</div>
                      )}
                    </div>
                  </div>
                  {post.tag && (
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-2 ${TAG_STYLES[post.tag] || 'bg-border text-text-tertiary'}`}>
                      {post.tag}
                    </span>
                  )}
                  <p className="text-text-primary mb-3 text-sm">{post.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-text-tertiary">
                      <span className="flex items-center gap-1">
                        <span>❤️</span>
                        <span>{post.likes_count}</span>
                      </span>
                      <button
                        onClick={() => toggleComments(post.id)}
                        className={`flex items-center gap-1 hover:text-twitter-blue transition-colors ${openCommentPostId === post.id ? 'text-twitter-blue' : ''}`}
                      >
                        <span>💬</span>
                        <span>{post.comments_count}</span>
                      </button>
                    </div>
                    <button
                      onClick={() => navigate(`/profile/${post.user_id}?tab=Posts`)}
                      className="text-twitter-blue text-sm font-bold hover:underline"
                    >
                      View More
                    </button>
                  </div>

                  {/* Comment section */}
                  {openCommentPostId === post.id && (
                    <div className="mt-3 border-t border-border pt-3 space-y-3">
                      {/* Comment input */}
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-full bg-twitter-blue flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {user?.profileImage ? (
                            <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-bold text-xs">{user ? getUserInitials(user.name) : '?'}</span>
                          )}
                        </div>
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={commentTexts[post.id] || ''}
                            onChange={(e) => setCommentTexts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && submitComment(post.id)}
                            placeholder="Write a comment..."
                            className="flex-1 bg-background-tertiary border border-border rounded-full px-3 py-1 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-twitter-blue"
                          />
                          <button
                            onClick={() => submitComment(post.id)}
                            disabled={submittingComment[post.id] || !commentTexts[post.id]?.trim()}
                            className="bg-twitter-blue text-white px-3 py-1 rounded-full text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-twitter-blueHover transition-colors"
                          >
                            {submittingComment[post.id] ? '...' : 'Post'}
                          </button>
                        </div>
                      </div>

                      {/* Comments list */}
                      {commentLoading[post.id] ? (
                        <div className="text-text-tertiary text-xs text-center py-2">Loading comments...</div>
                      ) : (postComments[post.id] || []).length === 0 ? (
                        <div className="text-text-tertiary text-xs text-center py-2">No comments yet. Be the first!</div>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {(postComments[post.id] || []).map((comment: any) => {
                            const commenterInitials = comment.user?.name
                              ? comment.user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
                              : '?';
                            const commentDate = new Date(comment.created_at);
                            const diffMs = Date.now() - commentDate.getTime();
                            const diffMins = Math.floor(diffMs / 60000);
                            const diffHours = Math.floor(diffMins / 60);
                            const commentTime = diffMins < 1 ? 'just now'
                              : diffMins < 60 ? `${diffMins}m ago`
                              : diffHours < 24 ? `${diffHours}h ago`
                              : commentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                            return (
                              <div key={comment.id} className="flex items-start gap-2">
                                <div className="w-6 h-6 rounded-full bg-twitter-blue flex items-center justify-center flex-shrink-0 overflow-hidden">
                                  {comment.user?.profile_image_url ? (
                                    <img src={`http://localhost:8000${comment.user.profile_image_url}`} alt={comment.user.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-white font-bold text-xs">{commenterInitials}</span>
                                  )}
                                </div>
                                <div className="flex-1 bg-background-tertiary rounded-xl px-3 py-2">
                                  <div className="flex items-center gap-1 mb-0.5">
                                    <span className="font-bold text-xs">{comment.user?.name || 'Unknown'}</span>
                                    <span className="text-text-tertiary text-xs">·</span>
                                    <span className="text-text-tertiary text-xs">{commentTime}</span>
                                  </div>
                                  <p className="text-text-primary text-xs">{comment.content}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background-primary text-text-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background-primary/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-twitter-blue to-twitter-pink"></div>
              <h1 className="text-xl font-bold">Julienites</h1>
              <span className="text-xs bg-twitter-blue/20 text-twitter-blue px-2 py-1 rounded-full">
                {getVersionDisplay()}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-background-secondary transition-colors"
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              >
                {isDark ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-background-secondary transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-twitter-blue flex items-center justify-center overflow-hidden">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-sm">{getUserInitials(user.name)}</span>
                      )}
                    </div>
                    <span className="font-medium text-sm hidden md:inline">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-background-secondary rounded-xl border border-border shadow-lg z-50">
                      <div className="p-4 border-b border-border">
                        <div className="font-bold">{user.name}</div>
                        <div className="text-text-tertiary text-sm">@{user.username}</div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            window.location.href = `/profile/${user?.id}`;
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-2 text-left px-4 py-2 rounded-lg hover:bg-background-tertiary transition-colors"
                        >
                          <User size={16} />
                          My Profile
                        </button>
                        <button
                          onClick={() => {
                            // Navigate to settings
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-2 text-left px-4 py-2 rounded-lg hover:bg-background-tertiary transition-colors"
                        >
                          <Settings size={16} />
                          Settings
                        </button>
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-2 text-left px-4 py-2 rounded-lg hover:bg-background-tertiary text-red-500 transition-colors"
                        >
                          <LogOut size={16} />
                          Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="bg-twitter-blue text-white px-4 py-2 rounded-full font-bold hover:bg-twitter-blueHover transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-3 pb-safe">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {/* Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 space-y-3">
            <Navigation />

            {/* Trends/Who to follow */}
            <div className="bg-background-secondary rounded-2xl p-3 border border-border">
              <h2 className="font-bold text-sm mb-2">Trending at Julienites</h2>
              <div className="space-y-1">
                {['#TechCareers', '#AlumniMeetup', '#StartupFunding', '#RemoteWork'].map((trend) => (
                  <div key={trend} className="px-2 py-1.5 rounded-lg hover:bg-background-tertiary cursor-pointer transition-colors">
                    <div className="text-text-tertiary text-xs">Trending in Alumni</div>
                    <div className="font-bold text-sm">{trend}</div>
                    <div className="text-text-tertiary text-xs">245 posts</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="col-span-full lg:col-span-2 space-y-3">
            {renderMainContent()}
          </div>

          {/* Right Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 space-y-3">
            {/* Ad Cards */}
            <div className="space-y-3">
              {mockAds.map((ad, index) => (
                <AdCard key={index} {...ad} />
              ))}
            </div>

            {/* Upcoming Events */}
            <div className="bg-background-secondary rounded-2xl p-3 border border-border">
              <h2 className="font-bold text-sm mb-2">Upcoming Events</h2>
              <div className="space-y-1">
                {[
                  { title: 'Virtual Career Fair', date: 'Mar 15', attendees: '120+' },
                  { title: 'Alumni Mixer: NYC', date: 'Mar 22', attendees: '45+' },
                  { title: 'Tech Talk: AI Trends', date: 'Apr 5', attendees: '85+' }
                ].map((event, index) => (
                  <div key={index} className="px-2 py-1.5 rounded-lg hover:bg-background-tertiary cursor-pointer transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-sm">{event.title}</div>
                        <div className="text-text-tertiary text-xs">{event.attendees} attending</div>
                      </div>
                      <div className="bg-twitter-blue/20 text-twitter-blue px-2 py-0.5 rounded text-xs font-bold">
                        {event.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-2 text-twitter-blue hover:bg-twitter-blue/10 py-1.5 rounded-full font-bold transition-colors text-sm">
                Show more
              </button>
            </div>

            {/* Footer Links */}
            <div className="text-text-tertiary text-sm space-y-2">
              <div className="flex flex-wrap gap-2">
                {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Accessibility', 'Ads info'].map((link) => (
                  <button key={link} className="hover:text-twitter-blue transition-colors">
                    {link}
                  </button>
                ))}
              </div>
              <div>{getCopyrightText()}</div>
            </div>
          </aside>
        </div>
      </main>
      
      {/* Close user menu when clicking outside */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};

export default MainLayout;
