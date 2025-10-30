// Test script to verify all functions are properly imported
// Run this in browser console to check for missing functions

import * as firestoreService from '../services/firestore';
import * as schedulingService from '../services/scheduling';
import * as messagingService from '../services/messaging';
import * as notificationService from '../services/notifications';
import * as marketingService from '../services/marketing';

export const testAllImports = () => {
  console.log('🧪 Testing all service imports...');
  
  // Test Firestore service
  console.log('📊 Firestore Service Functions:');
  console.log('- getEnrollments:', typeof firestoreService.getEnrollments);
  console.log('- getCourse:', typeof firestoreService.getCourse);
  console.log('- updateEnrollmentProgress:', typeof firestoreService.updateEnrollmentProgress);
  console.log('- markMessageAsRead:', typeof firestoreService.markMessageAsRead);
  
  // Test Scheduling service
  console.log('📅 Scheduling Service Functions:');
  console.log('- getCourseLiveSessions:', typeof schedulingService.getCourseLiveSessions);
  console.log('- joinLiveSession:', typeof schedulingService.joinLiveSession);
  console.log('- getStudentLiveSessionHistory:', typeof schedulingService.getStudentLiveSessionHistory);
  
  // Test Messaging service
  console.log('💬 Messaging Service Functions:');
  console.log('- sendMessage:', typeof messagingService.sendMessage);
  console.log('- getUserConversations:', typeof messagingService.getUserConversations);
  console.log('- subscribeToConversations:', typeof messagingService.subscribeToConversations);
  
  // Test Notification service
  console.log('🔔 Notification Service Functions:');
  console.log('- getUserNotifications:', typeof notificationService.getUserNotifications);
  console.log('- subscribeToNotifications:', typeof notificationService.subscribeToNotifications);
  console.log('- markNotificationAsRead:', typeof notificationService.markNotificationAsRead);
  
  // Test Marketing service
  console.log('🏷️ Marketing Service Functions:');
  console.log('- getActivePromotions:', typeof marketingService.getActivePromotions);
  console.log('- validateCoupon:', typeof marketingService.validateCoupon);
  console.log('- applyCoupon:', typeof marketingService.applyCoupon);
  
  console.log('✅ All imports tested!');
  
  // Check for undefined functions
  const undefinedFunctions = [];
  
  if (typeof firestoreService.getEnrollments === 'undefined') undefinedFunctions.push('firestoreService.getEnrollments');
  if (typeof firestoreService.getCourse === 'undefined') undefinedFunctions.push('firestoreService.getCourse');
  if (typeof firestoreService.markMessageAsRead === 'undefined') undefinedFunctions.push('firestoreService.markMessageAsRead');
  if (typeof schedulingService.getCourseLiveSessions === 'undefined') undefinedFunctions.push('schedulingService.getCourseLiveSessions');
  if (typeof schedulingService.joinLiveSession === 'undefined') undefinedFunctions.push('schedulingService.joinLiveSession');
  
  if (undefinedFunctions.length > 0) {
    console.error('❌ Missing functions:', undefinedFunctions);
    return false;
  }
  
  console.log('🎉 All required functions are available!');
  return true;
};

// Test authentication state
export const testAuthState = () => {
  console.log('🔐 Testing authentication state...');
  
  // This would be called from a component with access to auth store
  const userData = window.__authStore?.userData;
  const user = window.__authStore?.user;
  
  console.log('User authenticated:', !!user);
  console.log('User data available:', !!userData);
  console.log('User role:', userData?.role);
  console.log('User ID:', userData?.uid);
  
  if (!user) {
    console.warn('⚠️ User not authenticated - this may cause Firebase permission errors');
    return false;
  }
  
  if (!userData?.role) {
    console.warn('⚠️ User role not set - this may cause permission issues');
    return false;
  }
  
  console.log('✅ Authentication state looks good!');
  return true;
};

// Test Firestore connection
export const testFirestoreConnection = async () => {
  console.log('🔥 Testing Firestore connection...');
  
  try {
    // Try to read a simple document
    const testResult = await firestoreService.getCourses({ limit: 1 });
    console.log('✅ Firestore connection successful');
    console.log('Sample data:', testResult);
    return true;
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
    
    if (error.code === 'permission-denied') {
      console.error('🚨 PERMISSION DENIED - Deploy Firestore rules!');
      console.error('Run: firebase deploy --only firestore:rules');
    }
    
    return false;
  }
};

// Run all tests
export const runAllTests = async () => {
  console.log('🚀 Running comprehensive tests...');
  
  const importTest = testAllImports();
  const authTest = testAuthState();
  const firestoreTest = await testFirestoreConnection();
  
  const allPassed = importTest && authTest && firestoreTest;
  
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED! Your application should work correctly.');
  } else {
    console.log('❌ Some tests failed. Check the errors above and follow the deployment guide.');
  }
  
  return allPassed;
};

// Export for browser console testing
if (typeof window !== 'undefined') {
  window.testFunctions = {
    testAllImports,
    testAuthState,
    testFirestoreConnection,
    runAllTests
  };
  
  console.log('🧪 Test functions available in window.testFunctions');
  console.log('Run window.testFunctions.runAllTests() to test everything');
}
