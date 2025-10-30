/**
 * Form validation utilities
 */

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Invalid email format';
  return true;
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return true;
};

/**
 * Validate phone number (Nigerian)
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^(\+?234|0)[789]\d{9}$/;
  if (!phone) return 'Phone number is required';
  const cleaned = phone.replace(/\s/g, '');
  if (!phoneRegex.test(cleaned)) return 'Invalid Nigerian phone number';
  return true;
};

/**
 * Validate required field
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return true;
};

/**
 * Validate minimum length
 */
export const validateMinLength = (value, minLength, fieldName = 'This field') => {
  if (!value) return true; // Let required validator handle empty values
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return true;
};

/**
 * Validate maximum length
 */
export const validateMaxLength = (value, maxLength, fieldName = 'This field') => {
  if (!value) return true;
  if (value.length > maxLength) {
    return `${fieldName} must not exceed ${maxLength} characters`;
  }
  return true;
};

/**
 * Validate number range
 */
export const validateNumberRange = (value, min, max, fieldName = 'Value') => {
  const num = Number(value);
  if (isNaN(num)) return `${fieldName} must be a number`;
  if (num < min) return `${fieldName} must be at least ${min}`;
  if (num > max) return `${fieldName} must not exceed ${max}`;
  return true;
};

/**
 * Validate price
 */
export const validatePrice = (price) => {
  const num = Number(price);
  if (isNaN(num)) return 'Price must be a number';
  if (num < 1000) return 'Minimum price is ₦1,000';
  if (num > 100000) return 'Maximum price is ₦100,000';
  return true;
};

/**
 * Validate file type
 */
export const validateFileType = (file, allowedTypes) => {
  if (!file) return 'File is required';
  if (!allowedTypes.includes(file.type)) {
    return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
  }
  return true;
};

/**
 * Validate file size
 */
export const validateFileSize = (file, maxSize) => {
  if (!file) return 'File is required';
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return `File size must not exceed ${maxSizeMB}MB`;
  }
  return true;
};

/**
 * Validate image file
 */
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  const typeValidation = validateFileType(file, allowedTypes);
  if (typeValidation !== true) return typeValidation;
  
  const sizeValidation = validateFileSize(file, maxSize);
  if (sizeValidation !== true) return sizeValidation;
  
  return true;
};

/**
 * Validate video file
 */
export const validateVideoFile = (file) => {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  const maxSize = 500 * 1024 * 1024; // 500MB
  
  const typeValidation = validateFileType(file, allowedTypes);
  if (typeValidation !== true) return typeValidation;
  
  const sizeValidation = validateFileSize(file, maxSize);
  if (sizeValidation !== true) return sizeValidation;
  
  return true;
};

/**
 * Validate URL format
 */
export const validateUrl = (url) => {
  if (!url) return 'URL is required';
  try {
    new URL(url);
    return true;
  } catch {
    return 'Invalid URL format';
  }
};

/**
 * Validate array not empty
 */
export const validateArrayNotEmpty = (array, fieldName = 'This field') => {
  if (!array || !Array.isArray(array) || array.length === 0) {
    return `${fieldName} must have at least one item`;
  }
  return true;
};

/**
 * Validate course title
 */
export const validateCourseTitle = (title) => {
  if (!title) return 'Course title is required';
  if (title.length < 10) return 'Course title must be at least 10 characters';
  if (title.length > 100) return 'Course title must not exceed 100 characters';
  return true;
};

/**
 * Validate course description
 */
export const validateCourseDescription = (description) => {
  if (!description) return 'Course description is required';
  if (description.length < 50) return 'Course description must be at least 50 characters';
  if (description.length > 1000) return 'Course description must not exceed 1000 characters';
  return true;
};

/**
 * Validate lecturer qualifications
 */
export const validateQualifications = (qualifications) => {
  if (!qualifications) return 'Qualifications are required';
  if (qualifications.length < 20) return 'Please provide detailed qualifications (at least 20 characters)';
  return true;
};

/**
 * Validate expertise list
 */
export const validateExpertise = (expertise) => {
  if (!expertise) return 'Expertise is required';
  const expertiseArray = expertise.split(',').map(e => e.trim()).filter(e => e);
  if (expertiseArray.length === 0) return 'Please provide at least one area of expertise';
  if (expertiseArray.length > 10) return 'Maximum 10 areas of expertise allowed';
  return true;
};

/**
 * Validate match (for password confirmation)
 */
export const validateMatch = (value, matchValue, fieldName = 'Field') => {
  if (value !== matchValue) {
    return `${fieldName} do not match`;
  }
  return true;
};

/**
 * Validate date in future
 */
export const validateFutureDate = (date) => {
  if (!date) return 'Date is required';
  const selectedDate = new Date(date);
  const now = new Date();
  if (selectedDate <= now) {
    return 'Date must be in the future';
  }
  return true;
};

/**
 * Validate Nigerian university email
 */
export const validateUniversityEmail = (email) => {
  const emailValidation = validateEmail(email);
  if (emailValidation !== true) return emailValidation;
  
  // Common Nigerian university email domains
  const universityDomains = [
    'unilag.edu.ng',
    'ui.edu.ng',
    'oauife.edu.ng',
    'abu.edu.ng',
    'unn.edu.ng',
    'uniben.edu.ng',
    'lasu.edu.ng',
    'covenantuniversity.edu.ng',
    'futa.edu.ng',
    'futminna.edu.ng',
    'futo.edu.ng'
  ];
  
  const domain = email.split('@')[1];
  const isUniversityEmail = universityDomains.some(uniDomain => 
    domain && domain.toLowerCase().includes(uniDomain)
  );
  
  if (!isUniversityEmail) {
    return 'Please use your university email address';
  }
  
  return true;
};

/**
 * Validate lesson order
 */
export const validateLessonOrder = (order, totalLessons) => {
  const num = Number(order);
  if (isNaN(num)) return 'Lesson order must be a number';
  if (num < 1) return 'Lesson order must be at least 1';
  if (num > totalLessons + 1) return `Lesson order cannot exceed ${totalLessons + 1}`;
  return true;
};

/**
 * Validate bank account number (Nigerian)
 */
export const validateBankAccount = (accountNumber) => {
  if (!accountNumber) return 'Account number is required';
  const cleaned = accountNumber.replace(/\s/g, '');
  if (!/^\d{10}$/.test(cleaned)) {
    return 'Account number must be 10 digits';
  }
  return true;
};

/**
 * Validate withdrawal amount
 */
export const validateWithdrawalAmount = (amount, availableBalance) => {
  const num = Number(amount);
  if (isNaN(num)) return 'Amount must be a number';
  if (num < 1000) return 'Minimum withdrawal is ₦1,000';
  if (num > availableBalance) return 'Insufficient balance';
  return true;
};

/**
 * Create validation schema for React Hook Form
 */
export const createValidationSchema = (fields) => {
  const schema = {};
  
  fields.forEach(field => {
    schema[field.name] = {
      required: field.required ? `${field.label} is required` : false,
      minLength: field.minLength ? {
        value: field.minLength,
        message: `${field.label} must be at least ${field.minLength} characters`
      } : undefined,
      maxLength: field.maxLength ? {
        value: field.maxLength,
        message: `${field.label} must not exceed ${field.maxLength} characters`
      } : undefined,
      pattern: field.pattern ? {
        value: field.pattern,
        message: field.patternMessage || `Invalid ${field.label} format`
      } : undefined,
      validate: field.validate || undefined
    };
  });
  
  return schema;
};
