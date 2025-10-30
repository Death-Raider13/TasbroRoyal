import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, deleteDoc, updateDoc, collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useToast } from '../components/ui/Toast';
import useAuthStore from '../store/authStore';
import { 
  getUsers, 
  getCourses, 
  getTransactions, 
  getLecturerApplications,
  approveLecturer, 
  rejectLecturer,
  approveCourse,
  rejectCourse
} from '../services/firestore';
import {
  ChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  CogIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  ClockIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { userData } = useAuthStore();
  
  // State for different sections
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const { success, error, info } = useToast();

  // Overview stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalLecturers: 0,
    totalCourses: 0,
    activeCourses: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalEnrollments: 0,
    pendingApprovals: 0
  });

  // Data states
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [pendingLecturers, setPendingLecturers] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [reports, setReports] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);

  // Filters and pagination
  const [userFilter, setUserFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30days');
  const [activeTab, setActiveTab] = useState('lecturers');


  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchOverviewStats(),
        fetchUsers(),
        fetchCourses(),
        fetchTransactions(),
        fetchPendingApprovals(),
        fetchReports()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchOverviewStats = async () => {
    try {
      // Fetch all users
      const allUsersSnapshot = await getDocs(collection(db, 'users'));
      const allUsers = allUsersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Fetch all courses
      const allCoursesSnapshot = await getDocs(collection(db, 'courses'));
      const allCourses = allCoursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Fetch all transactions
      const transactionsSnapshot = await getDocs(collection(db, 'transactions'));
      const allTransactions = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Fetch enrollments
      const enrollmentsSnapshot = await getDocs(collection(db, 'enrollments'));
      
      // Calculate stats
      const students = allUsers.filter(user => user.role === 'student');
      const lecturers = allUsers.filter(user => user.role === 'lecturer');
      const activeCourses = allCourses.filter(course => course.status === 'published');
      const pendingLecturers = allUsers.filter(user => user.role === 'lecturer' && user.applicationStatus === 'pending');
      const pendingCourses = allCourses.filter(course => course.status === 'pending_review');
      
      const totalRevenue = allTransactions.reduce((sum, transaction) => {
        return sum + (transaction.platformFee || 0);
      }, 0);
      
      // Calculate monthly revenue (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const monthlyRevenue = allTransactions
        .filter(transaction => transaction.createdAt?.toDate() > thirtyDaysAgo)
        .reduce((sum, transaction) => sum + (transaction.platformFee || 0), 0);

      setStats({
        totalUsers: allUsers.length,
        totalStudents: students.length,
        totalLecturers: lecturers.length,
        totalCourses: allCourses.length,
        activeCourses: activeCourses.length,
        totalRevenue,
        monthlyRevenue,
        totalEnrollments: enrollmentsSnapshot.size,
        pendingApprovals: pendingLecturers.length + pendingCourses.length
      });
    } catch (error) {
      console.error('Error fetching overview stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      const allCourses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(allCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const transactionsQuery = query(
        collection(db, 'transactions'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const allTransactions = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      // Fetch pending lecturers
      const lecturersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'lecturer'),
        where('applicationStatus', '==', 'pending')
      );
      const lecturersSnapshot = await getDocs(lecturersQuery);
      setPendingLecturers(lecturersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch pending courses
      const coursesQuery = query(
        collection(db, 'courses'),
        where('status', '==', 'pending_review')
      );
      const coursesSnapshot = await getDocs(coursesQuery);
      setPendingCourses(coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const reportsSnapshot = await getDocs(collection(db, 'reports'));
      const allReports = reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(allReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  // Action handlers
  const handleApproveLecturer = async (userId) => {
    try {
      await approveLecturer(userId);
      success('Lecturer application approved!');
      fetchLecturerApplications();
      fetchOverviewStats();
    } catch (err) {
      error('Error approving lecturer: ' + err.message);
    }
  };

  const handleRejectLecturer = async (userId) => {
    try {
      await rejectLecturer(userId);
      success('Lecturer application rejected.');
      fetchLecturerApplications();
      fetchOverviewStats();
    } catch (err) {
      error('Error rejecting lecturer: ' + err.message);
    }
  };

  const handleApproveCourse = async (courseId) => {
    if (window.confirm('Approve this course?')) {
      try {
        await approveCourse(courseId);
        success('Course approved successfully!');
        fetchPendingApprovals();
        fetchOverviewStats();
      } catch (err) {
        error('Error approving course: ' + err.message);
      }
    }
  };

  const handleRejectCourse = async (courseId) => {
    const reason = prompt('Enter rejection reason (be specific to help the lecturer improve):');
    if (reason && reason.trim()) {
      try {
        await rejectCourse(courseId, reason.trim(), userData?.uid);
        success('Course rejected with feedback. Lecturer can resubmit after addressing issues.');
        fetchPendingApprovals();
        fetchOverviewStats();
      } catch (err) {
        error('Error rejecting course: ' + err.message);
      }
    }
  };

  const handleSuspendUser = async (userId) => {
    if (window.confirm('Suspend this user account?')) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          status: 'suspended',
          suspendedAt: new Date()
        });
        success('User suspended successfully!');
        fetchUsers();
      } catch (err) {
        error('Error suspending user: ' + err.message);
      }
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: 'active',
        suspendedAt: null
      });
      success('User activated successfully!');
      fetchUsers();
    } catch (err) {
      error('Error activating user: ' + err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('⚠️ PERMANENTLY DELETE this user? This action cannot be undone!')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        success('User deleted successfully!');
        fetchUsers();
        fetchOverviewStats();
      } catch (err) {
        error('Error deleting user: ' + err.message);
      }
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('⚠️ PERMANENTLY DELETE this course? This action cannot be undone!')) {
      try {
        await deleteDoc(doc(db, 'courses', courseId));
        success('Course deleted successfully!');
        fetchCourses();
        fetchOverviewStats();
      } catch (err) {
        error('Error deleting course: ' + err.message);
      }
    }
  };

  const handlePreviewCourse = (courseId) => {
    navigate(`/admin/course-preview/${courseId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-lg">Loading Admin Dashboard...</span>
      </div>
    );
  }

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'users', label: 'User Management', icon: UserGroupIcon },
    { id: 'courses', label: 'Course Management', icon: AcademicCapIcon },
    { id: 'finances', label: 'Financial Management', icon: CurrencyDollarIcon },
    { id: 'approvals', label: 'Pending Approvals', icon: ClockIcon, badge: stats.pendingApprovals },
    { id: 'reports', label: 'Reports & Moderation', icon: ExclamationTriangleIcon, badge: reports.length },
    { id: 'analytics', label: 'Analytics', icon: ArrowTrendingUpIcon },
    { id: 'settings', label: 'System Settings', icon: CogIcon }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-600 mt-1">Complete Platform Control</p>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-blue-50 transition-colors ${
                activeSection === item.id ? 'bg-blue-100 border-r-2 border-blue-600 text-blue-700' : 'text-gray-700'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="flex-1">{item.label}</span>
              {item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Platform Overview</h2>
                <p className="text-gray-600">Real-time insights into your e-learning platform</p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total Users</p>
                      <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                      <p className="text-sm text-blue-100 mt-1">
                        {stats.totalStudents} Students, {stats.totalLecturers} Lecturers
                      </p>
                    </div>
                    <UserGroupIcon className="w-12 h-12 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Total Courses</p>
                      <p className="text-3xl font-bold">{stats.totalCourses.toLocaleString()}</p>
                      <p className="text-sm text-green-100 mt-1">
                        {stats.activeCourses} Published
                      </p>
                    </div>
                    <AcademicCapIcon className="w-12 h-12 text-green-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Total Revenue</p>
                      <p className="text-3xl font-bold">₦{stats.totalRevenue.toLocaleString()}</p>
                      <p className="text-sm text-purple-100 mt-1">
                        ₦{stats.monthlyRevenue.toLocaleString()} this month
                      </p>
                    </div>
                    <BanknotesIcon className="w-12 h-12 text-purple-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Enrollments</p>
                      <p className="text-3xl font-bold">{stats.totalEnrollments.toLocaleString()}</p>
                      <p className="text-sm text-orange-100 mt-1">
                        Active Learning Sessions
                      </p>
                    </div>
                    <CheckCircleIcon className="w-12 h-12 text-orange-200" />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <ClockIcon className="w-5 h-5 mr-2 text-yellow-500" />
                    Pending Approvals
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Lecturer Applications</span>
                      <span className="font-semibold">{pendingLecturers.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Course Reviews</span>
                      <span className="font-semibold">{pendingCourses.length}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSection('approvals')}
                    className="w-full mt-4 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Review Pending Items
                  </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-red-500" />
                    Content Reports
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Open Reports</span>
                      <span className="font-semibold">{reports.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Requires Action</span>
                      <span className="font-semibold text-red-600">
                        {reports.filter(r => r.status === 'pending').length}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSection('reports')}
                    className="w-full mt-4 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Review Reports
                  </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-green-500" />
                    Platform Growth
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Monthly Growth</span>
                      <span className="font-semibold text-green-600">+12%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Revenue Growth</span>
                      <span className="font-semibold text-green-600">+18%</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSection('analytics')}
                    className="w-full mt-4 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    View Analytics
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-lg mb-4">Recent Platform Activity</h3>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <CurrencyDollarIcon className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Course Purchase</p>
                          <p className="text-sm text-gray-600">
                            {transaction.courseName || 'Course'} - ₦{transaction.amount?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {transaction.createdAt?.toDate().toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* User Management Section */}
          {activeSection === 'users' && (
            <div>
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">User Management</h2>
                  <p className="text-gray-600">Manage all platform users, roles, and permissions</p>
                </div>
                <div className="flex gap-4">
                  <select
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Users</option>
                    <option value="student">Students</option>
                    <option value="lecturer">Lecturers</option>
                    <option value="admin">Admins</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* User Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-blue-600">{users.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600">Students</p>
                  <p className="text-2xl font-bold text-green-600">
                    {users.filter(u => u.role === 'student').length}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600">Lecturers</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {users.filter(u => u.role === 'lecturer').length}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600">Suspended</p>
                  <p className="text-2xl font-bold text-red-600">
                    {users.filter(u => u.status === 'suspended').length}
                  </p>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users
                        .filter(user => userFilter === 'all' || user.role === userFilter || user.status === userFilter)
                        .slice(0, 20)
                        .map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.displayName || 'No Name'}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === 'admin' ? 'bg-red-100 text-red-800' :
                              user.role === 'lecturer' ? 'bg-purple-100 text-purple-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {user.status || 'active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            {user.status === 'suspended' ? (
                              <button
                                onClick={() => handleActivateUser(user.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <CheckCircleIcon className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSuspendUser(user.id)}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                <ShieldCheckIcon className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Continue with other sections... */}
          {activeSection === 'approvals' && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Pending Approvals</h2>
                <p className="text-gray-600">Review and approve lecturer applications and course submissions</p>
              </div>

              {/* Approval Tabs */}
              <div className="flex gap-4 mb-6 border-b">
                <button
                  onClick={() => setActiveTab('lecturers')}
                  className={`pb-2 px-4 ${activeTab === 'lecturers' ? 'border-b-2 border-blue-600 font-semibold' : 'text-gray-600'}`}
                >
                  Pending Lecturers ({pendingLecturers.length})
                </button>
                <button
                  onClick={() => setActiveTab('courses')}
                  className={`pb-2 px-4 ${activeTab === 'courses' ? 'border-b-2 border-blue-600 font-semibold' : 'text-gray-600'}`}
                >
                  Pending Courses ({pendingCourses.length})
                </button>
              </div>

              {/* Pending Lecturers */}
              {activeTab === 'lecturers' && (
                <div>
                  {pendingLecturers.length === 0 ? (
                    <div className="bg-gray-50 p-8 rounded-lg text-center">
                      <p className="text-gray-600">No pending lecturer applications</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingLecturers.map(lecturer => (
                        <div key={lecturer.id} className="bg-white border rounded-lg p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{lecturer.displayName}</h3>
                              <p className="text-sm text-gray-600">{lecturer.email}</p>
                              <p className="text-sm text-gray-600">{lecturer.phoneNumber}</p>
                              <p className="text-sm text-gray-600 mt-2">
                                <strong>University:</strong> {lecturer.university}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Department:</strong> {lecturer.department}
                              </p>
                              <div className="mt-3">
                                <p className="text-sm font-medium">Qualifications:</p>
                                <p className="text-sm text-gray-700">{lecturer.qualifications}</p>
                              </div>
                              <div className="mt-2">
                                <p className="text-sm font-medium">Expertise:</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {lecturer.expertise?.map((skill, index) => (
                                    <span key={index} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 ml-4">
                              <button
                                onClick={() => handleApproveLecturer(lecturer.id)}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectLecturer(lecturer.id)}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Pending Courses */}
              {activeTab === 'courses' && (
                <div>
                  {pendingCourses.length === 0 ? (
                    <div className="bg-gray-50 p-8 rounded-lg text-center">
                      <p className="text-gray-600">No pending course reviews</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {pendingCourses.map(course => (
                        <div key={course.id} className="bg-white border rounded-lg overflow-hidden">
                          <img 
                            src={course.thumbnailURL} 
                            alt={course.title}
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-4">
                            <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">by {course.lecturerName}</p>
                            <p className="text-sm text-gray-700 mb-3">{course.description}</p>
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                              <span>{course.category}</span>
                              <span className="font-medium">₦{course.price?.toLocaleString()}</span>
                            </div>
                            <div className="space-y-2">
                              <button
                                onClick={() => handlePreviewCourse(course.id)}
                                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                              >
                                <EyeIcon className="w-4 h-4" />
                                Preview Course
                              </button>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApproveCourse(course.id)}
                                  className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectCourse(course.id)}
                                  className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Placeholder for other sections */}
          {activeSection === 'courses' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Course Management</h2>
              <p className="text-gray-600 mb-8">Manage all courses, categories, and content</p>
              <div className="bg-white p-8 rounded-lg border text-center">
                <AcademicCapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Course management features coming soon...</p>
              </div>
            </div>
          )}

          {activeSection === 'finances' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Financial Management</h2>
              <p className="text-gray-600 mb-8">Monitor transactions, payments, and revenue</p>
              <div className="bg-white p-8 rounded-lg border text-center">
                <CurrencyDollarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Financial management features coming soon...</p>
              </div>
            </div>
          )}

          {activeSection === 'reports' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Reports & Moderation</h2>
              <p className="text-gray-600 mb-8">Handle user reports and moderate content</p>
              <div className="bg-white p-8 rounded-lg border text-center">
                <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Content moderation features coming soon...</p>
              </div>
            </div>
          )}

          {activeSection === 'analytics' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Insights</h2>
              <p className="text-gray-600 mb-8">Detailed platform analytics and performance metrics</p>
              <div className="bg-white p-8 rounded-lg border text-center">
                <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Advanced analytics coming soon...</p>
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h2>
              <p className="text-gray-600 mb-8">Configure platform settings and preferences</p>
              <div className="bg-white p-8 rounded-lg border text-center">
                <CogIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">System configuration features coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
