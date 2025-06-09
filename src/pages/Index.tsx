
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Clock, Users, Target, LogIn } from "lucide-react";
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

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
              Stop wasting time on
              <span className="text-[#007af6] drop-shadow-lg"> bad hires</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed drop-shadow-sm">
              Test, filter, and hire the best freelancers and contractors in minutes, not hours. 
              Skip the noise, skip the interviews, get straight to the talent.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleCreateRole}
                size="lg" 
                className="bg-[#007af6] hover:bg-[#0056b3] text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Create a Role <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              {!user && (
                <Button 
                  variant="outline"
                  asChild
                  size="lg" 
                  className="px-8 py-4 text-lg border-white/30 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
                >
                  <a href="/auth">
                    <LogIn className="mr-2 w-5 h-5" />
                    Sign In
                  </a>
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
              The hiring problem every founder knows
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-white/20 bg-black/20 backdrop-blur-sm hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-red-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Flooded with bad applicants</h3>
                <p className="text-gray-300">Job boards bring quantity, not quality. 90% of applications are unqualified noise.</p>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-black/20 backdrop-blur-sm hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-yellow-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Interviews are time sinks</h3>
                <p className="text-gray-300">Hours spent interviewing people who can't actually do the job. Your time is too valuable.</p>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-black/20 backdrop-blur-sm hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No way to test real skills</h3>
                <p className="text-gray-300">Resumes lie. Portfolios can be borrowed. You need to see actual work quality.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Solution Section */}
        <section className="bg-black/20 backdrop-blur-sm py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
                How Atract solves it
              </h2>
              <p className="text-xl text-gray-200">
                One simple workflow. Five powerful features. Zero time wasted.
              </p>
            </div>

            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">1. Create your job in 2 minutes</h3>
                  <p className="text-gray-300 mb-4">
                    Simple form captures role details. Our AI understands what you need and helps craft the perfect job description.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-white/20">
                  <div className="space-y-3">
                    <div className="h-4 bg-white/20 rounded w-3/4"></div>
                    <div className="h-4 bg-white/20 rounded w-1/2"></div>
                    <div className="h-4 bg-[#007af6] rounded w-2/3"></div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-white/20">
                    <div className="space-y-3">
                      <div className="h-4 bg-[#007af6] rounded w-full"></div>
                      <div className="h-4 bg-white/20 rounded w-4/5"></div>
                      <div className="h-4 bg-white/20 rounded w-3/5"></div>
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <h3 className="text-2xl font-bold text-white mb-4">2. AI generates smart tests</h3>
                  <p className="text-gray-300 mb-4">
                    Role-specific challenges that actually test the skills you need. No generic questions, no time wasted.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">3. Get qualified applicants only</h3>
                  <p className="text-gray-300 mb-4">
                    Public job page with built-in test. Only serious candidates who can do the work will complete it.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-white/20">
                  <div className="space-y-3">
                    <div className="h-4 bg-green-400 rounded w-full"></div>
                    <div className="h-4 bg-green-400 rounded w-3/4"></div>
                    <div className="h-4 bg-white/20 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
              Ready to hire smarter?
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              Create your first role and start getting quality applicants in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleCreateRole}
                size="lg" 
                className="bg-[#007af6] hover:bg-[#0056b3] text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Create a Role <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              {!user && (
                <Button 
                  variant="outline"
                  asChild
                  size="lg" 
                  className="px-8 py-4 text-lg border-white/30 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
                >
                  <a href="/auth">
                    <LogIn className="mr-2 w-5 h-5" />
                    Sign In
                  </a>
                </Button>
              )}
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
