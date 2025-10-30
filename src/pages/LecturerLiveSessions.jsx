import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  VideoCameraIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  PlayIcon,
  StopIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../store/authStore';
import { useToast } from '../components/ui/Toast';
import {
  getLecturerLiveSessions,
  createLiveSession,
  startLiveSession,
  endLiveSession,
  deleteLiveSession,
  getLiveSessionAnalytics,
  getUpcomingSessions,
  checkLiveSessionCapability
} from '../services/scheduling';
import { getCourses } from '../services/firestore';

export default function LecturerLiveSessions() {
  const { userData } = useAuthStore();
  const { success, error } = useToast();
  
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [capability, setCapability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'live', 'past', 'analytics'
  
  // Create session form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSession, setNewSession] = useState({
    courseId: '',
    title: '',
    description: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: 60,
    maxParticipants: '',
    isRecorded: false
  });

  useEffect(() => {
    if (userData?.uid) {
      loadData();
    }
  }, [userData]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sessionsData, coursesData, analyticsData, capabilityData] = await Promise.all([
        getLecturerLiveSessions(userData.uid),
        getCourses(userData.uid),
        getLiveSessionAnalytics(userData.uid),
        checkLiveSessionCapability(userData.uid)
      ]);
      
      setSessions(sessionsData);
      setCourses(coursesData);
      setAnalytics(analyticsData);
      setCapability(capabilityData);
    } catch (err) {
      console.error('Error loading live sessions data:', err);
      error('Failed to load live sessions data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    try {
      if (!newSession.courseId || !newSession.title || !newSession.scheduledDate || !newSession.scheduledTime) {
        error('Please fill in all required fields');
        return;
      }

      setCreating(true);
      
      const scheduledDateTime = new Date(`${newSession.scheduledDate}T${newSession.scheduledTime}`);
      
      const sessionData = {
        ...newSession,
        scheduledDate: scheduledDateTime,
        maxParticipants: newSession.maxParticipants ? parseInt(newSession.maxParticipants) : null
      };

      await createLiveSession(userData.uid, sessionData);
      
      setShowCreateForm(false);
      setNewSession({
        courseId: '',
        title: '',
        description: '',
        scheduledDate: '',
        scheduledTime: '',
        duration: 60,
        maxParticipants: '',
        isRecorded: false
      });
      
      success('Live session scheduled successfully!');
      loadData();
    } catch (err) {
      console.error('Error creating live session:', err);
      error('Failed to create live session');
    } finally {
      setCreating(false);
    }
  };

  const handleStartSession = async (sessionId) => {
    try {
      const meetingInfo = await startLiveSession(sessionId);
      success('Live session started successfully!');
      
      // In a real implementation, this would open the live streaming interface
      window.open(meetingInfo.joinUrl, '_blank');
      
      loadData();
    } catch (err) {
      console.error('Error starting live session:', err);
      error('Failed to start live session');
    }
  };

  const handleEndSession = async (sessionId) => {
    try {
      if (window.confirm('Are you sure you want to end this live session?')) {
        await endLiveSession(sessionId);
        success('Live session ended successfully!');
        loadData();
      }
    } catch (err) {
      console.error('Error ending live session:', err);
      error('Failed to end live session');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      if (window.confirm('Are you sure you want to delete this live session?')) {
        await deleteLiveSession(sessionId);
        success('Live session deleted successfully!');
        loadData();
      }
    } catch (err) {
      console.error('Error deleting live session:', err);
      error('Failed to delete live session');
    }
  };

  const copyJoinUrl = (joinUrl) => {
    navigator.clipboard.writeText(joinUrl);
    success('Join URL copied to clipboard!');
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: 'bg-blue-100 text-blue-800',
      live: 'bg-green-100 text-green-800',
      ended: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <CalendarIcon className="w-4 h-4" />;
      case 'live':
        return <PlayIcon className="w-4 h-4" />;
      case 'ended':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'cancelled':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const filterSessions = (status) => {
    const now = new Date();
    switch (status) {
      case 'upcoming':
        return sessions.filter(s => s.status === 'scheduled' && new Date(s.scheduledDate) > now);
      case 'live':
        return sessions.filter(s => s.status === 'live');
      case 'past':
        return sessions.filter(s => s.status === 'ended' || (s.status === 'scheduled' && new Date(s.scheduledDate) < now));
      default:
        return sessions;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading live sessions...</p>
        </div>
      </div>
    );
  }

  if (!capability?.hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/lecturer/dashboard" className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Live Sessions Not Available</h2>
            <p className="text-gray-600 mb-6">
              Live session functionality is not available for your account. Please contact support to enable this feature.
            </p>
            <Link to="/lecturer/dashboard" className="btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/lecturer/dashboard" className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-lg text-gray-900">Live Sessions</h1>
              <p className="text-gray-600 mt-2">Schedule and manage your live teaching sessions</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Schedule Session
            </button>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.totalSessions}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <VideoCameraIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-3xl font-bold text-green-600">{analytics.upcomingSessions}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Participants</p>
                  <p className="text-3xl font-bold text-purple-600">{analytics.totalParticipants}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Participants</p>
                  <p className="text-3xl font-bold text-orange-600">{analytics.averageParticipants}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'upcoming', label: 'Upcoming', count: filterSessions('upcoming').length },
                { key: 'live', label: 'Live Now', count: filterSessions('live').length },
                { key: 'past', label: 'Past Sessions', count: filterSessions('past').length },
                { key: 'analytics', label: 'Analytics', count: null }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'analytics' ? (
              // Analytics View
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Session Statistics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Completed Sessions:</span>
                        <span className="font-semibold">{analytics.completedSessions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Recorded Sessions:</span>
                        <span className="font-semibold">{analytics.recordedSessions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Duration:</span>
                        <span className="font-semibold">{Math.round(analytics.totalDuration / 60)} hours</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Capability Limits</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Concurrent Sessions:</span>
                        <span className="font-semibold">{capability.maxConcurrentSessions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Participants per Session:</span>
                        <span className="font-semibold">{capability.maxParticipantsPerSession}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Recording Enabled:</span>
                        <span className="font-semibold">{capability.canRecord ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {analytics.recentSessions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Sessions</h3>
                    <div className="space-y-3">
                      {analytics.recentSessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-semibold text-gray-900">{session.title}</h4>
                            <p className="text-sm text-gray-600">{formatDateTime(session.scheduledDate)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{session.participants?.length || 0} participants</p>
                            <p className="text-sm text-gray-600">{session.duration} minutes</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Sessions List
              <div className="space-y-4">
                {filterSessions(activeTab).length === 0 ? (
                  <div className="text-center py-12">
                    <VideoCameraIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No {activeTab} sessions
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {activeTab === 'upcoming' 
                        ? "You don't have any upcoming live sessions scheduled."
                        : activeTab === 'live'
                        ? "No live sessions are currently running."
                        : "You haven't conducted any live sessions yet."
                      }
                    </p>
                    {activeTab === 'upcoming' && (
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="btn-primary"
                      >
                        Schedule Your First Session
                      </button>
                    )}
                  </div>
                ) : (
                  filterSessions(activeTab).map((session) => {
                    const course = courses.find(c => c.id === session.courseId);
                    const isUpcoming = new Date(session.scheduledDate) > new Date();
                    const canStart = session.status === 'scheduled' && 
                                   new Date(session.scheduledDate) <= new Date(Date.now() + 15 * 60 * 1000); // 15 minutes before

                    return (
                      <div key={session.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">{session.title}</h3>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(session.status)}`}>
                                {getStatusIcon(session.status)}
                                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                {formatDateTime(session.scheduledDate)}
                              </span>
                              <span className="flex items-center gap-1">
                                <ClockIcon className="w-4 h-4" />
                                {session.duration} minutes
                              </span>
                              <span className="flex items-center gap-1">
                                <UserGroupIcon className="w-4 h-4" />
                                {session.participants?.length || 0}
                                {session.maxParticipants && ` / ${session.maxParticipants}`} participants
                              </span>
                            </div>
                            
                            {course && (
                              <p className="text-sm text-gray-600 mb-2">
                                Course: <span className="font-medium">{course.title}</span>
                              </p>
                            )}
                            
                            {session.description && (
                              <p className="text-sm text-gray-600 mb-3">{session.description}</p>
                            )}
                            
                            {session.joinUrl && (
                              <div className="flex items-center gap-2 mb-3">
                                <input
                                  type="text"
                                  value={session.joinUrl}
                                  readOnly
                                  className="form-input text-sm flex-1"
                                />
                                <button
                                  onClick={() => copyJoinUrl(session.joinUrl)}
                                  className="btn-outline text-sm flex items-center gap-1"
                                >
                                  <DocumentDuplicateIcon className="w-4 h-4" />
                                  Copy
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            {session.status === 'live' && (
                              <button
                                onClick={() => handleEndSession(session.id)}
                                className="btn-danger flex items-center gap-2"
                              >
                                <StopIcon className="w-4 h-4" />
                                End Session
                              </button>
                            )}
                            
                            {canStart && (
                              <button
                                onClick={() => handleStartSession(session.id)}
                                className="btn-primary flex items-center gap-2"
                              >
                                <PlayIcon className="w-4 h-4" />
                                Start Session
                              </button>
                            )}
                            
                            {session.status === 'scheduled' && isUpcoming && (
                              <>
                                <button className="btn-outline text-sm">
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSession(session.id)}
                                  className="btn-outline text-red-600 hover:bg-red-50 text-sm"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            
                            {session.recordingUrl && (
                              <a
                                href={session.recordingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-outline text-sm flex items-center gap-1"
                              >
                                <EyeIcon className="w-4 h-4" />
                                View Recording
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Create Session Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Schedule Live Session</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course *</label>
                  <select
                    value={newSession.courseId}
                    onChange={(e) => setNewSession(prev => ({ ...prev, courseId: e.target.value }))}
                    className="form-input w-full"
                    required
                  >
                    <option value="">Select a course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Title *</label>
                  <input
                    type="text"
                    value={newSession.title}
                    onChange={(e) => setNewSession(prev => ({ ...prev, title: e.target.value }))}
                    className="form-input w-full"
                    placeholder="e.g., Introduction to React Hooks"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newSession.description}
                    onChange={(e) => setNewSession(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="form-input w-full"
                    placeholder="What will you cover in this session?"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                    <input
                      type="date"
                      value={newSession.scheduledDate}
                      onChange={(e) => setNewSession(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className="form-input w-full"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                    <input
                      type="time"
                      value={newSession.scheduledTime}
                      onChange={(e) => setNewSession(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      className="form-input w-full"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                    <input
                      type="number"
                      value={newSession.duration}
                      onChange={(e) => setNewSession(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      className="form-input w-full"
                      min="15"
                      max="480"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Participants</label>
                    <input
                      type="number"
                      value={newSession.maxParticipants}
                      onChange={(e) => setNewSession(prev => ({ ...prev, maxParticipants: e.target.value }))}
                      className="form-input w-full"
                      placeholder="Leave empty for unlimited"
                      max={capability?.maxParticipantsPerSession}
                    />
                  </div>
                </div>
                
                {capability?.canRecord && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isRecorded"
                      checked={newSession.isRecorded}
                      onChange={(e) => setNewSession(prev => ({ ...prev, isRecorded: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="isRecorded" className="text-sm text-gray-700">
                      Record this session
                    </label>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateSession}
                  disabled={creating}
                  className="btn-primary flex-1"
                >
                  {creating ? 'Scheduling...' : 'Schedule Session'}
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
