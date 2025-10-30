import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourse, getLessons } from '../services/firestore';
import { approveCourse, rejectCourse } from '../services/firestore';
import { useToast } from '../components/ui/Toast';
import useAuthStore from '../store/authStore';
import {
  ArrowLeftIcon,
  ArrowDownIcon,
  PlayIcon,
  DocumentTextIcon,
  ClockIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';

export default function AdminCoursePreview() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuthStore();
  const { success, error } = useToast();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseData = await getCourse(courseId);
      if (!courseData) {
        error('Course not found');
        navigate('/admin');
        return;
      }
      
      // Fetch course lessons
      const lessonsData = await getLessons(courseId);
      
      setCourse(courseData);
      setLessons(lessonsData);
      
      // Auto-select first lesson if available
      if (lessonsData.length > 0) {
        setSelectedLesson(lessonsData[0]);
      }
    } catch (err) {
      console.error('Error fetching course data:', err);
      error('Failed to load course data');
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCourse = async () => {
    if (window.confirm('Approve this course for publication?')) {
      try {
        setActionLoading(true);
        await approveCourse(courseId);
        success('Course approved successfully!');
        navigate('/admin?section=approvals&tab=courses');
      } catch (err) {
        error('Error approving course: ' + err.message);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleRejectCourse = async () => {
    const reason = prompt('Enter rejection reason (be specific to help the lecturer improve):');
    if (reason && reason.trim()) {
      try {
        setActionLoading(true);
        await rejectCourse(courseId, reason.trim(), userData?.uid);
        success('Course rejected with feedback. Lecturer can resubmit after addressing issues.');
        navigate('/admin?section=approvals&tab=courses');
      } catch (err) {
        error('Error rejecting course: ' + err.message);
      } finally {
        setActionLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course preview...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Course not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin?section=approvals&tab=courses')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Back to Admin
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Course Preview</h1>
                <p className="text-sm text-gray-600">Review course content for approval</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleRejectCourse}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <XCircleIcon className="w-4 h-4 inline mr-2" />
                Reject
              </button>
              <button
                onClick={handleApproveCourse}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <CheckCircleIcon className="w-4 h-4 inline mr-2" />
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Course Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              {/* Course Thumbnail */}
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img
                  src={course.thumbnailURL}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Course Details */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{course.title}</h2>
                  <p className="text-gray-600">by {course.lecturerName}</p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{course.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium">₦{course.price?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lessons:</span>
                    <span className="font-medium">{lessons.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      course.status === 'published' ? 'bg-green-100 text-green-800' :
                      course.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {course.status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{course.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {selectedLesson ? (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Lesson Header */}
                <div className="p-6 border-b">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-gray-500">
                      Lesson {lessons.findIndex(l => l.id === selectedLesson.id) + 1}
                    </span>
                    {selectedLesson.isPreview && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        FREE PREVIEW
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedLesson.title}</h3>
                  {selectedLesson.description && (
                    <p className="text-gray-600 mt-2">{selectedLesson.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    {selectedLesson.duration && (
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {selectedLesson.duration}
                      </span>
                    )}
                  </div>
                </div>

                {/* Lesson Content */}
                <div className="p-6">
                  {/* Video Content */}
                  {selectedLesson.videoURL && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <VideoCameraIcon className="w-5 h-5 text-blue-600" />
                        <h4 className="font-medium text-gray-900">Video Content</h4>
                      </div>
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <video
                          key={selectedLesson.id}
                          controls
                          className="w-full h-full"
                          poster={course.thumbnailURL}
                          preload="metadata"
                        >
                          <source src={selectedLesson.videoURL} type="video/mp4" />
                          <source src={selectedLesson.videoURL} type="video/webm" />
                          <source src={selectedLesson.videoURL} type="video/ogg" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  )}

                  {/* Document Content */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <DocumentTextIcon className="w-5 h-5 text-green-600" />
                      <h4 className="font-medium text-gray-900">Document Content</h4>
                    </div>
                    
                    {selectedLesson.documentURL ? (
                      <>
                        <div className="relative border rounded-lg overflow-hidden bg-gray-50">
                          <iframe
                            key={selectedLesson.id}
                            src={selectedLesson.documentURL.includes('drive.google.com') 
                              ? selectedLesson.documentURL.replace('/view', '/preview')
                              : selectedLesson.documentURL.includes('.pdf')
                              ? `${selectedLesson.documentURL}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`
                              : selectedLesson.documentURL
                            }
                            className="w-full h-96 bg-white"
                            title="Lesson Document"
                            frameBorder="0"
                            allowFullScreen
                            onError={() => {
                              console.log('PDF iframe failed to load, trying alternative method');
                            }}
                          />
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <a
                              href={selectedLesson.documentURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              <DocumentTextIcon className="w-4 h-4" />
                              Open in new tab
                            </a>
                            <a
                              href={selectedLesson.documentURL}
                              download
                              className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              <ArrowDownIcon className="w-4 h-4" />
                              Download
                            </a>
                          </div>
                          <span className="text-xs text-gray-500">
                            {selectedLesson.documentURL.split('.').pop()?.toUpperCase()} Document
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">No Document Attached</p>
                        <p className="text-gray-500 text-sm mt-1">This lesson doesn't have any document content</p>
                      </div>
                    )}
                  </div>

                  {/* No Content */}
                  {!selectedLesson.videoURL && !selectedLesson.documentURL && (
                    <div className="bg-gray-50 p-8 rounded-lg text-center">
                      <AcademicCapIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No content files attached to this lesson</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <AcademicCapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a lesson to preview its content</p>
              </div>
            )}
          </div>

          {/* Lessons Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">
                Course Lessons ({lessons.length})
              </h3>
              
              {lessons.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No lessons found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-auto">
                  {lessons.map((lesson, index) => (
                    <button
                      key={lesson.id}
                      onClick={() => setSelectedLesson(lesson)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedLesson?.id === lesson.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-500">
                          {index + 1}.
                        </span>
                        <span className="font-medium text-gray-900 text-sm truncate">
                          {lesson.title}
                        </span>
                        {lesson.isPreview && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-1 py-0.5 rounded">
                            FREE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {lesson.videoURL && (
                          <span className="flex items-center gap-1">
                            <VideoCameraIcon className="w-3 h-3" />
                            Video
                          </span>
                        )}
                        {lesson.documentURL && (
                          <span className="flex items-center gap-1">
                            <DocumentTextIcon className="w-3 h-3" />
                            PDF
                          </span>
                        )}
                        {lesson.duration && <span>{lesson.duration}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
