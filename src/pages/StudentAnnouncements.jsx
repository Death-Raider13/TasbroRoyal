import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BellIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CalendarIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import {
  BellIcon as BellSolidIcon,
  ExclamationTriangleIcon as ExclamationTriangleSolidIcon
} from '@heroicons/react/24/solid';
import useAuthStore from '../store/authStore';
import { useToast } from '../components/ui/Toast';
import { getStudentAnnouncements } from '../services/messaging';
import { safeFirestoreOperation } from '../utils/firebaseHelper';

export default function StudentAnnouncements() {
  const { userData } = useAuthStore();
  const { error } = useToast();
  
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, urgent, high, normal, low

  useEffect(() => {
    if (userData?.uid) {
      loadAnnouncements();
    }
  }, [userData]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const announcementsData = await safeFirestoreOperation(
        () => getStudentAnnouncements(userData.uid, 50),
        []
      );
      setAnnouncements(announcementsData);
    } catch (err) {
      console.error('Error loading announcements:', err);
      error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    if (filter === 'all') return true;
    return announcement.priority === filter;
  });

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <ExclamationTriangleSolidIcon className="w-5 h-5 text-red-600" />;
      case 'high':
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-600" />;
    }
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      normal: 'bg-blue-100 text-blue-800 border-blue-200',
      low: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[priority] || styles.normal}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              to="/student/dashboard" 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex items-center gap-3">
              <BellSolidIcon className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Course Announcements</h1>
                <p className="text-gray-600">Stay updated with important course information</p>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All', count: announcements.length },
              { key: 'urgent', label: 'Urgent', count: announcements.filter(a => a.priority === 'urgent').length },
              { key: 'high', label: 'High', count: announcements.filter(a => a.priority === 'high').length },
              { key: 'normal', label: 'Normal', count: announcements.filter(a => a.priority === 'normal').length },
              { key: 'low', label: 'Low', count: announcements.filter(a => a.priority === 'low').length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Announcements List */}
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <BellIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You don't have any announcements yet. Check back later for updates from your lecturers."
                : `No ${filter} priority announcements found.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement) => (
              <div key={announcement.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getPriorityIcon(announcement.priority)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <div className="flex items-center gap-1">
                            <BookOpenIcon className="w-4 h-4" />
                            <span>{announcement.courseTitle}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{announcement.createdAt.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {getPriorityBadge(announcement.priority)}
                  </div>

                  {/* Content */}
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Posted {announcement.createdAt.toLocaleDateString()}
                    </span>
                    <Link
                      to={`/courses/${announcement.courseId}/learn`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Go to Course →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
