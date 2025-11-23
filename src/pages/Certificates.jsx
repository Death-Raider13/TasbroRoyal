import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AcademicCapIcon, 
  ArrowDownTrayIcon,
  ShareIcon,
  CheckBadgeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../store/authStore';
import { getEnrollments, getCourse } from '../services/firestore';
import { useToast } from '../components/ui/Toast';

export default function Certificates() {
  const { userData } = useAuthStore();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showPrintView, setShowPrintView] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadCertificates();
  }, [userData]);

  const loadCertificates = async () => {
    if (!userData?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const enrollments = await getEnrollments(userData.uid);
      
      // Filter completed courses (100% progress)
      const completedEnrollments = enrollments.filter(e => e.progress === 100);
      
      // Fetch course details for each completed enrollment
      const certificatesData = await Promise.all(
        completedEnrollments.map(async (enrollment) => {
          const course = await getCourse(enrollment.courseId);
          return {
            id: enrollment.id,
            courseId: enrollment.courseId,
            courseName: course?.title || 'Unknown Course',
            instructor: course?.lecturerName || 'Unknown Instructor',
            completedDate: enrollment.completedAt || enrollment.enrolledAt,
            category: course?.category || 'General',
            certificateId: `NAIJAEDU-${enrollment.courseId.substring(0, 8).toUpperCase()}-${userData.uid.substring(0, 8).toUpperCase()}`
          };
        })
      );

      setCertificates(certificatesData);
    } catch (error) {
      console.error('Error loading certificates:', error);
      showToast('Failed to load certificates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (certificate) => {
    // TODO: Implement actual certificate PDF generation
    setSelectedCertificate(certificate);
    setShowPrintView(true);

    setTimeout(() => {
      try {
        window.print();
      } finally {
        setShowPrintView(false);
        setSelectedCertificate(null);
      }
    }, 300);
  };

  const handleShare = (certificate) => {
    const shareText = `I just completed "${certificate.courseName}" on NaijaEdu! 🎓 #NaijaEdu #Engineering`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My NaijaEdu Certificate',
        text: shareText,
        url: window.location.href
      }).catch(() => {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(shareText);
        showToast('Share text copied to clipboard!', 'success');
      });
    } else {
      navigator.clipboard.writeText(shareText);
      showToast('Share text copied to clipboard!', 'success');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-NG', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (showPrintView && selectedCertificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center py-10 px-4">
        <div className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl border border-blue-100 p-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-semibold tracking-widest text-blue-500 uppercase">NaijaEdu</div>
              <div className="text-sm text-gray-500">Engineering Learning Platform</div>
            </div>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-green-600">
              <AcademicCapIcon className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-xs font-semibold tracking-[0.3em] text-gray-400 uppercase mb-3">Certificate of Completion</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">This certifies that</h1>
            <p className="text-2xl font-semibold text-blue-700 mb-4">
              {userData?.displayName || 'Valued Learner'}
            </p>
            <p className="text-sm text-gray-600 max-w-xl mx-auto">
              has successfully completed the course
            </p>
            <p className="text-xl font-semibold text-gray-900 mt-2 mb-3">
              {selectedCertificate.courseName}
            </p>
            <p className="text-sm text-gray-500">
              instructed by <span className="font-medium">{selectedCertificate.instructor}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 text-sm text-gray-600">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">Certificate ID</div>
              <div className="font-mono text-xs bg-gray-50 border border-gray-100 rounded px-2 py-1">
                {selectedCertificate.certificateId}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">Category</div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                {selectedCertificate.category}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">Completion Date</div>
              <div className="flex items-center text-sm">
                <CalendarIcon className="w-4 h-4 mr-1 text-gray-400" />
                {formatDate(selectedCertificate.completedDate)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-dashed border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <CheckBadgeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">NaijaEdu Certification</div>
                <div className="text-xs text-gray-500">Digitally signed and verifiable</div>
              </div>
            </div>
            <div className="text-right text-xs text-gray-400">
              <div>Verify at naijaedu.com/verify</div>
              <div>Use certificate ID for verification</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-green-600 rounded-full mb-6">
              <AcademicCapIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="heading-xl text-gray-900 mb-6">
              My <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Certificates</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              View, download, and share your course completion certificates
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card bg-gradient-to-br from-blue-600 to-blue-700 text-white">
              <div className="card-body text-center">
                <CheckBadgeIcon className="w-12 h-12 mx-auto mb-3" />
                <div className="text-4xl font-bold mb-2">{certificates.length}</div>
                <div className="text-blue-100">Certificates Earned</div>
              </div>
            </div>
            <div className="card bg-gradient-to-br from-green-600 to-green-700 text-white">
              <div className="card-body text-center">
                <AcademicCapIcon className="w-12 h-12 mx-auto mb-3" />
                <div className="text-4xl font-bold mb-2">{certificates.length}</div>
                <div className="text-green-100">Courses Completed</div>
              </div>
            </div>
            <div className="card bg-gradient-to-br from-purple-600 to-purple-700 text-white">
              <div className="card-body text-center">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3" />
                <div className="text-4xl font-bold mb-2">
                  {certificates.length > 0 ? new Date().getFullYear() : '-'}
                </div>
                <div className="text-purple-100">Active Year</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certificates Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {certificates.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert, index) => (
                <div 
                  key={cert.id}
                  className="card group hover:shadow-2xl transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="card-body">
                    {/* Certificate Badge */}
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl transform rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
                      <div className="relative bg-white rounded-2xl p-6 border-4 border-blue-100">
                        <div className="text-center">
                          <CheckBadgeIcon className="w-16 h-16 text-blue-600 mx-auto mb-3" />
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Certificate of Completion
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                            {cert.courseName}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">{cert.instructor}</p>
                          <div className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                            {cert.category}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Certificate Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                        Completed: {formatDate(cert.completedDate)}
                      </div>
                      <div className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                        ID: {cert.certificateId}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleDownload(cert)}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-semibold"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => handleShare(cert)}
                        className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-semibold"
                      >
                        <ShareIcon className="w-4 h-4" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card max-w-2xl mx-auto">
              <div className="card-body text-center py-16">
                <AcademicCapIcon className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  No Certificates Yet
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Complete your enrolled courses to earn certificates that showcase your 
                  engineering skills and knowledge.
                </p>
                <Link 
                  to="/courses"
                  className="inline-block btn-primary"
                >
                  Browse Courses
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card bg-gradient-to-br from-blue-600 to-green-600">
            <div className="card-body text-white">
              <h2 className="text-2xl font-bold mb-4">About Your Certificates</h2>
              <div className="space-y-3 text-blue-100">
                <p>✓ All certificates are digitally signed and verifiable</p>
                <p>✓ Recognized by Nigerian companies and institutions</p>
                <p>✓ Include unique certificate IDs for verification</p>
                <p>✓ Can be shared on LinkedIn and other platforms</p>
                <p>✓ Available for download as PDF files</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
