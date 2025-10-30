import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  PlayIcon, 
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  DocumentArrowDownIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import useAuthStore from '../store/authStore';
import { getCourse, getLessons, updateEnrollmentProgress, getEnrollmentByUserAndCourse } from '../services/firestore';
import { useToast } from '../components/ui/Toast';

export default function CourseLearn() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuthStore();
  const toast = useToast();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [enrollment, setEnrollment] = useState(null);

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
        toast.error('Course not found');
        navigate('/courses');
        return;
      }

      setCourse(courseData);
      setLessons(lessonsData);

      // Load enrollment data if user is authenticated
      if (userData?.uid) {
        try {
          const enrollmentData = await getEnrollmentByUserAndCourse(userData.uid, courseId);
          setEnrollment(enrollmentData);
          
          // Set completed lessons from enrollment data
          if (enrollmentData.completedLessons) {
            setCompletedLessons(new Set(enrollmentData.completedLessons));
          }
        } catch (error) {
          console.error('Error loading enrollment:', error);
          // User might not be enrolled, that's okay
          setCompletedLessons(new Set());
        }
      } else {
        setCompletedLessons(new Set());
      }
    } catch (error) {
      console.error('Error loading course:', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const currentLesson = lessons[currentLessonIndex];

  const markLessonComplete = async () => {
    if (!currentLesson || !enrollment) {
      toast.warning('Please enroll in this course to track progress');
      return;
    }

    const newCompleted = new Set(completedLessons);
    newCompleted.add(currentLesson.id);
    setCompletedLessons(newCompleted);

    try {
      // Update progress in database using enrollment ID and lesson ID
      await updateEnrollmentProgress(enrollment.id, currentLesson.id);
      toast.success('Lesson marked as complete!');

      // Auto-advance to next lesson
      if (currentLessonIndex < lessons.length - 1) {
        setTimeout(() => {
          setCurrentLessonIndex(currentLessonIndex + 1);
        }, 1000);
      } else {
        toast.success('Congratulations! You completed the course! 🎉');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
      
      // Revert the local state change if database update failed
      const revertedCompleted = new Set(completedLessons);
      revertedCompleted.delete(currentLesson.id);
      setCompletedLessons(revertedCompleted);
    }
  };

  const goToLesson = (index) => {
    setCurrentLessonIndex(index);
    setSidebarOpen(false); // Close sidebar on mobile
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const goToNextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300 font-medium">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course || lessons.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Course Not Available</h2>
          <Link to="/courses" className="btn-primary">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const progress = Math.round((completedLessons.size / lessons.length) * 100);

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-gray-300 hover:text-white"
          >
            {sidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
          <Link 
            to={`/courses/${courseId}`}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Exit Course</span>
          </Link>
        </div>
        
        <div className="flex-1 max-w-2xl mx-4">
          <h1 className="text-white font-semibold truncate text-sm sm:text-base">{course.title}</h1>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-gray-400 text-sm font-medium">{progress}%</span>
          </div>
        </div>

        <div className="text-gray-400 text-sm hidden md:block">
          Lesson {currentLessonIndex + 1} of {lessons.length}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Lessons List */}
        <aside className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:relative z-30 w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto transition-transform duration-300`}>
          <div className="p-4">
            <h2 className="text-white font-bold text-lg mb-4">Course Content</h2>
            <div className="space-y-2">
              {lessons.map((lesson, index) => {
                const isCompleted = completedLessons.has(lesson.id);
                const isCurrent = index === currentLessonIndex;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => goToLesson(index)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-750 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {isCompleted ? (
                          <CheckCircleSolid className="w-5 h-5 text-green-400" />
                        ) : (
                          <div className={`w-5 h-5 rounded-full border-2 ${
                            isCurrent ? 'border-white' : 'border-gray-500'
                          }`}></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold mb-1 opacity-75">
                          Lesson {index + 1}
                        </div>
                        <div className="font-medium text-sm line-clamp-2">
                          {lesson.title}
                        </div>
                        {lesson.videoDuration && (
                          <div className="text-xs mt-1 opacity-75">
                            {Math.floor(lesson.videoDuration / 60)} min
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-black">
          {currentLesson && (
            <div className="max-w-6xl mx-auto">
              {/* Video Player */}
              <div className="relative bg-black aspect-video">
                {currentLesson.videoURL ? (
                  <video
                    key={currentLesson.id}
                    controls
                    className="w-full h-full"
                    src={currentLesson.videoURL}
                    onEnded={markLessonComplete}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-800">
                    <div className="text-center text-gray-400">
                      <PlayIcon className="w-16 h-16 mx-auto mb-4" />
                      <p>Video not available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Lesson Info */}
              <div className="bg-gray-900 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {currentLesson.title}
                    </h2>
                    {currentLesson.description && (
                      <p className="text-gray-400">{currentLesson.description}</p>
                    )}
                  </div>
                  {!completedLessons.has(currentLesson.id) && (
                    <button
                      onClick={markLessonComplete}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-semibold"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                      Mark Complete
                    </button>
                  )}
                </div>

                {/* Resources */}
                {currentLesson.resources && currentLesson.resources.length > 0 && (
                  <div className="mt-6 border-t border-gray-700 pt-6">
                    <h3 className="text-white font-bold mb-3">Lesson Resources</h3>
                    <div className="space-y-2">
                      {currentLesson.resources.map((resource, index) => (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                        >
                          <DocumentArrowDownIcon className="w-5 h-5 text-blue-400" />
                          <div className="flex-1">
                            <div className="text-white font-medium">{resource.name}</div>
                            <div className="text-gray-400 text-sm">
                              {resource.type} • {Math.round(resource.size / 1024)} KB
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="mt-8 flex items-center justify-between border-t border-gray-700 pt-6">
                  <button
                    onClick={goToPreviousLesson}
                    disabled={currentLessonIndex === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                    Previous
                  </button>
                  <button
                    onClick={goToNextLesson}
                    disabled={currentLessonIndex === lessons.length - 1}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Next
                    <ArrowRightIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
