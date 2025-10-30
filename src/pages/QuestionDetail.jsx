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

export default function QuestionDetail() {
  const { questionId } = useParams();
  const { userData } = useAuthStore();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAnswerEditor, setShowAnswerEditor] = useState(false);

  // Mock question data - replace with actual API call
  const mockQuestion = {
    id: parseInt(questionId),
    title: "How to calculate the efficiency of a heat engine in thermodynamics?",
    content: `I'm struggling with understanding the Carnot cycle and how to calculate the theoretical maximum efficiency. 

Here's what I know so far:
- The Carnot cycle is a theoretical thermodynamic cycle
- It operates between two heat reservoirs
- It's supposed to be the most efficient heat engine possible

My specific questions:
1. What is the formula for Carnot efficiency?
2. How do I apply it to real-world problems?
3. Why is it considered the theoretical maximum?

I've tried looking this up in my textbook, but the explanations are quite complex. Can someone break it down in simpler terms with a practical example?

Any help would be greatly appreciated!`,
    author: "Adebayo Ogundimu",
    authorRole: "Student",
    category: "Mechanical Engineering",
    tags: ["Thermodynamics", "Heat Engine", "Carnot Cycle", "Efficiency"],
    votes: 24,
    views: 156,
    createdAt: "2024-01-15T10:30:00Z",
    isAnswered: true,
    acceptedAnswerId: 2,
    userVote: null // 'up', 'down', or null
  };

  const mockAnswers = [
    {
      id: 1,
      content: `Great question! Let me break down the Carnot efficiency for you.

**The Carnot Efficiency Formula:**
η = 1 - (T_cold / T_hot)

Where:
- η (eta) = efficiency (as a decimal)
- T_cold = temperature of the cold reservoir (in Kelvin)
- T_hot = temperature of the hot reservoir (in Kelvin)

**Key Points:**
1. **Always use Kelvin** - This is crucial! Convert Celsius by adding 273.15
2. **It's a ratio** - The efficiency tells you what fraction of heat input becomes useful work
3. **Always less than 1** - No real engine can be 100% efficient

**Example:**
If you have a heat engine operating between:
- Hot reservoir: 500°C = 773.15 K
- Cold reservoir: 25°C = 298.15 K

η = 1 - (298.15/773.15) = 1 - 0.386 = 0.614 = 61.4%

This means theoretically, this engine could convert 61.4% of the input heat into useful work.`,
      author: "Dr. Kemi Adebisi",
      authorRole: "Lecturer",
      votes: 18,
      createdAt: "2024-01-15T14:20:00Z",
      isAccepted: false,
      userVote: null,
      replies: [
        {
          id: 11,
          content: "This is a great explanation! Just to add - the reason we use Kelvin is because it's an absolute temperature scale. Using Celsius or Fahrenheit would give incorrect results.",
          author: "Fatima Abdullahi",
          authorRole: "Graduate Student",
          votes: 5,
          createdAt: "2024-01-15T15:30:00Z",
          userVote: null,
          replies: [
            {
              id: 111,
              content: "Exactly! And that's why the Carnot efficiency can never reach 100% - you'd need the cold reservoir to be at absolute zero (0 K), which is impossible to achieve.",
              author: "Prof. Chinedu Okwu",
              authorRole: "Professor",
              votes: 8,
              createdAt: "2024-01-15T16:45:00Z",
              userVote: null,
              replies: []
            }
          ]
        }
      ]
    },
    {
      id: 2,
      content: `Building on the previous answer, let me give you a **practical perspective** as someone who works in power plant design.

**Why Carnot Efficiency Matters:**

1. **Theoretical Limit**: It tells us the absolute best we can do. Real engines are always less efficient.

2. **Design Guidance**: Engineers use it to evaluate how close their designs are to the theoretical maximum.

3. **Economic Impact**: Even small efficiency improvements can save millions in fuel costs.

**Real-World Example - Coal Power Plant:**
- Steam temperature: 600°C (873 K)  
- Cooling water: 30°C (303 K)
- Carnot efficiency: 1 - (303/873) = 65.3%
- Actual efficiency: ~40% (due to real-world losses)

**The Gap Explained:**
The difference between Carnot (65.3%) and actual (40%) efficiency comes from:
- Friction in turbines
- Heat losses in pipes
- Incomplete combustion
- Pressure drops

**Pro Tip**: When solving problems, always calculate the Carnot efficiency first - it gives you the theoretical ceiling for any heat engine operating between those temperatures.

Hope this helps with your studies! 🔥`,
      author: "Eng. Amina Hassan",
      authorRole: "Industry Expert",
      votes: 32,
      createdAt: "2024-01-15T16:10:00Z",
      isAccepted: true,
      userVote: 'up',
      replies: [
        {
          id: 21,
          content: "This is incredibly helpful! I never understood why real engines are so much less efficient than the Carnot limit. The breakdown of losses makes it clear.",
          author: "Adebayo Ogundimu",
          authorRole: "Student",
          votes: 3,
          createdAt: "2024-01-15T17:00:00Z",
          userVote: null,
          replies: []
        }
      ]
    },
    {
      id: 3,
      content: `I'd like to add a **mathematical perspective** that might help with problem-solving:

**Step-by-Step Problem Approach:**

1. **Identify the temperatures** (always convert to Kelvin!)
2. **Apply the formula**: η = 1 - (T_c/T_h)
3. **Calculate work output**: W = η × Q_h (where Q_h is heat input)
4. **Find heat rejected**: Q_c = Q_h - W

**Memory Aids:**
- "**Hot on top, cold on bottom**" - T_cold/T_hot in the formula
- "**Kelvin is key**" - always use absolute temperature
- "**Bigger gap, better efficiency**" - larger temperature difference = higher efficiency

**Common Mistakes to Avoid:**
❌ Using Celsius instead of Kelvin
❌ Mixing up T_hot and T_cold in the formula  
❌ Forgetting that efficiency is always < 1

**Practice Problem:**
A Carnot engine operates between 400 K and 300 K. If it receives 1000 J of heat, find:
a) Efficiency
b) Work output  
c) Heat rejected

Try solving this and I'll check your work! 📚`,
      author: "Teaching Assistant Sarah",
      authorRole: "TA",
      votes: 12,
      createdAt: "2024-01-15T18:30:00Z",
      isAccepted: false,
      userVote: null,
      replies: []
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setQuestion(mockQuestion);
      setAnswers(mockAnswers);
      setLoading(false);
    }, 1000);
  }, [questionId]);

  const handleVoteQuestion = (voteType) => {
    // Implement question voting logic
    console.log(`Vote ${voteType} on question ${questionId}`);
  };

  const handleSubmitAnswer = async (answerData) => {
    try {
      const newAnswer = {
        id: answers.length + 1,
        author: userData?.displayName || 'Anonymous User',
        authorRole: userData?.role || 'Student',
        votes: 0,
        createdAt: new Date().toISOString(),
        isAccepted: false,
        userVote: null,
        replies: [],
        ...answerData
      };

      setAnswers([...answers, newAnswer]);
      setShowAnswerEditor(false);
      
      // Update question answer count
      setQuestion(prev => ({
        ...prev,
        answers: (prev.answers || 0) + 1
      }));

    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleVoteAnswer = (answerId, voteType) => {
    // Implement answer voting logic
    console.log(`Vote ${voteType} on answer ${answerId}`);
  };

  const handleAcceptAnswer = (answerId) => {
    // Only question author can accept answers
    if (userData?.displayName === question.author) {
      setQuestion(prev => ({ ...prev, acceptedAnswerId: answerId }));
      setAnswers(prev => prev.map(answer => ({
        ...answer,
        isAccepted: answer.id === answerId
      })));
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
                  {question.votes}
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
