import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  VideoCameraIcon, 
  ClockIcon, 
  UserGroupIcon, 
  CalendarDaysIcon,
  PlayIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../store/authStore';
import { getEnrollments } from '../services/firestore';
import { getLiveSessionsForCourses, joinLiveSession } from '../services/scheduling';
import { useToast } from '../components/ui/Toast';
import { safeFirestoreOperation } from '../utils/firebaseHelper';

export default function StudentLiveSessions() {
  const { userData } = useAuthStore();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    if (userData?.uid) {
      fetchStudentLiveSessions();
    }
  }, [userData?.uid]);

  const fetchStudentLiveSessions = async () => {
    try {
      setLoading(true);
      
      // Get student enrollments with safe operation
      const studentEnrollments = await safeFirestoreOperation(
        () => getEnrollments(userData.uid),
        []
      );
      setEnrollments(studentEnrollments);
      
      // Get course IDs from enrollments
      const courseIds = studentEnrollments.map(enrollment => enrollment.courseId);
      
      if (courseIds.length > 0) {
        // Get live sessions for enrolled courses with safe operation
        const sessions = await safeFirestoreOperation(
          () => getLiveSessionsForCourses(courseIds),
          []
        );
        setLiveSessions(sessions);
      }
    } catch (err) {
      console.error('Error fetching live sessions:', err);
      error('Failed to load live sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async (sessionId, sessionTitle) => {
    try {
      // Navigate directly to the live session room
      navigate(`/live-session/${sessionId}`);
    } catch (err) {
      console.error('Error joining session:', err);
      error('Failed to join live session');
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'Not scheduled';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getSessionStatus = (session) => {
    // First check the actual session status from database
    if (session.status === 'live') return 'live';
    if (session.status === 'ended') return 'ended';
    
    // For scheduled sessions, check the time
    const now = new Date();
    const scheduledDate = session.scheduledDate?.toDate ? session.scheduledDate.toDate() : new Date(session.scheduledDate);
    
    // If session is scheduled and time has passed but not manually started, it's still upcoming
    if (session.status === 'scheduled') {
      if (now < scheduledDate) {
        return 'upcoming';
      } else {
        // Session time has passed but not started - still show as upcoming until lecturer starts it
        return 'upcoming';
      }
    }
    
    return 'upcoming'; // Default fallback
  };

  const filterSessionsByStatus = (status) => {
    return liveSessions.filter(session => getSessionStatus(session) === status);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'upcoming':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <ClockIcon className="w-3 h-3 mr-1" />
            Upcoming
          </span>
        );
      case 'live':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-1.5 animate-ping"></div>
            Live Now
          </span>
        );
      case 'ended':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Ended
          </span>
        );
      default:
        return null;
    }
  };

  const SessionCard = ({ session }) => {
    const status = getSessionStatus(session);
    const enrollment = enrollments.find(e => e.courseId === session.courseId);
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
              {getStatusBadge(status)}
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Course: {enrollment?.courseTitle || 'Unknown Course'}
            </p>
            {session.description && (
              <p className="text-sm text-gray-700 mb-3">{session.description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <CalendarDaysIcon className="w-4 h-4 mr-2 text-gray-400" />
            {formatDateTime(session.scheduledDate)}
          </div>
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
            {formatDuration(session.duration)}
          </div>
          <div className="flex items-center">
            <UserGroupIcon className="w-4 h-4 mr-2 text-gray-400" />
            {session.currentParticipants || 0} / {session.maxParticipants} participants
          </div>
          <div className="flex items-center">
            <VideoCameraIcon className="w-4 h-4 mr-2 text-gray-400" />
            {session.recordingEnabled ? 'Recording enabled' : 'No recording'}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {status === 'live' && (
              <button
                onClick={() => handleJoinSession(session.id, session.title)}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                <PlayIcon className="w-4 h-4 mr-2" />
                Join Live Session
              </button>
            )}
            {status === 'upcoming' && (
              <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-lg">
                <ClockIcon className="w-4 h-4 mr-2" />
                Starts {formatDateTime(session.scheduledDate)}
              </span>
            )}
            {status === 'ended' && session.recordingUrl && (
              <Link
                to={session.recordingUrl}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <PlayIcon className="w-4 h-4 mr-2" />
                Watch Recording
              </Link>
            )}
          </div>
          
          <Link
            to={`/courses/${session.courseId}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Course →
          </Link>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading live sessions...</p>
        </div>
      </div>
    );
  }

  const upcomingSessions = filterSessionsByStatus('upcoming');
  const currentLiveSessions = filterSessionsByStatus('live');
  const endedSessions = filterSessionsByStatus('ended');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Sessions</h1>
          <p className="text-gray-600">
            Join live sessions from your enrolled courses and access recordings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Live Now</p>
                <p className="text-2xl font-bold text-gray-900">{currentLiveSessions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ClockIcon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingSessions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-gray-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{endedSessions.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'live', name: 'Live Now', count: currentLiveSessions.length },
                { id: 'upcoming', name: 'Upcoming', count: upcomingSessions.length },
                { id: 'ended', name: 'Past Sessions', count: endedSessions.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Session Lists */}
        <div className="space-y-6">
          {activeTab === 'live' && (
            <div>
              {currentLiveSessions.length > 0 ? (
                <div className="space-y-4">
                  {currentLiveSessions.map((session) => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <VideoCameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Live Sessions</h3>
                  <p className="text-gray-600">There are no live sessions happening right now.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'upcoming' && (
            <div>
              {upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Sessions</h3>
                  <p className="text-gray-600">
                    No live sessions are scheduled for your enrolled courses.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ended' && (
            <div>
              {endedSessions.length > 0 ? (
                <div className="space-y-4">
                  {endedSessions.map((session) => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Past Sessions</h3>
                  <p className="text-gray-600">
                    You haven't attended any live sessions yet.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* No Enrollments Message */}
        {enrollments.length === 0 && (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Enrolled Courses</h3>
            <p className="text-gray-600 mb-4">
              You need to enroll in courses to access their live sessions.
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
