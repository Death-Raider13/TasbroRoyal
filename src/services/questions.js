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

const COLLECTION_NAME = 'questions';

// Mock data as fallback
const MOCK_QUESTIONS = [
  {
    id: '1',
    title: "How to calculate the efficiency of a heat engine in thermodynamics?",
    content: "I'm struggling with understanding the Carnot cycle and how to calculate the theoretical maximum efficiency. Can someone explain the formula and provide a practical example?",
    author: "Adebayo Ogundimu",
    authorId: "mock-user-1",
    authorRole: "Student",
    category: "Mechanical Engineering",
    tags: ["Thermodynamics", "Heat Engine", "Carnot Cycle", "Efficiency"],
    votes: 24,
    answers: 5,
    views: 156,
    createdAt: new Date("2024-01-15T10:30:00Z"),
    updatedAt: new Date("2024-01-15T10:30:00Z"),
    isAnswered: true,
    acceptedAnswerId: null,
    userVotes: {} // userId -> 'up' | 'down'
  },
  {
    id: '2',
    title: "Best practices for reinforced concrete beam design?",
    content: "Working on a structural design project and need guidance on proper reinforcement placement, cover requirements, and load calculations for RC beams.",
    author: "Fatima Abdullahi",
    authorId: "mock-user-2",
    authorRole: "Graduate Student",
    category: "Civil Engineering",
    tags: ["Concrete", "Structural Design", "Reinforcement", "Beams"],
    votes: 18,
    answers: 3,
    views: 89,
    createdAt: new Date("2024-01-14T15:45:00Z"),
    updatedAt: new Date("2024-01-14T15:45:00Z"),
    isAnswered: false,
    acceptedAnswerId: null,
    userVotes: {}
  },
  {
    id: '3',
    title: "Understanding Kirchhoff's laws in complex circuits",
    content: "I'm having trouble applying KVL and KCL to circuits with multiple loops and nodes. Any tips for systematic analysis?",
    author: "Chinedu Okwu",
    authorId: "mock-user-3",
    authorRole: "Student",
    category: "Electrical Engineering",
    tags: ["Circuit Analysis", "Kirchhoff Laws", "KVL", "KCL"],
    votes: 31,
    answers: 7,
    views: 203,
    createdAt: new Date("2024-01-13T09:20:00Z"),
    updatedAt: new Date("2024-01-13T09:20:00Z"),
    isAnswered: true,
    acceptedAnswerId: null,
    userVotes: {}
  }
];

// Create a new question
export const createQuestion = async (questionData, userId, userProfile) => {
  try {
    const docData = {
      ...questionData,
      authorId: userId,
      author: userProfile?.displayName || 'Anonymous User',
      authorRole: userProfile?.role || 'Student',
      votes: 0,
      answers: 0,
      views: 0,
      isAnswered: false,
      acceptedAnswerId: null,
      userVotes: {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
    
    return {
      id: docRef.id,
      ...docData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error creating question:', error);
    throw new Error('Failed to create question. Please try again.');
  }
};

// Get all questions with optional filtering
export const getQuestions = async (filters = {}) => {
  try {
    let q = collection(db, COLLECTION_NAME);
    
    // Apply filters
    if (filters.category && filters.category !== 'All') {
      q = query(q, where('category', '==', filters.category));
    }
    
    // Apply sorting
    switch (filters.sortBy) {
      case 'popular':
        q = query(q, orderBy('votes', 'desc'));
        break;
      case 'unanswered':
        q = query(q, where('isAnswered', '==', false), orderBy('createdAt', 'desc'));
        break;
      case 'newest':
      default:
        q = query(q, orderBy('createdAt', 'desc'));
        break;
    }

    const querySnapshot = await getDocs(q);
    const questions = [];
    
    querySnapshot.forEach((doc) => {
      questions.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      });
    });

    // If no questions found, return mock data as fallback
    if (questions.length === 0) {
      console.log('No questions found in Firebase, using mock data');
      return MOCK_QUESTIONS;
    }

    return questions;
  } catch (error) {
    console.error('Error fetching questions:', error);
    console.log('Using mock data as fallback');
    return MOCK_QUESTIONS;
  }
};

// Get a single question by ID
export const getQuestion = async (questionId) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, questionId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
    } else {
      // Try to find in mock data
      const mockQuestion = MOCK_QUESTIONS.find(q => q.id === questionId);
      if (mockQuestion) {
        return mockQuestion;
      }
      throw new Error('Question not found');
    }
  } catch (error) {
    console.error('Error fetching question:', error);
    // Try to find in mock data
    const mockQuestion = MOCK_QUESTIONS.find(q => q.id === questionId);
    if (mockQuestion) {
      return mockQuestion;
    }
    throw error;
  }
};

// Vote on a question
export const voteQuestion = async (questionId, userId, voteType) => {
  try {
    const questionRef = doc(db, COLLECTION_NAME, questionId);
    const questionSnap = await getDoc(questionRef);
    
    if (!questionSnap.exists()) {
      throw new Error('Question not found');
    }
    
    const questionData = questionSnap.data();
    const currentUserVotes = questionData.userVotes || {};
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
    
    await updateDoc(questionRef, {
      votes: increment(voteChange),
      userVotes: currentUserVotes,
      updatedAt: serverTimestamp()
    });
    
    return { userVote: newVote, voteChange };
  } catch (error) {
    console.error('Error voting on question:', error);
    throw error;
  }
};

// Increment view count
export const incrementViews = async (questionId) => {
  try {
    const questionRef = doc(db, COLLECTION_NAME, questionId);
    await updateDoc(questionRef, {
      views: increment(1),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error incrementing views:', error);
    // Don't throw error for view tracking
  }
};

// Update question
export const updateQuestion = async (questionId, updates) => {
  try {
    const questionRef = doc(db, COLLECTION_NAME, questionId);
    await updateDoc(questionRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};

// Delete question
export const deleteQuestion = async (questionId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, questionId));
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};

// Search questions
export const searchQuestions = async (searchQuery, filters = {}) => {
  try {
    // For now, get all questions and filter client-side
    // In production, you'd want to use Algolia or similar for full-text search
    const questions = await getQuestions(filters);
    
    if (!searchQuery) return questions;
    
    const lowercaseQuery = searchQuery.toLowerCase();
    return questions.filter(question =>
      question.title.toLowerCase().includes(lowercaseQuery) ||
      question.content.toLowerCase().includes(lowercaseQuery) ||
      question.author.toLowerCase().includes(lowercaseQuery) ||
      question.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  } catch (error) {
    console.error('Error searching questions:', error);
    return [];
  }
};
