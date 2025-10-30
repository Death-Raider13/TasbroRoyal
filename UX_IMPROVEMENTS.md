# User Experience Improvements for NaijaEdu Platform

## 1. Loading States and Skeleton Screens

### Enhanced Loading Components
```jsx
// Create components/ui/LoadingStates.jsx
import { motion } from 'framer-motion';

export const CourseCardSkeleton = () => (
  <div className="card animate-pulse">
    <div className="h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-t-xl bg-[length:200%_100%] animate-shimmer"></div>
    <div className="card-body space-y-4">
      <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4 bg-[length:200%_100%] animate-shimmer"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded bg-[length:200%_100%] animate-shimmer"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-5/6 bg-[length:200%_100%] animate-shimmer"></div>
      </div>
      <div className="flex justify-between items-center pt-4">
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/3 bg-[length:200%_100%] animate-shimmer"></div>
        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/4 bg-[length:200%_100%] animate-shimmer"></div>
      </div>
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    {/* Header skeleton */}
    <div className="flex justify-between items-center">
      <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/3 bg-[length:200%_100%] animate-shimmer"></div>
      <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-32 bg-[length:200%_100%] animate-shimmer"></div>
    </div>
    
    {/* Stats cards skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="card">
          <div className="card-body">
            <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-16 mb-4 bg-[length:200%_100%] animate-shimmer"></div>
            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-20 mb-2 bg-[length:200%_100%] animate-shimmer"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-24 bg-[length:200%_100%] animate-shimmer"></div>
          </div>
        </div>
      ))}
    </div>
    
    {/* Content skeleton */}
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg bg-[length:200%_100%] animate-shimmer"></div>
      ))}
    </div>
  </div>
);

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      {text && (
        <motion.p 
          className="mt-4 text-gray-600 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

// Add shimmer animation to CSS
/* Add to index.css */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
```

## 2. Error Boundaries and Error States

### Global Error Boundary
```jsx
// Create components/error/ErrorBoundary.jsx
import { Component } from 'react';
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
    
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        extra: errorInfo
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Oops! Something went wrong
            </h2>
            
            <p className="text-gray-600 mb-6">
              We're sorry for the inconvenience. Our team has been notified and is working on a fix.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="btn-primary w-full flex items-center justify-center"
              >
                <RefreshCwIcon className="w-4 h-4 mr-2" />
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="btn-secondary w-full"
              >
                Go to Homepage
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### Error State Components
```jsx
// Create components/error/ErrorStates.jsx
import { AlertCircleIcon, WifiOffIcon, ServerIcon, SearchIcon } from 'lucide-react';

export const NetworkError = ({ onRetry }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <WifiOffIcon className="w-8 h-8 text-red-600" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">Connection Problem</h3>
    <p className="text-gray-600 mb-6">Please check your internet connection and try again.</p>
    <button onClick={onRetry} className="btn-primary">
      Try Again
    </button>
  </div>
);

export const ServerError = ({ onRetry }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <ServerIcon className="w-8 h-8 text-yellow-600" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">Server Error</h3>
    <p className="text-gray-600 mb-6">Our servers are experiencing issues. Please try again in a moment.</p>
    <button onClick={onRetry} className="btn-primary">
      Retry
    </button>
  </div>
);

export const NotFound = ({ message = "Content not found", actionText = "Go Back", onAction }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <SearchIcon className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">Not Found</h3>
    <p className="text-gray-600 mb-6">{message}</p>
    <button onClick={onAction} className="btn-secondary">
      {actionText}
    </button>
  </div>
);

export const EmptyState = ({ 
  icon: Icon = SearchIcon, 
  title, 
  description, 
  actionText, 
  onAction 
}) => (
  <div className="text-center py-16">
    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <Icon className="w-10 h-10 text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 max-w-md mx-auto mb-8">{description}</p>
    {actionText && onAction && (
      <button onClick={onAction} className="btn-primary">
        {actionText}
      </button>
    )}
  </div>
);
```

## 3. Improved Navigation and Breadcrumbs

### Breadcrumb Component
```jsx
// Create components/navigation/Breadcrumbs.jsx
import { Link } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

