import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCircleIcon,
  PencilIcon,
  CameraIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  StarIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  DocumentTextIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../store/authStore';
import { useToast } from '../components/ui/Toast';
import { updateUserProfile, getUserProfile } from '../services/firestore';
import { uploadProfileImageToCloudinary } from '../services/cloudinary';

export default function LecturerProfile() {
  const { userData, updateUserData } = useAuthStore();
  const { success, error } = useToast();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeSection, setActiveSection] = useState('basic'); // 'basic', 'professional', 'social', 'credentials'
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Form states
  const [basicInfo, setBasicInfo] = useState({
    displayName: '',
    bio: '',
    title: '',
    location: '',
    website: '',
    profileImage: ''
  });
  
  const [professionalInfo, setProfessionalInfo] = useState({
    experience: '',
    specializations: [],
    languages: [],
    teachingStyle: '',
    achievements: []
  });
  
  const [socialLinks, setSocialLinks] = useState({
    linkedin: '',
    twitter: '',
    facebook: '',
    instagram: '',
    youtube: '',
    github: ''
  });
  
  const [credentials, setCredentials] = useState([]);
  const [newCredential, setNewCredential] = useState({
    type: 'education', // 'education', 'certification', 'experience'
    title: '',
    institution: '',
    year: '',
    description: '',
    verificationUrl: ''
  });
  
  const [showCredentialForm, setShowCredentialForm] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [userData]);

  const loadProfile = async () => {
    if (!userData?.uid) return;
    
    try {
      setLoading(true);
      const profileData = await getUserProfile(userData.uid);
      
      if (profileData) {
        setProfile(profileData);
        setBasicInfo({
          displayName: profileData.displayName || userData.displayName || '',
          bio: profileData.bio || '',
          title: profileData.title || '',
          location: profileData.location || '',
          website: profileData.website || '',
          profileImage: profileData.profileImage || userData.photoURL || ''
        });
        setProfessionalInfo({
          experience: profileData.experience || '',
          specializations: profileData.specializations || [],
          languages: profileData.languages || [],
          teachingStyle: profileData.teachingStyle || '',
          achievements: profileData.achievements || []
        });
        setSocialLinks(profileData.socialLinks || {
          linkedin: '', twitter: '', facebook: '', instagram: '', youtube: '', github: ''
        });
        setCredentials(profileData.credentials || []);
      } else {
        // Initialize with user data
        setBasicInfo({
          displayName: userData.displayName || '',
          bio: '',
          title: '',
          location: '',
          website: '',
          profileImage: userData.photoURL || ''
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
        ...professionalInfo,
        socialLinks,
        credentials,
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

  const handleAddCredential = () => {
    if (!newCredential.title || !newCredential.institution) {
      error('Please fill in required fields');
      return;
    }
    
    const credential = {
      id: Date.now().toString(),
      ...newCredential,
      createdAt: new Date()
    };
    
    setCredentials([...credentials, credential]);
    setNewCredential({
      type: 'education',
      title: '',
      institution: '',
      year: '',
      description: '',
      verificationUrl: ''
    });
    setShowCredentialForm(false);
    success('Credential added successfully!');
  };

  const handleRemoveCredential = (credentialId) => {
    setCredentials(credentials.filter(c => c.id !== credentialId));
    success('Credential removed');
  };

  const handleAddSpecialization = (specialization) => {
    if (specialization && !professionalInfo.specializations.includes(specialization)) {
      setProfessionalInfo(prev => ({
        ...prev,
        specializations: [...prev.specializations, specialization]
      }));
    }
  };

  const handleRemoveSpecialization = (specialization) => {
    setProfessionalInfo(prev => ({
      ...prev,
      specializations: prev.specializations.filter(s => s !== specialization)
    }));
  };

  const handleAddLanguage = (language) => {
    if (language && !professionalInfo.languages.includes(language)) {
      setProfessionalInfo(prev => ({
        ...prev,
        languages: [...prev.languages, language]
      }));
    }
  };

  const handleRemoveLanguage = (language) => {
    setProfessionalInfo(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }));
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

  const getCredentialIcon = (type) => {
    switch (type) {
      case 'education':
        return <AcademicCapIcon className="w-5 h-5 text-blue-600" />;
      case 'certification':
        return <DocumentTextIcon className="w-5 h-5 text-green-600" />;
      case 'experience':
        return <BriefcaseIcon className="w-5 h-5 text-purple-600" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-600" />;
    }
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
          <Link to="/lecturer/dashboard" className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-lg text-gray-900">Lecturer Profile</h1>
              <p className="text-gray-600 mt-2">Manage your public profile and credentials</p>
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
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <UserCircleIcon className="w-5 h-5 inline mr-2" />
                  Basic Information
                </button>
                <button
                  onClick={() => setActiveSection('professional')}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                    activeSection === 'professional'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <BriefcaseIcon className="w-5 h-5 inline mr-2" />
                  Professional Info
                </button>
                <button
                  onClick={() => setActiveSection('social')}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                    activeSection === 'social'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <GlobeAltIcon className="w-5 h-5 inline mr-2" />
                  Social Links
                </button>
                <button
                  onClick={() => setActiveSection('credentials')}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                    activeSection === 'credentials'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <AcademicCapIcon className="w-5 h-5 inline mr-2" />
                  Credentials
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
                <p className="text-sm text-gray-600">{basicInfo.title || 'Your Title'}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">4.8 (127 reviews)</span>
                </div>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Professional Title</label>
                        <input
                          type="text"
                          value={basicInfo.title}
                          onChange={(e) => setBasicInfo(prev => ({ ...prev, title: e.target.value }))}
                          disabled={!editMode}
                          className="form-input w-full"
                          placeholder="e.g., Senior Software Engineer"
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
                        placeholder="Tell students about yourself, your background, and teaching philosophy..."
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                        <input
                          type="url"
                          value={basicInfo.website}
                          onChange={(e) => setBasicInfo(prev => ({ ...prev, website: e.target.value }))}
                          disabled={!editMode}
                          className="form-input w-full"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Information */}
              {activeSection === 'professional' && (
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Professional Information</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                      <input
                        type="text"
                        value={professionalInfo.experience}
                        onChange={(e) => setProfessionalInfo(prev => ({ ...prev, experience: e.target.value }))}
                        disabled={!editMode}
                        className="form-input w-full"
                        placeholder="e.g., 5+ years in software development"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Specializations</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {professionalInfo.specializations.map((spec, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {spec}
                            {editMode && (
                              <button
                                onClick={() => handleRemoveSpecialization(spec)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                      {editMode && (
                        <input
                          type="text"
                          className="form-input w-full"
                          placeholder="Add specialization (press Enter)"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddSpecialization(e.target.value);
                              e.target.value = '';
                            }
                          }}
                        />
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {professionalInfo.languages.map((lang, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                          >
                            {lang}
                            {editMode && (
                              <button
                                onClick={() => handleRemoveLanguage(lang)}
                                className="text-green-600 hover:text-green-800"
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                      {editMode && (
                        <input
                          type="text"
                          className="form-input w-full"
                          placeholder="Add language (press Enter)"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddLanguage(e.target.value);
                              e.target.value = '';
                            }
                          }}
                        />
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Teaching Style</label>
                      <textarea
                        value={professionalInfo.teachingStyle}
                        onChange={(e) => setProfessionalInfo(prev => ({ ...prev, teachingStyle: e.target.value }))}
                        disabled={!editMode}
                        rows={3}
                        className="form-input w-full"
                        placeholder="Describe your teaching methodology and approach..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Social Links */}
              {activeSection === 'social' && (
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Social Media Links</h3>
                  <div className="space-y-4">
                    {Object.entries(socialLinks).map(([platform, url]) => (
                      <div key={platform}>
                        <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                          {platform}
                        </label>
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => setSocialLinks(prev => ({ ...prev, [platform]: e.target.value }))}
                          disabled={!editMode}
                          className="form-input w-full"
                          placeholder={`https://${platform}.com/yourprofile`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Credentials */}
              {activeSection === 'credentials' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Credentials & Qualifications</h3>
                    {editMode && (
                      <button
                        onClick={() => setShowCredentialForm(true)}
                        className="btn-primary flex items-center gap-2"
                      >
                        <PlusIcon className="w-5 h-5" />
                        Add Credential
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {credentials.map((credential) => (
                      <div key={credential.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getCredentialIcon(credential.type)}
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{credential.title}</h4>
                              <p className="text-gray-600">{credential.institution}</p>
                              {credential.year && (
                                <p className="text-sm text-gray-500">{credential.year}</p>
                              )}
                              {credential.description && (
                                <p className="text-sm text-gray-600 mt-2">{credential.description}</p>
                              )}
                              {credential.verificationUrl && (
                                <a
                                  href={credential.verificationUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-2"
                                >
                                  <LinkIcon className="w-4 h-4" />
                                  Verify Credential
                                </a>
                              )}
                            </div>
                          </div>
                          {editMode && (
                            <button
                              onClick={() => handleRemoveCredential(credential.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {credentials.length === 0 && (
                      <div className="text-center py-8">
                        <AcademicCapIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600">No credentials added yet</p>
                        {editMode && (
                          <button
                            onClick={() => setShowCredentialForm(true)}
                            className="btn-primary mt-4"
                          >
                            Add Your First Credential
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Credential Modal */}
        {showCredentialForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Add Credential</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={newCredential.type}
                    onChange={(e) => setNewCredential(prev => ({ ...prev, type: e.target.value }))}
                    className="form-input w-full"
                  >
                    <option value="education">Education</option>
                    <option value="certification">Certification</option>
                    <option value="experience">Work Experience</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={newCredential.title}
                      onChange={(e) => setNewCredential(prev => ({ ...prev, title: e.target.value }))}
                      className="form-input w-full"
                      placeholder="e.g., Bachelor of Computer Science"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Institution *</label>
                    <input
                      type="text"
                      value={newCredential.institution}
                      onChange={(e) => setNewCredential(prev => ({ ...prev, institution: e.target.value }))}
                      className="form-input w-full"
                      placeholder="e.g., University of Lagos"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                    <input
                      type="text"
                      value={newCredential.year}
                      onChange={(e) => setNewCredential(prev => ({ ...prev, year: e.target.value }))}
                      className="form-input w-full"
                      placeholder="e.g., 2020 or 2018-2022"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Verification URL</label>
                    <input
                      type="url"
                      value={newCredential.verificationUrl}
                      onChange={(e) => setNewCredential(prev => ({ ...prev, verificationUrl: e.target.value }))}
                      className="form-input w-full"
                      placeholder="https://verify.institution.com/credential"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newCredential.description}
                    onChange={(e) => setNewCredential(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="form-input w-full"
                    placeholder="Additional details about this credential..."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddCredential}
                  className="btn-primary flex-1"
                >
                  Add Credential
                </button>
                <button
                  onClick={() => setShowCredentialForm(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
