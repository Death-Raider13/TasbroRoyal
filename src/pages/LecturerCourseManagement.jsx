import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  UserGroupIcon,
  ChartBarIcon,
  VideoCameraIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../store/authStore';
import { getCourse, getLessons, updateCourse, deleteLesson, getCourseEnrollmentCount, deleteCourse } from '../services/firestore';
import { useToast } from '../components/ui/Toast';
import BulkLessonManager from '../components/lessons/BulkLessonManager';

export default function LecturerCourseManagement() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuthStore();
  const { info, success, error } = useToast();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    price: 0,
    category: ''
  });

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  // Add a function to refresh data
  const refreshData = () => {
    loadCourseData();
  };

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const [courseData, lessonsData, enrollmentCountData] = await Promise.all([
        getCourse(courseId),
        getLessons(courseId),
        getCourseEnrollmentCount(courseId)
      ]);

      if (!courseData) {
        showToast('Course not found', 'error');
        navigate('/lecturer/dashboard');
        return;
      }

      setCourse(courseData);
      setLessons(lessonsData);
      setEnrollmentCount(enrollmentCountData);
      setCourseData({
        title: courseData.title,
        description: courseData.description,
        price: courseData.price,
        category: courseData.category
      });
    } catch (error) {
      console.error('Error loading course:', error);
      showToast('Failed to load course', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      await updateCourse(courseId, courseData);
      setCourse({ ...course, ...courseData });
      setEditMode(false);
      showToast('Course updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating course:', error);
      showToast('Failed to update course', 'error');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;

    try {
      await deleteLesson(courseId, lessonId);
      setLessons(lessons.filter(l => l.id !== lessonId));
      showToast('Lesson deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting lesson:', error);
      showToast('Failed to delete lesson', 'error');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
          <Link to="/lecturer/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
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
              <h1 className="heading-lg text-gray-900">{course.title}</h1>
              <p className="text-gray-600 mt-2">Manage your course content and settings</p>
            </div>
            <div className="flex gap-3">
              <Link 
                to={`/lecturer/courses/${courseId}/preview`}
                className="btn-outline flex items-center gap-2"
              >
                <EyeIcon className="w-5 h-5" />
                Preview Course
              </Link>
              <button
                onClick={() => setEditMode(!editMode)}
                className="btn-primary flex items-center gap-2"
              >
                <PencilIcon className="w-5 h-5" />
                {editMode ? 'Cancel Edit' : 'Edit Course'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-600 to-blue-700 text-white">
            <div className="card-body text-center">
              <UserGroupIcon className="w-10 h-10 mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">{enrollmentCount}</div>
              <div className="text-blue-100 text-sm">Students Enrolled</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-600 to-green-700 text-white">
            <div className="card-body text-center">
              <VideoCameraIcon className="w-10 h-10 mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">{lessons.length}</div>
              <div className="text-green-100 text-sm">Total Lessons</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-600 to-purple-700 text-white">
            <div className="card-body text-center">
              <ChartBarIcon className="w-10 h-10 mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">{course.rating || 'N/A'}</div>
              <div className="text-purple-100 text-sm">Average Rating</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-yellow-600 to-yellow-700 text-white">
            <div className="card-body text-center">
              <DocumentTextIcon className="w-10 h-10 mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">{formatCurrency(course.price)}</div>
              <div className="text-yellow-100 text-sm">Course Price</div>
            </div>
          </div>
        </div>

        {/* Edit Course Form */}
        {editMode && (
          <div className="card mb-8 animate-slide-down">
            <div className="card-body">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Course Details</h2>
              <form onSubmit={handleUpdateCourse} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
                  <input
                    type="text"
                    value={courseData.title}
                    onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={courseData.description}
                    onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                    rows="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={courseData.category}
                      onChange={(e) => setCourseData({ ...courseData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Chemical Engineering">Chemical Engineering</option>
                      <option value="Computer Engineering">Computer Engineering</option>
                      <option value="Petroleum Engineering">Petroleum Engineering</option>
                      <option value="Agricultural Engineering">Agricultural Engineering</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (₦)</label>
                    <input
                      type="number"
                      value={courseData.price}
                      onChange={(e) => setCourseData({ ...courseData, price: parseFloat(e.target.value) })}
                      min="1000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditMode(false)}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lessons Section */}
        <BulkLessonManager
          lessons={lessons}
          courseId={courseId}
          onLessonsUpdate={loadCourseData}
          onAddLesson={() => {
            info('Redirecting to lesson creation...');
            // In a real implementation, this would open a lesson creation modal or navigate to lesson creation
          }}
          onEditLesson={(lesson) => {
            info(`Editing lesson: ${lesson.title}`);
            // In a real implementation, this would open a lesson editing modal
          }}
        />

        {/* Danger Zone */}
        <div className="mt-8 card border-2 border-red-200">
          <div className="card-body">
            <h3 className="text-lg font-bold text-red-600 mb-3">Danger Zone</h3>
            <p className="text-gray-600 mb-4">
              Once you delete a course, there is no going back. Please be certain.
            </p>
            <button
              onClick={async () => {
                const confirmDelete = window.confirm(
                  '⚠️ Are you sure you want to delete this course?\n\n' +
                  'This will permanently delete:\n' +
                  '• The course and all its lessons\n' +
                  '• All uploaded videos and files\n' +
                  '• Student enrollment data\n\n' +
                  'This action cannot be undone!'
                );
                
                if (confirmDelete) {
                  try {
                    setLoading(true);
                    await deleteCourse(courseId);
                    success('Course deleted successfully!');
                    navigate('/lecturer/dashboard');
                  } catch (err) {
                    console.error('Error deleting course:', err);
                    error('Failed to delete course: ' + err.message);
                  } finally {
                    setLoading(false);
                  }
                }
              }}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete Course'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
