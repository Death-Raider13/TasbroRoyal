import { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { checkFirebaseConnection } from '../../utils/firebaseHelper';

export default function FirebaseErrorHandler({ children, fallback = null }) {
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const status = await checkFirebaseConnection();
      setConnectionStatus(status);
      
      if (!status.isConnected || !status.isAuthenticated) {
        setHasError(true);
        setErrorDetails({
          type: 'connection',
          message: !status.isConnected ? 'Firebase not connected' : 'User not authenticated'
        });
      }
    } catch (error) {
      setHasError(true);
      setErrorDetails({
        type: 'error',
        message: error.message
      });
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setHasError(false);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await checkConnection();
      
      if (connectionStatus?.isConnected && connectionStatus?.isAuthenticated) {
        setHasError(false);
        setErrorDetails(null);
      }
    } catch (error) {
      setHasError(true);
      setErrorDetails({
        type: 'retry_failed',
        message: 'Retry failed: ' + error.message
      });
    } finally {
      setIsRetrying(false);
    }
  };

  if (hasError) {
    if (fallback) {
      return fallback;
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connection Issue
            </h2>
            <p className="text-gray-600 mb-6">
              {errorDetails?.message || 'Unable to connect to Firebase services'}
            </p>
            
            <div className="space-y-4">
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isRetrying ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                    Retry Connection
                  </>
                )}
              </button>
              
              <div className="text-sm text-gray-500">
                <p className="mb-2">Troubleshooting tips:</p>
                <ul className="text-left space-y-1">
                  <li>• Check your internet connection</li>
                  <li>• Make sure you're logged in</li>
                  <li>• Try refreshing the page</li>
                  <li>• Clear browser cache if issues persist</li>
                </ul>
              </div>
              
              {errorDetails?.type === 'connection' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Firebase Status:</strong><br />
                    Connected: {connectionStatus?.isConnected ? '✅' : '❌'}<br />
                    Authenticated: {connectionStatus?.isAuthenticated ? '✅' : '❌'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
