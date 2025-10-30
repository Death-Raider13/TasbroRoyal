import { Component } from 'react';
import { AlertTriangleIcon, RefreshCwIcon, HomeIcon } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.setState({
      error,
      errorInfo,
      errorId
    });
    
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
    
    // Log error to monitoring service (e.g., Sentry)
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        tags: {
          errorBoundary: true,
          errorId: errorId
        },
        extra: {
          errorInfo,
          componentStack: errorInfo.componentStack,
          errorBoundary: this.props.name || 'Unknown'
        }
      });
    }
    
    // Log to analytics
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false,
        error_id: errorId
      });
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI can be passed as prop
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            {/* Error Icon */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
            
            {/* Error Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Oops! Something went wrong
            </h1>
            
            {/* Error Description */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              We're sorry for the inconvenience. Our team has been notified and is working on a fix.
            </p>
            
            {/* Error ID for support */}
            {this.state.errorId && (
              <div className="bg-gray-50 rounded-lg p-3 mb-6">
                <p className="text-xs text-gray-500 mb-1">Error ID for support:</p>
                <code className="text-xs font-mono text-gray-700 bg-white px-2 py-1 rounded">
                  {this.state.errorId}
                </code>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="btn-primary w-full flex items-center justify-center"
              >
                <RefreshCwIcon className="w-4 h-4 mr-2" />
                Try Again
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="btn-secondary w-full flex items-center justify-center"
              >
                <HomeIcon className="w-4 h-4 mr-2" />
                Go to Homepage
              </button>
            </div>
            
            {/* Contact Support */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">
                Still having issues?
              </p>
              <a 
                href="mailto:support@naijaedu.com" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Contact Support
              </a>
            </div>
            
            {/* Development Error Details */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 font-medium">
                  🔧 Error Details (Development Only)
                </summary>
                <div className="mt-3 p-3 bg-gray-100 rounded-lg overflow-auto">
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Error Message:</h4>
                  <pre className="text-xs text-red-600 mb-3 whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </pre>
                  
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Component Stack:</h4>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                    {this.state.errorInfo?.componentStack}
                  </pre>
                  
                  {this.state.error.stack && (
                    <>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2 mt-3">Stack Trace:</h4>
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for error reporting
export const useErrorHandler = () => {
  const reportError = (error, errorInfo = {}) => {
    const errorId = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Manual Error Report:', error, errorInfo);
    }
    
    // Report to monitoring service
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        tags: {
          manual: true,
          errorId: errorId
        },
        extra: errorInfo
      });
    }
    
    return errorId;
  };
  
  return { reportError };
};

export default ErrorBoundary;
