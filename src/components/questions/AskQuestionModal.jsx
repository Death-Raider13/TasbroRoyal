import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../ui/Modal';
import {
  TagIcon,
  QuestionMarkCircleIcon,
  PlusIcon,
  XMarkIcon
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

const POPULAR_TAGS = [
  'Thermodynamics', 'Structural Analysis', 'Circuit Design', 'Programming',
  'Fluid Mechanics', 'Materials Science', 'Control Systems', 'Database',
  'Heat Transfer', 'Concrete Design', 'Electronics', 'Algorithms',
  'Machine Design', 'Geotechnics', 'Power Systems', 'Software Engineering'
];

export default function AskQuestionModal({ isOpen, onClose, onSubmit }) {
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTag, setCustomTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm();

  const watchedTitle = watch('title', '');
  const watchedContent = watch('content', '');

  const handleClose = () => {
    reset();
    setSelectedTags([]);
    setCustomTag('');
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

  const onSubmitForm = async (data) => {
    if (selectedTags.length === 0) {
      alert('Please add at least one tag to your question.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const questionData = {
        ...data,
        tags: selectedTags,
        createdAt: new Date().toISOString(),
        votes: 0,
        answers: 0,
        views: 0,
        isAnswered: false,
        isTrending: false
      };

      await onSubmit(questionData);
      handleClose();
    } catch (error) {
      console.error('Error submitting question:', error);
      alert('Failed to submit question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Ask a Question"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
        {/* Question Title */}
        <div className="form-field">
          <label className="form-label required">
            Question Title
          </label>
          <input
            type="text"
            {...register('title', { 
              required: 'Question title is required',
              minLength: {
                value: 10,
                message: 'Title must be at least 10 characters long'
              },
              maxLength: {
                value: 200,
                message: 'Title must be less than 200 characters'
              }
            })}
            className="form-input"
            placeholder="What's your engineering question? Be specific and clear..."
          />
          <div className="flex justify-between text-sm mt-1">
            {errors.title && (
              <span className="form-error">{errors.title.message}</span>
            )}
            <span className={`ml-auto ${watchedTitle.length > 180 ? 'text-red-500' : 'text-gray-500'}`}>
              {watchedTitle.length}/200
            </span>
          </div>
        </div>

        {/* Category */}
        <div className="form-field">
          <label className="form-label required">
            Engineering Category
          </label>
          <select
            {...register('category', { required: 'Please select a category' })}
            className="form-input"
          >
            <option value="">Select a category...</option>
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

        {/* Question Content */}
        <div className="form-field">
          <label className="form-label required">
            Question Details
          </label>
          <textarea
            {...register('content', { 
              required: 'Please provide details about your question',
              minLength: {
                value: 30,
                message: 'Please provide more details (at least 30 characters)'
              },
              maxLength: {
                value: 2000,
                message: 'Question details must be less than 2000 characters'
              }
            })}
            className="form-input"
            rows="6"
            placeholder="Provide more details about your question. Include what you've tried, specific problems you're facing, and any relevant context..."
          />
          <div className="flex justify-between text-sm mt-1">
            {errors.content && (
              <span className="form-error">{errors.content.message}</span>
            )}
            <span className={`ml-auto ${watchedContent.length > 1800 ? 'text-red-500' : 'text-gray-500'}`}>
              {watchedContent.length}/2000
            </span>
          </div>
        </div>

        {/* Tags Section */}
        <div className="form-field">
          <label className="form-label required">
            Tags (Select up to 5)
          </label>
          
          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedTags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 hover:text-blue-600"
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
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  disabled={selectedTags.includes(tag) || selectedTags.length >= 5}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          
          {selectedTags.length === 0 && (
            <p className="form-error mt-2">Please add at least one tag</p>
          )}
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <QuestionMarkCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Tips for a great question:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Be specific and clear in your title</li>
                <li>• Provide context and what you've already tried</li>
                <li>• Include relevant equations, diagrams, or code if applicable</li>
                <li>• Use appropriate tags to help others find your question</li>
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
            disabled={isSubmitting || selectedTags.length === 0}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Posting...
              </div>
            ) : (
              'Post Question'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
