import { UnifiedHeader } from "@/components/UnifiedHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-white">
      <UnifiedHeader 
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Terms of Service", isCurrentPage: true }
        ]}
        showCreateButton={false}
      />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-8 space-y-8 bg-white">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
              <p className="text-gray-600">Last updated: January 2025</p>
            </div>

            <Separator className="border-gray-200" />

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing and using Atract ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
              <p className="text-gray-700 leading-relaxed">
                These Terms of Service ("Terms") govern your use of our hiring platform and related services operated by Atract. Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Atract is an AI-powered hiring platform that enables employers to create job postings, manage applications, and streamline their recruitment process. Our service includes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Job posting creation and management</li>
                <li>AI-powered resume screening and candidate matching</li>
                <li>Application tracking and management systems</li>
                <li>Scout AI for candidate search and recruitment</li>
                <li>Email automation and communication tools</li>
                <li>Analytics and reporting features</li>
                <li>Integration with third-party services including LinkedIn</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts and Registration</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">3.1 Account Creation</h3>
              <p className="text-gray-700 mb-4">
                To access certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">3.2 Account Security</h3>
              <p className="text-gray-700 mb-4">
                You are responsible for safeguarding the password and for maintaining the confidentiality of your account. You agree not to disclose your password to any third party and to take sole responsibility for any activities or actions under your account.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">3.3 Account Termination</h3>
              <p className="text-gray-700">
                We reserve the right to terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Billing and Subscriptions</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">4.1 Subscription Plans</h3>
              <p className="text-gray-700 mb-4">
                Atract offers various subscription plans with different features and usage limits. Current pricing and plan details are available on our pricing page. We reserve the right to modify our pricing at any time with reasonable notice.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">4.2 Payment Processing</h3>
              <p className="text-gray-700 mb-4">
                Payments are processed through Paddle, our third-party payment processor. By subscribing to our service, you agree to Paddle's terms and conditions. All fees are non-refundable except as required by law or as specifically stated in these Terms.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">4.3 Free Trial</h3>
              <p className="text-gray-700 mb-4">
                We offer a 7-day free trial for new users. During the trial period, you have access to the features included in your selected plan. If you do not cancel before the trial ends, you will be automatically charged for the subscription.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">4.4 Cancellation</h3>
              <p className="text-gray-700">
                You may cancel your subscription at any time. Cancellation will take effect at the end of your current billing period. You will continue to have access to paid features until the end of your billing period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Content and Intellectual Property</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">5.1 Your Content</h3>
              <p className="text-gray-700 mb-4">
                You retain ownership of any content you submit, post, or display on or through the Service ("User Content"). By submitting User Content, you grant Atract a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such content solely for the purpose of providing the Service.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">5.2 Responsibility for Content</h3>
              <p className="text-gray-700 mb-4">
                You are solely responsible for your User Content and the consequences of posting or publishing it. You represent and warrant that you own or have the necessary licenses, rights, consents, and permissions to use and authorize Atract to use your User Content.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">5.3 Our Intellectual Property</h3>
              <p className="text-gray-700">
                The Service and its original content, features, and functionality are and will remain the exclusive property of Atract and its licensors. The Service is protected by copyright, trademark, and other laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Prohibited Uses</h2>
              <p className="text-gray-700 mb-2">You may not use our Service:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>For any unlawful purpose or to solicit others to perform illegal acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>To upload or transmit viruses or any other type of malicious code</li>
                <li>To collect or track the personal information of others</li>
                <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
                <li>For any obscene or immoral purpose</li>
                <li>To interfere with or circumvent the security features of the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy and Data Protection</h2>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our Service. By using our Service, you agree to the collection and use of information in accordance with our Privacy Policy.
              </p>
              <p className="text-gray-700">
                We comply with applicable data protection laws, including GDPR for users in the European Union. You have certain rights regarding your personal data, as outlined in our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Third-Party Services</h2>
              <p className="text-gray-700 mb-4">
                Our Service may contain links to third-party websites or services, including LinkedIn, Paddle, and other integrated platforms. We are not responsible for the content, privacy policies, or practices of third-party websites or services.
              </p>
              <p className="text-gray-700">
                Your use of third-party services is subject to their respective terms and conditions. We encourage you to read the terms and conditions and privacy policies of any third-party services that you use.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimers and Limitations of Liability</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">9.1 Service Availability</h3>
              <p className="text-gray-700 mb-4">
                We strive to maintain the Service, but we do not guarantee that the Service will be available at all times or that it will be error-free. The Service is provided "as is" and "as available" without any representations or warranties, express or implied.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">9.2 Limitation of Liability</h3>
              <p className="text-gray-700">
                In no event shall Atract, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Indemnification</h2>
              <p className="text-gray-700">
                You agree to defend, indemnify, and hold harmless Atract and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination</h2>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will cease immediately.
              </p>
              <p className="text-gray-700">
                If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
              <p className="text-gray-700">
                These Terms shall be interpreted and governed by the laws of the State of Texas, United States, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
              <p className="text-gray-700">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
              <p className="text-gray-700 mb-2">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-700"><strong>Email:</strong> jordan@aeonmarketing.co</p>
                <p className="text-gray-700"><strong>Company:</strong> Atract</p>
                <div className="text-gray-700">
                  <strong>Address:</strong>
                  <br />
                  1401 Lavaca St PMB 41664
                  <br />
                  Austin, TX 78701
                </div>
              </div>
            </section>

            <Separator className="border-gray-200" />

            <div className="text-center text-sm text-gray-500">
              <p>These terms of service are effective as of the date listed above and apply to all users of the Atract platform.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TermsOfService;
