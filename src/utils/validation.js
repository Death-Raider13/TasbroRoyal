// Input validation and sanitization utilities
import DOMPurify from 'dompurify';

// Input sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return DOMPurify.sanitize(input.trim());
};

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: emailRegex.test(email),
    error: !emailRegex.test(email) ? 'Please enter a valid email address' : null
  };
};

// Password strength validation
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const errors = [];
  if (password.length < minLength) errors.push(`Password must be at least ${minLength} characters long`);
  if (!hasUpperCase) errors.push('Password must contain at least one uppercase letter');
  if (!hasLowerCase) errors.push('Password must contain at least one lowercase letter');
  if (!hasNumbers) errors.push('Password must contain at least one number');
  
  return {
    isValid: errors.length === 0,
    error: errors.length > 0 ? errors[0] : null,
    strength: {
      length: password.length >= minLength,
      uppercase: hasUpperCase,
      lowercase: hasLowerCase,
      numbers: hasNumbers,
      special: hasSpecialChar
    }
  };
};

// Nigerian phone number validation
export const validateNigerianPhone = (phone) => {
  // Remove all non-digits
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Nigerian phone patterns
  const patterns = [
    /^(\+234|234|0)(70|71|80|81|90|91|70|71)\d{8}$/, // MTN, Airtel, Glo, 9mobile
    /^(\+234|234|0)(80|81|70|71|90|91)\d{8}$/
  ];
  
  const isValid = patterns.some(pattern => pattern.test(cleanPhone));
  
  return {
    isValid,
    error: !isValid ? 'Please enter a valid Nigerian phone number' : null,
    formatted: isValid ? formatNigerianPhone(cleanPhone) : phone
  };
};

// Format Nigerian phone number
export const formatNigerianPhone = (phone) => {
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('234')) {
    return `+${cleanPhone}`;
  } else if (cleanPhone.startsWith('0')) {
    return `+234${cleanPhone.slice(1)}`;
  }
  return `+234${cleanPhone}`;
};

// File upload validation
export const validateFileUpload = (file, options = {}) => {
  const {
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    maxSize = 5 * 1024 * 1024, // 5MB default
    minSize = 1024 // 1KB minimum
  } = options;
  
  const errors = [];
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  if (file.size > maxSize) {
    errors.push(`File size (${formatFileSize(file.size)}) exceeds maximum limit of ${formatFileSize(maxSize)}`);
  }
  
  if (file.size < minSize) {
    errors.push(`File size is too small. Minimum size: ${formatFileSize(minSize)}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Format file size for display
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Course data validation
export const validateCourseData = (courseData) => {
  const errors = {};
  
  // Title validation
  if (!courseData.title || courseData.title.trim().length < 5) {
    errors.title = 'Course title must be at least 5 characters long';
  } else if (courseData.title.length > 100) {
    errors.title = 'Course title must be less than 100 characters';
  }
  
  // Description validation
  if (!courseData.description || courseData.description.trim().length < 50) {
    errors.description = 'Course description must be at least 50 characters long';
  } else if (courseData.description.length > 2000) {
    errors.description = 'Course description must be less than 2000 characters';
  }
  
  // Price validation
  if (!courseData.price || isNaN(courseData.price)) {
    errors.price = 'Please enter a valid price';
  } else if (courseData.price < 1000) {
    errors.price = 'Course price must be at least ₦1,000';
  } else if (courseData.price > 500000) {
    errors.price = 'Course price cannot exceed ₦500,000';
  }
  
  // Category validation
  if (!courseData.category) {
    errors.category = 'Please select a course category';
  }
  
  // Duration validation
  if (courseData.duration && (isNaN(courseData.duration) || courseData.duration < 1)) {
    errors.duration = 'Course duration must be at least 1 week';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// URL validation
export const validateURL = (url) => {
  try {
    new URL(url);
    return {
      isValid: true,
      error: null
    };
  } catch {
    return {
      isValid: false,
      error: 'Please enter a valid URL'
    };
  }
};

// Nigerian university validation
export const validateUniversity = (university) => {
  const nigerianUniversities = [
    'University of Lagos',
    'University of Ibadan',
    'Ahmadu Bello University',
    'University of Nigeria, Nsukka',
    'Obafemi Awolowo University',
    'University of Benin',
    'Lagos State University',
    'Covenant University',
    'Babcock University',
    'Federal University of Technology, Akure',
    'Federal University of Technology, Minna',
    'Federal University of Technology, Owerri'
    // Add more as needed
  ];
  
  const isValid = nigerianUniversities.includes(university) || university === 'Other';
  
  return {
    isValid,
    error: !isValid ? 'Please select a valid Nigerian university' : null
  };
};

// Generic form validation
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const value = formData[field];
    
    // Required field validation
    if (rules.required && (!value || value.toString().trim() === '')) {
      errors[field] = `${rules.label || field} is required`;
      return;
    }
    
    // Skip other validations if field is empty and not required
    if (!value && !rules.required) return;
    
    // Min length validation
    if (rules.minLength && value.toString().length < rules.minLength) {
      errors[field] = `${rules.label || field} must be at least ${rules.minLength} characters`;
      return;
    }
    
    // Max length validation
    if (rules.maxLength && value.toString().length > rules.maxLength) {
      errors[field] = `${rules.label || field} must be less than ${rules.maxLength} characters`;
      return;
    }
    
    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      errors[field] = rules.patternMessage || `${rules.label || field} format is invalid`;
      return;
    }
    
    // Custom validation
    if (rules.validate) {
      const customValidation = rules.validate(value);
      if (!customValidation.isValid) {
        errors[field] = customValidation.error;
        return;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// XSS prevention
export const preventXSS = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// SQL injection prevention (for any direct queries)
export const preventSQLInjection = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove or escape dangerous SQL characters
  return input
    .replace(/['";\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
};

export default {
  sanitizeInput,
  validateEmail,
  validatePassword,
  validateNigerianPhone,
  validateFileUpload,
  validateCourseData,
  validateURL,
  validateUniversity,
  validateForm,
  preventXSS,
  preventSQLInjection,
  formatFileSize,
  formatNigerianPhone
};
