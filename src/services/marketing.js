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
  increment
} from 'firebase/firestore';
import { db } from './firebase';

const COUPONS_COLLECTION = 'coupons';
const PROMOTIONS_COLLECTION = 'promotions';
const AFFILIATE_LINKS_COLLECTION = 'affiliateLinks';

// ============ COUPON MANAGEMENT ============

// Create discount coupon
export const createCoupon = async (lecturerId, couponData) => {
  try {
    const coupon = {
      lecturerId,
      code: couponData.code.toUpperCase(),
      title: couponData.title,
      description: couponData.description,
      discountType: couponData.discountType, // 'percentage' or 'fixed'
      discountValue: couponData.discountValue,
      minimumAmount: couponData.minimumAmount || 0,
      maxUses: couponData.maxUses || null,
      usedCount: 0,
      applicableCourses: couponData.applicableCourses || [], // Empty array means all courses
      isActive: true,
      validFrom: couponData.validFrom,
      validUntil: couponData.validUntil,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, COUPONS_COLLECTION), coupon);
    return {
      id: docRef.id,
      ...coupon,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error creating coupon:', error);
    throw new Error('Failed to create coupon. Please try again.');
  }
};

// Get lecturer's coupons
export const getLecturerCoupons = async (lecturerId) => {
  try {
    const q = query(
      collection(db, COUPONS_COLLECTION),
      where('lecturerId', '==', lecturerId),
      orderBy('createdAt', 'desc')
    );

    // Helper function to convert date
    const toDate = (dateValue) => {
      if (!dateValue) return new Date();
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        return dateValue.toDate(); // Firestore Timestamp
      }
      if (dateValue instanceof Date) {
        return dateValue; // JavaScript Date
      }
      return new Date(dateValue); // String or number
    };

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt),
      validFrom: toDate(doc.data().validFrom),
      validUntil: toDate(doc.data().validUntil)
    }));
  } catch (error) {
    console.error('Error getting lecturer coupons:', error);
    return [];
  }
};

// Validate and apply coupon
export const validateCoupon = async (couponCode, courseId, orderAmount) => {
  try {
    const q = query(
      collection(db, COUPONS_COLLECTION),
      where('code', '==', couponCode.toUpperCase()),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      throw new Error('Invalid coupon code');
    }

    const couponDoc = snapshot.docs[0];
    const coupon = couponDoc.data();
    const now = new Date();

    // Helper function to convert date
    const toDate = (dateValue) => {
      if (!dateValue) return null;
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        return dateValue.toDate(); // Firestore Timestamp
      }
      if (dateValue instanceof Date) {
        return dateValue; // JavaScript Date
      }
      return new Date(dateValue); // String or number
    };

    // Check validity period
    const validFromDate = toDate(coupon.validFrom);
    const validUntilDate = toDate(coupon.validUntil);
    
    if (validFromDate && validFromDate > now) {
      throw new Error('Coupon is not yet valid');
    }
    if (validUntilDate && validUntilDate < now) {
      throw new Error('Coupon has expired');
    }

    // Check usage limit
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new Error('Coupon usage limit reached');
    }

    // Check minimum amount
    if (coupon.minimumAmount && orderAmount < coupon.minimumAmount) {
      throw new Error(`Minimum order amount is ₦${coupon.minimumAmount.toLocaleString()}`);
    }

    // Check applicable courses
    if (coupon.applicableCourses.length > 0 && !coupon.applicableCourses.includes(courseId)) {
      throw new Error('Coupon is not applicable to this course');
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((orderAmount * coupon.discountValue) / 100);
    } else {
      discountAmount = Math.min(coupon.discountValue, orderAmount);
    }

    return {
      id: couponDoc.id,
      ...coupon,
      discountAmount,
      finalAmount: orderAmount - discountAmount
    };
  } catch (error) {
    console.error('Error validating coupon:', error);
    throw error;
  }
};

// Apply coupon (increment usage count)
export const applyCoupon = async (couponId) => {
  try {
    const couponRef = doc(db, COUPONS_COLLECTION, couponId);
    await updateDoc(couponRef, {
      usedCount: increment(1),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error applying coupon:', error);
    throw error;
  }
};

// Update coupon
export const updateCoupon = async (couponId, updates) => {
  try {
    const couponRef = doc(db, COUPONS_COLLECTION, couponId);
    await updateDoc(couponRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    throw error;
  }
};

// Delete coupon
export const deleteCoupon = async (couponId) => {
  try {
    await deleteDoc(doc(db, COUPONS_COLLECTION, couponId));
  } catch (error) {
    console.error('Error deleting coupon:', error);
    throw error;
  }
};

// ============ COURSE PROMOTIONS ============

// Create course promotion
export const createPromotion = async (lecturerId, promotionData) => {
  try {
    const promotion = {
      lecturerId,
      courseId: promotionData.courseId,
      title: promotionData.title,
      description: promotionData.description,
      promotionType: promotionData.promotionType, // 'discount', 'bundle', 'flash_sale'
      originalPrice: promotionData.originalPrice,
      promotionalPrice: promotionData.promotionalPrice,
      discountPercentage: Math.round(((promotionData.originalPrice - promotionData.promotionalPrice) / promotionData.originalPrice) * 100),
      isActive: true,
      validFrom: promotionData.validFrom,
      validUntil: promotionData.validUntil,
      maxEnrollments: promotionData.maxEnrollments || null,
      enrollmentCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, PROMOTIONS_COLLECTION), promotion);
    return {
      id: docRef.id,
      ...promotion,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error creating promotion:', error);
    throw new Error('Failed to create promotion. Please try again.');
  }
};

// Get lecturer's promotions
export const getLecturerPromotions = async (lecturerId) => {
  try {
    const q = query(
      collection(db, PROMOTIONS_COLLECTION),
      where('lecturerId', '==', lecturerId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      validFrom: doc.data().validFrom?.toDate() || new Date(),
      validUntil: doc.data().validUntil?.toDate() || new Date()
    }));
  } catch (error) {
    console.error('Error getting lecturer promotions:', error);
    return [];
  }
};

// Get active promotions for a course
export const getCoursePromotions = async (courseId) => {
  try {
    const now = new Date();
    const q = query(
      collection(db, PROMOTIONS_COLLECTION),
      where('courseId', '==', courseId),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    const promotions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      validFrom: doc.data().validFrom?.toDate() || new Date(),
      validUntil: doc.data().validUntil?.toDate() || new Date()
    }));

    // Filter by date validity
    return promotions.filter(promo => 
      promo.validFrom <= now && 
      promo.validUntil >= now &&
      (!promo.maxEnrollments || promo.enrollmentCount < promo.maxEnrollments)
    );
  } catch (error) {
    console.error('Error getting course promotions:', error);
    return [];
  }
};

