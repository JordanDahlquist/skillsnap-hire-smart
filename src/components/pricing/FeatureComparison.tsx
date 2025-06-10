
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { PRICING_FEATURES } from "@/constants/pricing";

export const FeatureComparison = () => {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Everything you need to revolutionize hiring
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Compare our plans and see how Atract can transform your hiring process
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRICING_FEATURES.map((feature, index) => (
            <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{feature}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
