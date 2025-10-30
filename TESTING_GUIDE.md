# Testing Guide - NaijaEdu Platform

This guide provides comprehensive testing scenarios for the Nigerian Engineering Education Platform.

## Test User Accounts

Create these test accounts for comprehensive testing:

### Admin Account
- Email: `admin@naijaedu.com`
- Password: `Admin123!`
- Role: Admin

### Lecturer Account
- Email: `lecturer@unilag.edu.ng`
- Password: `Lecturer123!`
- Role: Lecturer
- University: University of Lagos
- Department: Mechanical Engineering

### Student Account
- Email: `student@gmail.com`
- Password: `Student123!`
- Role: Student
- University: University of Lagos
- Department: Mechanical Engineering

## Testing Scenarios

### 1. Authentication Flow

#### Test Case 1.1: Student Registration
1. Navigate to `/signup`
2. Fill in student details:
   - Full Name: "John Doe"
   - Email: "john.student@gmail.com"
   - Phone: "+2348012345678"
   - Role: Student
   - University: "University of Lagos"
   - Department: "Mechanical Engineering"
   - Password: "Test123!"
3. Submit form
4. **Expected**: Redirect to `/student/dashboard`
5. **Verify**: User document created in Firestore with role "student"

#### Test Case 1.2: Lecturer Registration
1. Navigate to `/signup`
2. Fill in lecturer details:
   - Full Name: "Dr. Jane Smith"
   - Email: "jane.lecturer@unilag.edu.ng"
   - Phone: "+2348098765432"
   - Role: Lecturer
   - University: "University of Lagos"
   - Department: "Electrical Engineering"
   - Qualifications: "PhD in Electrical Engineering, University of Lagos"
   - Expertise: "Power Systems, Control Systems, Renewable Energy"
   - Password: "Test123!"
3. Submit form
4. **Expected**: Alert "Your application has been submitted. Wait for admin approval."
5. **Expected**: Redirect to `/lecturer/dashboard` showing "Application Under Review"
6. **Verify**: User document created with `applicationStatus: 'pending'`

#### Test Case 1.3: Login
1. Navigate to `/login`
2. Enter email and password
3. Click "Login"
4. **Expected**: Redirect based on role:
   - Student → `/student/dashboard`
   - Lecturer → `/lecturer/dashboard`
   - Admin → `/admin/dashboard`

#### Test Case 1.4: Logout
1. Click "Logout" in navbar
2. **Expected**: Redirect to home page
3. **Expected**: Navbar shows "Login" and "Sign Up" buttons

### 2. Admin Workflow

#### Test Case 2.1: Approve Lecturer
1. Login as admin
2. Navigate to `/admin/dashboard`
3. Click "Pending Lecturers" tab
4. Review lecturer application
5. Click "Approve"
6. **Expected**: Lecturer status changes to "approved"
7. **Expected**: Lecturer can now create courses
8. **Verify**: Firestore document updated with `approved: true`

#### Test Case 2.2: Reject Lecturer
1. Login as admin
2. Navigate to `/admin/dashboard`
3. Click "Pending Lecturers" tab
4. Click "Reject" on a lecturer
5. **Expected**: Lecturer status changes to "rejected"
6. **Verify**: Firestore document updated with `applicationStatus: 'rejected'`

#### Test Case 2.3: Approve Course
1. Login as admin
2. Navigate to `/admin/dashboard`
3. Click "Pending Courses" tab
4. Review course details
5. Click "Approve"
6. **Expected**: Course status changes to "approved"
7. **Expected**: Course appears in public course listing
8. **Verify**: Firestore document updated with `status: 'approved'`

#### Test Case 2.4: Reject Course
1. Login as admin
2. Navigate to `/admin/dashboard`
3. Click "Pending Courses" tab
4. Click "Reject"
5. Enter rejection reason: "Content needs improvement"
6. **Expected**: Course status changes to "rejected"
7. **Verify**: Firestore document has `rejectionReason` field

### 3. Lecturer Workflow

