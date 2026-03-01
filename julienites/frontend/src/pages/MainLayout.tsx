import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import ProfileCard from '../components/ProfileCard';
import AdCard from '../components/AdCard';
import Navigation from '../components/Navigation';
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

// Mock data for demonstration
const mockMembers = [
  {
    id: 1,
    name: 'Alex Johnson',
    username: 'alexj',
    graduationYear: 2022,
    currentRole: 'Software Engineer @ Google',
    location: 'San Francisco, CA',
    isOnline: true
  },
  {
    id: 2,
    name: 'Sarah Chen',
    username: 'sarahc',
    graduationYear: 2021,
    currentRole: 'Product Manager @ Meta',
    location: 'New York, NY',
    isOnline: false
  },
  {
    id: 3,
    name: 'Marcus Rodriguez',
    username: 'marcusr',
    graduationYear: 2023,
    currentRole: 'Data Scientist @ Amazon',
    location: 'Seattle, WA',
    isOnline: true
  },
  {
    id: 4,
    name: 'Priya Patel',
    username: 'priyap',
    graduationYear: 2020,
    currentRole: 'UX Designer @ Apple',
    location: 'Austin, TX',
    isOnline: false
  },
  {
    id: 5,
    name: 'David Kim',
    username: 'davidk',
    graduationYear: 2022,
    currentRole: 'DevOps Engineer @ Microsoft',
    location: 'Remote',
    isOnline: true
  },
  {
    id: 6,
    name: 'Emma Wilson',
    username: 'emmaw',
    graduationYear: 2021,
    currentRole: 'Frontend Developer @ Netflix',
    location: 'Los Angeles, CA',
    isOnline: false
  }
];

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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('Home');

  // Get initials from user name
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleNavigationClick = (itemName: string) => {
    setActiveNavItem(itemName);
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
          onClick={() => window.location.href = '/profile'}
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

    // Members section is shown for both Home and Julienties
    const membersSection = (
      <>
        {/* Members Section Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {activeNavItem === 'Julienties' ? 'Julienties Members' : 'Members'}
          </h2>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockMembers.map((member) => (
            <ProfileCard key={member.id} {...member} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center py-6">
          <button className="bg-background-secondary hover:bg-background-tertiary text-text-primary px-6 py-3 rounded-full font-bold border border-border transition-colors">
            Load More Members
          </button>
        </div>
      </>
    );

    // Mock posts from members (inlined for simplicity)
    const mockPosts = [
      {
        id: 1,
        author: 'Alex Johnson',
        username: 'alexj',
        role: 'Software Engineer @ Google',
        time: '2h ago',
        content: 'Just wrapped up an amazing project at Google! We built a new ML pipeline that reduces inference time by 40%. So proud of the team! #Tech #MachineLearning',
        likes: 42,
        comments: 8,
        shares: 3
      },
      {
        id: 2,
        author: 'Sarah Chen',
        username: 'sarahc',
        role: 'Product Manager @ Meta',
        time: '4h ago',
        content: 'Excited to share that our new feature at Meta just hit 1M daily active users in its first week! The team worked incredibly hard on this launch. #ProductManagement #Tech',
        likes: 89,
        comments: 12,
        shares: 5
      },
      {
        id: 3,
        author: 'Marcus Rodriguez',
        username: 'marcusr',
        role: 'Data Scientist @ Amazon',
        time: '6h ago',
        content: 'Just published a research paper on anomaly detection in time-series data. Would love to connect with others working in this space! #DataScience #Research',
        likes: 31,
        comments: 5,
        shares: 2
      },
      {
        id: 4,
        author: 'Priya Patel',
        username: 'priyap',
        role: 'UX Designer @ Apple',
        time: '1d ago',
        content: 'Designing for accessibility isn\'t just about compliance - it\'s about creating better experiences for everyone. Some insights from our latest project at Apple. #UXDesign #Accessibility',
        likes: 67,
        comments: 9,
        shares: 4
      },
      {
        id: 5,
        author: 'David Kim',
        username: 'davidk',
        role: 'DevOps Engineer @ Microsoft',
        time: '1d ago',
        content: 'Migrated our entire infrastructure to Kubernetes this quarter. The scalability improvements are incredible! #DevOps #Kubernetes #Cloud',
        likes: 53,
        comments: 7,
        shares: 3
      },
      {
        id: 6,
        author: 'Emma Wilson',
        username: 'emmaw',
        role: 'Frontend Developer @ Netflix',
        time: '2d ago',
        content: 'Just open-sourced a React component library we\'ve been using internally at Netflix. Check it out on GitHub! #OpenSource #React #Frontend',
        likes: 78,
        comments: 15,
        shares: 6
      }
    ];

    switch (activeNavItem) {
      case 'Julienties':
        return (
          <>
            {welcomeBanner}
            {membersSection}
          </>
        );
      case 'Home':
      default:
        // Posts section for Home
        const postsSection = (
          <>
            {/* Posts Section Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Latest Posts from Members</h2>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {mockPosts.map((post) => (
                <div key={post.id} className="bg-background-secondary rounded-2xl p-6 border border-border">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-twitter-blue flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {post.author.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{post.author}</span>
                        <span className="text-text-tertiary text-sm">@{post.username}</span>
                        <span className="text-text-tertiary text-sm">•</span>
                        <span className="text-text-tertiary text-sm">{post.time}</span>
                      </div>
                      <div className="text-text-tertiary text-sm">{post.role}</div>
                    </div>
                  </div>
                  <p className="text-text-primary mb-4">{post.content}</p>
                  <div className="flex items-center gap-6 text-text-tertiary">
                    <button className="flex items-center gap-2 hover:text-twitter-blue transition-colors">
                      <span>❤️</span>
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-twitter-blue transition-colors">
                      <span>💬</span>
                      <span>{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-twitter-blue transition-colors">
                      <span>↪️</span>
                      <span>{post.shares}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Posts */}
            <div className="text-center py-6">
              <button className="bg-background-secondary hover:bg-background-tertiary text-text-primary px-6 py-3 rounded-full font-bold border border-border transition-colors">
                Load More Posts
              </button>
            </div>
          </>
        );
        
        return (
          <>
            {welcomeBanner}
            {postsSection}
          </>
        );
    }
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
                            // Navigate to user profile
                            window.location.href = '/profile';
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
            <Navigation onItemClick={handleNavigationClick} />

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
