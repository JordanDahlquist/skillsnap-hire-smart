import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Search, MoreHorizontal, Eye, Shield, Trash2, UserCheck, UserX, UserMinus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminUser } from "@/types/admin";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { UpdateUserStatusDialog } from "./UpdateUserStatusDialog";
import { useToast } from "@/hooks/use-toast";
import { getUserStatusColor } from "@/utils/statusUtils";

interface UserRoleData {
  user_id: string;
  role: string;
}

export const UserManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [userToUpdateStatus, setUserToUpdateStatus] = useState<AdminUser | null>(null);
  const [newStatus, setNewStatus] = useState<'active' | 'inactive' | 'deleted'>('active');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'deleted'>('active');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Fetching users and roles...');
        
        // Fetch all profiles with better error handling
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            email,
            company_name,
            created_at,
            industry,
            phone,
            default_location,
            status
          `)
          .order('created_at', { ascending: false });

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          throw profilesError;
        }

        console.log('Profiles fetched:', profiles?.length);

        // Fetch user roles using the RPC function we created
        let userRoles: UserRoleData[] = [];
        try {
          const { data: rolesData, error: rolesError } = await supabase
            .rpc('get_all_user_roles');
          
          if (rolesError) {
            console.warn('Error fetching user roles:', rolesError);
          } else if (rolesData) {
            userRoles = rolesData;
            console.log('User roles fetched:', userRoles.length);
          }
        } catch (error) {
          console.warn('User roles functionality not available:', error);
        }

        // Also try to get auth users count for comparison
        try {
          const { count: authUsersCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });
          console.log('Total profiles in database:', authUsersCount);
        } catch (error) {
          console.warn('Could not get auth users count:', error);
        }

        const usersWithRoles: AdminUser[] = profiles?.map(profile => ({
          ...profile,
          role: userRoles.find(r => r.user_id === profile.id)?.role || 'user'
        })) || [];

        console.log('Users with roles processed:', usersWithRoles.length);
        setUsers(usersWithRoles);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleViewDetails = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleManageRoles = (userId: string) => {
    // For now, navigate to user details where role management could be implemented
    navigate(`/admin/users/${userId}`);
  };

  const handleDeleteUser = (user: AdminUser) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleUpdateUserStatus = (user: AdminUser, status: 'active' | 'inactive' | 'deleted') => {
    setUserToUpdateStatus(user);
    setNewStatus(status);
    setStatusDialogOpen(true);
  };

  const confirmUpdateUserStatus = async () => {
    if (!userToUpdateStatus) return;

    setIsUpdatingStatus(true);
    try {
      const { data, error } = await supabase.rpc('update_user_status', {
        target_user_id: userToUpdateStatus.id,
        new_status: newStatus
      });

      if (error) {
        throw error;
      }

      const result = data as { success: boolean; error?: string; message?: string };
      
      if (result?.success) {
        // Update user in local state
        setUsers(users.map(u => 
          u.id === userToUpdateStatus.id 
            ? { ...u, status: newStatus }
            : u
        ));
        
        toast({
          title: "Status updated",
          description: `${userToUpdateStatus.full_name || userToUpdateStatus.email} has been marked as ${newStatus}.`,
        });
      } else {
        throw new Error(result?.error || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
      setStatusDialogOpen(false);
      setUserToUpdateStatus(null);
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      const { data, error } = await supabase.rpc('delete_user_completely', {
        target_user_id: userToDelete.id
      });

      if (error) {
        throw error;
      }

      const result = data as { success: boolean; error?: string; message?: string };
      
      if (result?.success) {
        // Remove user from local state
        setUsers(users.filter(u => u.id !== userToDelete.id));
        
        toast({
          title: "User deleted",
          description: `${userToDelete.full_name || userToDelete.email} has been permanently deleted.`,
        });
      } else {
        throw new Error(result?.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const colorClass = getUserStatusColor(status);
    return (
      <Badge className={colorClass}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getStatusActions = (user: AdminUser) => {
    const actions = [];
    
    if (user.status !== 'active') {
      actions.push(
        <DropdownMenuItem key="activate" onClick={() => handleUpdateUserStatus(user, 'active')}>
          <UserCheck className="w-4 h-4 mr-2" />
          Mark as Active
        </DropdownMenuItem>
      );
    }
    
    if (user.status !== 'inactive') {
      actions.push(
        <DropdownMenuItem key="deactivate" onClick={() => handleUpdateUserStatus(user, 'inactive')}>
          <UserX className="w-4 h-4 mr-2" />
          Mark as Inactive
        </DropdownMenuItem>
      );
    }
    
    if (user.status !== 'deleted') {
      actions.push(
        <DropdownMenuItem key="delete" onClick={() => handleUpdateUserStatus(user, 'deleted')}>
          <UserMinus className="w-4 h-4 mr-2" />
          Mark as Deleted
        </DropdownMenuItem>
      );
    }
    
    return actions;
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage platform users and permissions</p>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Platform Users</CardTitle>
                <CardDescription>All registered users on the platform</CardDescription>
              </div>
              <Skeleton className="h-10 w-64" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage platform users and permissions</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">Platform Users</CardTitle>
                <CardDescription className="text-sm">Manage user accounts and statuses</CardDescription>
              </div>
              <div className="relative w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button 
                  variant={statusFilter === 'all' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                  className="h-8 px-3 text-xs"
                >
                  All <span className="ml-1 opacity-60">({users.length})</span>
                </Button>
                <Button 
                  variant={statusFilter === 'active' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setStatusFilter('active')}
                  className="h-8 px-3 text-xs"
                >
                  Active <span className="ml-1 opacity-60">({users.filter(u => u.status === 'active').length})</span>
                </Button>
                <Button 
                  variant={statusFilter === 'inactive' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setStatusFilter('inactive')}
                  className="h-8 px-3 text-xs"
                >
                  Inactive <span className="ml-1 opacity-60">({users.filter(u => u.status === 'inactive').length})</span>
                </Button>
                <Button 
                  variant={statusFilter === 'deleted' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setStatusFilter('deleted')}
                  className="h-8 px-3 text-xs"
                >
                  Deleted <span className="ml-1 opacity-60">({users.filter(u => u.status === 'deleted').length})</span>
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Showing {filteredUsers.length} of {users.length} users
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.full_name || 'No name'}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{user.company_name}</TableCell>
                  <TableCell>{user.industry || 'Not specified'}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(user.id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleManageRoles(user.id)}>
                          <Shield className="w-4 h-4 mr-2" />
                          Manage Roles
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {getStatusActions(user)}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteUser(user)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete User Permanently
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredUsers.length === 0 && (
            <div className="text-left py-8 text-muted-foreground">
              {users.length === 0 ? 'No users found.' : 'No users found matching your search.'}
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        user={userToDelete}
        onConfirm={confirmDeleteUser}
        isDeleting={isDeleting}
      />

      <UpdateUserStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        user={userToUpdateStatus}
        newStatus={newStatus}
        onConfirm={confirmUpdateUserStatus}
        isUpdating={isUpdatingStatus}
      />
    </div>
  );
};
