import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import ProfileCard from '../components/ProfileCard';
import AdCard from '../components/AdCard';
import Navigation from '../components/Navigation';
import { postApi, userApi } from '../services/api';
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

  // Derive active nav item from current URL path
  const activeNavItem = location.pathname === '/julienties' ? 'Julienties' : 'Home';

  useEffect(() => {
    if (activeNavItem !== 'Julienties') return;
    const token = localStorage.getItem('julienites-token');
    if (!token) return;

    const fetchMembers = async () => {
      setMembersLoading(true);
      const response = await userApi.getUsers(0, 100);
      if (response.data) {
        setMembers(response.data);
      }
      setMembersLoading(false);
    };

    fetchMembers();
  }, [activeNavItem]);

  useEffect(() => {
    if (activeNavItem !== 'Home') return;
    const token = localStorage.getItem('julienites-token');
    if (!token) return;

    const fetchFeed = async () => {
      setFeedLoading(true);
      const response = await postApi.getFeedPosts(token, 0, 100);
      if (response.data) {
        // Keep only the latest post per user, sorted by most recent activity
        const latestByUser = new Map<string, any>();
        for (const post of response.data) {
          const existing = latestByUser.get(post.user_id);
          if (!existing || new Date(post.created_at) > new Date(existing.created_at)) {
            latestByUser.set(post.user_id, post);
          }
        }
        const sorted = Array.from(latestByUser.values()).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setFeedPosts(sorted);
      }
      setFeedLoading(false);
    };

    fetchFeed();
  }, [activeNavItem]);

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
          <div className="text-text-tertiary text-center py-8">No members found.</div>
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
                profileImage={member.profile_image_url}
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
          {membersSection}
        </>
      );
    }

    // Home (default)
    return (
      <>
        {welcomeBanner}
        {/* Latest post per member */}
        {feedLoading ? (
          <div className="text-text-tertiary text-center py-8">Loading posts...</div>
        ) : feedPosts.length === 0 ? (
          <div className="text-text-tertiary text-center py-8">No posts yet. Be the first to post!</div>
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
                <div key={post.id} className="bg-background-secondary rounded-2xl p-6 border border-border">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-twitter-blue flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold">{author?.name || 'Unknown'}</span>
                        <span className="text-text-tertiary text-sm">@{author?.username || ''}</span>
                        <span className="text-text-tertiary text-sm">•</span>
                        <span className="text-text-tertiary text-sm">{timeAgo}</span>
                      </div>
                      {author?.current_role && (
                        <div className="text-text-tertiary text-sm">{author.current_role}</div>
                      )}
                    </div>
                  </div>
                  <p className="text-text-primary mb-4">{post.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-text-tertiary">
                      <span className="flex items-center gap-1">
                        <span>❤️</span>
                        <span>{post.likes_count}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span>💬</span>
                        <span>{post.comments_count}</span>
                      </span>
                    </div>
                    <button
                      onClick={() => navigate(`/profile/${post.user_id}?tab=Posts`)}
                      className="text-twitter-blue text-sm font-bold hover:underline"
                    >
                      View More
                    </button>
                  </div>
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
                    <div className="w-8 h-8 rounded-full bg-twitter-blue flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {getUserInitials(user.name)}
                      </span>
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

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <Navigation />

            {/* Trends/Who to follow */}
            <div className="bg-background-secondary rounded-2xl p-4 border border-border">
              <h2 className="font-bold text-lg mb-4">Trending at Julienites</h2>
              <div className="space-y-4">
                {['#TechCareers', '#AlumniMeetup', '#StartupFunding', '#RemoteWork'].map((trend) => (
                  <div key={trend} className="p-3 rounded-xl hover:bg-background-tertiary cursor-pointer transition-colors">
                    <div className="text-text-tertiary text-sm">Trending in Alumni</div>
                    <div className="font-bold">{trend}</div>
                    <div className="text-text-tertiary text-sm">245 posts</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {renderMainContent()}
          </div>

          {/* Right Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Search */}
            <div className="bg-background-secondary rounded-2xl p-4 border border-border">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Julienites..."
                  className="w-full bg-background-tertiary border border-border rounded-full py-3 px-4 pl-10 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-twitter-blue"
                />
                <span className="absolute left-3 top-3 text-text-tertiary">
                  <Search size={18} />
                </span>
              </div>
            </div>

            {/* Ad Cards */}
            <div className="space-y-4">
              {mockAds.map((ad, index) => (
                <AdCard key={index} {...ad} />
              ))}
            </div>

            {/* Upcoming Events */}
            <div className="bg-background-secondary rounded-2xl p-4 border border-border">
              <h2 className="font-bold text-lg mb-4">Upcoming Events</h2>
              <div className="space-y-3">
                {[
                  { title: 'Virtual Career Fair', date: 'Mar 15', attendees: '120+' },
                  { title: 'Alumni Mixer: NYC', date: 'Mar 22', attendees: '45+' },
                  { title: 'Tech Talk: AI Trends', date: 'Apr 5', attendees: '85+' }
                ].map((event, index) => (
                  <div key={index} className="p-3 rounded-xl hover:bg-background-tertiary cursor-pointer transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold">{event.title}</div>
                        <div className="text-text-tertiary text-sm">{event.attendees} attending</div>
                      </div>
                      <div className="bg-twitter-blue/20 text-twitter-blue px-2 py-1 rounded text-sm font-bold">
                        {event.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-twitter-blue hover:bg-twitter-blue/10 py-2 rounded-full font-bold transition-colors">
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
    </div>
  );
};

export default MainLayout;
