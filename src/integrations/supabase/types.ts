export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          class_id: string
          created_at: string | null
          date: string
          id: string
          notes: string | null
          present: boolean
          recorded_by: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          present?: boolean
          recorded_by: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          present?: boolean
          recorded_by?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          age_range: string | null
          capacity: number | null
          created_at: string | null
          id: string
          name: string
          period: string | null
          school_id: string
          teacher_id: string | null
          updated_at: string | null
        }
        Insert: {
          age_range?: string | null
          capacity?: number | null
          created_at?: string | null
          id?: string
          name: string
          period?: string | null
          school_id: string
          teacher_id?: string | null
          updated_at?: string | null
        }
        Update: {
          age_range?: string | null
          capacity?: number | null
          created_at?: string | null
          id?: string
          name?: string
          period?: string | null
          school_id?: string
          teacher_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_logs: {
        Row: {
          class_id: string | null
          created_at: string | null
          date: string
          diaper: Json | null
          id: string
          meals: Json | null
          mood: string | null
          nap: Json | null
          notes: string | null
          photos: string[] | null
          student_id: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          date?: string
          diaper?: Json | null
          id?: string
          meals?: Json | null
          mood?: string | null
          nap?: Json | null
          notes?: string | null
          photos?: string[] | null
          student_id: string
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          date?: string
          diaper?: Json | null
          id?: string
          meals?: Json | null
          mood?: string | null
          nap?: Json | null
          notes?: string | null
          photos?: string[] | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_logs_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_records: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          due_date: string
          id: string
          payer_id: string | null
          payment_date: string | null
          school_id: string
          status: string | null
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          due_date: string
          id?: string
          payer_id?: string | null
          payment_date?: string | null
          school_id: string
          status?: string | null
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          due_date?: string
          id?: string
          payer_id?: string | null
          payment_date?: string | null
          school_id?: string
          status?: string | null
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_records_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          created_at: string | null
          email: string
          id: string
          role: string
          school_id: string
          status: string
          student_id: string | null
          token: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          role?: string
          school_id: string
          status?: string
          student_id?: string | null
          token: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          role?: string
          school_id?: string
          status?: string
          student_id?: string | null
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invites_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_plans: {
        Row: {
          bncc_code: string | null
          class_id: string
          created_at: string | null
          description: string | null
          id: string
          planned_date: string
          status: string
          teacher_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          bncc_code?: string | null
          class_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          planned_date: string
          status?: string
          teacher_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          bncc_code?: string | null
          class_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          planned_date?: string
          status?: string
          teacher_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_plans_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          class_id: string | null
          content: string
          created_at: string | null
          id: string
          read_at: string | null
          receiver_id: string | null
          school_id: string | null
          sender_id: string
        }
        Insert: {
          class_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          receiver_id?: string | null
          school_id?: string | null
          sender_id: string
        }
        Update: {
          class_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          receiver_id?: string | null
          school_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          announcements: boolean
          created_at: string | null
          daily_logs: boolean
          financial: boolean
          id: string
          messages: boolean
          updated_at: string | null
          user_id: string
        }
        Insert: {
          announcements?: boolean
          created_at?: string | null
          daily_logs?: boolean
          financial?: boolean
          id?: string
          messages?: boolean
          updated_at?: string | null
          user_id: string
        }
        Update: {
          announcements?: boolean
          created_at?: string | null
          daily_logs?: boolean
          financial?: boolean
          id?: string
          messages?: boolean
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          school_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          school_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          school_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      schools: {
        Row: {
          city: string | null
          color_palette: Json | null
          created_at: string | null
          director_name: string | null
          email: string | null
          id: string
          lgpd_accepted_at: string | null
          logo_url: string | null
          menu_url: string | null
          name: string
          phone: string | null
          photo_policy_accepted_at: string | null
          plan_type: string | null
          primary_color: string | null
          state: string | null
          status: string | null
          teacher_student_ratio: number | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          color_palette?: Json | null
          created_at?: string | null
          director_name?: string | null
          email?: string | null
          id?: string
          lgpd_accepted_at?: string | null
          logo_url?: string | null
          menu_url?: string | null
          name: string
          phone?: string | null
          photo_policy_accepted_at?: string | null
          plan_type?: string | null
          primary_color?: string | null
          state?: string | null
          status?: string | null
          teacher_student_ratio?: number | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          color_palette?: Json | null
          created_at?: string | null
          director_name?: string | null
          email?: string | null
          id?: string
          lgpd_accepted_at?: string | null
          logo_url?: string | null
          menu_url?: string | null
          name?: string
          phone?: string | null
          photo_policy_accepted_at?: string | null
          plan_type?: string | null
          primary_color?: string | null
          state?: string | null
          status?: string | null
          teacher_student_ratio?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      students: {
        Row: {
          birth_date: string | null
          class_id: string | null
          created_at: string | null
          id: string
          name: string
          parent_id: string | null
          photo_url: string | null
          school_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          birth_date?: string | null
          class_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          parent_id?: string | null
          photo_url?: string | null
          school_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          birth_date?: string | null
          class_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          photo_url?: string | null
          school_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invite: { Args: { token_input: string }; Returns: undefined }
      get_all_users_with_email: {
        Args: never
        Returns: {
          email: string
          full_name: string
          role: Database["public"]["Enums"]["app_role"]
          school_id: string
          user_id: string
        }[]
      }
      get_invite_by_token: { Args: { token_input: string }; Returns: Json }
      get_student_public_info: {
        Args: { student_id_input: string }
        Returns: {
          class_id: string
          class_name: string
          id: string
          name: string
          photo_url: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "superadmin" | "admin" | "professor" | "responsavel"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["superadmin", "admin", "professor", "responsavel"],
    },
  },
} as const
