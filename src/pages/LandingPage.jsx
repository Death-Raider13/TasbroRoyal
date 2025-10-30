import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AcademicCapIcon,
  CogIcon,
  UserGroupIcon,
  ChartBarIcon,
  BookOpenIcon,
  LightBulbIcon,
  PlayIcon,
  ArrowRightIcon,
  StarIcon,
  CheckCircleIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: AcademicCapIcon,
      title: "Expert-Led Courses",
      description: "Learn from industry professionals and experienced lecturers with real-world engineering expertise.",
      link: "/courses"
    },
    {
      icon: UserGroupIcon,
      title: "Study Groups",
      description: "Join collaborative study groups, share knowledge, and learn together with fellow engineering students.",
      link: "/study-groups"
    },
    {
      icon: QuestionMarkCircleIcon,
      title: "Q&A Community",
      description: "Ask questions, get expert answers, and help others in our vibrant engineering Q&A community.",
      link: "/questions"
    },
    {
      icon: CogIcon,
      title: "Hands-On Projects",
      description: "Apply theoretical knowledge through practical projects and real engineering challenges.",
      link: "/courses"
    },
    {
      icon: ChartBarIcon,
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed analytics and personalized recommendations.",
      link: "/student/dashboard"
    },
    {
      icon: LightBulbIcon,
      title: "Innovation Focus",
      description: "Develop innovative thinking and problem-solving skills essential for modern engineering.",
      link: "/courses"
    }
  ];

  const testimonials = [
    {
      name: "Adebayo Ogundimu",
      role: "Mechanical Engineering Student",
      university: "University of Lagos",
      content: "NaijaEdu transformed my understanding of thermodynamics. The interactive lessons and expert guidance helped me excel in my exams.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Fatima Abdullahi",
      role: "Civil Engineering Graduate",
      university: "Ahmadu Bello University",
      content: "The structural analysis courses here are exceptional. I landed my dream job at Julius Berger thanks to the skills I gained.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Chinedu Okwu",
      role: "Electrical Engineering Professional",
      university: "University of Nigeria, Nsukka",
      content: "As a working engineer, the flexible learning schedule allowed me to upskill while maintaining my career. Highly recommended!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Active Students" },
    { number: "500+", label: "Expert Instructors" },
    { number: "1,200+", label: "Engineering Courses" },
    { number: "95%", label: "Success Rate" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Hero Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-8 animate-fade-in">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></span>
              Nigeria's Premier Engineering Education Platform
            </div>

            {/* Hero Title */}
            <h1 className="heading-xl text-gray-900 mb-6 animate-slide-up">
              Master Engineering Excellence with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                NaijaEdu
              </span>
            </h1>

            {/* Hero Subtitle */}
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{animationDelay: '0.2s'}}>
              Unlock your potential with world-class engineering courses designed by Nigerian experts. 
              From mechanical to software engineering, build the skills that drive innovation.
            </p>

            {/* Hero CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up" style={{animationDelay: '0.4s'}}>
              <Link to="/signup" className="btn-primary text-lg px-8 py-4 group">
                Start Learning Today
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/courses" className="btn-outline text-lg px-8 py-4 group">
                <PlayIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Explore Courses
              </Link>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in" style={{animationDelay: '0.6s'}}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Image/Video Section */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl animate-scale-in" style={{animationDelay: '0.8s'}}>
            <img 
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=600&fit=crop" 
              alt="Engineering Students Learning"
              className="w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <h3 className="text-2xl font-bold mb-2">Interactive Learning Experience</h3>
              <p className="text-lg opacity-90">Engage with cutting-edge engineering concepts</p>
            </div>
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 group">
                <PlayIcon className="w-8 h-8 text-white ml-1 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-gray-900 mb-4">
              Why Choose NaijaEdu?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're revolutionizing engineering education in Nigeria with innovative teaching methods and industry-relevant curriculum.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link 
                key={index} 
                to={feature.link}
                className="card group hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="card-body text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                    <feature.icon className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  <div className="mt-4 text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Explore →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from our students and graduates who are making their mark in the engineering world.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card">
                <div className="card-body">
                  {/* Rating Stars */}
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  {/* Testimonial Content */}
                  <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                  
                  {/* Author Info */}
                  <div className="flex items-center">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <p className="text-xs text-gray-500">{testimonial.university}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="heading-lg text-white mb-6">
            Ready to Transform Your Engineering Career?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of Nigerian engineering students and professionals who are advancing their careers with NaijaEdu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              Get Started Free
            </Link>
            <Link to="/contact" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-4 px-8 rounded-lg transition-all duration-200">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
