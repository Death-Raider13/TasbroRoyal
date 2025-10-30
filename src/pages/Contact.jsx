import { useState } from 'react';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../components/ui/Toast';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement actual email sending service (e.g., EmailJS, SendGrid)
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      showToast('Message sent successfully! We\'ll get back to you within 24 hours.', 'success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      showToast('Failed to send message. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: EnvelopeIcon,
      title: 'Email Us',
      content: 'support@naijaedu.ng',
      link: 'mailto:support@naijaedu.ng'
    },
    {
      icon: PhoneIcon,
      title: 'Call Us',
      content: '+234 800 123 4567',
      link: 'tel:+2348001234567'
    },
    {
      icon: MapPinIcon,
      title: 'Visit Us',
      content: 'Lagos, Nigeria',
      link: null
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Live Chat',
      content: 'Available 24/7',
      link: null
    }
  ];

  const faqs = [
    {
      question: 'How do I enroll in a course?',
      answer: 'Browse our course catalog, select a course, and click "Enroll Now". You\'ll be guided through the payment process.'
    },
    {
      question: 'Can I get a refund?',
      answer: 'Yes, we offer a 7-day money-back guarantee if you\'re not satisfied with a course.'
    },
    {
      question: 'How do I become a lecturer?',
      answer: 'Sign up with a lecturer account, submit your credentials, and wait for admin approval. Once approved, you can start creating courses.'
    },
    {
      question: 'Are certificates recognized?',
      answer: 'Yes, our certificates are recognized by many Nigerian companies and institutions.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="heading-xl text-gray-900 mb-6">
              Get in <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Touch</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <div 
                key={index}
                className="card group hover:shadow-xl transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="card-body text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <info.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{info.title}</h3>
                  {info.link ? (
                    <a 
                      href={info.link}
                      className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                    >
                      {info.content}
                    </a>
                  ) : (
                    <p className="text-gray-600 font-medium">{info.content}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="card animate-slide-right">
              <div className="card-body">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="6"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="animate-slide-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div 
                    key={index}
                    className="card hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="card-body">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 card bg-gradient-to-br from-blue-600 to-green-600">
                <div className="card-body text-center text-white">
                  <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
                  <p className="mb-4 text-blue-100">
                    Check out our comprehensive help center for more information.
                  </p>
                  <a 
                    href="/help"
                    className="inline-block bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                  >
                    Visit Help Center
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Office Hours */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Office Hours</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card">
              <div className="card-body">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Support Team</h3>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Monday - Friday:</strong> 8:00 AM - 8:00 PM</p>
                  <p><strong>Saturday:</strong> 10:00 AM - 6:00 PM</p>
                  <p><strong>Sunday:</strong> Closed</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Emergency Support</h3>
                <div className="space-y-2 text-gray-600">
                  <p><strong>24/7 Available</strong></p>
                  <p>For urgent technical issues</p>
                  <p className="text-blue-600 font-semibold">emergency@naijaedu.ng</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
