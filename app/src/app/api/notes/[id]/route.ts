import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, adminSupabase } from '@/lib/auth-helper'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: note, error } = await adminSupabase
    .from('notes')
    .select('*, note_content(*)')
    .eq('id', params.id)
    .single()

  if (error || !note) return NextResponse.json({ error: 'Note not found' }, { status: 404 })

  // Verify access
  if (note.owner_id !== user.id) {
    const { data: perm } = await adminSupabase
      .from('permissions')
      .select('role')
      .eq('note_id', params.id)
      .eq('user_id', user.id)
      .single()
    if (!perm) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({ note })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, is_locked } = body

  // Verify ownership or write access
  const { data: note } = await adminSupabase
    .from('notes').select('owner_id').eq('id', params.id).single()
  if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 })

  if (note.owner_id !== user.id) {
    // Only owner can lock; others with write permission can update title
    if (is_locked !== undefined) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { data: perm } = await adminSupabase
      .from('permissions').select('role')
      .eq('note_id', params.id).eq('user_id', user.id).single()
    if (!perm || !['write', 'update', 'admin'].includes(perm.role))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (title !== undefined) updates.title = title
  if (is_locked !== undefined) updates.is_locked = is_locked

  const { data: updated, error } = await adminSupabase
    .from('notes').update(updates).eq('id', params.id).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ note: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: note } = await adminSupabase
    .from('notes').select('owner_id').eq('id', params.id).single()
  if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (note.owner_id !== user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await adminSupabase.from('notes').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
