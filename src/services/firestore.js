import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { handleError } from '../utils/errorMessages';
// Firebase Storage removed - now using Cloudinary/ImageKit via storage.js

// Course operations
export const createCourse = async (lecturerId, courseData, studyGroupSettings = null) => {
  try {
    const courseRef = await addDoc(collection(db, 'courses'), {
      ...courseData,
      lecturerId,
      status: 'draft',
      totalStudents: 0,
      rating: 0,
      reviewCount: 0,
      totalRevenue: 0,
      studyGroupId: null, // Will be updated if study group is created
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const courseId = courseRef.id;
    let studyGroupId = null;

    // Handle study group creation/linking
    if (studyGroupSettings) {
      if (studyGroupSettings.action === 'create') {
        // Create new study group
        const courseTitle = courseData.title || 'Course';
        const lecturerName = courseData.lecturerName || 'Lecturer';
        
        const groupData = {
          name: studyGroupSettings.groupName || `${courseTitle} - Study Group`,
          description: studyGroupSettings.description || `Study group for ${courseTitle}`,
          courseId: courseId,
          courseName: courseTitle,
          lecturerId: lecturerId,
          lecturerName: lecturerName,
          autoEnrollment: studyGroupSettings.autoEnrollment || true,
          allowPeerHelp: studyGroupSettings.allowPeerHelp || true,
          lecturerModerated: studyGroupSettings.lecturerModerated || true
        };
        studyGroupId = await createStudyGroup(groupData);
      } else if (studyGroupSettings.action === 'link' && studyGroupSettings.existingGroupId) {
        // Link to existing study group
        await linkStudyGroupToCourse(studyGroupSettings.existingGroupId, courseId, courseData.title);
        studyGroupId = studyGroupSettings.existingGroupId;
      }

      // Update course with study group ID
      if (studyGroupId) {
        await updateDoc(courseRef, {
          studyGroupId: studyGroupId,
          updatedAt: new Date()
        });
      }
    }

    return { courseId, studyGroupId };
  } catch (error) {
    const errorMessage = handleError(error, 'Create Course');
    throw new Error(errorMessage);
  }
};

export const updateCourse = async (courseId, updates) => {
  try {
    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    const errorMessage = handleError(error, 'Update Course');
    throw new Error(errorMessage);
  }
};

export const deleteCourse = async (courseId) => {
  try {
    console.log('Deleting course:', courseId);
    
    // First, delete all lessons in the course
    const lessonsRef = collection(db, 'courses', courseId, 'lessons');
    const lessonsSnapshot = await getDocs(lessonsRef);
    
    // Delete each lesson
    const deletePromises = lessonsSnapshot.docs.map(lessonDoc => 
      deleteDoc(doc(db, 'courses', courseId, 'lessons', lessonDoc.id))
    );
    await Promise.all(deletePromises);
    
    console.log(`Deleted ${lessonsSnapshot.docs.length} lessons`);
    
    // Then delete the course itself
    const courseRef = doc(db, 'courses', courseId);
    await deleteDoc(courseRef);
    
    console.log('Course deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting course:', error);
    const errorMessage = handleError(error, 'Delete Course');
    throw new Error(errorMessage);
  }
};

export const getCourse = async (courseId) => {
  try {
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    return courseSnap.exists() ? { id: courseSnap.id, ...courseSnap.data() } : null;
  } catch (error) {
    const errorMessage = handleError(error, 'Get Course');
    throw new Error(errorMessage);
  }
};

export const getCourses = async (filters = {}) => {
  let q = collection(db, 'courses');
  
  if (filters.status) {
    q = query(q, where('status', '==', filters.status));
  }
  if (filters.lecturerId) {
    q = query(q, where('lecturerId', '==', filters.lecturerId));
  }
  if (filters.category) {
    q = query(q, where('category', '==', filters.category));
  }
  
  q = query(q, orderBy('createdAt', 'desc'));
  
  if (filters.limit) {
    q = query(q, limit(filters.limit));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Lesson operations
export const addLesson = async (courseId, lessonData) => {
  try {
    // Ensure courseId is a string
    const courseIdString = String(courseId);
    
    console.log('Adding lesson to course:', courseIdString);
    console.log('Lesson data:', lessonData);
    
    const lessonRef = await addDoc(collection(db, 'courses', courseIdString, 'lessons'), {
      ...lessonData,
      createdAt: new Date()
    });
    
    console.log('Lesson added successfully with ID:', lessonRef.id);
    return lessonRef.id;
  } catch (error) {
    console.error('Error in addLesson:', error);
    const errorMessage = handleError(error, 'Add Lesson');
    throw new Error(errorMessage);
  }
};

export const getLessons = async (courseId) => {
  const lessonsRef = collection(db, 'courses', courseId, 'lessons');
  const q = query(lessonsRef, orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateLesson = async (courseId, lessonId, updates) => {
  const lessonRef = doc(db, 'courses', courseId, 'lessons', lessonId);
  await updateDoc(lessonRef, updates);
};

export const deleteLesson = async (courseId, lessonId) => {
  const lessonRef = doc(db, 'courses', courseId, 'lessons', lessonId);
  await deleteDoc(lessonRef);
};

// Update lesson order
export const updateLessonOrder = async (courseId, lessons) => {
  try {
    const batch = writeBatch(db);
    
    lessons.forEach((lesson, index) => {
      const lessonRef = doc(db, 'courses', courseId, 'lessons', lesson.id);
      batch.update(lessonRef, { 
        order: index + 1,
        updatedAt: serverTimestamp()
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error updating lesson order:', error);
    throw error;
  }
};

// Bulk update lessons
export const bulkUpdateLessons = async (courseId, lessonUpdates) => {
  try {
    const batch = writeBatch(db);
    
    lessonUpdates.forEach(({ lessonId, updates }) => {
      const lessonRef = doc(db, 'courses', courseId, 'lessons', lessonId);
      batch.update(lessonRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error bulk updating lessons:', error);
    throw error;
  }
};

// Enrollment operations
export const enrollStudent = async (userId, courseId, lecturerId, paymentData) => {
  try {
    // Create enrollment record
    const enrollmentRef = await addDoc(collection(db, 'enrollments'), {
      userId,
      courseId,
      lecturerId,
      amountPaid: paymentData.amount,
      paymentReference: paymentData.reference,
      paymentStatus: 'completed',
      progress: 0,
      completedLessons: [],
      enrolledAt: new Date(),
      lastAccessedAt: new Date()
    });

    // Update course totalStudents count
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    if (courseSnap.exists()) {
      const currentCount = courseSnap.data().totalStudents || 0;
      await updateDoc(courseRef, {
        totalStudents: currentCount + 1,
        updatedAt: new Date()
      });

      // Auto-enroll in course-linked study group if it exists
      const course = courseSnap.data();
      if (course.studyGroupId) {
        try {
          await addMemberToGroup(course.studyGroupId, userId);
          console.log(`Auto-enrolled student in study group: ${course.studyGroupId}`);
        } catch (error) {
          console.error('Error auto-enrolling in study group:', error);
          // Don't fail enrollment if study group enrollment fails
        }
      }
    }

    return enrollmentRef.id;
  } catch (error) {
    const errorMessage = handleError(error, 'Enroll Student');
    throw new Error(errorMessage);
  }
};

export const getEnrollments = async (userId) => {
  try {
    if (!userId) {
      console.warn('getEnrollments called without valid userId');
      return [];
    }

    const q = query(
      collection(db, 'enrollments'), 
      where('userId', '==', userId),
      orderBy('enrolledAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    
    // Return empty array instead of throwing to prevent app crash
    if (error.code === 'permission-denied' || error.message.includes('INTERNAL ASSERTION FAILED')) {
      console.warn('Firestore permission or internal error, returning empty enrollments');
      return [];
    }
    
    throw error;
  }
};

export const getCourseEnrollments = async (courseId) => {
  try {
    const q = query(
      collection(db, 'enrollments'), 
      where('courseId', '==', courseId),
      orderBy('enrolledAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    const errorMessage = handleError(error, 'Get Course Enrollments');
    throw new Error(errorMessage);
  }
};

export const getCourseEnrollmentCount = async (courseId) => {
  try {
    const q = query(
      collection(db, 'enrollments'), 
      where('courseId', '==', courseId)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    const errorMessage = handleError(error, 'Get Course Enrollment Count');
    throw new Error(errorMessage);
  }
};

// Function to sync course totalStudents with actual enrollment count
export const syncCourseEnrollmentCount = async (courseId) => {
  try {
    const enrollmentCount = await getCourseEnrollmentCount(courseId);
    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, {
      totalStudents: enrollmentCount,
      updatedAt: new Date()
    });
    return enrollmentCount;
  } catch (error) {
    const errorMessage = handleError(error, 'Sync Course Enrollment Count');
    throw new Error(errorMessage);
  }
};

// Get enrollment by user and course
export const getEnrollmentByUserAndCourse = async (userId, courseId) => {
  try {
    const q = query(
      collection(db, 'enrollments'),
      where('userId', '==', userId),
      where('courseId', '==', courseId)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      throw new Error('Enrollment not found');
    }
    
    const enrollment = snapshot.docs[0];
    return { id: enrollment.id, ...enrollment.data() };
  } catch (error) {
    console.error('Error getting enrollment:', error);
    const errorMessage = handleError(error, 'Get Enrollment');
    throw new Error(errorMessage);
  }
};

export const updateEnrollmentProgress = async (enrollmentId, lessonId) => {
  try {
    const enrollmentRef = doc(db, 'enrollments', enrollmentId);
    const enrollmentSnap = await getDoc(enrollmentRef);
    
    if (!enrollmentSnap.exists()) {
      throw new Error('Enrollment not found');
    }
    
    const data = enrollmentSnap.data();
    const currentCompletedLessons = data.completedLessons || [];
    
    // Check if lesson is already completed
    if (currentCompletedLessons.includes(lessonId)) {
      console.log('Lesson already completed');
      return;
    }
    
    const completedLessons = [...currentCompletedLessons, lessonId];
    
    // Get total lessons count for the course to calculate progress percentage
    const courseId = data.courseId;
    const lessonsSnapshot = await getDocs(
      query(collection(db, 'courses', courseId, 'lessons'))
    );
    const totalLessons = lessonsSnapshot.size;
    
    // Calculate progress percentage
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
    
    await updateDoc(enrollmentRef, {
      completedLessons,
      progress: progressPercentage, // Store actual percentage
      lastAccessedAt: new Date()
    });
    
    console.log(`Enrollment progress updated: ${completedLessons.length}/${totalLessons} lessons (${progressPercentage}%)`);
    return progressPercentage;
  } catch (error) {
    console.error('Error updating enrollment progress:', error);
    const errorMessage = handleError(error, 'Update Enrollment Progress');
    throw new Error(errorMessage);
  }
};

// Utility function to sync progress for existing enrollments
export const syncEnrollmentProgress = async (enrollmentId) => {
  try {
    const enrollmentRef = doc(db, 'enrollments', enrollmentId);
    const enrollmentSnap = await getDoc(enrollmentRef);
    
    if (!enrollmentSnap.exists()) {
      throw new Error('Enrollment not found');
    }
    
    const data = enrollmentSnap.data();
    const completedLessons = data.completedLessons || [];
    const courseId = data.courseId;
    
    // Get total lessons count for the course
    const lessonsSnapshot = await getDocs(
      query(collection(db, 'courses', courseId, 'lessons'))
    );
    const totalLessons = lessonsSnapshot.size;
    
    // Calculate correct progress percentage
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
    
    // Update only if progress is different
    if (data.progress !== progressPercentage) {
      await updateDoc(enrollmentRef, {
        progress: progressPercentage,
        updatedAt: new Date()
      });
      console.log(`Synced progress for enrollment ${enrollmentId}: ${progressPercentage}%`);
    }
    
    return progressPercentage;
  } catch (error) {
    console.error('Error syncing enrollment progress:', error);
    const errorMessage = handleError(error, 'Sync Enrollment Progress');
    throw new Error(errorMessage);
  }
};

// Question operations
export const askQuestion = async (courseId, studentId, studentName, questionText, lessonId = null) => {
  const questionRef = await addDoc(collection(db, 'questions'), {
    courseId,
    lessonId,
    studentId,
    studentName,
    question: questionText,
    status: 'open',
    answers: [],
    createdAt: new Date()
  });
  return questionRef.id;
};

export const answerQuestion = async (questionId, lecturerId, lecturerName, answerText) => {
  const questionRef = doc(db, 'questions', questionId);
  const questionSnap = await getDoc(questionRef);
  const data = questionSnap.data();
  
  await updateDoc(questionRef, {
    answers: [...data.answers, {
      lecturerId,
      lecturerName,
      answer: answerText,
      timestamp: new Date()
    }],
    status: 'answered'
  });
};

export const getQuestions = async (courseId) => {
  const q = query(
    collection(db, 'questions'),
    where('courseId', '==', courseId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Withdrawals collection
export const getWithdrawals = async (lecturerId) => {
  const q = query(
    collection(db, 'withdrawals'), 
    where('lecturerId', '==', lecturerId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createWithdrawal = async (withdrawalData) => {
  try {
    console.log('Creating withdrawal request:', withdrawalData);
    
    const withdrawal = {
      ...withdrawalData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      processedAt: null,
      reference: `WD${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    };

    // Create withdrawal record
    const withdrawalRef = await addDoc(collection(db, 'withdrawals'), withdrawal);
    
    // Update user's pending withdrawal amount
    const userRef = doc(db, 'users', withdrawalData.lecturerId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const currentPending = userSnap.data().pendingWithdrawal || 0;
      await updateDoc(userRef, {
        pendingWithdrawal: currentPending - withdrawalData.amount,
        updatedAt: new Date()
      });
    }

    console.log('Withdrawal request created successfully:', withdrawalRef.id);
    return withdrawalRef.id;
  } catch (error) {
    console.error('Error creating withdrawal:', error);
    const errorMessage = handleError(error, 'Create Withdrawal');
    throw new Error(errorMessage);
  }
};

// Study Group operations
export const createStudyGroup = async (groupData) => {
  try {
    // Validate required fields
    if (!groupData || !groupData.lecturerId) {
      throw new Error('Missing required group data: lecturerId is required');
    }

    const studyGroup = {
      name: groupData.name || 'Study Group',
      description: groupData.description || '',
      courseId: groupData.courseId || null, // Link to course if provided
      courseName: groupData.courseName || '',
      lecturerId: groupData.lecturerId,
      lecturerName: groupData.lecturerName || 'Unknown Lecturer',
      type: groupData.courseId ? 'course-linked' : 'independent',
      autoEnrollment: groupData.autoEnrollment || false,
      allowPeerHelp: groupData.allowPeerHelp || true,
      lecturerModerated: groupData.lecturerModerated || true,
      memberCount: 0,
      members: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const groupRef = await addDoc(collection(db, 'studyGroups'), studyGroup);
    console.log('Study group created:', groupRef.id);
    return groupRef.id;
  } catch (error) {
    console.error('Error creating study group:', error);
    const errorMessage = handleError(error, 'Create Study Group');
    throw new Error(errorMessage);
  }
};

// Get study groups by lecturer (for linking existing groups)
export const getStudyGroupsByLecturer = async (lecturerId) => {
  try {
    const q = query(
      collection(db, 'studyGroups'),
      where('lecturerId', '==', lecturerId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting study groups:', error);
    const errorMessage = handleError(error, 'Get Study Groups');
    throw new Error(errorMessage);
  }
};

// Get study groups by course (to check for existing groups)
export const getStudyGroupsByCourse = async (courseId) => {
  try {
    const q = query(
      collection(db, 'studyGroups'),
      where('courseId', '==', courseId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting study groups by course:', error);
    const errorMessage = handleError(error, 'Get Study Groups By Course');
    throw new Error(errorMessage);
  }
};

// Link existing study group to course
export const linkStudyGroupToCourse = async (groupId, courseId, courseName) => {
  try {
    const groupRef = doc(db, 'studyGroups', groupId);
    await updateDoc(groupRef, {
      courseId,
      courseName,
      type: 'course-linked',
      updatedAt: new Date()
    });
    console.log('Study group linked to course');
  } catch (error) {
    console.error('Error linking study group to course:', error);
    const errorMessage = handleError(error, 'Link Study Group');
    throw new Error(errorMessage);
  }
};

export const addMemberToGroup = async (groupId, userId) => {
  const groupRef = doc(db, 'studyGroups', groupId);
  const groupSnap = await getDoc(groupRef);
  const data = groupSnap.data();
  
  if (!data.members.includes(userId)) {
    await updateDoc(groupRef, {
      members: [...data.members, userId],
      memberCount: data.memberCount + 1
    });
  }
};

export const createGroupPost = async (groupId, authorId, authorName, authorRole, content, attachments = []) => {
  const postRef = await addDoc(collection(db, 'studyGroups', groupId, 'posts'), {
    authorId,
    authorName,
    authorRole,
    content,
    attachments,
    isPinned: false,
    comments: [],
    createdAt: new Date()
  });
  return postRef.id;
};

export const getGroupPosts = async (groupId) => {
  const postsRef = collection(db, 'studyGroups', groupId, 'posts');
  const q = query(postsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Storage operations moved to src/services/storage.js
// Use uploadCourseThumbnail, uploadCourseVideo, uploadCourseDocument instead

// Transaction operations
export const createTransaction = async (transactionData) => {
  const platformFee = transactionData.amount * 0.25; // 25% platform fee
  const lecturerEarning = transactionData.amount * 0.75; // 75% lecturer earning
  
  const transactionRef = await addDoc(collection(db, 'transactions'), {
    ...transactionData,
    platformFee,
    lecturerEarning,
    status: 'completed',
    createdAt: new Date()
  });
  
  // Update lecturer earnings
  const lecturerRef = doc(db, 'users', transactionData.lecturerId);
  const lecturerSnap = await getDoc(lecturerRef);
  const lecturerData = lecturerSnap.data();
  
  await updateDoc(lecturerRef, {
    totalEarnings: (lecturerData.totalEarnings || 0) + lecturerEarning,
    pendingWithdrawal: (lecturerData.pendingWithdrawal || 0) + lecturerEarning
  });
  
  // Update course revenue and student count
  const courseRef = doc(db, 'courses', transactionData.courseId);
  const courseSnap = await getDoc(courseRef);
  const courseData = courseSnap.data();
  
  await updateDoc(courseRef, {
    totalRevenue: (courseData.totalRevenue || 0) + transactionData.amount,
    totalStudents: (courseData.totalStudents || 0) + 1
  });
  
  return transactionRef.id;
};

export const getTransactions = async (lecturerId, filters = {}) => {
  try {
    if (!lecturerId) {
      console.warn('getTransactions called without valid lecturerId');
      return [];
    }

    let q = query(
      collection(db, 'transactions'),
      where('lecturerId', '==', lecturerId),
      orderBy('createdAt', 'desc')
    );

    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }

    const snapshot = await getDocs(q);
    const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`Found ${transactions.length} transactions for lecturer ${lecturerId}`);
    return transactions;
  } catch (error) {
    console.error('Error in getTransactions:', error);
    const errorMessage = handleError(error, 'Get Transactions');
    throw new Error(errorMessage);
  }
};

// Get lecturer earnings summary
export const getLecturerEarnings = async (lecturerId) => {
  try {
    if (!lecturerId) {
      console.warn('getLecturerEarnings called without valid lecturerId');
      return {
        total: 0,
        thisMonth: 0,
        pending: 0,
        paid: 0,
        transactions: []
      };
    }

    console.log(`Fetching earnings for lecturer: ${lecturerId}`);
    const transactions = await getTransactions(lecturerId);
    
    console.log(`Processing ${transactions.length} transactions for earnings calculation`);
    
    const total = transactions.reduce((sum, t) => sum + (t.lecturerEarning || 0), 0);
    const thisMonth = transactions
      .filter(t => {
        const transactionDate = t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
        const now = new Date();
        return transactionDate.getMonth() === now.getMonth() && 
               transactionDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, t) => sum + (t.lecturerEarning || 0), 0);

    const earnings = {
      total,
      thisMonth,
      pending: total, // All earnings are pending until withdrawal
      paid: 0, // No withdrawals implemented yet
      transactions
    };

    console.log('Calculated earnings:', earnings);
    return earnings;
  } catch (error) {
    console.error('Error in getLecturerEarnings:', error);
    const errorMessage = handleError(error, 'Get Lecturer Earnings');
    throw new Error(errorMessage);
  }
};

// Debug function to check what transactions exist in the database
export const debugTransactions = async () => {
  try {
    console.log('=== DEBUGGING TRANSACTIONS ===');
    
    // Get ALL transactions in the database
    const allTransactionsSnapshot = await getDocs(collection(db, 'transactions'));
    const allTransactions = allTransactionsSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    console.log(`Total transactions in database: ${allTransactions.length}`);
    if (allTransactions.length > 0) {
      console.log('All transactions:', allTransactions);
    } else {
      console.log('❌ NO TRANSACTIONS FOUND IN DATABASE');
    }
    
    // Get ALL users to see lecturer IDs
    const allUsersSnapshot = await getDocs(collection(db, 'users'));
    const lecturers = allUsersSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(user => user.role === 'lecturer');
    
    console.log(`Found ${lecturers.length} lecturers:`);
    lecturers.forEach(lecturer => {
      console.log(`- Lecturer: ${lecturer.displayName || lecturer.email} (ID: ${lecturer.id})`);
    });
    
    // Check enrollments too
    const allEnrollmentsSnapshot = await getDocs(collection(db, 'enrollments'));
    const allEnrollments = allEnrollmentsSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    console.log(`Total enrollments in database: ${allEnrollments.length}`);
    if (allEnrollments.length > 0) {
      console.log('All enrollments:', allEnrollments);
    } else {
      console.log('❌ NO ENROLLMENTS FOUND IN DATABASE');
    }
    
    return { allTransactions, lecturers, allEnrollments };
  } catch (error) {
    console.error('Error debugging transactions:', error);
    throw error;
  }
};

// Development helper function to create sample transactions for testing
export const createSampleTransactions = async (lecturerId) => {
  try {
    console.log('Creating sample transactions for lecturer:', lecturerId);
    
    const sampleTransactions = [
      {
        userId: 'sample-student-1',
        courseId: 'sample-course-1',
        lecturerId: lecturerId,
        amount: 50000,
        paymentMethod: 'paystack',
        paymentReference: 'sample-ref-001',
        metadata: {
          courseId: 'sample-course-1',
          courseName: 'Advanced Mechanical Engineering',
          studentId: 'sample-student-1',
          studentName: 'John Doe'
        }
      },
      {
        userId: 'sample-student-2',
        courseId: 'sample-course-2',
        lecturerId: lecturerId,
        amount: 75000,
        paymentMethod: 'paystack',
        paymentReference: 'sample-ref-002',
        metadata: {
          courseId: 'sample-course-2',
          courseName: 'Electrical Circuit Analysis',
          studentId: 'sample-student-2',
          studentName: 'Jane Smith'
        }
      },
      {
        userId: 'sample-student-3',
        courseId: 'sample-course-3',
        lecturerId: lecturerId,
        amount: 60000,
        paymentMethod: 'paystack',
        paymentReference: 'sample-ref-003',
        metadata: {
          courseId: 'sample-course-3',
          courseName: 'Civil Engineering Fundamentals',
          studentId: 'sample-student-3',
          studentName: 'Mike Johnson'
        }
      }
    ];

    const transactionIds = [];
    for (const transactionData of sampleTransactions) {
      const transactionId = await createTransaction(transactionData);
      transactionIds.push(transactionId);
    }

    console.log('Created sample transactions:', transactionIds);
    return transactionIds;
  } catch (error) {
    console.error('Error creating sample transactions:', error);
    throw error;
  }
};

// Admin operations
export const getUsers = async (filters = {}) => {
  try {
    let q = query(collection(db, 'users'));
    
    // Apply filters
    if (filters.role) {
      q = query(q, where('role', '==', filters.role));
    }
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters.approved !== undefined) {
      q = query(q, where('approved', '==', filters.approved));
    }
    
    // Add ordering
    q = query(q, orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const getLecturerApplications = async () => {
  try {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'lecturer'),
      where('applicationStatus', 'in', ['pending', 'submitted'])
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching lecturer applications:', error);
    return [];
  }
};

export const approveLecturer = async (userId) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    approved: true,
    applicationStatus: 'approved',
    updatedAt: new Date()
  });
};

export const rejectLecturer = async (userId) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    approved: false,
    applicationStatus: 'rejected',
    updatedAt: new Date()
  });
};

export const approveCourse = async (courseId) => {
  const courseRef = doc(db, 'courses', courseId);
  await updateDoc(courseRef, {
    status: 'approved',
    publishedAt: new Date(),
    updatedAt: new Date()
  });
};

export const rejectCourse = async (courseId, reason, adminId = null) => {
  const courseRef = doc(db, 'courses', courseId);
  await updateDoc(courseRef, {
    status: 'rejected',
    rejectionReason: reason,
    rejectedAt: new Date(),
    rejectedBy: adminId,
    canResubmit: true,
    resubmissionCount: 0,
    updatedAt: new Date()
  });
};

// Function to resubmit a rejected course for review
export const resubmitCourse = async (courseId) => {
  const courseRef = doc(db, 'courses', courseId);
  const courseSnap = await getDoc(courseRef);
  
  if (!courseSnap.exists()) {
    throw new Error('Course not found');
  }
  
  const courseData = courseSnap.data();
  const currentCount = courseData.resubmissionCount || 0;
  
  await updateDoc(courseRef, {
    status: 'pending_review',
    resubmittedAt: new Date(),
    resubmissionCount: currentCount + 1,
    // Keep rejection history for reference
    previousRejection: {
      reason: courseData.rejectionReason,
      rejectedAt: courseData.rejectedAt,
      rejectedBy: courseData.rejectedBy
    },
    // Clear current rejection data
    rejectionReason: null,
    rejectedAt: null,
    rejectedBy: null,
    updatedAt: new Date()
  });
};

// Get course rejection details for lecturer
export const getCourseRejectionDetails = async (courseId) => {
  const courseRef = doc(db, 'courses', courseId);
  const courseSnap = await getDoc(courseRef);
  
  if (!courseSnap.exists()) {
    return null;
  }
  
  const courseData = courseSnap.data();
  
  if (courseData.status !== 'rejected') {
    return null;
  }
  
  return {
    rejectionReason: courseData.rejectionReason,
    rejectedAt: courseData.rejectedAt,
    rejectedBy: courseData.rejectedBy,
    canResubmit: courseData.canResubmit !== false,
    resubmissionCount: courseData.resubmissionCount || 0,
    previousRejection: courseData.previousRejection || null
  };
};

// Message functions
export const markMessageAsRead = async (messageId) => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, {
      isRead: true,
      readAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

// User Profile functions
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error('User profile not found');
    }
    
    return {
      id: userSnap.id,
      ...userSnap.data()
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp()
    });
    
    return {
      id: userId,
      ...profileData,
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
