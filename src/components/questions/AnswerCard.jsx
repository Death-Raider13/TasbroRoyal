import { useState } from 'react';
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import {
  HandThumbUpIcon as HandThumbUpSolidIcon,
  HandThumbDownIcon as HandThumbDownSolidIcon,
  CheckCircleIcon as CheckCircleSolidIcon
} from '@heroicons/react/24/solid';
import ReplyEditor from './ReplyEditor';

export default function AnswerCard({ 
  answer, 
  questionAuthor, 
  currentUser, 
  onVote, 
  onAccept,
  depth = 0 
}) {
  const [showReplies, setShowReplies] = useState(true);
  const [showReplyEditor, setShowReplyEditor] = useState(false);
  const [replies, setReplies] = useState(answer.replies || []);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleVote = (voteType) => {
    onVote(answer.id, voteType);
  };

  const handleAccept = () => {
    onAccept(answer.id);
  };

  const handleReply = async (replyData) => {
    try {
      const newReply = {
        id: Date.now(), // In real app, this would come from backend
        author: currentUser || 'Anonymous User',
        authorRole: 'Student', // Would come from user context
        votes: 0,
        createdAt: new Date().toISOString(),
        userVote: null,
        replies: [],
        ...replyData
      };

      setReplies([...replies, newReply]);
      setShowReplyEditor(false);
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const handleVoteReply = (replyId, voteType) => {
    // Implement reply voting logic
    console.log(`Vote ${voteType} on reply ${replyId}`);
  };

  const renderContent = (content) => {
    // Simple markdown-like rendering
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-3 rounded overflow-x-auto my-3"><code>$1</code></pre>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
      .replace(/^> (.+)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-2">$1</blockquote>')
      .replace(/^- (.+)/gm, '<li class="ml-4">$1</li>')
      .replace(/^(\d+)\. (.+)/gm, '<li class="ml-4">$1. $2</li>')
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/\n/g, '<br>');
  };

  const maxDepth = 3; // Limit nesting depth
  const indentClass = depth > 0 ? `ml-${Math.min(depth * 8, 24)} border-l-2 border-gray-200 pl-4` : '';

  return (
    <div className={`${indentClass} ${depth > 0 ? 'mt-4' : ''}`}>
      <div className={`card ${answer.isAccepted ? 'ring-2 ring-green-500 bg-green-50' : ''}`}>
        <div className="card-body">
          <div className="flex gap-4">
            {/* Vote Section */}
            <div className="flex flex-col items-center space-y-2 min-w-[50px]">
              <button
                onClick={() => handleVote('up')}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  answer.userVote === 'up'
                    ? 'bg-green-100 text-green-600'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {answer.userVote === 'up' ? (
                  <HandThumbUpSolidIcon className="w-5 h-5" />
                ) : (
                  <HandThumbUpIcon className="w-5 h-5" />
                )}
              </button>
              
              <span className="font-bold text-lg text-gray-900">
                {answer.votes}
              </span>
              
              <button
                onClick={() => handleVote('down')}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  answer.userVote === 'down'
                    ? 'bg-red-100 text-red-600'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {answer.userVote === 'down' ? (
                  <HandThumbDownSolidIcon className="w-5 h-5" />
                ) : (
                  <HandThumbDownIcon className="w-5 h-5" />
                )}
              </button>

              {/* Accept Answer Button (only for question author) */}
              {currentUser === questionAuthor && depth === 0 && (
                <button
                  onClick={handleAccept}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    answer.isAccepted
                      ? 'bg-green-100 text-green-600'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  title={answer.isAccepted ? 'Accepted Answer' : 'Mark as Accepted Answer'}
                >
                  {answer.isAccepted ? (
                    <CheckCircleSolidIcon className="w-6 h-6" />
                  ) : (
                    <CheckCircleIcon className="w-6 h-6" />
                  )}
                </button>
              )}
            </div>

            {/* Answer Content */}
            <div className="flex-1">
              {/* Accepted Badge */}
              {answer.isAccepted && (
                <div className="flex items-center mb-3">
                  <CheckCircleSolidIcon className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-700 font-semibold text-sm">Accepted Answer</span>
                </div>
              )}

              {/* Content */}
              <div 
                className="prose max-w-none mb-4"
                dangerouslySetInnerHTML={{ 
                  __html: `<p class="mb-3">${renderContent(answer.content)}</p>` 
                }}
              />

              {/* Answer Meta */}
              <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowReplyEditor(!showReplyEditor)}
                    className="flex items-center hover:text-blue-600 transition-colors duration-200"
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                    Reply
                  </button>
                  
                  {replies.length > 0 && (
                    <button
                      onClick={() => setShowReplies(!showReplies)}
                      className="flex items-center hover:text-blue-600 transition-colors duration-200"
                    >
                      {showReplies ? (
                        <ChevronUpIcon className="w-4 h-4 mr-1" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4 mr-1" />
                      )}
                      {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    <span>{formatTimeAgo(answer.createdAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white font-semibold text-xs">
                        {answer.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">
                        {answer.author}
                      </span>
                      <span className="ml-1 text-gray-500">
                        ({answer.authorRole})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reply Editor */}
      {showReplyEditor && (
        <div className="mt-4">
          <ReplyEditor
            onSubmit={handleReply}
            onCancel={() => setShowReplyEditor(false)}
            placeholder={`Reply to ${answer.author}...`}
          />
        </div>
      )}

      {/* Nested Replies */}
      {showReplies && replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {replies.map((reply) => (
            <AnswerCard
              key={reply.id}
              answer={reply}
              questionAuthor={questionAuthor}
              currentUser={currentUser}
              onVote={handleVoteReply}
              onAccept={() => {}} // Replies can't be accepted
              depth={Math.min(depth + 1, maxDepth)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
