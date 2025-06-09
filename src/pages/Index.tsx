
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Clock, Users, Target, LogIn, Zap, Brain, TrendingUp, CheckCircle, Star, BarChart3, MessageSquare, Filter, Sparkles, Award, Shield, Rocket, Bot, Search, UserCheck, Calendar, PieChart, UsersRound } from "lucide-react";
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

        {/* Enhanced Hero Section - Atract-focused */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center max-w-5xl mx-auto">
            {/* Hero Content with Subtle Dark Haze */}
            <div className="relative">
              {/* Subtle dark haze background */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/20 backdrop-blur-sm rounded-3xl -m-8 md:-m-12"></div>
              
              {/* Hero content */}
              <div className="relative z-10 px-8 md:px-12 py-8">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  </div>
                  <span className="text-gray-300 text-sm">Atract trusted by 500+ companies</span>
                </div>

                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#007af6] to-purple-600 rounded-2xl flex items-center justify-center">
                    <Rocket className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-lg text-[#007af6] font-semibold">Atract Platform</p>
                    <p className="text-sm text-gray-300">Powered by Scout AI</p>
                  </div>
                </div>
                
                <h1 className="text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight drop-shadow-lg">
                  Modern Hiring Platform
                  <span className="text-[#007af6] drop-shadow-lg"> Powered by AI</span>
                </h1>
                
                <p className="text-2xl text-gray-200 mb-6 leading-relaxed drop-shadow-sm max-w-4xl mx-auto">
                  Complete hiring solution with built-in AI agent Scout. Manage your entire hiring workflow while Scout AI finds, engages, and pre-qualifies candidates automatically.
                  Focus on final interviews while our platform handles everything else.
                </p>
                
                <div className="flex items-center justify-center gap-8 mb-8 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-[#007af6]" />
                    <span>Complete hiring platform</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-purple-400" />
                    <span>Built-in Scout AI agent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span>End-to-end automation</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button 
                    onClick={handleCreateRole}
                    size="lg" 
                    className="bg-[#007af6] hover:bg-[#0056b3] text-white px-10 py-5 text-xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-200 hover:scale-105 rounded-xl"
                  >
                    <Rocket className="mr-3 w-6 h-6" />
                    Start Hiring with Atract
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
            </div>
          </div>
        </section>

        {/* Atract's Complete Platform Capabilities */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
              Atract's Complete Hiring Suite
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Everything you need to hire efficiently, from AI-powered candidate sourcing to analytics - all in one integrated platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Scout AI Agent - Featured but not overwhelming */}
            <Card className="border-[#007af6]/30 bg-gradient-to-br from-[#007af6]/20 to-purple-600/20 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#007af6] to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Scout AI Agent</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Built-in AI agent that actively sources candidates, runs conversations, conducts assessments, and delivers pre-qualified talent to your pipeline.
                </p>
                <div className="flex items-center gap-2 text-sm text-[#007af6]">
                  <Search className="w-4 h-4" />
                  <span>24/7 AI sourcing & screening</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-black/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-500/30 transition-colors">
                  <UsersRound className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Candidate Pipeline</h3>
                <p className="text-gray-300 leading-relaxed">Organize and track candidates through every stage with collaborative hiring tools and automated workflows.</p>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-black/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-500/30 transition-colors">
                  <Calendar className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Interview Coordination</h3>
                <p className="text-gray-300 leading-relaxed">Streamline scheduling, coordinate with team members, and track interview feedback all in one place.</p>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-black/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-500/30 transition-colors">
                  <Brain className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">AI Job Creation</h3>
                <p className="text-gray-300 leading-relaxed">Generate compelling job posts and role-specific assessments with AI assistance tailored to your requirements.</p>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-black/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-cyan-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-cyan-500/30 transition-colors">
                  <PieChart className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Analytics Dashboard</h3>
                <p className="text-gray-300 leading-relaxed">Track hiring metrics, candidate quality, team performance, and optimize your hiring process with data-driven insights.</p>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-black/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-orange-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-500/30 transition-colors">
                  <Shield className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Team Collaboration</h3>
                <p className="text-gray-300 leading-relaxed">Enable seamless collaboration with hiring managers, interviewers, and stakeholders throughout the process.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Problem Section - Atract as Solution */}
        <section className="bg-black/30 backdrop-blur-sm py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
                Why traditional hiring fails in the modern world
              </h2>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                Atract solves these fundamental hiring challenges with modern tools and AI automation
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              <Card className="border-red-500/30 bg-red-900/20 backdrop-blur-sm hover:shadow-xl transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-red-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Users className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Passive candidates are unreachable</h3>
                  <p className="text-gray-300 leading-relaxed">The best talent isn't actively job hunting. Atract's Scout AI proactively engages these candidates 24/7 while you focus on other priorities.</p>
                </CardContent>
              </Card>

              <Card className="border-yellow-500/30 bg-yellow-900/20 backdrop-blur-sm hover:shadow-xl transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-yellow-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Manual screening is too slow</h3>
                  <p className="text-gray-300 leading-relaxed">Atract automates candidate screening and qualification, so top talent is identified and engaged before competitors can react.</p>
                </CardContent>
              </Card>

              <Card className="border-orange-500/30 bg-orange-900/20 backdrop-blur-sm hover:shadow-xl transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-orange-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Target className="w-8 h-8 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">No way to rank talent quality</h3>
                  <p className="text-gray-300 leading-relaxed">Atract's AI evaluates skills, culture fit, and success probability, providing predictive scoring to identify the best candidates.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Atract Workflow Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
              How Atract transforms your hiring workflow
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              From job creation to final offer - Atract provides the complete hiring platform with Scout AI handling the heavy lifting
            </p>
          </div>

          <div className="space-y-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="relative">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#007af6] rounded-full flex items-center justify-center text-white font-bold text-xl">1</div>
                  <Card className="bg-white/10 backdrop-blur-sm border border-white/20 p-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Brain className="w-6 h-6 text-[#007af6]" />
                        <span className="text-white font-semibold">Create Job with AI</span>
                      </div>
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
                <h3 className="text-3xl font-bold text-white mb-6">Create optimized jobs instantly</h3>
                <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                  Atract's AI helps create compelling job descriptions and generates role-specific assessments. Scout AI then begins sourcing candidates across multiple channels automatically.
                </p>
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#007af6]" />
                    <span>AI job optimization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-purple-400" />
                    <span>Scout AI sourcing</span>
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
                        <UsersRound className="w-6 h-6 text-green-400" />
                        <span className="text-white font-semibold">Manage Candidate Pipeline</span>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 bg-green-500/20 rounded-lg border-l-4 border-green-400">
                          <div className="h-3 bg-green-400 rounded w-4/5"></div>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-lg border-l-4 border-blue-400">
                          <div className="h-3 bg-blue-400 rounded w-3/5"></div>
                        </div>
                        <div className="p-3 bg-purple-500/20 rounded-lg border-l-4 border-purple-400">
                          <div className="h-3 bg-purple-400 rounded w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-6">Track candidates through every stage</h3>
                <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                  Atract provides complete pipeline management while Scout AI continuously feeds qualified candidates into your workflow, complete with assessments and rankings.
                </p>
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-green-400" />
                    <span>Automated filtering</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    <span>AI ranking</span>
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
                      <div className="flex items-center gap-3 mb-4">
                        <Calendar className="w-6 h-6 text-cyan-400" />
                        <span className="text-white font-semibold">Coordinate Interviews</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-3 bg-cyan-500/20 rounded border border-cyan-500/30">
                          <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                          <div className="h-3 bg-cyan-400 rounded flex-1"></div>
                          <span className="text-cyan-400 text-sm">Scheduled</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-green-500/20 rounded border border-green-500/30">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <div className="h-3 bg-green-400 rounded flex-1"></div>
                          <span className="text-green-400 text-sm">Completed</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h3 className="text-3xl font-bold text-white mb-6">Streamline interview coordination</h3>
                <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                  Atract handles scheduling, team coordination, and feedback collection. Focus on the interviews while the platform manages logistics and tracks progress.
                </p>
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    <span>Smart scheduling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-green-400" />
                    <span>Team collaboration</span>
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
                        <Award className="w-6 h-6 text-yellow-400" />
                        <span className="text-white font-semibold">Make Data-Driven Decisions</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-400 rounded-full"></div>
                            <div>
                              <div className="h-3 bg-green-400 rounded w-24 mb-1"></div>
                              <div className="h-2 bg-green-300 rounded w-16"></div>
                            </div>
                          </div>
                          <div className="text-green-400 font-bold">95%</div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-400 rounded-full"></div>
                            <div>
                              <div className="h-3 bg-blue-400 rounded w-24 mb-1"></div>
                              <div className="h-2 bg-blue-300 rounded w-16"></div>
                            </div>
                          </div>
                          <div className="text-blue-400 font-bold">87%</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-6">Hire with confidence using analytics</h3>
                <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                  Atract provides comprehensive analytics and insights. Scout AI's predictive scoring helps you identify the best candidates and optimize your hiring process continuously.
                </p>
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    <span>Performance analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <span>Predictive insights</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section - Atract focused */}
        <section className="bg-black/20 backdrop-blur-sm py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
                Why 500+ companies choose Atract for hiring
              </h2>
              <p className="text-xl text-gray-200">
                From startups to enterprises - see the results teams achieve with Atract's AI-powered platform
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#007af6] mb-2">10x</div>
                <div className="text-white font-semibold mb-1">Faster Sourcing</div>
                <div className="text-gray-400 text-sm">With Scout AI automation</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#007af6] mb-2">90%</div>
                <div className="text-white font-semibold mb-1">Time Savings</div>
                <div className="text-gray-400 text-sm">On screening & coordination</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#007af6] mb-2">95%</div>
                <div className="text-white font-semibold mb-1">Quality Score</div>
                <div className="text-gray-400 text-sm">Of AI-recommended hires</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#007af6] mb-2">24/7</div>
                <div className="text-white font-semibold mb-1">AI Working</div>
                <div className="text-gray-400 text-sm">Continuous candidate engagement</div>
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
                    "Atract transformed our hiring process completely. The Scout AI finds amazing candidates we never would have reached, and the platform handles everything seamlessly. We hired our best developer in just 5 days."
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
                    "Atract's Scout AI works around the clock building our pipeline while we focus on interviews. The analytics help us continuously improve our process. It's like having a full hiring team that never sleeps."
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

        {/* Final CTA Section - Atract focused */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-16 border border-white/20 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#007af6]/10 to-purple-600/10 rounded-3xl"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#007af6]/20 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-600/20 to-transparent rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#007af6] to-purple-600 rounded-2xl flex items-center justify-center">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-2xl text-[#007af6] font-bold">Atract Platform</p>
                  <p className="text-gray-300">Powered by Scout AI</p>
                </div>
              </div>
              
              <h2 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">
                Ready to transform your hiring with Atract?
              </h2>
              <p className="text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
                Join 500+ companies using the complete hiring platform. Get Scout AI sourcing, intelligent pipeline management, 
                team collaboration, and analytics - all working together to find your best hires.
              </p>
              
              <div className="flex items-center justify-center gap-6 mb-8">
                <div className="flex items-center gap-2 text-gray-300">
                  <Rocket className="w-5 h-5 text-[#007af6]" />
                  <span>Complete hiring platform</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Bot className="w-5 h-5 text-purple-400" />
                  <span>Scout AI included</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Setup in minutes</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button 
                  onClick={handleCreateRole}
                  size="lg" 
                  className="bg-[#007af6] hover:bg-[#0056b3] text-white px-12 py-6 text-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-200 hover:scale-105 rounded-2xl"
                >
                  <Rocket className="mr-4 w-7 h-7" />
                  Start with Atract
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
                Trusted by 500+ companies • Complete hiring platform • Scout AI included • 95% satisfaction rate
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
