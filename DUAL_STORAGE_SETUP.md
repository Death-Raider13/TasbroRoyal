# Dual Storage Setup Guide - ImageKit.io + Cloudinary

## 🎯 Strategy: Primary + Backup System

Your platform now uses **ImageKit.io as primary** and **Cloudinary as backup** for maximum reliability and performance.

## 🏗️ How It Works

1. **Primary Service (ImageKit.io):** All uploads try ImageKit.io first
2. **Automatic Fallback:** If ImageKit.io fails, automatically tries Cloudinary
3. **Smart Detection:** URLs and file operations automatically detect which service to use
4. **Easy Switching:** Can switch primary service anytime without code changes

## 📋 Setup Checklist

### Step 1: Set Up ImageKit.io (Primary)

1. **Create Account:** [imagekit.io/registration](https://imagekit.io/registration)
2. **Get Credentials:**
   - Go to Dashboard → Developer → API Keys
   - Copy **URL Endpoint** (e.g., `https://ik.imagekit.io/your_id`)
   - Copy **Public Key** (e.g., `public_abc123xyz`)

### Step 2: Set Up Cloudinary (Backup)

1. **Create Account:** [cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. **Get Credentials:**
   - Go to Dashboard → Settings → Upload
   - Copy **Cloud Name**
   - Create **Upload Preset** (unsigned mode)

### Step 3: Update Environment Variables

Update your `.env.local` file:

```env
# Firebase (existing)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBD4RR0LODJX5Db5i5honl68dY1ujwuw8w
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tasbroroyal-f08d0.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tasbroroyal-f08d0
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tasbroroyal-f08d0.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=296682846077
NEXT_PUBLIC_FIREBASE_APP_ID=1:296682846077:web:0ad32ada19c205c1bffe14

# ImageKit.io (Primary Storage)
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_your_imagekit_key_here
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id

# Cloudinary (Backup Storage)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Other services
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_key
NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id
```

## 🚀 Usage Examples

### Basic Upload (Automatic Fallback)

```javascript
import { uploadCourseVideo, uploadProfileImage } from './src/services/storage.js';

// Upload course video (tries ImageKit first, falls back to Cloudinary)
const handleVideoUpload = async (file) => {
  try {
    const result = await uploadCourseVideo(file, (progress) => {
      console.log(`Upload progress: ${progress}%`);
    });
    
    console.log('Upload successful!');
    console.log('Service used:', result.service); // 'imagekit' or 'cloudinary'
    console.log('Is primary:', result.isPrimary); // true if primary service used
    console.log('File URL:', result.url);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

## 🎉 You're All Set!

Your dual storage system is now configured with:
- ✅ ImageKit.io as primary (20GB free)
- ✅ Cloudinary as backup (25GB free)
- ✅ Automatic fallback
- ✅ Smart URL detection
- ✅ Easy service switching
- ✅ 45GB total free storage!

**Total Free Storage: 45GB across both services! 🚀**
