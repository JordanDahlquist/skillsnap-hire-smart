
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Building, Settings, Camera } from 'lucide-react';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { AccountSettings } from '@/components/profile/AccountSettings';
import { HiringPreferences } from '@/components/profile/HiringPreferences';
import { ProfilePictureUpload } from '@/components/profile/ProfilePictureUpload';
import { UnifiedHeader } from '@/components/UnifiedHeader';

export const ProfileSettings = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnifiedHeader 
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Profile Settings", isCurrentPage: true }
          ]}
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnifiedHeader 
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Profile Settings", isCurrentPage: true }
          ]}
        />
        <div className="flex items-center justify-center py-12">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You must be logged in to access your profile settings.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedHeader 
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Profile Settings", isCurrentPage: true }
        ]}
      />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Picture Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProfilePictureUpload />
              </CardContent>
            </Card>
          </div>

          {/* Main Settings */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Hiring
                </TabsTrigger>
                <TabsTrigger value="account" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Account
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-6">
                <ProfileForm />
              </TabsContent>

              <TabsContent value="preferences" className="mt-6">
                <HiringPreferences />
              </TabsContent>

              <TabsContent value="account" className="mt-6">
                <AccountSettings />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};
