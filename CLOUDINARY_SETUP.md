# Cloudinary Setup Guide

## Why Cloudinary Instead of Firebase Storage?

✅ **Free Plan Benefits:**
- 25GB storage
- 25GB monthly bandwidth
- Advanced image/video transformations
- CDN delivery worldwide
- No Firebase Spark plan limitations

## Step 1: Create Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/users/register/free)
2. Sign up for a free account
3. Verify your email

## Step 2: Get Your Credentials

1. Go to your [Cloudinary Dashboard](https://cloudinary.com/console)
2. Copy these values:
   - **Cloud Name** (e.g., `dxyz123abc`)
   - **API Key** (not needed for unsigned uploads)
   - **API Secret** (not needed for unsigned uploads)

## Step 3: Create Upload Preset

1. In Cloudinary Dashboard, go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Configure:
   - **Preset name:** `naijaedu_uploads`
   - **Signing Mode:** `Unsigned` ⚠️ **Important!**
   - **Folder:** Leave empty (we'll set folders in code)
   - **Resource type:** `Auto`
   - **Access mode:** `Public`
   - **Unique filename:** `true`
   - **Overwrite:** `false`
5. Click **Save**

## Step 4: Configure Folders (Optional)

Set up auto-folders for organization:
1. Go to **Settings** → **Upload**
2. In your upload preset, set:
   - **Auto tagging:** `auto`
   - **Auto folder:** Enable if desired

## Step 5: Update Environment Variables

Update your `.env.local` file:

```env
# Firebase (keep existing)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBD4RR0LODJX5Db5i5honl68dY1ujwuw8w
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tasbroroyal-f08d0.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tasbroroyal-f08d0
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tasbroroyal-f08d0.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=296682846077
NEXT_PUBLIC_FIREBASE_APP_ID=1:296682846077:web:0ad32ada19c205c1bffe14

# Cloudinary (replace with your values)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=naijaedu_uploads

# Other services
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_key
NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id
```

## Step 6: Test Upload

After setting up, test with this code:

```javascript
import { uploadImageToCloudinary } from './src/services/cloudinary.js';

// Test upload
const handleFileUpload = async (file) => {
  try {
    const result = await uploadImageToCloudinary(file, (progress) => {
      console.log(`Upload progress: ${progress}%`);
    });
    console.log('Upload successful:', result.url);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

## Available Upload Functions

```javascript
// Import storage functions
import {
  uploadCourseThumbnail,
  uploadCourseVideo,
  uploadProfileImage,
  uploadCourseDocument,
  uploadFile,
  deleteFile,
  getImageUrl,
  getResponsiveImageUrls,
  getVideoUrls
} from './src/services/storage.js';

// Upload course thumbnail
const thumbnail = await uploadCourseThumbnail(imageFile, onProgress);

// Upload course video
const video = await uploadCourseVideo(videoFile, onProgress);

// Upload profile image
const profile = await uploadProfileImage(imageFile, onProgress);

// Upload document
const document = await uploadCourseDocument(pdfFile, onProgress);

// Get optimized image URLs
const imageUrls = getResponsiveImageUrls(publicId);
// Returns: { thumbnail, small, medium, large, original }

// Get video URLs with different qualities
const videoUrls = getVideoUrls(publicId);
// Returns: { sd, hd, original, thumbnail }

// Delete file
await deleteFile(publicId, 'image'); // or 'video', 'raw'
```

## File Organization

Files are automatically organized into folders:
- `course-images/` - Course thumbnails and images
- `course-videos/` - Course video content
- `profile-images/` - User profile pictures
- `course-documents/` - PDFs, documents, resources

## File Size Limits

- **Images:** 10MB max
- **Videos:** 500MB max (Cloudinary free plan supports up to 100MB per file)
- **Documents:** 50MB max

## Security Features

✅ **Unsigned uploads** - No API secrets exposed to frontend
✅ **File type validation** - Only allowed file types
✅ **Size limits** - Prevents abuse
✅ **Auto-optimization** - Images/videos optimized automatically
✅ **CDN delivery** - Fast global delivery

## Troubleshooting

### Upload Fails with 401 Error
- Check that upload preset is set to **Unsigned**
- Verify cloud name is correct
- Ensure upload preset name matches

### Upload Fails with 400 Error
- Check file size limits
- Verify file type is supported
- Check network connection

### Images Not Loading
- Verify the URL format
- Check if public_id is correct
- Ensure images are set to public access

### Videos Not Playing
- Check video format (MP4 recommended)
- Verify video size is under limits
- Use video URLs from `getVideoUrls()`

## Advanced Features

### Image Transformations
```javascript
// Get optimized image with custom options
const optimizedUrl = getImageUrl(publicId, {
  width: 800,
  height: 600,
  crop: 'fill',
  quality: 'auto',
  format: 'webp'
});
```

### Video Transformations
```javascript
// Get video with custom quality
const videoUrl = `https://res.cloudinary.com/${cloudName}/video/upload/q_auto:good,w_1280/${publicId}`;
```

### Responsive Images
```javascript
// Get multiple sizes for responsive design
const sizes = getResponsiveImageUrls(publicId);
// Use in img srcset for responsive images
```

## Migration from Firebase Storage

If you were using Firebase Storage before:

1. Export existing files from Firebase Storage
2. Upload to Cloudinary using the upload functions
3. Update database URLs to point to Cloudinary
4. Remove Firebase Storage dependencies

---

**Your Cloudinary setup is now complete! 🎉**

The platform will now use Cloudinary for all file uploads instead of Firebase Storage, giving you better performance and no storage limitations on the free plan.
