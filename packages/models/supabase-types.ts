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
      agents: {
        Row: {
          base_price: number | null
          created_at: string | null
          currency: string | null
          description: string | null
          external_id: string | null
          id: string
          metadata: Json | null
          name: string
          pricing_model: string | null
          status: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          base_price?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          name: string
          pricing_model?: string | null
          status?: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          base_price?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          pricing_model?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
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
      costs: {
        Row: {
          agent_id: string | null
          amount: number
          cost_type: string
          created_at: string | null
          currency: string | null
          customer_id: string | null
          id: string
          metadata: Json | null
          order_id: string | null
          quantity: number | null
          tenant_id: string
          unit: string | null
        }
        Insert: {
          agent_id?: string | null
          amount: number
          cost_type: string
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          quantity?: number | null
          tenant_id: string
          unit?: string | null
        }
        Update: {
          agent_id?: string | null
          amount?: number
          cost_type?: string
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          quantity?: number | null
          tenant_id?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "costs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "costs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "costs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "costs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      credits: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          customer_id: string | null
          expires_at: string | null
          external_id: string | null
          id: string
          metadata: Json | null
          remaining_amount: number
          status: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          expires_at?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          remaining_amount: number
          status?: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          expires_at?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          remaining_amount?: number
          status?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credits_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          balance: number | null
          created_at: string | null
          currency: string | null
          email: string | null
          external_id: string | null
          id: string
          metadata: Json | null
          name: string | null
          phone: string | null
          status: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          status?: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
        contacts: {
          Row: {
            address: Json | null
            created_at: string | null
            customer_id: string
            email: string | null
            external_id: string | null
            id: string
            metadata: Json | null
            phone: string | null
            updated_at: string | null
          }
          Insert: {
            address?: Json | null
            created_at?: string | null
            customer_id: string
            email?: string | null
            external_id?: string | null
            id?: string
            metadata?: Json | null
            phone?: string | null
            updated_at?: string | null
          }
          Update: {
            address?: Json | null
            created_at?: string | null
            customer_id?: string
            email?: string | null
            external_id?: string | null
            id?: string
            metadata?: Json | null
            phone?: string | null
            updated_at?: string | null
          }
          Relationships: [
            {
              foreignKeyName: "contacts_customer_id_fkey"
              columns: ["customer_id"]
              isOneToOne: false
              referencedRelation: "customers"
              referencedColumns: ["id"]
            },
          ]
        }
      disputes: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          customer_id: string | null
          evidence: Json | null
          external_id: string | null
          id: string
          metadata: Json | null
          payment_id: string | null
          reason: string | null
          status: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          evidence?: Json | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          payment_id?: string | null
          reason?: string | null
          status?: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          evidence?: Json | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          payment_id?: string | null
          reason?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disputes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
      invoices: {
        Row: {
          amount: number
          amount_due: number
          amount_paid: number | null
          created_at: string | null
          currency: string | null
          customer_id: string | null
          due_date: string | null
          external_id: string | null
          id: string
          invoice_number: string | null
          line_items: Json | null
          metadata: Json | null
          paid_at: string | null
          status: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          amount_due: number
          amount_paid?: number | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          due_date?: string | null
          external_id?: string | null
          id?: string
          invoice_number?: string | null
          line_items?: Json | null
          metadata?: Json | null
          paid_at?: string | null
          status?: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          amount_due?: number
          amount_paid?: number | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          due_date?: string | null
          external_id?: string | null
          id?: string
          invoice_number?: string | null
          line_items?: Json | null
          metadata?: Json | null
          paid_at?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          agent_id: string | null
          amount: number
          created_at: string | null
          currency: string | null
          customer_id: string | null
          external_id: string | null
          id: string
          items: Json | null
          metadata: Json | null
          status: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          amount: number
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          external_id?: string | null
          id?: string
          items?: Json | null
          metadata?: Json | null
          status?: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          amount?: number
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          external_id?: string | null
          id?: string
          items?: Json | null
          metadata?: Json | null
          status?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          customer_id: string | null
          external_id: string | null
          id: string
          metadata: Json | null
          order_id: string | null
          payment_method: string | null
          refunded_amount: number | null
          status: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          payment_method?: string | null
          refunded_amount?: number | null
          status?: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          payment_method?: string | null
          refunded_amount?: number | null
          status?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
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
      usage_signals: {
        Row: {
          agent_id: string | null
          created_at: string | null
          customer_id: string | null
          event_type: string
          id: string
          metadata: Json | null
          properties: Json | null
          tenant_id: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          properties?: Json | null
          tenant_id: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          properties?: Json | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_signals_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_signals_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_signals_tenant_id_fkey"
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

