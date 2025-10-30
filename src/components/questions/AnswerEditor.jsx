import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  PaperAirplaneIcon,
  XMarkIcon,
  EyeIcon,
  PencilIcon,
  CodeBracketIcon,
  PhotoIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

export default function AnswerEditor({ onSubmit, onCancel, initialContent = '' }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    defaultValues: {
      content: initialContent
    }
  });

  const watchedContent = watch('content', '');

  const onSubmitForm = async (data) => {
    if (data.content.trim().length < 20) {
      alert('Please provide a more detailed answer (at least 20 characters).');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertText = (before, after = '') => {
    const textarea = document.getElementById('answer-content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = watchedContent.substring(start, end);
    const newText = watchedContent.substring(0, start) + before + selectedText + after + watchedContent.substring(end);
    
    setValue('content', newText);
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const formatText = (type) => {
    switch (type) {
      case 'bold':
        insertText('**', '**');
        break;
      case 'italic':
        insertText('*', '*');
        break;
      case 'code':
        insertText('`', '`');
        break;
      case 'codeblock':
        insertText('```\n', '\n```');
        break;
      case 'link':
        insertText('[', '](url)');
        break;
      case 'list':
        insertText('- ');
        break;
      case 'numbered':
        insertText('1. ');
        break;
      case 'quote':
        insertText('> ');
        break;
      default:
        break;
    }
  };

  const renderPreview = (content) => {
    // Simple markdown-like preview (in a real app, use a proper markdown parser)
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-3 rounded overflow-x-auto"><code>$1</code></pre>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
      .replace(/^> (.+)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic">$1</blockquote>')
      .replace(/^- (.+)/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.+)/gm, '<li>$1. $2</li>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Write Your Answer</h3>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                previewMode 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {previewMode ? (
                <>
                  <PencilIcon className="w-4 h-4 mr-1" />
                  Edit
                </>
              ) : (
                <>
                  <EyeIcon className="w-4 h-4 mr-1" />
                  Preview
                </>
              )}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          {!previewMode ? (
            <>
              {/* Formatting Toolbar */}
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border">
                <button
                  type="button"
                  onClick={() => formatText('bold')}
                  className="px-2 py-1 text-sm font-bold hover:bg-gray-200 rounded"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => formatText('italic')}
                  className="px-2 py-1 text-sm italic hover:bg-gray-200 rounded"
                  title="Italic"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => formatText('code')}
                  className="px-2 py-1 text-sm font-mono hover:bg-gray-200 rounded"
                  title="Inline Code"
                >
                  <CodeBracketIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => formatText('codeblock')}
                  className="px-2 py-1 text-sm hover:bg-gray-200 rounded"
                  title="Code Block"
                >
                  { }
                </button>
                <button
                  type="button"
                  onClick={() => formatText('link')}
                  className="px-2 py-1 text-sm hover:bg-gray-200 rounded"
                  title="Link"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => formatText('list')}
                  className="px-2 py-1 text-sm hover:bg-gray-200 rounded"
                  title="Bullet List"
                >
                  •
                </button>
                <button
                  type="button"
                  onClick={() => formatText('numbered')}
                  className="px-2 py-1 text-sm hover:bg-gray-200 rounded"
                  title="Numbered List"
                >
                  1.
                </button>
                <button
                  type="button"
                  onClick={() => formatText('quote')}
                  className="px-2 py-1 text-sm hover:bg-gray-200 rounded"
                  title="Quote"
                >
                  "
                </button>
              </div>

              {/* Content Editor */}
              <div className="form-field">
                <textarea
                  id="answer-content"
                  {...register('content', { 
                    required: 'Please provide an answer',
                    minLength: {
                      value: 20,
                      message: 'Please provide a more detailed answer (at least 20 characters)'
                    },
                    maxLength: {
                      value: 5000,
                      message: 'Answer must be less than 5000 characters'
                    }
                  })}
                  className="form-input min-h-[200px] font-mono text-sm"
                  placeholder="Write your answer here... You can use markdown formatting:

**bold text**
*italic text*
`inline code`
```
code block
```
[link text](url)
> quote
- bullet point
1. numbered list

Be detailed and helpful in your explanation!"
                />
                <div className="flex justify-between text-sm mt-1">
                  {errors.content && (
                    <span className="form-error">{errors.content.message}</span>
                  )}
                  <span className={`ml-auto ${watchedContent.length > 4500 ? 'text-red-500' : 'text-gray-500'}`}>
                    {watchedContent.length}/5000
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* Preview Mode */
            <div className="min-h-[200px] p-4 border rounded-lg bg-white">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Preview:</h4>
              {watchedContent.trim() ? (
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: renderPreview(watchedContent) 
                  }}
                />
              ) : (
                <p className="text-gray-500 italic">Nothing to preview yet. Write your answer to see the preview.</p>
              )}
            </div>
          )}

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Tips for a great answer:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Be clear and detailed in your explanation</li>
              <li>• Include examples or step-by-step solutions when possible</li>
              <li>• Use formatting to make your answer easy to read</li>
              <li>• Cite sources or references if applicable</li>
              <li>• Be respectful and constructive</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary flex-1"
              disabled={isSubmitting}
            >
              <XMarkIcon className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={isSubmitting || watchedContent.trim().length < 20}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Posting...
                </div>
              ) : (
                <>
                  <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                  Post Answer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
