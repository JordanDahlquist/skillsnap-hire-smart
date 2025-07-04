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
          interview_video_responses: Json | null
          interview_video_transcripts: Json | null
          interview_video_url: string | null
          job_id: string
          linkedin_url: string | null
          location: string | null
          manual_rating: number | null
          name: string
          parsed_resume_data: Json | null
          phone: string | null
          pipeline_stage: string | null
          portfolio: string | null
          portfolio_url: string | null
          previous_pipeline_stage: string | null
          rejection_reason: string | null
          resume_file_path: string | null
          skills: Json | null
          skills_test_responses: Json | null
          skills_video_transcripts: Json | null
          status: string
          transcript_last_processed_at: string | null
          transcript_processing_status: string | null
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
          interview_video_responses?: Json | null
          interview_video_transcripts?: Json | null
          interview_video_url?: string | null
          job_id: string
          linkedin_url?: string | null
          location?: string | null
          manual_rating?: number | null
          name: string
          parsed_resume_data?: Json | null
          phone?: string | null
          pipeline_stage?: string | null
          portfolio?: string | null
          portfolio_url?: string | null
          previous_pipeline_stage?: string | null
          rejection_reason?: string | null
          resume_file_path?: string | null
          skills?: Json | null
          skills_test_responses?: Json | null
          skills_video_transcripts?: Json | null
          status?: string
          transcript_last_processed_at?: string | null
          transcript_processing_status?: string | null
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
          interview_video_responses?: Json | null
          interview_video_transcripts?: Json | null
          interview_video_url?: string | null
          job_id?: string
          linkedin_url?: string | null
          location?: string | null
          manual_rating?: number | null
          name?: string
          parsed_resume_data?: Json | null
          phone?: string | null
          pipeline_stage?: string | null
          portfolio?: string | null
          portfolio_url?: string | null
          previous_pipeline_stage?: string | null
          rejection_reason?: string | null
          resume_file_path?: string | null
          skills?: Json | null
          skills_test_responses?: Json | null
          skills_video_transcripts?: Json | null
          status?: string
          transcript_last_processed_at?: string | null
          transcript_processing_status?: string | null
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
          thread_id: string | null
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
          thread_id?: string | null
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
          thread_id?: string | null
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
          {
            foreignKeyName: "email_logs_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "email_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      email_messages: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string
          direction: string
          external_message_id: string | null
          id: string
          is_read: boolean
          message_type: string
          recipient_email: string
          sender_email: string
          subject: string | null
          thread_id: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string
          direction: string
          external_message_id?: string | null
          id?: string
          is_read?: boolean
          message_type?: string
          recipient_email: string
          sender_email: string
          subject?: string | null
          thread_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string
          direction?: string
          external_message_id?: string | null
          id?: string
          is_read?: boolean
          message_type?: string
          recipient_email?: string
          sender_email?: string
          subject?: string | null
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "email_threads"
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
      email_threads: {
        Row: {
          application_id: string | null
          created_at: string
          id: string
          job_id: string | null
          last_message_at: string
          participants: Json
          reply_to_email: string | null
          status: string
          subject: string
          unread_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          last_message_at?: string
          participants?: Json
          reply_to_email?: string | null
          status?: string
          subject: string
          unread_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          application_id?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          last_message_at?: string
          participants?: Json
          reply_to_email?: string | null
          status?: string
          subject?: string
          unread_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_threads_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_threads_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      hiring_stages: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_default: boolean | null
          job_id: string | null
          name: string
          order_index: number
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          job_id?: string | null
          name: string
          order_index: number
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          job_id?: string | null
          name?: string
          order_index?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hiring_stages_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_views: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown | null
          job_id: string
          referrer: string | null
          user_agent: string | null
          viewed_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          job_id: string
          referrer?: string | null
          user_agent?: string | null
          viewed_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          job_id?: string
          referrer?: string | null
          user_agent?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_views_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          ai_mini_description: string | null
          budget: string | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string
          description: string
          duration: string | null
          employment_type: string
          experience_level: string
          generated_interview_questions: string | null
          generated_job_post: string | null
          generated_test: string | null
          id: string
          interview_video_max_length: number | null
          location_type: string | null
          region: string | null
          required_skills: string
          role_type: string
          state: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
          view_count: number
        }
        Insert: {
          ai_mini_description?: string | null
          budget?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          description: string
          duration?: string | null
          employment_type?: string
          experience_level: string
          generated_interview_questions?: string | null
          generated_job_post?: string | null
          generated_test?: string | null
          id?: string
          interview_video_max_length?: number | null
          location_type?: string | null
          region?: string | null
          required_skills: string
          role_type: string
          state?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
          view_count?: number
        }
        Update: {
          ai_mini_description?: string | null
          budget?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          description?: string
          duration?: string | null
          employment_type?: string
          experience_level?: string
          generated_interview_questions?: string | null
          generated_job_post?: string | null
          generated_test?: string | null
          id?: string
          interview_video_max_length?: number | null
          location_type?: string | null
          region?: string | null
          required_skills?: string
          role_type?: string
          state?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          biggest_challenges: Json | null
          company_name: string
          company_size: string | null
          company_website: string | null
          created_at: string
          current_tools: Json | null
          daily_briefing_regenerations: number | null
          default_location: string | null
          email: string | null
          full_name: string | null
          hires_per_month: string | null
          hiring_goals: Json | null
          id: string
          industry: string | null
          job_title: string | null
          job_title_signup: string | null
          last_regeneration_date: string | null
          phone: string | null
          profile_picture_url: string | null
          unique_email: string
          updated_at: string
        }
        Insert: {
          biggest_challenges?: Json | null
          company_name: string
          company_size?: string | null
          company_website?: string | null
          created_at?: string
          current_tools?: Json | null
          daily_briefing_regenerations?: number | null
          default_location?: string | null
          email?: string | null
          full_name?: string | null
          hires_per_month?: string | null
          hiring_goals?: Json | null
          id: string
          industry?: string | null
          job_title?: string | null
          job_title_signup?: string | null
          last_regeneration_date?: string | null
          phone?: string | null
          profile_picture_url?: string | null
          unique_email: string
          updated_at?: string
        }
        Update: {
          biggest_challenges?: Json | null
          company_name?: string
          company_size?: string | null
          company_website?: string | null
          created_at?: string
          current_tools?: Json | null
          daily_briefing_regenerations?: number | null
          default_location?: string | null
          email?: string | null
          full_name?: string | null
          hires_per_month?: string | null
          hiring_goals?: Json | null
          id?: string
          industry?: string | null
          job_title?: string | null
          job_title_signup?: string | null
          last_regeneration_date?: string | null
          phone?: string | null
          profile_picture_url?: string | null
          unique_email?: string
          updated_at?: string
        }
        Relationships: []
      }
      scout_conversations: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          is_ai_response: boolean
          message_content: string
          message_type: string
          related_application_ids: string[] | null
          related_job_ids: string[] | null
          title: string | null
          user_id: string
        }
        Insert: {
          conversation_id?: string
          created_at?: string
          id?: string
          is_ai_response?: boolean
          message_content: string
          message_type?: string
          related_application_ids?: string[] | null
          related_job_ids?: string[] | null
          title?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          is_ai_response?: boolean
          message_content?: string
          message_type?: string
          related_application_ids?: string[] | null
          related_job_ids?: string[] | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          applications_count: number | null
          applications_count_reset_date: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          job_count: number | null
          paddle_customer_id: string | null
          paddle_subscription_id: string | null
          plan_type: Database["public"]["Enums"]["plan_type"]
          status: Database["public"]["Enums"]["subscription_status"]
          subscription_end_date: string | null
          subscription_start_date: string | null
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          applications_count?: number | null
          applications_count_reset_date?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          job_count?: number | null
          paddle_customer_id?: string | null
          paddle_subscription_id?: string | null
          plan_type?: Database["public"]["Enums"]["plan_type"]
          status?: Database["public"]["Enums"]["subscription_status"]
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          applications_count?: number | null
          applications_count_reset_date?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          job_count?: number | null
          paddle_customer_id?: string | null
          paddle_subscription_id?: string | null
          plan_type?: Database["public"]["Enums"]["plan_type"]
          status?: Database["public"]["Enums"]["subscription_status"]
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_default_hiring_stages: {
        Args: { job_id: string }
        Returns: undefined
      }
      generate_unique_email: {
        Args: { user_id: string; full_name: string; email: string }
        Returns: string
      }
      get_admin_platform_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_admin_user_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          period: string
          user_count: number
          job_count: number
          application_count: number
        }[]
      }
      get_all_user_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      get_user_plan_limits: {
        Args: { user_id: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_super_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      track_job_view: {
        Args: {
          p_job_id: string
          p_ip_address?: unknown
          p_user_agent?: string
          p_referrer?: string
        }
        Returns: boolean
      }
      user_has_active_access: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "user"
      plan_type: "starter" | "professional" | "enterprise"
      subscription_status:
        | "trial"
        | "active"
        | "past_due"
        | "canceled"
        | "paused"
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
      app_role: ["super_admin", "admin", "user"],
      plan_type: ["starter", "professional", "enterprise"],
      subscription_status: [
        "trial",
        "active",
        "past_due",
        "canceled",
        "paused",
      ],
    },
  },
} as const
