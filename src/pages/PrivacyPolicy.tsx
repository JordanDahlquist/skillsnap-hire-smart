
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedHeader 
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Privacy Policy", isCurrentPage: true }
        ]}
        showCreateButton={false}
      />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-8 space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
              <p className="text-gray-600">Last updated: January 2025</p>
            </div>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to Atract ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our job application platform, including our LinkedIn integration features. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">2.1 Information You Provide Directly</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
                <li>Personal information (name, email address, phone number)</li>
                <li>Professional information (work experience, education, skills)</li>
                <li>Resume files and portfolio documents</li>
                <li>Job application responses and cover letters</li>
                <li>Account credentials and profile information</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2">2.2 LinkedIn Integration Data</h3>
              <p className="text-gray-700 mb-2">When you connect your LinkedIn account, we may collect:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
                <li>Basic profile information (name, headline, profile picture)</li>
                <li>Email address associated with your LinkedIn account</li>
                <li>Work experience and employment history</li>
                <li>Educational background</li>
                <li>Professional skills and endorsements</li>
                <li>Location information</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2">2.3 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Usage data and application analytics</li>
                <li>Device information and browser type</li>
                <li>IP address and location data</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-2">We use the collected information for the following purposes:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Processing and managing job applications</li>
                <li>Matching candidates with suitable job opportunities</li>
                <li>Facilitating communication between candidates and employers</li>
                <li>Improving our platform and user experience</li>
                <li>Providing customer support and technical assistance</li>
                <li>Complying with legal obligations and preventing fraud</li>
                <li>Sending relevant notifications and updates about applications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">4.1 With Employers</h3>
              <p className="text-gray-700 mb-4">
                When you apply for a job, we share your application information, including your resume and responses, with the relevant employers or hiring managers.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">4.2 Service Providers</h3>
              <p className="text-gray-700 mb-4">
                We work with third-party service providers, including Supabase for data storage and LinkedIn for profile integration, who assist us in operating our platform.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">4.3 Legal Requirements</h3>
              <p className="text-gray-700 mb-4">
                We may disclose your information if required by law, court order, or governmental request, or to protect our rights and safety.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">4.4 No Sale of Personal Data</h3>
              <p className="text-gray-700">
                We do not sell, trade, or rent your personal information to third parties for commercial purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Storage and Security</h2>
              <p className="text-gray-700 mb-4">
                Your information is stored securely using industry-standard encryption and security measures. We use Supabase as our primary data storage provider, which implements robust security protocols including encryption at rest and in transit.
              </p>
              <p className="text-gray-700">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights and Choices</h2>
              <p className="text-gray-700 mb-2">You have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Withdraw Consent:</strong> Disconnect your LinkedIn account at any time</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              </ul>
              <p className="text-gray-700">
                To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. LinkedIn-Specific Information</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">7.1 OAuth Permissions</h3>
              <p className="text-gray-700 mb-4">
                Our LinkedIn integration uses OAuth 2.0 with the following scopes: openid, profile, and email. We only access the basic information necessary for job application purposes.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">7.2 Disconnecting LinkedIn</h3>
              <p className="text-gray-700 mb-4">
                You can disconnect your LinkedIn account at any time from your profile settings. This will remove the LinkedIn data from future applications but will not affect previously submitted applications.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">7.3 LinkedIn's Privacy Policy</h3>
              <p className="text-gray-700">
                Your use of LinkedIn is also governed by LinkedIn's Privacy Policy. Please review LinkedIn's privacy practices at: https://www.linkedin.com/legal/privacy-policy
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking</h2>
              <p className="text-gray-700">
                We use cookies and similar tracking technologies to improve your experience, analyze usage patterns, and provide personalized content. You can control cookie preferences through your browser settings, though some features may not function properly if cookies are disabled.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
              <p className="text-gray-700">
                Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
              <p className="text-gray-700">
                Our service is not intended for individuals under the age of 16. We do not knowingly collect personal information from children under 16. If we become aware that we have collected such information, we will take steps to delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-gray-700">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last updated" date. You are advised to review this privacy policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="text-gray-700 mb-2">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> privacy@atract.ai</p>
                <p className="text-gray-700"><strong>Company:</strong> Atract</p>
                <p className="text-gray-700"><strong>Address:</strong> [Your Business Address]</p>
              </div>
            </section>

            <Separator />

            <div className="text-center text-sm text-gray-500">
              <p>This privacy policy is effective as of the date listed above and applies to all users of the Atract platform.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
