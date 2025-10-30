import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  limit,
  startAfter,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  notifyStudentNewMessage, 
  notifyLecturerNewMessage,
  notifyStudentsCourseUpdate 
} from './notifications';

const MESSAGES_COLLECTION = 'messages';
const ANNOUNCEMENTS_COLLECTION = 'announcements';
const NOTIFICATIONS_COLLECTION = 'notifications';

// ============ DIRECT MESSAGING ============

// Send a direct message
export const sendMessage = async (senderId, receiverId, content, messageType = 'text', courseContext = null) => {
  try {
    // Validate input parameters
    if (!senderId || !receiverId || !content) {
      console.warn('sendMessage called with invalid parameters:', { senderId, receiverId, content });
      throw new Error('Invalid parameters: senderId, receiverId, and content are required');
    }

    if (senderId === receiverId) {
      console.warn('sendMessage: Cannot send message to self');
      throw new Error('Cannot send message to yourself');
    }

    const messageData = {
      senderId,
      receiverId,
      content: content.trim(),
      messageType, // 'text', 'image', 'file'
      isRead: false,
      courseId: courseContext?.courseId || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), messageData);
    
    // Create notification for receiver using the new notification system
    try {
      // Get sender and receiver details for better notifications
      const senderDoc = await getDoc(doc(db, 'users', senderId));
      const senderData = senderDoc.data();
      const senderName = senderData?.displayName || 'Someone';
      
      const receiverDoc = await getDoc(doc(db, 'users', receiverId));
      const receiverData = receiverDoc.data();
      
      const messagePreview = content.length > 50 ? content.substring(0, 50) + '...' : content;
      const courseTitle = courseContext?.courseTitle || 'General';
      
      // Send appropriate notification based on user roles
      if (receiverData?.role === 'student') {
        await notifyStudentNewMessage(receiverId, senderId, senderName, courseTitle, messagePreview);
      } else if (receiverData?.role === 'lecturer') {
        await notifyLecturerNewMessage(receiverId, senderId, senderName, courseTitle, messagePreview);
      }
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the message send if notification fails
    }

    return {
      id: docRef.id,
      ...messageData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send message. Please try again.');
  }
};

// Create or get conversation between two users
export const createConversation = async (userId1, userId2) => {
  try {
    // Validate input parameters
    if (!userId1 || !userId2) {
      console.warn('createConversation called with invalid user IDs:', { userId1, userId2 });
      throw new Error('Invalid user IDs: both userId1 and userId2 are required');
    }

    // Ensure we have string IDs, not objects
    const id1 = typeof userId1 === 'string' ? userId1 : userId1.uid || userId1.id;
    const id2 = typeof userId2 === 'string' ? userId2 : userId2.uid || userId2.id;

    if (!id1 || !id2) {
      console.warn('createConversation: Could not extract valid IDs from:', { userId1, userId2 });
      throw new Error('Could not extract valid user IDs');
    }

    if (id1 === id2) {
      throw new Error('Cannot create conversation with yourself');
    }

    // Check if conversation already exists
    const existingConversation = await getConversation(id1, id2, 1);
    if (existingConversation.length > 0) {
      return { success: true, conversationId: `${id1}_${id2}` };
    }
    
    // Create initial conversation metadata (optional)
    const conversationId = `${id1}_${id2}`;
    return { success: true, conversationId };
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

// Get conversation between two users
export const getConversation = async (userId1, userId2, limitCount = 50) => {
  try {
    // Validate input parameters
    if (!userId1 || !userId2) {
      console.warn('getConversation called with invalid user IDs:', { userId1, userId2 });
      return [];
    }

    // Filter out any undefined/null values
    const validUserIds = [userId1, userId2].filter(id => id != null);
    if (validUserIds.length < 2) {
      console.warn('getConversation: Not enough valid user IDs');
      return [];
    }

    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('senderId', 'in', validUserIds),
      where('receiverId', 'in', validUserIds),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    
    // Helper function to safely convert Firestore timestamp to Date
    const toDate = (timestamp) => {
      if (!timestamp) return new Date();
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
      }
      if (timestamp instanceof Date) {
        return timestamp;
      }
      return new Date(timestamp);
    };
    
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt)
    }));

    return messages.reverse(); // Return in chronological order
  } catch (error) {
    console.error('Error getting conversation:', error);
    return [];
  }
};

