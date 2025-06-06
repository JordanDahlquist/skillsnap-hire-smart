
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const preferencesSchema = z.object({
  default_location: z.string().optional(),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

export const HiringPreferences = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      default_location: profile?.default_location || '',
    },
  });

  const onSubmit = async (data: PreferencesFormData) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          default_location: data.default_location || null,
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="default_location">Default Location</Label>
            <Input
              id="default_location"
              placeholder="e.g., San Francisco, CA or Remote"
              {...register('default_location')}
              className={errors.default_location ? 'border-red-500' : ''}
            />
            <p className="text-sm text-gray-500 mt-1">
              This will be pre-filled when creating new job postings
            </p>
            {errors.default_location && (
              <p className="text-sm text-red-600 mt-1">{errors.default_location.message}</p>
            )}
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
