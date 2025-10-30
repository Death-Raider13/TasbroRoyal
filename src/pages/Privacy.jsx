import { ShieldCheckIcon, LockClosedIcon, EyeSlashIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function Privacy() {
  const lastUpdated = 'January 15, 2024';

  const sections = [
    {
      icon: DocumentTextIcon,
      title: '1. Information We Collect',
      content: `
        We collect information that you provide directly to us, including:
        
        **Personal Information:**
        - Name, email address, and phone number
        - Profile information (institution, field of study, etc.)
        - Payment information (processed securely through Paystack)
        - Course enrollment and progress data
        
        **Automatically Collected Information:**
        - Device information and IP address
        - Browser type and operating system
        - Pages visited and time spent on platform
        - Cookies and similar tracking technologies
        
        **User-Generated Content:**
        - Questions and answers posted on Q&A section
        - Study group discussions and messages
        - Course reviews and ratings
        - Profile pictures and uploaded content
      `
    },
    {
      icon: ShieldCheckIcon,
      title: '2. How We Use Your Information',
      content: `
        We use the collected information for the following purposes:
        
        - **Service Delivery:** Provide access to courses and platform features
        - **Account Management:** Create and maintain your account
        - **Payment Processing:** Process course purchases and lecturer payments
        - **Communication:** Send course updates, notifications, and support messages
        - **Improvement:** Analyze usage patterns to improve our platform
        - **Security:** Detect and prevent fraud, abuse, and security incidents
        - **Legal Compliance:** Comply with applicable laws and regulations
        - **Marketing:** Send promotional emails (with your consent)
      `
    },
    {
      icon: LockClosedIcon,
      title: '3. Information Sharing and Disclosure',
      content: `
        We do not sell your personal information. We may share your information with:
        
        **Service Providers:**
        - Payment processors (Paystack)
        - Cloud storage providers (Firebase, Cloudinary)
        - Email service providers
        - Analytics services
        
        **Lecturers:**
        - Limited student information for enrolled courses
        - Progress and engagement data for their courses
        
        **Legal Requirements:**
        - When required by law or legal process
        - To protect our rights and safety
        - In connection with business transfers or acquisitions
        
        **With Your Consent:**
        - When you explicitly agree to share information
      `
    },
    {
      icon: EyeSlashIcon,
      title: '4. Data Security',
      content: `
        We implement appropriate security measures to protect your information:
        
        - **Encryption:** Data encrypted in transit using SSL/TLS
        - **Access Controls:** Limited access to personal information
        - **Secure Storage:** Data stored on secure Firebase servers
        - **Payment Security:** PCI-DSS compliant payment processing
        - **Regular Audits:** Security assessments and updates
        - **Incident Response:** Procedures for handling security breaches
        
        However, no method of transmission over the Internet is 100% secure. 
        We cannot guarantee absolute security of your information.
      `
    },
    {
      icon: DocumentTextIcon,
      title: '5. Your Rights and Choices',
      content: `
        You have the following rights regarding your personal information:
        
        **Access:** Request a copy of your personal data
        **Correction:** Update or correct inaccurate information
        **Deletion:** Request deletion of your account and data
        **Opt-Out:** Unsubscribe from marketing emails
        **Data Portability:** Request your data in a portable format
        **Restrict Processing:** Limit how we use your information
        
        To exercise these rights, contact us at privacy@naijaedu.ng
      `
    },
    {
      icon: DocumentTextIcon,
      title: '6. Cookies and Tracking',
      content: `
        We use cookies and similar technologies to:
        
        - Remember your preferences and settings
        - Authenticate your account
        - Analyze platform usage and performance
        - Provide personalized content and recommendations
        
        **Types of Cookies:**
        - Essential cookies (required for platform functionality)
        - Analytics cookies (understand user behavior)
        - Preference cookies (remember your settings)
        
        You can control cookies through your browser settings. Note that 
        disabling cookies may affect platform functionality.
      `
    },
    {
      icon: DocumentTextIcon,
      title: '7. Children\'s Privacy',
      content: `
        NaijaEdu is intended for users aged 16 and above. We do not knowingly 
        collect personal information from children under 16. If you believe we 
        have collected information from a child under 16, please contact us 
        immediately at privacy@naijaedu.ng.
      `
    },
    {
      icon: DocumentTextIcon,
      title: '8. International Data Transfers',
      content: `
        Your information may be transferred to and processed in countries other 
        than Nigeria. We ensure appropriate safeguards are in place to protect 
        your information in accordance with this Privacy Policy and applicable 
        data protection laws.
      `
    },
    {
      icon: DocumentTextIcon,
      title: '9. Data Retention',
      content: `
        We retain your personal information for as long as necessary to:
        
        - Provide our services to you
        - Comply with legal obligations
        - Resolve disputes and enforce agreements
        - Maintain business records
        
        When you delete your account, we will delete or anonymize your personal 
        information within 90 days, except where retention is required by law.
      `
    },
    {
      icon: DocumentTextIcon,
      title: '10. Third-Party Links',
      content: `
        Our platform may contain links to third-party websites and services. 
        We are not responsible for the privacy practices of these third parties. 
        We encourage you to review their privacy policies before providing any 
        personal information.
      `
    },
    {
      icon: DocumentTextIcon,
      title: '11. Changes to This Policy',
      content: `
        We may update this Privacy Policy from time to time. We will notify you 
        of significant changes by:
        
        - Posting the updated policy on our website
        - Sending an email notification
        - Displaying a prominent notice on the platform
        
        Your continued use of NaijaEdu after changes constitutes acceptance of 
        the updated Privacy Policy.
      `
    },
    {
      icon: DocumentTextIcon,
      title: '12. Contact Us',
      content: `
        If you have questions or concerns about this Privacy Policy or our 
        data practices, please contact us:
        
        **Email:** privacy@naijaedu.ng
        **Phone:** +234 800 123 4567
        **Address:** Lagos, Nigeria
        
        We will respond to your inquiry within 30 days.
      `
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShieldCheckIcon className="w-20 h-20 text-white mx-auto mb-6 animate-fade-in" />
          <h1 className="text-5xl font-bold text-white mb-6 animate-fade-in">
            Privacy Policy
          </h1>
          <p className="text-xl text-blue-100 mb-4">
            Your privacy is important to us. This policy explains how we collect, 
            use, and protect your personal information.
          </p>
          <p className="text-blue-200">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card animate-slide-up">
            <div className="card-body">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to NaijaEdu. This Privacy Policy describes how NaijaEdu ("we," "us," or "our") 
                collects, uses, shares, and protects your personal information when you use our 
                e-learning platform and services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using NaijaEdu, you agree to the collection and use of information in accordance 
                with this policy. If you do not agree with our policies and practices, please do not 
                use our services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Policy Sections */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {sections.map((section, index) => (
              <div 
                key={index}
                className="card hover:shadow-xl transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="card-body">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                        <section.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h3>
                      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                        {section.content}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Questions About Privacy?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            We're here to help. Contact our privacy team for any concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:privacy@naijaedu.ng"
              className="btn-primary"
            >
              Contact Privacy Team
            </a>
            <a 
              href="/help"
              className="btn-outline"
            >
              Visit Help Center
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
