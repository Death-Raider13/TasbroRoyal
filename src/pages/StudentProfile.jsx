import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCircleIcon,
  PencilIcon,
  CameraIcon,
  CheckIcon,
  XMarkIcon,
  AcademicCapIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  StarIcon,
  BookOpenIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../store/authStore';
import { useToast } from '../components/ui/Toast';
import { updateUserProfile, getUserProfile } from '../services/firestore';
import { uploadProfileImageToCloudinary } from '../services/cloudinary';

export default function StudentProfile() {
  const { userData, updateUserData } = useAuthStore();
  const { success, error } = useToast();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeSection, setActiveSection] = useState('basic'); // 'basic', 'academic', 'interests'
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Form states
  const [basicInfo, setBasicInfo] = useState({
    displayName: '',
    bio: '',
    location: '',
    phone: '',
    website: '',
    profileImage: '',
    dateOfBirth: '',
    gender: ''
  });
  
  const [academicInfo, setAcademicInfo] = useState({
    institution: '',
    program: '',
    yearOfStudy: '',
    graduationYear: '',
    gpa: '',
    academicLevel: 'undergraduate' // undergraduate, graduate, postgraduate
  });
  
  const [interests, setInterests] = useState({
    subjects: [], // Engineering subjects of interest
    careerGoals: '',
    learningStyle: 'visual', // visual, auditory, kinesthetic, reading
    studyPreferences: [],
    goals: []
  });

  const [socialLinks, setSocialLinks] = useState({
    linkedin: '',
    twitter: '',
    github: '',
    portfolio: ''
  });

  useEffect(() => {
    loadProfile();
  }, [userData]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await getUserProfile(userData.uid);
      
      if (profileData) {
        setProfile(profileData);
        setBasicInfo({
          displayName: profileData.displayName || userData.displayName || '',
          bio: profileData.bio || '',
          location: profileData.location || '',
          phone: profileData.phone || '',
          website: profileData.website || '',
          profileImage: profileData.profileImage || userData.photoURL || '',
          dateOfBirth: profileData.dateOfBirth || '',
          gender: profileData.gender || ''
        });
        setAcademicInfo(profileData.academicInfo || {
          institution: '',
          program: '',
          yearOfStudy: '',
          graduationYear: '',
          gpa: '',
          academicLevel: 'undergraduate'
        });
        setInterests(profileData.interests || {
          subjects: [],
          careerGoals: '',
          learningStyle: 'visual',
          studyPreferences: [],
          goals: []
        });
        setSocialLinks(profileData.socialLinks || {
          linkedin: '', twitter: '', github: '', portfolio: ''
        });
      } else {
        // Initialize with user data
        setBasicInfo({
          displayName: userData.displayName || '',
          bio: '',
          location: '',
          phone: '',
          website: '',
          profileImage: userData.photoURL || '',
          dateOfBirth: '',
          gender: ''
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      const updatedProfile = {
        ...basicInfo,
        academicInfo,
        interests,
        socialLinks,
        lastUpdated: new Date(),
        isPublic: true
      };
      
      await updateUserProfile(userData.uid, updatedProfile);
      
      // Update auth store if display name or profile image changed
      const authUpdates = {};
      if (basicInfo.displayName !== userData.displayName) {
        authUpdates.displayName = basicInfo.displayName;
      }
      if (basicInfo.profileImage !== userData.profileImage) {
        authUpdates.profileImage = basicInfo.profileImage;
      }
      if (Object.keys(authUpdates).length > 0) {
        updateUserData(authUpdates);
      }
      
      setProfile(updatedProfile);
      setEditMode(false);
      success('Profile updated successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
      error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      setUploadProgress(0);

      const result = await uploadProfileImageToCloudinary(file, (progress) => {
        setUploadProgress(progress);
      });

      // Update the profile image in state
      setBasicInfo(prev => ({
        ...prev,
        profileImage: result.url
      }));

      // Update auth store immediately so navbar reflects the change
      updateUserData({ profileImage: result.url });

      success('Profile image uploaded successfully!');
    } catch (err) {
      console.error('Error uploading image:', err);
      error('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
    }
  };

  const handleAddSubject = (subject) => {
    if (subject && !interests.subjects.includes(subject)) {
      setInterests(prev => ({
        ...prev,
        subjects: [...prev.subjects, subject]
      }));
    }
  };

  const handleRemoveSubject = (subject) => {
    setInterests(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s !== subject)
    }));
  };

  const handleAddGoal = (goal) => {
    if (goal && !interests.goals.includes(goal)) {
      setInterests(prev => ({
        ...prev,
        goals: [...prev.goals, goal]
      }));
    }
  };

  const handleRemoveGoal = (goal) => {
    setInterests(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g !== goal)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/student/dashboard" className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-lg text-gray-900">Student Profile</h1>
              <p className="text-gray-600 mt-2">Manage your profile and academic information</p>
            </div>
            <div className="flex gap-3">
              {editMode ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2"
                  >
                    <CheckIcon className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      loadProfile(); // Reset changes
                    }}
                    className="btn-outline flex items-center gap-2"
                  >
                    <XMarkIcon className="w-5 h-5" />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <PencilIcon className="w-5 h-5" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveSection('basic')}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                    activeSection === 'basic'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <UserCircleIcon className="w-5 h-5 inline mr-2" />
                  Basic Information
                </button>
                <button
                  onClick={() => setActiveSection('academic')}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                    activeSection === 'academic'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <AcademicCapIcon className="w-5 h-5 inline mr-2" />
                  Academic Info
                </button>
                <button
                  onClick={() => setActiveSection('interests')}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                    activeSection === 'interests'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <BookOpenIcon className="w-5 h-5 inline mr-2" />
                  Interests & Goals
                </button>
              </nav>
            </div>

            {/* Profile Preview */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Preview</h3>
              <div className="text-center">
                <div className="relative inline-block">
                  {basicInfo.profileImage ? (
                    <img
                      src={basicInfo.profileImage}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                      <UserCircleIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  {editMode && (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="profile-image-upload"
                        disabled={uploadingImage}
                      />
                      <label
                        htmlFor="profile-image-upload"
                        className={`absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 transition-colors cursor-pointer ${
                          uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <CameraIcon className="w-4 h-4" />
                      </label>
                    </>
                  )}
                  
                  {/* Upload Progress */}
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="text-white text-xs font-medium">
                        {Math.round(uploadProgress)}%
                      </div>
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-gray-900 mt-3">{basicInfo.displayName || 'Your Name'}</h4>
                <p className="text-sm text-gray-600">{academicInfo.program || 'Your Program'}</p>
                <p className="text-xs text-gray-500">{academicInfo.institution || 'Your Institution'}</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Basic Information */}
              {activeSection === 'basic' && (
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Basic Information</h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                        <input
                          type="text"
                          value={basicInfo.displayName}
                          onChange={(e) => setBasicInfo(prev => ({ ...prev, displayName: e.target.value }))}
                          disabled={!editMode}
                          className="form-input w-full"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={userData.email}
                          disabled
                          className="form-input w-full bg-gray-50"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        value={basicInfo.bio}
                        onChange={(e) => setBasicInfo(prev => ({ ...prev, bio: e.target.value }))}
                        disabled={!editMode}
                        rows={4}
                        className="form-input w-full"
                        placeholder="Tell us about yourself, your interests, and goals..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input
                          type="text"
                          value={basicInfo.location}
                          onChange={(e) => setBasicInfo(prev => ({ ...prev, location: e.target.value }))}
                          disabled={!editMode}
                          className="form-input w-full"
                          placeholder="Lagos, Nigeria"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={basicInfo.phone}
                          onChange={(e) => setBasicInfo(prev => ({ ...prev, phone: e.target.value }))}
                          disabled={!editMode}
                          className="form-input w-full"
                          placeholder="+234 xxx xxx xxxx"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                        <input
                          type="date"
                          value={basicInfo.dateOfBirth}
                          onChange={(e) => setBasicInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                          disabled={!editMode}
                          className="form-input w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <select
                          value={basicInfo.gender}
                          onChange={(e) => setBasicInfo(prev => ({ ...prev, gender: e.target.value }))}
                          disabled={!editMode}
                          className="form-select w-full"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Website/Portfolio</label>
                      <input
                        type="url"
                        value={basicInfo.website}
                        onChange={(e) => setBasicInfo(prev => ({ ...prev, website: e.target.value }))}
                        disabled={!editMode}
                        className="form-input w-full"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>

                    {/* Social Links */}
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-4">Social Links</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                          <input
                            type="url"
                            value={socialLinks.linkedin}
                            onChange={(e) => setSocialLinks(prev => ({ ...prev, linkedin: e.target.value }))}
                            disabled={!editMode}
                            className="form-input w-full"
                            placeholder="https://linkedin.com/in/username"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
                          <input
                            type="url"
                            value={socialLinks.github}
                            onChange={(e) => setSocialLinks(prev => ({ ...prev, github: e.target.value }))}
                            disabled={!editMode}
                            className="form-input w-full"
                            placeholder="https://github.com/username"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Academic Information */}
              {activeSection === 'academic' && (
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Academic Information</h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                        <input
                          type="text"
                          value={academicInfo.institution}
                          onChange={(e) => setAcademicInfo(prev => ({ ...prev, institution: e.target.value }))}
                          disabled={!editMode}
                          className="form-input w-full"
                          placeholder="University of Lagos"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Program/Course of Study</label>
                        <input
                          type="text"
                          value={academicInfo.program}
                          onChange={(e) => setAcademicInfo(prev => ({ ...prev, program: e.target.value }))}
                          disabled={!editMode}
                          className="form-input w-full"
                          placeholder="Computer Engineering"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Academic Level</label>
                        <select
                          value={academicInfo.academicLevel}
                          onChange={(e) => setAcademicInfo(prev => ({ ...prev, academicLevel: e.target.value }))}
                          disabled={!editMode}
                          className="form-select w-full"
                        >
                          <option value="undergraduate">Undergraduate</option>
                          <option value="graduate">Graduate</option>
                          <option value="postgraduate">Postgraduate</option>
                          <option value="professional">Professional</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Year of Study</label>
                        <select
                          value={academicInfo.yearOfStudy}
                          onChange={(e) => setAcademicInfo(prev => ({ ...prev, yearOfStudy: e.target.value }))}
                          disabled={!editMode}
                          className="form-select w-full"
                        >
                          <option value="">Select year</option>
                          <option value="1">1st Year</option>
                          <option value="2">2nd Year</option>
                          <option value="3">3rd Year</option>
                          <option value="4">4th Year</option>
                          <option value="5">5th Year</option>
                          <option value="6">6th Year</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expected Graduation</label>
                        <input
                          type="number"
                          value={academicInfo.graduationYear}
                          onChange={(e) => setAcademicInfo(prev => ({ ...prev, graduationYear: e.target.value }))}
                          disabled={!editMode}
                          className="form-input w-full"
                          placeholder="2025"
                          min="2020"
                          max="2030"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">GPA/CGPA (Optional)</label>
                      <input
                        type="number"
                        value={academicInfo.gpa}
                        onChange={(e) => setAcademicInfo(prev => ({ ...prev, gpa: e.target.value }))}
                        disabled={!editMode}
                        className="form-input w-full"
                        placeholder="4.50"
                        step="0.01"
                        min="0"
                        max="5"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Interests & Goals */}
              {activeSection === 'interests' && (
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Interests & Goals</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Learning Style</label>
                      <select
                        value={interests.learningStyle}
                        onChange={(e) => setInterests(prev => ({ ...prev, learningStyle: e.target.value }))}
                        disabled={!editMode}
                        className="form-select w-full"
                      >
                        <option value="visual">Visual (learn through seeing)</option>
                        <option value="auditory">Auditory (learn through hearing)</option>
                        <option value="kinesthetic">Kinesthetic (learn through doing)</option>
                        <option value="reading">Reading/Writing (learn through text)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Career Goals</label>
                      <textarea
                        value={interests.careerGoals}
                        onChange={(e) => setInterests(prev => ({ ...prev, careerGoals: e.target.value }))}
                        disabled={!editMode}
                        rows={4}
                        className="form-input w-full"
                        placeholder="Describe your career aspirations and professional goals..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subjects of Interest</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {interests.subjects.map((subject, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                          >
                            {subject}
                            {editMode && (
                              <button
                                onClick={() => handleRemoveSubject(subject)}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                ×
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                      {editMode && (
                        <input
                          type="text"
                          className="form-input w-full"
                          placeholder="Add subject (press Enter)"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddSubject(e.target.value);
                              e.target.value = '';
                            }
                          }}
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Learning Goals</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {interests.goals.map((goal, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                          >
                            {goal}
                            {editMode && (
                              <button
                                onClick={() => handleRemoveGoal(goal)}
                                className="ml-2 text-green-600 hover:text-green-800"
                              >
                                ×
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                      {editMode && (
                        <input
                          type="text"
                          className="form-input w-full"
                          placeholder="Add learning goal (press Enter)"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddGoal(e.target.value);
                              e.target.value = '';
                            }
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
