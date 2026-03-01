import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Repeat, 
  Heart,
  ArrowLeft
} from 'lucide-react';
import { getVersionDisplay } from '../config/version';

const MemberProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Mock member data - in a real app, this would come from an API
  const mockMembers = [
    {
      id: 1,
      name: 'Alex Johnson',
      graduationYear: 2015,
      currentRole: 'Software Engineer',
      location: 'San Francisco, CA',
      isOnline: true,
      username: 'alexj',
      bio: 'Passionate software engineer with 8+ years of experience. Love building scalable applications and mentoring junior developers.',
      email: 'alex.johnson@example.com',
      phone: '+1 (555) 123-4567',
      linkedin: 'linkedin.com/in/alexjohnson',
      github: 'github.com/alexj',
      twitter: '@alexj',
      skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
      education: [
        { id: 1, institution: 'Stanford University', degree: 'M.S.', field: 'Computer Science', year: 2015 },
        { id: 2, institution: 'Julien Day School', degree: 'High School', field: 'Science', year: 2011 }
      ],
      experience: [
        { id: 1, company: 'Tech Corp', position: 'Senior Software Engineer', duration: '2020-Present', description: 'Leading frontend development team' },
        { id: 2, company: 'Startup Inc', position: 'Software Engineer', duration: '2017-2020', description: 'Full stack development' }
      ],
      followingCount: 342,
      followersCount: 1200
    },
    {
      id: 2,
      name: 'Sarah Williams',
      graduationYear: 2018,
      currentRole: 'Marketing Director',
      location: 'New York, NY',
      isOnline: false,
      username: 'sarahw',
      bio: 'Marketing professional with expertise in digital marketing and brand strategy.',
      email: 'sarah.williams@example.com',
      linkedin: 'linkedin.com/in/sarahwilliams',
      skills: ['Digital Marketing', 'Brand Strategy', 'Social Media', 'SEO', 'Analytics'],
      education: [
        { id: 1, institution: 'NYU Stern', degree: 'MBA', field: 'Marketing', year: 2018 },
        { id: 2, institution: 'Julien Day School', degree: 'High School', field: 'Commerce', year: 2014 }
      ],
      experience: [
        { id: 1, company: 'Global Brands', position: 'Marketing Director', duration: '2021-Present', description: 'Leading marketing campaigns' },
        { id: 2, company: 'Ad Agency', position: 'Marketing Manager', duration: '2018-2021', description: 'Client management and strategy' }
      ],
      followingCount: 289,
      followersCount: 850
    }
  ];
  
  const memberId = parseInt(id || '1');
  const member = mockMembers.find(m => m.id === memberId) || mockMembers[0];
  
  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const initials = getInitials(member.name);
  
  return (
    <div className="min-h-screen bg-background-primary text-text-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background-primary/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-[1265px] mx-auto px-4">
          <div className="h-[53px] flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-background-tertiary transition-colors flex items-center gap-2"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <div className="flex items-center gap-2 cursor-pointer">
              <span className="text-xl font-bold">Julienites</span>
              <span className="text-xs bg-twitter-blue/20 text-twitter-blue px-2 py-1 rounded-full">
                {getVersionDisplay()}
              </span>
            </div>
            <div className="w-10"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </header>
      
      {/* Profile Content */}
      <div className="max-w-[1265px] mx-auto px-4 py-6">
        <div className="bg-background-secondary rounded-2xl border border-border p-6">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-shrink-0">
              <div className="relative w-32 h-32 md:w-40 md:h-40">
                <div className="w-full h-full rounded-full bg-twitter-blue flex items-center justify-center">
                  <span className="text-white font-bold text-4xl md:text-5xl">
                    {initials}
                  </span>
                </div>
                {member.isOnline && (
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-success-color rounded-full border-4 border-background-secondary"></div>
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{member.name}</h1>
                  <p className="text-text-tertiary text-lg mb-1">@{member.username}</p>
                  {member.graduationYear && (
                    <div className="flex items-center gap-2 text-text-secondary mb-2">
                      <GraduationCap size={18} />
                      <span>Class of {member.graduationYear}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-4 md:mt-0">
                  <button className="px-6 py-2 bg-twitter-blue text-white rounded-full font-bold hover:bg-twitter-blueHover transition-colors">
                    Follow
                  </button>
                  <button className="px-6 py-2 border border-border rounded-full font-bold hover:bg-background-tertiary transition-colors">
                    Message
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-text-primary text-lg">{member.bio}</p>
              </div>
              
              <div className="flex flex-wrap gap-4 mb-6">
                {member.location && (
                  <div className="flex items-center gap-2 text-text-secondary">
                    <MapPin size={18} />
                    <span>{member.location}</span>
                  </div>
                )}
                {member.currentRole && (
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Briefcase size={18} />
                    <span>{member.currentRole}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-8">
                <div>
                  <span className="font-bold text-xl">{member.followingCount}</span>
                  <span className="text-text-tertiary ml-2">Following</span>
                </div>
                <div>
                  <span className="font-bold text-xl">{member.followersCount}</span>
                  <span className="text-text-tertiary ml-2">Followers</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-border mb-6">
            <div className="flex gap-8">
              {['About', 'Posts', 'Media', 'Connections'].map((tab) => (
                <button 
                  key={tab}
                  className="py-3 font-medium text-text-tertiary hover:text-text-primary transition-colors border-b-2 border-transparent hover:border-twitter-blue"
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          {/* About Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Skills */}
              {member.skills && member.skills.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-background-tertiary rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Education */}
              {member.education && member.education.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-3">Education</h3>
                  <div className="space-y-4">
                    {member.education.map((edu) => (
                      <div key={edu.id} className="p-4 bg-background-tertiary/50 rounded-xl">
                        <div className="font-bold">{edu.institution}</div>
                        <div className="text-text-secondary">{edu.degree} in {edu.field}</div>
                        <div className="text-text-tertiary text-sm">Graduated {edu.year}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              {/* Experience */}
              {member.experience && member.experience.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-3">Experience</h3>
                  <div className="space-y-4">
                    {member.experience.map((exp) => (
                      <div key={exp.id} className="p-4 bg-background-tertiary/50 rounded-xl">
                        <div className="font-bold">{exp.position}</div>
                        <div className="text-text-secondary">{exp.company}</div>
                        <div className="text-text-tertiary text-sm">{exp.duration}</div>
                        {exp.description && (
                          <div className="mt-2 text-text-primary">{exp.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Contact Info */}
              <div>
                <h3 className="text-xl font-bold mb-3">Contact Information</h3>
                <div className="space-y-3">
                  {member.email && (
                    <div className="flex items-center gap-3">
                      <Mail size={18} />
                      <span>{member.email}</span>
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center gap-3">
                      <Phone size={18} />
                      <span>{member.phone}</span>
                    </div>
                  )}
                  {member.linkedin && (
                    <div className="flex items-center gap-3">
                      <Linkedin size={18} />
                      <a href={`https://${member.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-twitter-blue hover:underline">
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  {member.github && (
                    <div className="flex items-center gap-3">
                      <Github size={18} />
                      <a href={`https://${member.github}`} target="_blank" rel="noopener noreferrer" className="text-twitter-blue hover:underline">
                        GitHub Profile
                      </a>
                    </div>
                  )}
                  {member.twitter && (
                    <div className="flex items-center gap-3">
                      <Twitter size={18} />
                      <a href={`https://twitter.com/${member.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-twitter-blue hover:underline">
                        {member.twitter}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Posts */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Recent Posts</h2>
          <div className="space-y-4">
            {/* Sample Post 1 */}
            <div className="bg-background-secondary rounded-xl border border-border p-6">
              <div className="flex gap-3 mb-4">
                <div className="w-12 h-12 bg-twitter-blue rounded-full flex items-center justify-center text-white font-semibold">
                  {initials}
                </div>
                <div>
                  <div className="font-bold">{member.name}</div>
                  <div className="text-text-tertiary text-sm">@{member.username} • 2 days ago</div>
                </div>
              </div>
              <div className="mb-4">
                Just had an amazing reunion with Julien Day School batch of {member.graduationYear}! 
                Can't believe how time flies. Great catching up with everyone! #Julienites #AlumniReunion
              </div>
              <div className="flex gap-6">
                <button className="flex items-center gap-2 text-text-tertiary hover:text-twitter-blue">
                  <MessageCircle size={18} />
                  <span>24</span>
                </button>
                <button className="flex items-center gap-2 text-text-tertiary hover:text-twitter-blue">
                  <Repeat size={18} />
                  <span>8</span>
                </button>
                <button className="flex items-center gap-2 text-text-tertiary hover:text-twitter-pink">
                  <Heart size={18} />
                  <span>142</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;
