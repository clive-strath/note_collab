import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, adminSupabase } from '@/lib/auth-helper'

/** GET /api/notes/[id]/content — load Y.js content */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await adminSupabase
        .from('note_content')
        .select('*')
        .eq('note_id', params.id)
        .single()

    if (error) return NextResponse.json({ content: null })
    return NextResponse.json({ content: data })
}

/** PATCH /api/notes/[id]/content — auto-save content */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { content } = await req.json()

    // Upsert note content
    const { data: existing } = await adminSupabase
        .from('note_content')
        .select('id, version')
        .eq('note_id', params.id)
        .single()

    let result
    if (existing) {
        const { data, error } = await adminSupabase
            .from('note_content')
            .update({ content, version: (existing.version || 1) + 1, updated_at: new Date().toISOString() })
            .eq('id', existing.id)
            .select().single()
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        result = data
    } else {
        const { data, error } = await adminSupabase
            .from('note_content')
            .insert({ note_id: params.id, content, version: 1 })
            .select().single()
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        result = data
    }

    // Also update the note's updated_at timestamp
    await adminSupabase
        .from('notes')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', params.id)

    return NextResponse.json({ content: result })
}
