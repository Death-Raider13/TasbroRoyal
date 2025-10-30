import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon, 
  ChevronDownIcon,
  AcademicCapIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  TagIcon,
  ChartBarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../../store/authStore';
import NotificationCenter from '../notifications/NotificationCenter';

export default function Navbar() {
  const { user, userData, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Courses', href: '/courses' },
    { name: 'Study Groups', href: '/study-groups' },
    { name: 'Q&A', href: '/questions' },
    { name: 'About', href: '/about' },
  ];

  return (
    <nav id="navigation" className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <AcademicCapIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  NaijaEdu
                </span>
                <div className="text-xs text-gray-500 font-medium">Engineering Excellence</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notification Center */}
                <NotificationCenter />
              </>
            ) : null}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                >
                  {userData?.profileImage ? (
                    <img
                      src={userData.profileImage}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {userData?.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-semibold text-gray-900">
                      {userData?.displayName || 'User'}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {userData?.role || 'Student'}
                    </div>
                  </div>
                  <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-scale-in">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="text-sm font-semibold text-gray-900">
                        {userData?.displayName || 'User'}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2 capitalize">
                        {userData?.role || 'Student'}
                      </div>
                    </div>

                    {/* Dashboard Links */}
                    {userData?.role === 'student' && (
                      <>
                        <Link
                          to="/student/dashboard"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <UserCircleIcon className="w-5 h-5 mr-3 text-gray-400" />
                          Student Dashboard
                        </Link>
                        <Link
                          to="/student/messages"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <ChatBubbleLeftRightIcon className="w-5 h-5 mr-3 text-gray-400" />
                          Messages
                        </Link>
                        <Link
                          to="/student/live-sessions"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <VideoCameraIcon className="w-5 h-5 mr-3 text-gray-400" />
                          Live Sessions
                        </Link>
                        <Link
                          to="/student/deals"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <TagIcon className="w-5 h-5 mr-3 text-gray-400" />
                          Deals & Offers
                        </Link>
                        <Link
                          to="/student/analytics"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <ChartBarIcon className="w-5 h-5 mr-3 text-gray-400" />
                          Analytics
                        </Link>
                        <Link
                          to="/student/profile"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <UserIcon className="w-5 h-5 mr-3 text-gray-400" />
                          Profile
                        </Link>
                      </>
                    )}
                    
                    {userData?.role === 'lecturer' && (
                      <Link
                        to="/lecturer/dashboard"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <AcademicCapIcon className="w-5 h-5 mr-3 text-gray-400" />
                        Lecturer Dashboard
                      </Link>
                    )}
                    
                    {userData?.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Cog6ToothIcon className="w-5 h-5 mr-3 text-gray-400" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              aria-label="Toggle mobile menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-6 h-6 text-gray-600" aria-hidden="true" />
              ) : (
                <Bars3Icon className="w-6 h-6 text-gray-600" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
