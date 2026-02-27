import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import ProfileCard from '../components/ProfileCard';
import AdCard from '../components/AdCard';

// Mock data for demonstration
const mockMembers = [
  {
    id: 1,
    name: 'Alex Johnson',
    username: 'alexj',
    graduationYear: 2022,
    currentRole: 'Software Engineer @ Google',
    location: 'San Francisco, CA',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    isOnline: true
  },
  {
    id: 2,
    name: 'Sarah Chen',
    username: 'sarahc',
    graduationYear: 2021,
    currentRole: 'Product Manager @ Meta',
    location: 'New York, NY',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    isOnline: false
  },
  {
    id: 3,
    name: 'Marcus Rodriguez',
    username: 'marcusr',
    graduationYear: 2023,
    currentRole: 'Data Scientist @ Amazon',
    location: 'Seattle, WA',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    isOnline: true
  },
  {
    id: 4,
    name: 'Priya Patel',
    username: 'priyap',
    graduationYear: 2020,
    currentRole: 'UX Designer @ Apple',
    location: 'Austin, TX',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    isOnline: false
  },
  {
    id: 5,
    name: 'David Kim',
    username: 'davidk',
    graduationYear: 2022,
    currentRole: 'DevOps Engineer @ Microsoft',
    location: 'Remote',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    isOnline: true
  },
  {
    id: 6,
    name: 'Emma Wilson',
    username: 'emmaw',
    graduationYear: 2021,
    currentRole: 'Frontend Developer @ Netflix',
    location: 'Los Angeles, CA',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    isOnline: false
  }
];

const mockAds = [
  {
    title: 'Join Our Alumni Network',
    description: 'Connect with fellow Julienites worldwide and unlock exclusive career opportunities.',
    ctaText: 'Learn More',
    sponsor: 'Julienites Alumni Association',
    imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop'
  },
  {
    title: 'Career Coaching Sessions',
    description: 'Book 1:1 sessions with industry experts from top tech companies.',
    ctaText: 'Book Now',
    sponsor: 'Julienites Career Services'
  }
];

const MainLayout: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'members' | 'trending' | 'events'>('members');

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
                Alumni Network
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-background-secondary transition-colors"
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              >
                {isDark ? '🌙' : '☀️'}
              </button>
              
              <button className="bg-twitter-blue text-white px-4 py-2 rounded-full font-bold hover:bg-twitter-blueHover transition-colors">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-background-secondary rounded-2xl p-4 border border-border">
              <h2 className="font-bold text-lg mb-4">Navigation</h2>
              <nav className="space-y-2">
                {[
                  { name: 'Home', icon: '🏠' },
                  { name: 'Explore', icon: '🔍' },
                  { name: 'Notifications', icon: '🔔' },
                  { name: 'Messages', icon: '✉️' },
                  { name: 'Bookmarks', icon: '📌' },
                  { name: 'Lists', icon: '📋' },
                  { name: 'Profile', icon: '👤' }
                ].map((item) => (
                  <button
                    key={item.name}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-background-tertiary w-full text-left transition-colors"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </button>
                ))}
              </nav>
            </div>

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
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-twitter-blue/20 to-twitter-pink/20 rounded-2xl p-6 border border-border">
              <h1 className="text-2xl font-bold mb-2">Welcome to Julienites Network</h1>
              <p className="text-text-secondary mb-4">
                Connect with fellow alumni, discover career opportunities, and stay updated with community events.
              </p>
              <div className="flex gap-3">
                <button className="bg-twitter-blue text-white px-4 py-2 rounded-full font-bold hover:bg-twitter-blueHover transition-colors">
                  Complete Profile
                </button>
                <button className="bg-transparent border border-border text-text-primary px-4 py-2 rounded-full font-bold hover:bg-background-tertiary transition-colors">
                  Explore Features
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-border">
              <div className="flex">
                {[
                  { id: 'members', label: 'Members', icon: '👥' },
                  { id: 'trending', label: 'Trending', icon: '🔥' },
                  { id: 'events', label: 'Events', icon: '📅' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-twitter-blue text-twitter-blue'
                        : 'border-transparent text-text-tertiary hover:text-text-primary'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
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
                <span className="absolute left-3 top-3 text-text-tertiary">🔍</span>
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
              <div>© 2024 Julienites Alumni Network</div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
