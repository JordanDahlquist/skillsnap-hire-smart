
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrganizationMembers, useInvitations, useSendInvitation, useUpdateMemberRole, useRemoveMember } from "@/hooks/useInvitations";
import { useCurrentOrganization } from "@/hooks/useOrganization";
import { useAuth } from "@/hooks/useAuth";
import { Plus, MoreHorizontal, UserPlus, Crown, Shield, Edit, Eye, Mail, Users, UserCheck } from "lucide-react";

export const EnhancedTeamManagement = () => {
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

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'owner': return 'Full access to everything including billing and organization settings';
      case 'admin': return 'Can manage everything except billing and organization deletion';
      case 'editor': return 'Can create and edit jobs, manage applications';
      case 'viewer': return 'Can view jobs and applications, cannot make changes';
      default: return '';
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
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Management
              </CardTitle>
              <CardDescription>
                Manage your organization's team members, roles, and invitations
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
          <Tabs defaultValue="members" className="space-y-4">
            <TabsList>
              <TabsTrigger value="members" className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Members ({members.length})
              </TabsTrigger>
              <TabsTrigger value="invitations" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Pending ({invitations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="space-y-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {member.profiles?.full_name?.charAt(0) || member.profiles?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {member.profiles?.full_name || 'Unknown User'}
                        </p>
                        {member.user_id === user?.id && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{member.profiles?.email}</p>
                      <p className="text-xs text-gray-400 mt-1">{getRoleDescription(member.role)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
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
                            <Shield className="w-4 h-4 mr-2" />
                            Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => updateMemberRole.mutate({ 
                              membershipId: member.id, 
                              role: 'editor' 
                            })}
                            disabled={member.role === 'editor'}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Make Editor
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => updateMemberRole.mutate({ 
                              membershipId: member.id, 
                              role: 'viewer' 
                            })}
                            disabled={member.role === 'viewer'}
                          >
                            <Eye className="w-4 h-4 mr-2" />
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
            </TabsContent>

            <TabsContent value="invitations" className="space-y-4">
              {invitations.length > 0 ? (
                invitations.map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <p className="text-sm text-gray-500">
                          Invited {new Date(invitation.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400">{getRoleDescription(invitation.role)}</p>
                      </div>
                    </div>
                    <Badge className={getRoleColor(invitation.role)}>
                      {getRoleIcon(invitation.role)}
                      <span className="ml-1 capitalize">{invitation.role}</span>
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No pending invitations</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Invite Form */}
          {showInviteForm && (
            <div className="mt-6 p-4 border rounded-lg bg-blue-50">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Invite New Team Member
              </h4>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="invite-email">Email Address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="invite-role">Role</Label>
                  <Select value={inviteRole} onValueChange={(value: 'admin' | 'editor' | 'viewer') => setInviteRole(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          <div>
                            <div>Viewer</div>
                            <div className="text-xs text-gray-500">Can view jobs and applications</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="editor">
                        <div className="flex items-center gap-2">
                          <Edit className="w-4 h-4" />
                          <div>
                            <div>Editor</div>
                            <div className="text-xs text-gray-500">Can create and edit jobs</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          <div>
                            <div>Admin</div>
                            <div className="text-xs text-gray-500">Can manage everything except billing</div>
                          </div>
                        </div>
                      </SelectItem>
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
        </CardContent>
      </Card>
    </div>
  );
};
