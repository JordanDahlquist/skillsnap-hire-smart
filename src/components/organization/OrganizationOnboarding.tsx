
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateOrganization } from "@/hooks/useOrganization";
import { useAuth } from "@/hooks/useAuth";
import { Building2, Users, ArrowRight } from "lucide-react";

interface OrganizationOnboardingProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OrganizationOnboarding = ({ isOpen, onComplete }: OrganizationOnboardingProps) => {
  const { organizationMembership, refreshProfile } = useAuth();
  const updateOrganization = useUpdateOrganization();
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setOrgName(name);
    setOrgSlug(generateSlug(name));
  };

  const handleComplete = async () => {
    if (!organizationMembership?.organization_id || !orgName.trim()) return;

    try {
      await updateOrganization.mutateAsync({
        id: organizationMembership.organization_id,
        updates: { 
          name: orgName.trim(), 
          slug: orgSlug.trim() || null 
        }
      });
      
      await refreshProfile();
      onComplete();
    } catch (error) {
      console.error('Error updating organization:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Welcome! Let's set up your organization
          </DialogTitle>
          <DialogDescription>
            You're almost ready to start using the platform. Let's personalize your organization.
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="org-name">Organization Name</Label>
                <Input
                  id="org-name"
                  value={orgName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter your organization name"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="org-slug">Organization URL Slug</Label>
                <Input
                  id="org-slug"
                  value={orgSlug}
                  onChange={(e) => setOrgSlug(generateSlug(e.target.value))}
                  placeholder="organization-slug"
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This will be used in URLs and must be unique
                </p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Skip for now
              </Button>
              <Button 
                onClick={() => setStep(2)}
                disabled={!orgName.trim()}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">You're all set!</h3>
                <p className="text-gray-600">
                  Your organization has been created and you're the owner. You can now start managing jobs and inviting team members.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleComplete}
                disabled={updateOrganization.isPending}
              >
                {updateOrganization.isPending ? 'Setting up...' : 'Get Started'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
