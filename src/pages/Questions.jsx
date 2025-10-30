import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  QuestionMarkCircleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  TagIcon,
  CheckCircleIcon,
  FireIcon,
  TrophyIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import {
  HandThumbUpIcon as HandThumbUpSolidIcon,
  HandThumbDownIcon as HandThumbDownSolidIcon,
  CheckCircleIcon as CheckCircleSolidIcon
} from '@heroicons/react/24/solid';
import useAuthStore from '../store/authStore';
import AskQuestionModal from '../components/questions/AskQuestionModal';
import { getQuestions, createQuestion, searchQuestions, voteQuestion } from '../services/questions';

const QUESTION_CATEGORIES = [
  'All',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering', 
  'Computer Engineering',
  'Chemical Engineering',
  'Petroleum Engineering',
  'Agricultural Engineering',
  'General Engineering'
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'unanswered', label: 'Unanswered' },
  { value: 'trending', label: 'Trending' }
];

export default function Questions() {
  const { userData, user } = useAuthStore();
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [showAskModal, setShowAskModal] = useState(false);

  // Load questions from Firebase
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const questionsData = await getQuestions({ 
        category: selectedCategory,
        sortBy 
      });
      setQuestions(questionsData);
      setFilteredQuestions(questionsData);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchQuery, selectedCategory, sortBy]);

  const handleSearch = async () => {
    try {
      const searchResults = await searchQuestions(searchQuery, {
        category: selectedCategory,
        sortBy
      });
      setFilteredQuestions(searchResults);
    } catch (error) {
      console.error('Error searching questions:', error);
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

  const handleVote = async (questionId, voteType) => {
    if (!user) {
      alert('Please log in to vote on questions.');
      return;
    }

    try {
      const result = await voteQuestion(questionId, user.uid, voteType);
      
      // Update local state
      setQuestions(prev => prev.map(q => 
        q.id === questionId 
          ? { 
              ...q, 
              votes: q.votes + (result.voteChange || 0),
              userVote: result.userVote 
            }
          : q
      ));
      
      setFilteredQuestions(prev => prev.map(q => 
        q.id === questionId 
          ? { 
              ...q, 
              votes: q.votes + (result.voteChange || 0),
              userVote: result.userVote 
            }
          : q
      ));
    } catch (error) {
      console.error('Error voting on question:', error);
      alert('Failed to vote. Please try again.');
    }
  };

  const handleSubmitQuestion = async (questionData) => {
    if (!user) {
      alert('Please log in to ask questions.');
      return;
    }

    try {
      const newQuestion = await createQuestion(questionData, user.uid, userData);
      
      // Add to local state
      setQuestions(prev => [newQuestion, ...prev]);
      setFilteredQuestions(prev => [newQuestion, ...prev]);
      
      // Show success message
      alert('Question posted successfully!');
    } catch (error) {
      console.error('Error submitting question:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Loading questions...</div>
          <div className="text-gray-500 mt-2">Finding engineering Q&A for you</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="heading-xl text-white mb-6 animate-fade-in">
              Engineering Q&A
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8 animate-slide-up">
              Ask questions, share knowledge, and get expert answers from the Nigerian engineering community
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 animate-slide-up" style={{animationDelay: '0.2s'}}>
              <button
                onClick={() => setShowAskModal(true)}
                className="btn-primary text-lg px-8 py-4 group"
              >
                <PlusIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Ask Question
              </button>
              <div className="relative max-w-md w-full">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 text-lg rounded-xl border-0 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters and Sort */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center text-gray-700 font-medium">
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filter by:
            </div>
            
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {QUESTION_CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                      : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-sm'
                  }`}
                >
                  {category.replace(' Engineering', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-input py-2 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <div className="flex items-center text-gray-600">
              <QuestionMarkCircleIcon className="w-5 h-5 mr-2" />
              <span className="font-semibold text-gray-900">
                {filteredQuestions.length}
              </span>
              <span className="ml-1">
                {filteredQuestions.length === 1 ? 'question' : 'questions'}
              </span>
            </div>
          </div>
        </div>

        {/* Questions List */}
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <QuestionMarkCircleIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No questions found</h3>
            <p className="text-gray-600 mb-6">Be the first to ask a question in this category</p>
            <button
              onClick={() => setShowAskModal(true)}
              className="btn-primary"
            >
              Ask First Question
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredQuestions.map((question, index) => (
              <div
                key={question.id}
                className="card hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="card-body">
                  <div className="flex gap-6">
                    {/* Vote Section */}
                    <div className="flex flex-col items-center space-y-2 min-w-[60px]">
                      <button
                        onClick={() => handleVote(question.id, 'up')}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          question.userVote === 'up'
                            ? 'bg-green-100 text-green-600'
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        {question.userVote === 'up' ? (
                          <HandThumbUpSolidIcon className="w-5 h-5" />
                        ) : (
                          <HandThumbUpIcon className="w-5 h-5" />
                        )}
                      </button>
                      
                      <span className="font-bold text-lg text-gray-900">
                        {question.votes}
                      </span>
                      
                      <button
                        onClick={() => handleVote(question.id, 'down')}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          question.userVote === 'down'
                            ? 'bg-red-100 text-red-600'
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        {question.userVote === 'down' ? (
                          <HandThumbDownSolidIcon className="w-5 h-5" />
                        ) : (
                          <HandThumbDownIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Question Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/questions/${question.id}`}
                            className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200 line-clamp-2"
                          >
                            {question.title}
                          </Link>
                          {question.isTrending && (
                            <FireIcon className="w-5 h-5 text-orange-500" title="Trending" />
                          )}
                          {question.isAnswered && (
                            <CheckCircleSolidIcon className="w-5 h-5 text-green-500" title="Answered" />
                          )}
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {question.content}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {question.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full hover:bg-blue-200 cursor-pointer transition-colors duration-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Question Stats and Author */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                            <span className="font-medium">{question.answers}</span>
                            <span className="ml-1">answers</span>
                          </div>
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
                            <span>{formatTimeAgo(question.createdAt)}</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2">
                              <span className="text-white font-semibold text-xs">
                                {question.author.charAt(0)}
                              </span>
                            </div>
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
            ))}
          </div>
        )}

        {/* Load More Button */}
        {filteredQuestions.length > 0 && (
          <div className="text-center mt-12">
            <button className="btn-secondary">
              Load More Questions
            </button>
          </div>
        )}
      </div>

      {/* Ask Question Modal */}
      <AskQuestionModal
        isOpen={showAskModal}
        onClose={() => setShowAskModal(false)}
        onSubmit={handleSubmitQuestion}
      />
    </div>
  );
}
