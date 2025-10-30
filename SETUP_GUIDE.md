# Setup Guide - NaijaEdu Platform

This guide will walk you through setting up the Nigerian Engineering Education Platform from scratch.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git installed
- A code editor (VS Code recommended)

## Step 1: Firebase Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `naijaedu-platform` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create project"

### 1.2 Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Enable **Email/Password** sign-in method
4. Click "Save"

### 1.3 Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Select "Start in test mode" (we'll add security rules later)
4. Choose a location (preferably closest to Nigeria)
5. Click "Enable"

### 1.4 Enable Storage

1. Go to **Storage**
2. Click "Get started"
3. Start in test mode
4. Click "Done"

### 1.5 Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon `</>`
4. Register app with nickname: "NaijaEdu Web"
5. Copy the `firebaseConfig` object
6. Save these values for your `.env.local` file

## Step 2: Paystack Setup

### 2.1 Create Paystack Account

1. Go to [Paystack](https://paystack.com/)
2. Click "Get Started"
3. Complete registration (requires Nigerian business details)
4. Verify your email

### 2.2 Get API Keys

1. Login to Paystack Dashboard
2. Go to **Settings** > **API Keys & Webhooks**
3. Copy your **Test Public Key** (for development)
4. Later, use **Live Public Key** for production

### 2.3 Setup Webhook (Optional for now)

1. In Paystack Dashboard, go to **Settings** > **API Keys & Webhooks**
2. Add webhook URL: `https://your-domain.com/api/paystack-webhook`
3. This will be your Firebase Cloud Function URL (setup later)

## Step 3: Cloudinary Setup

### 3.1 Create Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for free account
3. Verify your email

### 3.2 Get Cloud Name

1. Login to Cloudinary Dashboard
2. Copy your **Cloud Name** from the dashboard

### 3.3 Create Upload Preset

1. Go to **Settings** > **Upload**
2. Scroll to "Upload presets"
3. Click "Add upload preset"
4. Set **Signing Mode** to "Unsigned"
5. Set **Folder** to "naijaedu-videos"
6. Click "Save"
7. Copy the **Preset name**

## Step 4: Agora Setup

### 4.1 Create Agora Account

1. Go to [Agora.io](https://www.agora.io/)
2. Sign up for free account
3. Complete registration

### 4.2 Create Project

1. Login to Agora Console
2. Click "Project Management"
3. Click "Create"
4. Enter project name: "NaijaEdu Live Streaming"
5. Set **Authentication mechanism** to "App ID"
6. Click "Submit"
7. Copy your **App ID**

## Step 5: Environment Variables

Create a `.env.local` file in the project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Paystack Configuration
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxx

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset

# Agora Configuration
VITE_AGORA_APP_ID=your-agora-app-id
```

## Step 6: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React & React Router
- Firebase SDK
- Tailwind CSS
- Zustand
- React Hook Form
- Paystack SDK
- Agora SDK
- And more...

## Step 7: Run Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173`

## Step 8: Create First Admin User

Since there's no admin user yet, you'll need to create one manually:

### Option 1: Using Firebase Console

1. Go to Firebase Console > Authentication
2. Click "Add user"
3. Enter email and password
4. Copy the User UID
5. Go to Firestore Database
6. Create a new document in `users` collection:
   - Document ID: (paste the User UID)
   - Fields:
     ```
     email: "admin@naijaedu.com"
     displayName: "Admin User"
     role: "admin"
     phoneNumber: "+234XXXXXXXXXX"
     university: "Platform Admin"
     department: "Administration"
     createdAt: (current timestamp)
     updatedAt: (current timestamp)
     ```

### Option 2: Sign up and manually change role

1. Sign up through the app as a student
2. Go to Firebase Console > Firestore
3. Find your user document
4. Change `role` field from "student" to "admin"

## Step 9: Deploy Firebase Rules

Deploy the security rules to Firebase:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not done)
firebase init

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules
```

## Step 10: Test the Application

### Test as Student
1. Sign up with a student account
2. Browse courses (none will exist yet)
3. Check student dashboard

### Test as Lecturer
1. Sign up with a lecturer account
2. Fill in qualifications and expertise
3. Wait for admin approval (or approve manually in Firestore)
4. Create a test course
5. Add lessons with video upload

### Test as Admin
1. Login with admin account
2. Go to Admin Dashboard
3. Approve pending lecturers
4. Approve pending courses
5. View platform statistics

## Step 11: Testing Payments

Use Paystack test cards:

**Successful Payment:**
- Card: 4084 0840 8408 4081
- CVV: 408
- Expiry: Any future date
- PIN: 0000
- OTP: 123456

**Failed Payment:**
- Card: 5060 6666 6666 6666 6666
- CVV: Any
- Expiry: Any future date

## Common Issues & Solutions

### Issue: Tailwind styles not working
**Solution:** 
- Ensure `tailwind.config.js` and `postcss.config.js` exist
- Check that `@tailwind` directives are in `src/index.css`
- Restart dev server

### Issue: Firebase authentication errors
**Solution:**
- Verify Firebase config in `.env.local`
- Check that Authentication is enabled in Firebase Console
- Ensure Email/Password provider is enabled

### Issue: Video upload fails
**Solution:**
- Verify Cloudinary credentials
- Check upload preset is "unsigned"
- Ensure file size is within limits (Cloudinary free tier: 10MB)

### Issue: Payment not working
**Solution:**
- Verify Paystack public key is correct
- Check that Paystack script is loaded in `index.html`
- Use test cards for testing
- Check browser console for errors

### Issue: Firestore permission denied
**Solution:**
- Deploy security rules: `firebase deploy --only firestore:rules`
- Check user role in Firestore
- Verify authentication is working

## Production Deployment

### 1. Build the Application
```bash
npm run build
```

### 2. Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

### 3. Update Environment Variables
- Replace test keys with production keys
- Update Paystack to live keys
- Ensure all services are in production mode

### 4. Setup Custom Domain (Optional)
1. Go to Firebase Console > Hosting
2. Click "Add custom domain"
3. Follow DNS configuration steps

## Next Steps

1. **Create Sample Content**: Add some courses and lessons for testing
2. **Invite Beta Users**: Get feedback from real students and lecturers
3. **Monitor Usage**: Check Firebase usage and costs
4. **Setup Analytics**: Add Google Analytics or similar
5. **Email Notifications**: Setup email service (Resend, SendGrid, etc.)
6. **Mobile App**: Consider building React Native version

## Support

If you encounter issues:
1. Check the main README.md
2. Review Firebase Console logs
3. Check browser console for errors
4. Review Firestore security rules
5. Test with different user roles

## Security Checklist

Before going live:
- [ ] Deploy Firestore security rules
- [ ] Deploy Storage security rules
- [ ] Use production API keys
- [ ] Enable Firebase App Check
- [ ] Setup proper CORS
- [ ] Add rate limiting
- [ ] Enable 2FA for admin accounts
- [ ] Review all environment variables
- [ ] Test all payment flows
- [ ] Backup Firestore data

## Maintenance

Regular tasks:
- Monitor Firebase usage and costs
- Check Paystack transactions
- Review and approve new lecturers
- Moderate course content
- Respond to user questions
- Update dependencies
- Monitor error logs
- Backup database regularly

---

**Congratulations!** Your NaijaEdu platform is now set up and ready for development. 🎉
