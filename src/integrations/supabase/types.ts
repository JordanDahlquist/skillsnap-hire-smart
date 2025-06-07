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
          name: string
          parsed_resume_data: Json | null
          phone: string | null
          portfolio: string | null
          portfolio_url: string | null
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
          name: string
          parsed_resume_data?: Json | null
          phone?: string | null
          portfolio?: string | null
          portfolio_url?: string | null
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
          name?: string
          parsed_resume_data?: Json | null
          phone?: string | null
          portfolio?: string | null
          portfolio_url?: string | null
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
          region?: string | null
          required_skills?: string
          role_type?: string
          state?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          company_website: string | null
          created_at: string
          default_location: string | null
          email: string | null
          full_name: string | null
          id: string
          industry: string | null
          job_title: string | null
          phone: string | null
          profile_picture_url: string | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          company_website?: string | null
          created_at?: string
          default_location?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          industry?: string | null
          job_title?: string | null
          phone?: string | null
          profile_picture_url?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          company_website?: string | null
          created_at?: string
          default_location?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          industry?: string | null
          job_title?: string | null
          phone?: string | null
          profile_picture_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
