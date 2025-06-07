
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentOrganization, useUpdateOrganization } from "@/hooks/useOrganization";
import { TeamManagement } from "./TeamManagement";

export const OrganizationSettings = () => {
  const { data: currentOrg, isLoading } = useCurrentOrganization();
  const updateOrganization = useUpdateOrganization();
  
  const [name, setName] = useState(currentOrg?.name || "");
  const [slug, setSlug] = useState(currentOrg?.slug || "");

  // Update local state when org data loads
  useState(() => {
    if (currentOrg) {
      setName(currentOrg.name);
      setSlug(currentOrg.slug || "");
    }
  });

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
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!currentOrg) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">No organization found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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
