import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UsersIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  StarIcon,
  EyeIcon,
  ClockIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../store/authStore';
import { useToast } from '../components/ui/Toast';
import { getLecturerAnalytics, getCourseAnalytics } from '../services/analytics';

export default function LecturerAnalytics() {
  const { userData } = useAuthStore();
  const { success, error } = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');
  const [selectedCourse, setSelectedCourse] = useState('all');

  useEffect(() => {
    loadAnalytics();
  }, [userData, selectedTimeframe]);

  const loadAnalytics = async () => {
    if (!userData?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const analyticsData = await getLecturerAnalytics(userData.uid);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error loading analytics:', err);
      error('Failed to load analytics: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing':
        return <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />;
      case 'decreasing':
        return <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 bg-gray-300 rounded-full"></div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Available</h2>
          <p className="text-gray-600">Create some courses to see your analytics</p>
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
              <h1 className="heading-lg text-gray-900">Course Analytics</h1>
              <p className="text-gray-600 mt-2">Track your course performance and student engagement</p>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="form-input"
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
                <option value="all">All Time</option>
              </select>
              <button
                onClick={loadAnalytics}
                className="btn-outline"
                disabled={loading}
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-600 to-blue-700 text-white">
            <div className="card-body text-center">
              <AcademicCapIcon className="w-10 h-10 mx-auto mb-3" />
              <div className="text-3xl font-bold mb-1">{analytics.overview.totalCourses}</div>
              <div className="text-blue-100 text-sm">Total Courses</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-600 to-green-700 text-white">
            <div className="card-body text-center">
              <UsersIcon className="w-10 h-10 mx-auto mb-3" />
              <div className="text-3xl font-bold mb-1">{analytics.overview.totalStudents}</div>
              <div className="text-green-100 text-sm">Total Students</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-600 to-purple-700 text-white">
            <div className="card-body text-center">
              <CurrencyDollarIcon className="w-10 h-10 mx-auto mb-3" />
              <div className="text-3xl font-bold mb-1">{formatCurrency(analytics.overview.totalRevenue)}</div>
              <div className="text-purple-100 text-sm">Total Revenue</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-yellow-600 to-yellow-700 text-white">
            <div className="card-body text-center">
              <StarIcon className="w-10 h-10 mx-auto mb-3" />
              <div className="text-3xl font-bold mb-1">{analytics.overview.averageRating.toFixed(1)}</div>
              <div className="text-yellow-100 text-sm">Average Rating</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-indigo-600 to-indigo-700 text-white">
            <div className="card-body text-center">
              <ChartBarIcon className="w-10 h-10 mx-auto mb-3" />
              <div className="text-3xl font-bold mb-1">{analytics.overview.completionRate}%</div>
              <div className="text-indigo-100 text-sm">Completion Rate</div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Enrollment Trends */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-bold text-gray-900">Enrollment Trends</h3>
              <p className="text-sm text-gray-600">Monthly student enrollments</p>
            </div>
            <div className="card-body">
              {analytics.trends.enrollmentsByMonth.length > 0 ? (
                <div className="space-y-3">
                  {analytics.trends.enrollmentsByMonth.slice(-6).map((data, index) => (
                    <div key={data.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {new Date(data.month + '-01').toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${Math.min(100, (data.enrollments / Math.max(...analytics.trends.enrollmentsByMonth.map(d => d.enrollments))) * 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-gray-900 w-8 text-right">{data.enrollments}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ChartBarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No enrollment data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Revenue Trends */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-bold text-gray-900">Revenue Trends</h3>
              <p className="text-sm text-gray-600">Monthly earnings</p>
            </div>
            <div className="card-body">
              {analytics.trends.revenueByMonth.length > 0 ? (
                <div className="space-y-3">
                  {analytics.trends.revenueByMonth.slice(-6).map((data, index) => (
                    <div key={data.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {new Date(data.month + '-01').toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${Math.min(100, (data.revenue / Math.max(...analytics.trends.revenueByMonth.map(d => d.revenue))) * 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-gray-900 min-w-20 text-right">{formatCurrency(data.revenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CurrencyDollarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No revenue data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Course Performance */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Top Performing Courses */}
          <div className="lg:col-span-2 card">
            <div className="card-header">
              <h3 className="text-lg font-bold text-gray-900">Top Performing Courses</h3>
              <p className="text-sm text-gray-600">Ranked by student enrollment</p>
            </div>
            <div className="card-body">
              {analytics.trends.topPerformingCourses.length > 0 ? (
                <div className="space-y-4">
                  {analytics.trends.topPerformingCourses.map((course, index) => (
                    <div key={course.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                          #{index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{course.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <UsersIcon className="w-4 h-4" />
                            {course.enrollmentCount} students
                          </span>
                          <span className="flex items-center gap-1">
                            <CurrencyDollarIcon className="w-4 h-4" />
                            {formatCurrency(course.totalRevenue)}
                          </span>
                          <span className="flex items-center gap-1">
                            <StarIcon className="w-4 h-4" />
                            {course.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {getTrendIcon(course.enrollmentTrend)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AcademicCapIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No course performance data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
              <p className="text-sm text-gray-600">Latest student interactions</p>
            </div>
            <div className="card-body">
              {analytics.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {analytics.recentActivity.slice(0, 8).map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <UsersIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="card bg-blue-50">
          <div className="card-body">
            <h3 className="font-bold text-gray-900 mb-3">Recommendations</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Increase Engagement</h4>
                <p className="text-sm text-gray-600 mb-3">Add more interactive content to boost completion rates</p>
                <Link to="/lecturer/create-course" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Create New Course →
                </Link>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Answer Questions</h4>
                <p className="text-sm text-gray-600 mb-3">Respond to student questions to improve satisfaction</p>
                <Link to="/lecturer/questions" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View Questions →
                </Link>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Optimize Content</h4>
                <p className="text-sm text-gray-600 mb-3">Review lesson analytics to improve popular content</p>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View Lesson Analytics →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
