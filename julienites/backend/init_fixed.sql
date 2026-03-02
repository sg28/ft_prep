-- Initialize database with some sample data

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert some sample skills
INSERT INTO skills (id, name, category, created_at) VALUES
  (uuid_generate_v4(), 'JavaScript', 'Programming', NOW()),
  (uuid_generate_v4(), 'React', 'Frontend', NOW()),
  (uuid_generate_v4(), 'Node.js', 'Backend', NOW()),
  (uuid_generate_v4(), 'TypeScript', 'Programming', NOW()),
  (uuid_generate_v4(), 'Python', 'Programming', NOW()),
  (uuid_generate_v4(), 'FastAPI', 'Backend', NOW()),
  (uuid_generate_v4(), 'PostgreSQL', 'Database', NOW()),
  (uuid_generate_v4(), 'Docker', 'DevOps', NOW()),
  (uuid_generate_v4(), 'AWS', 'Cloud', NOW()),
  (uuid_generate_v4(), 'Machine Learning', 'AI/ML', NOW())
ON CONFLICT (name) DO NOTHING;

-- Create an admin user (password: admin123)
INSERT INTO users (
  id, email, username, name, password_hash, 
  graduation_year, bio, location, "current_role",
  is_verified, role, created_at
) VALUES (
  uuid_generate_v4(),
  'admin@julienites.com',
  'admin',
  'System Administrator',
  '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', -- bcrypt hash of 'admin123'
  2020,
  'System administrator for Julienites platform',
  'San Francisco, CA',
  'Platform Administrator',
  true,
  'admin',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create some sample users (passwords are all 'password123')
INSERT INTO users (
  id, email, username, name, password_hash, 
  graduation_year, bio, location, "current_role",
  created_at
) VALUES
  (
    uuid_generate_v4(),
    'alice@example.com',
    'alicej',
    'Alice Johnson',
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    2018,
    'Software engineer passionate about open source',
    'New York, NY',
    'Senior Software Engineer at TechCorp',
    NOW()
  ),
  (
    uuid_generate_v4(),
    'bob@example.com',
    'bobm',
    'Bob Miller',
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    2019,
    'Product manager with focus on user experience',
    'Austin, TX',
    'Product Manager at StartupInc',
    NOW()
  ),
  (
    uuid_generate_v4(),
    'carol@example.com',
    'carolw',
    'Carol Williams',
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    2020,
    'Data scientist specializing in machine learning',
    'Seattle, WA',
    'Data Scientist at DataCorp',
    NOW()
  ),
  (
    uuid_generate_v4(),
    'david@example.com',
    'davids',
    'David Smith',
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    2017,
    'Full stack developer with DevOps experience',
    'Chicago, IL',
    'Lead Developer at DevShop',
    NOW()
  )
ON CONFLICT (email) DO NOTHING;