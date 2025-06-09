
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Clock, Users, Target, LogIn, Zap, Brain, TrendingUp, CheckCircle, Star, BarChart3, MessageSquare, Filter, Sparkles, Award, Shield, Rocket } from "lucide-react";
import { useState } from "react";
import { JobCreatorPanel } from "@/components/JobCreatorPanel";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { SolarSystemBackground } from "@/components/SolarSystemBackground";

const Index = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  const handleCreateRole = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowCreateModal(true);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Solar System Background */}
      <SolarSystemBackground />

      {/* Content Layer */}
      <div className="relative z-10 text-white">
        {/* Unified Header with dark theme */}
        <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
          <UnifiedHeader 
            onCreateRole={handleCreateRole}
            showCreateButton={true}
          />
        </div>

        {/* Enhanced Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center max-w-5xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
              </div>
              <span className="text-gray-300 text-sm">Trusted by 500+ companies</span>
            </div>
            
            <h1 className="text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight drop-shadow-lg">
              AI-Powered Hiring That
              <span className="text-[#007af6] drop-shadow-lg"> Actually Works</span>
            </h1>
            
            <p className="text-2xl text-gray-200 mb-6 leading-relaxed drop-shadow-sm max-w-4xl mx-auto">
              Create jobs in 2 minutes. Get AI-generated skill tests. Filter out 90% of bad applicants automatically. 
              Hire top talent in days, not weeks.
            </p>
            
            <div className="flex items-center justify-center gap-8 mb-8 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>5x faster hiring</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>90% fewer bad applicants</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Zero manual screening</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleCreateRole}
                size="lg" 
                className="bg-[#007af6] hover:bg-[#0056b3] text-white px-10 py-5 text-xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-200 hover:scale-105 rounded-xl"
              >
                <Rocket className="mr-3 w-6 h-6" />
                Start Hiring Smarter
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
              
              {!user && (
                <Button 
                  variant="outline"
                  asChild
                  size="lg" 
                  className="px-10 py-5 text-xl font-semibold border-white/30 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm rounded-xl"
                >
                  <a href="/auth">
                    <LogIn className="mr-3 w-6 h-6" />
                    Sign In
                  </a>
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Features at a Glance */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
              Everything you need to hire better, faster
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              From AI job creation to candidate analytics - Atract handles your entire hiring pipeline
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-white/20 bg-black/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-500/30 transition-colors">
                  <Brain className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">AI Job Creation</h3>
                <p className="text-gray-300 leading-relaxed">Create compelling job posts in 2 minutes. Our AI understands your requirements and crafts perfect descriptions that attract quality candidates.</p>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-black/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-500/30 transition-colors">
                  <Zap className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Smart Skill Testing</h3>
                <p className="text-gray-300 leading-relaxed">AI-generated, role-specific tests that actually measure what matters. No more interviews with unqualified candidates.</p>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-black/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-500/30 transition-colors">
                  <Filter className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Intelligent Filtering</h3>
                <p className="text-gray-300 leading-relaxed">Advanced dashboard with smart filters, bulk actions, and AI-powered candidate scoring. Manage hundreds of applications effortlessly.</p>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-black/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-orange-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-500/30 transition-colors">
                  <MessageSquare className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Scout AI</h3>
                <p className="text-gray-300 leading-relaxed">AI-powered candidate sourcing and chat. Find passive candidates and engage them with intelligent, personalized conversations.</p>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-black/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-cyan-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-cyan-500/30 transition-colors">
                  <BarChart3 className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Hiring Analytics</h3>
                <p className="text-gray-300 leading-relaxed">Deep insights into your hiring funnel. Track performance, identify bottlenecks, and optimize your process with data-driven decisions.</p>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-black/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-pink-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-pink-500/30 transition-colors">
                  <Award className="w-8 h-8 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Automated Communication</h3>
                <p className="text-gray-300 leading-relaxed">Smart email templates, bulk communications, and automated follow-ups. Keep candidates engaged while saving hours of manual work.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Enhanced Problem Section */}
        <section className="bg-black/30 backdrop-blur-sm py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
                The hiring nightmare every founder faces
              </h2>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                Traditional hiring is broken. You're drowning in unqualified applicants while the best candidates slip through the cracks.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              <Card className="border-red-500/30 bg-red-900/20 backdrop-blur-sm hover:shadow-xl transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-red-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Users className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Flooded with unqualified applicants</h3>
                  <p className="text-gray-300 leading-relaxed">Job boards bring quantity, not quality. You spend hours sifting through 200+ applications where 90% can't even do the basic requirements of the job.</p>
                </CardContent>
              </Card>

              <Card className="border-yellow-500/30 bg-yellow-900/20 backdrop-blur-sm hover:shadow-xl transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-yellow-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Interviews are massive time sinks</h3>
                  <p className="text-gray-300 leading-relaxed">Hours spent interviewing people who looked good on paper but can't actually perform. Your time is worth $500+/hour, not screening resumes.</p>
                </CardContent>
              </Card>

              <Card className="border-orange-500/30 bg-orange-900/20 backdrop-blur-sm hover:shadow-xl transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-orange-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Target className="w-8 h-8 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">No way to verify actual skills</h3>
                  <p className="text-gray-300 leading-relaxed">Resumes lie. Portfolios can be copied. Interviews can be gamed. You need to see real work quality before investing time in candidates.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Solution Workflow Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
              How Atract transforms your hiring
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              One intelligent platform. Four powerful steps. Zero time wasted on unqualified candidates.
            </p>
          </div>

          <div className="space-y-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="relative">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#007af6] rounded-full flex items-center justify-center text-white font-bold text-xl">1</div>
                  <Card className="bg-white/10 backdrop-blur-sm border border-white/20 p-8">
                    <div className="space-y-4">
                      <div className="h-4 bg-[#007af6] rounded w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-white/30 rounded w-1/2"></div>
                      <div className="h-4 bg-white/20 rounded w-5/6"></div>
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="h-3 bg-green-400 rounded w-full"></div>
                        <div className="h-3 bg-blue-400 rounded w-full"></div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h3 className="text-3xl font-bold text-white mb-6">Create your perfect job in 2 minutes</h3>
                <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                  Just input basic requirements. Our AI analyzes thousands of successful job posts to create compelling descriptions that attract the right candidates and repel the wrong ones.
                </p>
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#007af6]" />
                    <span>AI-optimized copy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    <span>Bias-free language</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="relative">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#007af6] rounded-full flex items-center justify-center text-white font-bold text-xl">2</div>
                  <Card className="bg-white/10 backdrop-blur-sm border border-white/20 p-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Brain className="w-6 h-6 text-purple-400" />
                        <span className="text-white font-semibold">AI Skill Test Generator</span>
                      </div>
                      <div className="h-4 bg-purple-400 rounded w-full"></div>
                      <div className="h-4 bg-white/30 rounded w-4/5"></div>
                      <div className="h-4 bg-white/20 rounded w-3/5"></div>
                      <div className="mt-6 p-4 bg-green-500/20 rounded border border-green-500/30">
                        <div className="h-3 bg-green-400 rounded w-2/3"></div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-6">AI generates role-specific skill tests</h3>
                <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                  No generic coding challenges. Our AI creates tests that mirror real work scenarios for your specific role. Only candidates who can actually do the job will pass.
                </p>
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    <span>Role-specific challenges</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span>Predictive scoring</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="relative">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#007af6] rounded-full flex items-center justify-center text-white font-bold text-xl">3</div>
                  <Card className="bg-white/10 backdrop-blur-sm border border-white/20 p-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-white font-semibold">Applications: 147</span>
                        <span className="text-green-400 font-semibold">Qualified: 12</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-3 bg-green-500/20 rounded border border-green-500/30">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <div className="h-3 bg-green-400 rounded flex-1"></div>
                          <span className="text-green-400 text-sm">95%</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-green-500/20 rounded border border-green-500/30">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <div className="h-3 bg-green-400 rounded flex-1"></div>
                          <span className="text-green-400 text-sm">89%</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-red-500/20 rounded border border-red-500/30">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          <div className="h-3 bg-red-400 rounded flex-1"></div>
                          <span className="text-red-400 text-sm">23%</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h3 className="text-3xl font-bold text-white mb-6">Get only qualified applicants</h3>
                <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                  Public job page with built-in testing. Candidates self-select out if they can't do the work. You only see applications from people who've proven they can deliver.
                </p>
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-blue-400" />
                    <span>90% noise reduction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>Pre-validated skills</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="relative">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#007af6] rounded-full flex items-center justify-center text-white font-bold text-xl">4</div>
                  <Card className="bg-white/10 backdrop-blur-sm border border-white/20 p-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <BarChart3 className="w-6 h-6 text-cyan-400" />
                        <span className="text-white font-semibold">Hiring Dashboard</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="h-8 bg-gradient-to-t from-blue-600 to-blue-400 rounded mb-2"></div>
                          <div className="h-2 bg-white/30 rounded w-full"></div>
                        </div>
                        <div className="text-center">
                          <div className="h-12 bg-gradient-to-t from-green-600 to-green-400 rounded mb-2"></div>
                          <div className="h-2 bg-white/30 rounded w-full"></div>
                        </div>
                        <div className="text-center">
                          <div className="h-6 bg-gradient-to-t from-purple-600 to-purple-400 rounded mb-2"></div>
                          <div className="h-2 bg-white/30 rounded w-full"></div>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-blue-500/20 rounded">
                        <div className="h-3 bg-blue-400 rounded w-4/5"></div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-6">Manage and analyze with AI insights</h3>
                <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                  Powerful dashboard with smart filtering, bulk actions, and deep analytics. Track your hiring funnel, identify top performers, and make data-driven hiring decisions.
                </p>
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                    <span>Performance analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-orange-400" />
                    <span>Automated communication</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="bg-black/20 backdrop-blur-sm py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
                Join 500+ companies hiring smarter
              </h2>
              <p className="text-xl text-gray-200">
                From startups to enterprises - see why teams choose Atract
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#007af6] mb-2">5x</div>
                <div className="text-white font-semibold mb-1">Faster Hiring</div>
                <div className="text-gray-400 text-sm">Average time to hire</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#007af6] mb-2">90%</div>
                <div className="text-white font-semibold mb-1">Noise Reduction</div>
                <div className="text-gray-400 text-sm">Fewer unqualified applicants</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#007af6] mb-2">15hrs</div>
                <div className="text-white font-semibold mb-1">Time Saved</div>
                <div className="text-gray-400 text-sm">Per open position</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#007af6] mb-2">95%</div>
                <div className="text-white font-semibold mb-1">Success Rate</div>
                <div className="text-gray-400 text-sm">Successful hires after 6 months</div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="border-white/20 bg-white/5 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-4">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  </div>
                  <p className="text-gray-200 mb-4 text-lg leading-relaxed">
                    "Atract cut our hiring time from 6 weeks to 10 days. The AI-generated tests are incredibly accurate - we've had zero bad hires since switching."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">SL</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">Sarah Lee</div>
                      <div className="text-gray-400 text-sm">VP Engineering, TechCorp</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/20 bg-white/5 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-4">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  </div>
                  <p className="text-gray-200 mb-4 text-lg leading-relaxed">
                    "The quality difference is night and day. Before Atract, 80% of our interviews were wastes of time. Now every candidate is pre-qualified and ready to perform."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">MJ</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">Marcus Johnson</div>
                      <div className="text-gray-400 text-sm">Founder, StartupXYZ</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-16 border border-white/20 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#007af6]/10 to-purple-600/10 rounded-3xl"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#007af6]/20 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-600/20 to-transparent rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">
                Ready to revolutionize your hiring?
              </h2>
              <p className="text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
                Join 500+ companies that have transformed their hiring with AI. 
                Create your first role and start getting qualified candidates in minutes.
              </p>
              
              <div className="flex items-center justify-center gap-6 mb-8">
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>2-minute setup</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>No credit card required</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button 
                  onClick={handleCreateRole}
                  size="lg" 
                  className="bg-[#007af6] hover:bg-[#0056b3] text-white px-12 py-6 text-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-200 hover:scale-105 rounded-2xl"
                >
                  <Rocket className="mr-4 w-7 h-7" />
                  Start Your First Hire
                  <ArrowRight className="ml-4 w-7 h-7" />
                </Button>
                
                {!user && (
                  <Button 
                    variant="outline"
                    asChild
                    size="lg" 
                    className="px-12 py-6 text-xl font-semibold border-white/30 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm rounded-2xl"
                  >
                    <a href="/auth">
                      <LogIn className="mr-4 w-6 h-6" />
                      Sign In
                    </a>
                  </Button>
                )}
              </div>
              
              <p className="text-gray-400 text-sm mt-8">
                Trusted by 500+ companies • Average setup time: 2 minutes • 95% customer satisfaction
              </p>
            </div>
          </div>
        </section>
      </div>

      <JobCreatorPanel open={showCreateModal} onOpenChange={setShowCreateModal} />
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
};

export default Index;
