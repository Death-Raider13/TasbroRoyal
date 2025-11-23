import { doc, getDoc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION_NAME = 'userProgress';

export const getUserProgress = async (userId) => {
  if (!userId) return null;

  try {
    const ref = doc(db, COLLECTION_NAME, userId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return null;
    }

    return {
      id: snap.id,
      ...snap.data()
    };
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return null;
  }
};

export const addWatchTimeMinutes = async (userId, minutes) => {
  if (!userId || !minutes || minutes <= 0) return;

  try {
    const ref = doc(db, COLLECTION_NAME, userId);
    await setDoc(
      ref,
      {
        totalWatchTimeMinutes: increment(minutes),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error updating watch time:', error);
  }
};

export const recordLearningActivity = async (userId) => {
  if (!userId) return;

  try {
    const ref = doc(db, COLLECTION_NAME, userId);
    const snap = await getDoc(ref);

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10); // YYYY-MM-DD

    if (!snap.exists()) {
      await setDoc(
        ref,
        {
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: todayStr,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
      return;
    }

    const data = snap.data();
    const lastDateStr = data.lastActiveDate;

    if (lastDateStr === todayStr) {
      // Already counted today
      return;
    }

    let currentStreak = data.currentStreak || 0;
    let longestStreak = data.longestStreak || 0;

    if (lastDateStr) {
      const last = new Date(`${lastDateStr}T00:00:00Z`);
      const now = new Date(`${todayStr}T00:00:00Z`);
      const diffDays = Math.round((now - last) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    await setDoc(
      ref,
      {
        currentStreak,
        longestStreak,
        lastActiveDate: todayStr,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error recording learning activity:', error);
  }
};
