import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCourses, getUserProfile } from '../services/firestore';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  UserGroupIcon,
  ClockIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const CATEGORIES = [
  'All',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Computer Engineering',
  'Petroleum Engineering',
  'Agricultural Engineering'
];

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [lecturerProfiles, setLecturerProfiles] = useState({});

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [selectedCategory, searchQuery, courses]);

  const fetchCourses = async () => {
    try {
      const coursesData = await getCourses({ status: 'approved' });
      setCourses(coursesData);
      setFilteredCourses(coursesData);
      
      // Fetch lecturer profile images
      const uniqueLecturerIds = [...new Set(coursesData.map(course => course.lecturerId))];
      const profilePromises = uniqueLecturerIds.map(async (lecturerId) => {
        try {
          const profile = await getUserProfile(lecturerId);
          return { lecturerId, profileImage: profile.profileImage };
        } catch (error) {
          console.log(`Could not fetch profile for lecturer ${lecturerId}:`, error);
          return { lecturerId, profileImage: null };
        }
      });
      
      const profiles = await Promise.all(profilePromises);
      const profilesMap = profiles.reduce((acc, { lecturerId, profileImage }) => {
        acc[lecturerId] = profileImage;
        return acc;
      }, {});
      
      setLecturerProfiles(profilesMap);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.lecturerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Loading courses...</div>
          <div className="text-gray-500 mt-2">Finding the best engineering content for you</div>
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
              Engineering Courses
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8 animate-slide-up">
              Master engineering concepts with courses designed by Nigeria's top lecturers and industry experts
            </p>
            
            {/* Enhanced Search Bar */}
            <div className="max-w-2xl mx-auto animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type="text"
                  placeholder="Search courses, lecturers, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 text-lg rounded-xl border-0 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl text-gray-900 placeholder-gray-500"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Filters and Stats */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-6">
          {/* Category Filter */}
          <div className="flex items-center gap-4">
            <div className="flex items-center text-gray-700 font-medium">
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filter by:
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                      : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-sm'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center">
              <AcademicCapIcon className="w-5 h-5 mr-2" />
              <span className="font-semibold text-gray-900">
                {filteredCourses.length}
              </span>
              <span className="ml-1">
                {filteredCourses.length === 1 ? 'course' : 'courses'} found
              </span>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or browse all courses</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="btn-primary"
            >
              Browse All Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course, index) => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="card group hover:shadow-2xl transition-all duration-300 animate-fade-in"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={course.thumbnailURL}
                    alt={course.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="badge badge-primary">
                      {course.category.replace(' Engineering', '')}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-sm font-bold text-gray-900">
                      ₦{course.price.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="card-body">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>
                  
                  {/* Instructor */}
                  <div className="flex items-center mb-4">
                    {lecturerProfiles[course.lecturerId] ? (
                      <img
                        src={lecturerProfiles[course.lecturerId]}
                        alt={course.lecturerName}
                        className="w-8 h-8 rounded-full object-cover mr-3 border border-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-semibold text-sm">
                          {course.lecturerName?.charAt(0) || 'L'}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {course.lecturerName}
                      </div>
                      <div className="text-xs text-gray-500">Instructor</div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                    <div className="flex items-center">
                      <UserGroupIcon className="w-4 h-4 mr-1" />
                      <span>{course.totalStudents || 0} students</span>
                    </div>
                    
                    {course.rating > 0 && (
                      <div className="flex items-center">
                        <StarSolidIcon className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="font-medium">{course.rating.toFixed(1)}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      <span>{course.duration || '8'} weeks</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
