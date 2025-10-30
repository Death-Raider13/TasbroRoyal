import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlayIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  VideoCameraIcon,
  BookOpenIcon,
  TrophyIcon,
  FireIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  StarIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import {
  VideoCameraIcon as VideoCameraSolidIcon,
  BellIcon as BellSolidIcon,
  FireIcon as FireSolidIcon
} from '@heroicons/react/24/solid';
import useAuthStore from '../store/authStore';
import { useToast } from '../components/ui/Toast';
import { 
  getEnrollments, 
  getCourse, 
  updateEnrollmentProgress
} from '../services/firestore';
import { safeFirestoreOperation } from '../utils/firebaseHelper';
import {
  getCourseLiveSessions,
  joinLiveSession
} from '../services/scheduling';
import { getStudentAnnouncements } from '../services/messaging';

export default function EnhancedStudentDashboard() {
  const { userData } = useAuthStore();
  const { success, error } = useToast();
  
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    upcomingSessions: 0,
    unreadMessages: 0,
    totalHoursLearned: 0,
    currentStreak: 7 // Mock data for now
  });

  useEffect(() => {
    if (userData?.uid) {
      loadDashboardData();
    }
  }, [userData]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      if (!userData?.uid) {
        console.log('User not authenticated yet');
        setLoading(false);
        return;
      }
      
      // Load enrollments and courses with safe operation
      const enrollmentsData = await safeFirestoreOperation(
        () => getEnrollments(userData.uid),
        []
      );
      // Calculate progress for each enrollment
      const processedEnrollments = enrollmentsData.map(enrollment => {
        const completedLessons = enrollment.completedLessons || [];
        const totalLessons = enrollment.totalLessons || 1;
        const progress = Math.round((completedLessons.length / totalLessons) * 100);
        return { ...enrollment, progress };
      });
      setEnrollments(processedEnrollments);

      // Fetch course details
      const coursesData = await Promise.all(
        processedEnrollments.map(enrollment => getCourse(enrollment.courseId))
      );
      setCourses(coursesData);

      // Load live sessions for enrolled courses
      const allLiveSessions = [];
      for (const enrollment of processedEnrollments) {
        try {
          const courseSessions = await getCourseLiveSessions(enrollment.courseId);
          allLiveSessions.push(...courseSessions);
        } catch (error) {
          console.error(`Error loading sessions for course ${enrollment.courseId}:`, error);
        }
      }
      
      // Filter upcoming and live sessions
      const now = new Date();
      const relevantSessions = allLiveSessions.filter(session => 
        session.status === 'live' || 
        (session.status === 'scheduled' && new Date(session.scheduledDate) > now)
      );
      setLiveSessions(relevantSessions);

      // Load messages (mock data for now - will integrate with real messaging system)
      setMessages([]);

      // Load announcements from enrolled courses
      const announcementsData = await safeFirestoreOperation(
        () => getStudentAnnouncements(userData.uid, 5),
        []
      );
      setAnnouncements(announcementsData);

      // Calculate stats
      const completedCount = processedEnrollments.filter(e => e.progress === 100).length;
      const inProgressCount = processedEnrollments.filter(e => e.progress > 0 && e.progress < 100).length;
      const upcomingSessionsCount = relevantSessions.filter(s => s.status === 'scheduled').length;
      const unreadCount = 0; // Will be updated when messaging is integrated

      setStats({
        totalCourses: processedEnrollments.length,
        completedCourses: completedCount,
        inProgressCourses: inProgressCount,
        upcomingSessions: upcomingSessionsCount,
        unreadMessages: unreadCount,
        totalHoursLearned: Math.floor(Math.random() * 50) + 20, // Mock data
        currentStreak: 7 // Mock data
      });

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLiveSession = async (sessionId) => {
    try {
      const joinInfo = await joinLiveSession(sessionId, userData.uid);
      window.open(joinInfo.joinUrl, '_blank');
      success('Joining live session...');
    } catch (err) {
      console.error('Error joining live session:', err);
      error('Failed to join live session');
    }
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getContinueLearningCourses = () => {
    return enrollments
      .filter(e => e.progress > 0 && e.progress < 100)
      .slice(0, 3);
  };

  const getRecentlyEnrolledCourses = () => {
    return enrollments
      .filter(e => e.progress === 0)
      .slice(0, 3);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-lg text-gray-900">
                Welcome back, {userData.displayName}! 👋
              </h1>
              <p className="text-gray-600 mt-2">Ready to continue your learning journey?</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/student/messages"
                className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ChatBubbleLeftRightIcon className="w-6 h-6" />
                {stats.unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {stats.unreadMessages}
                  </span>
                )}
              </Link>
              <Link
                to="/student/notifications"
                className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <BellIcon className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalCourses}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpenIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completedCourses}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrophyIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Live Sessions</p>
                <p className="text-3xl font-bold text-purple-600">{stats.upcomingSessions}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <VideoCameraIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Learning Streak</p>
                <p className="text-3xl font-bold text-orange-600">{stats.currentStreak} days</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FireSolidIcon className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Live Sessions */}
            {liveSessions.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <VideoCameraSolidIcon className="w-6 h-6 text-red-500" />
                    Live Sessions
                  </h2>
                  <Link to="/student/live-sessions" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {liveSessions.slice(0, 3).map((session) => {
                    const course = courses.find(c => c.id === session.courseId);
                    const isLive = session.status === 'live';
                    
                    return (
                      <div key={session.id} className={`border rounded-lg p-4 ${isLive ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900">{session.title}</h3>
                              {isLive && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                  LIVE
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{course?.title}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                {formatDateTime(session.scheduledDate)}
                              </span>
                              <span className="flex items-center gap-1">
                                <ClockIcon className="w-4 h-4" />
                                {session.duration} min
                              </span>
                              <span className="flex items-center gap-1">
                                <UserGroupIcon className="w-4 h-4" />
                                {session.participants?.length || 0} joined
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleJoinLiveSession(session.id)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              isLive 
                                ? 'bg-red-600 text-white hover:bg-red-700' 
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {isLive ? 'Join Now' : 'Join Session'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Continue Learning */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Continue Learning</h2>
                <Link to="/courses" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Browse Courses
                </Link>
              </div>

              {getContinueLearningCourses().length === 0 && getRecentlyEnrolledCourses().length === 0 ? (
                <div className="text-center py-12">
                  <AcademicCapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses yet</h3>
                  <p className="text-gray-600 mb-6">Start your learning journey by enrolling in a course</p>
                  <Link to="/courses" className="btn-primary">
                    Explore Courses
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Continue Learning */}
                  {getContinueLearningCourses().length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pick up where you left off</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getContinueLearningCourses().map((enrollment, index) => {
                          const course = courses[enrollments.indexOf(enrollment)];
                          if (!course) return null;

                          return (
                            <div key={enrollment.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                              <img 
                                src={course.thumbnailURL} 
                                alt={course.title}
                                className="w-full h-32 object-cover"
                              />
                              <div className="p-4">
                                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h4>
                                <p className="text-sm text-gray-600 mb-3">by {course.lecturerName}</p>
                                
                                <div className="mb-3">
                                  <div className="flex items-center justify-between text-sm mb-1">
                                    <span className="text-gray-600">Progress</span>
                                    <span className="font-medium">{enrollment.progress}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full transition-all"
                                      style={{ width: `${enrollment.progress}%` }}
                                    ></div>
                                  </div>
                                </div>

                                <Link 
                                  to={`/courses/${course.id}/learn`}
                                  className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  Continue Learning
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Recently Enrolled */}
                  {getRecentlyEnrolledCourses().length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Start learning</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getRecentlyEnrolledCourses().map((enrollment, index) => {
                          const course = courses[enrollments.indexOf(enrollment)];
                          if (!course) return null;

                          return (
                            <div key={enrollment.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                              <img 
                                src={course.thumbnailURL} 
                                alt={course.title}
                                className="w-full h-32 object-cover"
                              />
                              <div className="p-4">
                                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h4>
                                <p className="text-sm text-gray-600 mb-3">by {course.lecturerName}</p>
                                
                                <Link 
                                  to={`/courses/${course.id}/learn`}
                                  className="block w-full bg-green-600 text-white text-center py-2 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  Start Learning
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/student/messages"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Messages</h4>
                    <p className="text-sm text-gray-600">Chat with lecturers</p>
                  </div>
                  {stats.unreadMessages > 0 && (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                      {stats.unreadMessages}
                    </span>
                  )}
                </Link>

                <Link
                  to="/questions"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Ask Questions</h4>
                    <p className="text-sm text-gray-600">Get help from experts</p>
                  </div>
                </Link>

                <Link
                  to="/certificates"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrophyIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Certificates</h4>
                    <p className="text-sm text-gray-600">View achievements</p>
                  </div>
                </Link>

                <Link
                  to="/study-groups"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <UserGroupIcon className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Study Groups</h4>
                    <p className="text-sm text-gray-600">Collaborate with peers</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Messages */}
            {messages.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Recent Messages</h3>
                  <Link to="/student/messages" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All
                  </Link>
                </div>
                <div className="space-y-3">
                  {messages.slice(0, 3).map((message) => (
                    <div key={message.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {message.senderName?.charAt(0) || 'L'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{message.senderName || 'Lecturer'}</p>
                        <p className="text-sm text-gray-600 truncate">{message.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(message.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                      {!message.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Announcements */}
            {announcements.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Recent Announcements</h3>
                  <BellSolidIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 text-sm">{announcement.title}</h4>
                            {announcement.priority === 'urgent' && (
                              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Urgent</span>
                            )}
                            {announcement.priority === 'high' && (
                              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">High</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{announcement.content}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{announcement.courseTitle}</span>
                            <span>{announcement.createdAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Link 
                    to="/student/announcements" 
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    View all announcements
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* Learning Progress */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Learning Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Hours</span>
                  <span className="font-semibold text-gray-900">{stats.totalHoursLearned}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="font-semibold text-gray-900">
                    {stats.totalCourses > 0 ? Math.round((stats.completedCourses / stats.totalCourses) * 100) : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Streak</span>
                  <span className="font-semibold text-orange-600 flex items-center gap-1">
                    <FireSolidIcon className="w-4 h-4" />
                    {stats.currentStreak} days
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
