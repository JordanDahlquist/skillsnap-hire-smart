
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Clock, Users, Target, LogIn, Zap, Brain, TrendingUp, CheckCircle, Star, BarChart3, MessageSquare, Filter, Sparkles, Award, Shield, Rocket, Bot, Search, UserCheck } from "lucide-react";
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

        {/* Enhanced Hero Section - Scout-focused */}
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
                  <span className="text-gray-300 text-sm">Scout AI trusted by 500+ companies</span>
                </div>

                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#007af6] to-purple-600 rounded-2xl flex items-center justify-center">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-lg text-[#007af6] font-semibold">Meet Scout</p>
                    <p className="text-sm text-gray-300">Your AI Hiring Agent</p>
                  </div>
                </div>
                
                <h1 className="text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight drop-shadow-lg">
                  Scout Finds, Ranks & Delivers
                  <span className="text-[#007af6] drop-shadow-lg"> Top Talent to You</span>
                </h1>
                
                <p className="text-2xl text-gray-200 mb-6 leading-relaxed drop-shadow-sm max-w-4xl mx-auto">
                  Modern hiring powered by AI. Scout works 24/7 to source candidates, engage talent, run assessments, and rank applicants. 
                  You only see pre-qualified, interview-ready candidates who Scout has already vetted.
                </p>
                
                <div className="flex items-center justify-center gap-8 mb-8 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-[#007af6]" />
                    <span>Scout works 24/7</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-green-400" />
                    <span>Only pre-qualified candidates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    <span>Predictive talent ranking</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button 
                    onClick={handleCreateRole}
                    size="lg" 
                    className="bg-[#007af6] hover:bg-[#0056b3] text-white px-10 py-5 text-xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-200 hover:scale-105 rounded-xl"
                  >
                    <Bot className="mr-3 w-6 h-6" />
                    Meet Scout
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

        {/* Scout's Capabilities - Leading with Scout */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
              How Scout revolutionizes your hiring
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Scout is your intelligent hiring agent that actively finds, evaluates, and delivers the best candidates - not just a tool that helps
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Scout - Primary Feature */}
            <Card className="border-[#007af6]/30 bg-gradient-to-br from-[#007af6]/20 to-purple-600/20 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 group lg:col-span-3 md:col-span-2">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#007af6] to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Scout AI - Your Intelligent Hiring Agent</h3>
                <p className="text-gray-200 leading-relaxed text-lg mb-6">
                  Scout doesn't just help you hire - Scout actively hires for you. Using advanced AI, Scout sources candidates from multiple channels, 
                  engages them with intelligent conversations, runs comprehensive assessments, and delivers only the top-ranked, interview-ready talent to your inbox.
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-[#007af6]">
                    <Search className="w-4 h-4" />
                    <span>Active Candidate Sourcing</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#007af6]">
                    <MessageSquare className="w-4 h-4" />
                    <span>AI-Powered Conversations</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#007af6]">
                    <TrendingUp className="w-4 h-4" />
                    <span>Predictive Talent Ranking</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-black/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-500/30 transition-colors">
                  <Brain className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">AI Job Creation</h3>
                <p className="text-gray-300 leading-relaxed">Scout helps create compelling job posts that attract quality candidates and automatically generates role-specific assessments.</p>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-black/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-500/30 transition-colors">
                  <Filter className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Intelligent Filtering</h3>
                <p className="text-gray-300 leading-relaxed">Scout's AI automatically filters and ranks candidates, so you only review top talent who have already been pre-qualified.</p>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-black/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-cyan-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-cyan-500/30 transition-colors">
                  <BarChart3 className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Hiring Analytics</h3>
                <p className="text-gray-300 leading-relaxed">Scout provides deep insights into candidate quality, hiring velocity, and process optimization with predictive analytics.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Enhanced Problem Section - Scout as Solution */}
        <section className="bg-black/30 backdrop-blur-sm py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
                Why traditional hiring fails in the modern world
              </h2>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                While you're drowning in unqualified applicants, the best candidates are being engaged by AI-powered competitors
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              <Card className="border-red-500/30 bg-red-900/20 backdrop-blur-sm hover:shadow-xl transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-red-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Users className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Passive candidates are unreachable</h3>
                  <p className="text-gray-300 leading-relaxed">The best talent isn't actively job hunting. While you wait for applications, competitors with AI agents are already engaging these candidates 24/7.</p>
                </CardContent>
              </Card>

              <Card className="border-yellow-500/30 bg-yellow-900/20 backdrop-blur-sm hover:shadow-xl transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-yellow-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Manual screening is too slow</h3>
                  <p className="text-gray-300 leading-relaxed">By the time you manually review applications and schedule interviews, top candidates have already accepted offers elsewhere. Speed wins.</p>
                </CardContent>
              </Card>

              <Card className="border-orange-500/30 bg-orange-900/20 backdrop-blur-sm hover:shadow-xl transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-orange-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Target className="w-8 h-8 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">No way to rank talent quality</h3>
                  <p className="text-gray-300 leading-relaxed">Without predictive scoring, you're guessing which candidates will perform. You need AI to evaluate skills, culture fit, and success probability.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Scout Solution Workflow Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
              How Scout transforms hiring from reactive to proactive
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Scout doesn't wait for applications. Scout actively finds, engages, and qualifies the best talent before your competitors even know they exist.
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
                        <Bot className="w-6 h-6 text-[#007af6]" />
                        <span className="text-white font-semibold">Scout Activates</span>
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
                <h3 className="text-3xl font-bold text-white mb-6">Scout creates your perfect job & starts hunting</h3>
                <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                  Input basic requirements and Scout instantly creates compelling job descriptions, generates role-specific assessments, and begins actively sourcing candidates across multiple channels.
                </p>
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#007af6]" />
                    <span>AI job optimization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-green-400" />
                    <span>Multi-channel sourcing</span>
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
                        <MessageSquare className="w-6 h-6 text-purple-400" />
                        <span className="text-white font-semibold">Scout Engages Candidates</span>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 bg-[#007af6]/20 rounded-lg border-l-4 border-[#007af6]">
                          <div className="h-3 bg-[#007af6] rounded w-4/5"></div>
                        </div>
                        <div className="p-3 bg-green-500/20 rounded-lg border-l-4 border-green-400">
                          <div className="h-3 bg-green-400 rounded w-3/5"></div>
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
                <h3 className="text-3xl font-bold text-white mb-6">Scout engages passive talent with intelligent conversations</h3>
                <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                  Scout doesn't wait for applications. It proactively reaches out to passive candidates, starts intelligent conversations, and qualifies interest - all while you sleep.
                </p>
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-purple-400" />
                    <span>24/7 candidate engagement</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-green-400" />
                    <span>Intelligent conversations</span>
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
                        <span className="text-white font-semibold">Scout's Assessment</span>
                        <span className="text-green-400 font-semibold">Auto-Scoring</span>
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
                        <div className="flex items-center gap-3 p-3 bg-yellow-500/20 rounded border border-yellow-500/30">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <div className="h-3 bg-yellow-400 rounded flex-1"></div>
                          <span className="text-yellow-400 text-sm">67%</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h3 className="text-3xl font-bold text-white mb-6">Scout evaluates & ranks every candidate</h3>
                <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                  Scout runs comprehensive assessments, evaluates skills and culture fit, and assigns predictive success scores. Only the top-ranked candidates make it to your review queue.
                </p>
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-400" />
                    <span>AI skill assessment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span>Predictive scoring</span>
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
                        <UserCheck className="w-6 h-6 text-cyan-400" />
                        <span className="text-white font-semibold">Pre-Qualified Candidates</span>
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
                        <div className="flex items-center justify-between p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-400 rounded-full"></div>
                            <div>
                              <div className="h-3 bg-green-400 rounded w-24 mb-1"></div>
                              <div className="h-2 bg-green-300 rounded w-16"></div>
                            </div>
                          </div>
                          <div className="text-green-400 font-bold">92%</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-6">You only see interview-ready candidates</h3>
                <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                  Scout delivers a curated list of top candidates who have already been sourced, engaged, assessed, and ranked. Skip the noise and go straight to final interviews with confidence.
                </p>
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-cyan-400" />
                    <span>Interview-ready talent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    <span>Pre-validated skills</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section - Scout focused */}
        <section className="bg-black/20 backdrop-blur-sm py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
                Scout is revolutionizing how 500+ companies hire
              </h2>
              <p className="text-xl text-gray-200">
                From startups to enterprises - see why teams trust Scout to find their best hires
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#007af6] mb-2">10x</div>
                <div className="text-white font-semibold mb-1">More Candidates</div>
                <div className="text-gray-400 text-sm">Scout finds vs traditional methods</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#007af6] mb-2">24/7</div>
                <div className="text-white font-semibold mb-1">Active Sourcing</div>
                <div className="text-gray-400 text-sm">Scout never stops working</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#007af6] mb-2">90%</div>
                <div className="text-white font-semibold mb-1">Time Reduction</div>
                <div className="text-gray-400 text-sm">In candidate screening</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#007af6] mb-2">97%</div>
                <div className="text-white font-semibold mb-1">Success Rate</div>
                <div className="text-gray-400 text-sm">Of Scout-recommended hires</div>
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
                    "Scout found and engaged our best developer before we even posted the job. The candidate was already pre-qualified and culture-fit tested. We went from job req to signed offer in 5 days."
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
                    "Scout works while we sleep. It's engaging passive candidates, running assessments, and building our pipeline 24/7. We've hired our last 3 senior roles from Scout's recommendations - all A+ players."
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

        {/* Final CTA Section - Scout focused */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-16 border border-white/20 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#007af6]/10 to-purple-600/10 rounded-3xl"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#007af6]/20 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-600/20 to-transparent rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#007af6] to-purple-600 rounded-2xl flex items-center justify-center">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-2xl text-[#007af6] font-bold">Meet Scout</p>
                  <p className="text-gray-300">Your AI Hiring Agent</p>
                </div>
              </div>
              
              <h2 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">
                Ready to let Scout do the hiring for you?
              </h2>
              <p className="text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
                Join 500+ companies that have transformed their hiring with Scout. 
                Let AI find, engage, and qualify candidates while you focus on final interviews and closing offers.
              </p>
              
              <div className="flex items-center justify-center gap-6 mb-8">
                <div className="flex items-center gap-2 text-gray-300">
                  <Bot className="w-5 h-5 text-[#007af6]" />
                  <span>Scout works 24/7</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <UserCheck className="w-5 h-5 text-green-400" />
                  <span>Only pre-qualified candidates</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>No setup required</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button 
                  onClick={handleCreateRole}
                  size="lg" 
                  className="bg-[#007af6] hover:bg-[#0056b3] text-white px-12 py-6 text-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-200 hover:scale-105 rounded-2xl"
                >
                  <Bot className="mr-4 w-7 h-7" />
                  Activate Scout
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
                Trusted by 500+ companies • Scout activates in 2 minutes • 97% customer satisfaction
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
