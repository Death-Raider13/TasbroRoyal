# Firestore Security Rules Documentation

## Overview
This document explains the comprehensive Firestore security rules for the Nigerian Engineering Platform. The rules are designed to provide secure, role-based access control while enabling the Q&A system, study groups, and other platform features.

## Rule Structure

### Helper Functions
```javascript
isAuthenticated()    // User is logged in
isAdmin()           // User has admin role
isLecturer()        // User has lecturer role  
isStudent()         // User has student role
isOwner(userId)     // User owns the resource
```

## Collection Rules

### 🙋‍♂️ Questions Collection (`/questions/{questionId}`)

**Purpose**: Q&A system for engineering questions

| Operation | Permission | Notes |
|-----------|------------|-------|
| **Read** | Public | Anyone can read questions for learning |
| **Create** | Authenticated | Any logged-in user can ask questions |
| **Update** | Conditional | Author can edit, anyone can vote, author can accept answers |
| **Delete** | Admin/Owner | Only admins or question author |

**Update Conditions**:
- Question author can edit their question
- Anyone can vote (updates `votes`, `userVotes`, `views`)
- Question author can mark answers as accepted
- System can increment answer count

#### Answers Subcollection (`/questions/{questionId}/answers/{answerId}`)

| Operation | Permission | Notes |
|-----------|------------|-------|
| **Read** | Public | Anyone can read answers |
| **Create** | Authenticated | Any user can provide answers |
| **Update** | Conditional | Author can edit, anyone can vote, question author can accept |
| **Delete** | Admin/Owner | Only admins or answer author |

#### Replies Subcollection (`/questions/{questionId}/answers/{answerId}/replies/{replyId}`)

| Operation | Permission | Notes |
|-----------|------------|-------|
| **Read** | Public | Anyone can read nested replies |
| **Create** | Authenticated | Any user can reply to answers |
| **Update** | Conditional | Author can edit, anyone can vote |
| **Delete** | Admin/Owner | Only admins or reply author |

### 👥 Study Groups Collection (`/studyGroups/{groupId}`)

**Purpose**: Collaborative study groups for engineering students

| Operation | Permission | Notes |
|-----------|------------|-------|
| **Read** | Public | Anyone can browse study groups |
| **Create** | Authenticated | Any user can create study groups |
| **Update** | Conditional | Organizer can edit, anyone can join/leave/rate |
| **Delete** | Admin/Organizer | Only admins or group organizer |

**Update Conditions**:
- Group organizer can edit group details
- Anyone can join/leave (updates `members`, `memberIds`)
- Members can rate the group (updates `rating`, `ratings`)

#### Group Discussions (`/studyGroups/{groupId}/discussions/{discussionId}`)

| Operation | Permission | Notes |
|-----------|------------|-------|
| **Read** | Public | Anyone can read group discussions |
| **Create** | Authenticated | Any user can post in discussions |
| **Update** | Owner | Only post author can edit |
| **Delete** | Admin/Owner/Organizer | Admins, post author, or group organizer |

#### Group Announcements (`/studyGroups/{groupId}/announcements/{announcementId}`)

| Operation | Permission | Notes |
|-----------|------------|-------|
| **Read** | Public | Anyone can read announcements |
| **Create** | Organizer | Only group organizer can create announcements |
| **Update** | Owner | Only announcement author can edit |
| **Delete** | Admin/Owner | Only admins or announcement author |

### 👤 Users Collection (`/users/{userId}`)

| Operation | Permission | Notes |
|-----------|------------|-------|
| **Read** | Authenticated | Any logged-in user can read user profiles |
| **Create** | Owner | Users can only create their own profile |
| **Update** | Owner/Admin | Users can edit their profile, admins can edit any |
| **Delete** | Admin | Only admins can delete user accounts |

### 📚 Courses Collection (`/courses/{courseId}`)

| Operation | Permission | Notes |
|-----------|------------|-------|
| **Read** | Public | Anyone can browse courses |
| **Create** | Lecturer | Only lecturers can create courses |
| **Update** | Admin/Owner | Admins or course creator can edit |
| **Delete** | Admin | Only admins can delete courses |

#### Lessons Subcollection (`/courses/{courseId}/lessons/{lessonId}`)

| Operation | Permission | Notes |
|-----------|------------|-------|
| **Read** | Public | Anyone can read lesson content |
| **Write** | Course Owner | Only course lecturer can manage lessons |

### 📝 Enrollments Collection (`/enrollments/{enrollmentId}`)

| Operation | Permission | Notes |
|-----------|------------|-------|
| **Read** | Conditional | Student, admin, or course lecturer |
| **Create** | Authenticated | Any user can enroll in courses |
| **Update** | Owner | Only enrolled student can update |

### 💬 Discussion Forums Collection (`/forums/{forumId}`)

