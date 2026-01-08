import { Mail, Lock, Eye, Globe } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4A90E2] via-[#7B68EE] to-[#9B59B6] flex flex-col">
      {/* Background landmarks - subtle overlay */}
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <div className="absolute top-20 left-10 text-white text-9xl">🗼</div>
        <div className="absolute top-40 right-10 text-white text-9xl">⛰️</div>
        <div className="absolute bottom-60 left-1/4 text-white text-9xl">🏖️</div>
      </div>

      {/* Logo and tagline section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <Globe className="w-12 h-12 text-white" strokeWidth={2} />
          </div>
        </div>
        <h1 className="text-white text-4xl mb-2" style={{ fontWeight: 700 }}>
          TravelSpace 3D
        </h1>
        <p className="text-white/80 text-lg">Share Your Journey in 3D</p>
      </div>

      {/* Login card */}
      <div className="bg-white rounded-t-3xl px-6 py-8 relative z-10 shadow-2xl">
        <div className="max-w-md mx-auto">
          {/* Email input */}
          <div className="mb-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A90E2] focus:ring-2 focus:ring-[#4A90E2]/20"
                style={{ fontSize: '16px' }}
              />
            </div>
          </div>

          {/* Password input */}
          <div className="mb-2">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A90E2] focus:ring-2 focus:ring-[#4A90E2]/20"
                style={{ fontSize: '16px' }}
              />
              <Eye className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 cursor-pointer" />
            </div>
          </div>

          {/* Forgot password */}
          <div className="text-right mb-6">
            <a href="#" className="text-[#4A90E2] text-sm">
              Forgot Password?
            </a>
          </div>

          {/* Login button */}
          <button
            onClick={onLogin}
            className="w-full bg-[#4A90E2] text-white py-3 rounded-lg mb-6 hover:bg-[#3A80D2] transition-colors"
            style={{ fontSize: '16px', fontWeight: 600 }}
          >
            Log In
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-gray-500 text-sm">OR</span>
            </div>
          </div>

          {/* Social login buttons */}
          <button className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg mb-3 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span style={{ fontSize: '16px' }}>Continue with Google</span>
          </button>

          <button className="w-full bg-black text-white py-3 rounded-lg mb-6 flex items-center justify-center gap-3 hover:bg-gray-900 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            <span style={{ fontSize: '16px' }}>Continue with Apple</span>
          </button>

          {/* Sign up link */}
          <div className="text-center">
            <span className="text-gray-600 text-sm">Don't have an account? </span>
            <a href="#" className="text-[#4A90E2] text-sm">
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
