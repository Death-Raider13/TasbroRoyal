# Security Improvements for NaijaEdu Platform

## 1. Environment Variables and API Key Security

### Secure Environment Configuration
```js
// Update vite.config.js - Only expose necessary variables
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    // ... other config
    define: {
      // Only expose public keys - never expose private keys
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(env.VITE_FIREBASE_PROJECT_ID),
      'import.meta.env.VITE_PAYSTACK_PUBLIC_KEY': JSON.stringify(env.VITE_PAYSTACK_PUBLIC_KEY),
      'import.meta.env.VITE_CLOUDINARY_CLOUD_NAME': JSON.stringify(env.VITE_CLOUDINARY_CLOUD_NAME),
      'import.meta.env.VITE_AGORA_APP_ID': JSON.stringify(env.VITE_AGORA_APP_ID),
      // DO NOT expose private keys like:
      // - PAYSTACK_SECRET_KEY
      // - FIREBASE_PRIVATE_KEY
      // - CLOUDINARY_API_SECRET
    }
  };
});
```

### Update .env.example
```env
# Public keys (safe to expose in frontend)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
VITE_AGORA_APP_ID=your_agora_app_id

# Private keys (NEVER expose in frontend - use in Cloud Functions only)
PAYSTACK_SECRET_KEY=sk_test_xxxxx
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
CLOUDINARY_API_SECRET=your_api_secret
SENDGRID_API_KEY=SG.xxxxx
```

## 2. Input Validation and Sanitization

### Create Validation Utilities
```js
// Create utils/validation.js
import DOMPurify from 'dompurify';

// Input sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return DOMPurify.sanitize(input.trim());
};

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password strength validation
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
    errors: {
      length: password.length < minLength,
      uppercase: !hasUpperCase,
      lowercase: !hasLowerCase,
      numbers: !hasNumbers,
      special: !hasSpecialChar
    }
  };
};

// File upload validation
export const validateFileUpload = (file, allowedTypes, maxSize) => {
  const errors = [];
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }
  
  if (file.size > maxSize) {
    errors.push(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Course content validation
export const validateCourseData = (courseData) => {
  const errors = {};
  
  if (!courseData.title || courseData.title.length < 5) {
    errors.title = 'Title must be at least 5 characters long';
  }
  
  if (!courseData.description || courseData.description.length < 50) {
    errors.description = 'Description must be at least 50 characters long';
  }
  
  if (!courseData.price || courseData.price < 1000) {
    errors.price = 'Price must be at least ₦1,000';
  }
  
  if (!courseData.category) {
    errors.category = 'Category is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

### Secure Form Components
```jsx
// Create components/forms/SecureInput.jsx
import { useState } from 'react';
import { sanitizeInput } from '../../utils/validation';

const SecureInput = ({ 
  type = 'text', 
  value, 
  onChange, 
  validate,
  sanitize = true,
  ...props 
}) => {
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    let inputValue = e.target.value;
    
    // Sanitize input if enabled
    if (sanitize && typeof inputValue === 'string') {
      inputValue = sanitizeInput(inputValue);
    }
    
    // Validate input if validator provided
    if (validate) {
      const validation = validate(inputValue);
      setError(validation.isValid ? '' : validation.error);
    }
    
    onChange({ ...e, target: { ...e.target, value: inputValue } });
  };
  
  return (
    <div className="form-field">
      <input
        type={type}
        value={value}
        onChange={handleChange}
        className={`form-input ${error ? 'border-red-500' : ''}`}
        {...props}
      />
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};
```

## 3. Authentication Security

### Enhanced Auth Store
```js
// Update store/authStore.js
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { auth } from '../services/firebase';

