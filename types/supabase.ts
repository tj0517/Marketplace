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
          phone_hash: string
          price_amount: number | null
          price_unit: string | null
          status: Database["public"]["Enums"]["ad_status"]
          subject: string
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
          phone_hash: string
          price_amount?: number | null
          price_unit?: string | null
          status?: Database["public"]["Enums"]["ad_status"]
          subject: string
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
          phone_hash?: string
          price_amount?: number | null
          price_unit?: string | null
          status?: Database["public"]["Enums"]["ad_status"]
          subject?: string
          title?: string
          tutor_gender?: string | null
          type?: Database["public"]["Enums"]["ad_type"]
          views_count?: number | null
          visible_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_ads_phone_hash"
            columns: ["phone_hash"]
            isOneToOne: false
            referencedRelation: "phone_hashes"
            referencedColumns: ["phone_hash"]
          },
        ]
      }
      phone_hashes: {
        Row: {
          free_used_at: string | null
          phone_hash: string
        }
        Insert: {
          free_used_at?: string | null
          phone_hash: string
        }
        Update: {
          free_used_at?: string | null
          phone_hash?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          ad_id: string | null
          amount: number
          created_at: string | null
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
          created_at?: string | null
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
          created_at?: string | null
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
      increment_ad_view: { Args: { ad_id: string }; Returns: undefined }
      increment_contact_count: { Args: { ad_id: string }; Returns: undefined }
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
