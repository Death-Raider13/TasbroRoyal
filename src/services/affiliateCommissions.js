import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  getDoc,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

const COMMISSIONS_COLLECTION = 'affiliateCommissions';
const PAYOUTS_COLLECTION = 'affiliatePayouts';

// Commission rate (10% of course price)
const COMMISSION_RATE = 0.10;

// Create commission record when affiliate conversion happens
export const createAffiliateCommission = async (affiliateCode, courseId, courseName, coursePrice, studentId) => {
  try {
    // First, get the affiliate link details to find the affiliate (lecturer)
    const affiliateLinksQuery = query(
      collection(db, 'affiliateLinks'),
      where('affiliateCode', '==', affiliateCode)
    );
    
    const affiliateSnapshot = await getDocs(affiliateLinksQuery);
    if (affiliateSnapshot.empty) {
      throw new Error('Affiliate link not found');
    }
    
    const affiliateLink = affiliateSnapshot.docs[0].data();
    const commissionAmount = coursePrice * COMMISSION_RATE;
    
    // Get lecturer name from users collection
    let affiliateName = 'Unknown Lecturer';
    try {
      const lecturerDoc = await getDoc(doc(db, 'users', affiliateLink.lecturerId));
      if (lecturerDoc.exists()) {
        affiliateName = lecturerDoc.data().displayName || lecturerDoc.data().firstName || 'Unknown Lecturer';
      }
    } catch (error) {
      console.log('Could not fetch lecturer name:', error);
    }
    
    const commission = {
      affiliateCode,
      affiliateId: affiliateLink.lecturerId, // The lecturer who created the affiliate link
      affiliateName,
      courseId,
      courseName,
      coursePrice,
      commissionAmount,
      commissionRate: COMMISSION_RATE,
      studentId,
      status: 'pending', // pending, approved, paid
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, COMMISSIONS_COLLECTION), commission);
    console.log('Commission created:', docRef.id);
    
    return {
      id: docRef.id,
      ...commission,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error creating affiliate commission:', error);
    throw new Error('Failed to create commission record');
  }
};

// Get commissions for a specific affiliate (lecturer)
export const getAffiliateCommissions = async (affiliateId) => {
  try {
    const q = query(
      collection(db, COMMISSIONS_COLLECTION),
      where('affiliateId', '==', affiliateId),
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
    console.error('Error getting affiliate commissions:', error);
    return [];
  }
};

// Get commission summary for affiliate
export const getCommissionSummary = async (affiliateId) => {
  try {
    const commissions = await getAffiliateCommissions(affiliateId);
    
    const summary = {
      totalCommissions: 0,
      pendingCommissions: 0,
      approvedCommissions: 0,
      paidCommissions: 0,
      totalConversions: commissions.length,
      pendingAmount: 0,
      approvedAmount: 0,
      paidAmount: 0
    };
    
    commissions.forEach(commission => {
      summary.totalCommissions += commission.commissionAmount;
      
      switch (commission.status) {
        case 'pending':
          summary.pendingCommissions++;
          summary.pendingAmount += commission.commissionAmount;
          break;
        case 'approved':
          summary.approvedCommissions++;
          summary.approvedAmount += commission.commissionAmount;
          break;
        case 'paid':
          summary.paidCommissions++;
          summary.paidAmount += commission.commissionAmount;
          break;
      }
    });
    
    return summary;
  } catch (error) {
    console.error('Error getting commission summary:', error);
    return null;
  }
};

// Request payout for approved commissions
export const requestCommissionPayout = async (affiliateId, amount, paymentDetails) => {
  try {
    const payout = {
      affiliateId,
      amount,
      paymentDetails, // { method: 'bank', accountNumber: '...', bankName: '...' }
      status: 'requested', // requested, processing, completed, failed
      requestedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, PAYOUTS_COLLECTION), payout);
    
    // Update commission status to 'processing'
    const commissionsQuery = query(
      collection(db, COMMISSIONS_COLLECTION),
      where('affiliateId', '==', affiliateId),
      where('status', '==', 'approved')
    );
    
    const commissionsSnapshot = await getDocs(commissionsQuery);
    const updatePromises = commissionsSnapshot.docs.map(commissionDoc => 
      updateDoc(commissionDoc.ref, {
        status: 'processing',
        payoutId: docRef.id,
        updatedAt: serverTimestamp()
      })
    );
    
    await Promise.all(updatePromises);
    
    return {
      id: docRef.id,
      ...payout,
      requestedAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error requesting payout:', error);
    throw new Error('Failed to request payout');
  }
};

// Get payout history for affiliate
export const getPayoutHistory = async (affiliateId) => {
  try {
    const q = query(
      collection(db, PAYOUTS_COLLECTION),
      where('affiliateId', '==', affiliateId),
      orderBy('requestedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      requestedAt: doc.data().requestedAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    }));
  } catch (error) {
    console.error('Error getting payout history:', error);
    return [];
  }
};

// Admin functions for managing commissions
export const approveCommission = async (commissionId) => {
  try {
    const commissionRef = doc(db, COMMISSIONS_COLLECTION, commissionId);
    await updateDoc(commissionRef, {
      status: 'approved',
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error approving commission:', error);
    throw new Error('Failed to approve commission');
  }
};

export const markCommissionPaid = async (commissionId) => {
  try {
    const commissionRef = doc(db, COMMISSIONS_COLLECTION, commissionId);
    await updateDoc(commissionRef, {
      status: 'paid',
      paidAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking commission as paid:', error);
    throw new Error('Failed to mark commission as paid');
  }
};