const useAuthStore = create((set, get) => ({
  // ... existing state
  
  // Secure login with rate limiting
  login: async (email, password) => {
    try {
      // Client-side validation
      if (!validateEmail(email)) {
        throw new Error('Invalid email format');
      }
      
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error('Password does not meet security requirements');
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Log security event
      console.log('User logged in:', {
        uid: userCredential.user.uid,
        timestamp: new Date().toISOString(),
        ip: await getClientIP() // Implement IP tracking
      });
      
      return userCredential;
    } catch (error) {
      // Log failed login attempt
      console.warn('Failed login attempt:', {
        email,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },
  
  // Secure password change
  changePassword: async (currentPassword, newPassword) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');
      
      // Validate new password
      const validation = validatePassword(newPassword);
      if (!validation.isValid) {
        throw new Error('New password does not meet security requirements');
      }
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      // Log password change
      console.log('Password changed:', {
        uid: user.uid,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Password change failed:', error);
      throw error;
    }
  },
  
  // Secure logout
  logout: async () => {
    try {
      const user = auth.currentUser;
      await signOut(auth);
      
      // Clear sensitive data from local storage
      localStorage.removeItem('authToken');
      sessionStorage.clear();
      
      // Log logout
      if (user) {
        console.log('User logged out:', {
          uid: user.uid,
          timestamp: new Date().toISOString()
        });
      }
      
      set({ user: null, userData: null, loading: false });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }
}));
```

## 4. Content Security Policy (CSP)

### Add CSP Headers
```js
// Create public/_headers (for Netlify) or configure in your hosting
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://js.paystack.co https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; media-src 'self' https://res.cloudinary.com; connect-src 'self' https://api.paystack.co https://firebaseapp.com https://identitytoolkit.googleapis.com; frame-src 'self' https://js.paystack.co;
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
*/
```

### CSP Meta Tag Fallback
```html
<!-- Add to index.html if headers can't be configured -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://js.paystack.co;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://api.paystack.co https://firebaseapp.com;
">
```

## 5. Rate Limiting and DDoS Protection

### Client-Side Rate Limiting
```js
// Create utils/rateLimiter.js
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }
  
  isAllowed(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Clean old requests
    if (this.requests.has(identifier)) {
      const userRequests = this.requests.get(identifier);
      const validRequests = userRequests.filter(time => time > windowStart);
      this.requests.set(identifier, validRequests);
    }
    
    const currentRequests = this.requests.get(identifier) || [];
    
    if (currentRequests.length >= this.maxRequests) {
      return false;
    }
    
    currentRequests.push(now);
    this.requests.set(identifier, currentRequests);
    return true;
  }
  
  getRemainingRequests(identifier) {
    const currentRequests = this.requests.get(identifier) || [];
    return Math.max(0, this.maxRequests - currentRequests.length);
  }
}

// Usage in API calls
const apiLimiter = new RateLimiter(50, 60000); // 50 requests per minute

export const makeSecureRequest = async (url, options = {}) => {
  const identifier = await getClientFingerprint(); // Implement fingerprinting
  
  if (!apiLimiter.isAllowed(identifier)) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...options.headers
    }
  });
};
```

## 6. Secure File Upload

### Enhanced File Upload Security
```js
// Update services/storage.js
import { validateFileUpload } from '../utils/validation';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword'];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

export const uploadSecureFile = async (file, type = 'image') => {
  try {
    // Determine allowed types and max size
    let allowedTypes, maxSize;
    switch (type) {
      case 'image':
        allowedTypes = ALLOWED_IMAGE_TYPES;
        maxSize = MAX_IMAGE_SIZE;
        break;
      case 'video':
        allowedTypes = ALLOWED_VIDEO_TYPES;
        maxSize = MAX_VIDEO_SIZE;
        break;
      case 'document':
        allowedTypes = ALLOWED_DOCUMENT_TYPES;
        maxSize = MAX_DOCUMENT_SIZE;
        break;
      default:
        throw new Error('Invalid file type specified');
    }
    
    // Validate file
    const validation = validateFileUpload(file, allowedTypes, maxSize);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    // Generate secure filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const extension = file.name.split('.').pop();
    const secureFilename = `${timestamp}_${randomString}.${extension}`;
    
    // Upload with security transformations
    const uploadOptions = {
      public_id: secureFilename,
      resource_type: type === 'video' ? 'video' : 'image',
      // Security transformations
      ...(type === 'image' && {
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
          { flags: 'strip_profile' }, // Remove EXIF data
        ]
      })
    };
    
    const result = await cloudinaryUpload(file, uploadOptions);
    
    // Log upload
    console.log('File uploaded securely:', {
      filename: secureFilename,
      size: file.size,
      type: file.type,
      timestamp: new Date().toISOString()
    });
    
    return result;
    
  } catch (error) {
    console.error('Secure upload failed:', error);
    throw error;
  }
};
```

## 7. Error Handling and Logging

### Secure Error Handling
```js
// Create utils/errorHandler.js
class SecureError extends Error {
  constructor(message, code = 'GENERIC_ERROR', statusCode = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }
}

