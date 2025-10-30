import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { AcademicCapIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Fallback images for when video doesn't load or on slow connections
  const backgroundImages = [
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&q=80', // University campus
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&q=80', // Students studying
    'https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80', // University gate
  ];

  useEffect(() => {
    // Preload first background image
    const img = new Image();
    img.src = backgroundImages[0];
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        {/* Fallback animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-green-900 animate-gradient-shift"></div>
        
        {/* Animated overlay pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-repeat animate-slide-diagonal" 
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                 backgroundSize: '60px 60px'
               }}>
          </div>
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>

        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Logo/Brand Section */}
          <div className="text-center mb-8 animate-fade-in">
            <Link to="/" className="inline-flex items-center justify-center gap-3 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300">
                <AcademicCapIcon className="w-8 h-8 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">NaijaEdu</span>
            </Link>
            <p className="text-blue-100 text-lg font-medium">
              Welcome Back!
            </p>
            <p className="text-blue-200 text-sm mt-1">
              Continue your engineering excellence journey
            </p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 animate-slide-up">
            <LoginForm />
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <p className="text-white text-sm">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="font-semibold text-blue-300 hover:text-blue-200 transition-colors duration-200 underline underline-offset-4"
              >
                Sign up for free
              </Link>
            </p>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-blue-200">
              <Link to="/help" className="hover:text-white transition-colors">Help</Link>
              <span>•</span>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Custom animations in style tag */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes slide-diagonal {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          50% { transform: translateY(-100px) translateX(50px); opacity: 0.4; }
        }
        
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }
        
        .animate-slide-diagonal {
          animation: slide-diagonal 20s linear infinite;
        }
        
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}