// Get all conversations for a user
export const getUserConversations = async (userId) => {
  try {
    // Validate input parameter
    if (!userId) {
      console.warn('getUserConversations called with invalid userId:', userId);
      return [];
    }

    // Get messages where user is sender or receiver
    const sentQuery = query(
      collection(db, MESSAGES_COLLECTION),
      where('senderId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const receivedQuery = query(
      collection(db, MESSAGES_COLLECTION),
      where('receiverId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const [sentSnapshot, receivedSnapshot] = await Promise.all([
      getDocs(sentQuery),
      getDocs(receivedQuery)
    ]);

    const allMessages = [
      ...sentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      ...receivedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    ];

    // Helper function to safely convert Firestore timestamp to Date
    const toDate = (timestamp) => {
      if (!timestamp) return new Date();
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
      }
      if (timestamp instanceof Date) {
        return timestamp;
      }
      return new Date(timestamp);
    };

    // Group by conversation partner
    const conversations = {};
    
    allMessages.forEach(message => {
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
      const messageDate = toDate(message.createdAt);
      
      if (!conversations[partnerId] || 
          messageDate > conversations[partnerId].lastMessage.createdAt) {
        conversations[partnerId] = {
          partnerId,
          lastMessage: {
            ...message,
            createdAt: messageDate
          },
          unreadCount: 0 // Will be calculated separately
        };
      }
    });

    // Calculate unread counts
    for (const partnerId in conversations) {
      const unreadQuery = query(
        collection(db, MESSAGES_COLLECTION),
        where('senderId', '==', partnerId),
        where('receiverId', '==', userId),
        where('isRead', '==', false)
      );
      
      const unreadSnapshot = await getDocs(unreadQuery);
      conversations[partnerId].unreadCount = unreadSnapshot.size;
    }

    return Object.values(conversations).sort((a, b) => 
      b.lastMessage.createdAt - a.lastMessage.createdAt
    );
  } catch (error) {
    console.error('Error getting user conversations:', error);
    return [];
  }
};

// Mark messages as read
export const markMessagesAsRead = async (senderId, receiverId) => {
  try {
    // Validate input parameters
    if (!senderId || !receiverId) {
      console.warn('markMessagesAsRead called with invalid parameters:', { senderId, receiverId });
      return;
    }

    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('senderId', '==', senderId),
      where('receiverId', '==', receiverId),
      where('isRead', '==', false)
    );

    const snapshot = await getDocs(q);
    const updatePromises = snapshot.docs.map(doc => 
      updateDoc(doc.ref, { isRead: true, updatedAt: serverTimestamp() })
    );

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};

// ============ COURSE ANNOUNCEMENTS ============

// Create course announcement
export const createAnnouncement = async (courseId, lecturerId, announcementData) => {
  try {
    const announcement = {
      courseId,
      lecturerId,
      title: announcementData.title,
      content: announcementData.content,
      priority: announcementData.priority || 'normal', // 'low', 'normal', 'high', 'urgent'
      isPublished: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, ANNOUNCEMENTS_COLLECTION), announcement);

    // Notify all enrolled students
    await notifyEnrolledStudents(courseId, {
      type: 'announcement',
      title: announcement.title,
      message: announcement.content.substring(0, 100) + '...',
      courseId,
      announcementId: docRef.id
    });

    return {
      id: docRef.id,
      ...announcement,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw new Error('Failed to create announcement. Please try again.');
  }
};

// Get course announcements
export const getCourseAnnouncements = async (courseId, limitCount = 20) => {
  try {
    const q = query(
      collection(db, ANNOUNCEMENTS_COLLECTION),
      where('courseId', '==', courseId),
      where('isPublished', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    }));
  } catch (error) {
    console.error('Error getting course announcements:', error);
    return [];
  }
};

// Get lecturer announcements
export const getLecturerAnnouncements = async (lecturerId) => {
  try {
    const q = query(
      collection(db, ANNOUNCEMENTS_COLLECTION),
      where('lecturerId', '==', lecturerId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    }));
  } catch (error) {
    console.error('Error getting lecturer announcements:', error);
    return [];
  }
};

