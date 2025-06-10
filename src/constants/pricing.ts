
import { Star, Users, Zap } from "lucide-react";

export const PRICING_PLANS = [
  {
    name: "Starter",
    price: "29",
    period: "month",
    description: "Perfect for small teams getting started with AI-powered hiring",
    features: [
      "Up to 3 active job postings",
      "100 applications per month",
      "AI resume analysis & scoring",
      "Basic email templates",
      "Standard support"
    ],
    ctaText: "Start 7-Day Free Trial",
    popular: false,
    color: "bg-gradient-to-br from-blue-50 to-indigo-100",
    buttonStyle: "bg-blue-600 hover:bg-blue-700",
    icon: Zap
  },
  {
    name: "Professional",
    price: "79",
    period: "month", 
    description: "Advanced features for growing teams that hire regularly",
    features: [
      "Up to 15 active job postings",
      "500 applications per month",
      "AI resume analysis & scoring",
      "Scout AI candidate search",
      "Advanced email automation",
      "Custom hiring workflows",
      "Priority support",
      "Analytics & reporting"
    ],
    ctaText: "Start 7-Day Free Trial",
    popular: true,
    color: "bg-gradient-to-br from-purple-50 to-pink-100",
    buttonStyle: "bg-purple-600 hover:bg-purple-700",
    icon: Star
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "Tailored solutions for large organizations with complex hiring needs",
    features: [
      "Unlimited job postings",
      "Unlimited applications",
      "AI resume analysis & scoring", 
      "Scout AI candidate search",
      "Advanced email automation",
      "Custom hiring workflows",
      "White-label options",
      "Dedicated account manager",
      "Custom integrations",
      "SLA & premium support"
    ],
    ctaText: "Contact Sales",
    popular: false,
    color: "bg-gradient-to-br from-gray-50 to-slate-100",
    buttonStyle: "bg-gray-800 hover:bg-gray-900",
    icon: Users
  }
];

export const PRICING_FEATURES = [
  "AI-Powered Resume Screening",
  "Automated Application Tracking",
  "Smart Email Templates",
  "Advanced Analytics Dashboard",
  "Custom Hiring Workflows",
  "Multi-Team Collaboration",
  "API Integrations",
  "Priority Customer Support"
];
