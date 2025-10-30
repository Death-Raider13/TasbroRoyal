# Quick Start Guide - NaijaEdu Platform

Get the platform running in **under 10 minutes**!

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

## Step 1: Install Dependencies (2 minutes)

```bash
cd nigerian-engineering-platform
npm install
```

Wait for all packages to install...

## Step 2: Setup Environment Variables (3 minutes)

### Option A: Quick Test (Skip Firebase for now)

Create `.env.local` file with dummy values to see the UI:

```env
VITE_FIREBASE_API_KEY=test
VITE_FIREBASE_AUTH_DOMAIN=test.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=test
VITE_FIREBASE_STORAGE_BUCKET=test.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456
VITE_FIREBASE_APP_ID=test
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxx
VITE_CLOUDINARY_CLOUD_NAME=test
VITE_CLOUDINARY_UPLOAD_PRESET=test
VITE_AGORA_APP_ID=test
```

**Note:** With dummy values, you can browse the UI but authentication won't work.

### Option B: Full Setup (Recommended)

1. **Firebase** (2 minutes):
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create new project
   - Go to Project Settings → Your apps → Web app
   - Copy config values

2. **Paystack** (1 minute):
   - Sign up at [Paystack](https://paystack.com/)
   - Get test public key from dashboard

3. **Cloudinary** (Optional for now):
   - Sign up at [Cloudinary](https://cloudinary.com/)
   - Get cloud name and create upload preset

4. **Agora** (Optional for now):
   - Sign up at [Agora.io](https://www.agora.io/)
   - Get App ID

Create `.env.local` with real values:

```env
VITE_FIREBASE_API_KEY=your_actual_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
VITE_AGORA_APP_ID=your_agora_app_id
```

## Step 3: Enable Firebase Services (2 minutes)

If using real Firebase:

1. **Enable Authentication:**
   - Firebase Console → Authentication → Get Started
   - Enable "Email/Password" provider

2. **Create Firestore Database:**
   - Firebase Console → Firestore Database → Create Database
   - Start in test mode (we'll add rules later)

3. **Enable Storage:**
   - Firebase Console → Storage → Get Started
   - Start in test mode

## Step 4: Run the Application (1 minute)

```bash
npm run dev
```

The app will start at: **http://localhost:5173**

## Step 5: Test the Application (2 minutes)

### Quick Test Checklist:

1. **Home Page:**
   - [ ] Open http://localhost:5173
   - [ ] See hero section and features
   - [ ] Click "Browse Courses"

2. **Signup:**
   - [ ] Click "Sign Up" in navbar
   - [ ] Fill in student details
   - [ ] Submit form
   - [ ] Should redirect to student dashboard

3. **Login:**
   - [ ] Logout
   - [ ] Click "Login"
   - [ ] Enter credentials
   - [ ] Should redirect to dashboard

## Common Issues & Quick Fixes

### Issue: "npm install" fails
**Fix:**
```bash
npm install --legacy-peer-deps
```

### Issue: Tailwind styles not showing
**Fix:**
```bash
# Restart the dev server
# Press Ctrl+C, then run:
npm run dev
```

### Issue: Firebase errors
**Fix:**
- Check that `.env.local` exists
- Verify Firebase config values are correct
- Ensure Authentication is enabled in Firebase Console

### Issue: Port 5173 already in use
**Fix:**
```bash
# Kill the process or use different port
npm run dev -- --port 3000
```

## What You Can Test Now

### Without Full Firebase Setup:
- ✅ Browse UI and pages
- ✅ See forms and layouts
- ✅ Test responsive design
- ✅ View course listing page
- ✅ Navigate between pages

### With Firebase Setup:
- ✅ Create accounts (student/lecturer)
- ✅ Login/logout
- ✅ Access dashboards
- ✅ View protected routes
- ✅ Test role-based access

### With Paystack Setup:
- ✅ Test payment flow
- ✅ Use test cards
- ✅ Complete enrollment

### With Cloudinary Setup:
- ✅ Upload course thumbnails
- ✅ Upload video lessons
- ✅ See upload progress

## Next Steps

### 1. Create Test Accounts

**Admin Account:**
```
Email: admin@naijaedu.com
Password: Admin123!
```
*Manually set role to "admin" in Firestore*

**Lecturer Account:**
```
Email: lecturer@test.com
Password: Lecturer123!
```
*Sign up through the app, then approve in admin dashboard*

**Student Account:**
```
Email: student@test.com
Password: Student123!
```
*Sign up through the app*

### 2. Deploy Security Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (select Firestore and Storage)
firebase init

# Deploy rules
firebase deploy --only firestore:rules,storage:rules
```

### 3. Test Core Flows

Follow the **TESTING_GUIDE.md** for comprehensive testing scenarios.

### 4. Add Sample Data

Create some test courses to populate the platform:
1. Login as approved lecturer
2. Create a course
3. Add lessons
4. Submit for review
5. Login as admin and approve

## Development Workflow

### Daily Development:
```bash
# Start dev server
npm run dev

# In another terminal, watch for errors
# Check browser console for any issues
```

### Before Committing:
```bash
# Check for lint errors
npm run lint

# Test build
npm run build
```

### Deploying to Production:
```bash
# Build the app
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

## Useful Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Deploy to Firebase
firebase deploy
```

## Project Structure Quick Reference

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components (routes)
├── services/      # Firebase & API services
├── store/         # Zustand state management
├── utils/         # Helper functions
├── App.jsx        # Main app with routing
└── main.jsx       # Entry point
```

## Environment Variables Quick Reference

| Variable | Required | Purpose |
|----------|----------|---------|
| VITE_FIREBASE_API_KEY | Yes | Firebase authentication |
| VITE_FIREBASE_AUTH_DOMAIN | Yes | Firebase auth domain |
| VITE_FIREBASE_PROJECT_ID | Yes | Firebase project ID |
| VITE_FIREBASE_STORAGE_BUCKET | Yes | Firebase storage |
| VITE_FIREBASE_MESSAGING_SENDER_ID | Yes | Firebase messaging |
| VITE_FIREBASE_APP_ID | Yes | Firebase app ID |
| VITE_PAYSTACK_PUBLIC_KEY | Yes | Payment processing |
| VITE_CLOUDINARY_CLOUD_NAME | Optional* | Video hosting |
| VITE_CLOUDINARY_UPLOAD_PRESET | Optional* | Video upload |
| VITE_AGORA_APP_ID | Optional* | Live streaming |

*Optional for initial testing, required for full functionality

## Test Cards (Paystack)

### Successful Payment:
```
Card: 4084 0840 8408 4081
CVV: 408
Expiry: 12/25
PIN: 0000
OTP: 123456
```

### Failed Payment:
```
Card: 5060 6666 6666 6666 6666
CVV: 123
Expiry: 12/25
```

## Getting Help

1. **Check Documentation:**
   - README.md - Overview
   - SETUP_GUIDE.md - Detailed setup
   - TESTING_GUIDE.md - Testing scenarios
   - PROJECT_SUMMARY.md - Complete feature list

2. **Common Issues:**
   - Check browser console for errors
   - Verify environment variables
   - Ensure Firebase services are enabled
   - Check Firebase security rules

3. **Debug Mode:**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests
   - Check Application tab for localStorage

## Success Checklist

You're ready to develop when:

- [ ] App runs without errors
- [ ] Can navigate between pages
- [ ] Can create accounts
- [ ] Can login/logout
- [ ] Dashboards load correctly
- [ ] Forms work and validate
- [ ] No console errors

## What's Next?

1. **Read the Documentation:**
   - SETUP_GUIDE.md for detailed setup
   - TESTING_GUIDE.md for testing scenarios
   - PROJECT_SUMMARY.md for feature overview

2. **Start Development:**
   - Add missing features from PROJECT_SUMMARY.md
   - Implement Q&A system
   - Add live streaming
   - Build certificate generation

3. **Deploy to Production:**
   - Get production API keys
   - Deploy Firebase rules
   - Deploy to Firebase Hosting
   - Setup custom domain

---

**🎉 Congratulations!** You're now ready to develop the NaijaEdu platform!

For detailed information, refer to the other documentation files.

**Happy Coding!** 💻
