import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "Twitter",
      href: "https://twitter.com/naijaedu",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      )
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/company/naijaedu",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      )
    },
    {
      name: "Facebook",
      href: "https://facebook.com/naijaedu",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )
    }
  ];

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                  NaijaEdu
                </span>
                <div className="text-xs text-gray-400 font-medium">Engineering Excellence</div>
              </div>
            </Link>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Empowering Nigerian engineering students with world-class education, 
              practical skills, and industry connections to build the future of Africa.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition-all duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-6 text-white">Platform</h4>
            <ul className="space-y-3">
              <li><Link to="/courses" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">Browse Courses</Link></li>
              <li><Link to="/signup?role=lecturer" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">Become an Instructor</Link></li>
              <li><Link to="/student/dashboard" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">Student Dashboard</Link></li>
              <li><Link to="/help" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">Help Center</Link></li>
            </ul>
          </div>

          {/* Engineering Fields */}
          <div>
            <h4 className="font-semibold mb-6 text-white">Engineering</h4>
            <ul className="space-y-3">
              <li><Link to="/courses?category=mechanical" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">Mechanical</Link></li>
              <li><Link to="/courses?category=civil" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">Civil</Link></li>
              <li><Link to="/courses?category=electrical" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">Electrical</Link></li>
              <li><Link to="/courses?category=computer" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">Computer</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-6 text-white">Company</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">About NaijaEdu</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">Contact Us</Link></li>
              <li><Link to="/privacy" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
              <p className="text-gray-300 text-sm">Get the latest engineering courses and industry insights.</p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
              />
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-r-lg transition-colors duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
            <div className="mb-4 md:mb-0">
              <p>&copy; {currentYear} NaijaEdu. All rights reserved. Made with ❤️ in Nigeria.</p>
            </div>
            <div className="flex items-center space-x-6">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
