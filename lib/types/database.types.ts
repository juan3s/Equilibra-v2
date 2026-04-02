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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      bank_accounts: {
        Row: {
          account_number: string | null
          account_type: string | null
          bank_id: string
          created_at: string
          currency_code: string
          description: string | null
          id: string
          initial_balance: number
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number?: string | null
          account_type?: string | null
          bank_id: string
          created_at?: string
          currency_code?: string
          description?: string | null
          id?: string
          initial_balance?: number
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string | null
          account_type?: string | null
          bank_id?: string
          created_at?: string
          currency_code?: string
          description?: string | null
          id?: string
          initial_balance?: number
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "banks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_accounts_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      banks: {
        Row: {
          bic_swift: string | null
          brand: string | null
          country: string
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["bank_kind"]
          name: string
          regulator_code: string | null
          slug: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          bic_swift?: string | null
          brand?: string | null
          country?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["bank_kind"]
          name: string
          regulator_code?: string | null
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          bic_swift?: string | null
          brand?: string | null
          country?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["bank_kind"]
          name?: string
          regulator_code?: string | null
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          category_type_slug: string | null
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category_type_slug?: string | null
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category_type_slug?: string | null
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_category_type_slug_fkey"
            columns: ["category_type_slug"]
            isOneToOne: false
            referencedRelation: "category_types"
            referencedColumns: ["slug"]
          },
        ]
      }
      category_types: {
        Row: {
          created_at: string
          description: string | null
          name: string
          operation_factor: number
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          name: string
          operation_factor?: number
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          name?: string
          operation_factor?: number
          slug?: string
        }
        Relationships: []
      }
      currencies: {
        Row: {
          code: string
          created_at: string
          decimals: number
          name: string
          symbol: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          decimals?: number
          name: string
          symbol?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          decimals?: number
          name?: string
          symbol?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pocket_allocations: {
        Row: {
          amount: number
          bank_account_id: string
          created_at: string
          description: string | null
          from_pocket_id: string | null
          id: string
          occurred_at: string
          to_pocket_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          bank_account_id: string
          created_at?: string
          description?: string | null
          from_pocket_id?: string | null
          id?: string
          occurred_at: string
          to_pocket_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          bank_account_id?: string
          created_at?: string
          description?: string | null
          from_pocket_id?: string | null
          id?: string
          occurred_at?: string
          to_pocket_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pocket_allocations_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pocket_allocations_from_pocket_id_fkey"
            columns: ["from_pocket_id"]
            isOneToOne: false
            referencedRelation: "pockets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pocket_allocations_to_pocket_id_fkey"
            columns: ["to_pocket_id"]
            isOneToOne: false
            referencedRelation: "pockets"
            referencedColumns: ["id"]
          },
        ]
      }
      pockets: {
        Row: {
          bank_account_id: string
          color: string | null
          created_at: string
          goal_amount: number | null
          icon: string | null
          id: string
          initial_amount: number
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bank_account_id: string
          color?: string | null
          created_at?: string
          goal_amount?: number | null
          icon?: string | null
          id?: string
          initial_amount?: number
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bank_account_id?: string
          color?: string | null
          created_at?: string
          goal_amount?: number | null
          icon?: string | null
          id?: string
          initial_amount?: number
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pockets_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          created_at: string
          email: string
          first_name: string | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at: string
          email: string
          first_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id: string
          last_name?: string | null
          updated_at: string
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_id: string
          color: string | null
          created_at: string
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id: string
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          category_id?: string
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          bank_account_id: string | null
          category_id: string
          created_at: string
          currency_code: string
          deleted_at: string | null
          description: string | null
          id: string
          occurred_at: string
          pocket_id: string | null
          subcategory_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          bank_account_id?: string | null
          category_id: string
          created_at?: string
          currency_code?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          occurred_at: string
          pocket_id?: string | null
          subcategory_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          bank_account_id?: string | null
          category_id?: string
          created_at?: string
          currency_code?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          occurred_at?: string
          pocket_id?: string | null
          subcategory_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "transactions_pocket_id_fkey"
            columns: ["pocket_id"]
            isOneToOne: false
            referencedRelation: "pockets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      bank_kind: "traditional" | "digital" | "wallet"
      gender_type: "Masculino" | "Femenino" | "Otros"
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
      bank_kind: ["traditional", "digital", "wallet"],
      gender_type: ["Masculino", "Femenino", "Otros"],
    },
  },
} as const
