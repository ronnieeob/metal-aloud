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
      songs: {
        Row: {
          id: string
          title: string
          artist: string
          album: string
          cover_url: string
          audio_url: string
          duration: number
          band_id: string | null
          created_at: string
          price: number
          artist_id: string | null
        }
        Insert: {
          id?: string
          title: string
          artist: string
          album: string
          cover_url: string
          audio_url: string
          duration: number
          band_id?: string | null
          created_at?: string
          price?: number
          artist_id?: string | null
        }
        Update: {
          id?: string
          title?: string
          artist?: string
          album?: string
          cover_url?: string
          audio_url?: string
          duration?: number
          band_id?: string | null
          created_at?: string
          price?: number
          artist_id?: string | null
        }
      }
      products: {
        Row: {
          id: string
          artist_id: string
          name: string
          description: string
          price: number
          image_url: string
          category: string
          stock_quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          artist_id: string
          name: string
          description: string
          price: number
          image_url: string
          category: string
          stock_quantity: number
          created_at?: string
        }
        Update: {
          id?: string
          artist_id?: string
          name?: string
          description?: string
          price?: number
          image_url?: string
          category?: string
          stock_quantity?: number
          created_at?: string
        }
      }
    }
  }
}