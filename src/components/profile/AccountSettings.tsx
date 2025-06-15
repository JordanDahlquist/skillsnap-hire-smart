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
      // Note: In a production app, account deletion should be handled by a server-side function
      // This is a simplified implementation
      toast({
        title: 'Account deletion requested',
        description: 'Please contact support to complete account deletion.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete account. Please contact support.',
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
                className="bg-muted text-muted-foreground"
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
              <Input value={user?.id || ''} disabled className="bg-muted text-muted-foreground font-mono text-sm" />
            </div>
            <div>
              <Label>Account Created</Label>
              <Input 
                value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''} 
                disabled 
                className="bg-muted text-muted-foreground" 
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
              <strong>Warning:</strong> This action is irreversible. Please contact support for account deletion.
            </AlertDescription>
          </Alert>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                Request Account Deletion
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-600">
                  Request Account Deletion?
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p>
                    This will request the permanent deletion of your account and all associated data.
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
                      Requesting...
                    </>
                  ) : (
                    'Request Deletion'
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
