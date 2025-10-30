import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

const LIVE_SESSIONS_COLLECTION = 'liveSessions';
const SCHEDULES_COLLECTION = 'schedules';
const RECORDINGS_COLLECTION = 'recordings';

// ============ LIVE SESSION MANAGEMENT ============

// Create live session
export const createLiveSession = async (lecturerId, sessionData) => {
  try {
    const session = {
      lecturerId,
      courseId: sessionData.courseId,
      title: sessionData.title,
      description: sessionData.description,
      scheduledDate: Timestamp.fromDate(new Date(sessionData.scheduledDate)),
      duration: sessionData.duration, // in minutes
      maxParticipants: sessionData.maxParticipants || null,
      isRecorded: sessionData.isRecorded || false,
      status: 'scheduled', // 'scheduled', 'live', 'ended', 'cancelled'
      meetingId: null, // Will be generated when session starts
      meetingPassword: null,
      joinUrl: null,
      participants: [],
      recordingUrl: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, LIVE_SESSIONS_COLLECTION), session);
    return {
      id: docRef.id,
      ...session,
      scheduledDate: session.scheduledDate.toDate(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error creating live session:', error);
    throw new Error('Failed to create live session. Please try again.');
  }
};

// Get lecturer's live sessions
export const getLecturerLiveSessions = async (lecturerId) => {
  try {
    const q = query(
      collection(db, LIVE_SESSIONS_COLLECTION),
      where('lecturerId', '==', lecturerId),
      orderBy('scheduledDate', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      scheduledDate: doc.data().scheduledDate?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    }));
  } catch (error) {
    console.error('Error getting lecturer live sessions:', error);
    return [];
  }
};

// Get course live sessions
export const getCourseLiveSessions = async (courseId) => {
  try {
    const q = query(
      collection(db, LIVE_SESSIONS_COLLECTION),
      where('courseId', '==', courseId),
      orderBy('scheduledDate', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      scheduledDate: doc.data().scheduledDate?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    }));
  } catch (error) {
    console.error('Error getting course live sessions:', error);
    return [];
  }
};

