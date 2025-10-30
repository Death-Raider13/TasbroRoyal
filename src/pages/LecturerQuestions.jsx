import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../store/authStore';
import { useToast } from '../components/ui/Toast';
import { getQuestions, searchQuestions } from '../services/questions';
import { getCourses } from '../services/firestore';
import { hasLecturerAnswered, getLecturerAnswerStats } from '../services/answers';

export default function LecturerQuestions() {
  const { userData } = useAuthStore();
  const { success, error } = useToast();
  const [questions, setQuestions] = useState([]);
  const [lecturerCourses, setLecturerCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    loadQuestions();
    loadLecturerCourses();
  }, [userData]);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, filter, selectedCategory]);

  const loadLecturerCourses = async () => {
    if (!userData?.uid) return;
    
    try {
      const courses = await getCourses({ lecturerId: userData.uid });
      setLecturerCourses(courses);
    } catch (err) {
      console.error('Error loading lecturer courses:', err);
    }
  };

  const loadQuestions = async () => {
    if (!userData?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get all questions from Firestore
      const allQuestions = await getQuestions({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        sortBy: 'newest'
      });

      // Filter questions related to lecturer's courses or expertise area
      const relevantQuestions = allQuestions.filter(question => {
        // Show questions from lecturer's course categories
        const lecturerCategories = lecturerCourses.map(course => course.category);
        return lecturerCategories.includes(question.category) || 
               lecturerCategories.length === 0; // Show all if lecturer has no courses yet
      });

      // Add lecturer-specific fields
      const questionsWithLecturerData = await Promise.all(
        relevantQuestions.map(async (question) => ({
          ...question,
          hasYourAnswer: await checkIfLecturerAnswered(question, userData.uid),
          course: findRelatedCourse(question, lecturerCourses),
          student: question.author || 'Anonymous'
        }))
      );

      setQuestions(questionsWithLecturerData);
    } catch (err) {
      console.error('Error loading questions:', err);
      error('Failed to load questions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!userData?.uid) return;

    try {
      let filteredQuestions;
      
      if (searchQuery.trim()) {
        filteredQuestions = await searchQuestions(searchQuery, {
          category: selectedCategory !== 'All' ? selectedCategory : undefined
        });
      } else {
        filteredQuestions = await getQuestions({
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          sortBy: filter === 'unanswered' ? 'unanswered' : 'newest'
        });
      }

      // Filter for lecturer's expertise
      const lecturerCategories = lecturerCourses.map(course => course.category);
      const categoryFilteredQuestions = filteredQuestions.filter(question => {
        return lecturerCategories.includes(question.category) || lecturerCategories.length === 0;
      });

      // Add lecturer-specific data first
      const questionsWithAnswerStatus = await Promise.all(
        categoryFilteredQuestions.map(async (question) => ({
          ...question,
          hasYourAnswer: await checkIfLecturerAnswered(question, userData.uid),
          course: findRelatedCourse(question, lecturerCourses),
          student: question.author || 'Anonymous'
        }))
      );

      // Then apply answer-based filters
      const relevantQuestions = questionsWithAnswerStatus.filter(question => {
        if (filter === 'unanswered') {
          return !question.hasYourAnswer;
        } else if (filter === 'answered') {
          return question.hasYourAnswer;
        }
        return true;
      });

      setQuestions(relevantQuestions);
    } catch (err) {
      console.error('Error searching questions:', err);
      error('Failed to search questions');
    }
  };

  // Helper function to check if lecturer has answered a question
  const checkIfLecturerAnswered = async (question, lecturerId) => {
    try {
      return await hasLecturerAnswered(question.id, lecturerId);
    } catch (err) {
      console.error('Error checking if lecturer answered:', err);
      return false;
    }
  };

  // Helper function to find related course
  const findRelatedCourse = (question, courses) => {
    const relatedCourse = courses.find(course => 
      course.category === question.category || 
      course.title.toLowerCase().includes(question.title.toLowerCase().split(' ')[0])
    );
    return relatedCourse ? relatedCourse.title : 'General Question';
  };

  // Questions are already filtered in handleSearch, so we can use them directly
  const filteredQuestions = questions;

  const stats = {
    total: questions.length,
    answered: questions.filter(q => q.hasYourAnswer).length,
    unanswered: questions.filter(q => !q.hasYourAnswer).length
  };

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-lg text-gray-900">Student Questions</h1>
              <p className="text-gray-600 mt-2">Answer questions from students enrolled in your courses</p>
            </div>
            <button
              onClick={() => {
                loadQuestions();
                success('Questions refreshed!');
              }}
              className="btn-outline flex items-center gap-2"
              disabled={loading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-600 to-blue-700 text-white">
            <div className="card-body text-center">
              <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-3" />
              <div className="text-4xl font-bold mb-2">{stats.total}</div>
              <div className="text-blue-100">Total Questions</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-600 to-green-700 text-white">
            <div className="card-body text-center">
              <CheckCircleIcon className="w-12 h-12 mx-auto mb-3" />
              <div className="text-4xl font-bold mb-2">{stats.answered}</div>
              <div className="text-green-100">Answered by You</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-yellow-600 to-yellow-700 text-white">
            <div className="card-body text-center">
              <ClockIcon className="w-12 h-12 mx-auto mb-3" />
              <div className="text-4xl font-bold mb-2">{stats.unanswered}</div>
              <div className="text-yellow-100">Awaiting Response</div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="card mb-6">
          <div className="card-body">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unanswered')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'unanswered'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Unanswered
                </button>
                <button
                  onClick={() => setFilter('answered')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'answered'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Answered
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        {filteredQuestions.length > 0 ? (
          <div className="space-y-4">
            {filteredQuestions.map((question, index) => (
              <Link
                key={question.id}
                to={`/questions/${question.id}`}
                className="card hover:shadow-xl transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="card-body">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors">
                          {question.title}
                        </h3>
                        {question.hasYourAnswer && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            <CheckCircleIcon className="w-4 h-4" />
                            Answered
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">{question.content}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="font-medium text-blue-600">{question.course}</span>
                        <span>•</span>
                        <span>Asked by {question.student}</span>
                        <span>•</span>
                        <span>{formatDate(question.createdAt || question.date)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <ChatBubbleLeftRightIcon className="w-4 h-4" />
                          {question.answers} {question.answers === 1 ? 'answer' : 'answers'}
                        </span>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        {question.category}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card">
            <div className="card-body text-center py-16">
              <ChatBubbleLeftRightIcon className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {searchQuery || filter !== 'all' ? 'No questions found' : 'No questions yet'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchQuery || filter !== 'all'
                  ? 'Try adjusting your search or filter'
                  : 'Students will be able to ask questions about your courses here'}
              </p>
              {(searchQuery || filter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilter('all');
                  }}
                  className="btn-outline"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 card bg-blue-50">
          <div className="card-body">
            <h3 className="font-bold text-gray-900 mb-3">Tips for Answering Questions</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Respond promptly to build trust with your students</li>
              <li>• Provide detailed, clear explanations with examples</li>
              <li>• Use diagrams or additional resources when helpful</li>
              <li>• Encourage follow-up questions for clarification</li>
              <li>• Be patient and supportive in your responses</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
