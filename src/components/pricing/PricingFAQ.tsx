
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const PricingFAQ = () => {
  const faqs = [
    {
      question: "How does the 7-day free trial work?",
      answer: "Start using Atract immediately with full access to all Starter plan features for 7 days. No credit card required. After your trial ends, you can choose to upgrade to a paid plan or your account will be restricted to read-only access."
    },
    {
      question: "Can I change my plan at any time?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. When you upgrade, you'll get immediate access to new features. When you downgrade, changes take effect at your next billing cycle."
    },
    {
      question: "What happens if I exceed my plan limits?",
      answer: "We'll notify you when you're approaching your limits. If you exceed them, you'll be prompted to upgrade your plan to continue using the service without interruption."
    },
    {
      question: "Is there a setup fee or long-term contract?",
      answer: "No setup fees and no long-term contracts. All plans are month-to-month and you can cancel anytime. Enterprise plans may have custom terms based on your requirements."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal through our secure payment processor Paddle."
    },
    {
      question: "Do you offer discounts for annual payments?",
      answer: "Yes! Contact our sales team to learn about annual payment discounts and special pricing for larger teams."
    },
    {
      question: "What kind of support do you provide?",
      answer: "All plans include email support. Professional plans get priority support with faster response times. Enterprise customers get dedicated account management and phone support."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. You'll continue to have access to paid features until the end of your current billing period."
    }
  ];

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-gray-600">
          Everything you need to know about our pricing and plans
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {faqs.map((faq, index) => (
          <AccordionItem 
            key={index} 
            value={`item-${index}`}
            className="border border-gray-200 rounded-lg px-6 bg-white shadow-sm"
          >
            <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 leading-relaxed pb-4">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="text-center mt-12">
        <p className="text-gray-600 mb-4">Still have questions?</p>
        <a 
          href="mailto:support@atract.ai" 
          className="text-blue-600 hover:text-blue-700 font-semibold"
        >
          Contact our support team
        </a>
      </div>
    </section>
  );
};