#### Test Case 3.1: Create Course (Step 1 - Course Info)
1. Login as approved lecturer
2. Navigate to `/lecturer/create-course`
3. Fill in course details:
   - Title: "Advanced Thermodynamics"
   - Description: "Comprehensive course on thermodynamics principles"
   - Category: "Mechanical Engineering"
   - Price: 15000
   - Thumbnail: Upload image file
4. Click "Continue to Add Lessons"
5. **Expected**: Progress to Step 2
6. **Verify**: Course document created in Firestore with `status: 'draft'`

#### Test Case 3.2: Add Lesson
1. In Step 2 of course creation
2. Fill in lesson details:
   - Lesson Title: "Introduction to Thermodynamics"
   - Description: "Basic concepts and laws"
   - Video File: Upload video (MP4)
   - Resources: Upload PDF file (optional)
   - Check "Make this a free preview lesson"
3. Click "Add Lesson"
4. **Expected**: Upload progress bar shows
5. **Expected**: Video uploads to Cloudinary
6. **Expected**: Lesson added to list
7. **Expected**: Success message
8. **Verify**: Lesson subcollection created in Firestore

#### Test Case 3.3: Submit Course for Review
1. After adding at least one lesson
2. Click "Continue to Review"
3. Review course summary
4. Click "Submit for Review"
5. **Expected**: Success message
6. **Expected**: Redirect to `/lecturer/dashboard`
7. **Verify**: Course status changed to `pending_review`

#### Test Case 3.4: View Earnings
1. Login as lecturer
2. Navigate to `/lecturer/dashboard`
3. Check stats cards:
   - Total Courses
   - Total Students
   - Total Earnings (75% of revenue)
   - Pending Review
4. **Verify**: Numbers match Firestore data

### 4. Student Workflow

#### Test Case 4.1: Browse Courses
1. Navigate to `/courses` (no login required)
2. **Expected**: See list of approved courses
3. Test search functionality:
   - Enter "Thermodynamics" in search
   - **Expected**: Filtered results
4. Test category filter:
   - Click "Mechanical Engineering"
   - **Expected**: Only mechanical courses shown

#### Test Case 4.2: View Course Details
1. Click on a course card
2. **Expected**: Navigate to `/courses/{courseId}`
3. **Verify** page shows:
   - Course title and description
   - Lecturer name
   - Price
   - Course curriculum (lessons)
   - Enrollment button

#### Test Case 4.3: Purchase Course (Payment Flow)
1. On course details page, click "Enroll Now"
2. **Expected**: Checkout modal opens
3. Review course details and price
4. Click "Pay with Paystack"
5. **Expected**: Paystack payment modal opens
6. Use test card:
   - Card: 4084 0840 8408 4081
   - CVV: 408
   - Expiry: 12/25
   - PIN: 0000
   - OTP: 123456
7. Complete payment
8. **Expected**: Success message
9. **Expected**: Redirect to course learning page
10. **Verify** Firestore:
    - Transaction document created
    - Enrollment document created
    - Lecturer earnings updated
    - Course totalStudents incremented

#### Test Case 4.4: Access Enrolled Course
1. Login as student
2. Navigate to `/student/dashboard`
3. **Expected**: See enrolled courses
4. Click "Continue" on a course
5. **Expected**: Navigate to course learning page
6. **Verify**: Can access video lessons

#### Test Case 4.5: Track Progress
1. While viewing course
2. Complete a lesson
3. **Expected**: Progress bar updates
4. **Verify**: Firestore enrollment document updated with:
   - Lesson ID added to `completedLessons`
   - `progress` percentage updated

### 5. Payment Testing

#### Test Case 5.1: Successful Payment
- Card: 4084 0840 8408 4081
- CVV: 408
- Expiry: Any future date
- PIN: 0000
- OTP: 123456
- **Expected**: Payment succeeds

#### Test Case 5.2: Failed Payment
- Card: 5060 6666 6666 6666 6666
- CVV: Any
- Expiry: Any future date
- **Expected**: Payment fails with error message

#### Test Case 5.3: Cancelled Payment
1. Open payment modal
2. Close modal without completing
3. **Expected**: "Payment cancelled" message
4. **Expected**: No transaction created