// ============ AFFILIATE LINKS ============

// Generate affiliate link
export const generateAffiliateLink = async (lecturerId, courseId, campaignName) => {
  try {
    const affiliateCode = `${lecturerId.substring(0, 6)}_${courseId.substring(0, 6)}_${Date.now()}`;
    
    const affiliateLink = {
      lecturerId,
      courseId,
      campaignName,
      affiliateCode,
      baseUrl: `${window.location.origin}/courses/${courseId}`,
      fullUrl: `${window.location.origin}/courses/${courseId}?ref=${affiliateCode}`,
      clickCount: 0,
      conversionCount: 0,
      revenue: 0,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, AFFILIATE_LINKS_COLLECTION), affiliateLink);
    return {
      id: docRef.id,
      ...affiliateLink,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error generating affiliate link:', error);
    throw new Error('Failed to generate affiliate link. Please try again.');
  }
};

// Get lecturer's affiliate links
export const getLecturerAffiliateLinks = async (lecturerId) => {
  try {
    const q = query(
      collection(db, AFFILIATE_LINKS_COLLECTION),
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
    console.error('Error getting lecturer affiliate links:', error);
    return [];
  }
};

// Track affiliate link click
export const trackAffiliateClick = async (affiliateCode) => {
  try {
    const q = query(
      collection(db, AFFILIATE_LINKS_COLLECTION),
      where('affiliateCode', '==', affiliateCode),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const linkDoc = snapshot.docs[0];
      await updateDoc(linkDoc.ref, {
        clickCount: increment(1),
        updatedAt: serverTimestamp()
      });
      
      return {
        id: linkDoc.id,
        ...linkDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error tracking affiliate click:', error);
    return null;
  }
};

// Track affiliate conversion
export const trackAffiliateConversion = async (affiliateCode, revenue) => {
  try {
    const q = query(
      collection(db, AFFILIATE_LINKS_COLLECTION),
      where('affiliateCode', '==', affiliateCode),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const linkDoc = snapshot.docs[0];
      await updateDoc(linkDoc.ref, {
        conversionCount: increment(1),
        revenue: increment(revenue),
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error tracking affiliate conversion:', error);
  }
};

// ============ MARKETING ANALYTICS ============

// Get marketing analytics for lecturer
export const getMarketingAnalytics = async (lecturerId) => {
  try {
    const [coupons, promotions, affiliateLinks] = await Promise.all([
      getLecturerCoupons(lecturerId),
      getLecturerPromotions(lecturerId),
      getLecturerAffiliateLinks(lecturerId)
    ]);

    const analytics = {
      coupons: {
        total: coupons.length,
        active: coupons.filter(c => c.isActive).length,
        totalUses: coupons.reduce((sum, c) => sum + c.usedCount, 0),
        totalSavings: coupons.reduce((sum, c) => {
          // This would need to be calculated from actual usage data
          return sum + (c.usedCount * (c.discountType === 'percentage' ? 0 : c.discountValue));
        }, 0)
      },
      promotions: {
        total: promotions.length,
        active: promotions.filter(p => p.isActive).length,
        totalEnrollments: promotions.reduce((sum, p) => sum + p.enrollmentCount, 0),
        totalRevenue: promotions.reduce((sum, p) => sum + (p.enrollmentCount * p.promotionalPrice), 0)
      },
      affiliateLinks: {
        total: affiliateLinks.length,
        active: affiliateLinks.filter(a => a.isActive).length,
        totalClicks: affiliateLinks.reduce((sum, a) => sum + a.clickCount, 0),
        totalConversions: affiliateLinks.reduce((sum, a) => sum + a.conversionCount, 0),
        totalRevenue: affiliateLinks.reduce((sum, a) => sum + a.revenue, 0),
        conversionRate: affiliateLinks.reduce((sum, a) => sum + a.clickCount, 0) > 0 
          ? (affiliateLinks.reduce((sum, a) => sum + a.conversionCount, 0) / affiliateLinks.reduce((sum, a) => sum + a.clickCount, 0) * 100).toFixed(2)
          : 0
      }
    };

    return analytics;
  } catch (error) {
    console.error('Error getting marketing analytics:', error);
    return {
      coupons: { total: 0, active: 0, totalUses: 0, totalSavings: 0 },
      promotions: { total: 0, active: 0, totalEnrollments: 0, totalRevenue: 0 },
      affiliateLinks: { total: 0, active: 0, totalClicks: 0, totalConversions: 0, totalRevenue: 0, conversionRate: 0 }
    };
  }
};
