// Database schema for Supabase
// Run these SQL commands in your Supabase SQL Editor

export const DATABASE_SCHEMA = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  email text,
  name text,
  avatar_url text,
  created_at timestamp DEFAULT now()
);

-- Folders table
CREATE TABLE IF NOT EXISTS public.folders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  owner_id uuid REFERENCES public.profiles(id),
  created_at timestamp DEFAULT now()
);

-- Notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  owner_id uuid REFERENCES public.profiles(id),
  folder_id uuid REFERENCES public.folders(id),
  is_locked boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Note content table
CREATE TABLE IF NOT EXISTS public.note_content (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id uuid REFERENCES public.notes(id) ON DELETE CASCADE,
  content jsonb, -- Y.js document state
  version integer DEFAULT 1,
  updated_at timestamp DEFAULT now()
);

-- Permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id uuid REFERENCES public.notes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('read', 'write', 'update', 'admin')),
  created_at timestamp DEFAULT now()
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id uuid REFERENCES public.notes(id) ON DELETE CASCADE,
  author_id uuid REFERENCES public.profiles(id),
  content text NOT NULL,
  anchor_type text NOT NULL CHECK (anchor_type IN ('sentence', 'paragraph', 'selection')),
  anchor_ref text NOT NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for folders
CREATE POLICY "Users can view own folders" ON public.folders
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create own folders" ON public.folders
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own folders" ON public.folders
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own folders" ON public.folders
  FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for notes
CREATE POLICY "Users can view notes they have access to" ON public.notes
  FOR SELECT USING (
    owner_id = auth.uid() OR 
    id IN (
      SELECT note_id FROM public.permissions 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own notes" ON public.notes
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Note owners can update notes" ON public.notes
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Note owners can delete notes" ON public.notes
  FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for note_content
CREATE POLICY "Users can view content of accessible notes" ON public.note_content
  FOR SELECT USING (
    note_id IN (
      SELECT id FROM public.notes 
      WHERE owner_id = auth.uid() OR 
      id IN (
        SELECT note_id FROM public.permissions 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update content of writable notes" ON public.note_content
  FOR UPDATE USING (
    note_id IN (
      SELECT id FROM public.notes 
      WHERE owner_id = auth.uid() OR 
      id IN (
        SELECT note_id FROM public.permissions 
        WHERE user_id = auth.uid() AND role IN ('write', 'update', 'admin')
      )
    )
  );

-- RLS Policies for permissions
CREATE POLICY "Users can view permissions for their notes" ON public.permissions
  FOR SELECT USING (
    note_id IN (
      SELECT id FROM public.notes WHERE owner_id = auth.uid()
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Note owners can manage permissions" ON public.permissions
  FOR ALL USING (
    note_id IN (
      SELECT id FROM public.notes WHERE owner_id = auth.uid()
    )
  );

-- RLS Policies for comments
CREATE POLICY "Users can view comments for accessible notes" ON public.comments
  FOR SELECT USING (
    note_id IN (
      SELECT id FROM public.notes 
      WHERE owner_id = auth.uid() OR 
      id IN (
        SELECT note_id FROM public.permissions 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create comments on accessible notes" ON public.comments
  FOR INSERT WITH CHECK (
    note_id IN (
      SELECT id FROM public.notes 
      WHERE owner_id = auth.uid() OR 
      id IN (
        SELECT note_id FROM public.permissions 
        WHERE user_id = auth.uid()
      )
    ) AND author_id = auth.uid()
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notes_owner_id ON public.notes(owner_id);
CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON public.notes(folder_id);
CREATE INDEX IF NOT EXISTS idx_permissions_note_id ON public.permissions(note_id);
CREATE INDEX IF NOT EXISTS idx_permissions_user_id ON public.permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_note_id ON public.comments(note_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_note_content_note_id ON public.note_content(note_id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`
