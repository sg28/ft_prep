import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userApi, postApi, POST_TAGS, PostTag } from '../services/api';
import {
  GraduationCap,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Github,
  Twitter,
  MessageCircle,
  ArrowLeft,
  Edit,
  Save,
  X
} from 'lucide-react';
import { getVersionDisplay } from '../config/version';
import LikeButton from '../components/LikeButton';

const TAG_STYLES: Record<string, { active: string; badge: string }> = {
  'Questions':   { active: 'bg-blue-500/20 border-blue-500 text-blue-400',   badge: 'bg-blue-500/20 text-blue-400' },
  'Celebration': { active: 'bg-yellow-500/20 border-yellow-500 text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-400' },
  'Alert':       { active: 'bg-red-500/20 border-red-500 text-red-400',       badge: 'bg-red-500/20 text-red-400' },
  'Social':      { active: 'bg-green-500/20 border-green-500 text-green-400', badge: 'bg-green-500/20 text-green-400' },
  'Post Truth':  { active: 'bg-purple-500/20 border-purple-500 text-purple-400', badge: 'bg-purple-500/20 text-purple-400' },
};

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const initialTab = new URLSearchParams(location.search).get('tab') || 'About';

  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTag, setNewPostTag] = useState<PostTag | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const isOwnProfile = authUser?.id === id;

  useEffect(() => {
    if (!id || activeTab !== 'Posts') return;
    const token = localStorage.getItem('julienites-token');
    if (!token) return;

    const fetchPosts = async () => {
      setPostsLoading(true);
      const response = await postApi.getUserPosts(token, id);
      if (response.data) {
        setPosts(response.data);
      }
      setPostsLoading(false);
    };

    fetchPosts();
  }, [id, activeTab]);

  useEffect(() => {
    if (!id) return;

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      const response = await userApi.getProfile(id);
      if (response.data) {
        const data = response.data;
        const mapped = {
          id: data.id,
          name: data.name,
          email: data.email,
          username: data.username,
          graduationYear: data.graduation_year,
          bio: data.bio,
          location: data.location,
          currentRole: data.current_role,
          profileImage: data.profile_image_url ? `http://localhost:8000${data.profile_image_url}` : null,
          phone: data.phone,
          linkedin: data.linkedin_url,
          github: data.github_url,
          twitter: data.twitter_handle,
          followingCount: data.following_count ?? 0,
          followersCount: data.followers_count ?? 0,
        };
        setProfileData(mapped);
        setEditedUser(mapped);
      } else {
        setError(response.error || 'Failed to load profile');
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    const payload = {
      name: editedUser.name,
      bio: editedUser.bio,
      location: editedUser.location,
      current_role: editedUser.currentRole,
      graduation_year: editedUser.graduationYear ? Number(editedUser.graduationYear) : undefined,
      phone: editedUser.phone,
      linkedin_url: editedUser.linkedin,
      github_url: editedUser.github,
      twitter_handle: editedUser.twitter,
    };
    const response = await userApi.updateProfile(id, payload);
    if (response.data) {
      setProfileData(editedUser);
      setIsEditing(false);
    } else {
      console.error('Failed to save profile:', response.error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    const localPreviewUrl = URL.createObjectURL(file);
    setProfileData((prev: any) => ({ ...prev, profileImage: localPreviewUrl }));
    setEditedUser((prev: any) => ({ ...prev, profileImage: localPreviewUrl }));

    setIsUploadingAvatar(true);
    setAvatarError(null);
    const response = await userApi.uploadAvatar(id, file);
    setIsUploadingAvatar(false);

    if (response.data?.profile_image_url) {
      const serverUrl = `http://localhost:8000${response.data.profile_image_url}`;
      setProfileData((prev: any) => ({ ...prev, profileImage: serverUrl }));
      setEditedUser((prev: any) => ({ ...prev, profileImage: serverUrl }));
    } else {
      setAvatarError(response.error || 'Failed to upload image');
      setProfileData((prev: any) => ({ ...prev, profileImage: profileData?.profileImage }));
      setEditedUser((prev: any) => ({ ...prev, profileImage: profileData?.profileImage }));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCancel = () => {
    setEditedUser(profileData);
    setIsEditing(false);
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !newPostTag) return;
    const token = localStorage.getItem('julienites-token');
    if (!token) return;
    setIsSubmittingPost(true);
    const response = await postApi.createPost(token, {
      content: newPostContent.trim(),
      tag: newPostTag,
      is_anonymous: isAnonymous,
    });
    if (response.data) {
      setPosts((prev) => [response.data!, ...prev]);
      setNewPostContent('');
      setNewPostTag(null);
      setIsAnonymous(false);
    }
    setIsSubmittingPost(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedUser((prev: any) => ({ ...prev, [field]: value }));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-text-primary">Loading profile...</div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-text-primary">{error || 'Profile not found'}</div>
      </div>
    );
  }

  const currentUser = isEditing ? editedUser : profileData;
  const initials = getInitials(currentUser.name);

  return (
    <div className="min-h-screen bg-background-primary text-text-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background-primary/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-[1265px] mx-auto px-4">
          <div className="h-[53px] flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-background-tertiary transition-colors flex items-center gap-2"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <div className="flex items-center gap-2 cursor-pointer">
              <span className="text-xl font-bold">Julienites</span>
              <span className="text-xs bg-twitter-blue/20 text-twitter-blue px-2 py-1 rounded-md">
                {getVersionDisplay()}
              </span>
            </div>
            <div className="w-10"></div>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <div className="max-w-[1265px] mx-auto px-4 py-3">
        <div className="bg-background-secondary rounded-2xl border border-border p-4">
          {/* Profile Header with Edit Button */}
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold">{isOwnProfile ? 'My Profile' : profileData.name}</h1>
            {isOwnProfile && (
              !isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-twitter-blue text-white rounded-lg font-bold hover:bg-twitter-blueHover transition-colors flex items-center gap-2"
                >
                  <Edit size={18} />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-success-color text-white rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-background-tertiary text-text-primary rounded-lg font-bold hover:bg-border transition-colors flex items-center gap-2"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              )
            )}
          </div>

          {/* Profile Header */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-shrink-0">
              <div className="relative w-32 h-32 md:w-40 md:h-40">
                {currentUser.profileImage ? (
                  <img
                    src={currentUser.profileImage}
                    alt={`${currentUser.name}'s profile`}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-twitter-blue flex items-center justify-center">
                    <span className="text-white font-bold text-4xl md:text-5xl">
                      {initials}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-success-color rounded-full border-4 border-background-secondary"></div>
                {isUploadingAvatar && (
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xs">Uploading...</span>
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

              {isEditing && (
                <div className="mt-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="text-sm text-twitter-blue hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploadingAvatar ? 'Uploading...' : 'Change Profile Picture'}
                  </button>
                  {avatarError && <p className="text-xs text-red-400 mt-1">{avatarError}</p>}
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="mb-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editedUser.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-twitter-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Username</label>
                      <input
                        type="text"
                        value={editedUser.username || ''}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-twitter-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Bio</label>
                      <textarea
                        value={editedUser.bio || ''}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={3}
                        className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-twitter-blue resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold mb-2">{currentUser.name}</h1>
                    <p className="text-text-tertiary text-lg mb-1">@{currentUser.username}</p>
                    <p className="text-text-primary text-lg mt-4">{currentUser.bio}</p>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Location</label>
                      <input
                        type="text"
                        value={editedUser.location || ''}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-twitter-blue"
                        placeholder="City, State"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Current Role</label>
                      <input
                        type="text"
                        value={editedUser.currentRole || ''}
                        onChange={(e) => handleInputChange('currentRole', e.target.value)}
                        className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-twitter-blue"
                        placeholder="Job Title @ Company"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Graduation Year</label>
                      <input
                        type="number"
                        value={editedUser.graduationYear || ''}
                        onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                        className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-twitter-blue"
                        placeholder="2020"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {currentUser.location && (
                      <div className="flex items-center gap-2 text-text-secondary">
                        <MapPin size={18} />
                        <span>{currentUser.location}</span>
                      </div>
                    )}
                    {currentUser.currentRole && (
                      <div className="flex items-center gap-2 text-text-secondary">
                        <Briefcase size={18} />
                        <span>{currentUser.currentRole}</span>
                      </div>
                    )}
                    {currentUser.graduationYear && (
                      <div className="flex items-center gap-2 text-text-secondary">
                        <GraduationCap size={18} />
                        <span>Class of {currentUser.graduationYear}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex gap-8">
                <div>
                  <span className="font-bold text-xl">{currentUser.followingCount || 0}</span>
                  <span className="text-text-tertiary ml-2">Following</span>
                </div>
                <div>
                  <span className="font-bold text-xl">{currentUser.followersCount || 0}</span>
                  <span className="text-text-tertiary ml-2">Followers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border mb-4">
            <div className="flex gap-8">
              {['About', 'Posts', 'Media', 'Connections'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 font-medium transition-colors border-b-2 ${
                    activeTab === tab
                      ? 'text-text-primary border-twitter-blue'
                      : 'text-text-tertiary border-transparent hover:text-text-primary hover:border-twitter-blue'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'About' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-xl font-bold mb-3">Contact Information</h3>
                    <div className="space-y-3">
                      {isEditing ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                            <input
                              type="email"
                              value={editedUser.email || ''}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-twitter-blue"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Phone</label>
                            <input
                              type="tel"
                              value={editedUser.phone || ''}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-twitter-blue"
                              placeholder="+1 (555) 123-4567"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">LinkedIn</label>
                            <input
                              type="text"
                              value={editedUser.linkedin || ''}
                              onChange={(e) => handleInputChange('linkedin', e.target.value)}
                              className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-twitter-blue"
                              placeholder="linkedin.com/in/username"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">GitHub</label>
                            <input
                              type="text"
                              value={editedUser.github || ''}
                              onChange={(e) => handleInputChange('github', e.target.value)}
                              className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-twitter-blue"
                              placeholder="github.com/username"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Twitter</label>
                            <input
                              type="text"
                              value={editedUser.twitter || ''}
                              onChange={(e) => handleInputChange('twitter', e.target.value)}
                              className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-twitter-blue"
                              placeholder="@username"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <Mail size={18} />
                            <span>{currentUser.email}</span>
                          </div>
                          {currentUser.phone && (
                            <div className="flex items-center gap-3">
                              <Phone size={18} />
                              <span>{currentUser.phone}</span>
                            </div>
                          )}
                          {currentUser.linkedin && (
                            <div className="flex items-center gap-3">
                              <Linkedin size={18} />
                              <a href={`https://${currentUser.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-twitter-blue hover:underline">
                                LinkedIn Profile
                              </a>
                            </div>
                          )}
                          {currentUser.github && (
                            <div className="flex items-center gap-3">
                              <Github size={18} />
                              <a href={`https://${currentUser.github}`} target="_blank" rel="noopener noreferrer" className="text-twitter-blue hover:underline">
                                GitHub Profile
                              </a>
                            </div>
                          )}
                          {currentUser.twitter && (
                            <div className="flex items-center gap-3">
                              <Twitter size={18} />
                              <a href={`https://twitter.com/${currentUser.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-twitter-blue hover:underline">
                                {currentUser.twitter}
                              </a>
                            </div>
                          )}
                          {isOwnProfile && !currentUser.phone && !currentUser.linkedin && !currentUser.github && !currentUser.twitter && (
                            <p className="text-text-tertiary text-sm">Click "Edit Profile" to add more contact details.</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Posts' && (
              <div>
                <h2 className="text-lg font-bold mb-3">{isOwnProfile ? 'My Posts' : `${profileData.name}'s Posts`}</h2>
                {isOwnProfile && (
                  <div className="border border-border rounded-xl p-3 mb-3">
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="What's on your mind?"
                      rows={2}
                      className="w-full bg-transparent text-text-primary placeholder-text-tertiary resize-none focus:outline-none text-sm"
                    />
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {POST_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setNewPostTag(newPostTag === tag ? null : tag)}
                          className={`px-3 py-1 rounded-md text-xs font-semibold border transition-colors ${
                            newPostTag === tag
                              ? TAG_STYLES[tag].active
                              : 'border-border text-text-tertiary hover:border-text-secondary'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                      <label className="flex items-center gap-1.5 ml-1 cursor-pointer select-none text-xs text-text-tertiary">
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="w-3.5 h-3.5 accent-twitter-blue"
                        />
                        Anonymous
                      </label>
                      <button
                        onClick={handleCreatePost}
                        disabled={!newPostContent.trim() || !newPostTag || isSubmittingPost}
                        className="ml-auto px-4 py-1 bg-twitter-blue text-white rounded-lg font-bold hover:bg-twitter-blueHover transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                      >
                        {isSubmittingPost ? 'Posting...' : 'Post'}
                      </button>
                    </div>
                    {!newPostTag && newPostContent.trim() && (
                      <p className="text-xs text-red-400 mt-1">Please select a tag to post.</p>
                    )}
                  </div>
                )}
                {postsLoading ? (
                  <p className="text-text-tertiary">Loading posts...</p>
                ) : posts.length === 0 ? (
                  <p className="text-text-tertiary">No posts yet.</p>
                ) : (
                  <div className="space-y-2">
                    {posts.map((post) => (
                      <div key={post.id} className="border border-border rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          {post.tag && (
                            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${TAG_STYLES[post.tag]?.badge || 'bg-border text-text-tertiary'}`}>
                              {post.tag}
                            </span>
                          )}
                          {post.is_anonymous && (
                            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-background-tertiary text-text-tertiary border border-border">
                              Anonymous
                            </span>
                          )}
                        </div>
                        <p className="text-text-primary whitespace-pre-wrap text-sm">{post.content}</p>
                        <div className="flex items-center gap-4 mt-2 text-text-tertiary text-xs">
                          <LikeButton postId={post.id} initialCount={post.likes_count ?? 0} initiallyLiked={!!post.liked_by_me} size="sm" />
                          <span className="flex items-center gap-1">
                            <MessageCircle size={16} />
                            {post.comments_count ?? 0}
                          </span>
                          <span className="ml-auto">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Media' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Media</h2>
                <p className="text-text-tertiary">No media uploaded yet.</p>
              </div>
            )}

            {activeTab === 'Connections' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Connections</h2>
                <p className="text-text-tertiary">No connections to display yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
