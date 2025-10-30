import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  AcademicCapIcon,
  CreditCardIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Topics', icon: BookOpenIcon },
    { id: 'getting-started', name: 'Getting Started', icon: AcademicCapIcon },
    { id: 'courses', name: 'Courses', icon: BookOpenIcon },
    { id: 'payments', name: 'Payments', icon: CreditCardIcon },
    { id: 'account', name: 'Account', icon: UserCircleIcon },
    { id: 'technical', name: 'Technical', icon: ShieldCheckIcon },
  ];

  const helpArticles = [
    {
      category: 'getting-started',
      title: 'How to Create an Account',
      description: 'Step-by-step guide to signing up and getting started with NaijaEdu.',
      content: `
        1. Click on "Sign Up" in the top right corner
        2. Choose your role (Student, Lecturer)
        3. Fill in your details (name, email, password)
        4. Verify your email address
        5. Complete your profile
        6. Start exploring courses!
      `
    },
    {
      category: 'getting-started',
      title: 'Navigating the Platform',
      description: 'Learn how to find your way around NaijaEdu.',
      content: `
        - Home: Your personalized dashboard
        - Courses: Browse all available courses
        - Study Groups: Join or create study groups
        - Q&A: Ask questions and get answers
        - Dashboard: Access your enrolled courses and progress
      `
    },
    {
      category: 'courses',
      title: 'How to Enroll in a Course',
      description: 'Learn how to purchase and access courses.',
      content: `
        1. Browse the course catalog
        2. Click on a course to view details
        3. Click "Enroll Now"
        4. Complete payment via Paystack
        5. Access course immediately after payment
        6. Start learning at your own pace
      `
    },
    {
      category: 'courses',
      title: 'Accessing Course Materials',
      description: 'How to view videos, download resources, and track progress.',
      content: `
        - Video Lessons: Stream directly in your browser
        - Resources: Download PDFs, slides, and other materials
        - Progress Tracking: Your progress is saved automatically
        - Certificates: Available upon course completion
      `
    },
    {
      category: 'courses',
      title: 'Course Completion & Certificates',
      description: 'How to complete courses and earn certificates.',
      content: `
        1. Complete all lessons in the course
        2. Pass any required assessments
        3. Certificate is automatically generated
        4. Download from your dashboard
        5. Share on LinkedIn or with employers
      `
    },
    {
      category: 'payments',
      title: 'Payment Methods',
      description: 'Accepted payment methods and how to pay.',
      content: `
        We accept the following payment methods via Paystack:
        - Debit/Credit Cards (Visa, Mastercard, Verve)
        - Bank Transfer
        - USSD
        - Mobile Money
        
        All payments are secure and encrypted.
      `
    },
    {
      category: 'payments',
      title: 'Refund Policy',
      description: 'Understanding our refund policy.',
      content: `
        - 7-day money-back guarantee
        - Must request refund within 7 days of purchase
        - Must not have completed more than 25% of course
        - Refunds processed within 5-7 business days
        - Contact support@naijaedu.ng to request refund
      `
    },
    {
      category: 'account',
      title: 'Managing Your Profile',
      description: 'How to update your account information.',
      content: `
        1. Click on your profile icon
        2. Select "Settings" or "Profile"
        3. Update your information
        4. Save changes
        
        You can update:
        - Name and contact information
        - Profile picture
        - Password
        - Email preferences
      `
    },
    {
      category: 'account',
      title: 'Password Reset',
      description: 'How to reset your password if you forget it.',
      content: `
        1. Go to login page
        2. Click "Forgot Password?"
        3. Enter your email address
        4. Check your email for reset link
        5. Click link and create new password
        6. Log in with new password
      `
    },
    {
      category: 'account',
      title: 'Becoming a Lecturer',
      description: 'How to apply to teach on NaijaEdu.',
      content: `
        1. Sign up with a lecturer account
        2. Complete your profile with credentials
        3. Submit required documents
        4. Wait for admin approval (1-3 business days)
        5. Once approved, create your first course
        6. Earn 75% commission on all sales
      `
    },
    {
      category: 'technical',
      title: 'Video Playback Issues',
      description: 'Troubleshooting video streaming problems.',
      content: `
        If videos won't play:
        - Check your internet connection
        - Try a different browser
        - Clear browser cache and cookies
        - Disable browser extensions
        - Update your browser to latest version
        - Contact support if issue persists
      `
    },
    {
      category: 'technical',
      title: 'Browser Compatibility',
      description: 'Supported browsers and devices.',
      content: `
        Supported Browsers:
        - Chrome (recommended)
        - Firefox
        - Safari
        - Edge
        
        Supported Devices:
        - Desktop computers
        - Laptops
        - Tablets
        - Smartphones
        
        Minimum Requirements:
        - Modern browser (last 2 versions)
        - Stable internet connection (2+ Mbps)
      `
    }
  ];

  const filteredArticles = helpArticles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-6 animate-fade-in">
            How Can We Help You?
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Search our help center or browse categories below
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto animate-slide-up">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help articles..."
              className="w-full pl-12 pr-4 py-4 rounded-xl border-0 shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 text-lg"
            />
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <category.icon className="w-5 h-5" />
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Help Articles */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredArticles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article, index) => (
                <div 
                  key={index}
                  className="card group hover:shadow-xl transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="card-body">
                    <div className="flex items-start justify-between mb-3">
                      <QuestionMarkCircleIcon className="w-8 h-8 text-blue-600 flex-shrink-0" />
                      <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full capitalize">
                        {article.category.replace('-', ' ')}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {article.description}
                    </p>
                    <details className="text-sm text-gray-700">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                        Read more
                      </summary>
                      <div className="mt-3 pt-3 border-t whitespace-pre-line leading-relaxed">
                        {article.content}
                      </div>
                    </details>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <QuestionMarkCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600">Try adjusting your search or category filter</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card bg-gradient-to-br from-blue-600 to-green-600">
            <div className="card-body text-center text-white">
              <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
              <p className="text-xl text-blue-100 mb-6">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/contact"
                  className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Contact Support
                </Link>
                <a 
                  href="mailto:support@naijaedu.ng"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-3 px-8 rounded-lg transition-all duration-200"
                >
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
