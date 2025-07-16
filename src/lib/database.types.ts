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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
          updated_at: string
          last_sign_in: string | null
          avatar_url: string | null
          subscription_tier: 'free' | 'premium' | 'enterprise'
          subscription_status: 'active' | 'cancelled' | 'expired' | 'trial'
          subscription_start_date: string | null
          subscription_end_date: string | null
          daily_question_limit: number
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
          last_sign_in?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'premium' | 'enterprise'
          subscription_status?: 'active' | 'cancelled' | 'expired' | 'trial'
          subscription_start_date?: string | null
          subscription_end_date?: string | null
          daily_question_limit?: number
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
          last_sign_in?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'premium' | 'enterprise'
          subscription_status?: 'active' | 'cancelled' | 'expired' | 'trial'
          subscription_start_date?: string | null
          subscription_end_date?: string | null
          daily_question_limit?: number
        }
      }
      usage_logs: {
        Row: {
          id: string
          user_id: string
          date: string
          questions_generated: number
          last_generated_at: string
          user_status: string | null
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          questions_generated?: number
          last_generated_at?: string
          user_status?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          questions_generated?: number
          last_generated_at?: string
          user_status?: string | null
        }
      }
      subscription_history: {
        Row: {
          id: string
          user_id: string
          previous_tier: 'free' | 'premium' | 'enterprise' | null
          new_tier: 'free' | 'premium' | 'enterprise'
          previous_status: 'active' | 'cancelled' | 'expired' | 'trial' | null
          new_status: 'active' | 'cancelled' | 'expired' | 'trial'
          changed_at: string
          reason: string | null
        }
        Insert: {
          id?: string
          user_id: string
          previous_tier?: 'free' | 'premium' | 'enterprise' | null
          new_tier: 'free' | 'premium' | 'enterprise'
          previous_status?: 'active' | 'cancelled' | 'expired' | 'trial' | null
          new_status: 'active' | 'cancelled' | 'expired' | 'trial'
          changed_at?: string
          reason?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          previous_tier?: 'free' | 'premium' | 'enterprise' | null
          new_tier?: 'free' | 'premium' | 'enterprise'
          previous_status?: 'active' | 'cancelled' | 'expired' | 'trial' | null
          new_status?: 'active' | 'cancelled' | 'expired' | 'trial'
          changed_at?: string
          reason?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_daily_usage: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      increment_usage: {
        Args: {
          user_id: string
        }
        Returns: void
      }
    }
    Enums: {
      subscription_tier: 'free' | 'premium' | 'enterprise'
      subscription_status: 'active' | 'cancelled' | 'expired' | 'trial'
    }
  }
} 