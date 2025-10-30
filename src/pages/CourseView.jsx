import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getCourse, getLessons } from '../services/firestore';
import { trackAffiliateClick } from '../services/marketing';
import { Clock, BookOpen, Users, Award } from 'lucide-react';
import CheckoutModal from '../components/payment/CheckoutModal';
import useAuthStore from '../store/authStore';

export default function CourseView() {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState(null);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchCourseData();
    
    // Check for affiliate referral code
    const refCode = searchParams.get('ref');
    if (refCode) {
      setAffiliateCode(refCode);
      trackAffiliateClick(refCode);
      console.log('Affiliate click tracked for:', refCode);
    }
  }, [courseId, searchParams]);

  const fetchCourseData = async () => {
    try {
      const courseData = await getCourse(courseId);
      const lessonsData = await getLessons(courseId);
      setCourse(courseData);
      setLessons(lessonsData);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading course...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Course not found</div>
      </div>
    );
  }

  const totalDuration = lessons.reduce((sum, lesson) => sum + (lesson.videoDuration || 0), 0);
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="text-sm font-semibold mb-2">{course.category}</div>
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-blue-100 mb-6">{course.description}</p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{course.totalStudents} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{hours}h {minutes}m</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span>{lessons.length} lessons</span>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-sm">Taught by</p>
                <p className="text-lg font-semibold">{course.lecturerName}</p>
              </div>
            </div>

            {/* Purchase Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 shadow-xl text-gray-900">
                <img
                  src={course.thumbnailURL}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <div className="text-3xl font-bold text-blue-600 mb-4">
                  ₦{course.price.toLocaleString()}
                </div>
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mb-3"
                >
                  Enroll Now
                </button>
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>Certificate upon completion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Access to study group</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Lifetime access</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* What You'll Learn */}
            <div className="bg-white rounded-lg p-6 shadow-md mb-6">
              <h2 className="text-2xl font-bold mb-4">What You'll Learn</h2>
              <p className="text-gray-700">{course.description}</p>
            </div>

            {/* Course Curriculum */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-2xl font-bold mb-4">Course Curriculum</h2>
              <div className="space-y-3">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold">{lesson.title}</h3>
                            {lesson.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {lesson.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 ml-4">
                        {Math.floor(lesson.videoDuration / 60)}:{String(lesson.videoDuration % 60).padStart(2, '0')}
                      </div>
                    </div>
                    {lesson.isPreview && (
                      <div className="mt-2 ml-11">
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                          FREE PREVIEW
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Instructor Info */}
            <div className="bg-white rounded-lg p-6 shadow-md mb-6">
              <h3 className="text-xl font-bold mb-4">About the Instructor</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {course.lecturerName.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold">{course.lecturerName}</div>
                  <div className="text-sm text-gray-600">University Lecturer</div>
                </div>
              </div>
            </div>

            {/* Course Stats */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold mb-4">Course Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Students Enrolled</span>
                  <span className="font-semibold">{course.totalStudents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Lessons</span>
                  <span className="font-semibold">{lessons.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold">{hours}h {minutes}m</span>
                </div>
                {course.rating > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating</span>
                    <span className="font-semibold">⭐ {course.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          course={course}
          affiliateCode={affiliateCode}
          onClose={() => setShowCheckout(false)}
          onSuccess={async () => {
            setShowCheckout(false);
            // Add a small delay to ensure database update completes
            setTimeout(async () => {
              // Refresh course data to show updated student count
              await fetchCourseData();
              // Show success message
              alert('Enrollment successful! Course data updated.');
              // Redirect after showing updated data
              setTimeout(() => {
                window.location.href = `/courses/${courseId}/learn`;
              }, 1500);
            }, 2000);
          }}
        />
      )}
    </div>
  );
}
