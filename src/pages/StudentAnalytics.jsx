import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChartBarIcon,
  TrophyIcon,
  ClockIcon,
  BookOpenIcon,
  StarIcon,
  FireIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  PlayIcon,
  DocumentTextIcon,
  UserGroupIcon,
  SparklesIcon,
  BoltIcon,
  GiftIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { 
  TrophyIcon as TrophySolid,
  StarIcon as StarSolid,
  FireIcon as FireSolid 
} from '@heroicons/react/24/solid';
import useAuthStore from '../store/authStore';
import { getEnrollments, getCourse } from '../services/firestore';
import { getStudentLiveSessionHistory } from '../services/scheduling';
import { useToast } from '../components/ui/Toast';
import { safeFirestoreOperation } from '../utils/firebaseHelper';

export default function StudentAnalytics() {
  const { userData } = useAuthStore();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [liveSessionHistory, setLiveSessionHistory] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [achievements, setAchievements] = useState([]);
  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    if (userData?.uid) {
      loadAnalyticsData();
    }
  }, [userData?.uid, timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // Get student enrollments with safe operation
      const studentEnrollments = await safeFirestoreOperation(
        () => getEnrollments(userData.uid),
        []
      );
      setEnrollments(studentEnrollments);

      // Get course details with safe operations
      const courseData = [];
      for (const enrollment of studentEnrollments) {
        const course = await safeFirestoreOperation(
          () => getCourse(enrollment.courseId),
          null
        );
        if (course) courseData.push(course);
      }
      setCourses(courseData);

      // Get live session history with safe operation
      const sessionHistory = await safeFirestoreOperation(
        () => getStudentLiveSessionHistory(userData.uid),
        []
      );
      setLiveSessionHistory(sessionHistory);
      
      // Calculate analytics
      const calculatedAnalytics = calculateAnalytics(studentEnrollments, courseData, sessionHistory);
      setAnalytics(calculatedAnalytics);
      
      // Calculate achievements
      const studentAchievements = calculateAchievements(calculatedAnalytics, studentEnrollments);
      setAchievements(studentAchievements);
      
    } catch (err) {
      console.error('Error loading analytics data:', err);
      error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (enrollments, courses, sessions) => {
    const totalEnrollments = enrollments.length;
    const completedCourses = enrollments.filter(e => e.progress === 100).length;
    const inProgressCourses = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;
    const notStartedCourses = enrollments.filter(e => e.progress === 0).length;
    
    const totalLessonsCompleted = enrollments.reduce((sum, e) => 
      sum + (e.completedLessons?.length || 0), 0
    );
    
    const totalLessons = courses.reduce((sum, course) => 
      sum + (course?.lessons?.length || 0), 0
    );
    
    const averageProgress = totalEnrollments > 0 
      ? enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / totalEnrollments 
      : 0;
    
    const totalWatchTime = parseInt(localStorage.getItem(`total_watch_time_${userData.uid}`) || '0');
    const totalLiveSessions = sessions.length;
    
    const totalSpent = enrollments.reduce((sum, e) => sum + (e.amountPaid || 0), 0);
    
    const currentStreak = calculateLearningStreak();
    const longestStreak = parseInt(localStorage.getItem(`longest_streak_${userData.uid}`) || '0');
    
    return {
      totalEnrollments,
      completedCourses,
      inProgressCourses,
      notStartedCourses,
      totalLessonsCompleted,
      totalLessons,
      averageProgress: Math.round(averageProgress),
      totalWatchTime,
      totalLiveSessions,
      totalSpent,
      currentStreak,
      longestStreak,
      completionRate: totalLessons > 0 ? Math.round((totalLessonsCompleted / totalLessons) * 100) : 0
    };
  };

  const calculateLearningStreak = () => {
    // This would typically check daily learning activity
    // For now, we'll use a simple calculation based on recent activity
    const recentActivity = localStorage.getItem(`recent_activity_${userData.uid}`);
    if (recentActivity) {
      const activities = JSON.parse(recentActivity);
      return activities.length || 0;
    }
    return 0;
  };

  const calculateAchievements = (analytics, enrollments) => {
    const achievements = [];
    
    // Course completion achievements
    if (analytics.completedCourses >= 1) {
      achievements.push({
        id: 'first_course',
        title: 'First Course Complete',
        description: 'Completed your first course',
        icon: <TrophySolid className="w-6 h-6 text-yellow-500" />,
        earned: true,
        earnedDate: new Date(),
        rarity: 'common'
      });
    }
    
    if (analytics.completedCourses >= 5) {
      achievements.push({
        id: 'course_master',
        title: 'Course Master',
        description: 'Completed 5 courses',
        icon: <AcademicCapIcon className="w-6 h-6 text-blue-500" />,
        earned: true,
        earnedDate: new Date(),
        rarity: 'rare'
      });
    }
    
    if (analytics.completedCourses >= 10) {
      achievements.push({
        id: 'learning_champion',
        title: 'Learning Champion',
        description: 'Completed 10 courses',
        icon: <TrophySolid className="w-6 h-6 text-purple-500" />,
        earned: true,
        earnedDate: new Date(),
        rarity: 'epic'
      });
    }
    
    // Learning streak achievements
    if (analytics.currentStreak >= 7) {
      achievements.push({
        id: 'week_warrior',
        title: 'Week Warrior',
        description: '7-day learning streak',
        icon: <FireSolid className="w-6 h-6 text-orange-500" />,
        earned: true,
        earnedDate: new Date(),
        rarity: 'uncommon'
      });
    }
    
    if (analytics.currentStreak >= 30) {
      achievements.push({
        id: 'month_master',
        title: 'Month Master',
        description: '30-day learning streak',
        icon: <BoltIcon className="w-6 h-6 text-red-500" />,
        earned: true,
        earnedDate: new Date(),
        rarity: 'legendary'
      });
    }
    
    // Lesson completion achievements
    if (analytics.totalLessonsCompleted >= 50) {
      achievements.push({
        id: 'lesson_lover',
        title: 'Lesson Lover',
        description: 'Completed 50 lessons',
        icon: <BookOpenIcon className="w-6 h-6 text-green-500" />,
        earned: true,
        earnedDate: new Date(),
        rarity: 'uncommon'
      });
    }
    
    // Live session achievements
    if (analytics.totalLiveSessions >= 5) {
      achievements.push({
        id: 'live_learner',
        title: 'Live Learner',
        description: 'Attended 5 live sessions',
        icon: <PlayIcon className="w-6 h-6 text-indigo-500" />,
        earned: true,
        earnedDate: new Date(),
        rarity: 'rare'
      });
    }
    
    // Add some locked achievements for motivation
    if (analytics.completedCourses < 20) {
      achievements.push({
        id: 'expert_learner',
        title: 'Expert Learner',
        description: 'Complete 20 courses',
        icon: <TrophySolid className="w-6 h-6 text-gray-400" />,
        earned: false,
        progress: analytics.completedCourses,
        target: 20,
        rarity: 'legendary'
      });
    }
    
    return achievements;
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'uncommon': return 'bg-green-100 text-green-800 border-green-200';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const MetricCard = ({ title, value, subtitle, icon, trend, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? (
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm text-gray-600">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  const AchievementCard = ({ achievement }) => (
    <div className={`rounded-lg border-2 p-4 ${achievement.earned ? 'bg-white' : 'bg-gray-50'} ${getRarityColor(achievement.rarity)}`}>
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 ${achievement.earned ? '' : 'opacity-50'}`}>
          {achievement.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold ${achievement.earned ? 'text-gray-900' : 'text-gray-500'}`}>
            {achievement.title}
          </h4>
          <p className={`text-sm ${achievement.earned ? 'text-gray-600' : 'text-gray-400'}`}>
            {achievement.description}
          </p>
          {achievement.earned ? (
            <p className="text-xs text-green-600 mt-1">
              Earned {achievement.earnedDate?.toLocaleDateString()}
            </p>
          ) : achievement.progress !== undefined ? (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{achievement.progress}/{achievement.target}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 mt-1">Locked</p>
          )}
        </div>
        <div className="flex-shrink-0">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getRarityColor(achievement.rarity)}`}>
            {achievement.rarity}
          </span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your learning analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Analytics</h1>
              <p className="text-gray-600">Track your progress and celebrate your achievements</p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="year">This Year</option>
                <option value="month">This Month</option>
                <option value="week">This Week</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Courses Enrolled"
            value={analytics.totalEnrollments || 0}
            icon={<BookOpenIcon className="w-6 h-6 text-blue-600" />}
            color="blue"
          />
          <MetricCard
            title="Courses Completed"
            value={analytics.completedCourses || 0}
            subtitle={`${analytics.completionRate || 0}% completion rate`}
            icon={<CheckCircleIcon className="w-6 h-6 text-green-600" />}
            color="green"
          />
          <MetricCard
            title="Learning Streak"
            value={`${analytics.currentStreak || 0} days`}
            subtitle={`Longest: ${analytics.longestStreak || 0} days`}
            icon={<FireIcon className="w-6 h-6 text-orange-600" />}
            color="orange"
          />
          <MetricCard
            title="Watch Time"
            value={formatTime(analytics.totalWatchTime || 0)}
            subtitle="Total learning time"
            icon={<ClockIcon className="w-6 h-6 text-purple-600" />}
            color="purple"
          />
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Course Progress */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Progress</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="text-sm font-medium text-green-600">
                  {analytics.completedCourses || 0} courses
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">In Progress</span>
                <span className="text-sm font-medium text-blue-600">
                  {analytics.inProgressCourses || 0} courses
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Not Started</span>
                <span className="text-sm font-medium text-gray-600">
                  {analytics.notStartedCourses || 0} courses
                </span>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Overall Progress</span>
                  <span>{analytics.averageProgress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${analytics.averageProgress || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Lessons Completed</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {analytics.totalLessonsCompleted || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <PlayIcon className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Live Sessions Attended</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {analytics.totalLiveSessions || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Total Investment</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  ₦{(analytics.totalSpent || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <TrophyIcon className="w-6 h-6 text-yellow-500 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
            </div>
            <span className="text-sm text-gray-500">
              {achievements.filter(a => a.earned).length} of {achievements.length} earned
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {enrollments.slice(0, 5).map((enrollment, index) => {
              const course = courses.find(c => c?.id === enrollment.courseId);
              return (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpenIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {enrollment.progress === 100 ? 'Completed' : 'Studying'} {course?.title || 'Course'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Progress: {enrollment.progress || 0}%
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(enrollment.enrolledAt?.seconds * 1000).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
