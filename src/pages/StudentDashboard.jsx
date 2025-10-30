import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { getEnrollments, getCourse, syncEnrollmentProgress } from '../services/firestore';

export default function StudentDashboard() {
  const { userData } = useAuthStore();
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData?.uid) {
      fetchEnrollments();
    } else {
      setLoading(false);
    }
  }, [userData?.uid]);

  const fetchEnrollments = async () => {
    if (!userData?.uid) {
      setLoading(false);
      return;
    }

    try {
      const enrollmentsData = await getEnrollments(userData.uid);
      
      // Sync progress for all enrollments to ensure accuracy
      const syncedEnrollments = await Promise.all(
        enrollmentsData.map(async (enrollment) => {
          try {
            const correctProgress = await syncEnrollmentProgress(enrollment.id);
            return { ...enrollment, progress: correctProgress };
          } catch (error) {
            console.error(`Error syncing progress for enrollment ${enrollment.id}:`, error);
            return enrollment; // Return original if sync fails
          }
        })
      );
      
      setEnrollments(syncedEnrollments);

      // Fetch course details for each enrollment
      const coursesData = await Promise.all(
        syncedEnrollments.map(enrollment => getCourse(enrollment.courseId))
      );
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
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
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {userData.displayName}!</h1>
        <p className="text-gray-600 mt-2">Continue your learning journey</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600">Enrolled Courses</p>
          <p className="text-3xl font-bold text-blue-600">{enrollments.length}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600">Completed Courses</p>
          <p className="text-3xl font-bold text-green-600">
            {enrollments.filter(e => e.progress === 100).length}
          </p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600">Certificates Earned</p>
          <p className="text-3xl font-bold text-purple-600">
            {enrollments.filter(e => e.progress === 100).length}
          </p>
        </div>
      </div>

      {/* Continue Learning */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Continue Learning</h2>
          <Link to="/courses" className="text-blue-600 hover:underline">
            Browse All Courses
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet.</p>
            <Link 
              to="/courses" 
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Explore Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment, index) => {
              const course = courses[index];
              if (!course) return null;

              return (
                <div key={enrollment.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                  <img 
                    src={course.thumbnailURL} 
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">by {course.lecturerName}</p>
                    
                    {/* Progress Bar */}
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
                      className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700"
                    >
                      {enrollment.progress === 0 ? 'Start Learning' : 'Continue'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link 
          to="/study-groups" 
          className="border p-6 rounded-lg hover:shadow-lg transition"
        >
          <h3 className="font-semibold text-lg mb-2">My Study Groups</h3>
          <p className="text-gray-600 text-sm">Collaborate with peers and lecturers</p>
        </Link>

        <Link 
          to="/certificates" 
          className="border p-6 rounded-lg hover:shadow-lg transition"
        >
          <h3 className="font-semibold text-lg mb-2">My Certificates</h3>
          <p className="text-gray-600 text-sm">View and download your certificates</p>
        </Link>
      </div>
    </div>
  );
}
