
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCurrentOrganization, useUpdateOrganization } from "@/hooks/useOrganization";
import { TeamManagement } from "./TeamManagement";
import { OrganizationOverview } from "./OrganizationOverview";
import { AlertTriangle, Loader2 } from "lucide-react";

export const OrganizationSettings = () => {
  const { data: currentOrg, isLoading, error } = useCurrentOrganization();
  const updateOrganization = useUpdateOrganization();
  
  const [name, setName] = useState(currentOrg?.name || "");
  const [slug, setSlug] = useState(currentOrg?.slug || "");

  // Update local state when org data loads
  useEffect(() => {
    if (currentOrg) {
      setName(currentOrg.name);
      setSlug(currentOrg.slug || "");
    }
  }, [currentOrg]);

  const handleSave = async () => {
    if (!currentOrg?.id) return;
    
    await updateOrganization.mutateAsync({
      id: currentOrg.id,
      updates: { name, slug: slug || null }
    });
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Organization Error:</strong> {error instanceof Error ? error.message : String(error)}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!currentOrg) {
    return (
      <div className="space-y-6">
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>No Organization Found:</strong> You don't appear to be part of an organization. 
            This might be a data sync issue. Try refreshing the page or contact support if the problem persists.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OrganizationOverview />
      
      <Card>
        <CardHeader>
          <CardTitle>Organization Settings</CardTitle>
          <CardDescription>
            Manage your organization's basic information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSlug(generateSlug(e.target.value));
              }}
              placeholder="Enter organization name"
            />
          </div>
          <div>
            <Label htmlFor="org-slug">Organization Slug</Label>
            <Input
              id="org-slug"
              value={slug}
              onChange={(e) => setSlug(generateSlug(e.target.value))}
              placeholder="organization-slug"
            />
            <p className="text-sm text-gray-500 mt-1">
              This will be used in URLs and must be unique
            </p>
          </div>
          <Button 
            onClick={handleSave}
            disabled={updateOrganization.isPending || !name.trim()}
          >
            {updateOrganization.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      <TeamManagement />
    </div>
  );
};
