import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Get course analytics for a specific course
export const getCourseAnalytics = async (courseId) => {
  try {
    const [
      enrollments,
      transactions,
      courseData,
      lessons
    ] = await Promise.all([
      getEnrollmentAnalytics(courseId),
      getRevenueAnalytics(courseId),
      getCourseData(courseId),
      getLessonAnalytics(courseId)
    ]);

    return {
      course: courseData,
      enrollments,
      revenue: transactions,
      lessons,
      summary: {
        totalStudents: enrollments.length,
        totalRevenue: transactions.reduce((sum, t) => sum + t.amount, 0),
        completionRate: calculateCompletionRate(enrollments),
        averageRating: calculateAverageRating(enrollments),
        popularLesson: getMostPopularLesson(lessons),
        recentEnrollments: enrollments.slice(0, 5)
      }
    };
  } catch (error) {
    console.error('Error getting course analytics:', error);
    throw error;
  }
};

// Get lecturer dashboard analytics
export const getLecturerAnalytics = async (lecturerId) => {
  try {
    const [
      courses,
      totalEnrollments,
      totalRevenue,
      recentActivity,
      performanceMetrics
    ] = await Promise.all([
      getLecturerCourses(lecturerId),
      getTotalEnrollments(lecturerId),
      getTotalRevenue(lecturerId),
      getRecentActivity(lecturerId),
      getPerformanceMetrics(lecturerId)
    ]);

    return {
      overview: {
        totalCourses: courses.length,
        totalStudents: totalEnrollments,
        totalRevenue: totalRevenue,
        averageRating: performanceMetrics.averageRating,
        completionRate: performanceMetrics.completionRate
      },
      courses: courses.map(course => ({
        ...course,
        enrollmentTrend: getEnrollmentTrend(course.id),
        revenueTrend: getRevenueTrend(course.id)
      })),
      recentActivity,
      trends: {
        enrollmentsByMonth: await getEnrollmentsByMonth(lecturerId),
        revenueByMonth: await getRevenueByMonth(lecturerId),
        topPerformingCourses: await getTopPerformingCourses(lecturerId),
        studentFeedback: await getRecentFeedback(lecturerId)
      }
    };
  } catch (error) {
    console.error('Error getting lecturer analytics:', error);
    throw error;
  }
};