### 6. Security Testing

#### Test Case 6.1: Protected Routes
1. Logout
2. Try to access `/student/dashboard`
3. **Expected**: Redirect to `/login`

#### Test Case 6.2: Role-Based Access
1. Login as student
2. Try to access `/admin/dashboard`
3. **Expected**: Redirect to home page

#### Test Case 6.3: Firestore Security Rules
1. Try to read another user's data
2. **Expected**: Permission denied
3. Try to update another user's course
4. **Expected**: Permission denied

### 7. Edge Cases

#### Test Case 7.1: Empty States
1. New student with no enrollments
2. **Expected**: "You haven't enrolled in any courses yet" message
3. New lecturer with no courses
4. **Expected**: "You haven't created any courses yet" message

#### Test Case 7.2: Form Validation
1. Try to submit signup form with:
   - Invalid email format
   - Password less than 6 characters
   - Missing required fields
2. **Expected**: Validation error messages

#### Test Case 7.3: Network Errors
1. Disable internet connection
2. Try to load courses
3. **Expected**: Error handling (console errors, not crashes)

## Performance Testing

### Load Testing
1. Create 100+ courses
2. Test pagination and loading speed
3. Check Firestore read counts

### Video Upload Testing
1. Upload small video (< 10MB)
2. **Expected**: Fast upload
3. Upload large video (> 100MB)
4. **Expected**: Progress bar shows accurately
5. **Expected**: Video transcodes on Cloudinary

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

## Mobile Responsiveness

Test on different screen sizes:
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

Check:
- [ ] Navbar collapses properly
- [ ] Forms are usable
- [ ] Cards stack correctly
- [ ] Images scale properly
- [ ] Text is readable

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Form labels are present
- [ ] Error messages are clear
- [ ] Color contrast is sufficient
- [ ] Screen reader compatible

## Bug Reporting Template

When you find a bug, report it with:

```
**Bug Title**: [Short description]

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**: 
[What should happen]

**Actual Behavior**: 
[What actually happened]

**Environment**:
- Browser: [Chrome 120]
- OS: [Windows 11]
- User Role: [Student/Lecturer/Admin]

**Screenshots**: 
[If applicable]

**Console Errors**: 
[Copy any error messages]
```

## Test Checklist

Before considering the platform ready:

### Authentication
- [ ] Student signup works
- [ ] Lecturer signup works
- [ ] Login works for all roles
- [ ] Logout works
- [ ] Protected routes redirect properly
- [ ] Role-based access control works

### Admin Features
- [ ] Can view pending lecturers
- [ ] Can approve lecturers
- [ ] Can reject lecturers
- [ ] Can view pending courses
- [ ] Can approve courses
- [ ] Can reject courses
- [ ] Dashboard stats are accurate

### Lecturer Features
- [ ] Pending status shows correctly
- [ ] Can create courses after approval
- [ ] Can upload course thumbnail
- [ ] Can add lessons with video
- [ ] Video uploads to Cloudinary
- [ ] Can submit course for review
- [ ] Dashboard shows correct stats
- [ ] Earnings calculated correctly (75%)

### Student Features
- [ ] Can browse courses
- [ ] Search works
- [ ] Category filter works
- [ ] Can view course details
- [ ] Payment flow works
- [ ] Can access enrolled courses
- [ ] Progress tracking works
- [ ] Dashboard shows enrollments

### Payment
- [ ] Paystack modal opens
- [ ] Test cards work
- [ ] Transaction recorded
- [ ] Enrollment created
- [ ] Earnings updated
- [ ] Failed payments handled

### UI/UX
- [ ] Responsive on mobile
- [ ] Loading states shown
- [ ] Error messages clear
- [ ] Success messages shown
- [ ] Navigation intuitive
- [ ] Forms validated

### Security
- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] API keys in environment variables
- [ ] No sensitive data exposed
- [ ] CORS configured

## Automated Testing (Future)

Consider adding:
- Unit tests with Jest
- Component tests with React Testing Library
- E2E tests with Cypress or Playwright
- API tests for Cloud Functions

---

**Happy Testing!** 🧪
