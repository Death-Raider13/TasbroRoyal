import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../ui/Modal';
import {
  UserGroupIcon,
  CalendarIcon,
  MapPinIcon,
  TagIcon,
  PlusIcon,
  XMarkIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

const ENGINEERING_CATEGORIES = [
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Computer Engineering',
  'Chemical Engineering',
  'Petroleum Engineering',
  'Agricultural Engineering',
  'General Engineering'
];

const MEETING_TYPES = [
  { value: 'Online', label: 'Online', description: 'Virtual meetings via Zoom, Teams, etc.' },
  { value: 'In-Person', label: 'In-Person', description: 'Physical meetings at a location' },
  { value: 'Hybrid', label: 'Hybrid', description: 'Both online and in-person options' }
];

const STUDY_TAGS = [
  'Exam Prep', 'Project-Based', 'Weekly', 'Bi-weekly', 'Daily', 'Weekend',
  'Beginner Friendly', 'Advanced', 'Interactive', 'Hands-on', 'Theory',
  'Lab Work', 'Industry Focus', 'Research', 'Competitive Programming'
];

export default function CreateStudyGroupModal({ isOpen, onClose, onSubmit }) {
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTag, setCustomTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [groupImage, setGroupImage] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm();

  const watchedName = watch('name', '');
  const watchedDescription = watch('description', '');

  const handleClose = () => {
    reset();
    setSelectedTags([]);
    setCustomTag('');
    setGroupImage(null);
    onClose();
  };

  const addTag = (tag) => {
    if (!selectedTags.includes(tag) && selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim()) && selectedTags.length < 5) {
      setSelectedTags([...selectedTags, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you'd upload to your storage service
      const reader = new FileReader();
      reader.onload = () => {
        setGroupImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmitForm = async (data) => {
    setIsSubmitting(true);
    
    try {
      const studyGroupData = {
        ...data,
        tags: selectedTags,
        image: groupImage || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop',
        members: 1, // Creator is the first member
        createdAt: new Date().toISOString(),
        rating: 0,
        organizer: 'Current User', // Would come from auth context
        nextMeeting: data.nextMeeting || new Date().toISOString().split('T')[0]
      };

      await onSubmit(studyGroupData);
      handleClose();
    } catch (error) {
      console.error('Error creating study group:', error);
      alert('Failed to create study group. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Study Group"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
        {/* Group Name */}
        <div className="form-field">
          <label className="form-label required">
            Study Group Name
          </label>
          <input
            type="text"
            {...register('name', { 
              required: 'Group name is required',
              minLength: {
                value: 5,
                message: 'Group name must be at least 5 characters long'
              },
              maxLength: {
                value: 100,
                message: 'Group name must be less than 100 characters'
              }
            })}
            className="form-input"
            placeholder="e.g., Thermodynamics Study Circle, Circuit Analysis Group..."
          />
          <div className="flex justify-between text-sm mt-1">
            {errors.name && (
              <span className="form-error">{errors.name.message}</span>
            )}
            <span className={`ml-auto ${watchedName.length > 90 ? 'text-red-500' : 'text-gray-500'}`}>
              {watchedName.length}/100
            </span>
          </div>
        </div>

        {/* Category and Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-field">
            <label className="form-label required">
              Engineering Category
            </label>
            <select
              {...register('category', { required: 'Please select a category' })}
              className="form-input"
            >
              <option value="">Select category...</option>
              {ENGINEERING_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <span className="form-error">{errors.category.message}</span>
            )}
          </div>

          <div className="form-field">
            <label className="form-label required">
              Meeting Type
            </label>
            <select
              {...register('type', { required: 'Please select meeting type' })}
              className="form-input"
            >
              <option value="">Select type...</option>
              {MEETING_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <span className="form-error">{errors.type.message}</span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="form-field">
          <label className="form-label required">
            Group Description
          </label>
          <textarea
            {...register('description', { 
              required: 'Please provide a description',
              minLength: {
                value: 20,
                message: 'Please provide more details (at least 20 characters)'
              },
              maxLength: {
                value: 500,
                message: 'Description must be less than 500 characters'
              }
            })}
            className="form-input"
            rows="4"
            placeholder="Describe what your study group will focus on, learning objectives, and what members can expect..."
          />
          <div className="flex justify-between text-sm mt-1">
            {errors.description && (
              <span className="form-error">{errors.description.message}</span>
            )}
            <span className={`ml-auto ${watchedDescription.length > 450 ? 'text-red-500' : 'text-gray-500'}`}>
              {watchedDescription.length}/500
            </span>
          </div>
        </div>

        {/* Meeting Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-field">
            <label className="form-label required">
              Meeting Schedule
            </label>
            <input
              type="text"
              {...register('meetingTime', { required: 'Please specify meeting schedule' })}
              className="form-input"
              placeholder="e.g., Saturdays 2:00 PM, Daily 8:00 PM"
            />
            {errors.meetingTime && (
              <span className="form-error">{errors.meetingTime.message}</span>
            )}
          </div>

          <div className="form-field">
            <label className="form-label required">
              Location/Platform
            </label>
            <input
              type="text"
              {...register('location', { required: 'Please specify location or platform' })}
              className="form-input"
              placeholder="e.g., UNILAG Room 204, Zoom, Discord"
            />
            {errors.location && (
              <span className="form-error">{errors.location.message}</span>
            )}
          </div>
        </div>

        {/* Max Members and Next Meeting */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-field">
            <label className="form-label required">
              Maximum Members
            </label>
            <input
              type="number"
              {...register('maxMembers', { 
                required: 'Please set maximum members',
                min: { value: 2, message: 'Minimum 2 members required' },
                max: { value: 100, message: 'Maximum 100 members allowed' }
              })}
              className="form-input"
              placeholder="e.g., 20"
              min="2"
              max="100"
            />
            {errors.maxMembers && (
              <span className="form-error">{errors.maxMembers.message}</span>
            )}
          </div>

          <div className="form-field">
            <label className="form-label">
              Next Meeting Date
            </label>
            <input
              type="date"
              {...register('nextMeeting')}
              className="form-input"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Group Image Upload */}
        <div className="form-field">
          <label className="form-label">
            Group Image (Optional)
          </label>
          <div className="flex items-center gap-4">
            {groupImage ? (
              <div className="relative">
                <img
                  src={groupImage}
                  alt="Group preview"
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setGroupImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                <PhotoIcon className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <label className="btn-secondary cursor-pointer">
              <PhotoIcon className="w-4 h-4 mr-2" />
              Choose Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Tags Section */}
        <div className="form-field">
          <label className="form-label">
            Tags (Optional, up to 5)
          </label>
          
          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedTags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 hover:text-green-600"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Add Custom Tag */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
              className="form-input flex-1"
              placeholder="Add a custom tag..."
              disabled={selectedTags.length >= 5}
            />
            <button
              type="button"
              onClick={addCustomTag}
              disabled={!customTag.trim() || selectedTags.length >= 5}
              className="btn-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Popular Tags */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Popular tags:</p>
            <div className="flex flex-wrap gap-2">
              {STUDY_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  disabled={selectedTags.includes(tag) || selectedTags.length >= 5}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-green-50 hover:border-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Guidelines */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <UserGroupIcon className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-green-900 mb-2">Study Group Guidelines:</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Create a welcoming and inclusive learning environment</li>
                <li>• Set clear expectations for participation and attendance</li>
                <li>• Respect different learning styles and paces</li>
                <li>• Share resources and help each other succeed</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="btn-secondary flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </div>
            ) : (
              'Create Study Group'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