// Get student announcements (from enrolled courses)
export const getStudentAnnouncements = async (userId, limitCount = 20) => {
  try {
    // First, get all courses the student is enrolled in
    const enrollmentsQuery = query(
      collection(db, 'enrollments'),
      where('userId', '==', userId)
    );

    const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
    const courseIds = enrollmentsSnapshot.docs.map(doc => doc.data().courseId);

    if (courseIds.length === 0) {
      return [];
    }

    // Get announcements for all enrolled courses
    const announcementsQuery = query(
      collection(db, ANNOUNCEMENTS_COLLECTION),
      where('courseId', 'in', courseIds),
      where('isPublished', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const announcementsSnapshot = await getDocs(announcementsQuery);
    
    // Get course details for each announcement
    const announcements = await Promise.all(
      announcementsSnapshot.docs.map(async (announcementDoc) => {
        const announcementData = announcementDoc.data();
        
        // Get course title
        try {
          const courseDoc = await getDoc(doc(db, 'courses', announcementData.courseId));
          const courseTitle = courseDoc.exists() ? courseDoc.data().title : 'Unknown Course';
          
          return {
            id: announcementDoc.id,
            ...announcementData,
            courseTitle,
            createdAt: announcementData.createdAt?.toDate() || new Date(),
            updatedAt: announcementData.updatedAt?.toDate() || new Date()
          };
        } catch (error) {
          console.error('Error fetching course details:', error);
          return {
            id: announcementDoc.id,
            ...announcementData,
            courseTitle: 'Unknown Course',
            createdAt: announcementData.createdAt?.toDate() || new Date(),
            updatedAt: announcementData.updatedAt?.toDate() || new Date()
          };
        }
      })
    );

    return announcements;
  } catch (error) {
    console.error('Error getting student announcements:', error);
    return [];
  }
};

// Update announcement
export const updateAnnouncement = async (announcementId, updates) => {
  try {
    const announcementRef = doc(db, ANNOUNCEMENTS_COLLECTION, announcementId);
    await updateDoc(announcementRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    throw error;
  }
};

// Delete announcement
export const deleteAnnouncement = async (announcementId) => {
  try {
    await deleteDoc(doc(db, ANNOUNCEMENTS_COLLECTION, announcementId));
  } catch (error) {
    console.error('Error deleting announcement:', error);
    throw error;
  }
};

// ============ NOTIFICATIONS ============

// Create notification
export const createNotification = async (userId, notificationData) => {
  try {
    const notification = {
      userId,
      type: notificationData.type, // 'message', 'announcement', 'course_update', 'system'
      title: notificationData.title,
      message: notificationData.message,
      isRead: false,
      metadata: notificationData.metadata || {},
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notification);
    return {
      id: docRef.id,
      ...notification,
      createdAt: new Date()
    };
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get user notifications
export const getUserNotifications = async (userId, limitCount = 50) => {
  try {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
  } catch (error) {
    console.error('Error getting user notifications:', error);
    return [];
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(notificationRef, { 
      isRead: true,
      readAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );

    const snapshot = await getDocs(q);
    const updatePromises = snapshot.docs.map(doc => 
      updateDoc(doc.ref, { 
        isRead: true,
        readAt: serverTimestamp()
      })
    );

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (userId) => {
  try {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
};

// ============ HELPER FUNCTIONS ============

// Notify all enrolled students in a course
const notifyEnrolledStudents = async (courseId, notificationData) => {
  try {
    // Get all enrollments for the course
    const enrollmentsQuery = query(
      collection(db, 'enrollments'),
      where('courseId', '==', courseId)
    );

    const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
    const notificationPromises = enrollmentsSnapshot.docs.map(doc => {
      const enrollment = doc.data();
      return createNotification(enrollment.userId, notificationData);
    });

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error notifying enrolled students:', error);
  }
};

// Real-time message listener
export const subscribeToConversation = (userId1, userId2, callback) => {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where('senderId', 'in', [userId1, userId2]),
    where('receiverId', 'in', [userId1, userId2]),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    }));
    
    callback(messages.reverse());
  });
};

// Real-time notifications listener
export const subscribeToNotifications = (userId, callback) => {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(20)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
    
    callback(notifications);
  });
};