// Start live session with Agora integration
export const startLiveSession = async (sessionId) => {
  try {
    // Generate Agora channel credentials
    const channelName = `live_session_${sessionId}`;
    const meetingId = channelName;
    const joinUrl = `${window.location.origin}/live-session/${sessionId}`;
    
    // In production, generate a proper token server-side
    // For now, we'll use the temp token from environment
    const token = import.meta.env.VITE_AGORA_TEMP_TOKEN;

    const sessionRef = doc(db, LIVE_SESSIONS_COLLECTION, sessionId);
    await updateDoc(sessionRef, {
      status: 'live',
      meetingId,
      channelName,
      joinUrl,
      agoraToken: token, // Store token for participants
      startedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { 
      meetingId, 
      channelName, 
      joinUrl, 
      token,
      appId: import.meta.env.VITE_AGORA_APP_ID 
    };
  } catch (error) {
    console.error('Error starting live session:', error);
    throw new Error('Failed to start live session. Please try again.');
  }
};

// Get single live session
export const getLiveSession = async (sessionId) => {
  try {
    const sessionRef = doc(db, LIVE_SESSIONS_COLLECTION, sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (!sessionDoc.exists()) {
      return null;
    }
    
    const data = sessionDoc.data();
    return {
      id: sessionDoc.id,
      ...data,
      scheduledDate: data.scheduledDate?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      startedAt: data.startedAt?.toDate() || null,
      endedAt: data.endedAt?.toDate() || null
    };
  } catch (error) {
    console.error('Error getting live session:', error);
    throw new Error('Failed to get live session. Please try again.');
  }
};

// Join live session (add participant)
export const joinLiveSession = async (sessionId, userId) => {
  try {
    const sessionRef = doc(db, LIVE_SESSIONS_COLLECTION, sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (!sessionDoc.exists()) {
      throw new Error('Session not found');
    }
    
    const sessionData = sessionDoc.data();
    const participants = sessionData.participants || [];
    
    // Add participant if not already in the list
    if (!participants.includes(userId)) {
      await updateDoc(sessionRef, {
        participants: [...participants, userId],
        updatedAt: serverTimestamp()
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error joining live session:', error);
    throw new Error('Failed to join live session. Please try again.');
  }
};

// End live session
export const endLiveSession = async (sessionId, recordingUrl = null) => {
  try {
    const sessionRef = doc(db, LIVE_SESSIONS_COLLECTION, sessionId);
    await updateDoc(sessionRef, {
      status: 'ended',
      endedAt: serverTimestamp(),
      recordingUrl,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error ending live session:', error);
    throw new Error('Failed to end live session. Please try again.');
  }
};


// Get live sessions for students (based on enrolled courses)
export const getStudentLiveSessions = async (studentId) => {
  try {
    // First, get all courses the student is enrolled in
    const enrollmentsSnapshot = await getDocs(
      query(collection(db, 'enrollments'), where('studentId', '==', studentId))
    );
    
    const enrolledCourseIds = enrollmentsSnapshot.docs.map(doc => doc.data().courseId);
    
    if (enrolledCourseIds.length === 0) {
      return { upcoming: [], live: [], past: [] };
    }
    
    // Get all live sessions for enrolled courses
    const sessionsSnapshot = await getDocs(
      query(
        collection(db, LIVE_SESSIONS_COLLECTION),
        where('courseId', 'in', enrolledCourseIds),
        orderBy('scheduledDate', 'desc')
      )
    );
    
    const now = new Date();
    const sessions = sessionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      scheduledDate: doc.data().scheduledDate?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      startedAt: doc.data().startedAt?.toDate() || null,
      endedAt: doc.data().endedAt?.toDate() || null
    }));
    
    // Categorize sessions
    const upcoming = sessions.filter(session => 
      session.status === 'scheduled' && session.scheduledDate > now
    );
    
    const live = sessions.filter(session => 
      session.status === 'live'
    );
    
    const past = sessions.filter(session => 
      session.status === 'ended' || (session.scheduledDate < now && session.status === 'scheduled')
    );
    
    return { upcoming, live, past };
  } catch (error) {
    console.error('Error getting student live sessions:', error);
    return { upcoming: [], live: [], past: [] };
  }
};

// Update live session
export const updateLiveSession = async (sessionId, updates) => {
  try {
    const sessionRef = doc(db, LIVE_SESSIONS_COLLECTION, sessionId);
    await updateDoc(sessionRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating live session:', error);
    throw error;
  }
};

// Delete live session
export const deleteLiveSession = async (sessionId) => {
  try {
    await deleteDoc(doc(db, LIVE_SESSIONS_COLLECTION, sessionId));
  } catch (error) {
    console.error('Error deleting live session:', error);
    throw error;
  }
};

// ============ RECURRING SCHEDULES ============

// Create recurring schedule
export const createRecurringSchedule = async (lecturerId, scheduleData) => {
  try {
    const schedule = {
      lecturerId,
      courseId: scheduleData.courseId,
      title: scheduleData.title,
      description: scheduleData.description,
      recurrenceType: scheduleData.recurrenceType, // 'weekly', 'biweekly', 'monthly'
      dayOfWeek: scheduleData.dayOfWeek, // 0-6 (Sunday-Saturday)
      time: scheduleData.time, // HH:MM format
      duration: scheduleData.duration, // in minutes
      startDate: Timestamp.fromDate(new Date(scheduleData.startDate)),
      endDate: scheduleData.endDate ? Timestamp.fromDate(new Date(scheduleData.endDate)) : null,
      maxParticipants: scheduleData.maxParticipants || null,
      isRecorded: scheduleData.isRecorded || false,
      isActive: true,
      timezone: scheduleData.timezone || 'Africa/Lagos',
      generatedSessions: [], // Array of session IDs generated from this schedule
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, SCHEDULES_COLLECTION), schedule);
    return {
      id: docRef.id,
      ...schedule,
      startDate: schedule.startDate.toDate(),
      endDate: schedule.endDate?.toDate() || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error creating recurring schedule:', error);
    throw new Error('Failed to create recurring schedule. Please try again.');
  }
};

// Get lecturer's schedules
export const getLecturerSchedules = async (lecturerId) => {
  try {
    const q = query(
      collection(db, SCHEDULES_COLLECTION),
      where('lecturerId', '==', lecturerId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate() || new Date(),
      endDate: doc.data().endDate?.toDate() || null,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    }));
  } catch (error) {
    console.error('Error getting lecturer schedules:', error);
    return [];
  }
};

// Generate sessions from recurring schedule
export const generateSessionsFromSchedule = async (scheduleId) => {
  try {
    const scheduleRef = doc(db, SCHEDULES_COLLECTION, scheduleId);
    const scheduleDoc = await getDoc(scheduleRef);
    
    if (!scheduleDoc.exists()) {
      throw new Error('Schedule not found');
    }

    const schedule = scheduleDoc.data();
    const sessions = [];
    const now = new Date();
    const endDate = schedule.endDate?.toDate() || new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 3 months default

    let currentDate = new Date(Math.max(schedule.startDate.toDate(), now));
    
    // Find next occurrence of the scheduled day
    while (currentDate.getDay() !== schedule.dayOfWeek) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    while (currentDate <= endDate) {
      const sessionDate = new Date(currentDate);
      const [hours, minutes] = schedule.time.split(':');
      sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Only create future sessions
      if (sessionDate > now) {
        const sessionData = {
          courseId: schedule.courseId,
          title: schedule.title,
          description: schedule.description,
          scheduledDate: sessionDate,
          duration: schedule.duration,
          maxParticipants: schedule.maxParticipants,
          isRecorded: schedule.isRecorded
        };

        const session = await createLiveSession(schedule.lecturerId, sessionData);
        sessions.push(session);
      }

      // Calculate next occurrence based on recurrence type
      switch (schedule.recurrenceType) {
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'biweekly':
          currentDate.setDate(currentDate.getDate() + 14);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        default:
          currentDate.setDate(currentDate.getDate() + 7);
      }
    }

    // Update schedule with generated session IDs
    await updateDoc(scheduleRef, {
      generatedSessions: [...schedule.generatedSessions, ...sessions.map(s => s.id)],
      lastGenerated: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return sessions;
  } catch (error) {
    console.error('Error generating sessions from schedule:', error);
    throw error;
  }
};

// ============ ANALYTICS & REPORTING ============

// Get live session analytics
export const getLiveSessionAnalytics = async (lecturerId) => {
  try {
    const sessions = await getLecturerLiveSessions(lecturerId);
    
    const analytics = {
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.status === 'ended').length,
      upcomingSessions: sessions.filter(s => s.status === 'scheduled' && new Date(s.scheduledDate) > new Date()).length,
      liveSessions: sessions.filter(s => s.status === 'live').length,
      totalParticipants: sessions.reduce((sum, s) => sum + (s.participants?.length || 0), 0),
      averageParticipants: sessions.length > 0 
        ? Math.round(sessions.reduce((sum, s) => sum + (s.participants?.length || 0), 0) / sessions.length)
        : 0,
      recordedSessions: sessions.filter(s => s.recordingUrl).length,
      totalDuration: sessions.reduce((sum, s) => sum + (s.duration || 0), 0), // in minutes
      recentSessions: sessions
        .filter(s => s.status === 'ended')
        .sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate))
        .slice(0, 5)
    };

    return analytics;
  } catch (error) {
    console.error('Error getting live session analytics:', error);
    return {
      totalSessions: 0,
      completedSessions: 0,
      upcomingSessions: 0,
      liveSessions: 0,
      totalParticipants: 0,
      averageParticipants: 0,
      recordedSessions: 0,
      totalDuration: 0,
      recentSessions: []
    };
  }
};

// Get upcoming sessions for dashboard
export const getUpcomingSessions = async (lecturerId, limit = 5) => {
  try {
    const sessions = await getLecturerLiveSessions(lecturerId);
    const now = new Date();
    
    return sessions
      .filter(s => s.status === 'scheduled' && new Date(s.scheduledDate) > now)
      .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting upcoming sessions:', error);
    return [];
  }
};

// Check if lecturer has live session capability
export const checkLiveSessionCapability = async (lecturerId) => {
  try {
    // In a real implementation, this would check subscription status, verification, etc.
    // For now, we'll assume all lecturers have access
    return {
      hasAccess: true,
      maxConcurrentSessions: 5,
      maxParticipantsPerSession: 100,
      canRecord: true,
      canScheduleRecurring: true
    };
  } catch (error) {
    console.error('Error checking live session capability:', error);
    return {
      hasAccess: false,
      maxConcurrentSessions: 0,
      maxParticipantsPerSession: 0,
      canRecord: false,
      canScheduleRecurring: false
    };
  }
};

// Get live sessions for multiple courses (for students)
export const getLiveSessionsForCourses = async (courseIds) => {
  try {
    if (!courseIds || courseIds.length === 0) {
      return [];
    }

    // Firestore 'in' queries are limited to 10 items, so we need to batch if more courses
    const batches = [];
    for (let i = 0; i < courseIds.length; i += 10) {
      const batch = courseIds.slice(i, i + 10);
      batches.push(batch);
    }

    const allSessions = [];
    
    for (const batch of batches) {
      const q = query(
        collection(db, LIVE_SESSIONS_COLLECTION),
        where('courseId', 'in', batch),
        orderBy('scheduledDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const batchSessions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledDate: doc.data().scheduledDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        startedAt: doc.data().startedAt?.toDate() || null,
        endedAt: doc.data().endedAt?.toDate() || null
      }));
      
      allSessions.push(...batchSessions);
    }

    return allSessions;
  } catch (error) {
    console.error('Error fetching live sessions for courses:', error);
    throw error;
  }
};


// Get student's live session history
export const getStudentLiveSessionHistory = async (studentId) => {
  try {
    const q = query(
      collection(db, 'liveSessions'),
      where('participants', 'array-contains', studentId),
      orderBy('startTime', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching student live session history:', error);
    throw error;
  }
};
