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
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

const ANSWERS_COLLECTION = 'answers';
const QUESTIONS_COLLECTION = 'questions';

// Create a new answer
export const createAnswer = async (questionId, answerData, userId, userProfile) => {
  try {
    // Add answer to answers collection
    const answerDocData = {
      questionId,
      content: answerData.content,
      authorId: userId,
      author: userProfile?.displayName || 'Anonymous User',
      authorRole: userProfile?.role || 'Student',
      votes: 0,
      isAccepted: false,
      userVotes: {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const answerRef = await addDoc(collection(db, ANSWERS_COLLECTION), answerDocData);
    
    // Update question's answer count and status
    const questionRef = doc(db, QUESTIONS_COLLECTION, questionId);
    await updateDoc(questionRef, {
      answers: increment(1),
      isAnswered: true,
      updatedAt: serverTimestamp()
    });

    return {
      id: answerRef.id,
      ...answerDocData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error creating answer:', error);
    throw new Error('Failed to create answer. Please try again.');
  }
};

// Get answers for a specific question
export const getAnswers = async (questionId) => {
  try {
    const q = query(
      collection(db, ANSWERS_COLLECTION),
      where('questionId', '==', questionId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const answers = [];
    
    querySnapshot.forEach((doc) => {
      answers.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      });
    });

    return answers;
  } catch (error) {
    console.error('Error fetching answers:', error);
    return [];
  }
};

// Check if a lecturer has answered a specific question
export const hasLecturerAnswered = async (questionId, lecturerId) => {
  try {
    const q = query(
      collection(db, ANSWERS_COLLECTION),
      where('questionId', '==', questionId),
      where('authorId', '==', lecturerId)
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking lecturer answer:', error);
    return false;
  }
};

// Get all questions answered by a lecturer
export const getLecturerAnswers = async (lecturerId) => {
  try {
    const q = query(
      collection(db, ANSWERS_COLLECTION),
      where('authorId', '==', lecturerId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const answers = [];
    
    querySnapshot.forEach((doc) => {
      answers.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      });
    });

    return answers;
  } catch (error) {
    console.error('Error fetching lecturer answers:', error);
    return [];
  }
};

// Vote on an answer
export const voteAnswer = async (answerId, userId, voteType) => {
  try {
    const answerRef = doc(db, ANSWERS_COLLECTION, answerId);
    const answerSnap = await getDoc(answerRef);
    
    if (!answerSnap.exists()) {
      throw new Error('Answer not found');
    }
    
    const answerData = answerSnap.data();
    const currentUserVotes = answerData.userVotes || {};
    const currentVote = currentUserVotes[userId];
    
    let voteChange = 0;
    let newVote = null;
    
    if (currentVote === voteType) {
      // Remove vote
      voteChange = voteType === 'up' ? -1 : 1;
      delete currentUserVotes[userId];
    } else {
      // Add or change vote
      if (currentVote) {
        // Changing from one vote to another
        voteChange = voteType === 'up' ? 2 : -2;
      } else {
        // New vote
        voteChange = voteType === 'up' ? 1 : -1;
      }
      currentUserVotes[userId] = voteType;
      newVote = voteType;
    }
    
    await updateDoc(answerRef, {
      votes: increment(voteChange),
      userVotes: currentUserVotes,
      updatedAt: serverTimestamp()
    });
    
    return { userVote: newVote, voteChange };
  } catch (error) {
    console.error('Error voting on answer:', error);
    throw error;
  }
};

// Accept an answer (mark as best answer)
export const acceptAnswer = async (answerId, questionId, userId) => {
  try {
    // First, remove accepted status from any other answers for this question
    const q = query(
      collection(db, ANSWERS_COLLECTION),
      where('questionId', '==', questionId),
      where('isAccepted', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const batch = [];
    
    querySnapshot.forEach((doc) => {
      batch.push(updateDoc(doc.ref, { isAccepted: false }));
    });
    
    await Promise.all(batch);
    
    // Mark this answer as accepted
    const answerRef = doc(db, ANSWERS_COLLECTION, answerId);
    await updateDoc(answerRef, {
      isAccepted: true,
      acceptedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Update question to mark it as having an accepted answer
    const questionRef = doc(db, QUESTIONS_COLLECTION, questionId);
    await updateDoc(questionRef, {
      acceptedAnswerId: answerId,
      updatedAt: serverTimestamp()
    });
    
  } catch (error) {
    console.error('Error accepting answer:', error);
    throw error;
  }
};

// Update an answer
export const updateAnswer = async (answerId, updates) => {
  try {
    const answerRef = doc(db, ANSWERS_COLLECTION, answerId);
    await updateDoc(answerRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating answer:', error);
    throw error;
  }
};

// Delete an answer
export const deleteAnswer = async (answerId, questionId) => {
  try {
    // Delete the answer
    await deleteDoc(doc(db, ANSWERS_COLLECTION, answerId));
    
    // Update question's answer count
    const questionRef = doc(db, QUESTIONS_COLLECTION, questionId);
    const questionSnap = await getDoc(questionRef);
    
    if (questionSnap.exists()) {
      const questionData = questionSnap.data();
      const newAnswerCount = Math.max(0, (questionData.answers || 1) - 1);
      
      await updateDoc(questionRef, {
        answers: newAnswerCount,
        isAnswered: newAnswerCount > 0,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error deleting answer:', error);
    throw error;
  }
};

// Get answer statistics for a lecturer
export const getLecturerAnswerStats = async (lecturerId) => {
  try {
    const answers = await getLecturerAnswers(lecturerId);
    
    return {
      totalAnswers: answers.length,
      acceptedAnswers: answers.filter(a => a.isAccepted).length,
      totalVotes: answers.reduce((sum, a) => sum + (a.votes || 0), 0),
      averageVotes: answers.length > 0 ? answers.reduce((sum, a) => sum + (a.votes || 0), 0) / answers.length : 0
    };
  } catch (error) {
    console.error('Error getting lecturer answer stats:', error);
    return {
      totalAnswers: 0,
      acceptedAnswers: 0,
      totalVotes: 0,
      averageVotes: 0
    };
  }
};
