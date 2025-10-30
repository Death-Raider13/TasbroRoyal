import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ClockIcon,
  CheckIcon,
  ExclamationCircleIcon,
  PlusIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import {
  CheckIcon as CheckSolidIcon
} from '@heroicons/react/24/solid';
import useAuthStore from '../store/authStore';
import { useToast } from '../components/ui/Toast';
import {
  getUserConversations,
  getConversation,
  sendMessage,
  markMessagesAsRead,
  createConversation
} from '../services/messaging';
import { getCourse, getEnrollments } from '../services/firestore';

export default function StudentMessages() {
  const { userData } = useAuthStore();
  const { success, error } = useToast();
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [showNewConversation, setShowNewConversation] = useState(false);

  useEffect(() => {
    if (userData?.uid) {
      loadData();
    }
  }, [userData]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load conversations and enrolled courses in parallel
      const [conversationsData, enrollmentsData] = await Promise.all([
        getUserConversations(userData.uid),
        getEnrollments(userData.uid)
      ]);
      
      setConversations(conversationsData || []);
      
      // Load course details for enrolled courses
      const coursesData = await Promise.all(
        enrollmentsData.map(enrollment => getCourse(enrollment.courseId))
      );
      setEnrolledCourses(coursesData.filter(course => course !== null));
      
    } catch (err) {
      console.error('Error loading messages data:', err);
      error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversation) => {
    try {
      // Validate conversation object
      if (!conversation) {
        console.warn('loadMessages called with invalid conversation:', conversation);
        return;
      }

      // Get the other participant ID - handle different conversation structures
      let otherUserId;
      if (conversation.participants && Array.isArray(conversation.participants)) {
        otherUserId = conversation.participants.find(id => id !== userData.uid);
      } else if (conversation.partnerId) {
        otherUserId = conversation.partnerId;
      } else if (conversation.lecturerId && conversation.lecturerId !== userData.uid) {
        otherUserId = conversation.lecturerId;
      } else if (conversation.studentId && conversation.studentId !== userData.uid) {
        otherUserId = conversation.studentId;
      }

      if (!otherUserId) {
        console.warn('Could not determine other participant from conversation:', conversation);
        return;
      }

      const messagesData = await getConversation(userData.uid, otherUserId);
      setMessages(messagesData || []);
      
      // Mark messages as read
      const unreadMessages = (messagesData || []).filter(
        message => message.receiverId === userData.uid && !message.read
      ) || [];
      
      if (unreadMessages.length > 0) {
        await markMessagesAsRead(otherUserId, userData.uid); // Note: switched order - sender to receiver
      }
      
      // Update conversation in local state
      setConversations(prev => prev.map(conv => 
        conv.id === conversation.id 
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
      
    } catch (err) {
      console.error('Error loading messages:', err);
      error('Failed to load messages');
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;
    
    try {
      setSending(true);
      
      // Get the other participant ID - handle different conversation structures
      let otherUserId;
      if (selectedConversation.participants && Array.isArray(selectedConversation.participants)) {
        otherUserId = selectedConversation.participants.find(id => id !== userData.uid);
      } else if (selectedConversation.partnerId) {
        otherUserId = selectedConversation.partnerId;
      } else if (selectedConversation.lecturerId && selectedConversation.lecturerId !== userData.uid) {
        otherUserId = selectedConversation.lecturerId;
      } else if (selectedConversation.studentId && selectedConversation.studentId !== userData.uid) {
        otherUserId = selectedConversation.studentId;
      }

      if (!otherUserId) {
        throw new Error('Could not determine message recipient');
      }

      await sendMessage(
        userData.uid,
        otherUserId,
        newMessage.trim(),
        'text'
      );
      
      setNewMessage('');
      loadMessages(selectedConversation);
      success('Message sent successfully!');
      
    } catch (err) {
      console.error('Error sending message:', err);
      error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleStartNewConversation = async (course) => {
    try {
      // Validate course data
      if (!course || !course.lecturerId) {
        throw new Error('Invalid course data - missing lecturer information');
      }

      // Create conversation between student and lecturer
      const conversationResult = await createConversation(userData.uid, course.lecturerId);
      
      if (!conversationResult.success) {
        throw new Error('Failed to create conversation');
      }

      // Create a conversation object for the UI
      const newConversation = {
        id: conversationResult.conversationId,
        partnerId: course.lecturerId,
        partnerName: course.lecturerName || 'Lecturer',
        courseId: course.id,
        courseTitle: course.title,
        lastMessage: {
          content: 'Conversation started',
          createdAt: new Date(),
          senderId: userData.uid
        },
        unreadCount: 0
      };
      
      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversation(newConversation);
      setShowNewConversation(false);
      setMessages([]);
      
      success('Conversation started! You can now message your lecturer.');
      
    } catch (err) {
      console.error('Error creating conversation:', err);
      error('Failed to start conversation');
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp?.seconds * 1000 || timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lecturerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/student/dashboard" className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-lg text-gray-900">Messages</h1>
              <p className="text-gray-600 mt-2">Communicate with your lecturers</p>
            </div>
            <button
              onClick={() => setShowNewConversation(true)}
              className="btn-primary flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              New Message
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: '600px' }}>
          <div className="flex h-full">
            {/* Conversations Sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-6 text-center">
                    <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      {conversations.length === 0 
                        ? "No conversations yet. Start by messaging a lecturer about a course you're enrolled in."
                        : "No conversations match your search."
                      }
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => handleSelectConversation(conversation)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedConversation?.id === conversation.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {conversation.lecturerName}
                              </h3>
                              {conversation.unreadCount > 0 && (
                                <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 truncate mb-1">
                              {conversation.courseTitle}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {conversation.lastMessage?.content || 'No messages yet'}
                            </p>
                          </div>
                          <div className="text-xs text-gray-400 ml-2">
                            {conversation.lastMessageTime && formatMessageTime(conversation.lastMessageTime)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Conversation Header */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserCircleIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedConversation.lecturerName}</h3>
                        <p className="text-sm text-gray-600">{selectedConversation.courseTitle}</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isOwn = message.senderId === userData.uid;
                        return (
                          <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isOwn 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 text-gray-900'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                              <div className={`flex items-center gap-1 mt-1 text-xs ${
                                isOwn ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                <ClockIcon className="w-3 h-3" />
                                <span>{formatMessageTime(message.createdAt)}</span>
                                {isOwn && message.isRead && (
                                  <CheckSolidIcon className="w-3 h-3 ml-1" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={sending}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <PaperAirplaneIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-600">Choose a conversation from the sidebar to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* New Conversation Modal */}
        {showNewConversation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Start New Conversation</h3>
                <button
                  onClick={() => setShowNewConversation(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <p className="text-gray-600 mb-4">
                Select a course to message the lecturer:
              </p>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {enrolledCourses.length === 0 ? (
                  <div className="text-center py-4">
                    <ExclamationCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      You need to be enrolled in a course to message lecturers.
                    </p>
                    <Link
                      to="/courses"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
                    >
                      Browse Courses
                    </Link>
                  </div>
                ) : (
                  enrolledCourses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => handleStartNewConversation(course)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <h4 className="font-semibold text-gray-900">{course.title}</h4>
                      <p className="text-sm text-gray-600">by {course.lecturerName}</p>
                    </button>
                  ))
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNewConversation(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
