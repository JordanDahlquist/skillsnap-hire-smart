
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Clock, Users, Target, LogIn, Zap, Brain, TrendingUp, CheckCircle, Star, BarChart3, MessageSquare, Filter, Sparkles, Award, Shield, Rocket } from "lucide-react";
import { useState } from "react";
import { JobCreatorPanel } from "@/components/JobCreatorPanel";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
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

  const handleGetStarted = () => {
    if (!user) {
      navigate('/signup');
    } else {
      setShowCreateModal(true);
    }
  };

  return (
    <div className="min-h-screen cosmos-flowers-background relative overflow-hidden">
      {/* Ambient Background Effects - Enhanced for cosmos flowers background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-pink-400/15 to-purple-400/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-300/10 to-pink-300/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10">
        {/* Unified Header */}
        <UnifiedHeader onCreateRole={handleCreateRole} showCreateButton={true} />

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-24 pb-32">
          <div className="text-center max-w-6xl mx-auto">
            {/* Hero Content */}
            <div className="backdrop-blur-xl bg-white/25 border border-white/40 rounded-3xl shadow-2xl shadow-black/10 p-12 md:p-16 relative overflow-hidden">
              {/* Glass overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/15 to-white/5 rounded-3xl"></div>
              
              <div className="relative z-10">
                <h1 className="text-6xl lg:text-8xl font-bold text-slate-900 mb-10 leading-tight tracking-tight">
                  AI-Powered Hiring That
                  <span className="block bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent mt-4">
                    Actually Works
                  </span>
                </h1>
                
                <p className="text-2xl lg:text-3xl text-slate-700 mb-8 leading-relaxed max-w-5xl mx-auto font-light">
                  Create jobs in 2 minutes. Get AI-generated skill tests. Filter out 90% of bad applicants automatically. 
                  Hire top talent in days, not weeks.
                </p>
                
                <div className="flex items-center justify-center gap-12 mb-12 text-lg text-slate-600">
                  <div className="flex items-center gap-3 backdrop-blur-sm bg-white/50 px-6 py-3 rounded-2xl border border-white/50">
                    <CheckCircle className="w-6 h-6 text-emerald-500 drop-shadow-sm" />
                    <span className="font-medium">5x faster hiring</span>
                  </div>
                  <div className="flex items-center gap-3 backdrop-blur-sm bg-white/50 px-6 py-3 rounded-2xl border border-white/50">
                    <CheckCircle className="w-6 h-6 text-emerald-500 drop-shadow-sm" />
                    <span className="font-medium">90% fewer bad applicants</span>
                  </div>
                  <div className="flex items-center gap-3 backdrop-blur-sm bg-white/50 px-6 py-3 rounded-2xl border border-white/50">
                    <CheckCircle className="w-6 h-6 text-emerald-500 drop-shadow-sm" />
                    <span className="font-medium">Zero manual screening</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <Button 
                    onClick={handleGetStarted} 
                    size="lg" 
                    className="group liquid-glass-button liquid-ripple-effect backdrop-blur-xl bg-gradient-to-br from-blue-500/40 via-cyan-500/35 to-indigo-600/40 hover:from-blue-500/50 hover:via-cyan-500/45 hover:to-indigo-600/50 text-white px-16 py-8 text-2xl font-bold shadow-3xl border-2 border-white/30 hover:border-white/40 rounded-4xl transition-all duration-500 hover:scale-105 hover:shadow-[0_40px_80px_-12px_rgba(59,130,246,0.4),0_0_0_1px_rgba(255,255,255,0.2)_inset] active:scale-95"
                  >
                    <Rocket className="mr-4 w-8 h-8 group-hover:rotate-12 transition-transform duration-300" />
                    Start Hiring Smarter
                    <ArrowRight className="ml-4 w-8 h-8 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                  
                  {!user && (
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/auth')} 
                      size="lg" 
                      className="backdrop-blur-xl bg-white/30 border-2 border-white/50 text-slate-700 hover:bg-white/40 hover:text-slate-900 px-16 py-8 text-xl font-semibold rounded-4xl transition-all duration-500 hover:scale-105 shadow-2xl hover:shadow-3xl"
                    >
                      <LogIn className="mr-4 w-7 h-7" />
                      Sign In
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features at a Glance */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-8 tracking-tight">
              Everything you need to hire better, faster
            </h2>
            <p className="text-2xl text-slate-600 max-w-4xl mx-auto font-light">
              From AI job creation to candidate analytics - Atract handles your entire hiring pipeline
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="backdrop-blur-xl bg-white/25 border border-white/40 shadow-2xl shadow-black/10 rounded-3xl overflow-hidden group hover:scale-105 transition-all duration-300 hover:shadow-3xl">
              <CardContent className="p-10 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-blue-500/10 rounded-3xl"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500/25 to-blue-600/35 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg border border-white/30">
                    <Brain className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">AI Job Creation</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">Create compelling job posts in 2 minutes. Our AI understands your requirements and crafts perfect descriptions that attract quality candidates.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-white/25 border border-white/40 shadow-2xl shadow-black/10 rounded-3xl overflow-hidden group hover:scale-105 transition-all duration-300 hover:shadow-3xl">
              <CardContent className="p-10 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-purple-500/10 rounded-3xl"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500/25 to-purple-600/35 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg border border-white/30">
                    <Zap className="w-10 h-10 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Smart Skill Testing</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">AI-generated, role-specific tests that actually measure what matters. No more interviews with unqualified candidates.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-white/25 border border-white/40 shadow-2xl shadow-black/10 rounded-3xl overflow-hidden group hover:scale-105 transition-all duration-300 hover:shadow-3xl">
              <CardContent className="p-10 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-emerald-500/10 rounded-3xl"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/25 to-emerald-600/35 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg border border-white/30">
                    <Filter className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Intelligent Filtering</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">Advanced dashboard with smart filters, bulk actions, and AI-powered candidate scoring. Manage hundreds of applications effortlessly.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-white/25 border border-white/40 shadow-2xl shadow-black/10 rounded-3xl overflow-hidden group hover:scale-105 transition-all duration-300 hover:shadow-3xl">
              <CardContent className="p-10 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-orange-500/10 rounded-3xl"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500/25 to-orange-600/35 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg border border-white/30">
                    <MessageSquare className="w-10 h-10 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Scout AI</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">AI-powered candidate sourcing and chat. Find passive candidates and engage them with intelligent, personalized conversations.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-white/25 border border-white/40 shadow-2xl shadow-black/10 rounded-3xl overflow-hidden group hover:scale-105 transition-all duration-300 hover:shadow-3xl">
              <CardContent className="p-10 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-cyan-500/10 rounded-3xl"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/25 to-cyan-600/35 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg border border-white/30">
                    <BarChart3 className="w-10 h-10 text-cyan-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Hiring Analytics</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">Deep insights into your hiring funnel. Track performance, identify bottlenecks, and optimize your process with data-driven decisions.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-white/25 border border-white/40 shadow-2xl shadow-black/10 rounded-3xl overflow-hidden group hover:scale-105 transition-all duration-300 hover:shadow-3xl">
              <CardContent className="p-10 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-pink-500/10 rounded-3xl"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-500/25 to-pink-600/35 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg border border-white/30">
                    <Award className="w-10 h-10 text-pink-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Automated Communication</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">Smart email templates, bulk communications, and automated follow-ups. Keep candidates engaged while saving hours of manual work.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/10 via-red-900/10 to-orange-900/10 backdrop-blur-3xl"></div>
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-8 tracking-tight">
                The hiring nightmare every founder faces
              </h2>
              <p className="text-2xl text-slate-600 max-w-4xl mx-auto font-light">
                Traditional hiring is broken. You're drowning in unqualified applicants while the best candidates slip through the cracks.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              <Card className="backdrop-blur-xl bg-white/20 border border-red-200/60 shadow-2xl shadow-red-500/10 rounded-3xl overflow-hidden">
                <CardContent className="p-10 text-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/15 via-transparent to-red-500/10 rounded-3xl"></div>
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500/25 to-red-600/35 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg border border-white/30">
                      <Users className="w-10 h-10 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Flooded with unqualified applicants</h3>
                    <p className="text-slate-600 leading-relaxed text-lg">Job boards bring quantity, not quality. You spend hours sifting through 200+ applications where 90% can't even do the basic requirements of the job.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-white/20 border border-yellow-200/60 shadow-2xl shadow-yellow-500/10 rounded-3xl overflow-hidden">
                <CardContent className="p-10 text-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/15 via-transparent to-yellow-500/10 rounded-3xl"></div>
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-500/25 to-yellow-600/35 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg border border-white/30">
                      <Clock className="w-10 h-10 text-yellow-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Interviews are massive time sinks</h3>
                    <p className="text-slate-600 leading-relaxed text-lg">Hours spent interviewing people who looked good on paper but can't actually perform. Your time is worth $500+/hour, not screening resumes.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-white/20 border border-orange-200/60 shadow-2xl shadow-orange-500/10 rounded-3xl overflow-hidden">
                <CardContent className="p-10 text-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/15 via-transparent to-orange-500/10 rounded-3xl"></div>
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500/25 to-orange-600/35 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg border border-white/30">
                      <Target className="w-10 h-10 text-orange-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">No way to verify actual skills</h3>
                    <p className="text-slate-600 leading-relaxed text-lg">Resumes lie. Portfolios can be copied. Interviews can be gamed. You need to see real work quality before investing time in candidates.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Solution Workflow Section */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-8 tracking-tight">
              How Atract transforms your hiring
            </h2>
            <p className="text-2xl text-slate-600 max-w-4xl mx-auto font-light">
              One intelligent platform. Four powerful steps. Zero time wasted on unqualified candidates.
            </p>
          </div>

          <div className="space-y-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="relative">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#007af6] rounded-full flex items-center justify-center text-white font-bold text-xl">1</div>
                  <Card className="bg-white border border-gray-200 p-8 shadow-lg">
                    <div className="space-y-4">
                      <div className="h-4 bg-[#007af6] rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="h-3 bg-green-400 rounded w-full"></div>
                        <div className="h-3 bg-blue-400 rounded w-full"></div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Create your perfect job in 2 minutes</h3>
                <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                  Just input basic requirements. Our AI analyzes thousands of successful job posts to create compelling descriptions that attract the right candidates and repel the wrong ones.
                </p>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#007af6]" />
                    <span>AI-optimized copy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    <span>Bias-free language</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="relative">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#007af6] rounded-full flex items-center justify-center text-white font-bold text-xl">2</div>
                  <Card className="bg-white border border-gray-200 p-8 shadow-lg">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Brain className="w-6 h-6 text-purple-600" />
                        <span className="text-gray-900 font-semibold">AI Skill Test Generator</span>
                      </div>
                      <div className="h-4 bg-purple-400 rounded w-full"></div>
                      <div className="h-4 bg-gray-300 rounded w-4/5"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/5"></div>
                      <div className="mt-6 p-4 bg-green-500/20 rounded border border-green-500/30">
                        <div className="h-3 bg-green-500 rounded w-2/3"></div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">AI generates role-specific skill tests</h3>
                <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                  No generic coding challenges. Our AI creates tests that mirror real work scenarios for your specific role. Only candidates who can actually do the job will pass.
                </p>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    <span>Role-specific challenges</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span>Predictive scoring</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="relative">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#007af6] rounded-full flex items-center justify-center text-white font-bold text-xl">3</div>
                  <Card className="bg-white border border-gray-200 p-8 shadow-lg">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-900 font-semibold">Applications: 147</span>
                        <span className="text-green-600 font-semibold">Qualified: 12</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-3 bg-green-500/20 rounded border border-green-500/30">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div className="h-3 bg-green-500 rounded flex-1"></div>
                          <span className="text-green-600 text-sm">95%</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-green-500/20 rounded border border-green-500/30">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div className="h-3 bg-green-500 rounded flex-1"></div>
                          <span className="text-green-600 text-sm">89%</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-red-500/20 rounded border border-red-500/30">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="h-3 bg-red-500 rounded flex-1"></div>
                          <span className="text-red-600 text-sm">23%</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Get only qualified applicants</h3>
                <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                  Public job page with built-in testing. Candidates self-select out if they can't do the work. You only see applications from people who've proven they can deliver.
                </p>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-blue-600" />
                    <span>90% noise reduction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Pre-validated skills</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="relative">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#007af6] rounded-full flex items-center justify-center text-white font-bold text-xl">4</div>
                  <Card className="bg-white border border-gray-200 p-8 shadow-lg">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <BarChart3 className="w-6 h-6 text-cyan-600" />
                        <span className="text-gray-900 font-semibold">Hiring Dashboard</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="h-8 bg-gradient-to-t from-blue-600 to-blue-400 rounded mb-2"></div>
                          <div className="h-2 bg-gray-300 rounded w-full"></div>
                        </div>
                        <div className="text-center">
                          <div className="h-12 bg-gradient-to-t from-green-600 to-green-400 rounded mb-2"></div>
                          <div className="h-2 bg-gray-300 rounded w-full"></div>
                        </div>
                        <div className="text-center">
                          <div className="h-6 bg-gradient-to-t from-purple-600 to-purple-400 rounded mb-2"></div>
                          <div className="h-2 bg-gray-300 rounded w-full"></div>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-blue-500/20 rounded">
                        <div className="h-3 bg-blue-500 rounded w-4/5"></div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Manage and analyze with AI insights</h3>
                <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                  Powerful dashboard with smart filtering, bulk actions, and deep analytics. Track your hiring funnel, identify top performers, and make data-driven hiring decisions.
                </p>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-600" />
                    <span>Performance analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-orange-600" />
                    <span>Automated communication</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
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
              <div className="text-center">
                <div className="text-4xl font-bold text-[#007af6] mb-2">5x</div>
                <div className="text-gray-900 font-semibold mb-1">Faster Hiring</div>
                <div className="text-gray-600 text-sm">Average time to hire</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#007af6] mb-2">90%</div>
                <div className="text-gray-900 font-semibold mb-1">Noise Reduction</div>
                <div className="text-gray-600 text-sm">Fewer unqualified applicants</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#007af6] mb-2">15hrs</div>
                <div className="text-gray-900 font-semibold mb-1">Time Saved</div>
                <div className="text-gray-600 text-sm">Per open position</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#007af6] mb-2">95%</div>
                <div className="text-gray-900 font-semibold mb-1">Success Rate</div>
                <div className="text-gray-600 text-sm">Successful hires after 6 months</div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="border-gray-200 bg-white shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-4">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  </div>
                  <p className="text-gray-700 mb-4 text-lg leading-relaxed">
                    "Atract cut our hiring time from 6 weeks to 10 days. The AI-generated tests are incredibly accurate - we've had zero bad hires since switching."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">SL</span>
                    </div>
                    <div>
                      <div className="text-gray-900 font-semibold">Sarah Lee</div>
                      <div className="text-gray-600 text-sm">VP Engineering, TechCorp</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-white shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-4">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  </div>
                  <p className="text-gray-700 mb-4 text-lg leading-relaxed">
                    "The quality difference is night and day. Before Atract, 80% of our interviews were wastes of time. Now every candidate is pre-qualified and ready to perform."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">MJ</span>
                    </div>
                    <div>
                      <div className="text-gray-900 font-semibold">Marcus Johnson</div>
                      <div className="text-gray-600 text-sm">Founder, StartupXYZ</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24">
          <div className="text-center backdrop-blur-xl bg-white/25 border border-white/40 rounded-3xl shadow-2xl shadow-black/10 p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/15 to-white/5 rounded-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-8 tracking-tight">
                Ready to revolutionize your hiring?
              </h2>
              <p className="text-2xl lg:text-3xl text-slate-700 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
                Join 500+ companies that have transformed their hiring with AI. 
                Create your first role and start getting qualified candidates in minutes.
              </p>
              
              <div className="flex items-center justify-center gap-12 mb-12">
                <div className="flex items-center gap-3 backdrop-blur-sm bg-white/50 px-6 py-3 rounded-2xl border border-white/50">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                  <span className="text-slate-600 font-medium">Free to start</span>
                </div>
                <div className="flex items-center gap-3 backdrop-blur-sm bg-white/50 px-6 py-3 rounded-2xl border border-white/50">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                  <span className="text-slate-600 font-medium">2-minute setup</span>
                </div>
                <div className="flex items-center gap-3 backdrop-blur-sm bg-white/50 px-6 py-3 rounded-2xl border border-white/50">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                  <span className="text-slate-600 font-medium">No credit card required</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                <Button 
                  onClick={handleGetStarted} 
                  size="lg" 
                  className="group liquid-glass-button liquid-ripple-effect backdrop-blur-xl bg-gradient-to-br from-blue-500/40 via-cyan-500/35 to-indigo-600/40 hover:from-blue-500/50 hover:via-cyan-500/45 hover:to-indigo-600/50 text-white px-20 py-10 text-2xl font-bold shadow-3xl border-2 border-white/30 hover:border-white/40 rounded-4xl transition-all duration-500 hover:scale-105 hover:shadow-[0_40px_80px_-12px_rgba(59,130,246,0.4),0_0_0_1px_rgba(255,255,255,0.2)_inset] active:scale-95"
                >
                  <Rocket className="mr-4 w-8 h-8 group-hover:rotate-12 transition-transform duration-300" />
                  Start Your First Hire
                  <ArrowRight className="ml-4 w-8 h-8 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
                
                {!user && (
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/auth')} 
                    size="lg" 
                    className="backdrop-blur-xl bg-white/30 border-2 border-white/50 text-slate-700 hover:bg-white/40 hover:text-slate-900 px-20 py-10 text-xl font-semibold rounded-4xl transition-all duration-500 hover:scale-105 shadow-2xl hover:shadow-3xl"
                  >
                    <LogIn className="mr-4 w-7 h-7" />
                    Sign In
                  </Button>
                )}
              </div>
              
              <p className="text-slate-500 text-lg mt-12 font-light">
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
