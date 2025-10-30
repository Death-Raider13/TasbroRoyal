import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TagIcon,
  SpeakerWaveIcon,
  LinkIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  ChartBarIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  PercentBadgeIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { CurrencyDollarIcon as DollarSignIcon } from '@heroicons/react/24/solid';
import useAuthStore from '../store/authStore';
import { useToast } from '../components/ui/Toast';
import { getCourses } from '../services/firestore';
import {
  createCoupon,
  getLecturerCoupons,
  createPromotion,
  getLecturerPromotions,
  generateAffiliateLink,
  getLecturerAffiliateLinks,
  getMarketingAnalytics,
  deleteCoupon,
  updateCoupon
} from '../services/marketing';
import { getAffiliateCommissions, getCommissionSummary, requestCommissionPayout } from '../services/affiliateCommissions';

export default function LecturerMarketing() {
  const { userData } = useAuthStore();
  const { success, error } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'coupons', 'promotions', 'affiliate'
  const [courses, setCourses] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [affiliateLinks, setAffiliateLinks] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [commissionSummary, setCommissionSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [showPromotionForm, setShowPromotionForm] = useState(false);
  const [showAffiliateForm, setShowAffiliateForm] = useState(false);
  
  // Form states
  // Helper function to get default dates
  const getDefaultDates = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    return {
      validFrom: now.toISOString().slice(0, 16), // Format for datetime-local
      validUntil: nextMonth.toISOString().slice(0, 16)
    };
  };

  const [couponForm, setCouponForm] = useState({
    code: '',
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minimumAmount: '',
    maxUses: '',
    applicableCourses: [],
    ...getDefaultDates()
  });
  
  const [promotionForm, setPromotionForm] = useState({
    courseId: '',
    title: '',
    description: '',
    promotionType: 'discount',
    originalPrice: '',
    promotionalPrice: '',
    maxEnrollments: '',
    ...getDefaultDates()
  });
  
  const [affiliateForm, setAffiliateForm] = useState({
    courseId: '',
    campaignName: ''
  });

  useEffect(() => {
    loadData();
  }, [userData]);

  const loadData = async () => {
    if (!userData?.uid) return;
    
    try {
      setLoading(true);
      const [coursesData, couponsData, promotionsData, affiliateLinksData, analyticsData, commissionsData, commissionSummaryData] = await Promise.all([
        getCourses({ lecturerId: userData.uid }),
        getLecturerCoupons(userData.uid),
        getLecturerPromotions(userData.uid),
        getLecturerAffiliateLinks(userData.uid),
        getMarketingAnalytics(userData.uid),
        getAffiliateCommissions(userData.uid),
        getCommissionSummary(userData.uid)
      ]);
      
      setCourses(coursesData);
      setCoupons(couponsData);
      setPromotions(promotionsData);
      setAffiliateLinks(affiliateLinksData);
      setAnalytics(analyticsData);
      setCommissions(commissionsData);
      setCommissionSummary(commissionSummaryData);
    } catch (err) {
      console.error('Error loading marketing data:', err);
      error('Failed to load marketing data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await createCoupon(userData.uid, {
        ...couponForm,
        discountValue: parseFloat(couponForm.discountValue),
        minimumAmount: couponForm.minimumAmount ? parseFloat(couponForm.minimumAmount) : 0,
        maxUses: couponForm.maxUses ? parseInt(couponForm.maxUses) : null,
        validFrom: new Date(couponForm.validFrom),
        validUntil: new Date(couponForm.validUntil)
      });
      
      success('Coupon created successfully!');
      setShowCouponForm(false);
      setCouponForm({
        code: '', title: '', description: '', discountType: 'percentage',
        discountValue: '', minimumAmount: '', maxUses: '', applicableCourses: [],
        ...getDefaultDates()
      });
      loadData();
    } catch (err) {
      error('Failed to create coupon');
    }
  };

  const handleCreatePromotion = async (e) => {
    e.preventDefault();
    try {
      await createPromotion(userData.uid, {
        ...promotionForm,
        originalPrice: parseFloat(promotionForm.originalPrice),
        promotionalPrice: parseFloat(promotionForm.promotionalPrice),
        maxEnrollments: promotionForm.maxEnrollments ? parseInt(promotionForm.maxEnrollments) : null,
        validFrom: new Date(promotionForm.validFrom),
        validUntil: new Date(promotionForm.validUntil)
      });
      
      success('Promotion created successfully!');
      setShowPromotionForm(false);
      setPromotionForm({
        courseId: '', title: '', description: '', promotionType: 'discount',
        originalPrice: '', promotionalPrice: '', maxEnrollments: '',
        validFrom: '', validUntil: ''
      });
      loadData();
    } catch (err) {
      error('Failed to create promotion');
    }
  };

  const handleGenerateAffiliateLink = async (e) => {
    e.preventDefault();
    try {
      await generateAffiliateLink(userData.uid, affiliateForm.courseId, affiliateForm.campaignName);
      success('Affiliate link generated successfully!');
      setShowAffiliateForm(false);
      setAffiliateForm({ courseId: '', campaignName: '' });
      loadData();
    } catch (err) {
      error('Failed to generate affiliate link');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    success('Copied to clipboard!');
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading marketing tools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/lecturer/dashboard" className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-lg text-gray-900">Marketing Tools</h1>
              <p className="text-gray-600 mt-2">Promote your courses and increase enrollment</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('coupons')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'coupons'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Coupons
              </button>
              <button
                onClick={() => setActiveTab('promotions')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'promotions'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Promotions
              </button>
              <button
                onClick={() => setActiveTab('affiliate')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'affiliate'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Affiliate Links
              </button>
              <button
                onClick={() => setActiveTab('earnings')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'earnings'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Earnings
              </button>
            </div>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && analytics && (
          <div className="space-y-6">
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Active Coupons</p>
                    <p className="text-3xl font-bold">{analytics.coupons.active}</p>
                  </div>
                  <TagIcon className="w-10 h-10 text-blue-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Active Promotions</p>
                    <p className="text-3xl font-bold">{analytics.promotions.active}</p>
                  </div>
                  <SpeakerWaveIcon className="w-10 h-10 text-green-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Affiliate Links</p>
                    <p className="text-3xl font-bold">{analytics.affiliateLinks.active}</p>
                  </div>
                  <LinkIcon className="w-10 h-10 text-purple-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Conversion Rate</p>
                    <p className="text-3xl font-bold">{analytics.affiliateLinks.conversionRate}%</p>
                  </div>
                  <ChartBarIcon className="w-10 h-10 text-orange-200" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => setShowCouponForm(true)}
                className="bg-white p-6 rounded-lg shadow-sm border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors text-center"
              >
                <TagIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Coupon</h3>
                <p className="text-gray-600">Offer discounts to attract students</p>
              </button>
              
              <button
                onClick={() => setShowPromotionForm(true)}
                className="bg-white p-6 rounded-lg shadow-sm border-2 border-dashed border-gray-300 hover:border-green-400 transition-colors text-center"
              >
                <SpeakerWaveIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Promotion</h3>
                <p className="text-gray-600">Run limited-time course promotions</p>
              </button>
              
              <button
                onClick={() => setShowAffiliateForm(true)}
                className="bg-white p-6 rounded-lg shadow-sm border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors text-center"
              >
                <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate Link</h3>
                <p className="text-gray-600">Create trackable affiliate links</p>
              </button>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h3 className="text-lg font-bold text-gray-900">Recent Marketing Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {coupons.slice(0, 3).map(coupon => (
                    <div key={coupon.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <TagIcon className="w-8 h-8 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{coupon.title}</p>
                        <p className="text-sm text-gray-600">Code: {coupon.code} • Used {coupon.usedCount} times</p>
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(coupon.createdAt)}</span>
                    </div>
                  ))}
                  
                  {promotions.slice(0, 2).map(promotion => (
                    <div key={promotion.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <SpeakerWaveIcon className="w-8 h-8 text-green-600" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{promotion.title}</p>
                        <p className="text-sm text-gray-600">{promotion.discountPercentage}% off • {promotion.enrollmentCount} enrollments</p>
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(promotion.createdAt)}</span>
                    </div>
                  ))}
                </div>
                
                {coupons.length === 0 && promotions.length === 0 && (
                  <div className="text-center py-8">
                    <ChartBarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No marketing activity yet</p>
                    <p className="text-sm text-gray-500 mt-1">Create your first coupon or promotion to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Coupons Tab */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowCouponForm(true)}
                className="btn-primary flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Create Coupon
              </button>
            </div>

            <div className="grid gap-6">
              {coupons.map(coupon => (
                <div key={coupon.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{coupon.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{coupon.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Code:</span>
                          <p className="font-semibold">{coupon.code}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Discount:</span>
                          <p className="font-semibold">
                            {coupon.discountType === 'percentage' 
                              ? `${coupon.discountValue}%` 
                              : formatCurrency(coupon.discountValue)
                            }
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Used:</span>
                          <p className="font-semibold">{coupon.usedCount}{coupon.maxUses ? `/${coupon.maxUses}` : ''}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Valid Until:</span>
                          <p className="font-semibold">{formatDate(coupon.validUntil)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(coupon.code)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Copy code"
                      >
                        <ClipboardDocumentIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          // Edit coupon functionality
                          success('Edit coupon feature coming soon!');
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Edit coupon"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this coupon?')) {
                            try {
                              await deleteCoupon(coupon.id);
                              success('Coupon deleted successfully!');
                              loadData();
                            } catch (err) {
                              error('Failed to delete coupon');
                            }
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete coupon"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {coupons.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <TagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No coupons yet</h3>
                  <p className="text-gray-600 mb-6">Create discount coupons to attract more students</p>
                  <button
                    onClick={() => setShowCouponForm(true)}
                    className="btn-primary"
                  >
                    Create Your First Coupon
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Promotions Tab */}
        {activeTab === 'promotions' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Course Promotions</h2>
                <p className="text-gray-600">Create time-limited promotional pricing for your courses</p>
              </div>
              <button
                onClick={() => setShowPromotionForm(true)}
                className="btn-primary flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Create Promotion
              </button>
            </div>

            <div className="grid gap-6">
              {promotions.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <SpeakerWaveIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No promotions yet</h3>
                  <p className="text-gray-600 mb-4">Create your first promotion to boost course enrollment</p>
                  <button
                    onClick={() => setShowPromotionForm(true)}
                    className="btn-primary"
                  >
                    Create Promotion
                  </button>
                </div>
              ) : (
                promotions.map(promotion => (
                  <div key={promotion.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{promotion.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            promotion.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {promotion.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{promotion.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Original Price:</span>
                            <p className="font-semibold">{formatCurrency(promotion.originalPrice)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Promo Price:</span>
                            <p className="font-semibold text-green-600">{formatCurrency(promotion.promotionalPrice)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Discount:</span>
                            <p className="font-semibold">{promotion.discountPercentage}%</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Valid Until:</span>
                            <p className="font-semibold">{formatDate(promotion.validUntil)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Promotion Creation Form */}
            {showPromotionForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Promotion</h3>
                    
                    <form onSubmit={handleCreatePromotion} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                        <select
                          value={promotionForm.courseId}
                          onChange={(e) => setPromotionForm(prev => ({ ...prev, courseId: e.target.value }))}
                          className="form-select w-full"
                          required
                        >
                          <option value="">Select a course</option>
                          {courses.map(course => (
                            <option key={course.id} value={course.id}>{course.title}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Promotion Title</label>
                        <input
                          type="text"
                          value={promotionForm.title}
                          onChange={(e) => setPromotionForm(prev => ({ ...prev, title: e.target.value }))}
                          className="form-input w-full"
                          placeholder="e.g., Early Bird Special"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={promotionForm.description}
                          onChange={(e) => setPromotionForm(prev => ({ ...prev, description: e.target.value }))}
                          className="form-textarea w-full"
                          rows="3"
                          placeholder="Describe your promotion..."
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₦)</label>
                          <input
                            type="number"
                            value={promotionForm.originalPrice}
                            onChange={(e) => setPromotionForm(prev => ({ ...prev, originalPrice: e.target.value }))}
                            className="form-input w-full"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Promotional Price (₦)</label>
                          <input
                            type="number"
                            value={promotionForm.promotionalPrice}
                            onChange={(e) => setPromotionForm(prev => ({ ...prev, promotionalPrice: e.target.value }))}
                            className="form-input w-full"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                          <input
                            type="datetime-local"
                            value={promotionForm.validFrom}
                            onChange={(e) => setPromotionForm(prev => ({ ...prev, validFrom: e.target.value }))}
                            className="form-input w-full"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                          <input
                            type="datetime-local"
                            value={promotionForm.validUntil}
                            onChange={(e) => setPromotionForm(prev => ({ ...prev, validUntil: e.target.value }))}
                            className="form-input w-full"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Enrollments (Optional)</label>
                        <input
                          type="number"
                          value={promotionForm.maxEnrollments}
                          onChange={(e) => setPromotionForm(prev => ({ ...prev, maxEnrollments: e.target.value }))}
                          className="form-input w-full"
                          min="1"
                          placeholder="Leave empty for unlimited"
                        />
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <button type="submit" className="btn-primary flex-1">
                          Create Promotion
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPromotionForm(false)}
                          className="btn-outline flex-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Affiliate Links Tab */}
        {activeTab === 'affiliate' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Affiliate Links</h2>
                <p className="text-gray-600">Generate trackable marketing links for your courses</p>
              </div>
              <button
                onClick={() => setShowAffiliateForm(true)}
                className="btn-primary flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Generate Link
              </button>
            </div>

            <div className="grid gap-6">
              {affiliateLinks.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <LinkIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No affiliate links yet</h3>
                  <p className="text-gray-600 mb-4">Generate trackable links to promote your courses</p>
                  <button
                    onClick={() => setShowAffiliateForm(true)}
                    className="btn-primary"
                  >
                    Generate Link
                  </button>
                </div>
              ) : (
                affiliateLinks.map(link => (
                  <div key={link.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{link.campaignName}</h3>
                        <div className="bg-gray-50 p-3 rounded-lg mb-3">
                          <p className="text-sm text-gray-600 mb-1">Affiliate Link:</p>
                          <p className="font-mono text-sm break-all">{link.fullUrl}</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Clicks:</span>
                            <p className="font-semibold">{link.clickCount || 0}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Conversions:</span>
                            <p className="font-semibold">{link.conversionCount || 0}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Revenue:</span>
                            <p className="font-semibold">{formatCurrency(link.revenue || 0)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Campaign:</span>
                            <p className="font-semibold">{link.campaignName}</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(link.fullUrl)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Copy link"
                      >
                        <ClipboardDocumentIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Affiliate Link Generation Form */}
            {showAffiliateForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-md w-full">
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Generate Affiliate Link</h3>
                    
                    <form onSubmit={handleGenerateAffiliateLink} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                        <select
                          value={affiliateForm.courseId}
                          onChange={(e) => setAffiliateForm(prev => ({ ...prev, courseId: e.target.value }))}
                          className="form-select w-full"
                          required
                        >
                          <option value="">Select a course</option>
                          {courses.map(course => (
                            <option key={course.id} value={course.id}>{course.title}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                        <input
                          type="text"
                          value={affiliateForm.campaignName}
                          onChange={(e) => setAffiliateForm(prev => ({ ...prev, campaignName: e.target.value }))}
                          className="form-input w-full"
                          placeholder="e.g., Social Media Campaign"
                          required
                        />
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <button type="submit" className="btn-primary flex-1">
                          Generate Link
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAffiliateForm(false)}
                          className="btn-outline flex-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Affiliate Earnings</h2>
                <p className="text-gray-600">Track your commission earnings from affiliate marketing</p>
              </div>
            </div>

            {/* Commission Summary Cards */}
            {commissionSummary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Total Earnings</p>
                      <p className="text-3xl font-bold">{formatCurrency(commissionSummary.totalCommissions)}</p>
                    </div>
                    <DollarSignIcon className="w-10 h-10 text-green-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Pending</p>
                      <p className="text-3xl font-bold">{formatCurrency(commissionSummary.pendingAmount)}</p>
                    </div>
                    <ClockIcon className="w-10 h-10 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm">Approved</p>
                      <p className="text-3xl font-bold">{formatCurrency(commissionSummary.approvedAmount)}</p>
                    </div>
                    <CheckCircleIcon className="w-10 h-10 text-yellow-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Conversions</p>
                      <p className="text-3xl font-bold">{commissionSummary.totalConversions}</p>
                    </div>
                    <ArrowTrendingUpIcon className="w-10 h-10 text-purple-200" />
                  </div>
                </div>
              </div>
            )}

            {/* Commission Details */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Commission History</h3>
                <p className="text-sm text-gray-600">Your affiliate commission earnings breakdown</p>
              </div>

              <div className="p-6">
                {commissions.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSignIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Commissions Yet</h3>
                    <p className="text-gray-600 mb-4">
                      Start sharing your affiliate links to earn commissions when students enroll!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {commissions.map(commission => (
                      <div key={commission.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{commission.courseName}</h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                commission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                commission.status === 'approved' ? 'bg-green-100 text-green-800' :
                                commission.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {commission.status.charAt(0).toUpperCase() + commission.status.slice(1)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p>Affiliate Code: <span className="font-mono">{commission.affiliateCode}</span></p>
                              <p>Course Price: {formatCurrency(commission.coursePrice)} | Commission Rate: {(commission.commissionRate * 100).toFixed(0)}%</p>
                              <p>Earned on: {commission.createdAt.toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">
                              {formatCurrency(commission.commissionAmount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Payout Information */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Commission Payout Information</h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p>• <strong>Commission Rate:</strong> You earn 10% commission on every course sale through your affiliate links</p>
                <p>• <strong>Approval Process:</strong> Commissions are reviewed and approved within 7-14 business days</p>
                <p>• <strong>Payout Schedule:</strong> Approved commissions are paid monthly via bank transfer</p>
                <p>• <strong>Minimum Payout:</strong> ₦5,000 minimum balance required for payout requests</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