const Breadcrumbs = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
      <Link 
        to="/" 
        className="flex items-center hover:text-blue-600 transition-colors duration-200"
        aria-label="Home"
      >
        <HomeIcon className="w-4 h-4" />
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          {item.href && !item.current ? (
            <Link 
              to={item.href} 
              className="hover:text-blue-600 transition-colors duration-200"
            >
              {item.name}
            </Link>
          ) : (
            <span className={item.current ? 'text-gray-900 font-medium' : ''}>
              {item.name}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
```

### Enhanced Navigation with Search
```jsx
// Update components/layout/Navbar.jsx - Add search functionality
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  
  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length > 2) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [query]);
  
  const performSearch = async (searchQuery) => {
    try {
      // Implement search API call
      const searchResults = await searchCourses(searchQuery);
      setResults(searchResults.slice(0, 5)); // Limit to 5 results
    } catch (error) {
      console.error('Search failed:', error);
    }
  };
  
  const handleResultClick = (course) => {
    navigate(`/courses/${course.id}`);
    setQuery('');
    setIsOpen(false);
  };
  
  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search courses..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
        />
      </div>
      
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50">
          {results.map((course) => (
            <button
              key={course.id}
              onClick={() => handleResultClick(course)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
            >
              <img 
                src={course.thumbnailURL} 
                alt={course.title}
                className="w-10 h-10 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{course.title}</div>
                <div className="text-sm text-gray-500">{course.category}</div>
              </div>
              <div className="text-sm font-medium text-blue-600">
                ₦{course.price.toLocaleString()}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
```

## 4. Toast Notifications System

### Toast Component
```jsx
// Create components/ui/Toast.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

const Toast = ({ 
  id,
  type = 'info', 
  title, 
  message, 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Wait for animation
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, id, onClose]);
  
  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  };
  
  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };
  
  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  };
  
  const Icon = icons[type];
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          className={`max-w-sm w-full ${colors[type]} border rounded-lg shadow-lg p-4`}
        >
          <div className="flex items-start">
            <Icon className={`w-5 h-5 ${iconColors[type]} mt-0.5 mr-3 flex-shrink-0`} />
            <div className="flex-1 min-w-0">
              {title && (
                <h4 className="font-semibold text-sm mb-1">{title}</h4>
              )}
              <p className="text-sm">{message}</p>
            </div>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onClose(id), 300);
              }}
              className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast Container
export const ToastContainer = ({ toasts, onRemove }) => (
  <div className="fixed top-4 right-4 z-50 space-y-2">
    {toasts.map((toast) => (
      <Toast key={toast.id} {...toast} onClose={onRemove} />
    ))}
  </div>
);

// Toast Hook
export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  
  const addToast = (toast) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
  };
  
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  const success = (message, title) => addToast({ type: 'success', message, title });
  const error = (message, title) => addToast({ type: 'error', message, title });
  const warning = (message, title) => addToast({ type: 'warning', message, title });
  const info = (message, title) => addToast({ type: 'info', message, title });
  
  return {
    toasts,
    removeToast,
    success,
    error,
    warning,
    info
  };
};
```

## 5. Progressive Web App Features

### Service Worker for Offline Support
```js
// Create public/sw.js
const CACHE_NAME = 'naijaedu-v1';
const OFFLINE_URL = '/offline.html';

const urlsToCache = [
  '/',
  '/offline.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.open(CACHE_NAME)
            .then((cache) => {
              return cache.match(OFFLINE_URL);
            });
        })
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
  }
});
```

### Offline Page
```html
<!-- Create public/offline.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offline - NaijaEdu</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
        }
        .container {
            max-width: 400px;
            padding: 2rem;
        }
        .icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        h1 { margin-bottom: 1rem; }
        p { margin-bottom: 2rem; opacity: 0.9; }
        button {
            background: white;
            color: #667eea;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">📡</div>
        <h1>You're Offline</h1>
        <p>It looks like you've lost your internet connection. Please check your connection and try again.</p>
        <button onclick="window.location.reload()">Try Again</button>
    </div>
</body>
</html>
```

## 6. Accessibility Improvements

### Focus Management
```jsx
// Create hooks/useFocusManagement.js
import { useEffect, useRef } from 'react';

export const useFocusTrap = (isActive) => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!isActive) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
      
      if (e.key === 'Escape') {
        // Handle escape key
        const closeButton = container.querySelector('[data-close]');
        if (closeButton) closeButton.click();
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);
  
  return containerRef;
};

export const useAnnouncement = () => {
  const announce = (message, priority = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };
  
  return { announce };
};
```

## Implementation Timeline

**Week 1: Core UX**
- Implement loading states and skeletons
- Add error boundaries and error states
- Create toast notification system

**Week 2: Navigation & Search**
- Add breadcrumbs component
- Implement global search
- Enhance navigation UX

**Week 3: PWA & Accessibility**
- Add service worker and offline support
- Implement focus management
- Add accessibility improvements

**Week 4: Polish & Testing**
- User testing and feedback
- Performance optimization
- Final UX refinements
