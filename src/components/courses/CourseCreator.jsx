import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { createCourse, addLesson, updateCourse, getStudyGroupsByLecturer, deleteCourse } from '../../services/firestore';
import { 
  uploadCourseThumbnail, 
  uploadCourseVideo, 
  uploadCourseDocument 
} from '../../services/storage';
// import StorageDebug from '../debug/StorageDebug'; // Removed - uploads working!

const CATEGORIES = [
  'Mechanical Engineering',
  'Electrical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Computer Engineering',
  'Petroleum Engineering',
  'Agricultural Engineering',
  'Other'
];

export default function CourseCreator() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [step, setStep] = useState(1); // 1: Course Info, 2: Add Lessons, 3: Study Group, 4: Review
  const [courseId, setCourseId] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [studyGroupSettings, setStudyGroupSettings] = useState({
    action: 'create', // 'create', 'link', or 'skip'
    groupName: '',
    description: '',
    existingGroupId: '',
    autoEnrollment: true,
    allowPeerHelp: true,
    lecturerModerated: true
  });
  const [existingGroups, setExistingGroups] = useState([]);
  const { user, userData, loading: authLoading } = useAuthStore();
  const navigate = useNavigate();

  // Load existing study groups when user selects "link" option
  const loadExistingGroups = async () => {
    if (userData?.uid) {
      try {
        const groups = await getStudyGroupsByLecturer(userData.uid);
        setExistingGroups(groups);
      } catch (error) {
        console.error('Error loading study groups:', error);
      }
    }
  };

  // Load existing groups when action changes to "link"
  useEffect(() => {
    if (studyGroupSettings.action === 'link') {
      loadExistingGroups();
    }
  }, [studyGroupSettings.action, userData?.uid]);

  // Redirect if not authenticated
  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && !userData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">You need to be logged in as a lecturer to create courses.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // If user is logged in but userData is not loaded yet, show loading
  if (user && !userData && !authLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user profile...</p>
        </div>
      </div>
    );
  }

  // Step 1: Create course basic info
  const onCreateCourse = async (data) => {
    setLoading(true);
    setUploadProgress(0);
    
    try {
      // Check if user is authenticated
      const userId = userData?.uid || user?.uid;
      if (!userId) {
        alert('Please log in to create a course');
        navigate('/login');
        return;
      }

      // Validate required fields
      if (!data.thumbnail || data.thumbnail.length === 0) {
        alert('Please select a course thumbnail');
        return;
      }

      // Upload thumbnail using new storage system
      const thumbnailFile = data.thumbnail[0];
      
      const thumbnailResult = await uploadCourseThumbnail(thumbnailFile, (progress) => {
        setUploadProgress(progress);
      });
      const thumbnailURL = thumbnailResult.url;
      
      const courseData = {
        lecturerName: userData?.displayName || userData?.email || user?.email || 'Unknown Lecturer',
        title: data.title,
        description: data.description,
        category: data.category,
        price: parseFloat(data.price),
        thumbnailURL
      };
      
      const result = await createCourse(userId, courseData);
      const newCourseId = result.courseId || result; // Handle both old and new return formats
      
      console.log('Course creation result:', result);
      console.log('Extracted courseId:', newCourseId);
      
      setCourseId(newCourseId);
      setStep(2);
    } catch (error) {
      alert('Error creating course: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Add lesson
  const onAddLesson = async (data) => {
    setLoading(true);
    setUploadProgress(0);
    
    try {
      // Validate courseId
      if (!courseId) {
        throw new Error('No course ID available. Please create a course first.');
      }
      
      // Validate video file
      if (!data.video || data.video.length === 0) {
        throw new Error('Please select a video file');
      }
      
      console.log('Adding lesson to courseId:', courseId, 'Type:', typeof courseId);
      
      // Upload video using new storage system
      const videoFile = data.video[0];
      const videoResult = await uploadCourseVideo(videoFile, (progress) => {
        setUploadProgress(progress);
      });
      
      // Upload resources if any
      const resources = [];
      if (data.resources && data.resources.length > 0) {
        // Convert FileList to Array if needed
        const resourceFiles = Array.from(data.resources);
        
        for (let file of resourceFiles) {
          const resourceResult = await uploadCourseDocument(file, (progress) => {
            // Progress tracking for resource upload
          });
          resources.push({
            name: file.name,
            url: resourceResult.url,
            type: file.type,
            size: resourceResult.bytes || file.size
          });
        }
      }
      
      const lessonData = {
        title: data.lessonTitle || '',
        description: data.lessonDescription || '',
        content: data.content || '',
        videoURL: videoResult.url,
        videoDuration: videoResult.duration || 0,
        resources: resources || [],
        order: lessons.length + 1,
        isPreview: Boolean(data.isPreview)
      };
      
      console.log('Creating lesson with data:', lessonData);
      const lessonId = await addLesson(courseId, lessonData);
      setLessons(prevLessons => [...prevLessons, { id: lessonId, ...lessonData }]);
      
      alert('Lesson added successfully!');
      
      // Reset form safely
      const form = document.getElementById('lesson-form');
      if (form) {
        form.reset();
      }
    } catch (error) {
      console.error('Error adding lesson:', error);
      console.error('Error stack:', error.stack);
      alert('Error adding lesson: ' + error.message);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // Delete course function
  const handleDeleteCourse = async () => {
    if (!courseId) {
      alert('No course to delete');
      return;
    }

    const confirmDelete = window.confirm(
      '⚠️ Are you sure you want to delete this course?\n\n' +
      'This will permanently delete:\n' +
      '• The course and all its lessons\n' +
      '• All uploaded videos and files\n' +
      '• Any study group associated with it\n\n' +
      'This action cannot be undone!'
    );

    if (!confirmDelete) return;

    setLoading(true);
    try {
      await deleteCourse(courseId);
      alert('✅ Course deleted successfully!');
      navigate('/lecturer/dashboard');
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('❌ Error deleting course: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Submit for review
  const submitForReview = async () => {
    if (lessons.length === 0) {
      alert('Please add at least one lesson');
      return;
    }
    
    setLoading(true);
    try {
      // Handle study group creation/linking if needed
      let studyGroupId = null;
      if (studyGroupSettings.action !== 'skip') {
        const userId = userData?.uid || user?.uid;
        
        if (studyGroupSettings.action === 'create') {
          // Create new study group
          const groupData = {
            name: studyGroupSettings.groupName || `${courseId} - Study Group`,
            description: studyGroupSettings.description,
            courseId: courseId,
            courseName: 'Course Title', // We'll need to get this from the course
            lecturerId: userId,
            lecturerName: userData?.displayName || userData?.email || 'Unknown Lecturer',
            autoEnrollment: studyGroupSettings.autoEnrollment,
            allowPeerHelp: studyGroupSettings.allowPeerHelp,
            lecturerModerated: studyGroupSettings.lecturerModerated
          };
          
          const { createStudyGroup } = await import('../../services/firestore');
          studyGroupId = await createStudyGroup(groupData);
          
        } else if (studyGroupSettings.action === 'link' && studyGroupSettings.existingGroupId) {
          // Link to existing study group
          const { linkStudyGroupToCourse } = await import('../../services/firestore');
          await linkStudyGroupToCourse(studyGroupSettings.existingGroupId, courseId, 'Course Title');
          studyGroupId = studyGroupSettings.existingGroupId;
        }
        
        // Update course with study group ID
        if (studyGroupId) {
          await updateCourse(courseId, { 
            studyGroupId: studyGroupId,
            status: 'pending_review'
          });
        } else {
          await updateCourse(courseId, { status: 'pending_review' });
        }
      } else {
        await updateCourse(courseId, { status: 'pending_review' });
      }
      
      alert('Course submitted for admin review!');
      navigate('/lecturer/dashboard');
    } catch (error) {
      console.error('Error submitting course:', error);
      alert('Error submitting course: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="heading-lg text-gray-900 mb-4">Create New Course</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share your engineering expertise with students across Nigeria. Create engaging courses that make a difference.
          </p>
        </div>
        
        {/* Progress Indicator */}
        <div className="card max-w-6xl mx-auto mb-8 animate-slide-up">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div className={`flex items-center transition-all duration-300 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  step >= 1 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <div className="ml-4 hidden sm:block">
                  <div className="font-semibold">Course Info</div>
                  <div className="text-sm opacity-75">Basic details</div>
                </div>
              </div>
              
              <div className={`flex-1 h-2 mx-4 rounded-full transition-all duration-500 ${
                step >= 2 ? 'bg-gradient-to-r from-blue-600 to-green-600' : 'bg-gray-200'
              }`}></div>
              
              <div className={`flex items-center transition-all duration-300 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  step >= 2 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <div className="ml-4 hidden sm:block">
                  <div className="font-semibold">Add Lessons</div>
                  <div className="text-sm opacity-75">Course content</div>
                </div>
              </div>
              
              <div className={`flex-1 h-2 mx-4 rounded-full transition-all duration-500 ${
                step >= 3 ? 'bg-gradient-to-r from-blue-600 to-green-600' : 'bg-gray-200'
              }`}></div>
              
              <div className={`flex items-center transition-all duration-300 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  step >= 3 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  3
                </div>
                <div className="ml-4 hidden sm:block">
                  <div className="font-semibold">Study Group</div>
                  <div className="text-sm opacity-75">Community setup</div>
                </div>
              </div>
              
              <div className={`flex-1 h-2 mx-4 rounded-full transition-all duration-500 ${
                step >= 4 ? 'bg-gradient-to-r from-blue-600 to-green-600' : 'bg-gray-200'
              }`}></div>
              
              <div className={`flex items-center transition-all duration-300 ${step >= 4 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  step >= 4 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  4
                </div>
                <div className="ml-4 hidden sm:block">
                  <div className="font-semibold">Review</div>
                  <div className="text-sm opacity-75">Final review</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Step 1: Course Basic Info */}
      {step === 1 && (
        <form onSubmit={handleSubmit(onCreateCourse)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Course Title</label>
            <input
              type="text"
              {...register('title', { required: 'Title is required' })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="E.g., Advanced Thermodynamics"
            />
            {errors.title && <span className="text-red-500 text-sm">{errors.title.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="5"
              placeholder="What will students learn in this course?"
            />
            {errors.description && <span className="text-red-500 text-sm">{errors.description.message}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <span className="text-red-500 text-sm">{errors.category.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Price (₦)</label>
              <input
                type="number"
                {...register('price', { 
                  required: 'Price is required',
                  min: { value: 1000, message: 'Minimum price is ₦1,000' }
                })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="5000"
              />
              {errors.price && <span className="text-red-500 text-sm">{errors.price.message}</span>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Course Thumbnail</label>
            <input
              type="file"
              accept="image/*"
              {...register('thumbnail', { required: 'Thumbnail is required' })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.thumbnail && <span className="text-red-500 text-sm">{errors.thumbnail.message}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Continue to Add Lessons'}
          </button>
        </form>
      )}

      {/* Step 2: Add Lessons */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm">Course created! Now add lessons to your course.</p>
            <p className="text-sm font-medium mt-2">Lessons added: {lessons.length}</p>
          </div>

          <form id="lesson-form" onSubmit={handleSubmit(onAddLesson)} className="space-y-4 border p-6 rounded-lg">
            <h3 className="text-xl font-semibold">Add New Lesson</h3>

            <div>
              <label className="block text-sm font-medium mb-2">Lesson Title</label>
              <input
                type="text"
                {...register('lessonTitle', { required: 'Lesson title is required' })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.lessonTitle && <span className="text-red-500 text-sm">{errors.lessonTitle.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Lesson Description</label>
              <textarea
                {...register('lessonDescription')}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Video File</label>
              <input
                type="file"
                accept="video/*"
                {...register('video', { required: 'Video is required' })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.video && <span className="text-red-500 text-sm">{errors.video.message}</span>}
            </div>

            {uploadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
                <p className="text-sm text-center mt-1">{Math.round(uploadProgress)}% uploaded</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Additional Resources (optional)</label>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                {...register('resources')}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('isPreview')}
                className="mr-2"
              />
              <label className="text-sm">Make this a free preview lesson</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Add Lesson'}
            </button>
          </form>

          {/* Lessons List */}
          {lessons.length > 0 && (
            <div className="border p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Course Lessons</h3>
              <div className="space-y-2">
                {lessons.map((lesson, index) => (
                  <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{index + 1}. {lesson.title}</p>
                      <p className="text-sm text-gray-600">Duration: {Math.floor(lesson.videoDuration / 60)} minutes</p>
                    </div>
                    {lesson.isPreview && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">FREE PREVIEW</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleDeleteCourse}
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              🗑️ Delete Draft
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              Continue to Study Group Setup
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Study Group Setup */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800">Study Group Setup</h3>
            <p className="text-sm text-purple-700 mt-2">
              Create a study group for your course to foster student collaboration and engagement.
            </p>
          </div>

          <div className="space-y-6">
            {/* Study Group Options */}
            <div>
              <label className="block text-sm font-medium mb-4">Choose Study Group Option</label>
              <div className="space-y-3">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="studyGroupAction"
                    value="create"
                    checked={studyGroupSettings.action === 'create'}
                    onChange={(e) => setStudyGroupSettings(prev => ({ ...prev, action: e.target.value }))}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Create New Study Group</div>
                    <div className="text-sm text-gray-600">Automatically create a study group for this course</div>
                  </div>
                </label>

                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="studyGroupAction"
                    value="link"
                    checked={studyGroupSettings.action === 'link'}
                    onChange={(e) => setStudyGroupSettings(prev => ({ ...prev, action: e.target.value }))}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Link to Existing Study Group</div>
                    <div className="text-sm text-gray-600">Connect this course to an existing study group (for course series)</div>
                  </div>
                </label>

                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="studyGroupAction"
                    value="skip"
                    checked={studyGroupSettings.action === 'skip'}
                    onChange={(e) => setStudyGroupSettings(prev => ({ ...prev, action: e.target.value }))}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Skip Study Group</div>
                    <div className="text-sm text-gray-600">Create course without a study group</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Create New Study Group Options */}
            {studyGroupSettings.action === 'create' && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium">Study Group Details</h4>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Group Name</label>
                  <input
                    type="text"
                    value={studyGroupSettings.groupName}
                    onChange={(e) => setStudyGroupSettings(prev => ({ ...prev, groupName: e.target.value }))}
                    placeholder="e.g., Advanced Mechanical Engineering - Study Group"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                  <textarea
                    value={studyGroupSettings.description}
                    onChange={(e) => setStudyGroupSettings(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the purpose and goals of this study group..."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>

                <div className="space-y-3">
                  <h5 className="font-medium">Group Settings</h5>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={studyGroupSettings.autoEnrollment}
                      onChange={(e) => setStudyGroupSettings(prev => ({ ...prev, autoEnrollment: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Auto-enroll students when they join the course</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={studyGroupSettings.allowPeerHelp}
                      onChange={(e) => setStudyGroupSettings(prev => ({ ...prev, allowPeerHelp: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Allow peer-to-peer help and discussions</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={studyGroupSettings.lecturerModerated}
                      onChange={(e) => setStudyGroupSettings(prev => ({ ...prev, lecturerModerated: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Lecturer moderated discussions</span>
                  </label>
                </div>
              </div>
            )}

            {/* Link to Existing Study Group */}
            {studyGroupSettings.action === 'link' && (
              <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium">Select Existing Study Group</h4>
                <p className="text-sm text-gray-600">Choose from your existing study groups to link this course.</p>
                
                {existingGroups.length > 0 ? (
                  <div className="space-y-2">
                    {existingGroups.map((group) => (
                      <label key={group.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="existingGroup"
                          value={group.id}
                          checked={studyGroupSettings.existingGroupId === group.id}
                          onChange={(e) => setStudyGroupSettings(prev => ({ ...prev, existingGroupId: e.target.value }))}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium">{group.name}</div>
                          <div className="text-sm text-gray-600">{group.memberCount} members</div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No existing study groups found.</p>
                    <p className="text-sm">Create a new study group instead.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300"
            >
              Back to Lessons
            </button>
            <button
              onClick={handleDeleteCourse}
              disabled={loading}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              🗑️ Delete
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              Continue to Review
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review and Submit */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">Review Your Course</h3>
            <p className="text-sm text-green-700 mt-2">
              Please review your course details and lessons before submitting for admin approval.
            </p>
          </div>

          <div className="border p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Course Summary</h3>
            <p className="text-sm text-gray-600">Total Lessons: {lessons.length}</p>
            
            {/* Study Group Summary */}
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-2">Study Group Setup</h4>
              {studyGroupSettings.action === 'create' && (
                <div className="text-sm text-gray-600">
                  <p>✅ New study group will be created</p>
                  <p>Group Name: {studyGroupSettings.groupName || 'Default group name'}</p>
                  <p>Auto-enrollment: {studyGroupSettings.autoEnrollment ? 'Enabled' : 'Disabled'}</p>
                </div>
              )}
              {studyGroupSettings.action === 'link' && (
                <div className="text-sm text-gray-600">
                  <p>✅ Will link to existing study group</p>
                  <p>Selected Group: {existingGroups.find(g => g.id === studyGroupSettings.existingGroupId)?.name || 'None selected'}</p>
                </div>
              )}
              {studyGroupSettings.action === 'skip' && (
                <div className="text-sm text-gray-600">
                  <p>⏭️ No study group will be created</p>
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mt-4">
              Once submitted, your course will be reviewed by our admin team. 
              You'll be notified via email when it's approved or if changes are needed.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(3)}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300"
            >
              Back to Study Group Setup
            </button>
            <button
              onClick={submitForReview}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
