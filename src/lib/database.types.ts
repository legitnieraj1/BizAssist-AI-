export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          password_hash: string;
          phone: string | null;
          role: "customer" | "agent" | "admin";
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          password_hash: string;
          phone?: string | null;
          role: "customer" | "agent" | "admin";
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          password_hash?: string;
          phone?: string | null;
          role?: "customer" | "agent" | "admin";
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      tickets: {
        Row: {
          id: string;
          ticket_number: string;
          customer_id: string;
          assigned_agent_id: string | null;
          subject: string;
          description: string;
          category: string;
          priority: "Critical" | "High" | "Medium" | "Low";
          sentiment: "Frustrated" | "Angry" | "Urgent" | "Confused" | "Neutral" | "Satisfied";
          ai_summary: string | null;
          ai_suggested_response: string | null;
          status: "Open" | "Assigned" | "In Progress" | "Waiting for Customer" | "Resolved" | "Closed";
          contact_email: string | null;
          contact_phone: string | null;
          attachment_name: string | null;
          attachment_url: string | null;
          created_at: string;
          updated_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id: string;
          ticket_number: string;
          customer_id: string;
          assigned_agent_id?: string | null;
          subject: string;
          description: string;
          category: string;
          priority: "Critical" | "High" | "Medium" | "Low";
          sentiment: "Frustrated" | "Angry" | "Urgent" | "Confused" | "Neutral" | "Satisfied";
          ai_summary?: string | null;
          ai_suggested_response?: string | null;
          status: "Open" | "Assigned" | "In Progress" | "Waiting for Customer" | "Resolved" | "Closed";
          contact_email?: string | null;
          contact_phone?: string | null;
          attachment_name?: string | null;
          attachment_url?: string | null;
          created_at?: string;
          updated_at?: string;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          ticket_number?: string;
          customer_id?: string;
          assigned_agent_id?: string | null;
          subject?: string;
          description?: string;
          category?: string;
          priority?: "Critical" | "High" | "Medium" | "Low";
          sentiment?: "Frustrated" | "Angry" | "Urgent" | "Confused" | "Neutral" | "Satisfied";
          ai_summary?: string | null;
          ai_suggested_response?: string | null;
          status?: "Open" | "Assigned" | "In Progress" | "Waiting for Customer" | "Resolved" | "Closed";
          contact_email?: string | null;
          contact_phone?: string | null;
          attachment_name?: string | null;
          attachment_url?: string | null;
          created_at?: string;
          updated_at?: string;
          resolved_at?: string | null;
        };
      };
      ticket_messages: {
        Row: {
          id: string;
          ticket_id: string;
          sender_id: string;
          message: string;
          attachment_url: string | null;
          is_internal: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          ticket_id: string;
          sender_id: string;
          message: string;
          attachment_url?: string | null;
          is_internal?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          sender_id?: string;
          message?: string;
          attachment_url?: string | null;
          is_internal?: boolean;
          created_at?: string;
        };
      };
      ticket_history: {
        Row: {
          id: string;
          ticket_id: string;
          previous_status: string | null;
          new_status: string;
          action_type: string;
          note: string | null;
          changed_by: string;
          created_at: string;
        };
        Insert: {
          id: string;
          ticket_id: string;
          previous_status?: string | null;
          new_status: string;
          action_type: string;
          note?: string | null;
          changed_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          previous_status?: string | null;
          new_status?: string;
          action_type?: string;
          note?: string | null;
          changed_by?: string;
          created_at?: string;
        };
      };
      knowledge_base: {
        Row: {
          id: string;
          title: string;
          content: string;
          category: string;
          tags: string | null;
          view_count: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          title: string;
          content: string;
          category: string;
          tags?: string | null;
          view_count?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          category?: string;
          tags?: string | null;
          view_count?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          customer_id: string | null;
          customer_name: string | null;
          status: string;
          escalated_ticket_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          customer_id?: string | null;
          customer_name?: string | null;
          status?: string;
          escalated_ticket_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string | null;
          customer_name?: string | null;
          status?: string;
          escalated_ticket_id?: string | null;
          created_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          sender_type: "customer" | "ai_bot" | "system";
          message: string;
          sources_json: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          session_id: string;
          sender_type: "customer" | "ai_bot" | "system";
          message: string;
          sources_json?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          sender_type?: "customer" | "ai_bot" | "system";
          message?: string;
          sources_json?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          link: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type?: string;
          link?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: string;
          link?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
      platform_settings: {
        Row: {
          key: string;
          value: string;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: string;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: string;
          updated_at?: string;
        };
      };
    };
  };
}
