import { Link } from 'react-router-dom';
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  SparklesIcon,
  HeartIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

export default function About() {
  const stats = [
    { label: 'Active Students', value: '10,000+', icon: UserGroupIcon },
    { label: 'Expert Lecturers', value: '500+', icon: AcademicCapIcon },
    { label: 'Engineering Courses', value: '1,000+', icon: ChartBarIcon },
    { label: 'Success Rate', value: '95%', icon: SparklesIcon },
  ];

  const values = [
    {
      icon: AcademicCapIcon,
      title: 'Quality Education',
      description: 'We provide world-class engineering education tailored for Nigerian students, combining international standards with local relevance.'
    },
    {
      icon: HeartIcon,
      title: 'Student-Centered',
      description: 'Every decision we make puts students first. We are committed to making engineering education accessible and affordable for all.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Innovation',
      description: 'We leverage cutting-edge technology to deliver engaging, interactive learning experiences that prepare students for the future.'
    },
    {
      icon: UserGroupIcon,
      title: 'Community',
      description: 'We foster a vibrant community of learners, educators, and industry professionals working together to advance Nigerian engineering.'
    }
  ];

  const team = [
    {
      name: 'Dr. Adebayo Ogunlesi',
      role: 'Founder & CEO',
      bio: 'Ph.D. in Mechanical Engineering, Former lecturer at University of Lagos with 15 years of experience.',
      image: 'https://ui-avatars.com/api/?name=Adebayo+Ogunlesi&size=200&background=2563eb&color=fff'
    },
    {
      name: 'Chioma Nwosu',
      role: 'Chief Technology Officer',
      bio: 'Computer Engineering graduate from Covenant University, former software engineer at Google.',
      image: 'https://ui-avatars.com/api/?name=Chioma+Nwosu&size=200&background=059669&color=fff'
    },
    {
      name: 'Ibrahim Musa',
      role: 'Head of Curriculum',
      bio: 'Electrical Engineering expert with 20+ years in academia and industry across Nigeria.',
      image: 'https://ui-avatars.com/api/?name=Ibrahim+Musa&size=200&background=7c3aed&color=fff'
    },
    {
      name: 'Ngozi Okeke',
      role: 'Head of Student Success',
      bio: 'Education specialist passionate about student outcomes and career development.',
      image: 'https://ui-avatars.com/api/?name=Ngozi+Okeke&size=200&background=dc2626&color=fff'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="heading-xl text-gray-900 mb-6">
              About <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">NaijaEdu</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Empowering the next generation of Nigerian engineers through accessible, 
              high-quality online education that bridges the gap between academic knowledge 
              and industry requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-right">
              <h2 className="heading-lg text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                NaijaEdu was founded in 2023 with a clear mission: to democratize engineering 
                education in Nigeria and make it accessible to every aspiring engineer, 
                regardless of their location or financial background.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                We believe that Nigeria's future depends on having a strong foundation of 
                skilled engineers who can drive innovation, build infrastructure, and solve 
                the complex challenges facing our nation.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Through our platform, we connect students with experienced lecturers, 
                provide hands-on learning experiences, and create a supportive community 
                that helps every student succeed.
              </p>
            </div>
            <div className="animate-slide-left">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-green-600 rounded-3xl transform rotate-3"></div>
                <img 
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop" 
                  alt="Students learning engineering"
                  className="relative rounded-3xl shadow-2xl w-full h-96 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at NaijaEdu
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={index} 
                className="card group hover:shadow-xl transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="card-body text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Passionate educators and technologists dedicated to transforming engineering education in Nigeria
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div 
                key={index} 
                className="card group hover:shadow-xl transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="card-body text-center">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto mb-4 ring-4 ring-blue-100 group-hover:ring-blue-300 transition-all duration-300"
                  />
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-semibold mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Join Our Growing Community
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start your engineering journey today and become part of Nigeria's next generation of innovators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup" 
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Get Started Free
            </Link>
            <Link 
              to="/courses" 
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-4 px-8 rounded-lg transition-all duration-200"
            >
              Explore Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
