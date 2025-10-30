import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { initializeApp as initFirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './services/firebase';
import { setupFirebaseErrorMonitoring } from './utils/firebaseRecovery';
import { useEffect, useState, Suspense, lazy } from 'react';
import useAuthStore from './store/authStore';

// Layout Components (keep these as regular imports for immediate loading)
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Error Handling
import ErrorBoundary from './components/error/ErrorBoundary';

// Toast Notifications
import { ToastProvider } from './components/ui/Toast';

// Loading Components
import LoadingScreen from './components/LoadingScreen';

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Courses = lazy(() => import('./pages/Courses'));
const CourseView = lazy(() => import('./pages/CourseView'));
const StudyGroups = lazy(() => import('./pages/StudyGroups'));
const Questions = lazy(() => import('./pages/Questions'));
const QuestionDetail = lazy(() => import('./pages/QuestionDetail'));

// Static Pages
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Help = lazy(() => import('./pages/Help'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));

// Protected Pages - lazy loaded
const ProtectedRoute = lazy(() => import('./components/auth/ProtectedRoute'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const LecturerDashboard = lazy(() => import('./pages/LecturerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminCoursePreview = lazy(() => import('./pages/AdminCoursePreview'));
const CourseCreator = lazy(() => import('./pages/CourseCreator'));

// Student Pages
const Certificates = lazy(() => import('./pages/Certificates'));
const CourseLearn = lazy(() => import('./pages/CourseLearn'));
const EnhancedCourseLearn = lazy(() => import('./pages/EnhancedCourseLearn'));
const EnhancedStudentDashboard = lazy(() => import('./pages/EnhancedStudentDashboard'));
const StudentMessages = lazy(() => import('./pages/StudentMessages'));
const StudentLiveSessions = lazy(() => import('./pages/StudentLiveSessions'));
const StudentDeals = lazy(() => import('./pages/StudentDeals'));
const StudentAnalytics = lazy(() => import('./pages/StudentAnalytics'));
const StudentAnnouncements = lazy(() => import('./pages/StudentAnnouncements'));
const StudentProfile = lazy(() => import('./pages/StudentProfile'));

// Live Session Components
const LiveSessionRoom = lazy(() => import('./components/live/LiveSessionRoom'));

// Lecturer Pages
const LecturerEarnings = lazy(() => import('./pages/LecturerEarnings'));
const LecturerQuestions = lazy(() => import('./pages/LecturerQuestions'));
const LecturerCourseManagement = lazy(() => import('./pages/LecturerCourseManagement'));
const LecturerAnalytics = lazy(() => import('./pages/LecturerAnalytics'));
const LecturerMessages = lazy(() => import('./pages/LecturerMessages'));
const LecturerCoursePreview = lazy(() => import('./pages/LecturerCoursePreview'));
const LecturerMarketing = lazy(() => import('./pages/LecturerMarketing'));
const LecturerProfile = lazy(() => import('./pages/LecturerProfile'));
const LecturerLiveSessions = lazy(() => import('./pages/LecturerLiveSessions'));

function App() {
  const initAuth = useAuthStore(state => state.initAuth);
  const authLoading = useAuthStore(state => state.loading);
  const [appLoaded, setAppLoaded] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Setup Firebase error monitoring first
        setupFirebaseErrorMonitoring();
        
        // Initialize Firebase
        const app = initFirebaseApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
        
        // Initialize auth store
        await initAuth();
        
        // Firebase initialized successfully
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setInitialLoading(false);
        // Small delay for smooth transition
        setTimeout(() => setAppLoaded(true), 100);
      }
    };

    initializeApp();
  }, []); // Empty dependency array since initAuth is now stable

  // Show loading screen during initial app load
  if (initialLoading || authLoading) {
    return <LoadingScreen isVisible={true} />;
  }

  return (
    <ErrorBoundary name="App">
      <ToastProvider>
        <Router>
          <div className={`min-h-screen flex flex-col ${appLoaded ? 'app-loaded' : 'app-loading'}`}>
            {/* Skip Links for Accessibility */}
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <a href="#navigation" className="skip-link">Skip to navigation</a>
            
            <ErrorBoundary name="Navbar">
              <Navbar />
            </ErrorBoundary>
            
            <main id="main-content" className="flex-1" role="main">
              <ErrorBoundary name="Routes">
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/courses/:courseId" element={<CourseView />} />
                    <Route path="/courses/:courseId/learn" element={<EnhancedCourseLearn />} />
                    <Route path="/study-groups" element={<StudyGroups />} />
                    <Route path="/questions" element={<Questions />} />
                    <Route path="/questions/:questionId" element={<QuestionDetail />} />
                    
                    {/* Static Pages */}
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />

                    {/* Student Routes */}
                    <Route
                      path="/student/dashboard"
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <ProtectedRoute allowedRoles={['student']}>
                            <EnhancedStudentDashboard />
                          </ProtectedRoute>
                        </Suspense>
                      }
                    />
                    <Route
                      path="/student/messages"
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <ProtectedRoute allowedRoles={['student']}>
                            <StudentMessages />
                          </ProtectedRoute>
                        </Suspense>
                      }
                    />
                    <Route
                      path="/student/live-sessions"
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <ProtectedRoute allowedRoles={['student']}>
                            <StudentLiveSessions />
                          </ProtectedRoute>
                        </Suspense>
                      }
                    />
                    <Route
                      path="/student/deals"
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <ProtectedRoute allowedRoles={['student']}>
                            <StudentDeals />
                          </ProtectedRoute>
                        </Suspense>
                      }
                    />
                    <Route
                      path="/student/analytics"
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <ProtectedRoute allowedRoles={['student']}>
                            <StudentAnalytics />
                          </ProtectedRoute>
                        </Suspense>
                      }
                    />
                    <Route
                      path="/student/announcements"
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <ProtectedRoute allowedRoles={['student']}>
                            <StudentAnnouncements />
                          </ProtectedRoute>
                        </Suspense>
                      }
                    />
                    <Route
                      path="/student/profile"
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <ProtectedRoute allowedRoles={['student']}>
                            <StudentProfile />
                          </ProtectedRoute>
                        </Suspense>
                      }
                    />
                    <Route
                      path="/certificates"
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <ProtectedRoute allowedRoles={['student']}>
                            <Certificates />
                          </ProtectedRoute>
                        </Suspense>
                      }
                    />

                    {/* Lecturer Routes */}
                    <Route
                      path="/lecturer/dashboard"
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <ProtectedRoute allowedRoles={['lecturer']}>
                            <LecturerDashboard />
                          </ProtectedRoute>
                        </Suspense>
                      }
                    />
                    <Route
                      path="/lecturer/create-course"
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <ProtectedRoute allowedRoles={['lecturer']}>
                            <CourseCreator />
                          </ProtectedRoute>
                        </Suspense>
                      }
                    />
                    <Route
                      path="/lecturer/earnings"
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <ProtectedRoute allowedRoles={['lecturer']}>
                            <LecturerEarnings />
                          </ProtectedRoute>
                        </Suspense>
                      }
                    />
                    <Route
                      path="/lecturer/questions"
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <ProtectedRoute allowedRoles={['lecturer']}>
                            <LecturerQuestions />
                          </ProtectedRoute>
                        </Suspense>
                      }
                    />
                    <Route
                      path="/lecturer/analytics"
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <ProtectedRoute allowedRoles={['lecturer']}>
                            <LecturerAnalytics />
                          </ProtectedRoute>
                        </Suspense>
                      }
                    />
                    <Route
                      path="/lecturer/messages"
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <ProtectedRoute allowedRoles={['lecturer']}>
                            <LecturerMessages />
                          </ProtectedRoute>
                        </Suspense>
                      }
                    />
                    <Route
                      path="/lecturer/courses/:courseId"
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <ProtectedRoute allowedRoles={['lecturer']}>
                            <LecturerCourseManagement />
                          </ProtectedRoute>
                        </Suspense>
                      }
                    />
                    <Route
                      path="/lecturer/courses/:courseId/preview"
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <ProtectedRoute allowedRoles={['lecturer']}>
                            <LecturerCoursePreview />
                          </ProtectedRoute>
                        </Suspense>
                      }
                    />
                    <Route
                      path="/lecturer/marketing"
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <ProtectedRoute allowedRoles={['lecturer']}>
                            <LecturerMarketing />
                          </ProtectedRoute>
                        </Suspense>
                      }
                    />
                    <Route
                      path="/lecturer/profile"
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <ProtectedRoute allowedRoles={['lecturer']}>
                            <LecturerProfile />
                          </ProtectedRoute>
                        </Suspense>
                      }
                    />
                    <Route
                      path="/lecturer/live-sessions"
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <ProtectedRoute allowedRoles={['lecturer']}>
                            <LecturerLiveSessions />
                          </ProtectedRoute>
                        </Suspense>
                      }
                    />

                    {/* Admin Routes */}
                    <Route
                      path="/admin/dashboard"
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                          </ProtectedRoute>
                        </Suspense>
                      }
                    />
                    <Route
                      path="/admin/course-preview/:courseId"
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <ProtectedRoute allowedRoles={['admin']}>
                            <AdminCoursePreview />
                          </ProtectedRoute>
                        </Suspense>
                      }
                    />

                    {/* Live Session Room */}
                    <Route
                      path="/live-session/:sessionId"
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <ProtectedRoute allowedRoles={['student', 'lecturer']}>
                            <LiveSessionRoom />
                          </ProtectedRoute>
                        </Suspense>
                      }
                    />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </main>
            
            <ErrorBoundary name="Footer">
              <Footer />
            </ErrorBoundary>
          </div>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App
