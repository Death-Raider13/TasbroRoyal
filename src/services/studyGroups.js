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
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION_NAME = 'studyGroups';

// Mock data as fallback
const MOCK_STUDY_GROUPS = [
  {
    id: '1',
    name: "Thermodynamics Study Circle",
    description: "Weekly study sessions covering heat transfer, energy systems, and thermodynamic cycles. Perfect for ME students preparing for exams.",
    category: "Mechanical Engineering",
    type: "Hybrid",
    members: 24,
    maxMembers: 30,
    memberIds: [],
    meetingTime: "Saturdays 2:00 PM",
    location: "University of Lagos, Room 204 / Zoom",
    organizer: "Dr. Adebayo Ogundimu",
    organizerId: "mock-organizer-1",
    rating: 4.8,
    ratings: [],
    tags: ["Exam Prep", "Weekly", "Interactive"],
    nextMeeting: "2024-01-20",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=200&fit=crop",
    createdAt: new Date("2024-01-10T10:00:00Z"),
    updatedAt: new Date("2024-01-10T10:00:00Z"),
    isActive: true
  },
  {
    id: '2',
    name: "Structural Analysis Masterclass",
    description: "Deep dive into structural engineering principles, beam analysis, and design calculations with real-world projects.",
    category: "Civil Engineering",
    type: "Online",
    members: 18,
    maxMembers: 25,
    memberIds: [],
    meetingTime: "Tuesdays & Thursdays 6:00 PM",
    location: "Google Meet",
    organizer: "Eng. Fatima Abdullahi",
    organizerId: "mock-organizer-2",
    rating: 4.9,
    ratings: [],
    tags: ["Advanced", "Project-Based", "Bi-weekly"],
    nextMeeting: "2024-01-18",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=200&fit=crop",
    createdAt: new Date("2024-01-08T14:00:00Z"),
    updatedAt: new Date("2024-01-08T14:00:00Z"),
    isActive: true
  },
  {
    id: '3',
    name: "Circuit Design & Analysis",
    description: "Hands-on electronics and circuit design sessions. Build projects while learning fundamental EE concepts.",
    category: "Electrical Engineering",
    type: "In-Person",
    members: 15,
    maxMembers: 20,
    memberIds: [],
    meetingTime: "Wednesdays 4:00 PM",
    location: "UNILAG Engineering Lab",
    organizer: "Prof. Chinedu Okwu",
    organizerId: "mock-organizer-3",
    rating: 4.7,
    ratings: [],
    tags: ["Hands-on", "Lab Work", "Beginner Friendly"],
    nextMeeting: "2024-01-17",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop",
    createdAt: new Date("2024-01-05T16:00:00Z"),
    updatedAt: new Date("2024-01-05T16:00:00Z"),
    isActive: true
  }
];

// Create a new study group
export const createStudyGroup = async (groupData, userId, userProfile) => {
  try {
    const docData = {
      ...groupData,
      organizerId: userId,
      organizer: userProfile?.displayName || 'Anonymous User',
      members: 1, // Creator is the first member
      memberIds: [userId],
      rating: 0,
      ratings: [],
      isActive: true,
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
    console.error('Error creating study group:', error);
    throw new Error('Failed to create study group. Please try again.');
  }
};

// Get all study groups with optional filtering
export const getStudyGroups = async (filters = {}) => {
  try {
    let q = collection(db, COLLECTION_NAME);
    
    // Apply filters
    if (filters.category && filters.category !== 'All') {
      q = query(q, where('category', '==', filters.category));
    }
    
    if (filters.type && filters.type !== 'All') {
      q = query(q, where('type', '==', filters.type));
    }
    
    // Only show active groups
    q = query(q, where('isActive', '==', true));
    
    // Apply sorting - default by creation date
    q = query(q, orderBy('createdAt', 'desc'));

    const querySnapshot = await getDocs(q);
    const studyGroups = [];
    
    querySnapshot.forEach((doc) => {
      studyGroups.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      });
    });

    // If no groups found, return mock data as fallback
    if (studyGroups.length === 0) {
      console.log('No study groups found in Firebase, using mock data');
      return MOCK_STUDY_GROUPS;
    }

    return studyGroups;
  } catch (error) {
    console.error('Error fetching study groups:', error);
    console.log('Using mock data as fallback');
    return MOCK_STUDY_GROUPS;
  }
};

