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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      coach_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      debt_payments: {
        Row: {
          amount: number
          debt_id: string
          id: string
          notes: string | null
          payment_date: string
          source_income_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          debt_id: string
          id?: string
          notes?: string | null
          payment_date: string
          source_income_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          debt_id?: string
          id?: string
          notes?: string | null
          payment_date?: string
          source_income_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debt_payments_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debt_payments_source_income_id_fkey"
            columns: ["source_income_id"]
            isOneToOne: false
            referencedRelation: "income_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      debts: {
        Row: {
          amount_repaid: number | null
          created_at: string | null
          creditor_name: string
          id: string
          notes: string | null
          priority: number | null
          total_owed: number
          user_id: string
        }
        Insert: {
          amount_repaid?: number | null
          created_at?: string | null
          creditor_name: string
          id?: string
          notes?: string | null
          priority?: number | null
          total_owed: number
          user_id: string
        }
        Update: {
          amount_repaid?: number | null
          created_at?: string | null
          creditor_name?: string
          id?: string
          notes?: string | null
          priority?: number | null
          total_owed?: number
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          category: string | null
          created_at: string | null
          current_value: number | null
          id: string
          status: string | null
          target_date: string | null
          target_value: number | null
          title: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          status?: string | null
          target_date?: string | null
          target_value?: number | null
          title: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          status?: string | null
          target_date?: string | null
          target_value?: number | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      income_entries: {
        Row: {
          allocated_to_debt: number | null
          allocated_to_reinvestment: number | null
          amount: number
          created_at: string | null
          entry_date: string
          id: string
          notes: string | null
          source: string
          user_id: string
        }
        Insert: {
          allocated_to_debt?: number | null
          allocated_to_reinvestment?: number | null
          amount: number
          created_at?: string | null
          entry_date: string
          id?: string
          notes?: string | null
          source: string
          user_id: string
        }
        Update: {
          allocated_to_debt?: number | null
          allocated_to_reinvestment?: number | null
          amount?: number
          created_at?: string | null
          entry_date?: string
          id?: string
          notes?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string | null
          entry_date: string
          id: string
          linked_trade_id: string | null
          mood: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          entry_date: string
          id?: string
          linked_trade_id?: string | null
          mood?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          entry_date?: string
          id?: string
          linked_trade_id?: string | null
          mood?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_linked_trade_id_fkey"
            columns: ["linked_trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string | null
          created_at: string | null
          due_date: string | null
          id: string
          is_read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          is_read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          is_read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      trades: {
        Row: {
          account_id: string | null
          created_at: string | null
          direction: string
          entry_price: number | null
          exit_price: number | null
          id: string
          lot_size: number | null
          notes: string | null
          pair: string
          partial_close_price: number | null
          partial_close_taken: boolean | null
          pnl: number | null
          r_multiple: number | null
          result: string | null
          risk_percent: number | null
          rule_violation: boolean | null
          rule_violation_note: string | null
          screenshot_path: string | null
          session: string | null
          setup_type: string | null
          stop_loss: number | null
          take_profit: number | null
          trade_date: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          direction: string
          entry_price?: number | null
          exit_price?: number | null
          id?: string
          lot_size?: number | null
          notes?: string | null
          pair: string
          partial_close_price?: number | null
          partial_close_taken?: boolean | null
          pnl?: number | null
          r_multiple?: number | null
          result?: string | null
          risk_percent?: number | null
          rule_violation?: boolean | null
          rule_violation_note?: string | null
          screenshot_path?: string | null
          session?: string | null
          setup_type?: string | null
          stop_loss?: number | null
          take_profit?: number | null
          trade_date: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          direction?: string
          entry_price?: number | null
          exit_price?: number | null
          id?: string
          lot_size?: number | null
          notes?: string | null
          pair?: string
          partial_close_price?: number | null
          partial_close_taken?: boolean | null
          pnl?: number | null
          r_multiple?: number | null
          result?: string | null
          risk_percent?: number | null
          rule_violation?: boolean | null
          rule_violation_note?: string | null
          screenshot_path?: string | null
          session?: string | null
          setup_type?: string | null
          stop_loss?: number | null
          take_profit?: number | null
          trade_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_accounts: {
        Row: {
          account_type: string
          created_at: string | null
          current_balance: number | null
          id: string
          max_daily_loss_percent: number | null
          max_total_loss_percent: number | null
          name: string
          phase: string | null
          profit_target_percent: number | null
          starting_balance: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          account_type: string
          created_at?: string | null
          current_balance?: number | null
          id?: string
          max_daily_loss_percent?: number | null
          max_total_loss_percent?: number | null
          name: string
          phase?: string | null
          profit_target_percent?: number | null
          starting_balance?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          account_type?: string
          created_at?: string | null
          current_balance?: number | null
          id?: string
          max_daily_loss_percent?: number | null
          max_total_loss_percent?: number | null
          name?: string
          phase?: string | null
          profit_target_percent?: number | null
          starting_balance?: number | null
          status?: string | null
          user_id?: string
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
    Enums: {},
  },
} as const
