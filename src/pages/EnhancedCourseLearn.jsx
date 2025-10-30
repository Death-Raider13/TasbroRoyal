import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  PlayIcon, 
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  DocumentArrowDownIcon,
  Bars3Icon,
  XMarkIcon,
  BookmarkIcon,
  PencilIcon,
  ClockIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  EyeIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  Cog6ToothIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleSolid, 
  BookmarkIcon as BookmarkSolid,
  StarIcon as StarSolid 
} from '@heroicons/react/24/solid';
import useAuthStore from '../store/authStore';
import { 
  getCourse, 
  getLessons, 
  updateEnrollmentProgress, 
  getEnrollmentByUserAndCourse 
} from '../services/firestore';
import { useToast } from '../components/ui/Toast';

export default function EnhancedCourseLearn() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuthStore();
  const { success, error } = useToast();
  const videoRef = useRef(null);

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [bookmarkedLessons, setBookmarkedLessons] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [enrollment, setEnrollment] = useState(null);
  
  // Enhanced features state
  const [notes, setNotes] = useState({});
  const [currentNote, setCurrentNote] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [totalWatchTime, setTotalWatchTime] = useState(0);
  const [lessonRating, setLessonRating] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  useEffect(() => {
    // Load saved notes and bookmarks from localStorage
    const savedNotes = localStorage.getItem(`course_${courseId}_notes`);
    const savedBookmarks = localStorage.getItem(`course_${courseId}_bookmarks`);
    const savedWatchTime = localStorage.getItem(`course_${courseId}_watchTime`);
    
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
    if (savedBookmarks) {
      setBookmarkedLessons(new Set(JSON.parse(savedBookmarks)));
    }
    if (savedWatchTime) {
      setTotalWatchTime(parseInt(savedWatchTime));
    }
  }, [courseId]);

  useEffect(() => {
    // Save notes to localStorage
    localStorage.setItem(`course_${courseId}_notes`, JSON.stringify(notes));
  }, [notes, courseId]);

  useEffect(() => {
    // Save bookmarks to localStorage
    localStorage.setItem(`course_${courseId}_bookmarks`, JSON.stringify([...bookmarkedLessons]));
  }, [bookmarkedLessons, courseId]);

  useEffect(() => {
    // Save watch time to localStorage
    localStorage.setItem(`course_${courseId}_watchTime`, totalWatchTime.toString());
  }, [totalWatchTime, courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const [courseData, lessonsData] = await Promise.all([
        getCourse(courseId),
        getLessons(courseId)
      ]);

      if (!courseData) {
        error('Course not found');
        navigate('/courses');
        return;
      }

      setCourse(courseData);
      setLessons(lessonsData);

      // Load enrollment data
      if (userData?.uid) {
        const enrollmentData = await getEnrollmentByUserAndCourse(userData.uid, courseId);
        if (enrollmentData) {
          setEnrollment(enrollmentData);
          setCompletedLessons(new Set(enrollmentData.completedLessons || []));
        }
      }
    } catch (err) {
      console.error('Error loading course data:', err);
      error('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const markLessonComplete = async (lessonId) => {
    if (!userData?.uid || completedLessons.has(lessonId)) return;

    try {
      const newCompletedLessons = new Set([...completedLessons, lessonId]);
      setCompletedLessons(newCompletedLessons);

      await updateEnrollmentProgress(userData.uid, courseId, [...newCompletedLessons]);
      
      success('Lesson marked as complete!');
      
      // Auto-advance to next lesson
      if (currentLessonIndex < lessons.length - 1) {
        setTimeout(() => {
          setCurrentLessonIndex(currentLessonIndex + 1);
        }, 1500);
      }
    } catch (err) {
      console.error('Error marking lesson complete:', err);
      error('Failed to update progress');
    }
  };

  const toggleBookmark = (lessonId) => {
    const newBookmarks = new Set(bookmarkedLessons);
    if (newBookmarks.has(lessonId)) {
      newBookmarks.delete(lessonId);
      success('Bookmark removed');
    } else {
      newBookmarks.add(lessonId);
      success('Lesson bookmarked');
    }
    setBookmarkedLessons(newBookmarks);
  };

  const saveNote = (lessonId) => {
    if (!currentNote.trim()) return;
    
    const timestamp = new Date().toISOString();
    const newNotes = {
      ...notes,
      [lessonId]: [
        ...(notes[lessonId] || []),
        {
          id: Date.now(),
          content: currentNote,
          timestamp,
          videoTime: watchTime
        }
      ]
    };
    
    setNotes(newNotes);
    setCurrentNote('');
    success('Note saved');
  };

  const deleteNote = (lessonId, noteId) => {
    const newNotes = {
      ...notes,
      [lessonId]: notes[lessonId].filter(note => note.id !== noteId)
    };
    setNotes(newNotes);
    success('Note deleted');
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setWatchTime(videoRef.current.currentTime);
      setTotalWatchTime(prev => prev + 1);
    }
  };

  const handlePlaybackSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    setMuted(!muted);
    if (videoRef.current) {
      videoRef.current.muted = !muted;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const rateLession = async (rating) => {
    setLessonRating(rating);
    success(`Rated ${rating} stars`);
    // In a real app, you'd save this to the database
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatWatchTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course || lessons.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AcademicCapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No lessons available</h2>
          <p className="text-gray-400 mb-4">This course doesn't have any lessons yet.</p>
          <Link
            to="/courses"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const currentLesson = lessons[currentLessonIndex];
  const progress = (completedLessons.size / lessons.length) * 100;

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-gray-800 border-r border-gray-700 overflow-hidden`}>
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white truncate">{course.title}</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 text-gray-400 hover:text-white lg:hidden"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-blue-400 font-semibold">{completedLessons.size}</div>
              <div className="text-gray-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 font-semibold">{formatWatchTime(totalWatchTime)}</div>
              <div className="text-gray-400">Watch Time</div>
            </div>
          </div>
        </div>

        {/* Lessons List */}
        <div className="flex-1 overflow-y-auto">
          {lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors ${
                index === currentLessonIndex ? 'bg-gray-700 border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => setCurrentLessonIndex(index)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {completedLessons.has(lesson.id) ? (
                    <CheckCircleSolid className="w-5 h-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-500"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-white truncate">
                      {lesson.title}
                    </h4>
                    <div className="flex items-center space-x-1">
                      {bookmarkedLessons.has(lesson.id) && (
                        <BookmarkSolid className="w-4 h-4 text-yellow-500" />
                      )}
                      {lesson.contentType === 'video' ? (
                        <VideoCameraIcon className="w-4 h-4 text-gray-400" />
                      ) : (
                        <DocumentTextIcon className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Lesson {index + 1}</span>
                    {lesson.duration && (
                      <span>{Math.ceil(lesson.duration / 60)} min</span>
                    )}
                  </div>
                  
                  {notes[lesson.id] && notes[lesson.id].length > 0 && (
                    <div className="mt-1 text-xs text-blue-400">
                      {notes[lesson.id].length} note{notes[lesson.id].length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <Bars3Icon className="w-5 h-5" />
                </button>
              )}
              
              <div>
                <h1 className="text-xl font-semibold text-white">{currentLesson?.title}</h1>
                <p className="text-sm text-gray-400">
                  Lesson {currentLessonIndex + 1} of {lessons.length}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Bookmark Button */}
              <button
                onClick={() => toggleBookmark(currentLesson.id)}
                className={`p-2 rounded-lg transition-colors ${
                  bookmarkedLessons.has(currentLesson.id)
                    ? 'text-yellow-500 bg-yellow-500/10'
                    : 'text-gray-400 hover:text-yellow-500'
                }`}
              >
                {bookmarkedLessons.has(currentLesson.id) ? (
                  <BookmarkSolid className="w-5 h-5" />
                ) : (
                  <BookmarkIcon className="w-5 h-5" />
                )}
              </button>

              {/* Notes Button */}
              <button
                onClick={() => setShowNotes(!showNotes)}
                className={`p-2 rounded-lg transition-colors ${
                  showNotes ? 'text-blue-500 bg-blue-500/10' : 'text-gray-400 hover:text-blue-500'
                }`}
              >
                <PencilIcon className="w-5 h-5" />
              </button>

              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-colors ${
                  showSettings ? 'text-gray-300 bg-gray-700' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Cog6ToothIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Video/Content Area */}
          <div className="flex-1 bg-black relative">
            {currentLesson?.contentType === 'video' && currentLesson?.videoUrl ? (
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  src={currentLesson.videoUrl}
                  controls
                  className="w-full h-full"
                  onTimeUpdate={handleVideoTimeUpdate}
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      videoRef.current.playbackRate = playbackSpeed;
                      videoRef.current.volume = volume;
                      videoRef.current.muted = muted;
                    }
                  }}
                />
                
                {/* Custom Video Controls Overlay */}
                <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                  <button
                    onClick={toggleMute}
                    className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
                  >
                    {muted ? (
                      <SpeakerXMarkIcon className="w-5 h-5" />
                    ) : (
                      <SpeakerWaveIcon className="w-5 h-5" />
                    )}
                  </button>
                  
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
                  >
                    {fullscreen ? (
                      <ArrowsPointingInIcon className="w-5 h-5" />
                    ) : (
                      <ArrowsPointingOutIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            ) : currentLesson?.documentUrl ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Document Lesson</h3>
                  <p className="text-gray-400 mb-4">Click below to view the lesson document</p>
                  <a
                    href={currentLesson.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                    Open Document
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <EyeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Content Available</h3>
                  <p className="text-gray-400">This lesson doesn't have any content yet.</p>
                </div>
              </div>
            )}

            {/* Settings Panel */}
            {showSettings && (
              <div className="absolute top-4 right-4 bg-gray-800 rounded-lg p-4 shadow-xl border border-gray-700 w-64">
                <h4 className="text-white font-semibold mb-3">Playback Settings</h4>
                
                {/* Playback Speed */}
                <div className="mb-4">
                  <label className="text-sm text-gray-400 mb-2 block">Playback Speed</label>
                  <div className="flex space-x-2">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                      <button
                        key={speed}
                        onClick={() => handlePlaybackSpeedChange(speed)}
                        className={`px-2 py-1 text-xs rounded ${
                          playbackSpeed === speed
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Volume */}
                <div className="mb-4">
                  <label className="text-sm text-gray-400 mb-2 block">Volume</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Lesson Rating */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Rate this lesson</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => rateLession(star)}
                        className="text-yellow-500 hover:text-yellow-400"
                      >
                        {star <= lessonRating ? (
                          <StarSolid className="w-5 h-5" />
                        ) : (
                          <StarIcon className="w-5 h-5" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes Panel */}
          {showNotes && (
            <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Notes</h3>
                
                {/* Add Note */}
                <div className="space-y-2">
                  <textarea
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    placeholder="Add a note..."
                    className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                    rows="3"
                  />
                  <button
                    onClick={() => saveNote(currentLesson.id)}
                    disabled={!currentNote.trim()}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Save Note
                  </button>
                </div>
              </div>

              {/* Notes List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notes[currentLesson.id]?.map(note => (
                  <div key={note.id} className="bg-gray-700 rounded-lg p-3">
                    <p className="text-white text-sm mb-2">{note.content}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{formatTime(note.videoTime)}</span>
                      <button
                        onClick={() => deleteNote(currentLesson.id, note.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-400 text-center">No notes for this lesson yet.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentLessonIndex(Math.max(0, currentLessonIndex - 1))}
                disabled={currentLessonIndex === 0}
                className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Previous
              </button>

              <button
                onClick={() => setCurrentLessonIndex(Math.min(lessons.length - 1, currentLessonIndex + 1))}
                disabled={currentLessonIndex === lessons.length - 1}
                className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {!completedLessons.has(currentLesson.id) && (
                <button
                  onClick={() => markLessonComplete(currentLesson.id)}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Mark Complete
                </button>
              )}

              <Link
                to="/student/dashboard"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
