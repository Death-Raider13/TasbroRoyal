import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  BellIcon,
  SpeakerWaveIcon,
  PlusIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../store/authStore';
import { useToast } from '../components/ui/Toast';
import { 
  getUserConversations, 
  getConversation, 
  sendMessage, 
  markMessagesAsRead,
  subscribeToConversation,
  createAnnouncement,
  getCourseAnnouncements,
  getLecturerAnnouncements
} from '../services/messaging';
import { getCourses } from '../services/firestore';

export default function LecturerMessages() {
  const { userData } = useAuthStore();
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState('messages'); // 'messages', 'announcements'
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    courseId: '',
    title: '',
    content: '',
    priority: 'normal'
  });
  
  const messagesEndRef = useRef(null);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    loadInitialData();
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [userData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadInitialData = async () => {
    if (!userData?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [conversationsData, coursesData, announcementsData] = await Promise.all([
        getUserConversations(userData.uid),
        getCourses({ lecturerId: userData.uid }),
        getLecturerAnnouncements(userData.uid)
      ]);

      setConversations(conversationsData);
      setCourses(coursesData);
      setAnnouncements(announcementsData);
    } catch (err) {
      console.error('Error loading initial data:', err);
      error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    
    try {
      // Unsubscribe from previous conversation
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      // Subscribe to real-time updates for this conversation
      unsubscribeRef.current = subscribeToConversation(
        userData.uid,
        conversation.partnerId,
        (newMessages) => {
          setMessages(newMessages);
        }
      );

      // Mark messages as read
      await markMessagesAsRead(conversation.partnerId, userData.uid);
      
      // Update conversation list to reflect read status
      setConversations(prev => 
        prev.map(conv => 
          conv.partnerId === conversation.partnerId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } catch (err) {
      console.error('Error selecting conversation:', err);
      error('Failed to load conversation');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    try {
      setSendingMessage(true);
      await sendMessage(userData.uid, selectedConversation.partnerId, newMessage.trim());
      setNewMessage('');
      success('Message sent!');
    } catch (err) {
      console.error('Error sending message:', err);
      error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementForm.courseId || !announcementForm.title.trim() || !announcementForm.content.trim()) {
      error('Please fill in all required fields');
      return;
    }

    try {
      await createAnnouncement(announcementForm.courseId, userData.uid, announcementForm);
      setShowAnnouncementForm(false);
      setAnnouncementForm({ courseId: '', title: '', content: '', priority: 'normal' });
      success('Announcement created successfully!');
      
      // Reload announcements
      const updatedAnnouncements = await getLecturerAnnouncements(userData.uid);
      setAnnouncements(updatedAnnouncements);
    } catch (err) {
      console.error('Error creating announcement:', err);
      error('Failed to create announcement');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-NG', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
          <Link to="/lecturer/dashboard" className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-lg text-gray-900">Messages & Announcements</h1>
              <p className="text-gray-600 mt-2">Communicate with your students</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('messages')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'messages'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Messages
              </button>
              <button
                onClick={() => setActiveTab('announcements')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'announcements'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Announcements
              </button>
            </div>
          </div>
        </div>

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
            {/* Conversations List */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-bold text-gray-900">Conversations</h3>
                <div className="relative mt-3">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="card-body p-0 overflow-y-auto">
                {conversations.length > 0 ? (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.partnerId}
                      onClick={() => selectConversation(conversation)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?.partnerId === conversation.partnerId ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <UserCircleIcon className="w-12 h-12 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-900 truncate">Student</p>
                            <span className="text-xs text-gray-500">{formatTime(conversation.lastMessage.createdAt)}</span>
                          </div>
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {conversation.lastMessage.content}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="inline-block mt-1 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                              {conversation.unreadCount} new
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No conversations yet</p>
                    <p className="text-sm mt-1">Students will appear here when they message you</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2 card flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="card-header">
                    <div className="flex items-center gap-3">
                      <UserCircleIcon className="w-10 h-10 text-gray-400" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Student</h3>
                        <p className="text-sm text-gray-600">Online</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === userData.uid ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderId === userData.uid
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderId === userData.uid ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="card-body border-t">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 form-input"
                        disabled={sendingMessage}
                      />
                      <button
                        type="submit"
                        disabled={sendingMessage || !newMessage.trim()}
                        className="btn-primary flex items-center gap-2"
                      >
                        <PaperAirplaneIcon className="w-5 h-5" />
                        {sendingMessage ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                    <p>Choose a conversation from the left to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            {/* Create Announcement Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowAnnouncementForm(true)}
                className="btn-primary flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Create Announcement
              </button>
            </div>

            {/* Announcement Form Modal */}
            {showAnnouncementForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Create Announcement</h3>
                  <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                      <select
                        value={announcementForm.courseId}
                        onChange={(e) => setAnnouncementForm(prev => ({ ...prev, courseId: e.target.value }))}
                        className="form-input w-full"
                        required
                      >
                        <option value="">Select a course</option>
                        {courses.map(course => (
                          <option key={course.id} value={course.id}>{course.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={announcementForm.title}
                        onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                        className="form-input w-full"
                        placeholder="Announcement title"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                      <textarea
                        value={announcementForm.content}
                        onChange={(e) => setAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
                        className="form-input w-full h-32"
                        placeholder="Write your announcement..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        value={announcementForm.priority}
                        onChange={(e) => setAnnouncementForm(prev => ({ ...prev, priority: e.target.value }))}
                        className="form-input w-full"
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button type="submit" className="btn-primary flex-1">
                        Create Announcement
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAnnouncementForm(false)}
                        className="btn-outline flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Announcements List */}
            <div className="space-y-4">
              {announcements.length > 0 ? (
                announcements.map((announcement) => (
                  <div key={announcement.id} className="card">
                    <div className="card-body">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{announcement.title}</h3>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              announcement.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              announcement.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              announcement.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {announcement.priority}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{announcement.content}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <SpeakerWaveIcon className="w-4 h-4" />
                              Course Announcement
                            </span>
                            <span>{formatDate(announcement.createdAt)}</span>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <EllipsisVerticalIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card">
                  <div className="card-body text-center py-16">
                    <SpeakerWaveIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No announcements yet</h3>
                    <p className="text-gray-600 mb-6">Create your first announcement to communicate with students</p>
                    <button
                      onClick={() => setShowAnnouncementForm(true)}
                      className="btn-primary"
                    >
                      Create Announcement
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
