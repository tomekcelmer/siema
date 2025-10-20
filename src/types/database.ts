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
      experiments: {
        Row: {
          id: string
          name: string
          experiment_type: number
          status: string
          host_password: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          experiment_type?: number
          status?: string
          host_password?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          experiment_type?: number
          status?: string
          host_password?: string
          created_at?: string
          updated_at?: string
        }
      }
      participants: {
        Row: {
          id: string
          session_id: string
          experiment_id: string
          first_name: string
          last_name: string
          role: string | null
          variant: string | null
          current_page: number
          consent_given: boolean
          declared_price: number | null
          final_price: number | null
          reward: number | null
          transaction_time: string | null
          pair_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id?: string
          experiment_id: string
          first_name: string
          last_name: string
          role?: string | null
          variant?: string | null
          current_page?: number
          consent_given?: boolean
          declared_price?: number | null
          final_price?: number | null
          reward?: number | null
          transaction_time?: string | null
          pair_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          experiment_id?: string
          first_name?: string
          last_name?: string
          role?: string | null
          variant?: string | null
          current_page?: number
          consent_given?: boolean
          declared_price?: number | null
          final_price?: number | null
          reward?: number | null
          transaction_time?: string | null
          pair_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_rooms: {
        Row: {
          id: string
          experiment_id: string
          seller_id: string
          buyer_id: string
          variant: string
          status: string
          timer_ends_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          experiment_id: string
          seller_id: string
          buyer_id: string
          variant: string
          status?: string
          timer_ends_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          experiment_id?: string
          seller_id?: string
          buyer_id?: string
          variant?: string
          status?: string
          timer_ends_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          room_id: string
          participant_id: string
          message_text: string
          message_type: string
          offer_price: number | null
          offer_status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          participant_id: string
          message_text: string
          message_type?: string
          offer_price?: number | null
          offer_status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          participant_id?: string
          message_text?: string
          message_type?: string
          offer_price?: number | null
          offer_status?: string | null
          created_at?: string
        }
      }
    }
  }
}
