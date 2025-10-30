import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { safeFirestoreOperation } from '../utils/firebaseHelper';

// Notification types
export const NOTIFICATION_TYPES = {
  NEW_MESSAGE: 'new_message',
  LIVE_SESSION_STARTING: 'live_session_starting',
  LIVE_SESSION_REMINDER: 'live_session_reminder',
  COURSE_UPDATE: 'course_update',
  ASSIGNMENT_DUE: 'assignment_due',
  GRADE_RECEIVED: 'grade_received',
  COURSE_COMPLETED: 'course_completed',
  NEW_COURSE_AVAILABLE: 'new_course_available',
  PAYMENT_CONFIRMATION: 'payment_confirmation',
  SYSTEM_ANNOUNCEMENT: 'system_announcement'
};

// Create a new notification
export const createNotification = async (notification) => {
  try {
    const notificationData = {
      ...notification,
      createdAt: serverTimestamp(),
      read: false,
      archived: false
    };

    const docRef = await addDoc(collection(db, 'notifications'), notificationData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get notifications for a user
export const getUserNotifications = async (userId, options = {}) => {
  try {
    const { 
      unreadOnly = false, 
      limit: queryLimit = 50, 
      types = null 
    } = options;

    let q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    if (unreadOnly) {
      q = query(q, where('read', '==', false));
    }

    if (types && types.length > 0) {
      q = query(q, where('type', 'in', types));
    }

    if (queryLimit) {
      q = query(q, limit(queryLimit));
    }

    return await safeFirestoreOperation(async () => {
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
    }, []);
  } catch (error) {
    console.error('Error getting user notifications:', error);
    return [];
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const updatePromises = querySnapshot.docs.map(doc => 
      updateDoc(doc.ref, {
        read: true,
        readAt: serverTimestamp()
      })
    );

    await Promise.all(updatePromises);
    return querySnapshot.docs.length;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.length;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
};

// Subscribe to real-time notifications
export const subscribeToNotifications = (userId, callback) => {
  const q = query(
    collection(db, 'notifications'),
    where('recipientId', '==', userId),
    where('read', '==', false),
    orderBy('createdAt', 'desc'),
    limit(10)
  );

  return onSnapshot(q, (querySnapshot) => {
    const notifications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(notifications);
  });
};

// Notification helper functions for specific scenarios

// Notify student about new message from lecturer
export const notifyStudentNewMessage = async (studentId, lecturerId, lecturerName, courseTitle, messagePreview) => {
  return await createNotification({
    type: NOTIFICATION_TYPES.NEW_MESSAGE,
    recipientId: studentId,
    senderId: lecturerId,
    title: `New message from ${lecturerName}`,
    message: `${lecturerName} sent you a message about "${courseTitle}": ${messagePreview}`,
    data: {
      lecturerId,
      lecturerName,
      courseTitle,
      messagePreview
    },
    actionUrl: '/student/messages',
    priority: 'normal'
  });
};

// Notify lecturer about new message from student
export const notifyLecturerNewMessage = async (lecturerId, studentId, studentName, courseTitle, messagePreview) => {
  return await createNotification({
    type: NOTIFICATION_TYPES.NEW_MESSAGE,
    recipientId: lecturerId,
    senderId: studentId,
    title: `New message from ${studentName}`,
    message: `${studentName} sent you a message about "${courseTitle}": ${messagePreview}`,
    data: {
      studentId,
      studentName,
      courseTitle,
      messagePreview
    },
    actionUrl: '/lecturer/messages',
    priority: 'normal'
  });
};

// Notify students about upcoming live session
export const notifyStudentsLiveSessionStarting = async (studentIds, sessionTitle, courseTitle, startTime, joinUrl) => {
  const notifications = studentIds.map(studentId => ({
    type: NOTIFICATION_TYPES.LIVE_SESSION_STARTING,
    recipientId: studentId,
    title: `Live session starting soon`,
    message: `"${sessionTitle}" for ${courseTitle} starts in 15 minutes`,
    data: {
      sessionTitle,
      courseTitle,
      startTime,
      joinUrl
    },
    actionUrl: '/student/live-sessions',
    priority: 'high'
  }));

  const promises = notifications.map(notification => createNotification(notification));
  return await Promise.all(promises);
};

// Notify student about course completion
export const notifyStudentCourseCompleted = async (studentId, courseTitle, certificateUrl) => {
  return await createNotification({
    type: NOTIFICATION_TYPES.COURSE_COMPLETED,
    recipientId: studentId,
    title: `Congratulations! Course completed`,
    message: `You have successfully completed "${courseTitle}". Your certificate is ready!`,
    data: {
      courseTitle,
      certificateUrl
    },
    actionUrl: '/certificates',
    priority: 'high'
  });
};

// Notify students about course updates
export const notifyStudentsCourseUpdate = async (studentIds, courseTitle, updateType, updateMessage) => {
  const notifications = studentIds.map(studentId => ({
    type: NOTIFICATION_TYPES.COURSE_UPDATE,
    recipientId: studentId,
    title: `Course update: ${courseTitle}`,
    message: updateMessage,
    data: {
      courseTitle,
      updateType
    },
    actionUrl: '/student/dashboard',
    priority: 'normal'
  }));

  const promises = notifications.map(notification => createNotification(notification));
  return await Promise.all(promises);
};

// Notify student about payment confirmation
export const notifyStudentPaymentConfirmed = async (studentId, courseTitle, amount, transactionId) => {
  return await createNotification({
    type: NOTIFICATION_TYPES.PAYMENT_CONFIRMATION,
    recipientId: studentId,
    title: `Payment confirmed`,
    message: `Your payment of ₦${amount.toLocaleString()} for "${courseTitle}" has been confirmed. You now have full access to the course.`,
    data: {
      courseTitle,
      amount,
      transactionId
    },
    actionUrl: '/student/dashboard',
    priority: 'high'
  });
};

// System-wide announcements
export const createSystemAnnouncement = async (title, message, targetRole = null, priority = 'normal') => {
  try {
    // Get all users or users with specific role
    let usersQuery = collection(db, 'users');
    
    if (targetRole) {
      usersQuery = query(usersQuery, where('role', '==', targetRole));
    }

    const usersSnapshot = await getDocs(usersQuery);
    const notifications = usersSnapshot.docs.map(userDoc => ({
      type: NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT,
      recipientId: userDoc.id,
      title,
      message,
      data: {
        targetRole,
        isSystemAnnouncement: true
      },
      priority
    }));

    const promises = notifications.map(notification => createNotification(notification));
    return await Promise.all(promises);
  } catch (error) {
    console.error('Error creating system announcement:', error);
    throw error;
  }
};
