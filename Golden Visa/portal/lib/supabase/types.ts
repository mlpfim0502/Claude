export type ApplicationStage =
  | 'intake'
  | 'attestation'
  | 'submission'
  | 'medical'
  | 'emirates_id'
  | 'completed'

export type DocumentType =
  | 'passport'
  | 'degree_certificate'
  | 'transcripts'
  | 'photo'
  | 'medical_exam'
  | 'other'

export type DocumentStatus =
  | 'pending'
  | 'uploaded'
  | 'received'
  | 'verified'
  | 'rejected'

export type UserRole = 'client' | 'admin'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  client_id: string
  stage: ApplicationStage
  notes: string | null
  gpa: number | null
  degree_field: string | null
  graduation_year: number | null
  university: string | null
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  application_id: string
  client_id: string
  doc_type: DocumentType
  status: DocumentStatus
  file_path: string | null
  file_name: string | null
  file_size: number | null
  mime_type: string | null
  admin_notes: string | null
  uploaded_at: string | null
  verified_at: string | null
  created_at: string
  updated_at: string
}

export interface ClientNote {
  id: string
  client_id: string
  author_id: string | null
  content: string
  created_at: string
}

// For use with Supabase generic types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      applications: {
        Row: Application
        Insert: Omit<Application, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Application, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      documents: {
        Row: Document
        Insert: Omit<Document, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Document, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      client_notes: {
        Row: ClientNote
        Insert: Omit<ClientNote, 'id' | 'created_at'>
        Update: Partial<Omit<ClientNote, 'id' | 'created_at'>>
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: {
      application_stage: ApplicationStage
      document_type: DocumentType
      document_status: DocumentStatus
    }
    CompositeTypes: { [_ in never]: never }
  }
}
