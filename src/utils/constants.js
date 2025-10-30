// Engineering Categories
export const ENGINEERING_CATEGORIES = [
  'Mechanical Engineering',
  'Electrical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Computer Engineering',
  'Petroleum Engineering',
  'Agricultural Engineering',
  'Aerospace Engineering',
  'Biomedical Engineering',
  'Industrial Engineering',
  'Marine Engineering',
  'Mechatronics Engineering',
  'Other'
];

// Nigerian Universities
export const NIGERIAN_UNIVERSITIES = [
  'University of Lagos (UNILAG)',
  'University of Ibadan (UI)',
  'Obafemi Awolowo University (OAU)',
  'Ahmadu Bello University (ABU)',
  'University of Nigeria, Nsukka (UNN)',
  'University of Benin (UNIBEN)',
  'Lagos State University (LASU)',
  'Covenant University',
  'Federal University of Technology, Akure (FUTA)',
  'Federal University of Technology, Minna (FUTMINNA)',
  'Federal University of Technology, Owerri (FUTO)',
  'Nnamdi Azikiwe University (UNIZIK)',
  'University of Port Harcourt (UNIPORT)',
  'Rivers State University',
  'Other'
];

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  LECTURER: 'lecturer',
  ADMIN: 'admin'
};

// Course Status
export const COURSE_STATUS = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// Application Status
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// Commission Rates
export const COMMISSION = {
  PLATFORM_FEE: 0.25, // 25%
  LECTURER_EARNING: 0.75 // 75%
};

// File Upload Limits
export const FILE_LIMITS = {
  THUMBNAIL_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  VIDEO_MAX_SIZE: 500 * 1024 * 1024, // 500MB
  RESOURCE_MAX_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
};

// Pagination
export const PAGINATION = {
  COURSES_PER_PAGE: 12,
  LESSONS_PER_PAGE: 20,
  TRANSACTIONS_PER_PAGE: 20
};

// Notification Types
export const NOTIFICATION_TYPES = {
  COURSE_APPROVED: 'course_approved',
  COURSE_REJECTED: 'course_rejected',
  NEW_QUESTION: 'new_question',
  QUESTION_ANSWERED: 'question_answered',
  PAYMENT_RECEIVED: 'payment_received',
  NEW_ENROLLMENT: 'new_enrollment',
  WITHDRAWAL_PROCESSED: 'withdrawal_processed',
  LIVE_STREAM_STARTING: 'live_stream_starting',
  LECTURER_APPROVED: 'lecturer_approved',
  LECTURER_REJECTED: 'lecturer_rejected'
};

// Price Range
export const PRICE_RANGE = {
  MIN: 1000, // ₦1,000
  MAX: 100000 // ₦100,000
};

// Date Formats
export const DATE_FORMATS = {
  FULL: 'MMMM dd, yyyy',
  SHORT: 'MMM dd, yyyy',
  TIME: 'HH:mm',
  DATETIME: 'MMM dd, yyyy HH:mm'
};
