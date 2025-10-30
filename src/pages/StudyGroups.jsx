import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import useAuthStore from '../store/authStore';
import CreateStudyGroupModal from '../components/studygroups/CreateStudyGroupModal';
import { getStudyGroups, createStudyGroup, searchStudyGroups, joinStudyGroup } from '../services/studyGroups';

const STUDY_GROUP_CATEGORIES = [
  'All',
  'Mechanical Engineering',
  'Civil Engineering', 
  'Electrical Engineering',
  'Computer Engineering',
  'Chemical Engineering',
  'Petroleum Engineering',
  'Agricultural Engineering'
];

const STUDY_TYPES = [
  'All',
  'Online',
  'In-Person',
  'Hybrid'
];

export default function StudyGroups() {
  const { userData, user } = useAuthStore();
  const [studyGroups, setStudyGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load study groups from Firebase
  useEffect(() => {
    loadStudyGroups();
  }, []);

  const loadStudyGroups = async () => {
    try {
      setLoading(true);
      const groupsData = await getStudyGroups({
        category: selectedCategory,
        type: selectedType
      });
      setStudyGroups(groupsData);
      setFilteredGroups(groupsData);
    } catch (error) {
      console.error('Error loading study groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchQuery, selectedCategory, selectedType]);

  const handleSearch = async () => {
    try {
      const searchResults = await searchStudyGroups(searchQuery, {
        category: selectedCategory,
        type: selectedType
      });
      setFilteredGroups(searchResults);
    } catch (error) {
      console.error('Error searching study groups:', error);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarSolidIcon
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const handleCreateStudyGroup = async (groupData) => {
    if (!user) {
      alert('Please log in to create study groups.');
      return;
    }

    try {
      const newGroup = await createStudyGroup(groupData, user.uid, userData);
      
      // Add to local state
      setStudyGroups(prev => [newGroup, ...prev]);
      setFilteredGroups(prev => [newGroup, ...prev]);
      
      // Show success message
      alert('Study group created successfully!');
    } catch (error) {
      console.error('Error creating study group:', error);
      throw error;
    }
  };

  const handleJoinGroup = async (groupId) => {
    if (!user) {
      alert('Please log in to join study groups.');
      return;
    }

    try {
      await joinStudyGroup(groupId, user.uid);
      
      // Update local state
      setStudyGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, members: group.members + 1 }
          : group
      ));
      
      setFilteredGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, members: group.members + 1 }
          : group
      ));
      
      alert('Successfully joined the study group!');
    } catch (error) {
      console.error('Error joining study group:', error);
      alert(error.message || 'Failed to join study group. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Loading study groups...</div>
          <div className="text-gray-500 mt-2">Finding the best study communities for you</div>
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
              Study Groups
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8 animate-slide-up">
              Join collaborative study groups, share knowledge, and excel together with fellow engineering students across Nigeria
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 animate-slide-up" style={{animationDelay: '0.2s'}}>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary text-lg px-8 py-4 group"
              >
                <PlusIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Create Study Group
              </button>
              <div className="relative max-w-md w-full">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search groups, topics..."
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
        {/* Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center text-gray-700 font-medium">
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filter by:
            </div>
            
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {STUDY_GROUP_CATEGORIES.map(category => (
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

            {/* Type Filter */}
            <div className="flex gap-2">
              {STUDY_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedType === type
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center">
              <UserGroupIcon className="w-5 h-5 mr-2" />
              <span className="font-semibold text-gray-900">
                {filteredGroups.length}
              </span>
              <span className="ml-1">
                {filteredGroups.length === 1 ? 'group' : 'groups'} found
              </span>
            </div>
          </div>
        </div>

        {/* Study Groups Grid */}
        {filteredGroups.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserGroupIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No study groups found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or create a new study group</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Study Group
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredGroups.map((group, index) => (
              <div
                key={group.id}
                className="card group hover:shadow-2xl transition-all duration-300 animate-fade-in"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={group.image}
                    alt={group.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="badge badge-primary">
                      {group.category.replace(' Engineering', '')}
                    </span>
                    <span className={`badge ${
                      group.type === 'Online' ? 'badge-success' : 
                      group.type === 'In-Person' ? 'badge-warning' : 'badge-primary'
                    }`}>
                      {group.type}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center">
                      <UsersIcon className="w-4 h-4 mr-1 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-900">
                        {group.members}/{group.maxMembers}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card-body">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 flex-1">
                      {group.name}
                    </h3>
                    <div className="flex items-center ml-4">
                      {renderStars(group.rating)}
                      <span className="ml-1 text-sm font-medium text-gray-600">
                        {group.rating}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                    {group.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {group.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Meeting Info */}
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      <span>{group.meetingTime}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-2" />
                      <span>{group.location}</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      <span>Next: {new Date(group.nextMeeting).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Organizer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-semibold text-sm">
                          {group.organizer.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {group.organizer}
                        </div>
                        <div className="text-xs text-gray-500">Organizer</div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleJoinGroup(group.id)}
                      className="btn-primary text-sm px-4 py-2"
                    >
                      Join Group
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Study Group Modal */}
      <CreateStudyGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateStudyGroup}
      />
    </div>
  );
}
