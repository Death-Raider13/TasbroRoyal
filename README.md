# NaijaEdu - Nigerian Engineering Education Platform

A comprehensive educational marketplace platform connecting Nigerian engineering students with university lecturers for quality online learning.

## 🎯 Features

### For Students
- Browse and purchase courses from verified lecturers
- Access video lessons and downloadable resources
- Track learning progress with completion tracking
- Join private study groups for each course
- Ask questions and get answers from lecturers
- Attend live streaming sessions
- Earn certificates upon course completion

### For Lecturers
- Create and sell courses (earn 75% commission)
- Upload video lessons with Cloudinary integration
- Answer student questions
- Host live streaming sessions with Agora
- Track earnings and student enrollment
- Manage course content and pricing

### For Admins
- Approve/reject lecturer applications
- Moderate and approve courses
- View platform analytics and revenue
- Manage user accounts

## 🛠️ Tech Stack

### Frontend
- **React 18+** with Vite
- **Tailwind CSS** for styling
- **React Router v6** for navigation
- **React Hook Form** for form handling
- **Zustand** for state management
- **Lucide React** for icons

### Backend & Services
- **Firebase Authentication** (Email/Password)
- **Firestore Database** (NoSQL)
- **Firebase Storage** (File uploads)
- **Firebase Cloud Functions** (Serverless)
- **Paystack** (Payment gateway)
- **Cloudinary** (Video hosting)
- **Agora.io** (Live streaming)

## 📦 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd nigerian-engineering-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
Create a `.env.local` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
VITE_AGORA_APP_ID=your_agora_app_id
```

4. **Setup Firebase**
- Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
- Enable Authentication (Email/Password)
- Create Firestore Database
- Enable Firebase Storage
- Copy your Firebase config to `.env.local`

5. **Setup Paystack**
- Create account at [Paystack](https://paystack.com/)
- Get your public key from the dashboard
- Add to `.env.local`

6. **Setup Cloudinary**
- Create account at [Cloudinary](https://cloudinary.com/)
- Create an upload preset (unsigned)
- Add cloud name and preset to `.env.local`

7. **Setup Agora**
- Create account at [Agora.io](https://www.agora.io/)
- Create a project and get App ID
- Add to `.env.local`

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🔥 Firebase Deployment

1. **Install Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**
```bash
firebase login
```

3. **Initialize Firebase**
```bash
firebase init
```
Select:
- Hosting
- Firestore
- Storage
- Functions

4. **Deploy**
```bash
# Build the app first
npm run build

# Deploy everything
firebase deploy

# Or deploy specific services
firebase deploy --only hosting
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

## 📁 Project Structure

```
nigerian-engineering-platform/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── auth/         # Authentication components
│   │   ├── courses/      # Course-related components
│   │   ├── layout/       # Layout components (Navbar, Footer)
│   │   └── payment/      # Payment components
│   ├── pages/            # Page components
│   ├── services/         # Firebase & API services
│   ├── store/            # Zustand state management
│   ├── App.jsx           # Main app component with routing
│   └── main.jsx          # App entry point
├── firebase.json         # Firebase configuration
├── firestore.rules       # Firestore security rules
├── storage.rules         # Storage security rules
└── package.json          # Dependencies
```

## 🔐 Security Rules

The platform includes comprehensive Firestore and Storage security rules:
- Role-based access control (Student, Lecturer, Admin)
- Users can only modify their own data
- Lecturers can only edit their own courses
- Admins have full access for moderation

## 💳 Payment Flow

1. Student selects a course
2. Clicks "Enroll Now"
3. Paystack payment modal opens
4. Payment processed securely
5. On success:
   - Transaction recorded in Firestore
   - Student enrolled in course
   - Lecturer earnings updated (75% commission)
   - Student added to study group

## 📊 Database Schema

### Collections
- `users` - User profiles (students, lecturers, admins)
- `courses` - Course information
- `courses/{id}/lessons` - Course lessons (subcollection)
- `enrollments` - Student course enrollments
- `transactions` - Payment transactions
- `questions` - Student questions
- `studyGroups` - Course study groups
- `studyGroups/{id}/posts` - Group posts (subcollection)
- `liveStreams` - Live streaming sessions
- `reviews` - Course reviews
- `withdrawals` - Lecturer withdrawal requests

## 🎓 User Roles

### Student
- Browse and purchase courses
- Access enrolled courses
- Track progress
- Ask questions
- Join study groups

### Lecturer
- Must be approved by admin
- Create and manage courses
- Upload video lessons
- Answer questions
- Host live sessions
- View earnings (75% commission)

### Admin
- Approve lecturer applications
- Moderate courses
- View platform analytics
- Manage users

## 🔧 Development Tips

1. **Testing Payments**: Use Paystack test keys for development
2. **Video Upload**: Cloudinary has free tier limits, monitor usage
3. **Live Streaming**: Agora has free minutes, plan accordingly
4. **Firebase**: Monitor Firestore reads/writes to avoid costs

## 📝 Environment Variables

All required environment variables are listed in `.env.example`. Copy this file to `.env.local` and fill in your actual values.

## 🐛 Troubleshooting

### Tailwind not working
- Ensure `tailwind.config.js` and `postcss.config.js` are properly configured
- Check that Tailwind directives are in `src/index.css`

### Firebase errors
- Verify all Firebase services are enabled in console
- Check that security rules are deployed
- Ensure environment variables are correct

### Payment not working
- Verify Paystack public key is correct
- Check that Paystack script is loaded in `index.html`
- Test with Paystack test cards

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@naijaedu.com or create an issue in the repository.