// Get a single study group by ID
export const getStudyGroup = async (groupId) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, groupId);
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
      const mockGroup = MOCK_STUDY_GROUPS.find(g => g.id === groupId);
      if (mockGroup) {
        return mockGroup;
      }
      throw new Error('Study group not found');
    }
  } catch (error) {
    console.error('Error fetching study group:', error);
    // Try to find in mock data
    const mockGroup = MOCK_STUDY_GROUPS.find(g => g.id === groupId);
    if (mockGroup) {
      return mockGroup;
    }
    throw error;
  }
};

// Join a study group
export const joinStudyGroup = async (groupId, userId) => {
  try {
    const groupRef = doc(db, COLLECTION_NAME, groupId);
    const groupSnap = await getDoc(groupRef);
    
    if (!groupSnap.exists()) {
      throw new Error('Study group not found');
    }
    
    const groupData = groupSnap.data();
    
    // Check if group is full
    if (groupData.members >= groupData.maxMembers) {
      throw new Error('Study group is full');
    }
    
    // Check if user is already a member
    if (groupData.memberIds && groupData.memberIds.includes(userId)) {
      throw new Error('You are already a member of this group');
    }
    
    await updateDoc(groupRef, {
      members: increment(1),
      memberIds: arrayUnion(userId),
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error joining study group:', error);
    throw error;
  }
};

// Leave a study group
export const leaveStudyGroup = async (groupId, userId) => {
  try {
    const groupRef = doc(db, COLLECTION_NAME, groupId);
    const groupSnap = await getDoc(groupRef);
    
    if (!groupSnap.exists()) {
      throw new Error('Study group not found');
    }
    
    const groupData = groupSnap.data();
    
    // Check if user is the organizer
    if (groupData.organizerId === userId) {
      throw new Error('Organizers cannot leave their own group. Please delete the group instead.');
    }
    
    // Check if user is a member
    if (!groupData.memberIds || !groupData.memberIds.includes(userId)) {
      throw new Error('You are not a member of this group');
    }
    
    await updateDoc(groupRef, {
      members: increment(-1),
      memberIds: arrayRemove(userId),
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error leaving study group:', error);
    throw error;
  }
};

// Rate a study group
export const rateStudyGroup = async (groupId, userId, rating) => {
  try {
    const groupRef = doc(db, COLLECTION_NAME, groupId);
    const groupSnap = await getDoc(groupRef);
    
    if (!groupSnap.exists()) {
      throw new Error('Study group not found');
    }
    
    const groupData = groupSnap.data();
    const ratings = groupData.ratings || [];
    
    // Remove existing rating from this user
    const filteredRatings = ratings.filter(r => r.userId !== userId);
    
    // Add new rating
    filteredRatings.push({ userId, rating, createdAt: new Date() });
    
    // Calculate new average rating
    const averageRating = filteredRatings.reduce((sum, r) => sum + r.rating, 0) / filteredRatings.length;
    
    await updateDoc(groupRef, {
      ratings: filteredRatings,
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      updatedAt: serverTimestamp()
    });
    
    return { success: true, newRating: averageRating };
  } catch (error) {
    console.error('Error rating study group:', error);
    throw error;
  }
};

// Update study group
export const updateStudyGroup = async (groupId, updates) => {
  try {
    const groupRef = doc(db, COLLECTION_NAME, groupId);
    await updateDoc(groupRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating study group:', error);
    throw error;
  }
};

// Delete study group
export const deleteStudyGroup = async (groupId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, groupId));
  } catch (error) {
    console.error('Error deleting study group:', error);
    throw error;
  }
};

// Search study groups
export const searchStudyGroups = async (searchQuery, filters = {}) => {
  try {
    // For now, get all groups and filter client-side
    // In production, you'd want to use Algolia or similar for full-text search
    const groups = await getStudyGroups(filters);
    
    if (!searchQuery) return groups;
    
    const lowercaseQuery = searchQuery.toLowerCase();
    return groups.filter(group =>
      group.name.toLowerCase().includes(lowercaseQuery) ||
      group.description.toLowerCase().includes(lowercaseQuery) ||
      group.organizer.toLowerCase().includes(lowercaseQuery) ||
      group.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  } catch (error) {
    console.error('Error searching study groups:', error);
    return [];
  }
};

// Get user's study groups
export const getUserStudyGroups = async (userId) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('memberIds', 'array-contains', userId),
      where('isActive', '==', true),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const studyGroups = [];
    
    querySnapshot.forEach((doc) => {
      studyGroups.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      });
    });

    return studyGroups;
  } catch (error) {
    console.error('Error fetching user study groups:', error);
    return [];
  }
};