| Operation | Permission | Notes |
|-----------|------------|-------|
| **Read** | Public | Anyone can read forum posts |
| **Create** | Authenticated | Any user can create forum posts |
| **Update** | Conditional | Author can edit, anyone can vote |
| **Delete** | Admin/Owner | Only admins or post author |

### 💬 Chat/Messages Collection (`/chats/{chatId}`)

| Operation | Permission | Notes |
|-----------|------------|-------|
| **Read** | Participants | Only chat participants can read |
| **Create** | Authenticated | Any user can create chats |
| **Update** | Participants | Only participants can update chat |

#### Messages Subcollection (`/chats/{chatId}/messages/{messageId}`)

| Operation | Permission | Notes |
|-----------|------------|-------|
| **Read** | Participants | Only chat participants can read messages |
| **Create** | Participants | Only participants can send messages |
| **Update** | Sender | Only message sender can edit |
| **Delete** | Admin/Sender | Admins or message sender |

### 🔔 Notifications Collection (`/notifications/{notificationId}`)

| Operation | Permission | Notes |
|-----------|------------|-------|
| **Read** | Owner | Users can only read their notifications |
| **Create** | Authenticated | System can create notifications |
| **Update** | Owner | Users can mark notifications as read |
| **Delete** | Owner/Admin | Users can delete their notifications |

### 📊 User Progress Collection (`/userProgress/{userId}`)

| Operation | Permission | Notes |
|-----------|------------|-------|
| **Read** | Owner/Admin | Users can read their progress, admins all |
| **Create/Update** | Owner | Users can update their own progress |
| **Delete** | Admin | Only admins can delete progress data |

### 🚨 Reports Collection (`/reports/{reportId}`)

| Operation | Permission | Notes |
|-----------|------------|-------|
| **Read** | Admin | Only admins can read reports |
| **Create** | Authenticated | Any user can report content |
| **Update** | Admin | Only admins can update report status |
| **Delete** | Admin | Only admins can delete reports |

### 📈 Analytics Collection (`/analytics/{analyticsId}`)

| Operation | Permission | Notes |
|-----------|------------|-------|
| **Read** | Admin | Only admins can read analytics |
| **Create** | System | System can create analytics data |
| **Update** | Admin | Only admins can update analytics |
| **Delete** | Admin | Only admins can delete analytics |

### ⚙️ Settings Collection (`/settings/{settingId}`)

| Operation | Permission | Notes |
|-----------|------------|-------|
| **Read** | Admin | Only admins can read platform settings |
| **Create/Update/Delete** | Admin | Only admins can manage settings |

## Security Features

### 🔒 Authentication Required
- Most write operations require user authentication
- Public read access for educational content (questions, courses, forums)
- Private access for personal data (notifications, progress, chats)

### 🎭 Role-Based Access Control
- **Students**: Can ask questions, join groups, enroll in courses
- **Lecturers**: Can create courses, manage lessons, moderate content
- **Admins**: Full access to all collections and moderation tools

### 🛡️ Data Protection
- Users can only edit their own content
- Voting systems prevent manipulation through field-specific updates
- Chat and messages are restricted to participants only
- Reports and analytics are admin-only for privacy

### 🔄 Granular Updates
- Specific field updates allowed for voting, view counts, member counts
- Prevents unauthorized modification of core content
- Maintains data integrity while allowing interactive features

## Deployment

### Deploy Rules
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy rules
firebase deploy --only firestore:rules

# Or use the deployment script
node deploy-rules.js
```

### Validate Rules
```bash
# Test rules syntax
firebase firestore:rules:validate

# Test with emulator
firebase emulators:start --only firestore
```

## Best Practices

### 🔐 Security
- Always validate user authentication before writes
- Use role-based permissions for sensitive operations
- Implement proper field-level access control
- Regular security audits and rule reviews

### 📊 Performance
- Minimize complex queries in rules
- Use efficient field checks with `affectedKeys()`
- Cache user role data when possible
- Monitor rule evaluation costs

### 🧪 Testing
- Test rules with Firebase emulator
- Create comprehensive test cases for all scenarios
- Validate edge cases and error conditions
- Regular penetration testing

## Troubleshooting

### Common Issues
1. **Permission Denied**: Check user authentication and role
2. **Rule Evaluation Failed**: Validate rule syntax
3. **Infinite Recursion**: Avoid circular references in rules
4. **Performance Issues**: Optimize complex rule conditions

### Debug Commands
```bash
# Check current rules
firebase firestore:rules:get

# Test specific rule
firebase firestore:rules:test

# View rule evaluation logs
firebase firestore:rules:debug
```

---

**Last Updated**: January 2024  
**Version**: 2.0  
**Maintainer**: Nigerian Engineering Platform Team
