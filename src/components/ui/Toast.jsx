import { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

// Toast Context
const ToastContext = createContext();

// Toast Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (message, title, options = {}) => 
    addToast({ type: 'success', message, title, ...options });
  
  const error = (message, title, options = {}) => 
    addToast({ type: 'error', message, title, ...options });
  
  const warning = (message, title, options = {}) => 
    addToast({ type: 'warning', message, title, ...options });
  
  const info = (message, title, options = {}) => 
    addToast({ type: 'info', message, title, ...options });

  return (
    <ToastContext.Provider value={{
      toasts,
      addToast,
      removeToast,
      success,
      error,
      warning,
      info
    }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Toast Hook
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Individual Toast Component
const Toast = ({ 
  id,
  type = 'info', 
  title, 
  message, 
  duration = 5000, 
  persistent = false,
  action,
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (persistent) return;

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          clearInterval(progressInterval);
          handleClose();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [duration, persistent]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  };

  const colors = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: 'text-green-500',
      progress: 'bg-green-500'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-500',
      progress: 'bg-red-500'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: 'text-yellow-500',
      progress: 'bg-yellow-500'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-500',
      progress: 'bg-blue-500'
    }
  };

  const Icon = icons[type];
  const colorScheme = colors[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          className={`max-w-sm w-full ${colorScheme.bg} ${colorScheme.border} border rounded-lg shadow-lg overflow-hidden`}
          role="alert"
          aria-live="polite"
        >
          {/* Progress bar */}
          {!persistent && (
            <div className="h-1 bg-gray-200">
              <motion.div
                className={`h-full ${colorScheme.progress}`}
                initial={{ width: '100%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            </div>
          )}

          <div className="p-4">
            <div className="flex items-start">
              <Icon className={`w-5 h-5 ${colorScheme.icon} mt-0.5 mr-3 flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                {title && (
                  <h4 className={`font-semibold text-sm mb-1 ${colorScheme.text}`}>
                    {title}
                  </h4>
                )}
                <p className={`text-sm ${colorScheme.text}`}>{message}</p>
                
                {/* Action button */}
                {action && (
                  <div className="mt-3">
                    <button
                      onClick={action.onClick}
                      className={`text-sm font-medium ${colorScheme.icon} hover:underline`}
                    >
                      {action.label}
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={handleClose}
                className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close notification"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast Container
const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <div className="pointer-events-auto">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={removeToast} />
        ))}
      </div>
    </div>
  );
};

// Utility functions for common toast patterns
export const showSuccessToast = (toast, message, title = 'Success') => {
  toast.success(message, title);
};

export const showErrorToast = (toast, error, title = 'Error') => {
  const message = error?.message || error || 'An unexpected error occurred';
  toast.error(message, title, { persistent: true });
};

export const showLoadingToast = (toast, message = 'Loading...') => {
  return toast.info(message, null, { 
    persistent: true,
    action: null 
  });
};

export const showNetworkErrorToast = (toast) => {
  toast.error(
    'Please check your internet connection and try again.',
    'Network Error',
    {
      persistent: true,
      action: {
        label: 'Retry',
        onClick: () => window.location.reload()
      }
    }
  );
};

export const showValidationErrorToast = (toast, errors) => {
  const errorMessages = Array.isArray(errors) 
    ? errors.join(', ')
    : typeof errors === 'object' 
      ? Object.values(errors).join(', ')
      : errors;
      
  toast.warning(errorMessages, 'Validation Error');
};

// HOC for automatic error handling
export const withToastErrorHandling = (Component) => {
  return function WrappedComponent(props) {
    const toast = useToast();
    
    const handleError = (error) => {
      console.error('Component Error:', error);
      showErrorToast(toast, error);
    };

    return (
      <Component 
        {...props} 
        onError={handleError}
        toast={toast}
      />
    );
  };
};

export default Toast;
