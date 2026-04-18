import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, adminSupabase } from '@/lib/auth-helper'

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Find notes the user is an owner of
  const { data: ownedNotes, error: error1 } = await adminSupabase
    .from('notes')
    .select('id, title, is_locked, updated_at, folder_id')
    .eq('owner_id', user.id)
    .order('updated_at', { ascending: false })

  // Find permissions the user has
  const { data: perms } = await adminSupabase
    .from('permissions')
    .select('note_id')
    .eq('user_id', user.id)

  const sharedNoteIds = perms ? perms.map((p: any) => p.note_id) : []

  // Find folder permissions the user has
  const { data: folderPerms } = await adminSupabase
    .from('folder_permissions')
    .select('folder_id')
    .eq('user_id', user.id)

  const sharedFolderIds = folderPerms ? folderPerms.map((p: any) => p.folder_id) : []

  let sharedNotes: any[] = []
  
  if (sharedNoteIds.length > 0 || sharedFolderIds.length > 0) {
      let query = adminSupabase
        .from('notes')
        .select('id, title, is_locked, updated_at, folder_id')
        .order('updated_at', { ascending: false })

      if (sharedNoteIds.length > 0 && sharedFolderIds.length > 0) {
          query = query.or(`id.in.(${sharedNoteIds.join(',')}),folder_id.in.(${sharedFolderIds.join(',')})`)
      } else if (sharedNoteIds.length > 0) {
          query = query.in('id', sharedNoteIds)
      } else {
          query = query.in('folder_id', sharedFolderIds)
      }
      
      const { data } = await query
      if (data) sharedNotes = data
  }

  const allNotes = [...(ownedNotes || []), ...sharedNotes]
  allNotes.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

  if (error1) return NextResponse.json({ error: error1.message }, { status: 500 })
  return NextResponse.json({ notes: allNotes })
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, folder_id } = await req.json()

  const { data: note, error } = await adminSupabase
    .from('notes')
    .insert({ title: title || 'Untitled Note', owner_id: user.id, folder_id: folder_id || null, is_locked: false })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Initialize empty note content
  await adminSupabase.from('note_content').insert({ note_id: note.id, content: null, version: 1 })

  return NextResponse.json({ note })
}
