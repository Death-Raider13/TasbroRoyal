import { DocumentTextIcon, ScaleIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function Terms() {
  const lastUpdated = 'January 15, 2024';

  const sections = [
    {
      icon: DocumentTextIcon,
      title: '1. Acceptance of Terms',
      content: `
        By accessing and using NaijaEdu, you accept and agree to be bound by these 
        Terms of Service. If you do not agree to these terms, please do not use our 
        platform.
        
        These terms apply to all users, including students, lecturers, and visitors.
      `
    },
    {
      icon: DocumentTextIcon,
      title: '2. User Accounts',
      content: `
        **Account Creation:**
        - You must be at least 16 years old to create an account
        - Provide accurate and complete information
        - Maintain the security of your account credentials
        - You are responsible for all activities under your account
        
        **Account Types:**
        - **Students:** Access to purchase and enroll in courses
        - **Lecturers:** Ability to create and sell courses (subject to approval)
        - **Admins:** Platform management and oversight
        
        **Account Termination:**
        - You may delete your account at any time
        - We may suspend or terminate accounts for violations
        - Termination does not affect payment obligations
      `
    },
    {
      icon: DocumentTextIcon,
      title: '3. Course Enrollment and Access',
      content: `
        **Student Enrollment:**
        - Purchase courses through our secure payment system
        - Access granted immediately upon successful payment
        - Lifetime access to purchased courses (unless course is removed)
        - Progress is saved automatically
        
        **Course Availability:**
        - We reserve the right to modify or discontinue courses
        - Enrolled students retain access to discontinued courses
        - Course content may be updated by lecturers
        
        **Refund Policy:**
        - 7-day money-back guarantee on all courses
        - Must not have completed more than 25% of course
        - Refunds processed within 5-7 business days
        - Contact support@naijaedu.ng for refund requests
      `
    },
    {
      icon: DocumentTextIcon,
      title: '4. Lecturer Terms',
      content: `
        **Lecturer Requirements:**
        - Must have relevant qualifications and expertise
        - Submit credentials for admin verification
        - Approval process takes 1-3 business days
        
        **Course Creation:**
        - Create original, high-quality educational content
        - Ensure content does not infringe on copyrights
        - Courses subject to admin review before publication
        - Must comply with our content guidelines
        
        **Revenue Sharing:**
        - Lecturers earn 75% commission on course sales
        - NaijaEdu retains 25% for platform maintenance
        - Payments processed monthly via bank transfer
        - Minimum payout threshold: ₦10,000
        
        **Content Ownership:**
        - Lecturers retain copyright to their content
        - Grant NaijaEdu license to host and distribute content
        - May not upload content to competing platforms
      `
    },
    {
      icon: ShieldCheckIcon,
      title: '5. Intellectual Property',
      content: `
        **Platform Content:**
        - NaijaEdu owns all platform design, code, and branding
        - Users may not copy, modify, or distribute platform code
        - Trademarks and logos are property of NaijaEdu
        
        **User Content:**
        - You retain ownership of content you create
        - Grant us license to use, display, and distribute your content
        - You are responsible for ensuring you have rights to uploaded content
        
        **Copyright Infringement:**
        - We respect intellectual property rights
        - Report infringement to copyright@naijaedu.ng
        - Repeat infringers will have accounts terminated
      `
    },
    {
      icon: ExclamationTriangleIcon,
      title: '6. Prohibited Conduct',
      content: `
        Users may not:
        
        - Upload malicious code, viruses, or harmful content
        - Harass, abuse, or threaten other users
        - Share account credentials with others
        - Attempt to hack or compromise platform security
        - Post spam, advertisements, or irrelevant content
        - Impersonate others or provide false information
        - Use automated tools to scrape or download content
        - Resell or redistribute course content
        - Engage in fraudulent payment activities
        - Violate any applicable laws or regulations
        
        Violations may result in account suspension or termination.
      `
    },
    {
      icon: DocumentTextIcon,
      title: '7. Payment Terms',
      content: `
        **Pricing:**
        - All prices displayed in Nigerian Naira (₦)
        - Prices subject to change without notice
        - Current price at time of purchase applies
        
        **Payment Processing:**
        - Payments processed securely through Paystack
        - We do not store credit card information
        - Payment confirmation sent via email
        
        **Taxes:**
        - Prices may not include applicable taxes
        - Users responsible for any tax obligations
      `
    },
    {
      icon: ScaleIcon,
      title: '8. Disclaimers and Limitations',
      content: `
        **Service Availability:**
        - Platform provided "as is" without warranties
        - We do not guarantee uninterrupted service
        - May perform maintenance without notice
        
        **Educational Content:**
        - Course content for educational purposes only
        - We do not guarantee specific outcomes or results
        - Lecturers responsible for accuracy of their content
        
        **Limitation of Liability:**
        - Not liable for indirect or consequential damages
        - Liability limited to amount paid for services
        - Does not apply where prohibited by law
      `
    },
    {
      icon: DocumentTextIcon,
      title: '9. Indemnification',
      content: `
        You agree to indemnify and hold NaijaEdu harmless from any claims, 
        damages, or expenses arising from:
        
        - Your use of the platform
        - Your violation of these terms
        - Your violation of any rights of others
        - Content you upload or share
      `
    },
    {
      icon: DocumentTextIcon,
      title: '10. Privacy',
      content: `
        Your use of NaijaEdu is also governed by our Privacy Policy. Please 
        review our Privacy Policy to understand how we collect, use, and protect 
        your personal information.
      `
    },
    {
      icon: DocumentTextIcon,
      title: '11. Dispute Resolution',
      content: `
        **Governing Law:**
        - These terms governed by laws of Nigeria
        - Disputes subject to Nigerian jurisdiction
        
        **Resolution Process:**
        1. Contact support to resolve informally
        2. Mediation if informal resolution fails
        3. Arbitration or court proceedings as last resort
        
        **Class Action Waiver:**
        - Disputes resolved individually, not as class actions
      `
    },
    {
      icon: DocumentTextIcon,
      title: '12. Changes to Terms',
      content: `
        We may modify these terms at any time. Changes effective upon posting 
        to the platform. Continued use after changes constitutes acceptance.
        
        Significant changes will be communicated via:
        - Email notification
        - Platform announcement
        - Prominent notice on website
      `
    },
    {
      icon: DocumentTextIcon,
      title: '13. Contact Information',
      content: `
        For questions about these Terms of Service:
        
        **Email:** legal@naijaedu.ng
        **Phone:** +234 800 123 4567
        **Address:** Lagos, Nigeria
        
        We will respond to inquiries within 5 business days.
      `
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScaleIcon className="w-20 h-20 text-white mx-auto mb-6 animate-fade-in" />
          <h1 className="text-5xl font-bold text-white mb-6 animate-fade-in">
            Terms of Service
          </h1>
          <p className="text-xl text-blue-100 mb-4">
            Please read these terms carefully before using NaijaEdu. By using our 
            platform, you agree to these terms.
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
                Welcome to NaijaEdu. These Terms of Service ("Terms") govern your access to and 
                use of the NaijaEdu platform, including our website, mobile applications, and 
                related services (collectively, the "Services").
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                These Terms constitute a legally binding agreement between you and NaijaEdu. 
                Please read them carefully. By accessing or using our Services, you acknowledge 
                that you have read, understood, and agree to be bound by these Terms.
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> If you do not agree to these Terms, you must not 
                    access or use our Services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Terms Sections */}
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

      {/* Agreement Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card bg-gradient-to-br from-blue-600 to-green-600">
            <div className="card-body text-center text-white">
              <h2 className="text-3xl font-bold mb-4">
                By Using NaijaEdu, You Agree
              </h2>
              <p className="text-xl text-blue-100 mb-6">
                Your continued use of our platform constitutes acceptance of these terms 
                and any future modifications.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:legal@naijaedu.ng"
                  className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Contact Legal Team
                </a>
                <a 
                  href="/help"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-3 px-8 rounded-lg transition-all duration-200"
                >
                  Visit Help Center
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
