
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export const SocialProofSection = () => {
  const stats = [
    { value: "5x", label: "Faster Hiring", sublabel: "Average time to hire" },
    { value: "90%", label: "Noise Reduction", sublabel: "Fewer unqualified applicants" },
    { value: "15hrs", label: "Time Saved", sublabel: "Per open position" },
    { value: "95%", label: "Success Rate", sublabel: "Successful hires after 6 months" }
  ];

  const testimonials = [
    {
      text: "Atract cut our hiring time from 6 weeks to 10 days. The AI-generated tests are incredibly accurate - we've had zero bad hires since switching.",
      author: "Sarah Lee",
      title: "VP Engineering, TechCorp",
      initials: "SL",
      gradient: "from-blue-400 to-purple-500"
    },
    {
      text: "The quality difference is night and day. Before Atract, 80% of our interviews were wastes of time. Now every candidate is pre-qualified and ready to perform.",
      author: "Marcus Johnson",
      title: "Founder, StartupXYZ",
      initials: "MJ",
      gradient: "from-green-400 to-blue-500"
    }
  ];

  return (
    <section className="bg-blue-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Join 500+ companies hiring smarter
          </h2>
          <p className="text-xl text-gray-600">
            From startups to enterprises - see why teams choose Atract
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-[#007af6] mb-2">{stat.value}</div>
              <div className="text-gray-900 font-semibold mb-1">{stat.label}</div>
              <div className="text-gray-600 text-sm">{stat.sublabel}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-gray-200 bg-white shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 text-lg leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${testimonial.gradient} rounded-full flex items-center justify-center`}>
                    <span className="text-white font-bold">{testimonial.initials}</span>
                  </div>
                  <div>
                    <div className="text-gray-900 font-semibold">{testimonial.author}</div>
                    <div className="text-gray-600 text-sm">{testimonial.title}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
