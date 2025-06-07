
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useOrganizationMembers, useInvitations, useSendInvitation, useUpdateMemberRole, useRemoveMember } from "@/hooks/useInvitations";
import { useCurrentOrganization } from "@/hooks/useOrganization";
import { useAuth } from "@/hooks/useAuth";
import { Plus, MoreHorizontal, UserPlus, Crown, Shield, Edit, Eye } from "lucide-react";

export const TeamManagement = () => {
  const { user } = useAuth();
  const { data: currentOrg } = useCurrentOrganization();
  const { data: members = [] } = useOrganizationMembers(currentOrg?.id);
  const { data: invitations = [] } = useInvitations(currentOrg?.id);
  const sendInvitation = useSendInvitation();
  const updateMemberRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');
  const [showInviteForm, setShowInviteForm] = useState(false);

  const currentUserMembership = members.find(m => m.user_id === user?.id);
  const canManageTeam = currentUserMembership?.role === 'owner' || currentUserMembership?.role === 'admin';

  const handleSendInvitation = async () => {
    if (!currentOrg?.id || !inviteEmail) return;
    
    await sendInvitation.mutateAsync({
      organizationId: currentOrg.id,
      email: inviteEmail,
      role: inviteRole,
    });
    
    setInviteEmail("");
    setInviteRole('viewer');
    setShowInviteForm(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4" />;
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'editor': return <Edit className="w-4 h-4" />;
      case 'viewer': return <Eye className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'editor': return 'bg-green-100 text-green-800 border-green-200';
      case 'viewer': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage your organization's team members and their roles
              </CardDescription>
            </div>
            {canManageTeam && (
              <Button onClick={() => setShowInviteForm(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current Members */}
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {member.profiles?.full_name?.charAt(0) || member.profiles?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">
                      {member.profiles?.full_name || 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-500">{member.profiles?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getRoleColor(member.role)}>
                    {getRoleIcon(member.role)}
                    <span className="ml-1 capitalize">{member.role}</span>
                  </Badge>
                  {canManageTeam && member.role !== 'owner' && member.user_id !== user?.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => updateMemberRole.mutate({ 
                            membershipId: member.id, 
                            role: 'admin' 
                          })}
                          disabled={member.role === 'admin'}
                        >
                          Make Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => updateMemberRole.mutate({ 
                            membershipId: member.id, 
                            role: 'editor' 
                          })}
                          disabled={member.role === 'editor'}
                        >
                          Make Editor
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => updateMemberRole.mutate({ 
                            membershipId: member.id, 
                            role: 'viewer' 
                          })}
                          disabled={member.role === 'viewer'}
                        >
                          Make Viewer
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onSelect={(e) => e.preventDefault()}
                            >
                              Remove Member
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {member.profiles?.full_name || member.profiles?.email} from the organization? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => removeMember.mutate(member.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}

            {/* Pending Invitations */}
            {invitations.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Pending Invitations</h4>
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <UserPlus className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <p className="text-sm text-gray-500">Invitation pending</p>
                      </div>
                    </div>
                    <Badge className={getRoleColor(invitation.role)}>
                      {getRoleIcon(invitation.role)}
                      <span className="ml-1 capitalize">{invitation.role}</span>
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Invite Form */}
            {showInviteForm && (
              <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-3">Invite New Member</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="invite-email">Email Address</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="Enter email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="invite-role">Role</Label>
                    <Select value={inviteRole} onValueChange={(value: 'admin' | 'editor' | 'viewer') => setInviteRole(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer - Can view jobs and applications</SelectItem>
                        <SelectItem value="editor">Editor - Can create and edit jobs</SelectItem>
                        <SelectItem value="admin">Admin - Can manage everything except billing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleSendInvitation}
                      disabled={!inviteEmail || sendInvitation.isPending}
                    >
                      {sendInvitation.isPending ? 'Sending...' : 'Send Invitation'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowInviteForm(false);
                        setInviteEmail("");
                        setInviteRole('viewer');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
