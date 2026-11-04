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
      ads: {
        Row: {
          contact_count: number | null
          created_at: string | null
          description: string
          education_level: string[] | null
          email: string
          expires_at: string | null
          expiring_warning_sent_at: string | null
          fts: unknown
          id: string
          is_featured: boolean
          location: string
          management_token: string | null
          phone_contact: string
          phone_hash: string | null
          price_amount: number | null
          price_unit: string | null
          status: Database["public"]["Enums"]["ad_status"]
          subject: string
          subjects: string[] | null
          title: string
          tutor_gender: string | null
          type: Database["public"]["Enums"]["ad_type"]
          views_count: number | null
          visible_at: string | null
        }
        Insert: {
          contact_count?: number | null
          created_at?: string | null
          description: string
          education_level?: string[] | null
          email: string
          expires_at?: string | null
          expiring_warning_sent_at?: string | null
          fts?: unknown
          id?: string
          is_featured?: boolean
          location: string
          management_token?: string | null
          phone_contact: string
          phone_hash?: string | null
          price_amount?: number | null
          price_unit?: string | null
          status?: Database["public"]["Enums"]["ad_status"]
          subject: string
          subjects?: string[] | null
          title: string
          tutor_gender?: string | null
          type?: Database["public"]["Enums"]["ad_type"]
          views_count?: number | null
          visible_at?: string | null
        }
        Update: {
          contact_count?: number | null
          created_at?: string | null
          description?: string
          education_level?: string[] | null
          email?: string
          expires_at?: string | null
          expiring_warning_sent_at?: string | null
          fts?: unknown
          id?: string
          is_featured?: boolean
          location?: string
          management_token?: string | null
          phone_contact?: string
          phone_hash?: string | null
          price_amount?: number | null
          price_unit?: string | null
          status?: Database["public"]["Enums"]["ad_status"]
          subject?: string
          subjects?: string[] | null
          title?: string
          tutor_gender?: string | null
          type?: Database["public"]["Enums"]["ad_type"]
          views_count?: number | null
          visible_at?: string | null
        }
        Relationships: []
      }
      marketing_consents: {
        Row: {
          content_version: string
          email: string
          granted_at: string
          id: string
          source: string
          status: string
          withdrawal_token: string
          withdrawn_at: string | null
        }
        Insert: {
          content_version: string
          email: string
          granted_at?: string
          id?: string
          source: string
          status?: string
          withdrawal_token?: string
          withdrawn_at?: string | null
        }
        Update: {
          content_version?: string
          email?: string
          granted_at?: string
          id?: string
          source?: string
          status?: string
          withdrawal_token?: string
          withdrawn_at?: string | null
        }
        Relationships: []
      }
      phone_hashes: {
        Row: {
          deleted_at: string | null
          phone_hash: string
        }
        Insert: {
          deleted_at?: string | null
          phone_hash: string
        }
        Update: {
          deleted_at?: string | null
          phone_hash?: string
        }
        Relationships: []
      }
      promotion_entitlements: {
        Row: {
          email: string
          granted_at: string
          id: string
          reserved_at: string | null
          status: string
          transaction_id: string | null
          used_at: string | null
        }
        Insert: {
          email: string
          granted_at?: string
          id?: string
          reserved_at?: string | null
          status?: string
          transaction_id?: string | null
          used_at?: string | null
        }
        Update: {
          email?: string
          granted_at?: string
          id?: string
          reserved_at?: string | null
          status?: string
          transaction_id?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotion_entitlements_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          ad_id: string | null
          amount: number
          amount_grosze: number | null
          created_at: string | null
          currency: string | null
          entitlement_id: string | null
          error_message: string | null
          id: string
          payment_id: string | null
          payment_provider: string | null
          payment_session_id: string | null
          status: Database["public"]["Enums"]["transaction_status"] | null
          type: Database["public"]["Enums"]["transaction_type"]
          webhook_received_at: string | null
        }
        Insert: {
          ad_id?: string | null
          amount: number
          amount_grosze?: number | null
          created_at?: string | null
          currency?: string | null
          entitlement_id?: string | null
          error_message?: string | null
          id?: string
          payment_id?: string | null
          payment_provider?: string | null
          payment_session_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          type: Database["public"]["Enums"]["transaction_type"]
          webhook_received_at?: string | null
        }
        Update: {
          ad_id?: string | null
          amount?: number
          amount_grosze?: number | null
          created_at?: string | null
          currency?: string | null
          entitlement_id?: string | null
          error_message?: string | null
          id?: string
          payment_id?: string | null
          payment_provider?: string | null
          payment_session_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          type?: Database["public"]["Enums"]["transaction_type"]
          webhook_received_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_entitlement_id_fkey"
            columns: ["entitlement_id"]
            isOneToOne: false
            referencedRelation: "promotion_entitlements"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_payment: {
        Args: { p_payment_id?: string; p_transaction_id: string }
        Returns: boolean
      }
      expire_stale_bump_reservation: {
        Args: { p_email: string; p_stale_before: string }
        Returns: boolean
      }
      finalize_bump_payment: {
        Args: { p_payment_id?: string; p_transaction_id: string }
        Returns: boolean
      }
      grant_marketing_consent: {
        Args: { p_content_version: string; p_email: string; p_source: string }
        Returns: {
          consent_created: boolean
          entitlement_granted: boolean
          withdrawal_token: string
        }[]
      }
      has_ad_for_email: { Args: { p_email: string }; Returns: boolean }
      increment_ad_view: { Args: { ad_id: string }; Returns: undefined }
      increment_contact_count: { Args: { ad_id: string }; Returns: undefined }
      quote_bump_amount: {
        Args: {
          p_ad_id: string
          p_entitled_amount: number
          p_stale_before: string
          p_standard_amount: number
        }
        Returns: number
      }
      register_bump_transaction: {
        Args: {
          p_ad_id: string
          p_currency: string
          p_entitled_amount: number
          p_stale_before: string
          p_standard_amount: number
        }
        Returns: {
          amount_grosze: number
          entitled: boolean
          transaction_id: string
        }[]
      }
      release_bump_reservations: {
        Args: { p_transaction_id?: string }
        Returns: number
      }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      ad_status:
        | "active"
        | "expired"
        | "banned"
        | "inactive"
        | "archived"
        | "deleted"
      ad_type: "offer" | "search"
      transaction_status: "pending" | "completed" | "failed"
      transaction_type: "activation" | "extension" | "bump"
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
    Enums: {
      ad_status: [
        "active",
        "expired",
        "banned",
        "inactive",
        "archived",
        "deleted",
      ],
      ad_type: ["offer", "search"],
      transaction_status: ["pending", "completed", "failed"],
      transaction_type: ["activation", "extension", "bump"],
    },
  },
} as const

