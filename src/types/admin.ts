
// Admin-specific type definitions
export interface UserRole {
  id: string;
  user_id: string;
  role: 'super_admin' | 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  full_name: string | null;
  email: string | null;
  company_name: string;
  created_at: string;
  industry: string | null;
  role: string;
  phone: string | null;
  default_location: string | null;
}

export interface AdminAuditLog {
  id: string;
  admin_user_id: string;
  action: string;
  target_user_id?: string;
  details: Record<string, any>;
  created_at: string;
}
