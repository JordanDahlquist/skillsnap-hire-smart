
import { Card, CardContent } from "@/components/ui/card";
import { PRICING_FAQS } from "@/constants/pricing";

export const PricingFAQ = () => {
  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-6">
          {PRICING_FAQS.map((faq, index) => (
            <Card key={index} className="border-gray-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">{faq.q}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
