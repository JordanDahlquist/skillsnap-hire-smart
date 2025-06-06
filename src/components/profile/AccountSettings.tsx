
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle, Shield, LogOut } from 'lucide-react';

export const AccountSettings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both password fields match.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setPasswordLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully.',
      });

      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update password',
        variant: 'destructive',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
      toast({
        title: 'Confirmation text incorrect',
        description: 'Please type "DELETE MY ACCOUNT" exactly as shown.',
        variant: 'destructive',
      });
      return;
    }

    setDeleteLoading(true);

    try {
      // Delete user profile and related data
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user?.id);

      if (profileError) {
        console.warn('Profile deletion error:', profileError);
      }

      // Delete user jobs
      const { error: jobsError } = await supabase
        .from('jobs')
        .delete()
        .eq('user_id', user?.id);

      if (jobsError) {
        console.warn('Jobs deletion error:', jobsError);
      }

      // Delete applications to user's jobs
      const { error: applicationsError } = await supabase
        .from('applications')
        .delete()
        .in('job_id', 
          (await supabase
            .from('jobs')
            .select('id')
            .eq('user_id', user?.id)
          ).data?.map(job => job.id) || []
        );

      if (applicationsError) {
        console.warn('Applications deletion error:', applicationsError);
      }

      // Finally, delete the user account
      const { error: authError } = await supabase.auth.admin.deleteUser(user?.id || '');

      if (authError) {
        throw authError;
      }

      toast({
        title: 'Account deleted',
        description: 'Your account and all associated data have been permanently deleted.',
      });

      // Redirect to home page
      window.location.href = '/';
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete account. Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sign Out Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="w-5 h-5" />
            Sign Out
          </CardTitle>
          <CardDescription>
            End your current session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            You can sign out of your account at any time. You'll need to sign in again to access your dashboard.
          </p>
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your account password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="current_email">Current Email</Label>
              <Input
                id="current_email"
                value={user?.email || ''}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div>
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                minLength={6}
              />
            </div>

            <div>
              <Label htmlFor="confirm_password">Confirm New Password</Label>
              <Input
                id="confirm_password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                minLength={6}
              />
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={passwordLoading || !newPassword || !confirmPassword}
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your account details and status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>User ID</Label>
              <Input value={user?.id || ''} disabled className="bg-gray-50 font-mono text-sm" />
            </div>
            <div>
              <Label>Account Created</Label>
              <Input 
                value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''} 
                disabled 
                className="bg-gray-50" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50 mb-4">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Warning:</strong> This action is irreversible. Deleting your account will permanently remove:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Your profile information</li>
                <li>All job postings you've created</li>
                <li>All applications received</li>
                <li>Your profile picture and other uploaded files</li>
                <li>All account settings and preferences</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                Delete Account Permanently
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-600">
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p>
                    This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                  </p>
                  <p>
                    To confirm, please type <strong>"DELETE MY ACCOUNT"</strong> in the field below:
                  </p>
                  <Input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type: DELETE MY ACCOUNT"
                    className="mt-2"
                  />
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleAccountDeletion}
                  disabled={deleteLoading || deleteConfirmText !== 'DELETE MY ACCOUNT'}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleteLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Account'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};
