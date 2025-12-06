export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      assignments: {
        Row: {
          created_at: string | null
          experiment_id: string
          id: string
          user_id: string
          variant: string
        }
        Insert: {
          created_at?: string | null
          experiment_id: string
          id?: string
          user_id: string
          variant: string
        }
        Update: {
          created_at?: string | null
          experiment_id?: string
          id?: string
          user_id?: string
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiment_metrics"
            referencedColumns: ["experiment_id"]
          },
          {
            foreignKeyName: "assignments_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      conversions: {
        Row: {
          experiment_id: string
          id: string
          metadata: Json | null
          paid_order_id: string | null
          revenue: number | null
          timestamp: string | null
          user_id: string
          variant: string
        }
        Insert: {
          experiment_id: string
          id?: string
          metadata?: Json | null
          paid_order_id?: string | null
          revenue?: number | null
          timestamp?: string | null
          user_id: string
          variant: string
        }
        Update: {
          experiment_id?: string
          id?: string
          metadata?: Json | null
          paid_order_id?: string | null
          revenue?: number | null
          timestamp?: string | null
          user_id?: string
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversions_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiment_metrics"
            referencedColumns: ["experiment_id"]
          },
          {
            foreignKeyName: "conversions_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      experiments: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          key: string
          metadata: Json | null
          name: string
          start_date: string | null
          status: string
          target_sample_size: number | null
          tenant_id: string
          updated_at: string | null
          variants: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          key: string
          metadata?: Json | null
          name: string
          start_date?: string | null
          status?: string
          target_sample_size?: number | null
          tenant_id: string
          updated_at?: string | null
          variants: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          key?: string
          metadata?: Json | null
          name?: string
          start_date?: string | null
          status?: string
          target_sample_size?: number | null
          tenant_id?: string
          updated_at?: string | null
          variants?: Json
        }
        Relationships: [
          {
            foreignKeyName: "experiments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations: {
        Row: {
          confidence: number | null
          created_at: string | null
          expected_revenue: number | null
          experiment_id: string
          id: string
          metadata: Json | null
          objective: string
          recommended_price: number
          simulation: Json | null
          tenant_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          expected_revenue?: number | null
          experiment_id: string
          id?: string
          metadata?: Json | null
          objective: string
          recommended_price: number
          simulation?: Json | null
          tenant_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          expected_revenue?: number | null
          experiment_id?: string
          id?: string
          metadata?: Json | null
          objective?: string
          recommended_price?: number
          simulation?: Json | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiment_metrics"
            referencedColumns: ["experiment_id"]
          },
          {
            foreignKeyName: "recommendations_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string | null
          email: string
          id: string
          metadata: Json | null
          mode: string
          name: string
          paid_api_key: string | null
          plan: string
          updated_at: string | null
          webhook_secret: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          metadata?: Json | null
          mode: string
          name: string
          paid_api_key?: string | null
          plan?: string
          updated_at?: string | null
          webhook_secret?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          metadata?: Json | null
          mode?: string
          name?: string
          paid_api_key?: string | null
          plan?: string
          updated_at?: string | null
          webhook_secret?: string | null
        }
        Relationships: []
      }
      usage: {
        Row: {
          created_at: string | null
          id: string
          metric: string
          period: string
          tenant_id: string
          value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          metric: string
          period: string
          tenant_id: string
          value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          metric?: string
          period?: string
          tenant_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "usage_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      views: {
        Row: {
          experiment_id: string
          id: string
          metadata: Json | null
          timestamp: string | null
          user_id: string
          variant: string
        }
        Insert: {
          experiment_id: string
          id?: string
          metadata?: Json | null
          timestamp?: string | null
          user_id: string
          variant: string
        }
        Update: {
          experiment_id?: string
          id?: string
          metadata?: Json | null
          timestamp?: string | null
          user_id?: string
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "views_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiment_metrics"
            referencedColumns: ["experiment_id"]
          },
          {
            foreignKeyName: "views_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      experiment_metrics: {
        Row: {
          average_order_value: number | null
          conversion_rate: number | null
          experiment_id: string | null
          experiment_key: string | null
          experiment_name: string | null
          status: string | null
          tenant_id: string | null
          total_assignments: number | null
          total_conversions: number | null
          total_revenue: number | null
          total_views: number | null
        }
        Relationships: [
          {
            foreignKeyName: "experiments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      refresh_experiment_metrics: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

