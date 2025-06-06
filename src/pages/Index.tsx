import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Clock, Users, Target, Zap, User, LogOut } from "lucide-react";
import { useState } from "react";
import { CreateRoleModal } from "@/components/CreateRoleModal";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, loading, signOut } = useAuth();

  const handleCreateRole = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowCreateModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SkillSnap</span>
            </div>
            <div className="flex items-center gap-4">
              {loading ? null : user ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    {user.email}
                  </div>
                  <Button 
                    variant="outline"
                    onClick={signOut}
                    size="sm"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                  <Button 
                    onClick={handleCreateRole}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Create a Role
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => setShowAuthModal(true)}
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={handleCreateRole}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Create a Role
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Stop wasting time on
            <span className="text-purple-600"> bad hires</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Test, filter, and hire the best freelancers and contractors in minutes, not hours. 
            Skip the noise, skip the interviews, get straight to the talent.
          </p>
          <Button 
            onClick={handleCreateRole}
            size="lg" 
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg"
          >
            Create a Role <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Problem Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            The hiring problem every founder knows
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Flooded with bad applicants</h3>
              <p className="text-gray-600">Job boards bring quantity, not quality. 90% of applications are unqualified noise.</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Interviews are time sinks</h3>
              <p className="text-gray-600">Hours spent interviewing people who can't actually do the job. Your time is too valuable.</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No way to test real skills</h3>
              <p className="text-gray-600">Resumes lie. Portfolios can be borrowed. You need to see actual work quality.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Solution Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How SkillSnap solves it
            </h2>
            <p className="text-xl text-gray-600">
              One simple workflow. Five powerful features. Zero time wasted.
            </p>
          </div>

          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Create your job in 2 minutes</h3>
                <p className="text-gray-600 mb-4">
                  Simple form captures role details. Our AI understands what you need and helps craft the perfect job description.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-purple-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="space-y-3">
                    <div className="h-4 bg-purple-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/5"></div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">2. AI generates smart tests</h3>
                <p className="text-gray-600 mb-4">
                  Role-specific challenges that actually test the skills you need. No generic questions, no time wasted.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Get qualified applicants only</h3>
                <p className="text-gray-600 mb-4">
                  Public job page with built-in test. Only serious candidates who can do the work will complete it.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="space-y-3">
                  <div className="h-4 bg-green-200 rounded w-full"></div>
                  <div className="h-4 bg-green-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center bg-purple-50 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to hire smarter?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Create your first role and start getting quality applicants in minutes.
          </p>
          <Button 
            onClick={handleCreateRole}
            size="lg" 
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg"
          >
            Create a Role <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      <CreateRoleModal open={showCreateModal} onOpenChange={setShowCreateModal} />
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
};

export default Index;
