import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getVersionDisplay } from '../config/version';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    graduationYear: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : undefined
      };

      const success = await register(userData);
      if (success) {
        navigate('/');
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during registration');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate graduation years (last 30 years)
  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from(
    { length: 30 },
    (_, i) => currentYear - i
  );

  return (
    <div className="min-h-screen bg-background-primary text-text-primary flex flex-col">
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
                {isDark ? '🌙' : '☀️'}
              </button>
              
              <Link 
                to="/login" 
                className="text-twitter-blue hover:underline font-medium transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-background-secondary rounded-2xl p-8 border border-border">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Join Julienites</h2>
              <p className="text-text-tertiary">Create your alumni network account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-background-tertiary border border-border rounded-xl py-3 px-4 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent transition-all"
                  placeholder="John Doe"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-background-tertiary border border-border rounded-xl py-3 px-4 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full bg-background-tertiary border border-border rounded-xl py-3 px-4 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent transition-all"
                  placeholder="johndoe"
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-text-tertiary">This will be your unique identifier in the network</p>
              </div>

              <div>
                <label htmlFor="graduationYear" className="block text-sm font-medium mb-2">
                  Graduation Year (Optional)
                </label>
                <select
                  id="graduationYear"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  className="w-full bg-background-tertiary border border-border rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent transition-all"
                  disabled={isLoading}
                >
                  <option value="">Select graduation year</option>
                  {graduationYears.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-background-tertiary border border-border rounded-xl py-3 px-4 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent transition-all"
                  placeholder="At least 6 characters"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full bg-background-tertiary border border-border rounded-xl py-3 px-4 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent transition-all"
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3 text-sm">
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-twitter-blue text-white py-3 rounded-xl font-bold hover:bg-twitter-blueHover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-center text-text-tertiary text-sm">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-twitter-blue hover:underline font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <div className="mt-6 text-center text-text-tertiary text-xs">
              <p>By creating an account, you agree to our Terms of Service and Privacy Policy</p>
            </div>
          </div>

          <div className="mt-6 text-center text-text-tertiary text-sm">
            <button 
              onClick={() => navigate('/')}
              className="text-twitter-blue hover:underline transition-colors"
            >
              ← Back to home
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;