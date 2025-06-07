
import { useState, useEffect } from "react";
import { authService } from "@/services/authService";

interface OrganizationMembership {
  id: string;
  organization_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  organization: {
    id: string;
    name: string;
    slug: string | null;
  };
}

export const useOrganizationMembership = (userId: string | undefined) => {
  const [organizationMembership, setOrganizationMembership] = useState<OrganizationMembership | null>(null);
  const [loading, setLoading] = useState(false);

  const loadOrganizationMembership = async (id: string) => {
    setLoading(true);
    try {
      const membershipData = await authService.fetchOrganizationMembership(id);
      setOrganizationMembership(membershipData);
      console.log('Organization membership loaded:', membershipData?.role || 'No membership');
    } catch (error) {
      console.warn('Failed to load organization membership:', error);
      setOrganizationMembership(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadOrganizationMembership(userId);
    } else {
      setOrganizationMembership(null);
      setLoading(false);
    }
  }, [userId]);

  const refreshOrganization = () => {
    if (userId) {
      loadOrganizationMembership(userId);
    }
  };

  return {
    organizationMembership,
    loading,
    refreshOrganization
  };
};