// Helper functions
const getEnrollmentAnalytics = async (courseId) => {
  try {
    const q = query(
      collection(db, 'enrollments'),
      where('courseId', '==', courseId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
  } catch (error) {
    console.error('Error getting enrollment analytics:', error);
    return [];
  }
};

const getRevenueAnalytics = async (courseId) => {
  try {
    const q = query(
      collection(db, 'transactions'),
      where('courseId', '==', courseId),
      where('status', '==', 'completed'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
  } catch (error) {
    console.error('Error getting revenue analytics:', error);
    return [];
  }
};

const getCourseData = async (courseId) => {
  try {
    const docRef = doc(db, 'courses', courseId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting course data:', error);
    return null;
  }
};

const getLessonAnalytics = async (courseId) => {
  try {
    const q = query(
      collection(db, 'lessons'),
      where('courseId', '==', courseId),
      orderBy('order', 'asc')
    );
    
    const snapshot = await getDocs(q);
    const lessons = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get view counts for each lesson (this would need to be tracked separately)
    return lessons.map(lesson => ({
      ...lesson,
      viewCount: Math.floor(Math.random() * 100), // Placeholder - implement real tracking
      completionRate: Math.floor(Math.random() * 100), // Placeholder
      averageWatchTime: Math.floor(Math.random() * 600) // Placeholder in seconds
    }));
  } catch (error) {
    console.error('Error getting lesson analytics:', error);
    return [];
  }
};

const getLecturerCourses = async (lecturerId) => {
  try {
    const q = query(
      collection(db, 'courses'),
      where('lecturerId', '==', lecturerId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
  } catch (error) {
    console.error('Error getting lecturer courses:', error);
    return [];
  }
};

const getTotalEnrollments = async (lecturerId) => {
  try {
    // Get all courses by lecturer
    const courses = await getLecturerCourses(lecturerId);
    const courseIds = courses.map(c => c.id);
    
    if (courseIds.length === 0) return 0;
    
    // Get enrollments for all courses
    let totalEnrollments = 0;
    for (const courseId of courseIds) {
      const enrollments = await getEnrollmentAnalytics(courseId);
      totalEnrollments += enrollments.length;
    }
    
    return totalEnrollments;
  } catch (error) {
    console.error('Error getting total enrollments:', error);
    return 0;
  }
};

const getTotalRevenue = async (lecturerId) => {
  try {
    const q = query(
      collection(db, 'transactions'),
      where('lecturerId', '==', lecturerId),
      where('status', '==', 'completed')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.reduce((total, doc) => {
      return total + (doc.data().lecturerEarning || 0);
    }, 0);
  } catch (error) {
    console.error('Error getting total revenue:', error);
    return 0;
  }
};

const getRecentActivity = async (lecturerId) => {
  try {
    // Get recent enrollments, questions, and transactions
    const courses = await getLecturerCourses(lecturerId);
    const courseIds = courses.map(c => c.id);
    
    const activities = [];
    
    // Recent enrollments
    for (const courseId of courseIds.slice(0, 3)) { // Limit for performance
      const enrollments = await getEnrollmentAnalytics(courseId);
      enrollments.slice(0, 3).forEach(enrollment => {
        activities.push({
          type: 'enrollment',
          message: `New student enrolled in ${courses.find(c => c.id === courseId)?.title}`,
          timestamp: enrollment.createdAt,
          studentName: enrollment.studentName || 'Anonymous'
        });
      });
    }
    
    // Sort by timestamp and return recent 10
    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
  } catch (error) {
    console.error('Error getting recent activity:', error);
    return [];
  }
};

const getPerformanceMetrics = async (lecturerId) => {
  try {
    // This would need real implementation based on student feedback and completion tracking
    return {
      averageRating: 4.5, // Placeholder
      completionRate: 78, // Placeholder
      studentSatisfaction: 85 // Placeholder
    };
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    return {
      averageRating: 0,
      completionRate: 0,
      studentSatisfaction: 0
    };
  }
};

const getEnrollmentsByMonth = async (lecturerId) => {
  try {
    const courses = await getLecturerCourses(lecturerId);
    const courseIds = courses.map(c => c.id);
    
    const monthlyData = {};
    
    for (const courseId of courseIds) {
      const enrollments = await getEnrollmentAnalytics(courseId);
      
      enrollments.forEach(enrollment => {
        const month = enrollment.createdAt.toISOString().slice(0, 7); // YYYY-MM
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      });
    }
    
    // Convert to array format for charts
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({
        month,
        enrollments: count
      }));
  } catch (error) {
    console.error('Error getting enrollments by month:', error);
    return [];
  }
};

const getRevenueByMonth = async (lecturerId) => {
  try {
    const q = query(
      collection(db, 'transactions'),
      where('lecturerId', '==', lecturerId),
      where('status', '==', 'completed'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const monthlyRevenue = {};
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const month = data.createdAt?.toDate().toISOString().slice(0, 7) || new Date().toISOString().slice(0, 7);
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (data.lecturerEarning || 0);
    });
    
    return Object.entries(monthlyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({
        month,
        revenue
      }));
  } catch (error) {
    console.error('Error getting revenue by month:', error);
    return [];
  }
};

const getTopPerformingCourses = async (lecturerId) => {
  try {
    const courses = await getLecturerCourses(lecturerId);
    
    const coursesWithMetrics = await Promise.all(
      courses.map(async (course) => {
        const enrollments = await getEnrollmentAnalytics(course.id);
        const revenue = await getRevenueAnalytics(course.id);
        
        return {
          ...course,
          enrollmentCount: enrollments.length,
          totalRevenue: revenue.reduce((sum, t) => sum + (t.lecturerEarning || 0), 0),
          rating: 4.5 // Placeholder
        };
      })
    );
    
    return coursesWithMetrics
      .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
      .slice(0, 5);
  } catch (error) {
    console.error('Error getting top performing courses:', error);
    return [];
  }
};

const getRecentFeedback = async (lecturerId) => {
  try {
    // This would need a feedback/reviews collection
    // Placeholder implementation
    return [
      {
        studentName: 'John Doe',
        courseName: 'Advanced Thermodynamics',
        rating: 5,
        comment: 'Excellent course! Very detailed explanations.',
        date: new Date()
      }
    ];
  } catch (error) {
    console.error('Error getting recent feedback:', error);
    return [];
  }
};

// Utility functions
const calculateCompletionRate = (enrollments) => {
  if (enrollments.length === 0) return 0;
  const completed = enrollments.filter(e => e.completed).length;
  return Math.round((completed / enrollments.length) * 100);
};

const calculateAverageRating = (enrollments) => {
  const ratings = enrollments.filter(e => e.rating).map(e => e.rating);
  if (ratings.length === 0) return 0;
  return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
};

const getMostPopularLesson = (lessons) => {
  if (lessons.length === 0) return null;
  return lessons.reduce((prev, current) => 
    (prev.viewCount > current.viewCount) ? prev : current
  );
};

const getEnrollmentTrend = (courseId) => {
  // Placeholder - would need historical data
  return 'increasing'; // 'increasing', 'decreasing', 'stable'
};

const getRevenueTrend = (courseId) => {
  // Placeholder - would need historical data
  return 'increasing'; // 'increasing', 'decreasing', 'stable'
};
