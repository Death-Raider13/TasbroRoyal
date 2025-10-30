# 🔧 Environment Variables Setup Guide

## ⚠️ **URGENT: Fix Firebase API Key Error**

The error `your_firebase_api_key` indicates that your environment variables are not properly configured.

## 📝 **Step-by-Step Setup**

### 1. **Update Your .env.local File**

Your `.env.local` file should contain actual values, not placeholders:

```bash
# Firebase Configuration (Replace with your actual Firebase config)
VITE_FIREBASE_API_KEY=AIzaSyBD4RR0LODJX5Db5i5honl68dY1ujwuw8w
VITE_FIREBASE_AUTH_DOMAIN=tasbroroyal-f08d0.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tasbroroyal-f08d0
VITE_FIREBASE_STORAGE_BUCKET=tasbroroyal-f08d0.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=296682846077
VITE_FIREBASE_APP_ID=1:296682846077:web:0ad32ada19c205c1bffe14

# Payment Gateway (Replace with your actual Paystack key)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_actual_paystack_key

# ImageKit.io (Replace with your actual ImageKit config)
VITE_IMAGEKIT_PUBLIC_KEY=public_your_actual_imagekit_key
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_actual_endpoint/

# Cloudinary (Replace with your actual Cloudinary config)
VITE_CLOUDINARY_CLOUD_NAME=dkd6x857p
VITE_CLOUDINARY_UPLOAD_PRESET=AndrewCaresVillage

# Agora (Replace with your actual Agora App ID)
VITE_AGORA_APP_ID=your_actual_agora_app_id
```

### 2. **Quick Fix for Testing**

If you want to test immediately with the existing config, update your `.env.local`:

```bash
# Firebase Configuration (Copy these EXACT values for testing)
VITE_FIREBASE_API_KEY=AIzaSyBD4RR0LODJX5Db5i5honl68dY1ujwuw8w
VITE_FIREBASE_AUTH_DOMAIN=tasbroroyal-f08d0.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tasbroroyal-f08d0
VITE_FIREBASE_STORAGE_BUCKET=tasbroroyal-f08d0.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=296682846077
VITE_FIREBASE_APP_ID=1:296682846077:web:0ad32ada19c205c1bffe14

# Cloudinary Configuration (Copy these EXACT values for testing)
VITE_CLOUDINARY_CLOUD_NAME=dkd6x857p
VITE_CLOUDINARY_UPLOAD_PRESET=AndrewCaresVillage

# ImageKit Configuration (Copy these EXACT values for testing)
VITE_IMAGEKIT_PUBLIC_KEY=public_pH9PXKs1K49moY/6kuypoGNv3zc=
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/12345678point/

# Payment & Other Services (Add your actual keys when ready)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_actual_paystack_key
VITE_AGORA_APP_ID=your_actual_agora_app_id
```

### 3. **Restart Development Server**

After updating your `.env.local` file:

```bash
# Stop the current dev server (Ctrl+C)
# Then restart it
npm run dev
```

## 🔍 **How to Find Your Firebase Config**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon → Project Settings
4. Scroll down to "Your apps" section
5. Click on your web app
6. Copy the config values

## ✅ **Verification**

After updating, you should see:
- ✅ No more "your_firebase_api_key" errors
- ✅ Firebase authentication working
- ✅ Service worker registering successfully

## 🚨 **Security Reminder**

- ✅ **SAFE**: VITE_ prefixed variables (exposed to frontend)
- ❌ **NEVER**: Private keys, secrets, or server-only credentials

The VITE_ prefix ensures only safe, public configuration is exposed to the frontend.
