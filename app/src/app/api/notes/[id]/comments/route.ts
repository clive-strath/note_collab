import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, adminSupabase } from '@/lib/auth-helper'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: comments, error } = await adminSupabase
        .from('comments')
        .select('*, profiles(name, avatar_url)')
        .eq('note_id', params.id)
        .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ comments })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { content, anchor_type = 'selection', anchor_ref = '' } = await req.json()
    if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 })

    const { data: comment, error } = await adminSupabase
        .from('comments')
        .insert({
            note_id: params.id,
            author_id: user.id,
            content: content.trim(),
            anchor_type,
            anchor_ref,
        })
        .select('*, profiles(name, avatar_url)')
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ comment })
}
