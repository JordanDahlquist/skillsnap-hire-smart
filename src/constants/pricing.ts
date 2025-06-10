
import { Rocket, Crown, Building } from "lucide-react";

export const PRICING_PLANS = [
  {
    name: "Starter",
    price: "29",
    period: "month",
    description: "Perfect for small teams and startups",
    icon: Rocket,
    color: "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50",
    buttonStyle: "bg-blue-600 hover:bg-blue-700",
    features: [
      "Up to 3 active job postings",
      "AI job description generator",
      "Basic skill tests",
      "100 applications per month",
      "Email support",
      "Basic analytics",
      "Public job page",
      "Applicant filtering"
    ],
    limitations: [],
    ctaText: "Start Free Trial"
  },
  {
    name: "Professional",
    price: "79",
    period: "month",
    description: "For growing companies that hire regularly",
    icon: Crown,
    color: "border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50",
    buttonStyle: "bg-purple-600 hover:bg-purple-700",
    popular: true,
    features: [
      "Up to 15 active job postings",
      "Advanced AI test generation",
      "Custom skill assessments",
      "500 applications per month",
      "Priority support",
      "Advanced analytics & reporting",
      "Scout AI candidate sourcing",
      "Bulk actions & automation",
      "Custom email templates",
      "Video interview scheduling",
      "API access",
      "Team collaboration tools"
    ],
    limitations: [],
    ctaText: "Start Free Trial"
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations with complex needs",
    icon: Building,
    color: "border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50",
    buttonStyle: "bg-gray-900 hover:bg-gray-800",
    features: [
      "Unlimited job postings",
      "Custom AI model training",
      "Advanced integration options",
      "Unlimited applications",
      "Dedicated account manager",
      "Custom analytics dashboard",
      "White-label solutions",
      "Advanced security features",
      "Custom workflows",
      "SLA guarantee",
      "On-premise deployment option",
      "24/7 phone support"
    ],
    limitations: [],
    ctaText: "Contact Sales"
  }
];

export const PRICING_FEATURES = [
  "AI-Powered Job Creation",
  "Smart Skill Testing",
  "Intelligent Filtering",
  "Scout AI Sourcing",
  "Advanced Analytics",
  "Automated Communication",
  "Video Interviews",
  "Team Collaboration"
];

export const PRICING_FAQS = [
  {
    q: "How does the free trial work?",
    a: "Start with a 14-day free trial - no credit card required. You'll have full access to all features in your chosen plan."
  },
  {
    q: "Can I change plans at any time?",
    a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate the billing."
  },
  {
    q: "What kind of support do you offer?",
    a: "All plans include email support. Professional plans get priority support, and Enterprise gets dedicated account management."
  },
  {
    q: "How does the AI testing work?",
    a: "Our AI analyzes your job requirements and creates custom skill tests that mirror real work scenarios. This ensures only qualified candidates pass through."
  },
  {
    q: "Is there a setup fee?",
    a: "No setup fees, ever. You only pay the monthly subscription fee for your chosen plan."
  }
];
