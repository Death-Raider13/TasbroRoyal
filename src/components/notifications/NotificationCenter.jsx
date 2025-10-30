import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  BellIcon,
  XMarkIcon,
  CheckIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import useAuthStore from '../../store/authStore';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  subscribeToNotifications,
  getUnreadNotificationCount,
  NOTIFICATION_TYPES
} from '../../services/notifications';
import { safeFirestoreOperation } from '../../utils/firebaseHelper';
import { useToast } from '../ui/Toast';

export default function NotificationCenter() {
  const { userData } = useAuthStore();
  const { success } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (userData?.uid) {
      // Subscribe to real-time notifications
      const unsubscribe = subscribeToNotifications(userData.uid, (newNotifications) => {
        setNotifications(newNotifications);
        setUnreadCount(newNotifications.filter(n => !n.read).length);
      });

      // Load initial notifications
      loadNotifications();

      return () => unsubscribe();
    }
  }, [userData?.uid]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const userNotifications = await safeFirestoreOperation(
        () => getUserNotifications(userData.uid, { limit: 20 }),
        []
      );
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(userData.uid);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.NEW_MESSAGE:
        return <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />;
      case NOTIFICATION_TYPES.LIVE_SESSION_STARTING:
      case NOTIFICATION_TYPES.LIVE_SESSION_REMINDER:
        return <VideoCameraIcon className="w-5 h-5 text-red-600" />;
      case NOTIFICATION_TYPES.COURSE_UPDATE:
      case NOTIFICATION_TYPES.COURSE_COMPLETED:
        return <AcademicCapIcon className="w-5 h-5 text-green-600" />;
      case NOTIFICATION_TYPES.PAYMENT_CONFIRMATION:
        return <CurrencyDollarIcon className="w-5 h-5 text-yellow-600" />;
      case NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT:
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'normal':
        return 'border-l-blue-500';
      case 'low':
        return 'border-l-gray-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <BellSolidIcon className="w-6 h-6" />
        ) : (
          <BellIcon className="w-6 h-6" />
        )}
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${getPriorityColor(notification.priority)} ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h4 className="text-sm font-medium text-gray-900 mb-1">No notifications</h4>
                <p className="text-sm text-gray-500">You're all caught up!</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <Link
                to={userData?.role === 'student' ? '/student/dashboard' : '/lecturer/dashboard'}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => setIsOpen(false)}
              >
                View all notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
