import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, adminSupabase } from '@/lib/auth-helper'
import { Liveblocks } from '@liveblocks/node'

const liveblocks = new Liveblocks({ secret: process.env.LIVEBLOCKS_SECRET_KEY! })

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { room } = await req.json()

  // Verify user has access to this room (note)
  if (room) {
    const { data: note } = await adminSupabase
      .from('notes').select('owner_id, is_locked').eq('id', room).single()

    if (note && note.owner_id !== user.id) {
      const { data: perm } = await adminSupabase
        .from('permissions').select('role').eq('note_id', room).eq('user_id', user.id).single()
      if (!perm) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  // Get user profile for display name
  const { data: profile } = await adminSupabase
    .from('profiles').select('name, avatar_url').eq('id', user.id).single()

  const session = liveblocks.prepareSession(user.id, {
    userInfo: {
      name: profile?.name || user.email || 'Anonymous',
      email: user.email || '',
      avatar: profile?.avatar_url || '',
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
    },
  })

  if (room) session.allow(room, session.FULL_ACCESS)

  const { body, status } = await session.authorize()
  return new NextResponse(body, { status })
}
