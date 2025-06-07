
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentOrganization, useUpdateOrganization } from "@/hooks/useOrganization";
import { Building2, Save } from "lucide-react";

export const OrganizationSettings = () => {
  const { data: currentOrg, isLoading } = useCurrentOrganization();
  const updateOrganization = useUpdateOrganization();
  
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

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

  const hasChanges = name !== currentOrg.name || slug !== (currentOrg.slug || "");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Organization Settings
        </CardTitle>
        <CardDescription>
          Manage your organization's basic information and settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slug || slug === generateSlug(currentOrg.name)) {
                  setSlug(generateSlug(e.target.value));
                }
              }}
              placeholder="Enter organization name"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="org-slug">Organization Slug</Label>
            <Input
              id="org-slug"
              value={slug}
              onChange={(e) => setSlug(generateSlug(e.target.value))}
              placeholder="organization-slug"
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              This will be used in URLs and must be unique
            </p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={updateOrganization.isPending || !name.trim() || !hasChanges}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {updateOrganization.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
