export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string
          avatar_url: string | null
          subscription_tier: 'free' | 'basic' | 'premium'
          subscription_status: 'active' | 'inactive' | 'cancelled'
          subscription_start_date: string | null
          subscription_end_date: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name: string
          avatar_url?: string | null
          subscription_tier?: 'free' | 'basic' | 'premium'
          subscription_status?: 'active' | 'inactive' | 'cancelled'
          subscription_start_date?: string | null
          subscription_end_date?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string
          avatar_url?: string | null
          subscription_tier?: 'free' | 'basic' | 'premium'
          subscription_status?: 'active' | 'inactive' | 'cancelled'
          subscription_start_date?: string | null
          subscription_end_date?: string | null
        }
      }
      usage_logs: {
        Row: {
          id: string
          created_at: string
          user_id: string
          action: string
          details: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          action: string
          details?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          action?: string
          details?: Json | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          created_at: string
          user_id: string
          tier: 'free' | 'basic' | 'premium'
          status: 'active' | 'inactive' | 'cancelled'
          start_date: string
          end_date: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          tier: 'free' | 'basic' | 'premium'
          status: 'active' | 'inactive' | 'cancelled'
          start_date: string
          end_date: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          tier?: 'free' | 'basic' | 'premium'
          status?: 'active' | 'inactive' | 'cancelled'
          start_date?: string
          end_date?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_tier: 'free' | 'basic' | 'premium'
      subscription_status: 'active' | 'inactive' | 'cancelled'
    }
  }
} 