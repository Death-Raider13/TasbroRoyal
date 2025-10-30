import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  PaperAirplaneIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function ReplyEditor({ onSubmit, onCancel, placeholder = 'Write your reply...' }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm();

  const watchedContent = watch('content', '');

  const onSubmitForm = async (data) => {
    if (data.content.trim().length < 5) {
      alert('Please provide a more detailed reply (at least 5 characters).');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Failed to submit reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border">
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-3">
        <div className="form-field">
          <textarea
            {...register('content', { 
              required: 'Please provide a reply',
              minLength: {
                value: 5,
                message: 'Reply must be at least 5 characters long'
              },
              maxLength: {
                value: 1000,
                message: 'Reply must be less than 1000 characters'
              }
            })}
            className="form-input min-h-[80px] text-sm"
            placeholder={placeholder}
          />
          <div className="flex justify-between text-xs mt-1">
            {errors.content && (
              <span className="form-error text-xs">{errors.content.message}</span>
            )}
            <span className={`ml-auto ${watchedContent.length > 900 ? 'text-red-500' : 'text-gray-500'}`}>
              {watchedContent.length}/1000
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary text-sm px-3 py-1"
            disabled={isSubmitting}
          >
            <XMarkIcon className="w-4 h-4 mr-1" />
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary text-sm px-3 py-1"
            disabled={isSubmitting || watchedContent.trim().length < 5}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                Posting...
              </div>
            ) : (
              <>
                <PaperAirplaneIcon className="w-4 h-4 mr-1" />
                Reply
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
