import { useState } from 'react';
import useAuthStore from '../../store/authStore';
import { initializePaystackPayment } from '../../services/paystack';
import { enrollStudent, createTransaction, createStudyGroup, addMemberToGroup, getStudyGroupsByCourse } from '../../services/firestore';
import { trackAffiliateConversion } from '../../services/marketing';
import { createAffiliateCommission } from '../../services/affiliateCommissions';

export default function CheckoutModal({ course, affiliateCode, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { user, userData } = useAuthStore();

  const handlePayment = () => {
    if (!user) {
      alert('Please login to purchase this course');
      return;
    }

    setLoading(true);

    const metadata = {
      courseId: course.id,
      courseName: course.title,
      lecturerId: course.lecturerId,
      studentId: user.uid,
      studentName: userData.displayName
    };

    initializePaystackPayment(
      user.email,
      course.price,
      metadata,
      async (response) => {
        try {
          // Create transaction record
          await createTransaction({
            userId: user.uid,
            courseId: course.id,
            lecturerId: course.lecturerId,
            amount: course.price,
            paymentMethod: 'paystack',
            paymentReference: response.reference,
            metadata
          });

          // Enroll student
          await enrollStudent(user.uid, course.id, course.lecturerId, {
            amount: course.price,
            reference: response.reference
          });

          // Add student to study group (find existing or create new)
          try {
            // First, check if a study group already exists for this course
            let groupId = null;
            
            // Try to find existing study group for this course
            const existingGroups = await getStudyGroupsByCourse(course.id);
            
            if (existingGroups && existingGroups.length > 0) {
              // Use the first existing study group for this course
              groupId = existingGroups[0].id;
              console.log('Found existing study group:', groupId);
            } else {
              // Create new study group if none exists
              const groupData = {
                name: `${course.title} - Study Group`,
                description: `Study group for ${course.title}`,
                courseId: course.id,
                courseName: course.title,
                lecturerId: course.lecturerId,
                lecturerName: course.lecturerName,
                autoEnrollment: true,
                allowPeerHelp: true,
                lecturerModerated: true
              };
              groupId = await createStudyGroup(groupData);
              console.log('Created new study group:', groupId);
            }
            
            // Add student to the study group (existing or new)
            await addMemberToGroup(groupId, user.uid);
            console.log('Student added to study group successfully');
          } catch (error) {
            console.log('Study group operation error:', error);
          }

          // Track affiliate conversion and create commission if this came from an affiliate link
          if (affiliateCode) {
            try {
              await trackAffiliateConversion(affiliateCode, course.price);
              console.log('Affiliate conversion tracked for:', affiliateCode);
              
              // Create commission record for the affiliate
              await createAffiliateCommission(
                affiliateCode,
                course.id,
                course.title,
                course.price,
                user.uid
              );
              console.log('Affiliate commission created for:', affiliateCode);
            } catch (error) {
              console.log('Error tracking affiliate conversion:', error);
            }
          }

          alert('Payment successful! You now have access to the course.');
          onSuccess();
          onClose();
        } catch (error) {
          alert('Error processing enrollment: ' + error.message);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        alert('Payment cancelled');
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Complete Your Purchase</h2>
        
        <div className="space-y-4">
          <div className="border-b pb-4">
            <p className="text-sm text-gray-600">Course</p>
            <p className="font-semibold">{course.title}</p>
          </div>

          <div className="border-b pb-4">
            <p className="text-sm text-gray-600">Lecturer</p>
            <p className="font-medium">{course.lecturerName}</p>
          </div>

          <div className="border-b pb-4">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-2xl font-bold text-blue-600">₦{course.price.toLocaleString()}</p>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p>✓ Lifetime access to course materials</p>
            <p>✓ Access to private study group</p>
            <p>✓ Direct Q&A with lecturer</p>
            <p>✓ Join live streaming sessions</p>
            <p>✓ Certificate upon completion</p>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Pay with Paystack'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
