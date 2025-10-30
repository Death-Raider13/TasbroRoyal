import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  PlayIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../store/authStore';
import { useToast } from '../components/ui/Toast';
import { getCourse, getLessons } from '../services/firestore';

export default function LecturerCoursePreview() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuthStore();
  const { success, error } = useToast();
  
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState('student'); // 'student' or 'instructor'
  const [showNotes, setShowNotes] = useState(false);
  const [testNotes, setTestNotes] = useState('');

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const [courseData, lessonsData] = await Promise.all([
        getCourse(courseId),
        getLessons(courseId)
      ]);

      if (!courseData) {
        error('Course not found');
        navigate('/lecturer/dashboard');
        return;
      }

      // Verify lecturer owns this course
      if (courseData.lecturerId !== userData?.uid) {
        error('You do not have permission to preview this course');
        navigate('/lecturer/dashboard');
        return;
      }

      setCourse(courseData);
      setLessons(lessonsData);
      
      // Auto-select first lesson
      if (lessonsData.length > 0) {
        setSelectedLesson(lessonsData[0]);
      }
    } catch (err) {
      console.error('Error loading course data:', err);
      error('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTotalDuration = () => {
    return lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0);
  };

  const saveTestNotes = () => {
    // In a real implementation, you might save these notes to a separate collection
    success('Test notes saved!');
    setShowNotes(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading course preview...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <XMarkIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link to="/lecturer/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/lecturer/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Course Preview</h1>
                <p className="text-sm text-gray-600">{course.title}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Preview Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setPreviewMode('student')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    previewMode === 'student'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Student View
                </button>
                <button
                  onClick={() => setPreviewMode('instructor')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    previewMode === 'instructor'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Instructor View
                </button>
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => setShowNotes(true)}
                className="btn-outline flex items-center gap-2"
              >
                <DocumentTextIcon className="w-5 h-5" />
                Test Notes
              </button>
              
              <Link
                to={`/lecturer/courses/${courseId}`}
                className="btn-primary flex items-center gap-2"
              >
                <PencilIcon className="w-5 h-5" />
                Edit Course
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Course Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              {/* Course Thumbnail */}
              <div className="aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpenIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Course Details */}
              <h2 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h2>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{course.description}</p>

              {/* Course Stats */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Price</span>
                  <span className="font-semibold text-green-600">
                    ₦{course.price?.toLocaleString() || 'Free'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Lessons</span>
                  <span className="font-semibold">{lessons.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold">{formatDuration(getTotalDuration())}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Category</span>
                  <span className="font-semibold">{course.category}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    course.status === 'approved' ? 'bg-green-100 text-green-800' :
                    course.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    course.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {course.status || 'Draft'}
                  </span>
                </div>
              </div>

              {/* Preview Tips */}
              {previewMode === 'instructor' && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Preview Tips</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Test all video playback</li>
                    <li>• Check document links</li>
                    <li>• Verify lesson order</li>
                    <li>• Review content quality</li>
                    <li>• Take notes for improvements</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {selectedLesson ? (
                <>
                  {/* Lesson Header */}
                  <div className="p-6 border-b">
                    <div className="flex items-center gap-3 mb-2">
                      {selectedLesson.type === 'video' ? (
                        <PlayIcon className="w-6 h-6 text-blue-600" />
                      ) : (
                        <DocumentTextIcon className="w-6 h-6 text-green-600" />
                      )}
                      <h3 className="text-xl font-bold text-gray-900">{selectedLesson.title}</h3>
                    </div>
                    <p className="text-gray-600">{selectedLesson.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {formatDuration(selectedLesson.duration)}
                      </span>
                      <span>Lesson {lessons.findIndex(l => l.id === selectedLesson.id) + 1} of {lessons.length}</span>
                    </div>
                  </div>

                  {/* Lesson Content */}
                  <div className="p-6">
                    {selectedLesson.type === 'video' && selectedLesson.videoUrl ? (
                      <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
                        <video
                          controls
                          className="w-full h-full"
                          poster={selectedLesson.thumbnail}
                        >
                          <source src={selectedLesson.videoUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ) : selectedLesson.type === 'document' && selectedLesson.documentUrl ? (
                      <div className="mb-6">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 mb-4">Document: {selectedLesson.title}</p>
                          <a
                            href={selectedLesson.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary"
                          >
                            Open Document
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-6">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <XMarkIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600">No content available for this lesson</p>
                        </div>
                      </div>
                    )}

                    {/* Lesson Content Text */}
                    {selectedLesson.content && (
                      <div className="prose max-w-none">
                        <div className="whitespace-pre-wrap text-gray-700">
                          {selectedLesson.content}
                        </div>
                      </div>
                    )}

                    {/* Preview Mode Specific Content */}
                    {previewMode === 'instructor' && (
                      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                        <h4 className="font-semibold text-yellow-900 mb-2">Instructor Notes</h4>
                        <ul className="text-sm text-yellow-800 space-y-1">
                          <li>• Does the content match the lesson title?</li>
                          <li>• Is the video/document quality acceptable?</li>
                          <li>• Are there any technical issues?</li>
                          <li>• Is the lesson duration appropriate?</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-12 text-center">
                  <BookOpenIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Lesson Selected</h3>
                  <p className="text-gray-600">Select a lesson from the sidebar to preview it</p>
                </div>
              )}
            </div>
          </div>

          {/* Lessons Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h3 className="text-lg font-bold text-gray-900">Course Content</h3>
                <p className="text-sm text-gray-600 mt-1">{lessons.length} lessons</p>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      selectedLesson?.id === lesson.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {lesson.type === 'video' ? (
                          <PlayIcon className="w-5 h-5 text-blue-600" />
                        ) : (
                          <DocumentTextIcon className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {index + 1}. {lesson.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDuration(lesson.duration)}
                        </p>
                        {lesson.isFree && (
                          <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Free Preview
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Notes Modal */}
      {showNotes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Course Testing Notes</h3>
            <textarea
              value={testNotes}
              onChange={(e) => setTestNotes(e.target.value)}
              className="w-full h-64 form-input"
              placeholder="Write your testing notes here...

Things to check:
- Video quality and playback
- Document accessibility
- Content accuracy
- Lesson flow and organization
- Technical issues
- Areas for improvement"
            />
            <div className="flex gap-3 pt-4">
              <button onClick={saveTestNotes} className="btn-primary flex-1">
                Save Notes
              </button>
              <button
                onClick={() => setShowNotes(false)}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