export const handleSecureError = (error, context = {}) => {
  // Log error securely (don't log sensitive data)
  const logData = {
    message: error.message,
    code: error.code || 'UNKNOWN',
    timestamp: error.timestamp || new Date().toISOString(),
    context: {
      ...context,
      // Remove sensitive data
      password: undefined,
      token: undefined,
      apiKey: undefined
    }
  };
  
  console.error('Secure error:', logData);
  
  // Send to error tracking service (e.g., Sentry)
  if (window.Sentry) {
    window.Sentry.captureException(error, {
      extra: logData.context
    });
  }
  
  // Return user-friendly error message
  const userMessage = getUserFriendlyMessage(error.code);
  return new SecureError(userMessage, error.code, error.statusCode);
};

const getUserFriendlyMessage = (errorCode) => {
  const messages = {
    'AUTH_INVALID_EMAIL': 'Please enter a valid email address.',
    'AUTH_WEAK_PASSWORD': 'Password must be at least 8 characters with uppercase, lowercase, and numbers.',
    'AUTH_USER_NOT_FOUND': 'No account found with this email address.',
    'AUTH_WRONG_PASSWORD': 'Incorrect password. Please try again.',
    'UPLOAD_FILE_TOO_LARGE': 'File size is too large. Please choose a smaller file.',
    'UPLOAD_INVALID_TYPE': 'File type not supported. Please choose a different file.',
    'RATE_LIMIT_EXCEEDED': 'Too many requests. Please wait a moment before trying again.',
    'GENERIC_ERROR': 'Something went wrong. Please try again later.'
  };
  
  return messages[errorCode] || messages['GENERIC_ERROR'];
};
```

## 8. Security Monitoring

### Security Event Logging
```js
// Create utils/securityLogger.js
export const logSecurityEvent = (event, details = {}) => {
  const securityLog = {
    event,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    userId: auth.currentUser?.uid || 'anonymous',
    ...details
  };
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Security Event:', securityLog);
  }
  
  // Send to security monitoring service
  if (window.analytics) {
    window.analytics.track('Security Event', securityLog);
  }
};

// Usage examples
export const logFailedLogin = (email, reason) => {
  logSecurityEvent('FAILED_LOGIN', { email, reason });
};

export const logSuspiciousActivity = (activity, details) => {
  logSecurityEvent('SUSPICIOUS_ACTIVITY', { activity, ...details });
};

export const logDataAccess = (resource, action) => {
  logSecurityEvent('DATA_ACCESS', { resource, action });
};
```

## Implementation Priority

**Week 1: Critical Security**
- Secure environment variables
- Add input validation and sanitization
- Implement CSP headers
- Enhanced authentication security

**Week 2: Advanced Security**
- Add rate limiting
- Secure file upload
- Error handling improvements
- Security event logging

**Week 3: Monitoring and Testing**
- Set up security monitoring
- Penetration testing
- Security audit and fixes

## Security Testing Checklist

- [ ] OWASP Top 10 vulnerabilities addressed
- [ ] Input validation on all forms
- [ ] XSS protection implemented
- [ ] CSRF protection in place
- [ ] SQL injection prevention (for any direct DB queries)
- [ ] File upload security
- [ ] Authentication security
- [ ] Authorization checks
- [ ] Rate limiting functional
- [ ] Error handling secure
- [ ] Logging implemented
- [ ] Security headers configured
