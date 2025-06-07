export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: {
          ai_rating: number | null
          ai_summary: string | null
          answer_1: string | null
          answer_2: string | null
          answer_3: string | null
          available_start_date: string | null
          cover_letter: string | null
          created_at: string
          education: Json | null
          email: string
          experience: string | null
          github_url: string | null
          id: string
          job_id: string
          linkedin_url: string | null
          location: string | null
          manual_rating: number | null
          name: string
          parsed_resume_data: Json | null
          phone: string | null
          portfolio: string | null
          portfolio_url: string | null
          rejection_reason: string | null
          resume_file_path: string | null
          skills: Json | null
          status: string
          updated_at: string
          work_experience: Json | null
        }
        Insert: {
          ai_rating?: number | null
          ai_summary?: string | null
          answer_1?: string | null
          answer_2?: string | null
          answer_3?: string | null
          available_start_date?: string | null
          cover_letter?: string | null
          created_at?: string
          education?: Json | null
          email: string
          experience?: string | null
          github_url?: string | null
          id?: string
          job_id: string
          linkedin_url?: string | null
          location?: string | null
          manual_rating?: number | null
          name: string
          parsed_resume_data?: Json | null
          phone?: string | null
          portfolio?: string | null
          portfolio_url?: string | null
          rejection_reason?: string | null
          resume_file_path?: string | null
          skills?: Json | null
          status?: string
          updated_at?: string
          work_experience?: Json | null
        }
        Update: {
          ai_rating?: number | null
          ai_summary?: string | null
          answer_1?: string | null
          answer_2?: string | null
          answer_3?: string | null
          available_start_date?: string | null
          cover_letter?: string | null
          created_at?: string
          education?: Json | null
          email?: string
          experience?: string | null
          github_url?: string | null
          id?: string
          job_id?: string
          linkedin_url?: string | null
          location?: string | null
          manual_rating?: number | null
          name?: string
          parsed_resume_data?: Json | null
          phone?: string | null
          portfolio?: string | null
          portfolio_url?: string | null
          rejection_reason?: string | null
          resume_file_path?: string | null
          skills?: Json | null
          status?: string
          updated_at?: string
          work_experience?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_briefings: {
        Row: {
          briefing_content: string
          briefing_data: Json
          created_at: string
          expires_at: string
          id: string
          user_id: string
        }
        Insert: {
          briefing_content: string
          briefing_data: Json
          created_at?: string
          expires_at?: string
          id?: string
          user_id: string
        }
        Update: {
          briefing_content?: string
          briefing_data?: Json
          created_at?: string
          expires_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          application_id: string | null
          content: string
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          recipient_email: string
          recipient_name: string
          sent_at: string | null
          status: string | null
          subject: string
          template_id: string | null
          user_id: string
        }
        Insert: {
          application_id?: string | null
          content: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          recipient_email: string
          recipient_name: string
          sent_at?: string | null
          status?: string | null
          subject: string
          template_id?: string | null
          user_id: string
        }
        Update: {
          application_id?: string | null
          content?: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          recipient_email?: string
          recipient_name?: string
          sent_at?: string | null
          status?: string | null
          subject?: string
          template_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          name: string
          subject: string
          updated_at: string
          user_id: string
          variables: Json | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          name: string
          subject: string
          updated_at?: string
          user_id: string
          variables?: Json | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          name?: string
          subject?: string
          updated_at?: string
          user_id?: string
          variables?: Json | null
        }
        Relationships: []
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: Database["public"]["Enums"]["organization_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          organization_id: string
          role?: Database["public"]["Enums"]["organization_role"]
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["organization_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          ai_mini_description: string | null
          budget: string | null
          city: string | null
          country: string | null
          created_at: string
          description: string
          duration: string | null
          employment_type: string
          experience_level: string
          generated_job_post: string | null
          generated_test: string | null
          id: string
          location_type: string | null
          organization_id: string
          region: string | null
          required_skills: string
          role_type: string
          state: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_mini_description?: string | null
          budget?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          description: string
          duration?: string | null
          employment_type?: string
          experience_level: string
          generated_job_post?: string | null
          generated_test?: string | null
          id?: string
          location_type?: string | null
          organization_id: string
          region?: string | null
          required_skills: string
          role_type: string
          state?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_mini_description?: string | null
          budget?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string
          duration?: string | null
          employment_type?: string
          experience_level?: string
          generated_job_post?: string | null
          generated_test?: string | null
          id?: string
          location_type?: string | null
          organization_id?: string
          region?: string | null
          required_skills?: string
          role_type?: string
          state?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_memberships: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["organization_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["organization_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["organization_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          company_website: string | null
          created_at: string
          daily_briefing_regenerations: number | null
          default_location: string | null
          default_organization_id: string | null
          email: string | null
          full_name: string | null
          id: string
          industry: string | null
          job_title: string | null
          last_regeneration_date: string | null
          phone: string | null
          profile_picture_url: string | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          company_website?: string | null
          created_at?: string
          daily_briefing_regenerations?: number | null
          default_location?: string | null
          default_organization_id?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          industry?: string | null
          job_title?: string | null
          last_regeneration_date?: string | null
          phone?: string | null
          profile_picture_url?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          company_website?: string | null
          created_at?: string
          daily_briefing_regenerations?: number | null
          default_location?: string | null
          default_organization_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          industry?: string | null
          job_title?: string | null
          last_regeneration_date?: string | null
          phone?: string | null
          profile_picture_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_default_organization_id_fkey"
            columns: ["default_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_organization_id: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_user_organization_membership: {
        Args: { user_uuid: string }
        Returns: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["organization_role"]
          updated_at: string
          user_id: string
        }[]
      }
      get_user_organization_role: {
        Args: { user_uuid: string; org_id: string }
        Returns: string
      }
      get_user_role_in_organization: {
        Args: { user_uuid: string; org_uuid: string }
        Returns: string
      }
      is_organization_member: {
        Args: { user_uuid: string; org_uuid: string }
        Returns: boolean
      }
      user_has_organization_access: {
        Args: { user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      organization_role: "owner" | "admin" | "editor" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      organization_role: ["owner", "admin", "editor", "viewer"],
    },
  },
} as const
