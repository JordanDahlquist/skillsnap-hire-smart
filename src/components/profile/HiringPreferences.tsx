
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export const HiringPreferences = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultLocation, setDefaultLocation] = useState(profile?.default_location || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          default_location: defaultLocation || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Preferences updated',
        description: 'Your hiring preferences have been saved successfully.',
      });

      // Reload the page to refresh the profile data
      window.location.reload();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update preferences',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hiring Preferences</CardTitle>
        <CardDescription>
          Set your default preferences for job postings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="default_location">Default Location</Label>
            <Input
              id="default_location"
              placeholder="e.g., San Francisco, CA or Remote"
              value={defaultLocation}
              onChange={(e) => setDefaultLocation(e.target.value)}
            />
            <p className="text-sm text-gray-500 mt-1">
              This will be pre-filled when creating new job postings
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Preferences'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
