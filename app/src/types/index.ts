export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
}

export interface Note {
  id: string
  title: string
  owner_id: string
  created_at: string
  updated_at: string
  folder_id?: string
  is_locked: boolean
}

export interface NoteContent {
  id: string
  note_id: string
  content: any // Y.js document state
  version: number
  updated_at: string
}

export interface Folder {
  id: string
  name: string
  owner_id: string
  created_at: string
}

export interface Permission {
  id: string
  note_id: string
  user_id: string
  role: 'read' | 'write' | 'update' | 'admin'
  created_at: string
}

export interface Comment {
  id: string
  note_id: string
  author_id: string
  content: string
  anchor_type: 'sentence' | 'paragraph' | 'selection'
  anchor_ref: string
  created_at: string
  updated_at: string
}

export interface Presence {
  userId: string
  user: User
  cursor?: {
    x: number
    y: number
  }
  selection?: {
    from: number
    to: number
  }
}
