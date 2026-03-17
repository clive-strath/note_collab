import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, adminSupabase } from '@/lib/auth-helper'

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: notes, error } = await adminSupabase
    .from('notes')
    .select('id, title, is_locked, updated_at, folder_id')
    .or(`owner_id.eq.${user.id},id.in.(select note_id from permissions where user_id='${user.id}')`)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ notes })
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
