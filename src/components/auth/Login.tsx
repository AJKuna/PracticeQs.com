import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Floating emoji data with more emojis and bigger sizes
  const floatingEmojis = [
    // Top row
    { emoji: '📐', size: '48px', left: '15%', top: '15%', delay: '0s', zIndex: 1 },
    { emoji: '🧪', size: '50px', left: '85%', top: '15%', delay: '2s', zIndex: 1 },
    
    // Middle row (sides)
    { emoji: '🧬', size: '44px', left: '5%', top: '45%', delay: '3s', zIndex: 2 },
    { emoji: '🏛️', size: '46px', left: '95%', top: '45%', delay: '4s', zIndex: 1 },
    
    // Lower middle row
    { emoji: '🌍', size: '52px', left: '20%', top: '60%', delay: '5s', zIndex: 1 },
    { emoji: '💻', size: '48px', left: '80%', top: '60%', delay: '6s', zIndex: 2 },
    
    // Bottom row
    { emoji: '📚', size: '44px', left: '10%', top: '80%', delay: '7s', zIndex: 1 },
    { emoji: '🔬', size: '46px', left: '35%', top: '85%', delay: '1.5s', zIndex: 2 },
    { emoji: '🎨', size: '50px', left: '65%', top: '85%', delay: '2.5s', zIndex: 1 },
    { emoji: '🎭', size: '42px', left: '90%', top: '80%', delay: '3.5s', zIndex: 2 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn(formData.email, formData.password);
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);

    try {
      await signInWithGoogle();
      // Note: OAuth redirects automatically, so navigation is handled by OAuth flow
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during Google sign in');
      setIsGoogleLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Floating Emoji Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-15px) rotate(2deg);
          }
          50% {
            transform: translateY(-10px) rotate(-1deg);
          }
          75% {
            transform: translateY(-20px) rotate(1deg);
          }
        }
        
        .floating-emoji {
          animation: float 8s ease-in-out infinite;
          pointer-events: none;
          user-select: none;
        }
      `}</style>

      {/* Floating Emojis */}
      {floatingEmojis.map((item, index) => (
        <div
          key={index}
          className="floating-emoji absolute opacity-60 text-4xl"
          style={{
            left: item.left,
            top: item.top,
            fontSize: item.size,
            animationDelay: item.delay,
            zIndex: item.zIndex
          }}
        >
          {item.emoji}
        </div>
      ))}

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div>
          <img
            className="mx-auto h-24 w-auto"
            src="/logo.svg"
            alt="PracticeQs"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Google Sign In Button */}
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            isLoading={isGoogleLoading}
            fullWidth
            variant="outline"
            className="mb-6 flex items-center justify-center py-3 border border-gray-300"
          >
            {/* Explicitly setting fill colors for Google logo paths */}
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4" // Google Blue
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853" // Google Green
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05" // Google Yellow
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335" // Google Red
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-gray-700">Continue with Google</span>
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                Or continue with email
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Email address"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              fullWidth
            />

            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              fullWidth
            />
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
};