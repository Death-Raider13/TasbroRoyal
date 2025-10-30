import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { getCourses, getCourseEnrollmentCount, getCourseRejectionDetails, resubmitCourse } from '../services/firestore';
import { useToast } from '../components/ui/Toast';

export default function LecturerDashboard() {
  const { userData } = useAuthStore();
  const { success, error } = useToast();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRevenue: 0,
    pendingCourses: 0,
    rejectedCourses: 0
  });
  const [loading, setLoading] = useState(true);
  const [rejectionDetails, setRejectionDetails] = useState({});

  useEffect(() => {
    if (userData.approved) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [userData.uid, userData.approved]);

  const fetchData = async () => {
    try {
      // Fetch lecturer's courses
      const coursesData = await getCourses({ lecturerId: userData.uid });
      
      // Fetch real enrollment counts for each course
      const coursesWithEnrollments = await Promise.all(
        coursesData.map(async (course) => {
          const enrollmentCount = await getCourseEnrollmentCount(course.id);
          return {
            ...course,
            actualEnrollments: enrollmentCount,
            totalStudents: enrollmentCount // Update the totalStudents field with real data
          };
        })
      );
      
      setCourses(coursesWithEnrollments);

      // Fetch rejection details for rejected courses
      const rejectedCourses = coursesWithEnrollments.filter(c => c.status === 'rejected');
      const rejectionDetailsData = {};
      
      for (const course of rejectedCourses) {
        const details = await getCourseRejectionDetails(course.id);
        if (details) {
          rejectionDetailsData[course.id] = details;
        }
      }
      
      setRejectionDetails(rejectionDetailsData);

      // Calculate stats using real enrollment data
      const totalStudents = coursesWithEnrollments.reduce((sum, course) => sum + (course.actualEnrollments || 0), 0);
      const totalRevenue = coursesWithEnrollments.reduce((sum, course) => sum + (course.totalRevenue || 0), 0);
      const pendingCourses = coursesWithEnrollments.filter(c => c.status === 'pending_review').length;
      const rejectedCoursesCount = rejectedCourses.length;

      setStats({
        totalStudents,
        totalRevenue: totalRevenue * 0.75, // 75% commission
        pendingCourses,
        rejectedCourses: rejectedCoursesCount
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResubmitCourse = async (courseId, courseTitle) => {
    if (window.confirm(`Are you sure you want to resubmit "${courseTitle}" for review? Make sure you've addressed the rejection feedback.`)) {
      try {
        await resubmitCourse(courseId);
        success('Course resubmitted successfully! It will be reviewed again.');
        fetchData(); // Refresh the data
      } catch (err) {
        error('Error resubmitting course: ' + err.message);
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!userData.approved) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Application Under Review</h2>
          <p className="text-gray-700 mb-2">
            Your lecturer application is currently being reviewed by our admin team.
          </p>
          <p className="text-gray-600">
            You will receive an email notification once your application is approved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Lecturer Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your courses and earnings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600">Total Courses</p>
          <p className="text-3xl font-bold text-blue-600">{courses.length}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600">Total Students</p>
          <p className="text-3xl font-bold text-green-600">{stats.totalStudents}</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600">Total Earnings</p>
          <p className="text-3xl font-bold text-purple-600">₦{stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-orange-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600">Pending Review</p>
          <p className="text-3xl font-bold text-orange-600">{stats.pendingCourses}</p>
        </div>
        <div className="bg-red-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600">Rejected Courses</p>
          <p className="text-3xl font-bold text-red-600">{stats.rejectedCourses}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <Link 
          to="/lecturer/create-course"
          className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition text-center"
        >
          <p className="text-xl font-semibold">Create New Course</p>
          <p className="text-sm mt-2 opacity-90">Start teaching a new subject</p>
        </Link>

        <Link 
          to="/lecturer/analytics"
          className="bg-indigo-600 text-white p-6 rounded-lg hover:bg-indigo-700 transition text-center"
        >
          <p className="text-xl font-semibold">View Analytics</p>
          <p className="text-sm mt-2 opacity-90">Track course performance</p>
        </Link>

        <Link 
          to="/lecturer/marketing"
          className="bg-orange-600 text-white p-6 rounded-lg hover:bg-orange-700 transition text-center"
        >
          <p className="text-xl font-semibold">Marketing Tools</p>
          <p className="text-sm mt-2 opacity-90">Promote your courses</p>
        </Link>

        <Link 
          to="/lecturer/messages"
          className="bg-pink-600 text-white p-6 rounded-lg hover:bg-pink-700 transition text-center"
        >
          <p className="text-xl font-semibold">Messages</p>
          <p className="text-sm mt-2 opacity-90">Chat with students</p>
        </Link>

        <Link 
          to="/lecturer/earnings"
          className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition text-center"
        >
          <p className="text-xl font-semibold">View Earnings</p>
          <p className="text-sm mt-2 opacity-90">Available: ₦{userData.pendingWithdrawal?.toLocaleString() || 0}</p>
        </Link>

        <Link 
          to="/lecturer/questions"
          className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition text-center"
        >
          <p className="text-xl font-semibold">Answer Questions</p>
          <p className="text-sm mt-2 opacity-90">Help your students learn</p>
        </Link>

        <Link 
          to="/lecturer/live-sessions"
          className="bg-indigo-600 text-white p-6 rounded-lg hover:bg-indigo-700 transition text-center"
        >
          <p className="text-xl font-semibold">Live Sessions</p>
          <p className="text-sm mt-2 opacity-90">Schedule & conduct live classes</p>
        </Link>
      </div>

      {/* Profile & Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Profile & Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/lecturer/profile"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Manage Profile</h4>
              <p className="text-sm text-gray-600">Update your public profile</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg opacity-50">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-400">Account Settings</h4>
              <p className="text-sm text-gray-400">Coming soon</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg opacity-50">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-400">Privacy & Security</h4>
              <p className="text-sm text-gray-400">Coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* My Courses */}
      <div>
        <h2 className="text-2xl font-bold mb-4">My Courses</h2>

        {courses.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-600 mb-4">You haven't created any courses yet.</p>
            <Link 
              to="/lecturer/create-course"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                <img 
                  src={course.thumbnailURL} 
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      course.status === 'approved' ? 'bg-green-100 text-green-600' :
                      course.status === 'pending_review' ? 'bg-yellow-100 text-yellow-600' :
                      course.status === 'rejected' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {course.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span>{course.totalStudents} students</span>
                    <span>₦{course.price.toLocaleString()}</span>
                  </div>

                  {/* Rejection Details */}
                  {course.status === 'rejected' && rejectionDetails[course.id] && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2 mb-2">
                        <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                          <p className="text-sm text-red-700 mt-1">{rejectionDetails[course.id].rejectionReason}</p>
                          {rejectionDetails[course.id].rejectedAt && (
                            <p className="text-xs text-red-600 mt-1">
                              Rejected on {new Date(rejectionDetails[course.id].rejectedAt.seconds * 1000).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {rejectionDetails[course.id].canResubmit && (
                        <button
                          onClick={() => handleResubmitCourse(course.id, course.title)}
                          className="w-full bg-orange-600 text-white text-sm py-2 px-3 rounded hover:bg-orange-700 transition"
                        >
                          Resubmit for Review
                          {rejectionDetails[course.id].resubmissionCount > 0 && (
                            <span className="ml-1 text-xs opacity-75">
                              (Attempt #{rejectionDetails[course.id].resubmissionCount + 1})
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link 
                      to={`/lecturer/courses/${course.id}/preview`}
                      className="flex-1 bg-gray-600 text-white text-center py-2 rounded-lg hover:bg-gray-700 transition text-sm"
                    >
                      Preview
                    </Link>
                    <Link 
                      to={`/lecturer/courses/${course.id}`}
                      className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      Manage
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
