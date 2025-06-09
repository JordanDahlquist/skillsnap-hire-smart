
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Mail, Copy, Check } from 'lucide-react';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ProfilePictureUpload } from './ProfilePictureUpload';

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Consulting',
  'Real Estate',
  'Media & Entertainment',
  'Non-profit',
  'Government',
  'Other'
];

export const ProfileForm = () => {
  const { user, profile, profileLoading } = useOptimizedAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    company_name: '',
    job_title: '',
    phone: '',
    company_website: '',
    default_location: '',
    industry: '',
    profile_picture_url: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        company_name: profile.company_name || '',
        job_title: profile.job_title || '',
        phone: profile.phone || '',
        company_website: profile.company_website || '',
        default_location: profile.default_location || '',
        industry: profile.industry || '',
        profile_picture_url: profile.profile_picture_url || ''
      });
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user?.id) throw new Error('No user found');
      
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const copyToClipboard = () => {
    if (profile?.unique_email) {
      navigator.clipboard.writeText(profile.unique_email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Email copied",
        description: "Your unique email address has been copied to clipboard.",
      });
    }
  };

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Unique Email Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Your Unique Email Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Private
            </Badge>
            <code className="flex-1 text-sm font-mono bg-white px-2 py-1 rounded border">
              {profile?.unique_email || 'Loading...'}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="h-8"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            This is your private email address for communicating with candidates. 
            All replies will be routed to your inbox on this platform.
          </p>
        </CardContent>
      </Card>

      <Separator />

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <ProfilePictureUpload
              currentUrl={formData.profile_picture_url}
              onUpload={(url) => handleInputChange('profile_picture_url', url)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  placeholder="Enter your company name"
                />
              </div>

              <div>
                <Label htmlFor="job_title">Job Title</Label>
                <Input
                  id="job_title"
                  value={formData.job_title}
                  onChange={(e) => handleInputChange('job_title', e.target.value)}
                  placeholder="Enter your job title"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <Label htmlFor="company_website">Company Website</Label>
                <Input
                  id="company_website"
                  type="url"
                  value={formData.company_website}
                  onChange={(e) => handleInputChange('company_website', e.target.value)}
                  placeholder="https://www.yourcompany.com"
                />
              </div>

              <div>
                <Label htmlFor="default_location">Default Location</Label>
                <Input
                  id="default_location"
                  value={formData.default_location}
                  onChange={(e) => handleInputChange('default_location', e.target.value)}
                  placeholder="City, State/Country"
                />
              </div>

              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => handleInputChange('industry', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="w-full"
            >
              {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
