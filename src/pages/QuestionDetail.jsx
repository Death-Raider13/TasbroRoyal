import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  TagIcon,
  CheckCircleIcon,
  EyeIcon,
  ArrowLeftIcon,
  PlusIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import {
  HandThumbUpIcon as HandThumbUpSolidIcon,
  HandThumbDownIcon as HandThumbDownSolidIcon,
  CheckCircleIcon as CheckCircleSolidIcon
} from '@heroicons/react/24/solid';
import useAuthStore from '../store/authStore';
import AnswerEditor from '../components/questions/AnswerEditor';
import AnswerCard from '../components/questions/AnswerCard';
import { getQuestion, voteQuestion, incrementViews } from '../services/questions';
import { getAnswers, createAnswer, voteAnswer, acceptAnswer, getRepliesForQuestion } from '../services/answers';

export default function QuestionDetail() {
  const { questionId } = useParams();
  const { userData } = useAuthStore();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAnswerEditor, setShowAnswerEditor] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [fetchedQuestion, fetchedAnswers, fetchedReplies] = await Promise.all([
          getQuestion(questionId),
          getAnswers(questionId),
          getRepliesForQuestion(questionId)
        ]);

        if (!isMounted) return;

        setQuestion(fetchedQuestion);

        // Attach replies to their parent answers (single level: replies to top-level answers)
        const repliesByParent = (fetchedReplies || []).reduce((acc, reply) => {
          if (!reply.parentId) return acc;
          if (!acc[reply.parentId]) acc[reply.parentId] = [];
          acc[reply.parentId].push({
            ...reply,
            replies: []
          });
          return acc;
        }, {});

        const answersWithReplies = (fetchedAnswers || []).map((ans) => ({
          ...ans,
          replies: repliesByParent[ans.id] || []
        }));

        setAnswers(answersWithReplies);

        // Increment views in the background (no need to await)
        incrementViews(questionId).catch((viewError) => {
          console.error('Error incrementing views:', viewError);
        });
      } catch (err) {
        console.error('Error loading question detail:', err);
        if (!isMounted) return;
        setError(err.message || 'Failed to load question');
        setQuestion(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [questionId]);

  const handleVoteQuestion = async (voteType) => {
    if (!userData?.uid || !question) return;

    try {
      const result = await voteQuestion(question.id, userData.uid, voteType);

      setQuestion((prev) =>
        prev
          ? {
              ...prev,
              votes: (prev.votes || 0) + (result.voteChange || 0),
              userVote: result.userVote
            }
          : prev
      );
    } catch (err) {
      console.error('Error voting on question:', err);
    }
  };

  const handleSubmitAnswer = async (answerData) => {
    if (!userData?.uid || !question) return;

    try {
      const newAnswer = await createAnswer(question.id, answerData, userData.uid, userData);

      setAnswers((prev) => [
        ...prev,
        {
          ...newAnswer,
          replies: []
        }
      ]);

      setShowAnswerEditor(false);

      setQuestion((prev) =>
        prev
          ? {
              ...prev,
              answers: (prev.answers || 0) + 1,
              isAnswered: true
            }
          : prev
      );
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleVoteAnswer = async (answerId, voteType) => {
    if (!userData?.uid) return;

    try {
      const result = await voteAnswer(answerId, userData.uid, voteType);

      setAnswers((prev) =>
        prev.map((answer) =>
          answer.id === answerId
            ? {
                ...answer,
                votes: (answer.votes || 0) + (result.voteChange || 0),
                userVote: result.userVote
              }
            : answer
        )
      );
    } catch (err) {
      console.error('Error voting on answer:', err);
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    if (!userData?.uid || !question) return;

    // UI-level check: only question author can accept answers
    if (question.authorId && userData.uid !== question.authorId) {
      return;
    }

    try {
      await acceptAnswer(answerId, question.id, userData.uid);

      setQuestion((prev) =>
        prev
          ? {
              ...prev,
              acceptedAnswerId: answerId,
              isAnswered: true
            }
          : prev
      );

      setAnswers((prev) =>
        prev.map((answer) => ({
          ...answer,
          isAccepted: answer.id === answerId
        }))
      );
    } catch (err) {
      console.error('Error accepting answer:', err);
      alert('You are not allowed to change the accepted answer for this question. Only the question author can do that.');
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Loading question...</div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Question Not Found</h2>
          {error && (
            <p className="text-gray-600 mb-2">{error}</p>
          )}
          <Link to="/questions" className="btn-primary">
            Back to Questions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/questions"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors duration-200"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Questions
        </Link>

        {/* Question Card */}
        <div className="card mb-8">
          <div className="card-body">
            <div className="flex gap-6">
              {/* Vote Section */}
              <div className="flex flex-col items-center space-y-2 min-w-[60px]">
                <button
                  onClick={() => handleVoteQuestion('up')}
                  className={`p-3 rounded-lg transition-colors duration-200 ${
                    question.userVote === 'up'
                      ? 'bg-green-100 text-green-600'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {question.userVote === 'up' ? (
                    <HandThumbUpSolidIcon className="w-6 h-6" />
                  ) : (
                    <HandThumbUpIcon className="w-6 h-6" />
                  )}
                </button>
                
                <span className="font-bold text-2xl text-gray-900">
                  {Math.max(question.votes || 0, 0)}
                </span>
                
                <button
                  onClick={() => handleVoteQuestion('down')}
                  className={`p-3 rounded-lg transition-colors duration-200 ${
                    question.userVote === 'down'
                      ? 'bg-red-100 text-red-600'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {question.userVote === 'down' ? (
                    <HandThumbDownSolidIcon className="w-6 h-6" />
                  ) : (
                    <HandThumbDownIcon className="w-6 h-6" />
                  )}
                </button>

                {question.isAnswered && (
                  <div className="mt-4">
                    <CheckCircleSolidIcon className="w-8 h-8 text-green-500" title="Answered" />
                  </div>
                )}
              </div>

              {/* Question Content */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {question.title}
                </h1>

                <div className="prose max-w-none mb-6">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {question.content}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {question.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Question Meta */}
                <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <EyeIcon className="w-4 h-4 mr-1" />
                      <span>{question.views} views</span>
                    </div>
                    <span className="badge badge-primary">
                      {question.category.replace(' Engineering', '')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      <span>Asked {formatTimeAgo(question.createdAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2">
                        <span className="text-white font-semibold text-sm">
                          {question.author.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">
                          {question.author}
                        </span>
                        <span className="ml-1 text-gray-500">
                          ({question.authorRole})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answers Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
            </h2>
            <button
              onClick={() => setShowAnswerEditor(!showAnswerEditor)}
              className="btn-primary"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Write Answer
            </button>
          </div>

          {/* Answer Editor */}
          {showAnswerEditor && (
            <div className="mb-8">
              <AnswerEditor
                onSubmit={handleSubmitAnswer}
                onCancel={() => setShowAnswerEditor(false)}
              />
            </div>
          )}

          {/* Answers List */}
          <div className="space-y-6">
            {answers
              .sort((a, b) => {
                // Accepted answer first, then by votes
                if (a.isAccepted && !b.isAccepted) return -1;
                if (!a.isAccepted && b.isAccepted) return 1;
                return b.votes - a.votes;
              })
              .map((answer) => (
                <AnswerCard
                  key={answer.id}
                  answer={answer}
                  questionAuthor={question.author}
                  currentUser={userData?.displayName}
                  questionAuthorId={question.authorId}
                  currentUserId={userData?.uid}
                  onVote={handleVoteAnswer}
                  onAccept={handleAcceptAnswer}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
