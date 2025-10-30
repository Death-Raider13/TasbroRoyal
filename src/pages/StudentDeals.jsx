import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TagIcon,
  ClockIcon,
  FireIcon,
  GiftIcon,
  StarIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ArrowRightIcon,
  SparklesIcon,
  BoltIcon,
  TrophyIcon,
  PercentBadgeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import useAuthStore from '../store/authStore';
import { getCoursePromotions, validateCoupon } from '../services/marketing';
import { getCourses } from '../services/firestore';
import { useToast } from '../components/ui/Toast';

export default function StudentDeals() {
  const { userData } = useAuthStore();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [activeTab, setActiveTab] = useState('promotions');

  useEffect(() => {
    loadDealsData();
  }, []);

  const loadDealsData = async () => {
    try {
      setLoading(true);
      
      // Get all courses to find promotions
      const allCourses = await getCourses();
      setCourses(allCourses);
      
      // Get promotions for all courses
      const allPromotions = [];
      for (const course of allCourses) {
        const coursePromotions = await getCoursePromotions(course.id);
        const promotionsWithCourse = coursePromotions.map(promo => ({
          ...promo,
          course: course
        }));
        allPromotions.push(...promotionsWithCourse);
      }
      
      // Sort by discount percentage (highest first)
      allPromotions.sort((a, b) => b.discountPercentage - a.discountPercentage);
      setPromotions(allPromotions);
      
    } catch (err) {
      console.error('Error loading deals data:', err);
      error('Failed to load deals and promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      error('Please enter a coupon code');
      return;
    }

    try {
      setValidatingCoupon(true);
      // For validation, we'll use a dummy course and amount
      // In a real scenario, this would be done during checkout
      await validateCoupon(couponCode, 'dummy-course-id', 10000);
      success('Coupon code is valid! Apply it during checkout.');
    } catch (err) {
      error(err.message || 'Invalid coupon code');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const formatTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffMs = end - now;
    
    if (diffMs <= 0) return 'Expired';
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Ending soon';
  };

  const getPromotionBadge = (promotion) => {
    if (promotion.promotionType === 'flash_sale') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <BoltIcon className="w-3 h-3 mr-1" />
          Flash Sale
        </span>
      );
    }
    if (promotion.discountPercentage >= 50) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <FireIcon className="w-3 h-3 mr-1" />
          Hot Deal
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <TagIcon className="w-3 h-3 mr-1" />
        Special Offer
      </span>
    );
  };

  const PromotionCard = ({ promotion }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Promotion Header */}
      <div className="relative">
        <img
          src={promotion.course.thumbnail || '/api/placeholder/400/200'}
          alt={promotion.course.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4">
          {getPromotionBadge(promotion)}
        </div>
        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
          -{promotion.discountPercentage}%
        </div>
        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
          <ClockIcon className="w-4 h-4 inline mr-1" />
          {formatTimeRemaining(promotion.validUntil)}
        </div>
      </div>

      {/* Promotion Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{promotion.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{promotion.description}</p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center">
              <UserGroupIcon className="w-4 h-4 mr-1" />
              {promotion.course.totalStudents || 0} students
            </div>
            <div className="flex items-center">
              <StarIcon className="w-4 h-4 mr-1" />
              {promotion.course.rating || 4.5}
            </div>
            <div className="flex items-center">
              <CalendarDaysIcon className="w-4 h-4 mr-1" />
              {promotion.course.lessons?.length || 0} lessons
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-green-600">
                ₦{promotion.promotionalPrice.toLocaleString()}
              </span>
              <span className="text-lg text-gray-500 line-through">
                ₦{promotion.originalPrice.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-green-600 font-medium">
              Save ₦{(promotion.originalPrice - promotion.promotionalPrice).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress Bar for Limited Offers */}
        {promotion.maxEnrollments && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Limited Time Offer</span>
              <span>{promotion.enrollmentCount}/{promotion.maxEnrollments} claimed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(promotion.enrollmentCount / promotion.maxEnrollments) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Link
          to={`/courses/${promotion.courseId}`}
          className="w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center justify-center"
        >
          Enroll Now
          <ArrowRightIcon className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  );

  const CouponValidator = () => (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
      <div className="flex items-center mb-4">
        <GiftIcon className="w-8 h-8 mr-3" />
        <div>
          <h3 className="text-xl font-bold">Have a Coupon Code?</h3>
          <p className="text-purple-100">Enter your code to check if it's valid</p>
        </div>
      </div>
      
      <div className="flex space-x-3">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
        />
        <button
          onClick={handleValidateCoupon}
          disabled={validatingCoupon || !couponCode.trim()}
          className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {validatingCoupon ? 'Checking...' : 'Validate'}
        </button>
      </div>
    </div>
  );

  const FlashSaleSection = () => {
    const flashSales = promotions.filter(p => p.promotionType === 'flash_sale');
    
    if (flashSales.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <BoltIcon className="w-6 h-6 text-red-500 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Flash Sales</h2>
          <SparklesIcon className="w-6 h-6 text-yellow-500 ml-2" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashSales.slice(0, 3).map((promotion) => (
            <PromotionCard key={promotion.id} promotion={promotion} />
          ))}
        </div>
      </div>
    );
  };

  const BestDealsSection = () => {
    const bestDeals = promotions.filter(p => p.discountPercentage >= 30).slice(0, 6);
    
    return (
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <TrophyIcon className="w-6 h-6 text-yellow-500 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Best Deals</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bestDeals.map((promotion) => (
            <PromotionCard key={promotion.id} promotion={promotion} />
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading amazing deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔥 Amazing Deals & Promotions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover incredible discounts on top-rated courses. Limited time offers you don't want to miss!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <PercentBadgeIcon className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{promotions.length}</h3>
            <p className="text-gray-600">Active Promotions</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TagIcon className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {promotions.length > 0 ? Math.max(...promotions.map(p => p.discountPercentage)) : 0}%
            </h3>
            <p className="text-gray-600">Max Discount</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <ClockIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {promotions.filter(p => p.promotionType === 'flash_sale').length}
            </h3>
            <p className="text-gray-600">Flash Sales</p>
          </div>
        </div>

        {/* Coupon Validator */}
        <div className="mb-8">
          <CouponValidator />
        </div>

        {/* Flash Sales */}
        <FlashSaleSection />

        {/* Best Deals */}
        <BestDealsSection />

        {/* All Promotions */}
        {promotions.length > 6 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">All Promotions</h2>
              <span className="text-sm text-gray-500">{promotions.length} deals available</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions.slice(6).map((promotion) => (
                <PromotionCard key={promotion.id} promotion={promotion} />
              ))}
            </div>
          </div>
        )}

        {/* No Promotions State */}
        {promotions.length === 0 && (
          <div className="text-center py-12">
            <GiftIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Promotions</h3>
            <p className="text-gray-600 mb-6">
              Check back soon for amazing deals and discounts on courses!
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse All Courses
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
