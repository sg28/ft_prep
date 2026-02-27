import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getVersionDisplay } from '../config/version';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

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
                to="/register" 
                className="text-twitter-blue hover:underline font-medium transition-colors"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-background-secondary rounded-2xl p-8 border border-border">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
              <p className="text-text-tertiary">Sign in to your Julienites account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-background-tertiary border border-border rounded-xl py-3 px-4 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <button 
                    type="button" 
                    className="text-sm text-twitter-blue hover:underline transition-colors"
                    onClick={() => alert('Password reset functionality coming soon!')}
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-background-tertiary border border-border rounded-xl py-3 px-4 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-twitter-blue text-white py-3 rounded-xl font-bold hover:bg-twitter-blueHover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-center text-text-tertiary text-sm">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-twitter-blue hover:underline font-medium transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>

            <div className="mt-6 text-center text-text-tertiary text-xs">
              <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
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

export default Login;