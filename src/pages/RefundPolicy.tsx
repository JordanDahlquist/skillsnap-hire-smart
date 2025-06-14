import { UnifiedHeader } from "@/components/UnifiedHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <UnifiedHeader 
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Refund Policy", isCurrentPage: true }
        ]}
        showCreateButton={false}
      />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-8 space-y-8 bg-white">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Refund Policy</h1>
              <p className="text-gray-600">Last updated: January 2025</p>
            </div>

            <Separator className="border-gray-200" />

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Overview</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                At Atract, we want you to be completely satisfied with our hiring platform. This Refund Policy explains the circumstances under which refunds may be provided and the process for requesting them.
              </p>
              <p className="text-gray-700 leading-relaxed">
                All payments are processed through Paddle, our trusted payment processor. This policy applies to all subscription plans and services offered through our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Free Trial Period</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">2.1 7-Day Free Trial</h3>
              <p className="text-gray-700 mb-4">
                We offer a 7-day free trial for all new subscribers. During this trial period, you can access all features of your selected plan at no cost. You will not be charged until the trial period expires.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">2.2 Trial Cancellation</h3>
              <p className="text-gray-700 mb-4">
                You may cancel your subscription at any time during the trial period without being charged. If you cancel before the trial ends, your access will continue until the trial period expires, and no payment will be processed.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">2.3 Automatic Conversion</h3>
              <p className="text-gray-700">
                If you do not cancel before your trial period ends, your subscription will automatically convert to a paid subscription, and your payment method will be charged for the first billing cycle.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Subscription Cancellations</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">3.1 Monthly Subscriptions</h3>
              <p className="text-gray-700 mb-4">
                You may cancel your monthly subscription at any time. Cancellation will take effect at the end of your current billing period. You will continue to have access to all paid features until the end of the billing period for which you have already paid.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">3.2 No Partial Month Refunds</h3>
              <p className="text-gray-700 mb-4">
                We do not provide refunds for partial months. When you cancel, you retain access to the service through the end of your paid billing period.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">3.3 How to Cancel</h3>
              <p className="text-gray-700">
                You can cancel your subscription at any time through your account settings or by contacting our support team at jordan@aeonmarketing.co.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Refund Eligibility</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">4.1 Service Issues</h3>
              <p className="text-gray-700 mb-4">
                If you experience significant service disruptions or technical issues that prevent you from using our platform for an extended period, you may be eligible for a prorated refund for the affected period.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">4.2 Billing Errors</h3>
              <p className="text-gray-700 mb-4">
                If you believe you have been charged incorrectly due to a billing error on our part, please contact us immediately. We will investigate and provide appropriate refunds for verified billing errors.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">4.3 Unauthorized Charges</h3>
              <p className="text-gray-700">
                If you believe you have been charged without authorization, please contact us immediately. We take unauthorized charges seriously and will investigate all claims promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Non-Refundable Items</h2>
              <p className="text-gray-700 mb-2">The following are generally not eligible for refunds:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Subscription fees for periods where the service was available and functional</li>
                <li>Charges for completed services, such as processed job applications or sent emails</li>
                <li>Fees for services that have been actively used, including Scout AI searches</li>
                <li>Cancellations made after the trial period without valid service issues</li>
                <li>Refund requests made more than 30 days after the charge</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Plan Downgrades</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">6.1 Mid-Cycle Downgrades</h3>
              <p className="text-gray-700 mb-4">
                If you downgrade your plan during a billing cycle, the downgrade will take effect at the beginning of your next billing period. We do not provide prorated refunds for plan downgrades.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">6.2 Feature Access</h3>
              <p className="text-gray-700">
                When downgrading, you will retain access to your current plan's features until the end of the billing period, after which your access will be adjusted to match your new plan's limitations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Refund Process</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">7.1 How to Request a Refund</h3>
              <p className="text-gray-700 mb-4">
                To request a refund, please contact our support team at jordan@aeonmarketing.co with the following information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
                <li>Your account email address</li>
                <li>Transaction ID or payment reference</li>
                <li>Reason for the refund request</li>
                <li>Any relevant documentation or screenshots</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2">7.2 Processing Time</h3>
              <p className="text-gray-700 mb-4">
                Refund requests are typically reviewed within 5-7 business days. If approved, refunds are processed through Paddle and may take 5-10 business days to appear in your account, depending on your payment method and financial institution.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">7.3 Refund Method</h3>
              <p className="text-gray-700">
                Refunds will be issued to the original payment method used for the transaction. We cannot process refunds to different payment methods or accounts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Paddle Payment Processor</h2>
              <p className="text-gray-700 mb-4">
                All payments are processed by Paddle. For payment-related inquiries or disputes, you may also contact Paddle directly through their support channels. However, we recommend contacting us first so we can assist you directly.
              </p>
              <p className="text-gray-700">
                Paddle's refund policies also apply to transactions processed through their platform. You can review Paddle's policies on their website for additional information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Chargebacks and Disputes</h2>
              <p className="text-gray-700 mb-4">
                If you initiate a chargeback or payment dispute with your bank or credit card company without first contacting us, your account may be suspended pending resolution of the dispute.
              </p>
              <p className="text-gray-700">
                We encourage you to contact us directly before initiating any payment disputes, as we are often able to resolve issues more quickly and efficiently than through the chargeback process.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
              <p className="text-gray-700">
                We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately upon posting on our website. We will notify users of significant changes via email or through our platform. Your continued use of our service after changes are posted constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
              <p className="text-gray-700 mb-2">
                For refund requests or questions about this policy, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-700"><strong>Email:</strong> jordan@aeonmarketing.co</p>
                <p className="text-gray-700"><strong>Subject Line:</strong> Refund Request - [Your Account Email]</p>
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
              <p>This refund policy is effective as of the date listed above and applies to all users of the Atract platform.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RefundPolicy;
